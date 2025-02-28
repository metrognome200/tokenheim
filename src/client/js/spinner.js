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
            '🍎': 1,
            '🍊': 1.5,
            '🍇': 2,
            '🍓': 2.5,
            '💎': 5,
            '⭐': 10,
            '7️⃣': 15,
            '🎰': 20
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
        this.spinButton.addEventListener('click', () => this.spin());
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
        this.isSpinning = false;
    }

    async animateSpinners() {
        const spinDurations = [2000, 2200, 2400]; // Different durations for each spinner
        const results = [];

        const animations = this.spinners.map((spinner, index) => {
            return new Promise(resolve => {
                const content = spinner.querySelector('.spinner-content');
                const symbolHeight = spinner.offsetHeight / 3;
                let currentOffset = 0;

                const animate = (timestamp) => {
                    currentOffset = (currentOffset + 10) % (symbolHeight * this.symbols.length);
                    content.style.transform = `translateY(${-currentOffset}px)`;

                    if (timestamp < startTime + spinDurations[index]) {
                        requestAnimationFrame(animate);
                    } else {
                        // Snap to final position
                        const finalSymbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
                        const finalIndex = this.symbols.indexOf(finalSymbol);
                        content.style.transform = `translateY(${-finalIndex * symbolHeight}px)`;
                        results[index] = finalSymbol;
                        resolve();
                    }
                };

                const startTime = performance.now();
                requestAnimationFrame(animate);
            });
        });

        await Promise.all(animations);
        return results;
    }

    calculateWin(results) {
        // Check for matches
        if (results[0] === results[1] && results[1] === results[2]) {
            // Three of a kind
            return this.currentBet * this.currentMultiplier * this.symbolValues[results[0]] * 3;
        } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
            // Two of a kind
            return this.currentBet * this.currentMultiplier * 1.5;
        }
        return 0;
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
