-- Tabla para el historial de transacciones (P2P y depósitos)
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(255) PRIMARY KEY,
    fecha DATETIME NOT NULL,
    monto DECIMAL(18,8) NOT NULL,
    total_fiat DECIMAL(18,2) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    activo VARCHAR(50) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    id_orden VARCHAR(255) NOT NULL
);

-- Tabla para los balances extraídos de Binance
CREATE TABLE IF NOT EXISTS balance_snapshots (
    id VARCHAR(255) PRIMARY KEY,
    fecha_registro DATETIME NOT NULL,
    asset VARCHAR(50) NOT NULL,
    spot_amount DECIMAL(18,8) NOT NULL,
    funding_amount DECIMAL(18,8) NOT NULL,
    earn_amount DECIMAL(18,8) NOT NULL,
    total_amount DECIMAL(18,8) NOT NULL
);