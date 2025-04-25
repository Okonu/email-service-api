const mysql = require('mysql2/promise');
const { Client } = require('ssh2');
const logger = require('./logger');

let pool;
let sshClient;

const createSSHTunnel = () => {
    return new Promise((resolve, reject) => {
        sshClient = new Client();

        const sshConfig = {
            host: process.env.SSH_HOST || process.env.DB_HOST,
            port: process.env.SSH_PORT || 22,
            username: process.env.SSH_USERNAME || 'root',
            password: process.env.SSH_PASSWORD,
            // privateKey: require('fs').readFileSync(process.env.SSH_PRIVATE_KEY_PATH),
        };

        logger.info('Establishing SSH connection...');

        sshClient
            .on('ready', () => {
                logger.info('SSH connection established');

                sshClient.forwardOut(
                    '127.0.0.1',
                    0,
                    '127.0.0.1',
                    process.env.DB_PORT || 3306,
                    (err, stream) => {
                        if (err) {
                            logger.error('SSH port forwarding error:', err);
                            sshClient.end();
                            reject(err);
                        } else {
                            logger.info('SSH tunnel established');
                            resolve({
                                stream,
                                close: () => {
                                    logger.info('Closing SSH connection');
                                    sshClient.end();
                                }
                            });
                        }
                    }
                );
            })
            .on('error', (err) => {
                logger.error('SSH connection error:', err);
                reject(err);
            })
            .connect(sshConfig);
    });
};

const initPool = async () => {
    try {
        const useSSHTunnel = process.env.USE_SSH_TUNNEL === 'true';

        if (useSSHTunnel) {
            logger.info('Using SSH tunnel for database connection');
            const tunnel = await createSSHTunnel();

            pool = mysql.createPool({
                host: '127.0.0.1',
                user: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE,
                stream: tunnel.stream,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            });

            pool.sshClose = tunnel.close;

        } else {
            logger.info('Using direct database connection');
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
        }

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

const closeAll = async () => {
    if (pool) {
        logger.info('Closing database pool');
        await pool.end();

        if (pool.sshClose) {
            pool.sshClose();
        }

        pool = null;
    }
};

process.on('SIGINT', async () => {
    logger.info('Received SIGINT signal, closing database connections');
    await closeAll();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM signal, closing database connections');
    await closeAll();
    process.exit(0);
});

module.exports = {
    getPool,
    query,
    initPool,
    closeAll
};