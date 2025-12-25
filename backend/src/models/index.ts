// Import all models
import { User } from './User';
import { Session } from './Session';
import { Question } from './Question';
import { CATSession } from './CATSession';
import { CATResponse } from './CATResponse';
import { QuizSession } from './QuizSession';
import { QuizResponse } from './QuizResponse';
import { StudyGoal } from './StudyGoal';
import { StudyActivity } from './StudyActivity';
import { StudyMaterial, UserStudyMaterial } from './StudyMaterial';
import { FlashcardDeck, Flashcard, UserFlashcardProgress } from './Flashcard';
import { Subscription, PaymentTransaction } from './Subscription';
import { UserSettings } from './UserSettings';
import { StudyPlan, StudyPlanTask, StudyPlanMilestone } from './StudyPlan';
import { StudyGroup, StudyGroupMember, StudyGroupMessage, StudySession } from './StudyGroup';
import { ForumCategory, ForumPost, ForumComment, ForumReaction, ForumBookmark } from './Forum';
import { Achievement, UserAchievement } from './Achievement';
import { Notification } from './Notification';
import { FileUpload } from './FileUpload';

// Re-export models
export {
  User, Session, Question, CATSession, CATResponse,
  QuizSession, QuizResponse, StudyGoal, StudyActivity,
  StudyMaterial, UserStudyMaterial, FlashcardDeck, Flashcard,
  UserFlashcardProgress, Subscription, PaymentTransaction,
  UserSettings, StudyPlan, StudyPlanTask, StudyPlanMilestone, StudyGroup,
  StudyGroupMember, StudyGroupMessage, StudySession, ForumCategory, ForumPost, 
  ForumComment, ForumReaction, ForumBookmark,
  Achievement, UserAchievement, Notification, FileUpload
};

// Re-export types
export type { NCLEXCategory, QuestionType, BloomLevel } from './Question';
export type { CATStatus, CATResult } from './CATSession';
export type { QuizStatus, QuizDifficulty } from './QuizSession';
export type { GoalType, GoalPeriod } from './StudyGoal';
export type { ActivityType } from './StudyActivity';
export type { MaterialType, MaterialCategory } from './StudyMaterial';
export type { PlanType, SubscriptionStatus, BillingPeriod, PaymentStatus } from './Subscription';
export type { AchievementCategory } from './Achievement';
export type { NotificationType } from './Notification';
export type { UploadType } from './FileUpload';

// Model array for Sequelize
export const models = [
  User,
  Session,
  Question,
  CATSession,
  CATResponse,
  QuizSession,
  QuizResponse,
  StudyGoal,
  StudyActivity,
  StudyMaterial,
  UserStudyMaterial,
  FlashcardDeck,
  Flashcard,
  UserFlashcardProgress,
  Subscription,
  PaymentTransaction,
  UserSettings,
  StudyPlan,
  StudyPlanTask,
  StudyPlanMilestone,
  StudyGroup,
  StudyGroupMember,
  StudyGroupMessage,
  StudySession,
  ForumCategory,
  ForumPost,
  ForumComment,
  ForumReaction,
  ForumBookmark,
  Achievement,
  UserAchievement,
  Notification,
  FileUpload,
];