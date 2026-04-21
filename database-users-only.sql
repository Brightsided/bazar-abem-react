-- Seed minimo de usuarios para produccion
-- Requiere que la tabla `usuarios` ya exista (por ejemplo tras `prisma migrate deploy`).

INSERT INTO usuarios (nombre, username, password, rol) VALUES
('Administrador', 'admin', '$2a$12$raiTYj8aVVlKFU47PXdL.uippabeUNbm0kKAEw4DjmpqxQgAt9gXG', 'Administrador'),
('Trabajador', 'trabajador', '$2b$10$7ef0T./oD.MWtH.b0yY.XeMDKxD8A7hfwXyBp.nEQ5sDMYoL9GNue', 'Vendedor')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), rol = VALUES(rol);
