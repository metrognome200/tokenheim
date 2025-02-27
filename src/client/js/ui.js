class UI {
    constructor() {
        this.elements = {
            playerStats: document.getElementById('player-stats'),
            tokens: document.getElementById('tokens'),
            health: document.getElementById('health'),
            actionButtons: document.getElementById('action-buttons'),
            inventory: document.getElementById('inventory'),
            inventoryGrid: document.getElementById('inventory-grid')
        };
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Attack button
        document.getElementById('attack-btn').addEventListener('click', () => {
            telegramManager.hapticFeedback('medium');
            this.handleAttack();
        });

        // Block button
        document.getElementById('block-btn').addEventListener('click', () => {
            telegramManager.hapticFeedback('light');
            this.handleBlock();
        });

        // Special button
        document.getElementById('special-btn').addEventListener('click', () => {
            telegramManager.hapticFeedback('heavy');
            this.handleSpecial();
        });
    }

    handleAttack() {
        if (!game.attack()) {
            telegramManager.showAlert('Not enough tokens! Need 10 ');
            telegramManager.hapticFeedback('error');
        } else {
            this.showDamageEffect();
        }
    }

    handleBlock() {
        if (!game.block()) {
            telegramManager.showAlert('Not enough tokens! Need 5 ');
            telegramManager.hapticFeedback('error');
        } else {
            this.showBlockEffect();
        }
    }

    handleSpecial() {
        if (!game.useSpecial()) {
            telegramManager.showAlert('Not enough tokens! Need 20 ');
            telegramManager.hapticFeedback('error');
        } else {
            this.showSpecialEffect();
        }
    }

    showDamageEffect() {
        const effect = document.createElement('div');
        effect.className = 'damage-effect';
        effect.textContent = '';
        document.body.appendChild(effect);
        
        setTimeout(() => {
            effect.remove();
        }, 500);
    }

    showBlockEffect() {
        const effect = document.createElement('div');
        effect.className = 'block-effect';
        effect.textContent = '';
        document.body.appendChild(effect);
        
        setTimeout(() => {
            effect.remove();
        }, 500);
    }

    showSpecialEffect() {
        const effect = document.createElement('div');
        effect.className = 'special-effect pulse';
        effect.textContent = '';
        document.body.appendChild(effect);
        
        setTimeout(() => {
            effect.remove();
        }, 1000);
    }

    updateInventory(items) {
        this.elements.inventoryGrid.innerHTML = '';
        
        items.forEach(item => {
            const slot = document.createElement('div');
            slot.className = 'item-slot';
            slot.innerHTML = `
                <div class="item" data-type="${item.type}">
                    ${this.getItemEmoji(item.type)}
                </div>
            `;
            this.elements.inventoryGrid.appendChild(slot);
        });
    }

    getItemEmoji(type) {
        const emojis = {
            'HODL_HAMMER': '',
            'MEME_ARMOR': '',
            'MOON_CANNON': '',
            'RUGPULL_BOOTS': ''
        };
        return emojis[type] || '';
    }

    showMessage(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    toggleLoadingScreen(show) {
        const loading = document.getElementById('loading-screen');
        if (show) {
            loading?.classList.remove('hidden');
        } else {
            loading?.classList.add('hidden');
        }
    }
}

// Initialize UI
const ui = new UI();