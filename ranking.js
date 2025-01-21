export class WorkoutXPManager {
    constructor() {
        this.totalExercises = 2016; // Total exercises to reach level 120
        this.targetLevel = 120; // Target level
        this.totalXPForTargetLevel = 10000000; // Total XP required to reach level 120
        this.xpKey = 'workoutXP'; // Key used for saving XP in local storage
        this.rankKey = 'workoutRank'; // Key used for saving rank in local storage

        // XP per level for Linear Scaling (Levels 1-10)
        this.linearXPPerLevel = 15000; // Linear XP progression for first 10 levels

        // Exponential scaling factor for Levels 11-120 (reduced for more gradual progression)
        this.exponentialScalingFactor = 1.15; // Adjusted for a gentler progression

        // Generate XP thresholds for levels using linear and exponential scaling
        this.generateLevels();

        // Rank thresholds
        this.ranks = [
            { name: "E", level: 0 },
            { name: "D", level: 20 },
            { name: "C", level: 40 },
            { name: "B", level: 60 },
            { name: "A", level: 80 },
            { name: "S", level: 100 }
        ];
    }

    generateLevels() {
        this.levels = [0]; // Level 0 starts at 0 XP

        // Linear scaling for levels 1-10
        for (let level = 1; level <= 10; level++) {
            const xpRequired = this.linearXPPerLevel * level;
            this.levels.push(xpRequired);
        }

        // Exponential scaling for levels 11-120 (using a gentler factor)
        let previousXP = this.levels[10];
        for (let level = 11; level <= this.targetLevel; level++) {
            const xpRequired = Math.round(previousXP * this.exponentialScalingFactor);
            this.levels.push(xpRequired);
            previousXP = xpRequired;
        }
    }

    getCurrentLevel(xp) {
        for (let i = 0; i < this.levels.length - 1; i++) {
            if (xp < this.levels[i + 1]) {
                return i;
            }
        }
        return this.targetLevel; // Maximum level
    }

    getProgressToNextLevel(xp) {
        const currentLevel = this.getCurrentLevel(xp);
        const currentLevelXP = this.levels[currentLevel];
        const nextLevelXP = this.levels[currentLevel + 1] || currentLevelXP;
        const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
        return Math.min(Math.max(progress, 0), 100).toFixed(2); // Clamp to 0-100
    }

    getCurrentRank(level) {
        for (let i = this.ranks.length - 1; i >= 0; i--) {
            if (level >= this.ranks[i].level) {
                return this.ranks[i].name;
            }
        }
        return "E"; // Default to lowest rank
    }

    saveXP(xp) {
        if (isNaN(xp)) {
            console.error("Error: Attempting to save NaN XP.");
            return;
        }
        localStorage.setItem(this.xpKey, xp);
    }

    saveRank(rank) {
        localStorage.setItem(this.rankKey, rank);
    }

    getXP() {
        let xp = parseFloat(localStorage.getItem(this.xpKey)) || 0;
        if (isNaN(xp)) {
            console.error("Error: Retrieved XP is NaN.");
        }
        return xp;
    }

    // Save rank to local storage
    saveRank(rank) {
        localStorage.setItem(this.rankKey, rank);
    }

    // Retrieve rank from local storage
    getRank() {
        return localStorage.getItem(this.rankKey) || "E";
    }

    saveWorkout() {
        const xpPerWorkout = this.totalXPForTargetLevel / this.totalExercises; // Calculate XP per workout
        let currentXP = this.getXP();
        let currentLevel = this.getCurrentLevel(currentXP);

        if (isNaN(xpPerWorkout) || xpPerWorkout <= 0) {
            console.error("Invalid XP per workout calculation!");
            return;
        }

        // Add XP for this workout
        currentXP += xpPerWorkout;
        this.saveXP(currentXP); // Save updated XP

        // Check for level up
        const newLevel = this.getCurrentLevel(currentXP);
        if (newLevel > currentLevel) {
            console.log(`🎉 Level Up! You are now Level ${newLevel}`);
        }

        // Update and save rank
        const rank = this.getCurrentRank(newLevel);
        this.saveRank(rank);

        // Progress display
        console.log(`XP Gained: ${xpPerWorkout.toFixed(2)} XP`);
        console.log(`Total XP: ${currentXP.toFixed(2)} XP`);
        console.log(`Current Level: ${newLevel}`);
        console.log(`Current Rank: ${rank}`);
        console.log(`Progress to next level: ${this.getProgressToNextLevel(currentXP)}%`);
    }

    getProgressToNextRank(level) {
        // Find current rank
        let currentRankIndex = 0;
        for (let i = this.ranks.length - 1; i >= 0; i--) {
            if (level >= this.ranks[i].level) {
                currentRankIndex = i;
                break;
            }
        }

        // If at max rank (S), return 100%
        if (currentRankIndex === this.ranks.length - 1) {
            return 100;
        }

        // Get current and next rank levels
        const currentRankLevel = this.ranks[currentRankIndex].level;
        const nextRankLevel = this.ranks[currentRankIndex + 1].level;

        // Calculate progress percentage
        const levelProgress = level - currentRankLevel;
        const levelsNeeded = nextRankLevel - currentRankLevel;
        const progress = (levelProgress / levelsNeeded) * 100;

        return Math.min(Math.max(progress, 0), 100).toFixed(2); // Clamp between 0-100
    }

    // Example usage in getLevelAndProgress method:
    getLevelAndProgress() {
        const currentXP = this.getXP();
        const currentLevel = this.getCurrentLevel(currentXP);
        const progressToNextLevel = this.getProgressToNextLevel(currentXP);
        const currentRank = this.getRank();
        const progressToNextRank = this.getProgressToNextRank(currentLevel);

        return {
            currentLevel,
            progressToNextLevel,
            currentRank,
            progressToNextRank
        };
    }

}
