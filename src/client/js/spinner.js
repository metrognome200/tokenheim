class SpinnerGame {
    constructor() {
        this.tokens = 1000;
        this.currentBet = 10;
        this.currentMultiplier = 1;
        this.isSpinning = false;
        this.spinHistory = [];
        this.maxHistory = 10;
        this.symbols = ['🍎', '🍊', '🍇', '🍓', '💎', '⭐', '7️⃣', '🎰'];
        this.symbolValues = {
            '🍎': 2,    // Base win 2x
            '🍊': 3,    // Base win 3x
            '🍇': 4,    // Base win 4x
            '🍓': 5,    // Base win 5x
            '💎': 10,   // Base win 10x
            '⭐': 15,   // Base win 15x
            '7️⃣': 20,   // Base win 20x
            '🎰': 50    // Base win 50x
        };

        this.initializeElements();
        this.setupEventListeners();
        this.updateDisplay();
    }

    initializeElements() {
        // Spinners
        this.spinners = [
            document.getElementById('spinner1'),
            document.getElementById('spinner2'),
            document.getElementById('spinner3')
        ];

        // Controls
        this.spinButton = document.getElementById('spin-btn');
        this.decreaseBetBtn = document.getElementById('decrease-bet');
        this.increaseBetBtn = document.getElementById('increase-bet');
        this.decreaseMultiBtn = document.getElementById('decrease-multi');
        this.increaseMultiBtn = document.getElementById('increase-multi');

        // Display elements
        this.tokenDisplay = document.getElementById('tokens');
        this.betDisplay = document.getElementById('current-bet');
        this.multiDisplay = document.getElementById('current-multi');
        this.spinHistoryContainer = document.getElementById('spin-history');
        this.winPopup = document.getElementById('win-popup');
        this.winAmount = document.getElementById('win-amount');
        this.collectBtn = document.getElementById('collect-btn');

        // Initialize spinners with symbols
        this.spinners.forEach(spinner => {
            this.createSpinnerContent(spinner);
        });
    }

    createSpinnerContent(spinner) {
        spinner.innerHTML = ''; // Clear existing content
        const content = document.createElement('div');
        content.className = 'spinner-content';
        this.symbols.forEach(symbol => {
            const symbolElement = document.createElement('div');
            symbolElement.className = 'symbol';
            symbolElement.textContent = symbol;
            content.appendChild(symbolElement);
        });
        spinner.appendChild(content);
    }

    setupEventListeners() {
        this.spinButton.addEventListener('click', () => {
            if (!this.isSpinning) {
                this.spin();
            }
        });
        
        this.decreaseBetBtn.addEventListener('click', () => this.adjustBet(-10));
        this.increaseBetBtn.addEventListener('click', () => this.adjustBet(10));
        this.decreaseMultiBtn.addEventListener('click', () => this.adjustMultiplier(-1));
        this.increaseMultiBtn.addEventListener('click', () => this.adjustMultiplier(1));
        this.collectBtn.addEventListener('click', () => this.hideWinPopup());
    }

    adjustBet(amount) {
        const newBet = this.currentBet + amount;
        if (newBet >= 10 && newBet <= this.tokens) {
            this.currentBet = newBet;
            this.updateDisplay();
        }
    }

    adjustMultiplier(amount) {
        const newMulti = this.currentMultiplier + amount;
        if (newMulti >= 1 && newMulti <= 10 && (this.currentBet * newMulti <= this.tokens)) {
            this.currentMultiplier = newMulti;
            this.updateDisplay();
        }
    }

    updateDisplay() {
        this.tokenDisplay.textContent = this.tokens;
        this.betDisplay.textContent = this.currentBet;
        this.multiDisplay.textContent = `x${this.currentMultiplier}`;
        
        // Update button states
        this.decreaseBetBtn.disabled = this.currentBet <= 10;
        this.increaseBetBtn.disabled = this.currentBet >= this.tokens;
        this.decreaseMultiBtn.disabled = this.currentMultiplier <= 1;
        this.increaseMultiBtn.disabled = this.currentMultiplier >= 10;
        this.spinButton.disabled = this.isSpinning || (this.currentBet * this.currentMultiplier > this.tokens);
    }

    async spin() {
        if (this.isSpinning || this.currentBet * this.currentMultiplier > this.tokens) return;

        this.isSpinning = true;
        this.spinButton.disabled = true;
        this.tokens -= this.currentBet * this.currentMultiplier;
        this.updateDisplay();

        const results = await this.animateSpinners();
        const winAmount = this.calculateWin(results);
        
        if (winAmount > 0) {
            this.tokens += winAmount;
            this.showWinPopup(winAmount);
        }

        this.addToHistory(results, winAmount);
        this.updateDisplay();
        
        // Save game result for dashboard
        localStorage.setItem('gameResult', JSON.stringify({
            tokens: this.tokens,
            win: winAmount,
            symbols: results
        }));

        this.isSpinning = false;
        this.spinButton.disabled = false;
    }

    async animateSpinners() {
        const results = [];
        const promises = this.spinners.map((spinner, index) => {
            return new Promise(resolve => {
                const content = spinner.querySelector('.spinner-content');
                const duration = 2000 + (index * 200); // Staggered stop times
                const startTime = performance.now();
                
                const animate = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // Easing function for smooth slowdown
                    const easeOut = 1 - Math.pow(1 - progress, 3);
                    
                    // Calculate total spins based on duration
                    const totalSpins = 5 + index;
                    const currentRotation = (totalSpins * easeOut) * (this.symbols.length * 100);
                    
                    content.style.transform = `translateY(${-currentRotation % (100 * this.symbols.length)}px)`;

                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        // Select final symbol
                        const finalSymbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
                        const finalIndex = this.symbols.indexOf(finalSymbol);
                        content.style.transform = `translateY(${-finalIndex * 100}px)`;
                        results[index] = finalSymbol;
                        resolve();
                    }
                };

                requestAnimationFrame(animate);
            });
        });

        await Promise.all(promises);
        return results;
    }

    calculateWin(results) {
        let winMultiplier = 0;
        
        // Count symbol occurrences
        const symbolCount = results.reduce((count, symbol) => {
            count[symbol] = (count[symbol] || 0) + 1;
            return count;
        }, {});

        // Find the most frequent symbol
        const maxCount = Math.max(...Object.values(symbolCount));
        const winningSymbol = Object.keys(symbolCount).find(symbol => symbolCount[symbol] === maxCount);

        // Calculate win based on matches
        if (maxCount === 3) {
            // Three of a kind
            winMultiplier = this.symbolValues[winningSymbol] * 3;
        } else if (maxCount === 2) {
            // Two of a kind
            winMultiplier = this.symbolValues[winningSymbol] * 1.5;
        }

        return Math.floor(this.currentBet * this.currentMultiplier * winMultiplier);
    }

    showWinPopup(amount) {
        this.winAmount.textContent = amount;
        this.winPopup.classList.remove('hidden');
    }

    hideWinPopup() {
        this.winPopup.classList.add('hidden');
    }

    addToHistory(results, winAmount) {
        const historyItem = document.createElement('div');
        historyItem.className = `spin-result ${winAmount > 0 ? 'win' : 'loss'}`;
        historyItem.innerHTML = `
            <div class="symbols">${results.join('')}</div>
            <div class="result">${winAmount > 0 ? '+' + winAmount : '-' + (this.currentBet * this.currentMultiplier)}</div>
        `;

        this.spinHistory.unshift({ results, winAmount });
        if (this.spinHistory.length > this.maxHistory) {
            this.spinHistory.pop();
        }

        this.spinHistoryContainer.insertBefore(historyItem, this.spinHistoryContainer.firstChild);
        if (this.spinHistoryContainer.children.length > this.maxHistory) {
            this.spinHistoryContainer.removeChild(this.spinHistoryContainer.lastChild);
        }
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    const game = new SpinnerGame();
});
