// workoutXP.js

/**
 * Module for managing workout XP calculations, leveling, and letter ranks.
 */
export class WorkoutXPManager {
    constructor() {
        this.xpKey = 'workoutXP'; // Key used for saving XP in local storage
        this.rankKey = 'workoutRank'; // Key used for saving letter rank in local storage
        this.levels = [0, 100, 300, 600, 1000]; // XP thresholds for numerical levels
        this.letterRanks = [
            { name: "E", xp: 0 },
            { name: "D", xp: 500 },
            { name: "C", xp: 1500 },
            { name: "B", xp: 3000 },
            { name: "A", xp: 6000 },
            { name: "S", xp: 10000 }
        ]; // Letter rank thresholds
    }

    /**
     * Calculates XP from a workout object.
     * @param {Object} workout - The workout data containing exercises, sets, and reps.
     * @returns {number} - Total XP for the workout.
     */
    calculateWorkoutXP(workout) {
        let xp = 0;
        for (let exercise in workout) {
            const { sets, reps } = workout[exercise];
            reps.forEach(rep => {
                xp += sets * rep * 0.5; // Example multiplier for XP
            });
        }
        return xp;
    }

    /**
     * Gets the current XP from local storage.
     * @returns {number} - The current XP.
     */
    getCurrentXP() {
        return parseInt(localStorage.getItem(this.xpKey)) || 0;
    }

    /**
     * Saves the given XP to local storage.
     * @param {number} xp - The XP to save.
     */
    saveXP(xp) {
        localStorage.setItem(this.xpKey, xp.toString());
    }

    /**
     * Adds XP to the current total and updates local storage.
     * @param {number} xp - The XP to add.
     */
    addXP(xp) {
        const currentXP = this.getCurrentXP();
        const newXP = currentXP + xp;
        this.saveXP(newXP);
    }

    /**
     * Gets the current numerical level based on XP.
     * @returns {Object} - The current level and progress to the next level.
     */
    getCurrentLevel() {
        const currentXP = this.getCurrentXP();
        let level = 0;
        let progress = 0;
        for (let i = 0; i < this.levels.length; i++) {
            if (currentXP < this.levels[i]) {
                level = i - 1;
                progress = ((currentXP - this.levels[i - 1]) / (this.levels[i] - this.levels[i - 1])) * 100;
                break;
            }
        }
        return { level: level + 1, progress: progress.toFixed(2) }; // Level is 1-based
    }

    /**
     * Gets the current letter rank based on XP.
     * @returns {Object} - The current letter rank and progress to the next rank.
     */
    getCurrentLetterRank() {
        const currentXP = this.getCurrentXP();
        let rank = this.letterRanks[0];
        let progress = 0;

        for (let i = 1; i < this.letterRanks.length; i++) {
            if (currentXP < this.letterRanks[i].xp) {
                rank = this.letterRanks[i - 1];
                progress = ((currentXP - rank.xp) / (this.letterRanks[i].xp - rank.xp)) * 100;
                break;
            }
        }

        if (currentXP >= this.letterRanks[this.letterRanks.length - 1].xp) {
            rank = this.letterRanks[this.letterRanks.length - 1];
            progress = 100;
        }

        return { rank: rank.name, progress: progress.toFixed(2) };
    }

    /**
     * Gets both numerical level and letter rank.
     * @returns {Object} - Numerical level and letter rank with their progress.
     */
    getLevelAndRank() {
        return {
            levelInfo: this.getCurrentLevel(),
            rankInfo: this.getCurrentLetterRank()
        };
    }
}
