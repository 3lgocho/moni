use reqwest::Client;

pub async fn fetch_title_or_fallback(input: &str) -> String {
    if !input.starts_with("http://") && !input.starts_with("https://") {
        return input.to_string();
    }

    // 2. Construir cliente HTTP con User-Agent falso (Vital para evitar bloqueos 403)
    let client = Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        .build()
        .unwrap_or_default();

    // 3. Ejecutar GET
    match client.get(input).send().await {
        Ok(res) if res.status().is_success() => {
            if let Ok(html) = res.text().await {
                // 4. Buscar etiqueta <title> manualmente
                if let Some(start_tag) = html.find("<title>") {
                    if let Some(end_tag) = html[start_tag..].find("</title>") {
                        // Cortamos el string (+7 para saltar la palabra "<title>")
                        let raw_title = &html[start_tag + 7..start_tag + end_tag];
                        
                        // Limpiamos espacios en blanco o saltos de línea
                        return raw_title.trim().to_string(); 
                    }
                }
            }
            // Retorno de seguridad si la página no tiene <title>
            input.to_string() 
        }
        // Retorno de seguridad si falla la red, da 404, etc.
        _ => input.to_string(), 
    }
}