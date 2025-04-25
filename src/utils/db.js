const mysql = require('mysql2/promise');
const logger = require('./logger');

let pool;

const initPool = () => {
    try {
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        logger.info('MySQL connection pool initialized');
        return pool;
    } catch (error) {
        logger.error('Error initializing MySQL connection pool:', error);
        throw error;
    }
};

const getPool = () => {
    if (!pool) {
        return initPool();
    }
    return pool;
};

const query = async (sql, params = []) => {
    try {
        const connection = await getPool().getConnection();
        try {
            const [results] = await connection.query(sql, params);
            return results;
        } finally {
            connection.release();
        }
    } catch (error) {
        logger.error(`Database query error: ${error.message}`, { sql, params });
        throw error;
    }
};

module.exports = {
    getPool,
    query,
    initPool
};