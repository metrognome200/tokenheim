require('dotenv').config();
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const TelegramBot = require('node-telegram-bot-api');
const WebSocket = require('ws');
const gameLogic = require('./gameLogic');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Telegram Bot
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Serve static files
app.use(express.static(path.join(__dirname, '../client')));

// Validate Telegram WebApp data
function validateInitData(initData) {
    const secret = crypto
        .createHmac('sha256', 'WebAppData')
        .update(process.env.BOT_TOKEN)
        .digest();
    
    const hash = crypto
        .createHash('sha256')
        .update(initData)
        .digest('hex');
    
    return hash === initData.hash;
}

// Handle WebApp initialization
app.post('/init', express.json(), (req, res) => {
    const { initData } = req.body;
    
    if (!validateInitData(initData)) {
        return res.status(401).json({ error: 'Invalid initialization data' });
    }
    
    res.json({ success: true });
});

// Start HTTP server
const server = app.listen(port, () => {
    console.log(`Tokenheim server running on port ${port}`);
});

// Initialize WebSocket server
const wss = new WebSocket.Server({ server });

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('New player connected');
    
    // Create player session
    const playerSession = gameLogic.createPlayerSession();
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            switch(data.type) {
                case 'move':
                    gameLogic.handlePlayerMove(playerSession, data);
                    break;
                    
                case 'attack':
                    gameLogic.handlePlayerAttack(playerSession, data);
                    break;
                    
                case 'special':
                    gameLogic.handlePlayerSpecial(playerSession, data);
                    break;
                    
                case 'collect':
                    gameLogic.handleTokenCollection(playerSession, data);
                    break;
            }
            
            // Send updated game state
            ws.send(JSON.stringify({
                type: 'gameState',
                data: playerSession.getState()
            }));
            
        } catch (error) {
            console.error('Error processing message:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid message format'
            }));
        }
    });
    
    ws.on('close', () => {
        console.log('Player disconnected');
        gameLogic.removePlayerSession(playerSession.id);
    });
});

// Handle Telegram bot commands
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Welcome to Tokenheim! Click the button below to start your adventure:', {
        reply_markup: {
            inline_keyboard: [[
                {
                    text: '🎮 Play Tokenheim',
                    web_app: { url: process.env.WEBAPP_URL }
                }
            ]]
        }
    });
});