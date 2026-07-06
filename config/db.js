const { Pool } = require('pg');
require('dotenv').config();

// Configuración del Pool utilizando las variables de entorno securizadas
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

// Verificación inicial del canal de comunicación con PostgreSQL
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error crítico al conectar con la base de datos:', err.stack);
    } else {
        console.log('Conexión exitosa a PostgreSQL establecida correctamente.');
    }
});

module.exports = pool;