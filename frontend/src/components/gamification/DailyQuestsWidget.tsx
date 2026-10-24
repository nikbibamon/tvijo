"use client";

import { useState, useEffect } from "react";
import { Check, Circle, Trophy, Zap, Target } from "lucide-react";

interface DailyQuest {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  rewardXP: number;
  icon: string;
  completed: boolean;
}

interface DailyQuestsWidgetProps {
  userId?: string;
  className?: string;
}

const DEFAULT_QUESTS: DailyQuest[] = [
  {
    id: "read-article",
    title: "Read 2 Articles",
    description: "Read any 2 KB articles",
    target: 2,
    current: 0,
    rewardXP: 20,
    icon: "📰",
    completed: false,
  },
  {
    id: "comment",
    title: "Leave a Comment",
    description: "Comment on any article",
    target: 1,
    current: 0,
    rewardXP: 15,
    icon: "💬",
    completed: false,
  },
  {
    id: "share",
    title: "Share Content",
    description: "Share an article on social media",
    target: 1,
    current: 0,
    rewardXP: 25,
    icon: "🔗",
    completed: false,
  },
  {
    id: "streak",
    title: "Maintain Streak",
    description: "Visit the platform today",
    target: 1,
    current: 1,
    rewardXP: 10,
    icon: "🔥",
    completed: true,
  },
];

export function DailyQuestsWidget({ className }: DailyQuestsWidgetProps) {
  const [quests, setQuests] = useState<DailyQuest[]>(DEFAULT_QUESTS);
  const [bonusClaimed, setBonusClaimed] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    // Calculate time until midnight
    const updateTimeLeft = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${hours}h ${minutes}m`);
    };
    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000);
    return () => clearInterval(interval);
  }, []);

  const completedCount = quests.filter((q) => q.completed).length;
  const allCompleted = completedCount === quests.length;
  const totalReward = quests.reduce((sum, q) => sum + (q.completed ? q.rewardXP : 0), 0);

  const handleClaimBonus = () => {
    if (allCompleted && !bonusClaimed) {
      setBonusClaimed(true);
      // TODO: API call to claim bonus
    }
  };

  return (
    <div className={`bg-gradient-to-br from-[#1A1A2E] to-[#12121A] border border-white/5 rounded-2xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">Daily Quests</h3>
        </div>
        <div className="text-xs text-gray-500">
          Resets in {timeLeft}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{completedCount}/{quests.length} completed</span>
          <span>{totalReward} XP earned</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / quests.length) * 100}%` }}
          />
        </div>
      </div>

      {/* All completed bonus */}
      {allCompleted && !bonusClaimed && (
        <div className="mb-4 p-3 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 rounded-xl">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-emerald-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-400">All Quests Complete!</p>
              <p className="text-xs text-gray-400">Claim +50 XP bonus</p>
            </div>
            <button
              onClick={handleClaimBonus}
              className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Claim
            </button>
          </div>
        </div>
      )}

      {/* Quests list */}
      <div className="space-y-2">
        {quests.map((quest) => (
          <div
            key={quest.id}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              quest.completed
                ? "bg-emerald-500/10 border-emerald-500/30"
                : "bg-white/[0.02] border-white/5 hover:border-white/10"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${
                quest.completed ? "bg-emerald-500/20" : "bg-white/5"
              }`}
            >
              {quest.completed ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <span>{quest.icon}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${quest.completed ? "text-emerald-400" : "text-white"}`}>
                {quest.title}
              </p>
              <p className="text-xs text-gray-500 truncate">{quest.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="text-xs font-medium text-amber-400">+{quest.rewardXP}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
