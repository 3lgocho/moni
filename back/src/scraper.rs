use std::env;
use std::time::{SystemTime, UNIX_EPOCH};
use hmac::{Hmac, Mac};
use sha2::Sha256;
use hex;
use serde::Deserialize;
use rust_decimal::Decimal;
use std::str::FromStr;
use sqlx::MySqlPool;
use uuid::Uuid;

type HmacSha256 = Hmac<Sha256>;

// ==========================================
// 1. FUNCIÓN AUXILIAR PARA FIRMAR QUERIES
// ==========================================
fn firmar_query(query: &str, secret: &str) -> String {
    let mut mac = HmacSha256::new_from_slice(secret.as_bytes()).expect("Error creando HMAC");
    mac.update(query.as_bytes());
    hex::encode(mac.finalize().into_bytes())
}

// ==========================================
// 2. ESTRUCTURAS PARA EL HISTORIAL P2P (Tu código)
// ==========================================
#[derive(Deserialize, Debug)]
struct BinanceResponse {
    data: Vec<BinanceOrder>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct BinanceOrder {
    order_number: String,
    trade_type: String,
    asset: String,
    amount: Decimal,
    total_price: Decimal,
    order_status: String,
    create_time: i64,
}

// ==========================================
// 3. ESTRUCTURAS PARA LOS BALANCES (Nuevas)
// ==========================================
#[derive(Deserialize, Debug)]
pub struct BinanceSpotAccount {
    pub balances: Vec<BinanceSpotBalance>,
}

#[derive(Deserialize, Debug)]
pub struct BinanceSpotBalance {
    pub asset: String,
    pub free: Decimal,
    pub locked: Decimal,
}

#[derive(Deserialize, Debug)]
pub struct BinanceFundingBalance {
    pub asset: String,
    pub free: String,
    pub locked: String,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct BinanceEarnPosition {
    pub rows: Vec<EarnRow>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct EarnRow {
    pub asset: String,
    pub total_amount: String,
}

// ==========================================
// 4. FUNCIÓN: SCRAPER P2P ORIGINAL y DEPÓSITOS CRYPTO
// ==========================================
#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct BinanceDeposit {
    pub amount: Decimal,
    pub coin: String,
    pub status: i32, 
    pub tx_id: String,
    pub insert_time: i64,
}

// --- FUNCIÓN SCRAPER (P2P + Depósitos) ---
pub async fn run_scraper(pool: &MySqlPool) -> Result<(), Box<dyn std::error::Error>> {
    let api_key = env::var("BINANCE_API_KEY")?.trim().to_string();
    let api_secret = env::var("BINANCE_API_SECRET")?.trim().to_string();

    let timestamp = SystemTime::now().duration_since(UNIX_EPOCH)?.as_millis();
    let query_params = format!("page=1&rows=10&recvWindow=5000&timestamp={}", timestamp);
    let signature = firmar_query(&query_params, &api_secret);

    // ==========================================
    // 1. EXTRAER ÓRDENES P2P
    // ==========================================
    let url_p2p = format!(
        "https://api.binance.com/sapi/v1/c2c/orderMatch/listUserOrderHistory?{}&signature={}",
        query_params, signature
    );

    let client = reqwest::Client::new();
    let response = client.get(&url_p2p)
        .header("X-MBX-APIKEY", &api_key)
        .send()
        .await?;

    if response.status().is_success() {
        let resp_data: BinanceResponse = response.json().await?;
        
        for order in &resp_data.data {
            let fecha = chrono::DateTime::from_timestamp(order.create_time / 1000, 0)
                .unwrap_or_default().naive_utc();

            sqlx::query!(
                r#"
                INSERT INTO transactions (id, fecha, monto, total_fiat, tipo, activo, estado, id_orden)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE estado = VALUES(estado)
                "#,
                order.order_number, fecha, order.amount, order.total_price, 
                order.trade_type, order.asset, order.order_status, order.order_number
            )
            .execute(pool).await?;
        }
        println!("✅ Scraper: {} órdenes P2P sincronizadas.", resp_data.data.len());
    } else {
        eprintln!("❌ Error en Binance P2P: {}", response.status());
    }

    // ==========================================
    // 2. EXTRAER DEPÓSITOS CRYPTO (Airtm, Stellar, etc.)
    // ==========================================
    // Para los depósitos, creamos un query limpio solo con el timestamp
    let dep_query = format!("timestamp={}", timestamp);
    let dep_signature = firmar_query(&dep_query, &api_secret);

    let url_deposits = format!(
        "https://api.binance.com/sapi/v1/capital/deposit/hisrec?{}&signature={}",
        dep_query, dep_signature
    );

    let resp_deposits = client.get(&url_deposits)
        .header("X-MBX-APIKEY", &api_key)
        .send()
        .await?;

    if resp_deposits.status().is_success() {
        let deposits: Vec<BinanceDeposit> = resp_deposits.json().await?;
        
        for dep in &deposits {
            // Status 1 = COMPLETED en Binance
            let estado_texto = if dep.status == 1 { "COMPLETED" } else { "PROCESSING" };
            let fecha_dep = chrono::DateTime::from_timestamp(dep.insert_time / 1000, 0)
                .unwrap_or_default().naive_utc();

            sqlx::query!(
                r#"
                INSERT INTO transactions (id, fecha, monto, total_fiat, tipo, activo, estado, id_orden)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE estado = VALUES(estado)
                "#,
                dep.tx_id, fecha_dep, dep.amount, 0.0, "crypto_deposit", dep.coin, estado_texto, dep.tx_id
            )
            .execute(pool).await?;
        }
        println!("✅ Scraper: {} depósitos crypto sincronizados.", deposits.len());
    } else {
        eprintln!("❌ Error leyendo depósitos: {}", resp_deposits.status());
    }

    // El Ok(()) SIEMPRE va de último para cerrar la función
    Ok(())
}

// ==========================================
// 5. FUNCIÓN: CAPTURAR BALANCE TOTAL
// ==========================================
pub async fn sync_total_balance(pool: &MySqlPool) -> Result<(), Box<dyn std::error::Error>> {
    let api_key = env::var("BINANCE_API_KEY")?.trim().to_string();
    let api_secret = env::var("BINANCE_API_SECRET")?.trim().to_string();
    let client = reqwest::Client::new();
    
    // Aquí puedes cambiar a "USDT" si prefieres monitorear ese
    let asset_target = "USDC"; 

    let timestamp = SystemTime::now().duration_since(UNIX_EPOCH)?.as_millis();
    let query_base = format!("timestamp={}", timestamp);
    let signature = firmar_query(&query_base, &api_secret);

    // --- A. SPOT BALANCE ---
    let url_spot = format!("https://api.binance.com/api/v3/account?{}&signature={}", query_base, signature);
    let resp_spot: BinanceSpotAccount = client.get(&url_spot)
        .header("X-MBX-APIKEY", &api_key)
        .send().await?.json().await?;
    
    let mut spot_total = Decimal::from(0);
    if let Some(b) = resp_spot.balances.iter().find(|x| x.asset == asset_target) {
        spot_total = b.free + b.locked;
    }

    // --- B. FUNDING BALANCE ---
    let url_funding = format!("https://api.binance.com/sapi/v1/asset/get-funding-asset");
    let resp_text = client.post(&url_funding)
        .header("X-MBX-APIKEY", &api_key)
        .body(format!("{}&signature={}", query_base, signature))
        .send().await?
        .text().await?; // Primero lo bajamos como texto para debuggear

    // Si Binance devuelve un error, lo veremos aquí
    if resp_text.contains("code") && resp_text.contains("msg") {
        eprintln!("❌ Error de Binance Funding: {}", resp_text);
    }

    let resp_funding: Vec<BinanceFundingBalance> = serde_json::from_str(&resp_text).unwrap_or_else(|_| {
        println!("⚠️ Funding vacío o error de formato, asumiendo 0.");
        vec![]
    });

    let mut funding_total = Decimal::from(0);
    if let Some(b) = resp_funding.iter().find(|x| x.asset == asset_target) {
        funding_total = Decimal::from_str(&b.free).unwrap_or_default() + Decimal::from_str(&b.locked).unwrap_or_default();
    }

    // --- C. EARN BALANCE ---
    let url_earn = format!("https://api.binance.com/sapi/v1/simple-earn/flexible/position?{}&signature={}", query_base, signature);
    let resp_earn: BinanceEarnPosition = client.get(&url_earn)
        .header("X-MBX-APIKEY", &api_key)
        .send().await?.json().await?;

    let mut earn_total = Decimal::from(0);
    if let Some(b) = resp_earn.rows.iter().find(|x| x.asset == asset_target) {
        earn_total = Decimal::from_str(&b.total_amount).unwrap_or_default();
    }

    // --- D. GUARDAR EN BASE DE DATOS ---
    let gran_total = spot_total + funding_total + earn_total;
    let snapshot_id = Uuid::new_v4().to_string();
    let fecha_actual = chrono::Utc::now().naive_utc();

    sqlx::query!(
        r#"
        INSERT INTO balance_snapshots (id, fecha_registro, asset, spot_amount, funding_amount, earn_amount, total_amount)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        "#,
        snapshot_id,
        fecha_actual,
        asset_target,
        spot_total,
        funding_total,
        earn_total,
        gran_total
    )
    .execute(pool)
    .await?;

    println!("✅ Balance Sincronizado: {} {} (Spot: {}, Funding: {}, Earn: {})", gran_total, asset_target, spot_total, funding_total, earn_total);

    Ok(())

    
}