mod models;
mod scraper;
use scraper::run_scraper; // Traes la función al scope
use axum::{http::Method, routing::get, Json, Router};
use models::Transaction;
use sqlx::{mysql::MySqlPoolOptions, MySqlPool};
use std::env;
use tower_http::cors::{Any, CorsLayer};

#[tokio::main]
async fn main() {
    // 1. Cargar el .env
    dotenvy::dotenv().ok();
    let db_url = env::var("DATABASE_URL").expect("Falta DATABASE_URL en el .env");
    
    // 2. Conectar al Pool de MariaDB
    println!("⏳ Conectando a MariaDB...");
    let pool = MySqlPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await
        .expect("❌ Error al conectar con MariaDB");
    
    println!("✅ Conexión a MariaDB exitosa!");

    let db_name: (String,) = sqlx::query_as("SELECT DATABASE()").fetch_one(&pool).await.unwrap();
    println!("🕵️ Rust está insertando datos en la base de datos: {}", db_name.0);
    
    // 3. Ejecutar el Scraper pasándole la conexión
    if let Err(e) = run_scraper(&pool).await {
        eprintln!("Error en el scraper: {}", e);
    }

    // 4. Configurar CORS (Para que React en el puerto 5173 pueda pedir datos al puerto 3000 sin bloqueo)
    let cors = CorsLayer::new()
        .allow_origin(Any) // En producción esto se restringe
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers(Any);

    // 5. Configurar las rutas y pasarle el "pool" de la BD
    let app = Router::new()
        .route("/api/transactions", get(get_transactions))
        .layer(cors)
        .with_state(pool); // Inyectamos la conexión a la base de datos en Axum

    // 6. Levantar Servidor
    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000").await.unwrap();
    println!("🚀 Servidor backend corriendo en http://127.0.0.1:3000");
    
    axum::serve(listener, app).await.unwrap();
}

// Handler: Función que se ejecuta cuando React pide las transacciones
async fn get_transactions(
    axum::extract::State(pool): axum::extract::State<MySqlPool>,
) -> Json<Vec<Transaction>> {
    
    // Hacemos el SELECT a la tabla de MariaDB
    let query_result = sqlx::query_as::<_, Transaction>(
        "SELECT id, fecha, monto, total_fiat, tipo, activo, estado, id_orden FROM transactions ORDER BY fecha DESC"
    )
    .fetch_all(&pool)
    .await;

    match query_result {
        Ok(transactions) => Json(transactions),
        Err(e) => {
            eprintln!("Error al consultar transacciones: {}", e);
            Json(vec![]) // Si hay error, devuelve un array vacío a React
        }
    }
}