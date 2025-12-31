/**
 * AI Question Generator Component
 * Generate high-yield NCLEX questions using AI
 */

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Slider } from '../ui/slider';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Sparkles, Brain, Loader2, CheckCircle2, AlertCircle, XCircle, RefreshCw, Zap, Target, BookOpen, Stethoscope, Shield, Heart, Pill, Activity, Users, TrendingUp, ChevronRight, Info } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';

interface GenerationJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  totalBatches: number;
  completedBatches: number;
  generatedCount: number;
  savedCount: number;
  errors: string[];
  startedAt: string;
  completedAt?: string;
  estimatedTimeRemaining?: number;
}

type QuestionType = 'multiple_choice' | 'select_all' | 'ordered_response' | 'cloze_dropdown' | 'hot_spot' | 'matrix' | 'highlight' | 'bow_tie' | 'case_study';
type NCLEXCategory = 'management_of_care' | 'safety_infection_control' | 'health_promotion' | 'psychosocial_integrity' | 'basic_care_comfort' | 'pharmacological_therapies' | 'risk_reduction' | 'physiological_adaptation';
type Difficulty = 'easy' | 'medium' | 'hard';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

const QUESTION_TYPES = [
  { value: 'multiple_choice' as QuestionType, label: 'Multiple Choice', description: 'Single best answer', icon: <Target className="size-4" /> },
  { value: 'select_all' as QuestionType, label: 'Select All (SATA)', description: 'Multiple correct', icon: <CheckCircle2 className="size-4" /> },
  { value: 'ordered_response' as QuestionType, label: 'Ordered Response', description: 'Drag and drop', icon: <TrendingUp className="size-4" /> },
  { value: 'cloze_dropdown' as QuestionType, label: 'Cloze/Dropdown', description: 'Fill in blanks', icon: <BookOpen className="size-4" /> },
  { value: 'matrix' as QuestionType, label: 'Matrix/Grid', description: 'Table decisions', icon: <Activity className="size-4" /> },
  { value: 'bow_tie' as QuestionType, label: 'Bow-Tie', description: 'Clinical reasoning', icon: <Brain className="size-4" /> },
  { value: 'case_study' as QuestionType, label: 'Case Study', description: 'Extended scenarios', icon: <Stethoscope className="size-4" /> },
];

const NCLEX_CATEGORIES = [
  { value: 'management_of_care' as NCLEXCategory, label: 'Management of Care', weight: '17-23%', icon: <Users className="size-4" /> },
  { value: 'safety_infection_control' as NCLEXCategory, label: 'Safety & Infection Control', weight: '9-15%', icon: <Shield className="size-4" /> },
  { value: 'health_promotion' as NCLEXCategory, label: 'Health Promotion', weight: '6-12%', icon: <Heart className="size-4" /> },
  { value: 'psychosocial_integrity' as NCLEXCategory, label: 'Psychosocial Integrity', weight: '6-12%', icon: <Brain className="size-4" /> },
  { value: 'basic_care_comfort' as NCLEXCategory, label: 'Basic Care & Comfort', weight: '6-12%', icon: <Stethoscope className="size-4" /> },
  { value: 'pharmacological_therapies' as NCLEXCategory, label: 'Pharmacological Therapies', weight: '12-18%', icon: <Pill className="size-4" /> },
  { value: 'risk_reduction' as NCLEXCategory, label: 'Risk Reduction', weight: '9-15%', icon: <AlertCircle className="size-4" /> },
  { value: 'physiological_adaptation' as NCLEXCategory, label: 'Physiological Adaptation', weight: '11-17%', icon: <Activity className="size-4" /> },
];

export function AIQuestionGenerator({ open, onOpenChange, onComplete }: Props) {
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>(['multiple_choice']);
  const [selectedCategories, setSelectedCategories] = useState<NCLEXCategory[]>(['management_of_care']);
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>(['easy', 'medium', 'hard']);
  const [difficultyDistribution, setDifficultyDistribution] = useState({ easy: 20, medium: 50, hard: 30 });
  const [totalQuestions, setTotalQuestions] = useState(50);
  const [topics, setTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentJob, setCurrentJob] = useState<GenerationJob | null>(null);
  const [activeTab, setActiveTab] = useState('configure');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentJob && (currentJob.status === 'pending' || currentJob.status === 'processing')) {
      interval = setInterval(async () => {
        try {
          const response = await api.get(`/questions/generate/${currentJob.id}`);
          const job = response.data.data;
          setCurrentJob(job);
          if (job.status === 'completed') {
            toast.success(`Successfully generated ${job.savedCount} questions!`);
            setActiveTab('complete');
            onComplete?.();
          } else if (job.status === 'failed') {
            toast.error('Generation failed.');
            setActiveTab('complete');
          }
        } catch (error) {
          console.error('Failed to fetch job status:', error);
        }
      }, 2000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [currentJob, onComplete]);

  const toggleType = useCallback((type: QuestionType) => {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  }, []);

  const toggleCategory = useCallback((category: NCLEXCategory) => {
    setSelectedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
  }, []);

  const toggleDifficulty = useCallback((difficulty: Difficulty) => {
    setSelectedDifficulties(prev => prev.includes(difficulty) ? prev.filter(d => d !== difficulty) : [...prev, difficulty]);
  }, []);

  const addTopic = useCallback(() => {
    if (topicInput.trim() && !topics.includes(topicInput.trim())) {
      setTopics(prev => [...prev, topicInput.trim()]);
      setTopicInput('');
    }
  }, [topicInput, topics]);

  const startGeneration = async () => {
    if (selectedTypes.length === 0 || selectedCategories.length === 0 || selectedDifficulties.length === 0) {
      toast.error('Please select at least one option in each category');
      return;
    }
    setIsGenerating(true);
    setActiveTab('progress');
    try {
      const response = await api.post('/questions/generate', {
        questionTypes: selectedTypes,
        categories: selectedCategories,
        difficulties: selectedDifficulties,
        difficultyDistribution,
        totalQuestions,
        topics: topics.length > 0 ? topics : undefined,
      });
      const statusResponse = await api.get(`/questions/generate/${response.data.data.jobId}`);
      setCurrentJob(statusResponse.data.data);
      toast.success('Generation started!');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to start generation');
      setIsGenerating(false);
      setActiveTab('configure');
    }
  };

  const cancelGeneration = async () => {
    if (!currentJob) return;
    try {
      await api.delete(`/questions/generate/${currentJob.id}`);
      toast.info('Generation cancelled');
      setCurrentJob(prev => prev ? { ...prev, status: 'cancelled' } : null);
    } catch (error) {
      toast.error('Failed to cancel');
    }
  };

  const resetGenerator = () => {
    setCurrentJob(null);
    setIsGenerating(false);
    setActiveTab('configure');
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return 'Calculating...';
    if (seconds < 60) return `${seconds}s remaining`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s remaining`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-purple-500" />
            AI Question Generator
          </DialogTitle>
          <DialogDescription>
            Generate high-yield NCLEX questions. Questions are saved to your Question Bank.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="configure" disabled={isGenerating}>1. Configure</TabsTrigger>
            <TabsTrigger value="progress" disabled={!currentJob}>2. Progress</TabsTrigger>
            <TabsTrigger value="complete" disabled={!currentJob || (currentJob.status !== 'completed' && currentJob.status !== 'failed')}>3. Complete</TabsTrigger>
          </TabsList>

          <TabsContent value="configure" className="space-y-6 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="size-4 text-yellow-500" />
                  Number of Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Slider value={[totalQuestions]} onValueChange={([val]) => setTotalQuestions(val)} min={10} max={200} step={10} className="flex-1" />
                  <Input type="number" value={totalQuestions} onChange={(e) => setTotalQuestions(Math.min(200, Math.max(1, parseInt(e.target.value) || 10)))} className="w-20" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Generate 10-200 questions at a time.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2"><Target className="size-4 text-blue-500" />Question Types</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedTypes(QUESTION_TYPES.map(t => t.value))}>Select All</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {QUESTION_TYPES.map((type) => (
                    <div key={type.value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${selectedTypes.includes(type.value) ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => toggleType(type.value)}>
                      <Checkbox checked={selectedTypes.includes(type.value)} onCheckedChange={() => toggleType(type.value)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">{type.icon}<span className="font-medium text-sm">{type.label}</span></div>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2"><BookOpen className="size-4 text-green-500" />NCLEX Categories</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedCategories(NCLEX_CATEGORIES.map(c => c.value))}>Select All</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {NCLEX_CATEGORIES.map((cat) => (
                    <div key={cat.value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${selectedCategories.includes(cat.value) ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => toggleCategory(cat.value)}>
                      <Checkbox checked={selectedCategories.includes(cat.value)} onCheckedChange={() => toggleCategory(cat.value)} />
                      <div className="flex-1 min-w-0"><div className="flex items-center gap-2">{cat.icon}<span className="font-medium text-sm">{cat.label}</span></div></div>
                      <Badge variant="secondary" className="text-xs">{cat.weight}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="size-4 text-orange-500" />Difficulty</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
                    <div key={diff} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer ${selectedDifficulties.includes(diff) ? (diff === 'easy' ? 'border-green-500 bg-green-50' : diff === 'medium' ? 'border-yellow-500 bg-yellow-50' : 'border-red-500 bg-red-50') : 'border-gray-200'}`} onClick={() => toggleDifficulty(diff)}>
                      <Checkbox checked={selectedDifficulties.includes(diff)} onCheckedChange={() => toggleDifficulty(diff)} />
                      <span className="capitalize font-medium">{diff}</span>
                    </div>
                  ))}
                </div>
                {selectedDifficulties.length > 1 && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Distribution:</p>
                    {selectedDifficulties.includes('easy') && <div className="flex items-center gap-4"><Label className="w-20">Easy</Label><Slider value={[difficultyDistribution.easy]} onValueChange={([val]) => setDifficultyDistribution(prev => ({ ...prev, easy: val }))} min={0} max={100} className="flex-1" /><span className="w-12 text-right">{difficultyDistribution.easy}%</span></div>}
                    {selectedDifficulties.includes('medium') && <div className="flex items-center gap-4"><Label className="w-20">Medium</Label><Slider value={[difficultyDistribution.medium]} onValueChange={([val]) => setDifficultyDistribution(prev => ({ ...prev, medium: val }))} min={0} max={100} className="flex-1" /><span className="w-12 text-right">{difficultyDistribution.medium}%</span></div>}
                    {selectedDifficulties.includes('hard') && <div className="flex items-center gap-4"><Label className="w-20">Hard</Label><Slider value={[difficultyDistribution.hard]} onValueChange={([val]) => setDifficultyDistribution(prev => ({ ...prev, hard: val }))} min={0} max={100} className="flex-1" /><span className="w-12 text-right">{difficultyDistribution.hard}%</span></div>}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Info className="size-4 text-purple-500" />Topics (Optional)</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-3">
                  <Input placeholder="e.g., Diabetes, Heart Failure..." value={topicInput} onChange={(e) => setTopicInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTopic()} className="flex-1" />
                  <Button onClick={addTopic} variant="secondary">Add</Button>
                </div>
                {topics.length > 0 && <div className="flex flex-wrap gap-2">{topics.map((topic) => <Badge key={topic} variant="secondary" className="flex items-center gap-1">{topic}<XCircle className="size-3 cursor-pointer" onClick={() => setTopics(prev => prev.filter(t => t !== topic))} /></Badge>)}</div>}
              </CardContent>
            </Card>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 rounded-lg">
              <div><p className="font-medium">Ready to Generate</p><p className="text-sm text-muted-foreground">{totalQuestions} questions • {selectedTypes.length} types • {selectedCategories.length} categories</p></div>
              <Button onClick={startGeneration} className="bg-gradient-to-r from-purple-600 to-blue-600" disabled={selectedTypes.length === 0 || selectedCategories.length === 0}><Sparkles className="size-4 mr-2" />Generate</Button>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6 mt-4">
            {currentJob && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {currentJob.status === 'processing' && <Loader2 className="size-6 text-blue-500 animate-spin" />}
                    {currentJob.status === 'completed' && <CheckCircle2 className="size-6 text-green-500" />}
                    {currentJob.status === 'failed' && <XCircle className="size-6 text-red-500" />}
                    <div><p className="font-medium capitalize">{currentJob.status}</p><p className="text-sm text-muted-foreground">{formatTime(currentJob.estimatedTimeRemaining)}</p></div>
                  </div>
                  {currentJob.status === 'processing' && <Button variant="destructive" size="sm" onClick={cancelGeneration}>Cancel</Button>}
                </div>
                <div className="space-y-2"><div className="flex justify-between text-sm"><span>Progress</span><span>{currentJob.progress}%</span></div><Progress value={currentJob.progress} className="h-3" /></div>
                <div className="grid grid-cols-3 gap-4">
                  <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{currentJob.generatedCount}</div><p className="text-sm text-muted-foreground">Generated</p></CardContent></Card>
                  <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{currentJob.savedCount}</div><p className="text-sm text-muted-foreground">Saved</p></CardContent></Card>
                  <Card><CardContent className="pt-4"><div className="text-2xl font-bold">{currentJob.completedBatches}/{currentJob.totalBatches}</div><p className="text-sm text-muted-foreground">Batches</p></CardContent></Card>
                </div>
                {currentJob.errors.length > 0 && <Card className="border-yellow-200 bg-yellow-50"><CardContent className="pt-4"><ul className="text-sm text-yellow-700">{currentJob.errors.slice(0, 5).map((e, i) => <li key={i} className="flex items-start gap-2"><ChevronRight className="size-3 mt-1" />{e}</li>)}</ul></CardContent></Card>}
                {currentJob.status === 'processing' && <div className="flex justify-center py-8"><Brain className="size-16 text-purple-500 animate-pulse" /></div>}
              </div>
            )}
          </TabsContent>

          <TabsContent value="complete" className="space-y-6 mt-4">
            {currentJob?.status === 'completed' && (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center size-20 rounded-full bg-green-100 mb-4"><CheckCircle2 className="size-10 text-green-600" /></div>
                <h3 className="text-xl font-semibold mb-2">Complete!</h3>
                <p className="text-muted-foreground mb-6">Generated {currentJob.savedCount} questions.</p>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={resetGenerator}><RefreshCw className="size-4 mr-2" />Generate More</Button>
                  <Button onClick={() => onOpenChange(false)}>View Questions</Button>
                </div>
              </div>
            )}
            {currentJob?.status === 'failed' && (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center size-20 rounded-full bg-red-100 mb-4"><XCircle className="size-10 text-red-600" /></div>
                <h3 className="text-xl font-semibold mb-2">Failed</h3>
                <p className="text-muted-foreground mb-4">{currentJob.savedCount > 0 ? `${currentJob.savedCount} questions saved before error.` : 'Please try again.'}</p>
                <Button onClick={resetGenerator}><RefreshCw className="size-4 mr-2" />Try Again</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default AIQuestionGenerator;
