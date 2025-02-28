class Dashboard {
    constructor() {
        this.playerData = {
            name: 'Warrior',
            level: 1,
            exp: 0,
            tokens: 0,
            stats: {
                dungeonsCleared: 0,
                enemiesDefeated: 0,
                tokensCollected: 0
            },
            achievements: []
        };
        this.loadPlayerData();
        this.initializeUI();
    }

    loadPlayerData() {
        // Load from localStorage or server
        const savedData = localStorage.getItem('playerData');
        if (savedData) {
            this.playerData = JSON.parse(savedData);
        }
        this.updateUI();
    }

    savePlayerData() {
        localStorage.setItem('playerData', JSON.stringify(this.playerData));
    }

    initializeUI() {
        // Initialize Telegram WebApp
        window.Telegram.WebApp.ready();
        const webapp = window.Telegram.WebApp;
        
        // Set theme
        document.body.classList.add(webapp.colorScheme);
        
        // Update player name if available from Telegram
        if (webapp.initDataUnsafe?.user?.username) {
            this.playerData.name = webapp.initDataUnsafe.user.username;
            document.getElementById('player-name').textContent = this.playerData.name;
        }

        this.updateUI();
        this.setupEventListeners();
    }

    updateUI() {
        // Update player info
        document.getElementById('player-name').textContent = this.playerData.name;
        document.getElementById('player-level').textContent = this.playerData.level;
        document.getElementById('total-tokens').textContent = this.playerData.tokens;
        document.getElementById('exp-points').textContent = this.playerData.exp;

        // Update stats
        document.getElementById('dungeons-cleared').textContent = this.playerData.stats.dungeonsCleared;
        document.getElementById('enemies-defeated').textContent = this.playerData.stats.enemiesDefeated;
        document.getElementById('tokens-collected').textContent = this.playerData.stats.tokensCollected;

        // Update achievements
        this.updateAchievements();
    }

    updateAchievements() {
        const container = document.getElementById('achievements-container');
        container.innerHTML = '';

        if (this.playerData.achievements.length === 0) {
            container.innerHTML = '<div class="empty-state">No achievements yet. Start playing to earn some!</div>';
            return;
        }

        this.playerData.achievements.forEach(achievement => {
            const achievementEl = document.createElement('div');
            achievementEl.className = 'achievement-item';
            achievementEl.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-details">
                    <h4>${achievement.title}</h4>
                    <p>${achievement.description}</p>
                </div>
            `;
            container.appendChild(achievementEl);
        });
    }

    setupEventListeners() {
        // Shop button
        document.querySelector('button[onclick="openShop()"]').addEventListener('click', () => {
            this.openShop();
        });

        // Inventory button
        document.querySelector('button[onclick="openInventory()"]').addEventListener('click', () => {
            this.openInventory();
        });
    }

    openShop() {
        // Implement shop functionality
        console.log('Opening shop...');
        // You can create a modal or navigate to a new page
    }

    openInventory() {
        // Implement inventory functionality
        console.log('Opening inventory...');
        // You can create a modal or navigate to a new page
    }
}

// Initialize dashboard when page loads
window.addEventListener('load', () => {
    window.dashboard = new Dashboard();
});
