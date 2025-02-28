class WorldGenerator {
    constructor() {
        this.areas = {
            'Forest of Whispers': {
                minLevel: 1,
                maxLevel: 5,
                background: '#2d5a27',
                enemies: ['Wolf', 'Bandit', 'Giant Spider'],
                obstacles: ['tree', 'rock', 'bush'],
                treasures: ['wood_chest', 'herb_patch'],
                music: 'forest_theme.mp3',
                ambientSounds: ['wind', 'leaves', 'birds']
            },
            'Crystal Caves': {
                minLevel: 4,
                maxLevel: 8,
                background: '#1a3b5c',
                enemies: ['Cave Bat', 'Crystal Golem', 'Dark Dwarf'],
                obstacles: ['crystal', 'stalagmite', 'rock_pile'],
                treasures: ['crystal_deposit', 'gem_cluster'],
                music: 'cave_theme.mp3',
                ambientSounds: ['dripping', 'crystal_hum']
            },
            'Ancient Ruins': {
                minLevel: 7,
                maxLevel: 12,
                background: '#4a4a4a',
                enemies: ['Stone Guardian', 'Lost Warrior', 'Ancient Construct'],
                obstacles: ['pillar', 'broken_wall', 'statue'],
                treasures: ['ancient_chest', 'magical_artifact'],
                music: 'ruins_theme.mp3',
                ambientSounds: ['wind_howl', 'stone_crumble']
            },
            'Dragon\'s Peak': {
                minLevel: 10,
                maxLevel: 15,
                background: '#8b0000',
                enemies: ['Dragon Wyrmling', 'Fire Elemental', 'Dragon Cultist'],
                obstacles: ['lava_pool', 'dragon_bones', 'volcanic_rock'],
                treasures: ['dragon_hoard', 'ancient_weapon'],
                music: 'dragon_theme.mp3',
                ambientSounds: ['dragon_roar', 'lava_bubble']
            }
        };
    }

    generateRoom(areaName, playerLevel) {
        const area = this.areas[areaName];
        if (!area) return null;

        const room = {
            type: areaName,
            width: 800,
            height: 600,
            background: area.background,
            objects: [],
            enemies: [],
            treasures: [],
            exits: this.generateExits(),
            lighting: this.generateLighting(areaName)
        };

        // Add obstacles
        const obstacleCount = Math.floor(Math.random() * 5) + 3;
        for (let i = 0; i < obstacleCount; i++) {
            room.objects.push(this.generateObstacle(area));
        }

        // Add enemies
        const enemyCount = Math.floor(Math.random() * 3) + 2;
        for (let i = 0; i < enemyCount; i++) {
            room.enemies.push(this.generateEnemy(area, playerLevel));
        }

        // Add treasures
        const treasureCount = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < treasureCount; i++) {
            room.treasures.push(this.generateTreasure(area));
        }

        return room;
    }

    generateObstacle(area) {
        const type = area.obstacles[Math.floor(Math.random() * area.obstacles.length)];
        return {
            type,
            x: Math.random() * 700 + 50, // Keep away from edges
            y: Math.random() * 500 + 50,
            width: 40,
            height: 40,
            collidable: true,
            destructible: type.includes('rock') || type.includes('crystal'),
            health: type.includes('rock') ? 100 : 50
        };
    }

    generateEnemy(area, playerLevel) {
        const type = area.enemies[Math.floor(Math.random() * area.enemies.length)];
        const levelVariation = Math.floor(Math.random() * 3) - 1; // -1 to +1
        const enemyLevel = Math.max(1, Math.min(playerLevel + levelVariation, area.maxLevel));

        return {
            type,
            level: enemyLevel,
            x: Math.random() * 700 + 50,
            y: Math.random() * 500 + 50,
            health: 50 + (enemyLevel * 10),
            attack: 5 + (enemyLevel * 2),
            defense: 3 + Math.floor(enemyLevel * 1.5),
            speed: 3,
            dropTable: this.generateDropTable(type, enemyLevel),
            abilities: this.getEnemyAbilities(type)
        };
    }

    generateTreasure(area) {
        const type = area.treasures[Math.floor(Math.random() * area.treasures.length)];
        return {
            type,
            x: Math.random() * 700 + 50,
            y: Math.random() * 500 + 50,
            contents: this.generateTreasureContents(type),
            opened: false,
            requiresKey: type.includes('chest')
        };
    }

    generateDropTable(enemyType, level) {
        const drops = [];
        
        // Common drops (70% chance)
        drops.push({
            item: 'gold',
            chance: 0.7,
            amount: Math.floor(level * 5 + Math.random() * level * 10)
        });

        // Uncommon drops (30% chance)
        if (enemyType.includes('Dragon') || enemyType.includes('Guardian')) {
            drops.push({
                item: 'gem',
                chance: 0.3,
                amount: Math.floor(1 + Math.random() * 3)
            });
        }

        // Rare drops (10% chance)
        drops.push({
            item: this.getRareDropForEnemy(enemyType),
            chance: 0.1,
            amount: 1
        });

        return drops;
    }

    getRareDropForEnemy(enemyType) {
        const rareDrops = {
            'Wolf': 'wolf_fang',
            'Bandit': 'lucky_coin',
            'Giant Spider': 'spider_silk',
            'Cave Bat': 'echo_crystal',
            'Crystal Golem': 'golem_core',
            'Dark Dwarf': 'dwarf_hammer',
            'Stone Guardian': 'guardian_shield',
            'Lost Warrior': 'ancient_sword',
            'Ancient Construct': 'construct_core',
            'Dragon Wyrmling': 'dragon_scale',
            'Fire Elemental': 'flame_essence',
            'Dragon Cultist': 'cultist_robe'
        };
        return rareDrops[enemyType] || 'mysterious_shard';
    }

    generateTreasureContents(type) {
        const contents = {
            gold: Math.floor(Math.random() * 100) + 50
        };

        if (type.includes('chest')) {
            contents.items = [];
            const itemCount = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < itemCount; i++) {
                contents.items.push(this.generateRandomItem());
            }
        }

        if (type.includes('crystal') || type.includes('gem')) {
            contents.gems = Math.floor(Math.random() * 3) + 1;
        }

        if (type.includes('artifact') || type.includes('weapon')) {
            contents.specialItem = this.generateSpecialItem();
        }

        return contents;
    }

    generateRandomItem() {
        const items = [
            { name: 'Health Potion', type: 'consumable', effect: 'heal', value: 50 },
            { name: 'Strength Elixir', type: 'consumable', effect: 'strength', duration: 60 },
            { name: 'Speed Boots', type: 'equipment', slot: 'feet', stats: { speed: 5 } },
            { name: 'Iron Sword', type: 'weapon', damage: 15, durability: 100 }
        ];
        return items[Math.floor(Math.random() * items.length)];
    }

    generateSpecialItem() {
        const specialItems = [
            { name: 'Flaming Sword', type: 'weapon', damage: 25, element: 'fire' },
            { name: 'Frost Shield', type: 'shield', defense: 20, element: 'ice' },
            { name: 'Wind Walker Boots', type: 'boots', speed: 10, effect: 'double_jump' },
            { name: 'Dragon Scale Armor', type: 'armor', defense: 30, resistance: 'fire' }
        ];
        return specialItems[Math.floor(Math.random() * specialItems.length)];
    }

    generateExits() {
        const exits = [];
        const directions = ['north', 'south', 'east', 'west'];
        const exitCount = Math.floor(Math.random() * 2) + 2; // 2-3 exits per room

        for (let i = 0; i < exitCount; i++) {
            const direction = directions[Math.floor(Math.random() * directions.length)];
            if (!exits.find(e => e.direction === direction)) {
                exits.push({
                    direction,
                    x: this.getExitPosition(direction, 'x'),
                    y: this.getExitPosition(direction, 'y'),
                    locked: Math.random() < 0.2 // 20% chance for locked door
                });
            }
        }
        return exits;
    }

    getExitPosition(direction, axis) {
        switch(direction) {
            case 'north':
                return axis === 'x' ? 400 : 0;
            case 'south':
                return axis === 'x' ? 400 : 600;
            case 'east':
                return axis === 'x' ? 800 : 300;
            case 'west':
                return axis === 'x' ? 0 : 300;
        }
    }

    generateLighting(areaName) {
        const baseLight = {
            'Forest of Whispers': 1.0,
            'Crystal Caves': 0.7,
            'Ancient Ruins': 0.8,
            'Dragon\'s Peak': 0.9
        }[areaName] || 1.0;

        return {
            ambient: baseLight,
            sources: this.generateLightSources(areaName)
        };
    }

    generateLightSources(areaName) {
        const sources = [];
        const sourceCount = Math.floor(Math.random() * 3) + 2;

        const lightTypes = {
            'Forest of Whispers': { color: '#90ff90', intensity: 0.3 },
            'Crystal Caves': { color: '#40a0ff', intensity: 0.5 },
            'Ancient Ruins': { color: '#ffcc00', intensity: 0.4 },
            'Dragon\'s Peak': { color: '#ff4400', intensity: 0.6 }
        }[areaName] || { color: '#ffffff', intensity: 0.5 };

        for (let i = 0; i < sourceCount; i++) {
            sources.push({
                x: Math.random() * 800,
                y: Math.random() * 600,
                color: lightTypes.color,
                intensity: lightTypes.intensity,
                radius: Math.random() * 100 + 50
            });
        }

        return sources;
    }
}
