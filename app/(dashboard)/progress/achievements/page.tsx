'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { cn, getInitials } from '@/lib/utils';
import { useUser } from '@/lib/hooks';
import { PageHeader } from '@/components/shared/page-header';
import { CardSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Flame,
  Trophy,
  Star,
  Award,
  CheckCircle2,
  Lock,
  AlertCircle,
  Crown,
  Sparkles,
  Loader2,
  Medal,
} from 'lucide-react';
import { toast } from 'sonner';

interface Achievement {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  badgeUrl: string | null;
  achievementType: string;
  thresholdValue: number | null;
  xpReward: number;
  rarity: string;
  isHidden: boolean;
  // User progress fields (from UserAchievement join)
  progress: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
}

interface GamificationData {
  user: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    xpTotal: number;
    level: number;
    currentStreak: number;
    longestStreak: number;
  };
  achievements: Achievement[];
  leaderboard: Array<{
    id: string;
    fullName: string;
    avatarUrl: string | null;
    xpTotal: number;
    level: number;
    badgeCount: number;
  }>;
  stats: {
    totalXP: number;
    level: number;
    badgesEarned: number;
    currentStreak: number;
  };
}

const rarityConfig: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  common: {
    label: 'Common',
    color: 'text-zinc-500',
    bgColor: 'bg-zinc-500/10',
    borderColor: 'border-zinc-300 dark:border-zinc-700',
  },
  rare: {
    label: 'Rare',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-300 dark:border-blue-700',
  },
  epic: {
    label: 'Epic',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-300 dark:border-purple-700',
  },
  legendary: {
    label: 'Legendary',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-300 dark:border-amber-700',
  },
};

export default function AchievementsPage() {
  const { user } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<GamificationData | null>(null);

  const fetchGamification = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/gamification');
      if (!res.ok) throw new Error('Failed to load gamification data');
      const json = await res.json();
      setData(json.data || json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gamification data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGamification();
  }, [fetchGamification]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Achievements" description="Track your badges, XP, and leaderboard ranking" />
        <CardSkeleton count={4} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-8">
        <PageHeader title="Achievements" description="Track your badges, XP, and leaderboard ranking" />
        <EmptyState
          icon={AlertCircle}
          title="Failed to load achievements"
          description={error || 'An unexpected error occurred.'}
        >
          <Button onClick={fetchGamification} variant="outline">Try Again</Button>
        </EmptyState>
      </div>
    );
  }

  const { user: userData, achievements, leaderboard, stats } = data;

  const xpForNextLevel = (userData.level || 1) * 500;
  const xpProgress = Math.min(((userData.xpTotal || 0) / xpForNextLevel) * 100, 100);

  const unlockedAchievements = achievements.filter((a) => a.isUnlocked);
  const lockedAchievements = achievements.filter((a) => !a.isUnlocked && !a.isHidden);

  return (
    <div className="space-y-8">
      <PageHeader title="Achievements" description="Track your badges, XP, and leaderboard ranking" />

      {/* Hero Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
                  <span className="text-3xl font-bold text-white">{userData.level}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-amber-400 flex items-center justify-center">
                  <Star className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Level {userData.level}
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  {userData.xpTotal.toLocaleString()} XP Total
                </p>
                <div className="mt-3 max-w-md">
                  <div className="flex items-center justify-between text-xs text-white/70 mb-1">
                    <span>Progress to Level {userData.level + 1}</span>
                    <span>{Math.round(xpProgress)}%</span>
                  </div>
                  <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-white rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${xpProgress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-xs text-white/60 mt-1">
                    {xpForNextLevel - userData.xpTotal > 0
                      ? `${(xpForNextLevel - userData.xpTotal).toLocaleString()} XP to next level`
                      : 'Max level reached!'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                <Flame className="h-6 w-6 text-orange-300" />
                <div>
                  <p className="text-2xl font-bold text-white">{userData.currentStreak}</p>
                  <p className="text-xs text-white/70">Day Streak</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total XP',
            value: (stats.totalXP || userData.xpTotal || 0).toLocaleString(),
            icon: Sparkles,
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10',
          },
          {
            label: 'Level',
            value: stats.level || userData.level || 1,
            icon: Star,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
          },
          {
            label: 'Badges Earned',
            value: stats.badgesEarned || unlockedAchievements.length,
            icon: Award,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
          },
          {
            label: 'Current Streak',
            value: `${stats.currentStreak || userData.currentStreak || 0} days`,
            icon: Flame,
            color: 'text-orange-500',
            bg: 'bg-orange-500/10',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center mb-3', stat.bg)}>
                  <stat.icon className={cn('h-5 w-5', stat.color)} />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Unlocked ({unlockedAchievements.length})
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedAchievements.map((achievement, i) => {
              const rarity = rarityConfig[achievement.rarity] || rarityConfig.common;
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={cn('border shadow-sm hover:shadow-md transition-shadow', rarity.borderColor)}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center shrink-0', rarity.bgColor)}>
                          {achievement.badgeUrl ? (
                            <img src={achievement.badgeUrl} alt="" className="h-8 w-8" />
                          ) : (
                            <Award className={cn('h-6 w-6', rarity.color)} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-semibold truncate">{achievement.name}</h3>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {achievement.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className={cn('text-[10px]', rarity.color, rarity.bgColor)}>
                              {rarity.label}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              +{achievement.xpReward} XP
                            </span>
                            {achievement.unlockedAt && (
                              <span className="text-[10px] text-muted-foreground">
                                {new Intl.DateTimeFormat('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                }).format(new Date(achievement.unlockedAt))}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            Locked ({lockedAchievements.length})
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedAchievements.map((achievement, i) => {
              const rarity = rarityConfig[achievement.rarity] || rarityConfig.common;
              const progressPct =
                achievement.thresholdValue && achievement.thresholdValue > 0
                  ? Math.min((achievement.progress / achievement.thresholdValue) * 100, 100)
                  : 0;

              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="border shadow-sm opacity-75 hover:opacity-100 transition-opacity">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center shrink-0 grayscale">
                          {achievement.badgeUrl ? (
                            <img src={achievement.badgeUrl} alt="" className="h-8 w-8 grayscale" />
                          ) : (
                            <Lock className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold truncate text-muted-foreground">
                            {achievement.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {achievement.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-[10px]">
                              {rarity.label}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              +{achievement.xpReward} XP
                            </span>
                          </div>
                          {achievement.thresholdValue && achievement.thresholdValue > 0 && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                                <span>Progress</span>
                                <span>
                                  {achievement.progress} / {achievement.thresholdValue}
                                </span>
                              </div>
                              <Progress value={progressPct} className="h-1.5" />
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* No achievements at all */}
      {achievements.length === 0 && (
        <EmptyState
          icon={Trophy}
          title="No achievements yet"
          description="Start studying to unlock your first achievement!"
        />
      )}

      {/* Leaderboard */}
      {leaderboard && leaderboard.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                Leaderboard
              </CardTitle>
              <CardDescription>Top 20 users by XP</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left font-medium text-muted-foreground p-3 w-16">Rank</th>
                      <th className="text-left font-medium text-muted-foreground p-3">User</th>
                      <th className="text-left font-medium text-muted-foreground p-3">XP</th>
                      <th className="text-left font-medium text-muted-foreground p-3">Level</th>
                      <th className="text-left font-medium text-muted-foreground p-3">Badges</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, i) => {
                      const isCurrentUser = entry.id === userData.id;
                      const rank = i + 1;

                      return (
                        <tr
                          key={entry.id}
                          className={cn(
                            'border-b last:border-0 transition-colors',
                            isCurrentUser
                              ? 'bg-primary/5 font-medium'
                              : 'hover:bg-muted/30'
                          )}
                        >
                          <td className="p-3">
                            {rank <= 3 ? (
                              <div
                                className={cn(
                                  'h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white',
                                  rank === 1
                                    ? 'bg-amber-500'
                                    : rank === 2
                                    ? 'bg-zinc-400'
                                    : 'bg-amber-700'
                                )}
                              >
                                {rank}
                              </div>
                            ) : (
                              <span className="text-muted-foreground pl-2">{rank}</span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                {entry.avatarUrl && <AvatarImage src={entry.avatarUrl} />}
                                <AvatarFallback className="text-[10px]">
                                  {getInitials(entry.fullName || 'U')}
                                </AvatarFallback>
                              </Avatar>
                              <span className={cn(isCurrentUser && 'text-primary')}>
                                {entry.fullName}
                                {isCurrentUser && (
                                  <Badge variant="secondary" className="ml-2 text-[9px]">
                                    You
                                  </Badge>
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 font-medium">{entry.xpTotal.toLocaleString()}</td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-xs">
                              Lv. {entry.level}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              <Medal className="h-3.5 w-3.5 text-amber-500" />
                              <span>{entry.badgeCount}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
