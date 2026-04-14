use chrono::NaiveDateTime;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Transaction {
    pub id: i32,
    pub fecha: NaiveDateTime,
    pub monto: Decimal,
    pub total_fiat: Decimal,
    pub tipo: String, 
    pub activo: String,
    pub estado: String,
    pub id_orden: String,
}