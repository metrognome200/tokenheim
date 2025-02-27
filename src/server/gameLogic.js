class PlayerSession {
    constructor(id) {
        this.id = id;
        this.player = {
            x: 0,
            y: 0,
            health: 100,
            tokens: 0,
            inventory: []
        };
        this.currentRoom = this.generateRoom();
    }

    generateRoom() {
        return {
            type: this.getRandomRoomType(),
            enemies: this.generateEnemies(),
            tokens: this.generateTokens(),
            sigil: this.getRandomSigil()
        };
    }

    getRandomRoomType() {
        const types = ['FOMO_FOREST', 'FROSTBYTE_VAULT', 'PUMP_DUMP_CAVERNS'];
        return types[Math.floor(Math.random() * types.length)];
    }

    generateEnemies() {
        const enemies = [];
        const count = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < count; i++) {
            enemies.push({
                id: `enemy_${Date.now()}_${i}`,
                type: this.getRandomEnemyType(),
                health: 100,
                x: Math.random() * 800,
                y: Math.random() * 600
            });
        }
        
        return enemies;
    }

    getRandomEnemyType() {
        const types = ['SHILL_GOBLIN', 'HODL_YETI', 'NFT_MANCER'];
        return types[Math.floor(Math.random() * types.length)];
    }

    generateTokens() {
        const tokens = [];
        const count = Math.floor(Math.random() * 5) + 3;
        
        for (let i = 0; i < count; i++) {
            tokens.push({
                id: `token_${Date.now()}_${i}`,
                value: Math.floor(Math.random() * 10) + 1,
                x: Math.random() * 800,
                y: Math.random() * 600
            });
        }
        
        return tokens;
    }

    getRandomSigil() {
        const sigils = ['FARMING_FRENZY', 'LIQUIDITY_POOL'];
        return sigils[Math.floor(Math.random() * sigils.length)];
    }

    getState() {
        return {
            player: this.player,
            room: this.currentRoom
        };
    }
}

class GameLogic {
    constructor() {
        this.sessions = new Map();
    }

    createPlayerSession() {
        const sessionId = `session_${Date.now()}`;
        const session = new PlayerSession(sessionId);
        this.sessions.set(sessionId, session);
        return session;
    }

    removePlayerSession(sessionId) {
        this.sessions.delete(sessionId);
    }

    handlePlayerMove(session, data) {
        const { x, y } = data;
        session.player.x = x;
        session.player.y = y;
        
        this.checkCollisions(session);
    }

    handlePlayerAttack(session, data) {
        const { targetId } = data;
        const enemy = session.currentRoom.enemies.find(e => e.id === targetId);
        
        if (enemy && session.player.tokens >= 10) {
            enemy.health -= 25;
            session.player.tokens -= 10;
            
            if (enemy.health <= 0) {
                session.currentRoom.enemies = session.currentRoom.enemies.filter(e => e.id !== targetId);
                this.dropLoot(session);
            }
        }
    }

    handlePlayerSpecial(session, data) {
        if (session.player.tokens >= 20) {
            session.player.tokens -= 20;
            
            // Clear all enemies in range
            session.currentRoom.enemies = session.currentRoom.enemies.filter(enemy => {
                const distance = Math.sqrt(
                    Math.pow(enemy.x - session.player.x, 2) + 
                    Math.pow(enemy.y - session.player.y, 2)
                );
                return distance > 200;
            });
        }
    }

    handleTokenCollection(session, data) {
        const { tokenId } = data;
        const token = session.currentRoom.tokens.find(t => t.id === tokenId);
        
        if (token) {
            session.player.tokens += token.value;
            session.currentRoom.tokens = session.currentRoom.tokens.filter(t => t.id !== tokenId);
        }
    }

    checkCollisions(session) {
        // Check token collisions
        session.currentRoom.tokens = session.currentRoom.tokens.filter(token => {
            const distance = Math.sqrt(
                Math.pow(token.x - session.player.x, 2) + 
                Math.pow(token.y - session.player.y, 2)
            );
            
            if (distance < 40) {
                session.player.tokens += token.value;
                return false;
            }
            return true;
        });

        // Check enemy collisions
        session.currentRoom.enemies.forEach(enemy => {
            const distance = Math.sqrt(
                Math.pow(enemy.x - session.player.x, 2) + 
                Math.pow(enemy.y - session.player.y, 2)
            );
            
            if (distance < 50) {
                session.player.health -= 10;
            }
        });
    }

    dropLoot(session) {
        const lootTable = [
            { type: 'HODL_HAMMER', chance: 0.2 },
            { type: 'MEME_ARMOR', chance: 0.3 },
            { type: 'MOON_CANNON', chance: 0.1 },
            { type: 'RUGPULL_BOOTS', chance: 0.4 }
        ];
        
        const roll = Math.random();
        for (const item of lootTable) {
            if (roll <= item.chance) {
                session.player.inventory.push({
                    type: item.type,
                    id: `item_${Date.now()}`
                });
                break;
            }
        }
    }
}

module.exports = new GameLogic();