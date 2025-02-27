class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.player = {
            x: 0,
            y: 0,
            tokens: 0,
            health: 100,
            inventory: []
        };
        this.currentRoom = null;
        this.enemies = [];
        this.sprites = {};
        this.setupCanvas();
        this.setupEventListeners();
        this.loadAssets();
        this.gameLoop();
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleInput(e));
        document.getElementById('attack-btn').addEventListener('click', () => this.attack());
        document.getElementById('block-btn').addEventListener('click', () => this.block());
        document.getElementById('special-btn').addEventListener('click', () => this.useSpecial());
    }

    handleInput(e) {
        const speed = 5;
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
                this.player.y -= speed;
                break;
            case 'ArrowDown':
            case 's':
                this.player.y += speed;
                break;
            case 'ArrowLeft':
            case 'a':
                this.player.x -= speed;
                break;
            case 'ArrowRight':
            case 'd':
                this.player.x += speed;
                break;
            case 'i':
                this.toggleInventory();
                break;
        }
    }

    generateRoom() {
        const roomTypes = ['FOMO_FOREST', 'FROSTBYTE_VAULT', 'PUMP_DUMP_CAVERNS'];
        const type = roomTypes[Math.floor(Math.random() * roomTypes.length)];
        
        return {
            type,
            width: this.canvas.width,
            height: this.canvas.height,
            enemies: this.generateEnemies(type),
            tokens: this.generateTokens(),
            sigil: this.generateSigil()
        };
    }

    generateEnemies(roomType) {
        const enemies = [];
        const count = Math.floor(Math.random() * 3) + 1;
        
        for(let i = 0; i < count; i++) {
            const enemy = {
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                type: this.getEnemyTypeForRoom(roomType),
                health: 100
            };
            enemies.push(enemy);
        }
        return enemies;
    }

    getEnemyTypeForRoom(roomType) {
        const enemyTypes = {
            'FOMO_FOREST': 'SHILL_GOBLIN',
            'FROSTBYTE_VAULT': 'HODL_YETI',
            'PUMP_DUMP_CAVERNS': 'NFT_MANCER'
        };
        return enemyTypes[roomType];
    }

    generateTokens() {
        const tokens = [];
        const count = Math.floor(Math.random() * 5) + 3;
        
        for(let i = 0; i < count; i++) {
            tokens.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                value: Math.floor(Math.random() * 10) + 1
            });
        }
        return tokens;
    }

    generateSigil() {
        const sigils = ['FARMING_FRENZY', 'LIQUIDITY_POOL'];
        return sigils[Math.floor(Math.random() * sigils.length)];
    }

    attack() {
        if(this.player.tokens >= 10) {
            this.player.tokens -= 10;
            // Viral attack with critical hit
            this.updateUI();
            return true;
        }
        return false;
    }

    block() {
        if(this.player.tokens >= 5) {
            this.player.tokens -= 5;
            // Defensive stance
            this.updateUI();
            return true;
        }
        return false;
    }

    useSpecial() {
        if(this.player.tokens >= 20) {
            this.player.tokens -= 20;
            // Summon CryptoBro minions
            this.updateUI();
            return true;
        }
        return false;
    }

    toggleInventory() {
        const inventory = document.getElementById('inventory');
        inventory.classList.toggle('hidden');
    }

    updateUI() {
        document.getElementById('tokens').textContent = ` ${this.player.tokens}`;
        document.getElementById('health').textContent = ` ${this.player.health}`;
    }

    loadAssets() {
        // Load character sprites
        this.loadSprite('player', '/assets/characters/player.png');
        this.loadSprite('shill_goblin', '/assets/characters/enemies/shill_goblin.png');
        this.loadSprite('hodl_yeti', '/assets/characters/enemies/hodl_yeti.png');
        this.loadSprite('nft_mancer', '/assets/characters/enemies/nft_mancer.png');

        // Load item sprites
        this.loadSprite('token_normal', '/assets/items/tokens/token_normal.png');
        this.loadSprite('token_special', '/assets/items/tokens/token_special.png');
        this.loadSprite('hodl_hammer', '/assets/items/equipment/hodl_hammer.png');
        this.loadSprite('meme_armor', '/assets/items/equipment/meme_armor.png');
        this.loadSprite('moon_cannon', '/assets/items/equipment/moon_cannon.png');
        this.loadSprite('rugpull_boots', '/assets/items/equipment/rugpull_boots.png');

        // Load effect sprites
        this.loadSprite('attack_effect', '/assets/effects/attack_effect.png');
        this.loadSprite('block_effect', '/assets/effects/block_effect.png');
        this.loadSprite('special_effect', '/assets/effects/special_effect.png');
    }

    loadSprite(name, path) {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            this.sprites[name] = img;
        };
        img.onerror = () => {
            console.warn(`Failed to load sprite: ${path}`);
            // Use fallback colored rectangle if sprite fails to load
            this.sprites[name] = null;
        };
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw room
        if(this.currentRoom) {
            this.drawRoom();
        }
        
        // Draw player
        if(this.sprites.player) {
            this.ctx.drawImage(this.sprites.player, this.player.x, this.player.y, 40, 40);
        } else {
            // Fallback if sprite not loaded
            this.ctx.fillStyle = '#6c5ce7';
            this.ctx.fillRect(this.player.x, this.player.y, 40, 40);
        }

        // Draw enemies
        this.currentRoom?.enemies.forEach(enemy => {
            const sprite = this.sprites[enemy.type.toLowerCase()];
            if(sprite) {
                this.ctx.drawImage(sprite, enemy.x, enemy.y, 40, 40);
            } else {
                this.ctx.fillStyle = '#e74c3c';
                this.ctx.fillRect(enemy.x, enemy.y, 40, 40);
            }
        });

        // Draw tokens
        this.currentRoom?.tokens.forEach(token => {
            const sprite = this.sprites.token_normal;
            if(sprite) {
                this.ctx.drawImage(sprite, token.x, token.y, 20, 20);
            } else {
                this.ctx.fillStyle = '#f1c40f';
                this.ctx.fillRect(token.x, token.y, 20, 20);
            }
        });
    }

    drawRoom() {
        // Draw background based on room type
        switch(this.currentRoom.type) {
            case 'FOMO_FOREST':
                this.ctx.fillStyle = '#2ecc71';
                break;
            case 'FROSTBYTE_VAULT':
                this.ctx.fillStyle = '#74b9ff';
                break;
            case 'PUMP_DUMP_CAVERNS':
                this.ctx.fillStyle = '#e17055';
                break;
        }
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    gameLoop() {
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    start() {
        this.currentRoom = this.generateRoom();
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height / 2;
        this.updateUI();
    }
}

// Initialize game when window loads
window.addEventListener('load', () => {
    const game = new Game();
    game.start();
});