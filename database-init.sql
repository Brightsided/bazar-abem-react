-- Crear base de datos
CREATE DATABASE IF NOT EXISTS bazar_abem CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE bazar_abem;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  rol VARCHAR(50) NOT NULL,
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  INDEX idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de productos (actualizada para incluir información de almacenamiento)
CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  precio DECIMAL(10, 2) NOT NULL DEFAULT 0,
  INDEX idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de almacenamiento (inventario)
CREATE TABLE IF NOT EXISTS almacenamiento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL UNIQUE,
  stock INT NOT NULL DEFAULT 0,
  stock_minimo INT NOT NULL DEFAULT 5,
  codigo_barras VARCHAR(255) UNIQUE,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
  INDEX idx_producto_id (producto_id),
  INDEX idx_stock (stock),
  INDEX idx_codigo_barras (codigo_barras)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de alertas de stock bajo
CREATE TABLE IF NOT EXISTS alertas_stock (
  id INT AUTO_INCREMENT PRIMARY KEY,
  almacenamiento_id INT NOT NULL,
  producto_id INT NOT NULL,
  tipo_alerta VARCHAR(50) NOT NULL DEFAULT 'STOCK_BAJO',
  stock_actual INT NOT NULL,
  stock_minimo INT NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'ACTIVA',
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_resolucion DATETIME NULL,
  FOREIGN KEY (almacenamiento_id) REFERENCES almacenamiento(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
  INDEX idx_almacenamiento_id (almacenamiento_id),
  INDEX idx_producto_id (producto_id),
  INDEX idx_estado (estado),
  INDEX idx_fecha_creacion (fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de movimientos de inventario (historial)
CREATE TABLE IF NOT EXISTS movimientos_inventario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  almacenamiento_id INT NOT NULL,
  producto_id INT NOT NULL,
  tipo_movimiento VARCHAR(50) NOT NULL,
  cantidad INT NOT NULL,
  stock_anterior INT NOT NULL,
  stock_nuevo INT NOT NULL,
  referencia_venta_id INT NULL,
  descripcion TEXT,
  usuario_id INT NULL,
  fecha_movimiento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (almacenamiento_id) REFERENCES almacenamiento(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_almacenamiento_id (almacenamiento_id),
  INDEX idx_producto_id (producto_id),
  INDEX idx_tipo_movimiento (tipo_movimiento),
  INDEX idx_fecha_movimiento (fecha_movimiento),
  INDEX idx_referencia_venta_id (referencia_venta_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente VARCHAR(255) NOT NULL,
  cliente_id INT NULL,
  productos TEXT NOT NULL,
  precio_total DECIMAL(10, 2) NOT NULL,
  metodo_pago VARCHAR(100) NOT NULL,
  fecha_venta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  usuario_id INT NULL,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_fecha_venta (fecha_venta),
  INDEX idx_cliente_id (cliente_id),
  INDEX idx_usuario_id (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de detalle de ventas
CREATE TABLE IF NOT EXISTS detalle_venta (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venta_id INT NOT NULL,
  producto_id INT NULL,
  producto VARCHAR(255) NOT NULL,
  cantidad INT NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE SET NULL,
  INDEX idx_venta_id (venta_id),
  INDEX idx_producto_id (producto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar usuario administrador por defecto
-- Contraseña: admin123 (hasheada con bcrypt)
INSERT INTO usuarios (nombre, username, password, rol) VALUES
('Administrador', 'admin', '$2a$12$raiTYj8aVVlKFU47PXdL.uippabeUNbm0kKAEw4DjmpqxQgAt9gXG', 'Administrador'),
-- Contraseña: trabajador123 (hasheada con bcrypt)
('Trabajador', 'trabajador', '$2b$10$7ef0T./oD.MWtH.b0yY.XeMDKxD8A7hfwXyBp.nEQ5sDMYoL9GNue', 'Vendedor')
ON DUPLICATE KEY UPDATE nombre=nombre;

-- Tabla de comprobantes electrónicos (Facturación SUNAT)
CREATE TABLE IF NOT EXISTS comprobantes_electronicos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venta_id INT NOT NULL UNIQUE,
  tipo VARCHAR(50) NOT NULL,
  serie VARCHAR(10) NOT NULL,
  numero INT NOT NULL,
  xmlSinFirma LONGTEXT NOT NULL,
  xmlFirmado LONGTEXT NULL,
  cdrXml LONGTEXT NULL,
  hashCpe VARCHAR(255) NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
  codigoSunat VARCHAR(50) NULL,
  mensajeSunat TEXT NULL,
  fechaEnvio DATETIME NULL,
  fechaRespuesta DATETIME NULL,
  intentosEnvio INT NOT NULL DEFAULT 0,
  ultimoError TEXT NULL,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
  INDEX idx_venta_id (venta_id),
  INDEX idx_estado (estado),
  INDEX idx_fecha_creacion (fecha_creacion),
  INDEX idx_serie_numero (serie, numero)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de cierres de caja
CREATE TABLE IF NOT EXISTS cierres_caja (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  fecha_apertura DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_cierre DATETIME NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'ABIERTO',

  monto_inicial DECIMAL(10,2) NOT NULL DEFAULT 0,
  monto_final DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_ventas DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_efectivo DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_yape DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_plin DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_tarjeta DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_transferencia DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_otro DECIMAL(12,2) NOT NULL DEFAULT 0,

  total_anulaciones DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_descuentos DECIMAL(12,2) NOT NULL DEFAULT 0,
  observaciones TEXT NULL,

  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_estado (estado),
  INDEX idx_fecha_apertura (fecha_apertura),
  INDEX idx_fecha_cierre (fecha_cierre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
