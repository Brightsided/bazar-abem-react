const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createAdmin() {
  try {
    console.log('🔧 Conectando a la base de datos...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'bazar_abem'
    });

    console.log('✅ Conectado a la base de datos');
    console.log('🔐 Generando hash de contraseña...');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    console.log('💾 Creando usuario administrador...');
    
    await connection.execute(
      `INSERT INTO usuarios (nombre, username, password, rol) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE password = VALUES(password), nombre = VALUES(nombre), rol = VALUES(rol)`,
      ['Administrador', 'admin', hashedPassword, 'Administrador']
    );

    console.log('\n✅ ¡Usuario administrador creado exitosamente!');
    console.log('\n📝 Credenciales de acceso:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('\n🚀 Ahora puedes iniciar sesión en la aplicación\n');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n💡 Asegúrate de que:');
    console.error('   1. MySQL esté corriendo');
    console.error('   2. La base de datos "bazar_abem" exista');
    console.error('   3. Las credenciales en .env sean correctas\n');
    process.exit(1);
  }
}

createAdmin();
