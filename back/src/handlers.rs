use axum::{extract::{State, Query}, response::IntoResponse, Json, http::StatusCode};
use crate::scraper::fetch_title_or_fallback;
use crate::models::{Transaction, PaginationQuery, SummaryQuery, FinancialSummary, DashboardStats};
use rust_decimal::Decimal;
use serde::Deserialize;
use sqlx::MySqlPool;
use uuid::Uuid;

// 1. GET TRANSACTIONS (Paginado y Filtrado por Fechas)
pub async fn get_transactions(
    State(pool): State<MySqlPool>,
    Query(params): Query<PaginationQuery>,
) -> Result<Json<Vec<Transaction>>, String> {
    
    let limit = params.limit.unwrap_or(50);
    let offset = params.offset.unwrap_or(0);

    let transactions = if let (Some(start), Some(end)) = (&params.start_date, &params.end_date) {
        sqlx::query_as::<_, Transaction>(
            r#"SELECT id, fecha, monto, total_fiat, tipo, activo, estado, id_orden 
               FROM transactions 
               WHERE DATE(fecha) BETWEEN ? AND ?
               ORDER BY fecha DESC LIMIT ? OFFSET ?"#
        )
        .bind(start)
        .bind(end)
        .bind(limit)
        .bind(offset)
        .fetch_all(&pool)
        .await
        .map_err(|e| e.to_string())?
    } else {
        sqlx::query_as::<_, Transaction>(
            r#"SELECT id, fecha, monto, total_fiat, tipo, activo, estado, id_orden 
               FROM transactions 
               ORDER BY fecha DESC LIMIT ? OFFSET ?"#
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(&pool)
        .await
        .map_err(|e| e.to_string())?
    };

    Ok(Json(transactions))
}

// 2. GET SUMMARY (Con filtro de fechas exactas)
pub async fn get_summary(
    State(pool): State<MySqlPool>,
    Query(params): Query<SummaryQuery>,
) -> Result<Json<FinancialSummary>, String> {
    
    let summary: FinancialSummary = if let (Some(start), Some(end)) = (&params.start_date, &params.end_date) {
        sqlx::query_as(r#"
            SELECT 
                COALESCE(SUM(CASE WHEN tipo IN ('BUY', 'crypto_deposit') AND estado = 'completed' THEN monto ELSE 0 END), 0) as income,
                COALESCE(SUM(CASE WHEN tipo = 'SELL' AND estado = 'completed' THEN monto ELSE 0 END), 0) as outcome
            FROM transactions 
            WHERE DATE(fecha) BETWEEN ? AND ?"#
        )
        .bind(start)
        .bind(end)
        .fetch_one(&pool)
        .await
        .map_err(|e| e.to_string())?
    } else {
        sqlx::query_as(r#"
            SELECT 
                COALESCE(SUM(CASE WHEN tipo IN ('BUY', 'crypto_deposit') AND estado = 'completed' THEN monto ELSE 0 END), 0) as income,
                COALESCE(SUM(CASE WHEN tipo = 'SELL' AND estado = 'completed' THEN monto ELSE 0 END), 0) as outcome
            FROM transactions"#
        )
        .fetch_one(&pool)
        .await
        .map_err(|e| e.to_string())?
    };

    Ok(Json(summary))
}

// 3. GET STATS 
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

// ==========================================
// 5. WISHLIST 
// ==========================================
#[derive(Deserialize)]
pub struct CreateWishlistItem {
    pub nombre: String,
    pub precio_usd: f64,
    pub prioridad: String,
}

pub async fn add_wishlist_item(
    State(pool): State<MySqlPool>, 
    Json(payload): Json<CreateWishlistItem>,
) -> impl IntoResponse {
    
    let es_link = payload.nombre.starts_with("http");
    let link_final = if es_link { Some(payload.nombre.clone()) } else { None };
    
    let nombre_final = fetch_title_or_fallback(&payload.nombre).await;
    
    let new_id = Uuid::new_v4().to_string();
    
    let result = sqlx::query!(
        "INSERT INTO wishlist (id, nombre, precio_usd, prioridad, link, comprado) VALUES (?, ?, ?, ?, ?, false)",
        new_id,
        nombre_final,
        payload.precio_usd,
        payload.prioridad,
        link_final
    )
    .execute(&pool)
    .await;

    match result {
        Ok(_) => {
            (StatusCode::CREATED, Json(serde_json::json!({
                "id": new_id,
                "nombre": nombre_final,
                "precio_usd": payload.precio_usd,
                "prioridad": payload.prioridad,
                "link": link_final,
                "comprado": false
            })))
        },
        Err(e) => {
            eprintln!("Error insertando en wishlist: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!("Error al guardar en la BD")))
        }
    }
}

// ==========================================
// 6. OBTENER WISHLIST (GET)
// ==========================================
pub async fn get_wishlist(
    State(pool): State<MySqlPool>,
) -> Result<Json<Vec<serde_json::Value>>, String> {
    // Obtenemos todos los ítems de la base de datos
    let items = sqlx::query!(
        "SELECT id, nombre, precio_usd, prioridad, link, comprado FROM wishlist"
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| e.to_string())?;

    let mut result = Vec::new();
    for row in items {
        result.push(serde_json::json!({
            "id": row.id,
            "nombre": row.nombre,
            "precio_usd": row.precio_usd,
            "prioridad": row.prioridad,
            "link": row.link,
            "comprado": row.comprado != 0 // Convertimos el 0/1 de MySQL a Booleano (true/false) para React
        }));
    }

    Ok(Json(result))
}

// ==========================================
// 7. ELIMINAR ÍTEM (DELETE)
// ==========================================
pub async fn delete_wishlist_item(
    State(pool): State<MySqlPool>,
    axum::extract::Path(id): axum::extract::Path<String>,
) -> impl IntoResponse {
    match sqlx::query!("DELETE FROM wishlist WHERE id = ?", id).execute(&pool).await {
        Ok(_) => StatusCode::OK,
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR,
    }
}

// ==========================================
// 8. ACTUALIZAR ESTADO DE COMPRA (PATCH)
// ==========================================
#[derive(serde::Deserialize)]
pub struct ToggleWishlistItem {
    pub comprado: bool,
}

pub async fn toggle_wishlist_item(
    State(pool): State<MySqlPool>,
    axum::extract::Path(id): axum::extract::Path<String>,
    Json(payload): Json<ToggleWishlistItem>,
) -> impl IntoResponse {
    match sqlx::query!("UPDATE wishlist SET comprado = ? WHERE id = ?", payload.comprado, id).execute(&pool).await {
        Ok(_) => StatusCode::OK,
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR,
    }
}

// ==========================================
// 9. EDITAR ÍTEM COMPLETO (PUT)
// ==========================================
pub async fn update_wishlist_item(
    State(pool): State<MySqlPool>,
    axum::extract::Path(id): axum::extract::Path<String>,
    Json(payload): Json<CreateWishlistItem>,
) -> impl IntoResponse {
    let es_link = payload.nombre.starts_with("http");
    let link_final = if es_link { Some(payload.nombre.clone()) } else { None };
    
    match sqlx::query!(
        "UPDATE wishlist SET nombre = ?, precio_usd = ?, prioridad = ?, link = ? WHERE id = ?",
        payload.nombre, payload.precio_usd, payload.prioridad, link_final, id
    ).execute(&pool).await {
        Ok(_) => StatusCode::OK,
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR,
    }
}