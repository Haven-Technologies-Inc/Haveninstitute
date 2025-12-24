import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { 
  Upload, 
  File, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  X,
  Plus,
  Save,
  Loader2
} from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

interface ParsedQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number | number[];
  explanation: string;
  category: string;
  difficulty: string;
  questionType: string;
  source: string;
}

const NCLEX_CATEGORIES = [
  { value: 'management-of-care', label: 'Management of Care' },
  { value: 'safety-infection-control', label: 'Safety & Infection Control' },
  { value: 'health-promotion-maintenance', label: 'Health Promotion' },
  { value: 'psychosocial-integrity', label: 'Psychosocial Integrity' },
  { value: 'basic-care-comfort', label: 'Basic Care & Comfort' },
  { value: 'pharmacological-therapies', label: 'Pharmacological Therapies' },
  { value: 'reduction-risk-potential', label: 'Risk Reduction' },
  { value: 'physiological-adaptation', label: 'Physiological Adaptation' }
];

const QUESTION_TYPES = [
  { value: 'multiple-choice', label: 'Multiple Choice (Single Answer)' },
  { value: 'select-all', label: 'Select All That Apply (SATA)' },
  { value: 'fill-blank', label: 'Fill in the Blank' },
  { value: 'ordered-response', label: 'Ordered Response (Drag & Drop)' },
  { value: 'hot-spot', label: 'Hot Spot (Image)' },
  { value: 'chart-exhibit', label: 'Chart/Exhibit' }
];

const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' }
];

export function QuestionUpload() {
  const [uploadMethod, setUploadMethod] = useState<'file' | 'manual'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState('');
  const [questionType, setQuestionType] = useState('multiple-choice');
  const [difficulty, setDifficulty] = useState('medium');
  const [parsing, setParsing] = useState(false);
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Manual question entry state
  const [manualQuestion, setManualQuestion] = useState('');
  const [manualOptions, setManualOptions] = useState(['', '', '', '']);
  const [manualCorrectAnswer, setManualCorrectAnswer] = useState(0);
  const [manualExplanation, setManualExplanation] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus('idle');
    }
  };

  const parseFile = async () => {
    if (!selectedFile || !category) {
      toast.error('Please select a file and category');
      return;
    }

    setParsing(true);
    setUploadStatus('idle');

    try {
      const token = localStorage.getItem('haven_token');
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('category', category);
      formData.append('difficulty', difficulty);
      formData.append('questionType', questionType);

      // Call backend API to parse and preview questions
      const response = await fetch(`${API_BASE_URL}/questions/import/preview`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to parse file');
      }

      // Transform backend response to frontend format
      const transformedQuestions: ParsedQuestion[] = data.data.questions.map((q: any, index: number) => ({
        id: `q-${Date.now()}-${index}`,
        question: q.text,
        options: q.options.map((opt: any) => opt.text),
        correctAnswer: q.correctAnswers.length > 1 
          ? q.correctAnswers.map((a: string) => a.charCodeAt(0) - 65)
          : q.correctAnswers[0]?.charCodeAt(0) - 65 || 0,
        explanation: q.explanation || '',
        category: q.category || category,
        difficulty: q.difficulty || difficulty,
        questionType: q.questionType || questionType,
        source: q.source || selectedFile.name,
      }));

      setParsedQuestions(transformedQuestions);
      setUploadStatus('success');
      
      toast.success(`Found ${data.data.totalFound} questions in the document`);
      
      if (data.data.errors && data.data.errors.length > 0) {
        toast.warning(`${data.data.errors.length} rows had parsing issues`);
      }

    } catch (error) {
      console.error('Parse error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to parse file');
      setUploadStatus('error');
    } finally {
      setParsing(false);
    }
  };

  const [saving, setSaving] = useState(false);

  const handleSaveQuestions = async () => {
    if (parsedQuestions.length === 0) {
      toast.error('No questions to save');
      return;
    }

    setSaving(true);
    
    try {
      const token = localStorage.getItem('haven_token');
      const formData = new FormData();
      formData.append('file', selectedFile!);
      formData.append('category', category);
      formData.append('difficulty', difficulty);
      formData.append('questionType', questionType);

      // Call backend API to import questions
      const response = await fetch(`${API_BASE_URL}/questions/import/file`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to save questions');
      }

      toast.success(`Successfully imported ${data.data.imported} questions to the question bank!`);
      
      if (data.data.failed > 0) {
        toast.warning(`${data.data.failed} questions failed to import`);
      }

      // Reset state
      setParsedQuestions([]);
      setSelectedFile(null);
      setUploadStatus('idle');

    } catch (error) {
      console.error('Save error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save questions');
    } finally {
      setSaving(false);
    }
  };

  const handleManualSave = () => {
    if (!manualQuestion || !category || manualOptions.some(opt => !opt)) {
      alert('Please fill in all fields');
      return;
    }

    const newQuestion: ParsedQuestion = {
      id: `q-${Date.now()}`,
      question: manualQuestion,
      options: manualOptions,
      correctAnswer: manualCorrectAnswer,
      explanation: manualExplanation,
      category: category,
      difficulty: difficulty,
      questionType: questionType,
      source: 'Manual Entry'
    };

    console.log('Saving manual question:', newQuestion);
    alert('Question saved successfully!');
    
    // Reset form
    setManualQuestion('');
    setManualOptions(['', '', '', '']);
    setManualCorrectAnswer(0);
    setManualExplanation('');
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...manualOptions];
    newOptions[index] = value;
    setManualOptions(newOptions);
  };

  const addOption = () => {
    setManualOptions([...manualOptions, '']);
  };

  const removeOption = (index: number) => {
    if (manualOptions.length <= 2) return;
    const newOptions = manualOptions.filter((_, i) => i !== index);
    setManualOptions(newOptions);
    if (manualCorrectAnswer >= newOptions.length) {
      setManualCorrectAnswer(newOptions.length - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Method Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Method</CardTitle>
          <CardDescription>Choose how you want to add questions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={uploadMethod === 'file' ? 'default' : 'outline'}
              className="h-32 flex flex-col gap-3"
              onClick={() => setUploadMethod('file')}
            >
              <Upload className="size-8" />
              <div>
                <div>Bulk Upload</div>
                <div className="text-xs opacity-70">PDF, Word, Excel</div>
              </div>
            </Button>
            <Button
              variant={uploadMethod === 'manual' ? 'default' : 'outline'}
              className="h-32 flex flex-col gap-3"
              onClick={() => setUploadMethod('manual')}
            >
              <FileText className="size-8" />
              <div>
                <div>Manual Entry</div>
                <div className="text-xs opacity-70">Add one question</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File Upload Section */}
      {uploadMethod === 'file' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Upload Questions File</CardTitle>
              <CardDescription>
                Upload PDF, Word (DOC/DOCX), or Excel (XLS/XLSX) files containing questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Category and Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-700 mb-2 block">NCLEX Category *</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">Select category...</option>
                    {NCLEX_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray-700 mb-2 block">Question Type *</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value)}
                  >
                    {QUESTION_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray-700 mb-2 block">Difficulty Level</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    {DIFFICULTY_LEVELS.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* File Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                {!selectedFile ? (
                  <>
                    <Upload className="size-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      Drag and drop your file here, or click to browse
                    </p>
                    <p className="text-gray-500 mb-4">
                      Supported formats: PDF, DOC, DOCX, XLS, XLSX (Max 10MB)
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <Button asChild>
                        <span>Choose File</span>
                      </Button>
                    </label>
                  </>
                ) : (
                  <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <File className="size-8 text-blue-600" />
                      <div className="text-left">
                        <p className="text-gray-900">{selectedFile.name}</p>
                        <p className="text-gray-600">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* File Format Guide */}
              <Alert>
                <AlertCircle className="size-4" />
                <AlertDescription>
                  <strong>File Format Guide:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><strong>Excel:</strong> Column A: Question, Columns B-E: Options, Column F: Correct Answer (1-4), Column G: Explanation</li>
                    <li><strong>Word/PDF:</strong> Use format - Question: [text], Options: A) B) C) D), Answer: [letter], Explanation: [text]</li>
                    <li>Each question should be clearly separated (blank line or page break)</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* Parse Button */}
              <Button 
                className="w-full"
                onClick={parseFile}
                disabled={!selectedFile || !category || parsing}
              >
                {parsing ? (
                  <>Processing File...</>
                ) : (
                  <>
                    <Upload className="size-4 mr-2" />
                    Parse and Preview Questions
                  </>
                )}
              </Button>

              {/* Upload Status */}
              {uploadStatus === 'success' && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="size-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Successfully parsed {parsedQuestions.length} questions! Review below and save when ready.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Parsed Questions Preview */}
          {parsedQuestions.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Preview Parsed Questions</CardTitle>
                    <CardDescription>
                      Review and edit questions before saving to database
                    </CardDescription>
                  </div>
                  <Button onClick={handleSaveQuestions} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="size-4 mr-2" />
                        Save All ({parsedQuestions.length})
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {parsedQuestions.map((q, index) => (
                  <Card key={q.id} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Badge>Question {index + 1}</Badge>
                          <Badge variant="outline">{q.questionType}</Badge>
                          <Badge variant="secondary">{q.difficulty}</Badge>
                        </div>
                        <Button variant="ghost" size="sm">
                          <X className="size-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-gray-700 mb-2 block">Question</label>
                        <Textarea value={q.question} rows={2} />
                      </div>
                      
                      <div>
                        <label className="text-gray-700 mb-2 block">Options</label>
                        <div className="space-y-2">
                          {q.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2">
                              <Badge variant={
                                (Array.isArray(q.correctAnswer) ? 
                                  q.correctAnswer.includes(optIndex) : 
                                  q.correctAnswer === optIndex) ? 
                                'default' : 'outline'
                              }>
                                {String.fromCharCode(65 + optIndex)}
                              </Badge>
                              <Input value={option} className="flex-1" />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-gray-700 mb-2 block">Explanation</label>
                        <Textarea value={q.explanation} rows={2} />
                      </div>

                      <div className="flex items-center gap-4 text-gray-600">
                        <span>Category: {q.category}</span>
                        <span>•</span>
                        <span>Source: {q.source}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Manual Entry Section */}
      {uploadMethod === 'manual' && (
        <Card>
          <CardHeader>
            <CardTitle>Add Question Manually</CardTitle>
            <CardDescription>Create a single question with all details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Category and Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-gray-700 mb-2 block">NCLEX Category *</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select category...</option>
                  {NCLEX_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-700 mb-2 block">Question Type *</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value)}
                >
                  {QUESTION_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-700 mb-2 block">Difficulty Level</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  {DIFFICULTY_LEVELS.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Question Text */}
            <div>
              <label className="text-gray-700 mb-2 block">Question Text *</label>
              <Textarea
                placeholder="Enter the question text..."
                value={manualQuestion}
                onChange={(e) => setManualQuestion(e.target.value)}
                rows={3}
              />
            </div>

            {/* Options */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-gray-700">Answer Options *</label>
                <Button variant="outline" size="sm" onClick={addOption}>
                  <Plus className="size-4 mr-2" />
                  Add Option
                </Button>
              </div>
              <div className="space-y-3">
                {manualOptions.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct-answer"
                      checked={manualCorrectAnswer === index}
                      onChange={() => setManualCorrectAnswer(index)}
                      className="size-4"
                    />
                    <Badge>{String.fromCharCode(65 + index)}</Badge>
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      className="flex-1"
                    />
                    {manualOptions.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                      >
                        <X className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-gray-500 mt-2">Select the correct answer by clicking the radio button</p>
            </div>

            {/* Explanation */}
            <div>
              <label className="text-gray-700 mb-2 block">Explanation/Rationale *</label>
              <Textarea
                placeholder="Explain why the correct answer is right and why others are wrong..."
                value={manualExplanation}
                onChange={(e) => setManualExplanation(e.target.value)}
                rows={4}
              />
            </div>

            {/* Save Button */}
            <Button className="w-full" onClick={handleManualSave}>
              <Save className="size-4 mr-2" />
              Save Question
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
