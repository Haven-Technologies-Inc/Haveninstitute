"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Send,
  X,
  Plus,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  Code,
  Eye,
  FileText,
  Sparkles,
  MessageSquare,
} from "lucide-react";

const fallbackCategories = [
  "Pharmacology",
  "Management of Care",
  "Safety & Infection Control",
  "Health Promotion",
  "Psychosocial Integrity",
  "Study Tips",
  "Test Strategy",
  "Clinical",
  "General",
];

export default function NewDiscussionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/discussions")
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data.categories) {
          setCategories(json.data.categories.map((c: any) => ({ id: c.id, name: c.name })));
        } else {
          setCategories(fallbackCategories.map((c, i) => ({ id: String(i), name: c })));
        }
      })
      .catch(() => {
        setCategories(fallbackCategories.map((c, i) => ({ id: String(i), name: c })));
      });
  }, []);

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, categoryId: category }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Discussion posted!");
        router.push("/community/discussions");
      } else {
        toast.error(json.error || "Failed to post");
      }
    } catch {
      toast.error("Failed to post discussion");
    } finally {
      setSubmitting(false);
    }
  };

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const isValid = title.trim().length > 0 && category && content.trim().length > 10;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">New Discussion</h1>
          <p className="text-muted-foreground mt-1">
            Share your question or knowledge with the community
          </p>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card glass>
          <CardContent className="p-6 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="What's your question or topic?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 text-base"
              />
              <p className="text-xs text-muted-foreground">
                Be specific and concise to get better responses.
              </p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Content <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-1">
                  <Button
                    variant={!isPreview ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setIsPreview(false)}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Write
                  </Button>
                  <Button
                    variant={isPreview ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setIsPreview(true)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                </div>
              </div>

              {/* Toolbar */}
              {!isPreview && (
                <div className="flex items-center gap-1 p-1.5 rounded-lg bg-muted/50 border border-border/50">
                  {[
                    { icon: Bold, label: "Bold" },
                    { icon: Italic, label: "Italic" },
                    { icon: List, label: "Bullet list" },
                    { icon: ListOrdered, label: "Numbered list" },
                    { icon: Link2, label: "Link" },
                    { icon: ImageIcon, label: "Image" },
                    { icon: Code, label: "Code" },
                  ].map(({ icon: Icon, label }) => (
                    <Button
                      key={label}
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      title={label}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </Button>
                  ))}
                </div>
              )}

              {isPreview ? (
                <div className="min-h-[200px] p-4 rounded-lg border border-border/50 bg-muted/20 prose prose-sm dark:prose-invert max-w-none">
                  {content ? (
                    <p className="whitespace-pre-wrap">{content}</p>
                  ) : (
                    <p className="text-muted-foreground italic">Nothing to preview yet...</p>
                  )}
                </div>
              ) : (
                <textarea
                  placeholder="Share your thoughts, questions, or knowledge. You can use markdown formatting..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full min-h-[200px] rounded-lg border border-input bg-background/60 px-4 py-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                />
              )}
              <p className="text-xs text-muted-foreground">
                Supports basic markdown formatting. Minimum 10 characters.
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tags (optional)</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs pl-2 pr-1 gap-1 cursor-pointer hover:bg-destructive/10 transition-colors"
                    onClick={() => removeTag(tag)}
                  >
                    #{tag}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="flex-1"
                />
                <Button variant="outline" onClick={addTag} disabled={tags.length >= 5}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Add up to 5 tags to help others find your discussion. Press Enter to add.
              </p>
            </div>

            <Separator />

            {/* AI Assist */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-500/10">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">AI Writing Assistant</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Let AI help you refine your question for clearer, more helpful responses.
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled={!content.trim()}>
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  Improve
                </Button>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between pt-2">
              <Button variant="ghost" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button disabled={!isValid || submitting} onClick={handleSubmit}>
                <Send className="mr-2 h-4 w-4" />
                {submitting ? "Posting..." : "Post Discussion"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 bg-muted/30">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Tips for a Great Discussion
            </h3>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li>- Be specific: Include the topic area and what you have already tried</li>
              <li>- Use proper formatting: Break your content into paragraphs for readability</li>
              <li>- Tag appropriately: Use relevant tags so others can find your discussion</li>
              <li>- Be respectful: Our community thrives on mutual support and encouragement</li>
              <li>- Follow up: Mark as resolved when you get a satisfactory answer</li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
