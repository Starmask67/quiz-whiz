#!/usr/bin/env node

// Test Script for Quiz Whiz System
// This script tests all major components to ensure they're working correctly

require('dotenv').config();
const mysql = require('mysql2/promise');
const axios = require('axios');

class SystemTester {
    constructor() {
        this.testResults = [];
        this.backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    }

    async runAllTests() {
        console.log('🧪 Starting Quiz Whiz System Tests...\n');

        try {
            // Test 1: Environment Variables
            await this.testEnvironmentVariables();

            // Test 2: Database Connection
            await this.testDatabaseConnection();

            // Test 3: Database Schema
            await this.testDatabaseSchema();

            // Test 4: Backend Server (if running)
            await this.testBackendServer();

            // Test 5: Bot Configuration
            await this.testBotConfiguration();

            // Test 6: File System
            await this.testFileSystem();

            // Print Results
            this.printResults();

        } catch (error) {
            console.error('❌ Test suite failed:', error.message);
            process.exit(1);
        }
    }

    async testEnvironmentVariables() {
        console.log('🔧 Testing Environment Variables...');
        
        const requiredVars = [
            'DB_HOST',
            'DB_PORT', 
            'DB_USER',
            'DB_PASSWORD',
            'DB_NAME',
            'TELEGRAM_BOT_TOKEN'
        ];

        const missing = [];
        const present = [];

        for (const varName of requiredVars) {
            if (process.env[varName]) {
                present.push(varName);
            } else {
                missing.push(varName);
            }
        }

        if (missing.length === 0) {
            this.addResult('Environment Variables', 'PASS', 'All required variables are set');
        } else {
            this.addResult('Environment Variables', 'FAIL', `Missing: ${missing.join(', ')}`);
        }

        console.log(`   ✅ Present: ${present.length}, ❌ Missing: ${missing.length}\n`);
    }

    async testDatabaseConnection() {
        console.log('🗄️  Testing Database Connection...');
        
        try {
            const connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME
            });

            // Test basic query
            const [rows] = await connection.execute('SELECT 1 as test');
            
            if (rows[0]?.test === 1) {
                this.addResult('Database Connection', 'PASS', 'Successfully connected to MySQL');
            } else {
                this.addResult('Database Connection', 'FAIL', 'Query test failed');
            }

            await connection.end();
            console.log('   ✅ Database connection successful\n');

        } catch (error) {
            this.addResult('Database Connection', 'FAIL', error.message);
            console.log(`   ❌ Database connection failed: ${error.message}\n`);
        }
    }

    async testDatabaseSchema() {
        console.log('📋 Testing Database Schema...');
        
        try {
            const connection = await mysql.createConnection({
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME
            });

            // Check if required tables exist
            const requiredTables = [
                'users',
                'quizzes', 
                'classes',
                'class_quizzes',
                'quiz_sessions',
                'bot_activity_log',
                'user_preferences'
            ];

            const existingTables = [];
            const missingTables = [];

            for (const tableName of requiredTables) {
                try {
                    const [rows] = await connection.execute(
                        'SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?',
                        [process.env.DB_NAME, tableName]
                    );
                    
                    if (rows[0]?.count > 0) {
                        existingTables.push(tableName);
                    } else {
                        missingTables.push(tableName);
                    }
                } catch (error) {
                    missingTables.push(tableName);
                }
            }

            if (missingTables.length === 0) {
                this.addResult('Database Schema', 'PASS', 'All required tables exist');
            } else {
                this.addResult('Database Schema', 'WARN', `Missing tables: ${missingTables.join(', ')}`);
            }

            await connection.end();
            console.log(`   ✅ Existing tables: ${existingTables.length}, ❌ Missing: ${missingTables.length}\n`);

        } catch (error) {
            this.addResult('Database Schema', 'FAIL', error.message);
            console.log(`   ❌ Schema check failed: ${error.message}\n`);
        }
    }

    async testBackendServer() {
        console.log('🌐 Testing Backend Server...');
        
        try {
            const response = await axios.get(`${this.backendUrl}/api/bot-status`, {
                timeout: 5000
            });

            if (response.status === 200) {
                this.addResult('Backend Server', 'PASS', 'Server is running and responding');
                console.log('   ✅ Backend server is running\n');
            } else {
                this.addResult('Backend Server', 'FAIL', `Unexpected status: ${response.status}`);
                console.log(`   ❌ Backend server returned status: ${response.status}\n`);
            }

        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                this.addResult('Backend Server', 'WARN', 'Server is not running (this is normal if not started yet)');
                console.log('   ⚠️  Backend server is not running (normal if not started)\n');
            } else {
                this.addResult('Backend Server', 'FAIL', error.message);
                console.log(`   ❌ Backend server test failed: ${error.message}\n`);
            }
        }
    }

    async testBotConfiguration() {
        console.log('🤖 Testing Bot Configuration...');
        
        const token = process.env.TELEGRAM_BOT_TOKEN;
        
        if (!token) {
            this.addResult('Bot Configuration', 'FAIL', 'TELEGRAM_BOT_TOKEN not set');
            console.log('   ❌ Bot token not configured\n');
            return;
        }

        // Check token format (should be like: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz)
        if (/^\d+:[A-Za-z0-9_-]{35}$/.test(token)) {
            this.addResult('Bot Configuration', 'PASS', 'Bot token format is valid');
            console.log('   ✅ Bot token format is valid\n');
        } else {
            this.addResult('Bot Configuration', 'WARN', 'Bot token format may be invalid');
            console.log('   ⚠️  Bot token format may be invalid\n');
        }
    }

    async testFileSystem() {
        console.log('📁 Testing File System...');
        
        const fs = require('fs');
        const path = require('path');
        
        const requiredFiles = [
            'start-backend.js',
            'enhanced-telegram-bot.js',
            'start-system.sh',
            'package.json',
            '.env.example'
        ];

        const existingFiles = [];
        const missingFiles = [];

        for (const fileName of requiredFiles) {
            const filePath = path.join(__dirname, fileName);
            if (fs.existsSync(filePath)) {
                existingFiles.push(fileName);
            } else {
                missingFiles.push(fileName);
            }
        }

        if (missingFiles.length === 0) {
            this.addResult('File System', 'PASS', 'All required files exist');
        } else {
            this.addResult('File System', 'FAIL', `Missing files: ${missingFiles.join(', ')}`);
        }

        console.log(`   ✅ Existing files: ${existingFiles.length}, ❌ Missing: ${missingFiles.length}\n`);
    }

    addResult(testName, status, message) {
        this.testResults.push({ testName, status, message });
    }

    printResults() {
        console.log('📊 Test Results Summary\n');
        console.log('─'.repeat(80));
        
        let passCount = 0;
        let warnCount = 0;
        let failCount = 0;

        for (const result of this.testResults) {
            const statusIcon = {
                'PASS': '✅',
                'WARN': '⚠️ ',
                'FAIL': '❌'
            }[result.status];

            const statusColor = {
                'PASS': '\x1b[32m',
                'WARN': '\x1b[33m',
                'FAIL': '\x1b[31m'
            }[result.status];

            console.log(`${statusIcon} ${statusColor}${result.status}\x1b[0m | ${result.testName}`);
            console.log(`   ${result.message}`);
            console.log('');

            if (result.status === 'PASS') passCount++;
            else if (result.status === 'WARN') warnCount++;
            else failCount++;
        }

        console.log('─'.repeat(80));
        console.log(`📈 Summary: ${passCount} ✅ PASS, ${warnCount} ⚠️  WARN, ${failCount} ❌ FAIL`);
        console.log('');

        if (failCount === 0) {
            if (warnCount === 0) {
                console.log('🎉 All tests passed! Your system is ready to run.');
            } else {
                console.log('✅ All critical tests passed! Some warnings to address.');
            }
        } else {
            console.log('❌ Some tests failed. Please address the issues before running the system.');
        }

        console.log('');
        console.log('💡 Next steps:');
        if (failCount === 0) {
            console.log('   1. Configure your .env file with your database credentials');
            console.log('   2. Run: ./start-system.sh start');
            console.log('   3. Test your bot on Telegram');
        } else {
            console.log('   1. Fix the failed tests above');
            console.log('   2. Ensure your database is running and accessible');
            console.log('   3. Check your environment variables');
        }
    }
}

// Run the tests
const tester = new SystemTester();
tester.runAllTests().catch(error => {
    console.error('❌ Test suite crashed:', error.message);
    process.exit(1);
});