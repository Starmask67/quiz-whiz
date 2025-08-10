// Test script for Telegram Bot connection
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

async function testBot() {
    try {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        console.log('🔑 Bot Token:', token ? '✅ Found' : '❌ Not found');
        
        if (!token) {
            console.error('❌ TELEGRAM_BOT_TOKEN not found in environment variables');
            return;
        }

        console.log('🤖 Initializing bot...');
        const bot = new TelegramBot(token, { polling: false });
        
        // Get bot info
        const botInfo = await bot.getMe();
        console.log('✅ Bot connected successfully!');
        console.log('📱 Bot Info:', {
            id: botInfo.id,
            name: botInfo.first_name,
            username: botInfo.username,
            canJoinGroups: botInfo.can_join_groups,
            canReadAllGroupMessages: botInfo.can_read_all_group_messages
        });

        console.log('\n🎯 Bot is ready to use!');
        console.log('📝 Users can start the bot with: /start');
        console.log('🔗 Bot username: @' + botInfo.username);
        
    } catch (error) {
        console.error('❌ Bot test failed:', error.message);
        if (error.code === 'ETELEGRAM') {
            console.error('💡 This usually means the bot token is invalid or the bot is not running');
        }
    }
}

testBot();