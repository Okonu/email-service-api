require('dotenv').config();
const mysql = require('mysql2/promise');
const { Client } = require('ssh2');
const logger = require('../utils/logger');

async function createSSHTunnel() {
    return new Promise((resolve, reject) => {
        const sshClient = new Client();

        sshClient.on('ready', () => {
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
        }).on('error', (err) => {
            logger.error('SSH connection error:', err);
            reject(err);
        }).connect({
            host: process.env.SSH_HOST || process.env.DB_HOST,
            port: process.env.SSH_PORT || 22,
            username: process.env.SSH_USERNAME || 'root',
            password: process.env.SSH_PASSWORD,
            // privateKey: require('fs').readFileSync(process.env.SSH_PRIVATE_KEY_PATH),
        });
    });
}

async function initializeDatabase() {
    let connection;
    let sshTunnel;

    try {
        logger.info('Initializing database...');

        const useSSH = process.env.USE_SSH_TUNNEL === 'true';

        if (useSSH) {
            logger.info('Establishing SSH tunnel to database...');
            sshTunnel = await createSSHTunnel();

            connection = await mysql.createConnection({
                host: '127.0.0.1',
                user: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                multipleStatements: true,
                stream: sshTunnel.stream
            });

        } else {
            logger.info('Connecting directly to database...');
            connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                user: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                multipleStatements: true
            });
        }

        logger.info('Connected to MySQL server');

        const dbName = process.env.DB_DATABASE;
        logger.info(`Creating database ${dbName} if it doesn't exist...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
        logger.info(`Database ${dbName} ensured`);

        await connection.query(`USE ${dbName}`);
        logger.info(`Using database ${dbName}`);

        logger.info('Creating waitlist_users table if it doesn\'t exist...');
        await connection.query(`
      CREATE TABLE IF NOT EXISTS waitlist_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) DEFAULT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('active', 'confirmed', 'unsubscribed') DEFAULT 'active',
        utm_source VARCHAR(100) DEFAULT NULL,
        utm_medium VARCHAR(100) DEFAULT NULL,
        utm_campaign VARCHAR(100) DEFAULT NULL,
        ip_address VARCHAR(45) DEFAULT NULL,
        KEY idx_email (email),
        KEY idx_status (status),
        KEY idx_joined_at (joined_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

        logger.info('Database initialization completed successfully');

    } catch (error) {
        logger.error('Database initialization error:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            logger.info('Database connection closed');
        }
        if (sshTunnel) {
            sshTunnel.close();
        }
    }
}

if (require.main === module) {
    initializeDatabase()
        .then(() => {
            logger.info('Database setup completed successfully');
            process.exit(0);
        })
        .catch(err => {
            logger.error('Database setup failed:', err);
            process.exit(1);
        });
}

module.exports = { initializeDatabase };