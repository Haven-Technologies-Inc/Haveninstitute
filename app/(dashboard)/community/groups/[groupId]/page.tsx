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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Users,
  MessageSquare,
  Send,
  Paperclip,
  Settings,
  Crown,
  Shield,
  MoreVertical,
  FileText,
  Download,
  Image as ImageIcon,
  Globe,
  Bell,
  BellOff,
  UserPlus,
  LogOut,
  Search,
} from "lucide-react";

const group = {
  id: "grp-1",
  name: "NCLEX Warriors 2026",
  description: "A supportive study group for Feb/March 2026 NCLEX test-takers. We share resources, quiz each other, and keep each other accountable. All experience levels welcome!",
  members: 48,
  maxMembers: 50,
  isPublic: true,
  createdAt: "Jan 15, 2026",
  avatar: null,
};

const chatMessages = [
  {
    id: 1,
    user: { name: "Sarah Chen", avatar: null },
    message: "Has anyone tried the new pharmacology practice set? The dosage calculations are really tricky.",
    time: "2:30 PM",
    isOwn: false,
  },
  {
    id: 2,
    user: { name: "Marcus Johnson", avatar: null },
    message: "Yes! I got a 72% on my first attempt. The IV drip rate questions were the hardest for me.",
    time: "2:32 PM",
    isOwn: false,
  },
  {
    id: 3,
    user: { name: "You", avatar: null },
    message: "I found a great mnemonic for remembering the common drug interactions. Happy to share!",
    time: "2:35 PM",
    isOwn: true,
  },
  {
    id: 4,
    user: { name: "Emily Rodriguez", avatar: null },
    message: "Please do! I struggle with drug interactions the most. Also, is anyone doing a CAT simulation this weekend?",
    time: "2:38 PM",
    isOwn: false,
  },
  {
    id: 5,
    user: { name: "David Kim", avatar: null },
    message: "I am! We could do a group session and compare results. Saturday at 2 PM?",
    time: "2:40 PM",
    isOwn: false,
  },
  {
    id: 6,
    user: { name: "Sarah Chen", avatar: null },
    message: "Count me in! Let's meet in the study room after. I'll share my weak areas analysis.",
    time: "2:42 PM",
    isOwn: false,
  },
  {
    id: 7,
    user: { name: "You", avatar: null },
    message: "Saturday works for me too. I'll prepare a quick review of the pharmacology mnemonics to share before we start.",
    time: "2:45 PM",
    isOwn: true,
  },
];

const members = [
  { name: "You", role: "admin", online: true, score: "82%", joined: "Jan 15" },
  { name: "Sarah Chen", role: "moderator", online: true, score: "78%", joined: "Jan 16" },
  { name: "Marcus Johnson", role: "member", online: true, score: "72%", joined: "Jan 18" },
  { name: "Emily Rodriguez", role: "member", online: true, score: "68%", joined: "Jan 20" },
  { name: "David Kim", role: "member", online: false, score: "85%", joined: "Jan 22" },
  { name: "Jessica Park", role: "member", online: false, score: "74%", joined: "Jan 25" },
  { name: "Alex Thompson", role: "member", online: false, score: "71%", joined: "Feb 1" },
  { name: "Maria Garcia", role: "member", online: true, score: "77%", joined: "Feb 3" },
];

const sharedFiles = [
  { name: "Pharmacology Cheat Sheet.pdf", type: "pdf", size: "2.4 MB", author: "Sarah Chen", date: "Feb 18" },
  { name: "NCLEX Study Schedule Template.xlsx", type: "sheet", size: "156 KB", author: "You", date: "Feb 15" },
  { name: "Drug Interaction Mnemonics.pdf", type: "pdf", size: "1.8 MB", author: "Marcus Johnson", date: "Feb 12" },
  { name: "CAT Simulation Tips.docx", type: "doc", size: "340 KB", author: "David Kim", date: "Feb 10" },
  { name: "Lab Values Quick Reference.png", type: "image", size: "890 KB", author: "Emily Rodriguez", date: "Feb 8" },
];

export default function GroupDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("chat");
  const [messageInput, setMessageInput] = useState("");

  return (
    <div className="space-y-6">
      {/* Group Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card glass className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()} className="shrink-0 mt-1">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold truncate">{group.name}</h1>
                  <Badge variant="secondary" className="text-[10px]">
                    <Globe className="h-2.5 w-2.5 mr-1" />
                    Public
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{group.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {group.members}/{group.maxMembers} members
                  </span>
                  <span>Created {group.createdAt}</span>
                  <div className="flex -space-x-1.5">
                    {members.slice(0, 4).map((m, i) => (
                      <Avatar key={i} className="h-5 w-5 border-2 border-background">
                        <AvatarFallback className="text-[7px] bg-muted">{getInitials(m.name)}</AvatarFallback>
                      </Avatar>
                    ))}
                    <div className="h-5 w-5 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[7px] font-medium">
                      +{group.members - 4}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="ghost" size="icon">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:inline-flex">
          <TabsTrigger value="chat">
            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="h-3.5 w-3.5 mr-1.5" />
            Members
          </TabsTrigger>
          <TabsTrigger value="files">
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Files
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-3.5 w-3.5 mr-1.5" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="mt-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card glass className="overflow-hidden">
              {/* Messages Area */}
              <div className="h-[500px] overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={cn(
                      "flex gap-3",
                      msg.isOwn && "flex-row-reverse"
                    )}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="text-xs bg-muted">
                        {getInitials(msg.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn("max-w-[70%]", msg.isOwn && "text-right")}>
                      <div className="flex items-center gap-2 mb-1">
                        {!msg.isOwn && (
                          <span className="text-xs font-medium">{msg.user.name}</span>
                        )}
                        <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                      </div>
                      <div
                        className={cn(
                          "inline-block px-4 py-2.5 rounded-2xl text-sm",
                          msg.isOwn
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted/60 rounded-bl-md"
                        )}
                      >
                        {msg.message}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Separator />

              {/* Message Input */}
              <div className="p-4 flex items-center gap-3">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && messageInput.trim()) {
                      setMessageInput("");
                    }
                  }}
                />
                <Button size="icon" disabled={!messageInput.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="mt-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card glass>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{group.members} Members</CardTitle>
                  <div className="relative w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input placeholder="Search members..." className="pl-9 h-8 text-xs" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {members.map((member, i) => (
                  <motion.div
                    key={member.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="relative">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      {member.online && (
                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{member.name}</span>
                        {member.role === "admin" && (
                          <Badge variant="default" className="text-[9px] px-1.5 h-4">
                            <Crown className="h-2.5 w-2.5 mr-0.5" />
                            Admin
                          </Badge>
                        )}
                        {member.role === "moderator" && (
                          <Badge variant="secondary" className="text-[9px] px-1.5 h-4">
                            <Shield className="h-2.5 w-2.5 mr-0.5" />
                            Mod
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Joined {member.joined} - Avg Score: {member.score}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files" className="mt-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card glass>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Shared Files</CardTitle>
                  <Button variant="outline" size="sm">
                    <Paperclip className="mr-2 h-3.5 w-3.5" />
                    Upload File
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {sharedFiles.map((file, i) => (
                  <motion.div
                    key={file.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
                  >
                    <div
                      className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                        file.type === "pdf" && "bg-red-500/10",
                        file.type === "sheet" && "bg-emerald-500/10",
                        file.type === "doc" && "bg-blue-500/10",
                        file.type === "image" && "bg-purple-500/10"
                      )}
                    >
                      {file.type === "image" ? (
                        <ImageIcon
                          className={cn(
                            "h-5 w-5",
                            "text-purple-500"
                          )}
                        />
                      ) : (
                        <FileText
                          className={cn(
                            "h-5 w-5",
                            file.type === "pdf" && "text-red-500",
                            file.type === "sheet" && "text-emerald-500",
                            file.type === "doc" && "text-blue-500"
                          )}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.author} - {file.date} - {file.size}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <Card glass>
              <CardHeader>
                <CardTitle className="text-base">Group Settings</CardTitle>
                <CardDescription>Manage your group preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Group Name</label>
                  <Input defaultValue={group.name} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    className="w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                    defaultValue={group.description}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive alerts for new messages</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Bell className="mr-2 h-3.5 w-3.5" />
                    Enabled
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-destructive">Leave Group</p>
                    <p className="text-xs text-muted-foreground">You can rejoin later if the group is public</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <LogOut className="mr-2 h-3.5 w-3.5" />
                    Leave
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
