class Dashboard {
    constructor() {
        this.stats = {
            tokens: 1000,
            level: 1,
            biggestWin: 0,
            totalSpins: 0,
            wins: 0,
            currentStreak: 0,
            bestStreak: 0,
            achievements: {
                bigWin: 0,      // Progress towards 1000 token win
                jackpot: 0,     // Progress towards three 7s
                hotStreak: 0    // Progress towards 5 wins in a row
            }
        };

        this.initializeElements();
        this.loadStats();
        this.updateDisplay();
    }

    initializeElements() {
        // Stats display elements
        this.tokenDisplay = document.getElementById('total-tokens');
        this.levelDisplay = document.getElementById('player-level');
        this.biggestWinDisplay = document.getElementById('biggest-win');
        this.totalSpinsDisplay = document.getElementById('total-spins');
        this.winRateDisplay = document.getElementById('win-rate');
        this.activityFeed = document.getElementById('activity-feed');

        // Achievement elements
        this.achievementBars = document.querySelectorAll('.achievement .progress-bar');
    }

    loadStats() {
        const savedStats = localStorage.getItem('tokenheimStats');
        if (savedStats) {
            this.stats = JSON.parse(savedStats);
        }
    }

    saveStats() {
        localStorage.setItem('tokenheimStats', JSON.stringify(this.stats));
    }

    updateDisplay() {
        // Update basic stats
        this.tokenDisplay.textContent = this.stats.tokens;
        this.levelDisplay.textContent = this.stats.level;
        this.biggestWinDisplay.textContent = this.stats.biggestWin;
        this.totalSpinsDisplay.textContent = this.stats.totalSpins;
        
        // Calculate and update win rate
        const winRate = this.stats.totalSpins > 0 
            ? ((this.stats.wins / this.stats.totalSpins) * 100).toFixed(1)
            : '0.0';
        this.winRateDisplay.textContent = winRate + '%';

        // Update achievement progress
        this.updateAchievements();
    }

    updateAchievements() {
        // Big Win Achievement (1000 tokens) - Max progress at 1000
        this.achievementBars[0].style.width = 
            Math.min((this.stats.biggestWin / 1000) * 100, 100) + '%';

        // Jackpot Achievement (Three 7s) - Binary achievement
        this.achievementBars[1].style.width = 
            (this.stats.achievements.jackpot > 0 ? 100 : 0) + '%';

        // Hot Streak Achievement (5 wins in a row) - Progress based on current streak
        this.achievementBars[2].style.width = 
            Math.min((this.stats.currentStreak / 5) * 100, 100) + '%';
    }

    addActivityItem(message, type = 'neutral') {
        const item = document.createElement('div');
        item.className = `activity-item ${type}`;
        item.innerHTML = `
            <span class="activity-time">${new Date().toLocaleTimeString()}</span>
            <span class="activity-message">${message}</span>
        `;

        this.activityFeed.insertBefore(item, this.activityFeed.firstChild);
        if (this.activityFeed.children.length > 5) {
            this.activityFeed.removeChild(this.activityFeed.lastChild);
        }
    }

    updateStats(gameResult) {
        // Update basic stats
        this.stats.tokens = gameResult.tokens;
        this.stats.totalSpins++;
        
        if (gameResult.win > 0) {
            this.stats.wins++;
            this.stats.currentStreak++;
            this.stats.bestStreak = Math.max(this.stats.bestStreak, this.stats.currentStreak);
            
            if (gameResult.win > this.stats.biggestWin) {
                this.stats.biggestWin = gameResult.win;
                this.addActivityItem(`New Biggest Win: ${gameResult.win} tokens! 🎉`, 'positive');
            }

            // Check for achievements
            if (gameResult.win >= 1000) {
                this.stats.achievements.bigWin = 1;
                this.addActivityItem('Achievement Unlocked: Big Winner! 🏆', 'achievement');
            }

            if (gameResult.symbols.every(s => s === '7️⃣')) {
                this.stats.achievements.jackpot = 1;
                this.addActivityItem('Achievement Unlocked: Jackpot Master! 🎰', 'achievement');
            }

            if (this.stats.currentStreak >= 5) {
                this.stats.achievements.hotStreak = 1;
                this.addActivityItem('Achievement Unlocked: Hot Streak! 🔥', 'achievement');
            }

        } else {
            this.stats.currentStreak = 0;
        }

        // Level up system (every 1000 tokens earned)
        const newLevel = Math.floor(this.stats.tokens / 1000) + 1;
        if (newLevel > this.stats.level) {
            this.stats.level = newLevel;
            this.addActivityItem(`Level Up! You're now level ${newLevel} 🌟`, 'positive');
        }

        this.saveStats();
        this.updateDisplay();
    }
}

// Initialize dashboard when page loads
window.addEventListener('load', () => {
    const dashboard = new Dashboard();
    
    // Listen for game results from localStorage
    window.addEventListener('storage', (e) => {
        if (e.key === 'gameResult') {
            const gameResult = JSON.parse(e.newValue);
            dashboard.updateStats(gameResult);
            localStorage.removeItem('gameResult'); // Clear the result
        }
    });
});
