# Solución al Error de Login (401 Unauthorized)

## Problema
El error 401 indica que las credenciales son inválidas. Esto ocurre porque:
1. La base de datos no tiene usuarios creados, O
2. Las contraseñas en la base de datos no están correctamente hasheadas con bcrypt

## Solución

### Opción 1: Ejecutar el Seed de Prisma (RECOMENDADO)

1. **Detén el servidor backend** (Ctrl+C en la terminal donde está corriendo)

2. **Abre una nueva terminal en el directorio backend:**
   ```bash
   cd backend
   ```

3. **Sincroniza el esquema de Prisma con la base de datos:**
   ```bash
   npx prisma db push
   ```

4. **Ejecuta el seed para crear usuarios y datos iniciales:**
   ```bash
   npm run prisma:seed
   ```

5. **Inicia el servidor nuevamente:**
   ```bash
   npm run dev
   ```

### Opción 2: Crear Usuario Manualmente con Script

Si la Opción 1 no funciona, ejecuta este script desde el directorio backend:

1. **Crea un archivo temporal `create-user.js` en el directorio backend:**

```javascript
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function createUser() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bazar_abem'
  });

  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await connection.execute(
    'INSERT INTO usuarios (nombre, username, password, rol) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE password = ?',
    ['Administrador', 'admin', hashedPassword, 'Administrador', hashedPassword]
  );

  console.log('✅ Usuario admin creado exitosamente');
  console.log('   Username: admin');
  console.log('   Password: admin123');
  
  await connection.end();
}

createUser().catch(console.error);
```

2. **Ejecuta el script:**
   ```bash
   node create-user.js
   ```

### Opción 3: Usar MySQL Workbench o phpMyAdmin

1. **Genera un hash de contraseña:**
   - Ejecuta en el directorio backend:
   ```bash
   node scripts/hash-password.js admin123
   ```

2. **Copia el hash generado**

3. **Ejecuta este SQL en MySQL:**
   ```sql
   USE bazar_abem;
   
   INSERT INTO usuarios (nombre, username, password, rol) 
   VALUES ('Administrador', 'admin', 'PEGA_AQUI_EL_HASH', 'Administrador')
   ON DUPLICATE KEY UPDATE password = 'PEGA_AQUI_EL_HASH';
   ```

## Credenciales de Acceso

Después de ejecutar cualquiera de las opciones anteriores, podrás iniciar sesión con:

- **Usuario:** admin
- **Contraseña:** admin123

O si ejecutaste el seed completo:

- **Usuario:** vendedor
- **Contraseña:** vendedor123

## Verificar que Funcionó

1. Inicia el servidor backend: `npm run dev`
2. Ve al login en el frontend
3. Ingresa las credenciales
4. Deberías ser redirigido al dashboard

## Notas Importantes

- Asegúrate de que MySQL esté corriendo
- Verifica que la base de datos `bazar_abem` exista
- El archivo `.env` debe tener la variable `DATABASE_URL` correctamente configurada
- Si cambias la contraseña en el `.env`, reinicia el servidor backend
