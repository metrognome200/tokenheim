class RoomRenderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.sprites = {};
        this.loadSprites();
    }

    loadSprites() {
        // Load obstacle sprites
        const obstacles = ['tree', 'rock', 'bush', 'crystal', 'stalagmite', 'pillar', 'broken_wall', 'statue', 'dragon_bones'];
        obstacles.forEach(obstacle => {
            const img = new Image();
            img.src = `assets/obstacles/${obstacle}.png`;
            this.sprites[obstacle] = img;
        });

        // Load treasure sprites
        const treasures = ['wood_chest', 'crystal_deposit', 'ancient_chest', 'dragon_hoard'];
        treasures.forEach(treasure => {
            const img = new Image();
            img.src = `assets/treasures/${treasure}.png`;
            this.sprites[treasure] = img;
        });

        // Load enemy sprites
        const enemies = ['Wolf', 'Bandit', 'Giant Spider', 'Cave Bat', 'Crystal Golem', 'Dark Dwarf'];
        enemies.forEach(enemy => {
            const img = new Image();
            img.src = `assets/enemies/${enemy.toLowerCase()}.png`;
            this.sprites[enemy] = img;
        });
    }

    render(room) {
        this.clearCanvas();
        this.drawBackground(room);
        this.drawLighting(room);
        this.drawObjects(room);
        this.drawEnemies(room);
        this.drawTreasures(room);
        this.drawExits(room);
        this.drawParticles(room);
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBackground(room) {
        // Draw base background
        this.ctx.fillStyle = room.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Add texture overlay
        this.ctx.globalAlpha = 0.1;
        for (let i = 0; i < this.canvas.width; i += 20) {
            for (let j = 0; j < this.canvas.height; j += 20) {
                if (Math.random() > 0.5) {
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillRect(i, j, 20, 20);
                }
            }
        }
        this.ctx.globalAlpha = 1;
    }

    drawLighting(room) {
        // Create a lighting overlay
        const lightingCanvas = document.createElement('canvas');
        lightingCanvas.width = this.canvas.width;
        lightingCanvas.height = this.canvas.height;
        const lightCtx = lightingCanvas.getContext('2d');

        // Fill with ambient darkness
        lightCtx.fillStyle = `rgba(0, 0, 0, ${1 - room.lighting.ambient})`;
        lightCtx.fillRect(0, 0, lightingCanvas.width, lightingCanvas.height);

        // Add light sources
        room.lighting.sources.forEach(source => {
            const gradient = lightCtx.createRadialGradient(
                source.x, source.y, 0,
                source.x, source.y, source.radius
            );
            gradient.addColorStop(0, `rgba(0, 0, 0, 0)`);
            gradient.addColorStop(1, `rgba(0, 0, 0, ${1 - room.lighting.ambient})`);
            
            lightCtx.globalCompositeOperation = 'destination-out';
            lightCtx.fillStyle = gradient;
            lightCtx.beginPath();
            lightCtx.arc(source.x, source.y, source.radius, 0, Math.PI * 2);
            lightCtx.fill();
        });

        // Apply lighting to main canvas
        this.ctx.drawImage(lightingCanvas, 0, 0);
    }

    drawObjects(room) {
        room.objects.forEach(obj => {
            if (this.sprites[obj.type]) {
                this.ctx.drawImage(this.sprites[obj.type], obj.x, obj.y, obj.width, obj.height);
            } else {
                // Fallback shape if sprite not loaded
                this.ctx.fillStyle = '#555555';
                this.ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
            }

            // Draw health bar for destructible objects
            if (obj.destructible) {
                this.drawHealthBar(obj);
            }
        });
    }

    drawEnemies(room) {
        room.enemies.forEach(enemy => {
            if (this.sprites[enemy.type]) {
                this.ctx.drawImage(this.sprites[enemy.type], enemy.x, enemy.y, 40, 40);
            } else {
                // Fallback shape if sprite not loaded
                this.ctx.fillStyle = '#ff0000';
                this.ctx.fillRect(enemy.x, enemy.y, 40, 40);
            }

            // Draw enemy health bar
            this.drawHealthBar(enemy);

            // Draw level indicator
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`Lv.${enemy.level}`, enemy.x + 20, enemy.y - 5);
        });
    }

    drawTreasures(room) {
        room.treasures.forEach(treasure => {
            if (this.sprites[treasure.type]) {
                this.ctx.drawImage(this.sprites[treasure.type], treasure.x, treasure.y, 30, 30);
            } else {
                // Fallback shape if sprite not loaded
                this.ctx.fillStyle = '#ffff00';
                this.ctx.fillRect(treasure.x, treasure.y, 30, 30);
            }

            // Draw interaction indicator if not opened
            if (!treasure.opened) {
                this.drawInteractionIndicator(treasure);
            }
        });
    }

    drawExits(room) {
        room.exits.forEach(exit => {
            // Draw door frame
            this.ctx.fillStyle = '#8b4513';
            switch(exit.direction) {
                case 'north':
                case 'south':
                    this.ctx.fillRect(exit.x - 30, exit.y - 5, 60, 10);
                    break;
                case 'east':
                case 'west':
                    this.ctx.fillRect(exit.x - 5, exit.y - 30, 10, 60);
                    break;
            }

            // Draw lock if door is locked
            if (exit.locked) {
                this.ctx.fillStyle = '#ffd700';
                this.ctx.beginPath();
                this.ctx.arc(exit.x, exit.y, 5, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }

    drawHealthBar(entity) {
        const width = 40;
        const height = 4;
        const x = entity.x;
        const y = entity.y - 10;
        const healthPercent = entity.health / (entity.maxHealth || 100);

        // Background
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(x, y, width, height);

        // Health
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(x, y, width * healthPercent, height);
    }

    drawInteractionIndicator(entity) {
        const time = Date.now() * 0.002;
        const y = entity.y - 20 + Math.sin(time) * 5;

        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.moveTo(entity.x + 15, y);
        this.ctx.lineTo(entity.x + 20, y - 5);
        this.ctx.lineTo(entity.x + 25, y);
        this.ctx.fill();
    }

    drawParticles(room) {
        if (room.particles) {
            room.particles.forEach(particle => {
                this.ctx.globalAlpha = particle.alpha;
                this.ctx.fillStyle = particle.color;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
            });
            this.ctx.globalAlpha = 1;
        }
    }
}
