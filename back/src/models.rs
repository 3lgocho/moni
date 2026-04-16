use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use rust_decimal::Decimal;
use chrono::NaiveDateTime;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Transaction {
    pub id: String,
    pub fecha: NaiveDateTime,
    pub monto: Decimal,
    pub total_fiat: Decimal,
    pub tipo: String,
    pub activo: String,
    pub estado: String,
    pub id_orden: String,
}

// Para la tabla balance_snapshots
#[derive(Debug, serde::Serialize, serde::Deserialize, sqlx::FromRow)]
pub struct BalanceSnapshot {
    pub id: String,
    pub fecha_registro: chrono::NaiveDateTime,
    pub asset: String,
    pub spot_amount: Decimal,
    pub funding_amount: Decimal,
    pub earn_amount: Decimal,
    pub total_amount: Decimal,
}

// Respuestas de Binance
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
    pub free: String, // A veces la API de Funding lo devuelve como String
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

#[derive(serde::Serialize)]
pub struct DashboardStats {
    pub total_balance: Decimal,
    pub income_volume: Decimal,
    pub outcome_volume: Decimal,
}

// --- ESTRUCTURA PARA DEPÓSITOS CRYPTO ---
#[allow(dead_code)]
#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct BinanceDeposit {
    pub amount: Decimal,
    pub coin: String,
    pub status: i32, 
    pub tx_id: String,
    pub insert_time: i64,
}

#[derive(Deserialize)]
pub struct PaginationQuery {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

#[derive(Deserialize)]
pub struct SummaryQuery {
    pub filter: Option<String>, // Esperará "week", "month" o vacio
}

#[derive(Serialize, sqlx::FromRow)]
pub struct FinancialSummary {
    pub income: rust_decimal::Decimal,
    pub outcome: rust_decimal::Decimal,
}