class GameSystem {
    constructor() {
        this.player = null;
        this.currentQuest = null;
        this.worldState = {
            events: [],
            activeBuffs: [],
            weather: 'normal',
            timeOfDay: 'day'
        };
        this.questSystem = new QuestSystem();
        this.combatSystem = new CombatSystem();
        this.economySystem = new EconomySystem();
    }
}

class Character {
    constructor(type) {
        this.level = 1;
        this.exp = 0;
        this.class = type;
        this.skills = [];
        this.stats = this.getBaseStats(type);
        this.equipment = {
            weapon: null,
            armor: null,
            accessory1: null,
            accessory2: null
        };
        this.currencies = {
            tokens: 0,
            premiumShards: 0,
            governancePoints: 0
        };
    }

    getBaseStats(type) {
        const baseStats = {
            'Miner': {
                strength: 5,
                magic: 3,
                tokenFind: 8,
                defense: 6
            },
            'DeFi Mage': {
                strength: 3,
                magic: 8,
                tokenFind: 5,
                defense: 4
            },
            'Chain Warrior': {
                strength: 8,
                magic: 2,
                tokenFind: 4,
                defense: 7
            },
            'NFT Ranger': {
                strength: 6,
                magic: 6,
                tokenFind: 6,
                defense: 5
            }
        };
        return baseStats[type];
    }

    levelUp() {
        this.level++;
        this.updateStats();
        this.checkNewSkills();
        return this.getNewSkillsForLevel(this.level);
    }
}

class CombatSystem {
    constructor() {
        this.combo = 0;
        this.ultimateCharge = 0;
        this.activeBuffs = new Set();
    }

    attack(player, target, type) {
        let damage = this.calculateDamage(player, type);
        
        // Combo system
        if (this.combo > 0) {
            damage *= (1 + (this.combo * 0.1));
        }
        
        // Element system
        const elementMultiplier = this.getElementalMultiplier(type, target.element);
        damage *= elementMultiplier;

        // Critical hit system
        if (Math.random() < player.stats.criticalChance) {
            damage *= 2;
            this.createFloatingText('Critical!', target.position, 'red');
        }

        return damage;
    }

    useUltimate(player) {
        if (this.ultimateCharge >= 100) {
            const ultimate = player.ultimate;
            this.ultimateCharge = 0;
            return this.executeUltimate(ultimate);
        }
        return false;
    }
}

class QuestSystem {
    constructor() {
        this.activeQuests = new Map();
        this.completedQuests = new Set();
        this.dailyQuests = new Map();
    }

    generateDailyQuests() {
        const questTypes = [
            'Kill X Enemies',
            'Collect X Tokens',
            'Visit X Different Areas',
            'Trade X Items',
            'Win X PvP Battles',
            'Complete X Mini-games'
        ];

        this.dailyQuests.clear();
        for (let i = 0; i < 3; i++) {
            const type = questTypes[Math.floor(Math.random() * questTypes.length)];
            const quest = this.createQuest(type);
            this.dailyQuests.set(quest.id, quest);
        }
    }

    createQuest(type) {
        return {
            id: crypto.randomUUID(),
            type,
            progress: 0,
            target: this.getQuestTarget(type),
            rewards: this.generateRewards(type)
        };
    }
}

class EconomySystem {
    constructor() {
        this.marketItems = new Map();
        this.craftingRecipes = new Map();
        this.exchangeRates = {
            tokenToShard: 1000,
            shardToGovernance: 100
        };
    }

    craft(recipe, player) {
        if (!this.hasIngredients(recipe, player)) {
            return false;
        }

        this.removeIngredients(recipe, player);
        const item = this.createItem(recipe);
        
        // Random chance for bonus quality
        if (Math.random() < player.stats.craftingLuck) {
            item.quality++;
        }

        return item;
    }

    startStaking(amount, player) {
        if (player.currencies.tokens < amount) {
            return false;
        }

        player.currencies.tokens -= amount;
        this.addStakingReward(player, amount);
        return true;
    }
}

// Initialize game systems
window.addEventListener('load', () => {
    window.gameSystem = new GameSystem();
});
