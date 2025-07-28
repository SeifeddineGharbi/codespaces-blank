/**
 * Comprehensive Scoring System for Productivity Morning Routine App
 * 
 * This module handles scoring calculations for the 4 core MVP habits:
 * - Drink Water (25% weight)
 * - No Phone Usage (25% weight) 
 * - Sunlight Exposure (25% weight)
 * - Elephant Task (25% weight)
 * 
 * @version 1.0.0
 * @author Backend Agent - Productivity Morning Routine
 */

import { FirestoreTaskCompletion, FirestoreDailyProgress } from '@/src/types';
import { SCORING_CONFIG, MOTIVATIONAL_MESSAGES, MVP_TASKS } from '@/src/constants';

// Scoring interfaces
export interface TaskScore {
  taskId: string;
  name: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  points: number;
  maxPoints: number;
  percentage: number;
  weight: number;
  bonusPoints?: number;
  qualityMultiplier?: number;
}

export interface DailyScore {
  totalScore: number;
  maxScore: number;
  percentage: number;
  taskScores: TaskScore[];
  streakBonus: number;
  qualityBonus: number;
  motivationalMessage: string;
  tier: 'champion' | 'building' | 'solid' | 'strong' | 'excellent';
  isPerfectDay: boolean;
  breakdown: {
    baseScore: number;
    bonusScore: number;
    totalPossible: number;
  };
}

export interface WeeklyScore {
  totalScore: number;
  averageScore: number;
  daysCompleted: number;
  totalDays: number;
  perfectDays: number;
  streak: number;
  taskBreakdown: {
    [taskId: string]: {
      completionRate: number;
      averageScore: number;
      totalCompletions: number;
    };
  };
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  isStreakDay: boolean;
  streakStartDate?: string;
  lastCompletionDate?: string;
  nextMilestone: number;
  daysToMilestone: number;
}

/**
 * Core Scoring Functions
 */

/**
 * Calculate score for individual task completion
 */
export const calculateTaskScore = (
  taskCompletion: FirestoreTaskCompletion,
  bonusFactors?: {
    qualityRating?: number;
    timeliness?: number;
    consistency?: number;
  }
): TaskScore => {
  const task = MVP_TASKS.find(t => t.id === taskCompletion.taskId);
  const taskWeight = SCORING_CONFIG.taskWeights[taskCompletion.taskId] || 0;
  const maxPoints = taskWeight;
  
  let basePoints = 0;
  let qualityMultiplier = 1;
  let bonusPoints = 0;
  
  // Calculate base points based on completion status
  switch (taskCompletion.status) {
    case 'completed':
      basePoints = maxPoints;
      break;
    case 'in_progress':
      // Partial credit for in-progress tasks
      basePoints = maxPoints * 0.3;
      break;
    case 'skipped':
      basePoints = 0;
      break;
    case 'not_started':
      basePoints = 0;
      break;
  }
  
  // Apply quality multiplier based on task rating
  if (taskCompletion.rating && taskCompletion.status === 'completed') {
    // Rating is 1-5, convert to multiplier (0.8 to 1.2)
    qualityMultiplier = 0.8 + (taskCompletion.rating - 1) * 0.1;
  }
  
  // Apply bonus factors
  if (bonusFactors) {
    // Quality bonus (up to 20% extra)
    if (bonusFactors.qualityRating && bonusFactors.qualityRating >= 4) {
      bonusPoints += maxPoints * 0.1;
    }
    
    // Timeliness bonus (up to 10% extra)
    if (bonusFactors.timeliness && bonusFactors.timeliness >= 0.8) {
      bonusPoints += maxPoints * 0.05;
    }
    
    // Consistency bonus (up to 10% extra)
    if (bonusFactors.consistency && bonusFactors.consistency >= 0.9) {
      bonusPoints += maxPoints * 0.05;
    }
  }
  
  // Task-specific scoring adjustments
  const adjustedScore = applyTaskSpecificScoring(taskCompletion, basePoints, bonusPoints);
  basePoints = adjustedScore.basePoints;
  bonusPoints = adjustedScore.bonusPoints;
  
  const finalPoints = Math.min((basePoints * qualityMultiplier) + bonusPoints, maxPoints * 1.3); // Cap at 130%
  const percentage = (finalPoints / maxPoints) * 100;
  
  return {
    taskId: taskCompletion.taskId,
    name: task?.name || taskCompletion.name,
    status: taskCompletion.status,
    points: Math.round(finalPoints * 100) / 100, // Round to 2 decimal places
    maxPoints,
    percentage: Math.round(percentage * 100) / 100,
    weight: taskWeight,
    bonusPoints: Math.round(bonusPoints * 100) / 100,
    qualityMultiplier
  };
};

/**
 * Apply task-specific scoring logic
 */
const applyTaskSpecificScoring = (
  taskCompletion: FirestoreTaskCompletion,
  basePoints: number,
  bonusPoints: number
): { basePoints: number; bonusPoints: number } => {
  switch (taskCompletion.taskId) {
    case 'drink_water':
      // Water task is binary - either you drink water or you don't
      // No additional complexity needed
      break;
      
    case 'no_phone_usage':
      // This is a critical habit - apply penalty for skipping
      if (taskCompletion.status === 'skipped') {
        // No points for skipping this critical habit
        basePoints = 0;
      }
      break;
      
    case 'sunlight_exposure':
      // Bonus for optimal duration (5-10 minutes)
      if (taskCompletion.status === 'completed' && taskCompletion.actualDuration) {
        if (taskCompletion.actualDuration >= 5 && taskCompletion.actualDuration <= 10) {
          bonusPoints += basePoints * 0.1; // 10% bonus for optimal duration
        } else if (taskCompletion.actualDuration < 3) {
          basePoints *= 0.8; // 20% penalty for too short
        }
      }
      break;
      
    case 'elephant_task':
      // Bonus for detailed planning (notes length)
      if (taskCompletion.status === 'completed' && taskCompletion.notes) {
        const notesLength = taskCompletion.notes.trim().length;
        if (notesLength >= 50) {
          bonusPoints += basePoints * 0.15; // 15% bonus for detailed notes
        } else if (notesLength >= 20) {
          bonusPoints += basePoints * 0.05; // 5% bonus for adequate notes
        }
      }
      break;
  }
  
  return { basePoints, bonusPoints };
};

/**
 * Calculate daily score from all task completions
 */
export const calculateDailyScore = (
  taskCompletions: FirestoreTaskCompletion[],
  streakInfo?: StreakInfo,
  previousDaysConsistency?: number
): DailyScore => {
  // Calculate individual task scores
  const taskScores = taskCompletions.map(task => 
    calculateTaskScore(task, {
      consistency: previousDaysConsistency
    })
  );
  
  // Calculate base score
  const baseScore = taskScores.reduce((sum, score) => sum + score.points, 0);
  
  // Calculate streak bonus (up to 10% extra)
  let streakBonus = 0;
  if (streakInfo && streakInfo.currentStreak > 0) {
    const streakMultiplier = Math.min(streakInfo.currentStreak * 0.01, 0.1); // 1% per day, max 10%
    streakBonus = baseScore * streakMultiplier;
  }
  
  // Calculate quality bonus (based on average task ratings)
  const ratedTasks = taskCompletions.filter(task => task.rating && task.status === 'completed');
  let qualityBonus = 0;
  if (ratedTasks.length > 0) {
    const averageRating = ratedTasks.reduce((sum, task) => sum + (task.rating || 0), 0) / ratedTasks.length;
    if (averageRating >= 4) {
      qualityBonus = baseScore * 0.05; // 5% bonus for high quality
    }
  }
  
  const totalScore = baseScore + streakBonus + qualityBonus;
  const maxScore = SCORING_CONFIG.perfectScore;
  const percentage = (totalScore / maxScore) * 100;
  
  // Determine tier and motivational message
  const tier = getScoreTier(percentage);
  const motivationalMessage = getMotivationalMessage(tier);
  
  // Check if it's a perfect day
  const isPerfectDay = percentage >= 95 && taskCompletions.every(task => task.status === 'completed');
  
  return {
    totalScore: Math.round(totalScore * 100) / 100,
    maxScore,
    percentage: Math.round(percentage * 100) / 100,
    taskScores,
    streakBonus: Math.round(streakBonus * 100) / 100,
    qualityBonus: Math.round(qualityBonus * 100) / 100,
    motivationalMessage,
    tier,
    isPerfectDay,
    breakdown: {
      baseScore: Math.round(baseScore * 100) / 100,
      bonusScore: Math.round((streakBonus + qualityBonus) * 100) / 100,
      totalPossible: maxScore
    }
  };
};

/**
 * Calculate weekly score summary
 */
export const calculateWeeklyScore = (dailyProgresses: FirestoreDailyProgress[]): WeeklyScore => {
  if (dailyProgresses.length === 0) {
    return {
      totalScore: 0,
      averageScore: 0,
      daysCompleted: 0,
      totalDays: 0,
      perfectDays: 0,
      streak: 0,
      taskBreakdown: {}
    };
  }
  
  // Calculate daily scores
  const dailyScores = dailyProgresses.map(progress => 
    calculateDailyScore(progress.tasks)
  );
  
  const totalScore = dailyScores.reduce((sum, score) => sum + score.totalScore, 0);
  const averageScore = totalScore / dailyProgresses.length;
  const daysCompleted = dailyProgresses.filter(progress => progress.session.isCompleted).length;
  const perfectDays = dailyScores.filter(score => score.isPerfectDay).length;
  
  // Calculate current streak
  let streak = 0;
  for (let i = dailyProgresses.length - 1; i >= 0; i--) {
    const dailyScore = dailyScores[i];
    if (dailyScore.percentage >= SCORING_CONFIG.passingScore) {
      streak++;
    } else {
      break;
    }
  }
  
  // Calculate task breakdown
  const taskBreakdown: { [taskId: string]: { completionRate: number; averageScore: number; totalCompletions: number } } = {};
  
  for (const taskId of Object.keys(SCORING_CONFIG.taskWeights)) {
    const taskCompletions = dailyProgresses.flatMap(progress => 
      progress.tasks.filter(task => task.taskId === taskId)
    );
    
    const completedTasks = taskCompletions.filter(task => task.status === 'completed');
    const totalCompletions = completedTasks.length;
    const completionRate = taskCompletions.length > 0 ? (totalCompletions / taskCompletions.length) * 100 : 0;
    
    const taskScores = taskCompletions.map(task => calculateTaskScore(task));
    const averageScore = taskScores.length > 0 ? 
      taskScores.reduce((sum, score) => sum + score.points, 0) / taskScores.length : 0;
    
    taskBreakdown[taskId] = {
      completionRate: Math.round(completionRate * 100) / 100,
      averageScore: Math.round(averageScore * 100) / 100,
      totalCompletions
    };
  }
  
  return {
    totalScore: Math.round(totalScore * 100) / 100,
    averageScore: Math.round(averageScore * 100) / 100,
    daysCompleted,
    totalDays: dailyProgresses.length,
    perfectDays,
    streak,
    taskBreakdown
  };
};

/**
 * Calculate streak information
 */
export const calculateStreakInfo = (dailyProgresses: FirestoreDailyProgress[]): StreakInfo => {
  if (dailyProgresses.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      isStreakDay: false,
      nextMilestone: 7,
      daysToMilestone: 7
    };
  }
  
  // Sort by date (most recent first)
  const sortedProgresses = [...dailyProgresses].sort((a, b) => b.date.localeCompare(a.date));
  
  // Calculate current streak
  let currentStreak = 0;
  let streakStartDate: string | undefined;
  
  for (const progress of sortedProgresses) {
    const dailyScore = calculateDailyScore(progress.tasks);
    if (dailyScore.percentage >= SCORING_CONFIG.passingScore) {
      currentStreak++;
      streakStartDate = progress.date;
    } else {
      break;
    }
  }
  
  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  
  for (const progress of sortedProgresses.reverse()) {
    const dailyScore = calculateDailyScore(progress.tasks);
    if (dailyScore.percentage >= SCORING_CONFIG.passingScore) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }
  
  // Determine if today is a streak day
  const today = new Date().toISOString().split('T')[0];
  const todayProgress = dailyProgresses.find(progress => progress.date === today);
  const isStreakDay = todayProgress ? 
    calculateDailyScore(todayProgress.tasks).percentage >= SCORING_CONFIG.passingScore : false;
  
  // Calculate next milestone
  const milestones = [7, 14, 30, 50, 100, 365];
  const nextMilestone = milestones.find(milestone => milestone > currentStreak) || 365;
  const daysToMilestone = nextMilestone - currentStreak;
  
  const lastCompletionDate = sortedProgresses.length > 0 ? sortedProgresses[0].date : undefined;
  
  return {
    currentStreak,
    longestStreak,
    isStreakDay,
    streakStartDate,
    lastCompletionDate,
    nextMilestone,
    daysToMilestone
  };
};

/**
 * Get score tier based on percentage
 */
export const getScoreTier = (percentage: number): 'champion' | 'building' | 'solid' | 'strong' | 'excellent' => {
  if (percentage >= 90) return 'excellent';
  if (percentage >= 75) return 'strong';
  if (percentage >= 50) return 'solid';
  if (percentage >= 25) return 'building';
  return 'champion';
};

/**
 * Get motivational message based on tier
 */
export const getMotivationalMessage = (tier: 'champion' | 'building' | 'solid' | 'strong' | 'excellent'): string => {
  const messages = MOTIVATIONAL_MESSAGES[tier].messages;
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};

/**
 * Calculate completion percentage for specific time period
 */
export const calculateCompletionRate = (
  dailyProgresses: FirestoreDailyProgress[],
  startDate: string,
  endDate: string
): {
  overallRate: number;
  taskRates: { [taskId: string]: number };
  totalDays: number;
  completedDays: number;
} => {
  const filteredProgresses = dailyProgresses.filter(
    progress => progress.date >= startDate && progress.date <= endDate
  );
  
  const totalDays = filteredProgresses.length;
  const completedDays = filteredProgresses.filter(progress => progress.session.isCompleted).length;
  const overallRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
  
  // Calculate task-specific completion rates
  const taskRates: { [taskId: string]: number } = {};
  
  for (const taskId of Object.keys(SCORING_CONFIG.taskWeights)) {
    const taskCompletions = filteredProgresses.flatMap(progress => 
      progress.tasks.filter(task => task.taskId === taskId)
    );
    
    const completedTasks = taskCompletions.filter(task => task.status === 'completed').length;
    const rate = taskCompletions.length > 0 ? (completedTasks / taskCompletions.length) * 100 : 0;
    taskRates[taskId] = Math.round(rate * 100) / 100;
  }
  
  return {
    overallRate: Math.round(overallRate * 100) / 100,
    taskRates,
    totalDays,
    completedDays
  };
};

/**
 * Generate score insights and recommendations
 */
export const generateScoreInsights = (
  weeklyScore: WeeklyScore,
  streakInfo: StreakInfo
): {
  insights: string[];
  recommendations: string[];
  strongAreas: string[];
  improvementAreas: string[];
} => {
  const insights: string[] = [];
  const recommendations: string[] = [];
  const strongAreas: string[] = [];
  const improvementAreas: string[] = [];
  
  // Analyze overall performance
  if (weeklyScore.averageScore >= 85) {
    insights.push(`Excellent performance with ${weeklyScore.averageScore.toFixed(1)}% average score!`);
    strongAreas.push('Consistent high performance');
  } else if (weeklyScore.averageScore >= 70) {
    insights.push(`Good progress with ${weeklyScore.averageScore.toFixed(1)}% average score.`);
  } else {
    insights.push(`There's room for improvement with ${weeklyScore.averageScore.toFixed(1)}% average score.`);
    recommendations.push('Focus on completing more tasks consistently');
  }
  
  // Analyze streak performance
  if (streakInfo.currentStreak >= 7) {
    insights.push(`Amazing ${streakInfo.currentStreak}-day streak! Keep the momentum going.`);
    strongAreas.push('Streak consistency');
  } else if (streakInfo.currentStreak >= 3) {
    insights.push(`Building momentum with a ${streakInfo.currentStreak}-day streak.`);
  } else {
    recommendations.push('Focus on building a consistent daily streak');
  }
  
  // Analyze task-specific performance
  for (const [taskId, breakdown] of Object.entries(weeklyScore.taskBreakdown)) {
    const task = MVP_TASKS.find(t => t.id === taskId);
    const taskName = task?.name || taskId;
    
    if (breakdown.completionRate >= 85) {
      strongAreas.push(`${taskName} (${breakdown.completionRate.toFixed(1)}% completion)`);
    } else if (breakdown.completionRate < 60) {
      improvementAreas.push(`${taskName} (${breakdown.completionRate.toFixed(1)}% completion)`);
      
      // Task-specific recommendations
      switch (taskId) {
        case 'drink_water':
          recommendations.push('Set a water bottle by your bedside to make hydration automatic');
          break;
        case 'no_phone_usage':
          recommendations.push('Consider using a physical alarm clock instead of your phone');
          break;
        case 'sunlight_exposure':
          recommendations.push('Try opening blinds immediately upon waking or step outside briefly');
          break;
        case 'elephant_task':
          recommendations.push('Spend 2-3 minutes the night before identifying your most important task');
          break;
      }
    }
  }
  
  // Perfect day insights
  if (weeklyScore.perfectDays > 0) {
    insights.push(`You achieved ${weeklyScore.perfectDays} perfect day${weeklyScore.perfectDays > 1 ? 's' : ''} this week!`);
    strongAreas.push('Perfect day execution');
  }
  
  return {
    insights,
    recommendations,
    strongAreas,
    improvementAreas
  };
};

/**
 * Export scoring utilities
 */
export const scoringUtils = {
  calculateTaskScore,
  calculateDailyScore,
  calculateWeeklyScore,
  calculateStreakInfo,
  getScoreTier,
  getMotivationalMessage,
  calculateCompletionRate,
  generateScoreInsights
};

export default scoringUtils;