// Database connection utility for Quiz Whiz
const mysql = require('mysql2/promise');
require('dotenv').config();

class DatabaseConnection {
    constructor() {
        this.pool = null;
        this.isConnected = false;
    }

    async connect() {
        try {
            this.pool = mysql.createPool({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'quiz_whiz',
                port: process.env.DB_PORT || 3306,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
                acquireTimeout: 60000,
                timeout: 60000,
                multipleStatements: true,
                charset: 'utf8mb4'
            });

            // Test connection
            const connection = await this.pool.getConnection();
            await connection.ping();
            connection.release();
            
            this.isConnected = true;
            console.log('✅ Database connected successfully');
            return this.pool;
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            throw error;
        }
    }

    async query(sql, params = []) {
        if (!this.isConnected) {
            await this.connect();
        }
        
        try {
            const [rows] = await this.pool.execute(sql, params);
            return rows;
        } catch (error) {
            console.error('Database query error:', error.message);
            console.error('SQL:', sql);
            console.error('Params:', params);
            throw error;
        }
    }

    async transaction(queries) {
        const connection = await this.pool.getConnection();
        await connection.beginTransaction();
        
        try {
            const results = [];
            for (const { sql, params } of queries) {
                const [result] = await connection.execute(sql, params);
                results.push(result);
            }
            
            await connection.commit();
            connection.release();
            return results;
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    }

    generateId(prefix = '') {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 9);
        return `${prefix}${timestamp}${random}`.toUpperCase();
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
            this.isConnected = false;
            console.log('Database connection closed');
        }
    }
}

// Singleton instance
const db = new DatabaseConnection();

module.exports = db;