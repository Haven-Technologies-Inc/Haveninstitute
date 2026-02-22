"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Plus,
  Users,
  MessageSquare,
  TrendingUp,
  Crown,
  ArrowRight,
  Globe,
  Lock,
  Flame,
  Star,
  BookOpen,
  Brain,
  Zap,
} from "lucide-react";

const myGroups = [
  {
    id: "grp-1",
    name: "NCLEX Warriors 2026",
    description: "Study group for Feb/March 2026 test-takers",
    members: 48,
    maxMembers: 50,
    isPublic: true,
    avatar: null,
    lastActive: "2 min ago",
    unreadMessages: 5,
    role: "admin",
  },
  {
    id: "grp-2",
    name: "Pharmacology Study Buddies",
    description: "Focused on mastering drug calculations and classifications",
    members: 23,
    maxMembers: 30,
    isPublic: true,
    avatar: null,
    lastActive: "1h ago",
    unreadMessages: 0,
    role: "member",
  },
];

const publicGroups = [
  {
    id: "grp-3",
    name: "Critical Care NCLEX Prep",
    description: "For those focused on ICU/critical care nursing questions and scenarios.",
    members: 89,
    maxMembers: 100,
    isPublic: true,
    avatar: null,
    tags: ["Critical Care", "Advanced"],
    trending: true,
  },
  {
    id: "grp-4",
    name: "Pediatric Nursing Masters",
    description: "Comprehensive peds prep covering growth & development, common conditions.",
    members: 56,
    maxMembers: 75,
    isPublic: true,
    avatar: null,
    tags: ["Pediatrics", "Specialty"],
    trending: false,
  },
  {
    id: "grp-5",
    name: "Mental Health & Psych NCLEX",
    description: "Dedicated to psychosocial integrity and therapeutic communication.",
    members: 34,
    maxMembers: 50,
    isPublic: true,
    avatar: null,
    tags: ["Psych", "Communication"],
    trending: true,
  },
  {
    id: "grp-6",
    name: "Maternity & OB Study Group",
    description: "Labor & delivery, prenatal, postpartum and newborn care prep.",
    members: 42,
    maxMembers: 60,
    isPublic: true,
    avatar: null,
    tags: ["Maternity", "OB"],
    trending: false,
  },
  {
    id: "grp-7",
    name: "NCLEX Quick Quiz Crew",
    description: "Daily quiz challenges to keep your knowledge sharp. All welcome!",
    members: 112,
    maxMembers: 150,
    isPublic: true,
    avatar: null,
    tags: ["Daily Quiz", "Active"],
    trending: true,
  },
  {
    id: "grp-8",
    name: "International Nurses NCLEX",
    description: "Support group for internationally educated nurses preparing for NCLEX.",
    members: 67,
    maxMembers: 100,
    isPublic: true,
    avatar: null,
    tags: ["International", "Support"],
    trending: false,
  },
];

const groupColors = [
  "from-indigo-500 to-blue-600",
  "from-purple-500 to-pink-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-red-600",
  "from-cyan-500 to-blue-600",
];

export default function StudyGroupsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGroups = publicGroups.filter(
    (g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Study Groups</h1>
          <p className="text-muted-foreground mt-1">
            Collaborate and learn with fellow NCLEX candidates
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search study groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 bg-background/60 backdrop-blur-sm"
        />
      </motion.div>

      {/* My Groups */}
      {myGroups.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">My Groups</h2>
            <Badge variant="secondary">{myGroups.length} groups</Badge>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {myGroups.map((group, i) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
              >
                <Link href={`/community/groups/${group.id}`}>
                  <Card glass className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            "h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-lg",
                            groupColors[i % groupColors.length]
                          )}
                        >
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm truncate">{group.name}</h3>
                            {group.role === "admin" && (
                              <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                            {group.description}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {group.members}/{group.maxMembers}
                            </span>
                            <span>{group.lastActive}</span>
                            {group.unreadMessages > 0 && (
                              <Badge variant="default" className="text-[9px] h-5 px-1.5">
                                {group.unreadMessages} new
                              </Badge>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Trending Groups */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Flame className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold">Trending Groups</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups
            .filter((g) => g.trending)
            .map((group, i) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 + i * 0.05 }}
              >
                <Card glass className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 h-full">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={cn(
                          "h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-md",
                          groupColors[(i + 2) % groupColors.length]
                        )}
                      >
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm">{group.name}</h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Users className="h-3 w-3" />
                          {group.members} members
                          <Flame className="h-3 w-3 text-orange-500 ml-1" />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-1">
                      {group.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {group.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Join Group
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
        </div>
      </motion.div>

      {/* All Public Groups */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Discover Groups</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGroups.map((group, i) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.04 }}
            >
              <Card glass className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 h-full">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0",
                        groupColors[i % groupColors.length]
                      )}
                    >
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{group.name}</h3>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        {group.isPublic ? (
                          <>
                            <Globe className="h-3 w-3" /> Public
                          </>
                        ) : (
                          <>
                            <Lock className="h-3 w-3" /> Private
                          </>
                        )}
                        <span className="mx-1">-</span>
                        <Users className="h-3 w-3" /> {group.members}/{group.maxMembers}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-1">
                    {group.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {group.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {Array.from({ length: Math.min(3, group.members) }).map((_, j) => (
                        <Avatar key={j} className="h-6 w-6 border-2 border-background">
                          <AvatarFallback className="text-[8px] bg-muted">
                            {String.fromCharCode(65 + j)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {group.members > 3 && (
                        <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[8px] font-medium">
                          +{group.members - 3}
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      Join
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
