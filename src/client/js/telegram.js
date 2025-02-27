class TelegramManager {
    constructor() {
        this.tg = window.Telegram.WebApp;
        this.init();
    }

    init() {
        // Initialize Telegram WebApp
        this.tg.ready();
        
        // Set up theme
        this.applyTheme();
        
        // Enable closing confirmation
        this.tg.enableClosingConfirmation();
        
        // Set up main button
        this.setupMainButton();
        
        // Handle viewport changes
        this.handleViewport();
    }

    applyTheme() {
        document.body.style.backgroundColor = this.tg.backgroundColor;
        document.documentElement.style.setProperty('--text-color', this.tg.themeParams.text_color);
        document.documentElement.style.setProperty('--bg-color', this.tg.themeParams.bg_color);
    }

    setupMainButton() {
        this.tg.MainButton.setText('Start Game')
            .show()
            .onClick(() => {
                this.tg.MainButton.hide();
                document.getElementById('action-buttons').classList.remove('hidden');
            });
    }

    handleViewport() {
        this.tg.onEvent('viewportChanged', () => {
            const gameCanvas = document.getElementById('gameCanvas');
            if (gameCanvas) {
                gameCanvas.width = window.innerWidth;
                gameCanvas.height = window.innerHeight;
            }
        });
    }

    showAlert(message) {
        this.tg.showAlert(message);
    }

    showConfirm(message) {
        return this.tg.showConfirm(message);
    }

    sendData(data) {
        this.tg.sendData(JSON.stringify(data));
    }

    hapticFeedback(type = 'medium') {
        switch(type) {
            case 'light':
                this.tg.HapticFeedback.impactOccurred('light');
                break;
            case 'medium':
                this.tg.HapticFeedback.impactOccurred('medium');
                break;
            case 'heavy':
                this.tg.HapticFeedback.impactOccurred('heavy');
                break;
            case 'success':
                this.tg.HapticFeedback.notificationOccurred('success');
                break;
            case 'error':
                this.tg.HapticFeedback.notificationOccurred('error');
                break;
        }
    }

    getUserInfo() {
        return this.tg.initDataUnsafe?.user || null;
    }
}

// Initialize Telegram manager
const telegramManager = new TelegramManager();