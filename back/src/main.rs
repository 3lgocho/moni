use axum::{routing::get, Router};
use sqlx::mysql::MySqlPoolOptions;
use std::env;

#[tokio::main]
async fn main() {
    // 1. Cargar las variables del archivo .env
    dotenvy::dotenv().ok();
    let db_url = env::var("DATABASE_URL").expect("Falta DATABASE_URL en el .env");

    // 2. Intentar conectar a MariaDB
    println!("⏳ Conectando a la base de datos...");
    let pool = MySqlPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await
        .expect("❌ Error al conectar con MariaDB");
    
    println!("✅ Conexión a MariaDB exitosa!");

    // 3. Crear el router de Axum
    let app = Router::new().route("/", get(|| async { "¡Moni Backend API Activo!" }));

    // 4. Levantar el servidor
    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000").await.unwrap();
    println!("🚀 Servidor corriendo en http://127.0.0.1:3000");
    
    axum::serve(listener, app).await.unwrap();
}