//use reqwest::header::{HeaderMap, HeaderValue};
use std::env;
use std::time::{SystemTime, UNIX_EPOCH};
use hmac::{Hmac, Mac};
use sha2::Sha256;
use hex;
use serde::Deserialize;
use rust_decimal::Decimal;
use sqlx::MySqlPool;

type HmacSha256 = Hmac<Sha256>;

// Estructuras para mapear el JSON de Binance
#[derive(Deserialize, Debug)]
struct BinanceResponse {
    data: Vec<BinanceOrder>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct BinanceOrder {
    order_number: String,
    trade_type: String, // "BUY" o "SELL"
    asset: String,
    amount: Decimal,
    total_price: Decimal,
    order_status: String,
    create_time: i64, // Timestamp en milisegundos
}

pub async fn run_scraper(pool: &MySqlPool) -> Result<(), Box<dyn std::error::Error>> {
    let api_key = env::var("BINANCE_API_KEY")?.trim().to_string();
    let api_secret = env::var("BINANCE_API_SECRET")?.trim().to_string();

    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)?
        .as_millis();

    let query_params = format!("page=1&rows=10&recvWindow=5000&timestamp={}", timestamp);

    let mut mac = HmacSha256::new_from_slice(api_secret.as_bytes())?;
    mac.update(query_params.as_bytes());
    let signature = hex::encode(mac.finalize().into_bytes());

    let url = format!(
        "https://api.binance.com/sapi/v1/c2c/orderMatch/listUserOrderHistory?{}&signature={}",
        query_params, signature
    );

    let client = reqwest::Client::new();
    let response = client.get(url)
        .header("X-MBX-APIKEY", api_key)
        .send()
        .await?;

    if response.status().is_success() {
        let resp_data: BinanceResponse = response.json().await?;
        
        for order in &resp_data.data {
            // Convertimos ms a NaiveDateTime para MySQL
            let fecha = chrono::DateTime::from_timestamp(order.create_time / 1000, 0)
                .unwrap_or_default()
                .naive_utc();

            // Lógica UPSERT: Si el ID existe, solo actualiza el estado
            sqlx::query!(
                r#"
                INSERT INTO transactions (id, fecha, monto, total_fiat, tipo, activo, estado, id_orden)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE estado = VALUES(estado)
                "#,
                order.order_number, // Usamos el order_number como ID primario
                fecha,
                order.amount,
                order.total_price,
                order.trade_type,
                order.asset,
                order.order_status,
                order.order_number
            )
            .execute(pool)
            .await?;
        }
        println!("✅ Scraper: {} órdenes sincronizadas con la base de datos.", resp_data.data.len());
    } else {
        eprintln!("❌ Error en Binance: {}", response.status());
    }

    Ok(())
}
