use axum::{extract::{State, Query}, response::IntoResponse, Json};
use sqlx::MySqlPool;

use crate::models::{Transaction, PaginationQuery, SummaryQuery, FinancialSummary, DashboardStats};
use rust_decimal::Decimal;

// 1. GET TRANSACTIONS (Paginado)
pub async fn get_transactions(
    State(pool): State<MySqlPool>,
    Query(pagination): Query<PaginationQuery>,
) -> Result<Json<Vec<Transaction>>, String> {
    
    let limit = pagination.limit.unwrap_or(50);
    let offset = pagination.offset.unwrap_or(0);

    let transactions = sqlx::query_as::<_, Transaction>(
        r#"SELECT id, fecha, monto, total_fiat, tipo, activo, estado, id_orden 
           FROM transactions 
           ORDER BY fecha DESC 
           LIMIT ? OFFSET ?"#
    )
    .bind(limit)
    .bind(offset)
    .fetch_all(&pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(Json(transactions))
}

// 2. GET SUMMARY (El nuevo filtro dinámico para el Frontend gris)
pub async fn get_summary(
    State(pool): State<MySqlPool>,
    Query(params): Query<SummaryQuery>,
) -> Result<Json<FinancialSummary>, String> {
    
    let query = match params.filter.as_deref() {
        Some("week") => r#"
            SELECT 
                COALESCE(SUM(CASE WHEN tipo IN ('BUY', 'crypto_deposit') AND estado = 'completed' THEN monto ELSE 0 END), 0) as income,
                COALESCE(SUM(CASE WHEN tipo = 'SELL' AND estado = 'completed' THEN monto ELSE 0 END), 0) as outcome
            FROM transactions 
            /* Se resta a HOY el número de día de la semana (Lunes=0) para siempre caer en el lunes actual */
            WHERE fecha >= DATE(CURDATE() - INTERVAL WEEKDAY(CURDATE()) DAY)"#,
        Some("month") => r#"
            SELECT 
                COALESCE(SUM(CASE WHEN tipo IN ('BUY', 'crypto_deposit') AND estado = 'completed' THEN monto ELSE 0 END), 0) as income,
                COALESCE(SUM(CASE WHEN tipo = 'SELL' AND estado = 'completed' THEN monto ELSE 0 END), 0) as outcome
            FROM transactions 
            WHERE fecha >= DATE_FORMAT(CURDATE(), '%Y-%m-01')"#,
        _ => r#"
            SELECT 
                COALESCE(SUM(CASE WHEN tipo IN ('BUY', 'crypto_deposit') AND estado = 'completed' THEN monto ELSE 0 END), 0) as income,
                COALESCE(SUM(CASE WHEN tipo = 'SELL' AND estado = 'completed' THEN monto ELSE 0 END), 0) as outcome
            FROM transactions"# 
    };

    let summary: FinancialSummary = sqlx::query_as(query)
        .fetch_one(&pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(Json(summary))
}

// 3. GET STATS (El global que tenías originalmente, necesario para el "Total Balance")
pub async fn get_stats(State(pool): State<MySqlPool>) -> impl IntoResponse {
    let last_balance = sqlx::query_scalar!(
        "SELECT total_amount FROM balance_snapshots ORDER BY fecha_registro DESC LIMIT 1"
    )
    .fetch_optional(&pool)
    .await
    .unwrap_or(None)
    .unwrap_or(Decimal::from(0));

    let income = sqlx::query_scalar!(
        r#"SELECT COALESCE(SUM(monto), 0) FROM transactions 
           WHERE tipo IN ('BUY', 'crypto_deposit') AND estado = 'completed'"#
    )
    .fetch_one(&pool)
    .await
    .unwrap_or(Decimal::from(0));

    let outcome = sqlx::query_scalar!(
        r#"SELECT COALESCE(SUM(monto), 0) FROM transactions 
           WHERE tipo = 'SELL' AND estado = 'completed'"#
    )
    .fetch_one(&pool)
    .await
    .unwrap_or(Decimal::from(0));

    Json(DashboardStats {
        total_balance: last_balance,
        income_volume: income,
        outcome_volume: outcome,
    })
}

// 4. TRIGGER SCRAPE MANUAL
pub async fn trigger_scrape(
    State(pool): State<MySqlPool>,
) -> Result<Json<String>, String> {
    
    if let Err(e) = crate::scraper::sync_total_balance(&pool).await {
        return Err(format!("Error sincronizando balance: {}", e));
    }
    
    if let Err(e) = crate::scraper::run_scraper(&pool).await {
        return Err(format!("Error en el scraper P2P: {}", e));
    }
    
    Ok(Json("Scraping ejecutado y base de datos actualizada".to_string()))
}