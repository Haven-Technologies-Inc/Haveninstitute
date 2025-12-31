/**
 * Create Discussion Page - New post creation
 * Mobile-first responsive design for NCLEX nursing students
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, HelpCircle, MessageCircle, Lightbulb, FileText, 
  ClipboardList, Sparkles, X, Plus, Send
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { cn } from '../../components/ui/utils';
import type { PostType } from '../../types/discussions';

// Post types
const POST_TYPES: { type: PostType; label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string; description: string }[] = [
  { type: 'question', label: 'Question', icon: HelpCircle, color: 'text-blue-600', bg: 'bg-blue-100 border-blue-300', description: 'Ask the community for help' },
  { type: 'discussion', label: 'Discussion', icon: MessageCircle, color: 'text-purple-600', bg: 'bg-purple-100 border-purple-300', description: 'Start a conversation' },
  { type: 'study-tip', label: 'Study Tip', icon: Lightbulb, color: 'text-amber-600', bg: 'bg-amber-100 border-amber-300', description: 'Share study strategies' },
  { type: 'resource', label: 'Resource', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-100 border-emerald-300', description: 'Share helpful materials' },
  { type: 'case-study', label: 'Case Study', icon: ClipboardList, color: 'text-red-600', bg: 'bg-red-100 border-red-300', description: 'Discuss clinical scenarios' },
  { type: 'mnemonics', label: 'Mnemonic', icon: Sparkles, color: 'text-pink-600', bg: 'bg-pink-100 border-pink-300', description: 'Share memory tricks' },
];

// Categories
const CATEGORIES = [
  { id: '1', name: 'Safe & Effective Care', color: '#3b82f6' },
  { id: '2', name: 'Pharmacology', color: '#f59e0b' },
  { id: '3', name: 'NCLEX Strategy', color: '#06b6d4' },
  { id: '4', name: 'Lab Values', color: '#ec4899' },
  { id: '5', name: 'Psychosocial', color: '#8b5cf6' },
  { id: '6', name: 'Physiological Integrity', color: '#ef4444' },
  { id: '7', name: 'Health Promotion', color: '#10b981' },
  { id: '8', name: 'Clinical Skills', color: '#14b8a6' },
];

// Suggested tags
const SUGGESTED_TAGS = [
  'nclex-rn', 'nclex-pn', 'study-tips', 'mnemonics', 'lab-values',
  'pharmacology', 'priority', 'delegation', 'sata', 'med-surg',
  'pediatrics', 'maternity', 'mental-health', 'cardiac', 'respiratory'
];

export function CreateDiscussionPage() {
  const navigate = useNavigate();
  const [postType, setPostType] = useState<PostType>('question');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim().replace(/\s+/g, '-');
    if (normalizedTag && !tags.includes(normalizedTag) && tags.length < 5) {
      setTags([...tags, normalizedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !categoryId) return;
    
    setIsSubmitting(true);
    try {
      // TODO: API call to create post
      console.log('Creating post:', { postType, title, content, categoryId, tags });
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/app/discussions');
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = title.trim().length >= 10 && content.trim().length >= 20 && categoryId;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-3 sm:px-6 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
            New Discussion
          </h1>
          <Button 
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-9"
          >
            <Send className="size-4 mr-1.5" />
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Post Type Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">What would you like to share?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {POST_TYPES.map(({ type, label, icon: Icon, color, bg, description }) => (
                <button
                  key={type}
                  onClick={() => setPostType(type)}
                  className={cn(
                    'p-3 rounded-lg border-2 text-left transition-all',
                    postType === type 
                      ? `${bg} border-current ${color}` 
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  )}
                >
                  <Icon className={cn('size-5 mb-1.5', postType === type ? color : 'text-gray-400')} />
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{label}</div>
                  <div className="text-[10px] text-gray-500 hidden sm:block">{description}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Select a Category *</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5',
                    categoryId === cat.id
                      ? 'text-white shadow-md'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  )}
                  style={categoryId === cat.id ? { backgroundColor: cat.color } : undefined}
                >
                  <span 
                    className="size-2 rounded-full" 
                    style={{ backgroundColor: categoryId === cat.id ? 'white' : cat.color }}
                  />
                  {cat.name}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Title */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Title *</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                postType === 'question' 
                  ? "What's your nursing question?" 
                  : postType === 'study-tip'
                  ? "What study tip are you sharing?"
                  : postType === 'mnemonics'
                  ? "What's your mnemonic for?"
                  : "Give your post a clear title"
              }
              className="text-base"
              maxLength={150}
            />
            <div className="flex justify-between mt-1.5 text-xs text-gray-500">
              <span>{title.length < 10 ? `${10 - title.length} more characters needed` : '✓ Good title'}</span>
              <span>{title.length}/150</span>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Content *</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                postType === 'question'
                  ? "Describe your question in detail. Include what you've already tried and what confuses you."
                  : postType === 'study-tip'
                  ? "Share your study tip in detail. Explain how it helped you and how others can use it."
                  : postType === 'mnemonics'
                  ? "Share your mnemonic and explain what it helps remember."
                  : "Share your thoughts with the community..."
              }
              className="min-h-[150px] sm:min-h-[200px] text-sm resize-none"
            />
            <div className="flex justify-between mt-1.5 text-xs text-gray-500">
              <span>{content.length < 20 ? `${20 - content.length} more characters needed` : '✓ Good content'}</span>
              <span>{content.length} characters</span>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tags (optional)</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Selected tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                    #{tag}
                    <button 
                      onClick={() => handleRemoveTag(tag)}
                      className="p-0.5 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Tag input */}
            {tags.length < 5 && (
              <div className="flex gap-2 mb-3">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag(tagInput);
                    }
                  }}
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAddTag(tagInput)}
                  disabled={!tagInput.trim()}
                  title="Add tag"
                  aria-label="Add tag"
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            )}

            {/* Suggested tags */}
            <div>
              <Label className="text-xs text-gray-500 mb-2 block">Popular tags:</Label>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_TAGS.filter(t => !tags.includes(t)).slice(0, 10).map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleAddTag(tag)}
                    disabled={tags.length >= 5}
                    className="px-2 py-1 text-xs rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              💡 Tips for a great post
            </h3>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Be specific and provide context</li>
              <li>• For questions, explain what you've already tried</li>
              <li>• Use relevant tags to help others find your post</li>
              <li>• Be respectful and follow community guidelines</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CreateDiscussionPage;
