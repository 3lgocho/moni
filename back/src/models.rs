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