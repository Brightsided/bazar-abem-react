import bcrypt from 'bcrypt';

const password = process.argv[2];

if (!password) {
  console.error('❌ Por favor proporciona una contraseña');
  console.log('Uso: node scripts/hash-password.js <contraseña>');
  process.exit(1);
}

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('❌ Error al hashear contraseña:', err);
    process.exit(1);
  }
  console.log('✅ Contraseña hasheada:');
  console.log(hash);
});
