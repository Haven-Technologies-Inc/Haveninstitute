import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ArrowLeft, MessageSquare, ThumbsUp, MessageCircle, Search, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface ForumProps {
  onBack: () => void;
}

interface Post {
  id: number;
  author: string;
  avatar: string;
  title: string;
  content: string;
  category: string;
  replies: number;
  likes: number;
  timestamp: string;
  tags: string[];
}

const mockPosts: Post[] = [
  {
    id: 1,
    author: "Sarah M.",
    avatar: "SM",
    title: "Tips for remembering cardiac medications?",
    content: "I'm struggling to remember all the beta blockers and ACE inhibitors. Does anyone have good mnemonics or study strategies that worked for them?",
    category: "Pharmacology",
    replies: 12,
    likes: 24,
    timestamp: "2 hours ago",
    tags: ["medications", "cardiovascular", "study-tips"]
  },
  {
    id: 2,
    author: "James T.",
    avatar: "JT",
    title: "Question about priority nursing actions",
    content: "When you have a patient with both respiratory distress and chest pain, how do you prioritize? ABCs say airway first, but chest pain could be MI...",
    category: "Fundamentals",
    replies: 8,
    likes: 15,
    timestamp: "4 hours ago",
    tags: ["priority", "assessment", "nclex-strategy"]
  },
  {
    id: 3,
    author: "Emily R.",
    avatar: "ER",
    title: "CAT test scoring - need clarification",
    content: "Just took my first CAT test and got 75 questions. My passing probability was 72%. Is this good enough or should I keep studying?",
    category: "NCLEX Strategy",
    replies: 20,
    likes: 35,
    timestamp: "6 hours ago",
    tags: ["cat-test", "preparation", "advice-needed"]
  },
  {
    id: 4,
    author: "Michael K.",
    avatar: "MK",
    title: "Pediatric dosage calculations help",
    content: "Can someone explain how to calculate pediatric doses based on body weight? The formulas are confusing me.",
    category: "Pediatrics",
    replies: 15,
    likes: 28,
    timestamp: "8 hours ago",
    tags: ["calculations", "pediatrics", "math"]
  },
  {
    id: 5,
    author: "Lisa P.",
    avatar: "LP",
    title: "Passed NCLEX on first try! My study routine",
    content: "After 8 weeks of intense studying using this platform, I passed! Here's what worked for me: 1) Daily CAT tests, 2) Focused review of weak areas...",
    category: "Success Stories",
    replies: 45,
    likes: 120,
    timestamp: "1 day ago",
    tags: ["success", "study-plan", "motivation"]
  },
  {
    id: 6,
    author: "David W.",
    avatar: "DW",
    title: "Lab values - normal ranges chart?",
    content: "Does anyone have a good chart or flashcard set for normal lab values? I keep mixing them up.",
    category: "Fundamentals",
    replies: 10,
    likes: 22,
    timestamp: "1 day ago",
    tags: ["lab-values", "reference", "study-resources"]
  }
];

export function Forum({ onBack }: ForumProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showNewPost, setShowNewPost] = useState(false);

  const categories = ['All', 'Fundamentals', 'Pharmacology', 'Med-Surg', 'Pediatrics', 'Mental Health', 'Maternal-Newborn', 'NCLEX Strategy', 'Success Stories'];

  const filteredPosts = mockPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="size-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="size-6" />
                <h2>NurseHaven Community</h2>
              </div>
              <p className="text-gray-600">Connect with fellow nursing students and share knowledge</p>
            </div>
            <Button onClick={() => setShowNewPost(!showNewPost)}>
              <Plus className="size-4 mr-2" />
              New Post
            </Button>
          </div>
        </div>

        {/* New Post Form */}
        {showNewPost && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Post</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-700 mb-2 block">Title</label>
                  <Input placeholder="What's your question or topic?" />
                </div>
                <div>
                  <label className="text-gray-700 mb-2 block">Content</label>
                  <Textarea 
                    placeholder="Provide details, context, or share your experience..."
                    rows={6}
                  />
                </div>
                <div>
                  <label className="text-gray-700 mb-2 block">Category</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    {categories.slice(1).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1">Post to Forum</Button>
                  <Button variant="outline" onClick={() => setShowNewPost(false)}>Cancel</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select 
                className="p-2 border border-gray-300 rounded-md"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Popular Tags */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Popular Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {['nclex-strategy', 'study-tips', 'pharmacology', 'priority', 'calculations', 'lab-values', 'medications', 'success', 'advice-needed'].map(tag => (
                <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-gray-100">
                  #{tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Forum Posts */}
        <div className="space-y-4">
          {filteredPosts.map(post => (
            <Card key={post.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="size-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
                      {post.avatar}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="mb-1">{post.title}</h3>
                        <div className="flex items-center gap-2 text-gray-600">
                          <span>{post.author}</span>
                          <span>•</span>
                          <span>{post.timestamp}</span>
                          <Badge variant="secondary">{post.category}</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3 line-clamp-2">{post.content}</p>
                    
                    <div className="flex items-center gap-4 text-gray-600">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="size-4" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="size-4" />
                        <span>{post.replies} replies</span>
                      </div>
                      <div className="flex gap-2 ml-auto">
                        {post.tags.map(tag => (
                          <Badge key={tag} variant="outline">#{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredPosts.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="size-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No discussions found. Be the first to start one!</p>
              <Button className="mt-4" onClick={() => setShowNewPost(true)}>
                Create Post
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}