use axum::{extract::State, response::IntoResponse, Json};
use sqlx::MySqlPool;
use rust_decimal::Decimal;
use crate::models::DashboardStats;

pub async fn get_stats(State(pool): State<MySqlPool>) -> impl IntoResponse {
    // 1. Obtener el último balance total registrado
    let last_balance = sqlx::query_scalar!(
        "SELECT total_amount FROM balance_snapshots ORDER BY fecha_registro DESC LIMIT 1"
    )
    .fetch_optional(&pool)
    .await
    .unwrap_or(None)
    .unwrap_or(Decimal::from(0));

    // 2. Calcular Income (BUY + crypto_deposit)
    let income = sqlx::query_scalar!(
        r#"SELECT COALESCE(SUM(monto), 0) FROM transactions 
           WHERE tipo IN ('BUY', 'crypto_deposit') AND estado = 'completed'"#
    )
    .fetch_one(&pool)
    .await
    .unwrap_or(Decimal::from(0));

    // 3. Calcular Outcome (SELL)
    let outcome = sqlx::query_scalar!(
        r#"SELECT COALESCE(SUM(monto), 0) FROM transactions 
           WHERE tipo = 'SELL' AND estado = 'completed'"#
    )
    .fetch_one(&pool)
    .await
    .unwrap_or(Decimal::from(0));

    // 4. Devolver JSON al frontend
    Json(DashboardStats {
        total_balance: last_balance,
        income_volume: income,
        outcome_volume: outcome,
    })
}