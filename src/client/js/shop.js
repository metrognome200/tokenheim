class Shop {
    constructor() {
        this.items = {
            weapons: [
                {
                    id: 'moon_cannon',
                    name: 'Moon Cannon',
                    description: 'Powerful weapon that harnesses lunar energy',
                    price: 1000,
                    image: 'assets/items/equipment/moon_cannon.png',
                    stats: { damage: 50, range: 30 },
                    category: 'weapons'
                },
                {
                    id: 'hodl_hammer',
                    name: 'HODL Hammer',
                    description: 'Legendary hammer that grows stronger the longer you hold it',
                    price: 800,
                    image: 'assets/items/equipment/hodl_hammer.png',
                    stats: { damage: 40, staking: 10 },
                    category: 'weapons'
                }
            ],
            armor: [
                {
                    id: 'meme_armor',
                    name: 'Meme Armor',
                    description: 'Armor forged from the strongest memes',
                    price: 750,
                    image: 'assets/items/equipment/meme_armor.png',
                    stats: { defense: 30, viralResistance: 20 },
                    category: 'armor'
                },
                {
                    id: 'rugpull_boots',
                    name: 'Rugpull Boots',
                    description: 'Boots that let you escape from any situation',
                    price: 500,
                    image: 'assets/items/equipment/rugpull_boots.png',
                    stats: { speed: 20, evasion: 15 },
                    category: 'armor'
                }
            ],
            potions: [
                {
                    id: 'fomo_potion',
                    name: 'FOMO Potion',
                    description: 'Temporarily increases all stats',
                    price: 200,
                    image: 'assets/items/potions/fomo_potion.png',
                    stats: { duration: 60, boost: 25 },
                    category: 'potions'
                },
                {
                    id: 'dip_elixir',
                    name: 'Buy The Dip Elixir',
                    description: 'Recovers health when your HP is low',
                    price: 150,
                    image: 'assets/items/potions/dip_elixir.png',
                    stats: { healing: 50 },
                    category: 'potions'
                }
            ],
            special: [
                {
                    id: 'diamond_hands',
                    name: 'Diamond Hands',
                    description: 'Legendary artifact that prevents token loss',
                    price: 2000,
                    image: 'assets/items/special/diamond_hands.png',
                    stats: { tokenProtection: 100 },
                    category: 'special'
                }
            ]
        };

        this.currentCategory = 'weapons';
        this.playerData = null;
        this.loadPlayerData();
        this.initializeUI();
    }

    loadPlayerData() {
        const savedData = localStorage.getItem('playerData');
        if (savedData) {
            this.playerData = JSON.parse(savedData);
        } else {
            this.playerData = {
                tokens: 1000,
                inventory: [],
                equipped: {}
            };
        }
        this.updateTokenDisplay();
    }

    savePlayerData() {
        localStorage.setItem('playerData', JSON.stringify(this.playerData));
    }

    initializeUI() {
        // Initialize Telegram WebApp
        window.Telegram.WebApp.ready();
        
        // Set up category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchCategory(btn.dataset.category));
        });

        // Display initial items
        this.displayItems(this.currentCategory);

        // Set up modal events
        document.getElementById('cancel-purchase').addEventListener('click', () => {
            document.getElementById('purchase-modal').classList.add('hidden');
        });

        document.getElementById('confirm-purchase').addEventListener('click', () => {
            const itemId = document.getElementById('confirm-purchase').dataset.itemId;
            this.purchaseItem(itemId);
        });
    }

    switchCategory(category) {
        this.currentCategory = category;
        
        // Update active button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });

        this.displayItems(category);
    }

    displayItems(category) {
        const container = document.getElementById('shop-items');
        container.innerHTML = '';

        this.items[category].forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'shop-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="item-image">
                <div class="item-info">
                    <h3 class="item-name">${item.name}</h3>
                    <p class="item-description">${item.description}</p>
                </div>
                <div class="item-footer">
                    <div class="item-price">
                        <img src="assets/ui/token.png" alt="Tokens" class="currency-icon">
                        <span>${item.price}</span>
                    </div>
                    <button class="buy-btn" onclick="shop.showPurchaseModal('${item.id}')"
                            ${this.playerData.tokens < item.price ? 'disabled' : ''}>
                        Buy
                    </button>
                </div>
            `;
            container.appendChild(itemElement);
        });
    }

    showPurchaseModal(itemId) {
        const item = this.findItem(itemId);
        if (!item) return;

        const modal = document.getElementById('purchase-modal');
        document.getElementById('modal-item-image').src = item.image;
        document.getElementById('modal-item-name').textContent = item.name;
        document.getElementById('modal-item-description').textContent = item.description;
        document.getElementById('modal-item-price').textContent = item.price;
        document.getElementById('confirm-purchase').dataset.itemId = itemId;

        modal.classList.remove('hidden');
    }

    findItem(itemId) {
        for (const category in this.items) {
            const item = this.items[category].find(item => item.id === itemId);
            if (item) return item;
        }
        return null;
    }

    purchaseItem(itemId) {
        const item = this.findItem(itemId);
        if (!item) return;

        if (this.playerData.tokens >= item.price) {
            // Deduct tokens
            this.playerData.tokens -= item.price;
            
            // Add to inventory
            this.playerData.inventory.push({
                id: item.id,
                purchaseDate: new Date().toISOString(),
                stats: item.stats
            });

            // Save changes
            this.savePlayerData();
            this.updateTokenDisplay();
            this.displayItems(this.currentCategory);

            // Close modal
            document.getElementById('purchase-modal').classList.add('hidden');

            // Show success message
            this.showNotification(`Successfully purchased ${item.name}!`);
        }
    }

    updateTokenDisplay() {
        document.getElementById('player-tokens').textContent = this.playerData.tokens;
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, 2000);
    }
}

// Initialize shop when page loads
window.addEventListener('load', () => {
    window.shop = new Shop();
});
