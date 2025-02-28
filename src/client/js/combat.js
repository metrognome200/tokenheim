class CombatSystem {
    constructor(game) {
        this.game = game;
        this.comboCount = 0;
        this.lastAttackTime = 0;
        this.comboTimeout = 2000; // 2 seconds to maintain combo
        this.activeEffects = new Set();
        this.particles = [];
    }

    attack(attacker, target, type = 'basic') {
        let damage = this.calculateDamage(attacker, type);
        
        // Check combo timing
        const now = Date.now();
        if (now - this.lastAttackTime < this.comboTimeout) {
            this.comboCount++;
            damage *= (1 + (this.comboCount * 0.1)); // 10% more damage per combo
        } else {
            this.comboCount = 0;
        }
        this.lastAttackTime = now;

        // Critical hit check
        if (Math.random() < attacker.stats.critChance) {
            damage *= 2;
            this.createEffect('critical', target.position);
        }

        // Apply defense
        damage = Math.max(1, damage - target.stats.defense);

        // Create hit effect
        this.createEffect('hit', target.position);

        return {
            damage: Math.floor(damage),
            isCritical: damage > attacker.stats.attack,
            combo: this.comboCount
        };
    }

    useAbility(attacker, target, ability) {
        if (!ability) return null;

        let result = {
            damage: 0,
            effects: [],
            particles: []
        };

        // Handle damage abilities
        if (ability.damage) {
            result.damage = this.calculateAbilityDamage(attacker, ability);
            this.createEffect(ability.name.toLowerCase(), target.position);
        }

        // Handle effect abilities
        if (ability.effect) {
            result.effects.push({
                type: ability.effect,
                duration: ability.duration,
                value: this.calculateEffectValue(attacker, ability)
            });
            this.createEffect(ability.effect, attacker.position);
        }

        // Handle AoE abilities
        if (ability.aoe) {
            result.isAoe = true;
            this.createAoeEffect(target.position, ability);
        }

        return result;
    }

    calculateDamage(attacker, type) {
        let baseDamage = attacker.stats.attack;
        
        switch(type) {
            case 'basic':
                return baseDamage;
            case 'heavy':
                return baseDamage * 1.5;
            case 'quick':
                return baseDamage * 0.7;
            default:
                return baseDamage;
        }
    }

    calculateAbilityDamage(attacker, ability) {
        let damage = ability.damage * (1 + attacker.stats.attack / 100);
        
        // Apply ability-specific modifiers
        switch(ability.name) {
            case 'Backstab':
                damage *= 1.5; // 50% more damage from behind
                break;
            case 'Precise Shot':
                attacker.stats.critChance *= 2; // Double crit chance
                break;
            case 'Fireball':
                damage *= 1.2; // 20% more base damage
                break;
        }

        return Math.floor(damage);
    }

    createEffect(type, position) {
        const effect = {
            type,
            position: { ...position },
            startTime: Date.now(),
            duration: 500 // milliseconds
        };

        this.particles.push(effect);
        setTimeout(() => {
            const index = this.particles.indexOf(effect);
            if (index > -1) {
                this.particles.splice(index, 1);
            }
        }, effect.duration);
    }

    createAoeEffect(center, ability) {
        const radius = 100; // pixels
        const particleCount = 8;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const x = center.x + Math.cos(angle) * radius;
            const y = center.y + Math.sin(angle) * radius;
            
            this.createEffect(ability.name.toLowerCase(), { x, y });
        }
    }

    drawEffects(ctx) {
        this.particles.forEach(particle => {
            const progress = (Date.now() - particle.startTime) / particle.duration;
            const alpha = 1 - progress;

            ctx.save();
            ctx.globalAlpha = alpha;
            
            switch(particle.type) {
                case 'critical':
                    this.drawCriticalEffect(ctx, particle.position);
                    break;
                case 'hit':
                    this.drawHitEffect(ctx, particle.position);
                    break;
                case 'fireball':
                    this.drawFireEffect(ctx, particle.position);
                    break;
                // Add more effect types as needed
            }
            
            ctx.restore();
        });
    }

    drawCriticalEffect(ctx, position) {
        ctx.fillStyle = '#ff0000';
        ctx.font = '20px Arial';
        ctx.fillText('CRITICAL!', position.x, position.y - 20);
    }

    drawHitEffect(ctx, position) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(position.x, position.y, 20, 0, Math.PI * 2);
        ctx.stroke();
    }

    drawFireEffect(ctx, position) {
        const gradient = ctx.createRadialGradient(
            position.x, position.y, 0,
            position.x, position.y, 30
        );
        gradient.addColorStop(0, 'rgba(255, 150, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(position.x, position.y, 30, 0, Math.PI * 2);
        ctx.fill();
    }
}
