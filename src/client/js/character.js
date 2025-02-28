class Character {
    constructor(type) {
        this.type = type;
        this.level = 1;
        this.exp = 0;
        this.expToNext = 100;
        this.gold = 0;
        this.gems = 0;
        this.stats = this.getBaseStats();
        this.abilities = this.getClassAbilities();
        this.equipment = {
            weapon: null,
            armor: null,
            accessory: null
        };
        this.skillPoints = 0;
    }

    getBaseStats() {
        const baseStats = {
            Warrior: {
                health: 150,
                attack: 15,
                defense: 12,
                speed: 8,
                critChance: 0.05
            },
            Archer: {
                health: 100,
                attack: 18,
                defense: 8,
                speed: 12,
                critChance: 0.1
            },
            Mage: {
                health: 90,
                attack: 20,
                defense: 6,
                speed: 9,
                critChance: 0.05
            },
            Rogue: {
                health: 110,
                attack: 16,
                defense: 7,
                speed: 15,
                critChance: 0.15
            }
        };
        return baseStats[this.type];
    }

    getClassAbilities() {
        const abilities = {
            Warrior: [
                {
                    name: 'Mighty Slash',
                    damage: 20,
                    cooldown: 3,
                    description: 'A powerful slash that deals heavy damage',
                    unlockLevel: 1
                },
                {
                    name: 'Shield Wall',
                    effect: 'defense_up',
                    duration: 5,
                    cooldown: 8,
                    description: 'Increases defense for 5 seconds',
                    unlockLevel: 3
                },
                {
                    name: 'Whirlwind',
                    damage: 15,
                    aoe: true,
                    cooldown: 6,
                    description: 'Spin attack that hits all nearby enemies',
                    unlockLevel: 5
                }
            ],
            Archer: [
                {
                    name: 'Precise Shot',
                    damage: 25,
                    cooldown: 4,
                    description: 'A precise shot with high critical chance',
                    unlockLevel: 1
                },
                {
                    name: 'Rain of Arrows',
                    damage: 12,
                    aoe: true,
                    cooldown: 7,
                    description: 'Shoot multiple arrows in an area',
                    unlockLevel: 3
                },
                {
                    name: 'Eagle Eye',
                    effect: 'crit_up',
                    duration: 5,
                    cooldown: 10,
                    description: 'Increases critical hit chance',
                    unlockLevel: 5
                }
            ],
            Mage: [
                {
                    name: 'Fireball',
                    damage: 30,
                    cooldown: 4,
                    description: 'Launch a powerful fireball',
                    unlockLevel: 1
                },
                {
                    name: 'Ice Shield',
                    effect: 'shield',
                    duration: 4,
                    cooldown: 8,
                    description: 'Create a protective ice barrier',
                    unlockLevel: 3
                },
                {
                    name: 'Lightning Storm',
                    damage: 20,
                    aoe: true,
                    cooldown: 10,
                    description: 'Call down lightning on all enemies',
                    unlockLevel: 5
                }
            ],
            Rogue: [
                {
                    name: 'Backstab',
                    damage: 35,
                    cooldown: 5,
                    description: 'A powerful strike from behind',
                    unlockLevel: 1
                },
                {
                    name: 'Smoke Bomb',
                    effect: 'stealth',
                    duration: 3,
                    cooldown: 8,
                    description: 'Become invisible for a short time',
                    unlockLevel: 3
                },
                {
                    name: 'Shadow Strike',
                    damage: 25,
                    effect: 'bleed',
                    cooldown: 7,
                    description: 'Strike from the shadows causing bleeding',
                    unlockLevel: 5
                }
            ]
        };
        return abilities[this.type];
    }

    gainExp(amount) {
        this.exp += amount;
        while (this.exp >= this.expToNext) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.exp -= this.expToNext;
        this.expToNext = Math.floor(this.expToNext * 1.5);
        this.skillPoints += 2;
        this.updateStats();
        
        // Check for new ability unlocks
        const newAbilities = this.abilities.filter(ability => ability.unlockLevel === this.level);
        return {
            levelUp: true,
            newLevel: this.level,
            skillPoints: 2,
            newAbilities
        };
    }

    updateStats() {
        const baseStats = this.getBaseStats();
        for (let stat in baseStats) {
            this.stats[stat] = Math.floor(baseStats[stat] * (1 + (this.level - 1) * 0.1));
        }
    }

    useAbility(abilityName) {
        const ability = this.abilities.find(a => a.name === abilityName);
        if (!ability) return null;

        return {
            ...ability,
            damage: ability.damage ? Math.floor(ability.damage * (1 + this.stats.attack / 100)) : 0
        };
    }

    equipItem(item, slot) {
        if (this.equipment[slot]) {
            this.unequipItem(slot);
        }
        this.equipment[slot] = item;
        this.updateStats();
    }

    unequipItem(slot) {
        const item = this.equipment[slot];
        this.equipment[slot] = null;
        this.updateStats();
        return item;
    }
}
