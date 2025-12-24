/**
 * Question Management Page
 * Upload, create, and manage NextGen NCLEX questions
 * Supports all question types with templates
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Upload,
  Download,
  FileText,
  Search,
  Filter,
  Edit,
  Trash2,
  Copy,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Book
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { 
  NCLEX_CATEGORIES, 
  type NCLEXCategory, 
  type QuestionType,
  getQuestionTypeName
} from '../../types/nextGenNCLEX';
import { QuestionCreatorForm } from '../../components/admin/QuestionCreatorForm';
import { generateQuestionTemplate } from '../../utils/questionTemplates';

// Question type info for selection
const QUESTION_TYPES: { 
  id: QuestionType; 
  name: string; 
  icon: string; 
  description: string;
  complexity: 'Basic' | 'Intermediate' | 'Advanced';
}[] = [
  { 
    id: 'multiple-choice', 
    name: 'Multiple Choice', 
    icon: '○', 
    description: 'Single correct answer from 4 options',
    complexity: 'Basic'
  },
  { 
    id: 'select-all', 
    name: 'Select All That Apply (SATA)', 
    icon: '☑', 
    description: 'Multiple correct answers possible',
    complexity: 'Basic'
  },
  { 
    id: 'ordered-response', 
    name: 'Ordered Response', 
    icon: '⇅', 
    description: 'Drag and drop items in correct sequence',
    complexity: 'Intermediate'
  },
  { 
    id: 'cloze-dropdown', 
    name: 'Drop-Down Cloze', 
    icon: '▼', 
    description: 'Fill in blanks with dropdown selections',
    complexity: 'Intermediate'
  },
  { 
    id: 'matrix', 
    name: 'Matrix/Grid', 
    icon: '▦', 
    description: 'Table-based answer selection',
    complexity: 'Intermediate'
  },
  { 
    id: 'highlight', 
    name: 'Highlight', 
    icon: '🖍', 
    description: 'Select relevant text from a passage',
    complexity: 'Advanced'
  },
  { 
    id: 'bow-tie', 
    name: 'Bow-Tie', 
    icon: '⋈', 
    description: 'Clinical reasoning with causes, condition, and actions',
    complexity: 'Advanced'
  },
  { 
    id: 'hot-spot', 
    name: 'Hot Spot', 
    icon: '◎', 
    description: 'Click on correct area of an image',
    complexity: 'Advanced'
  },
  { 
    id: 'case-study', 
    name: 'Case Study', 
    icon: '📋', 
    description: 'Extended scenario with multiple questions',
    complexity: 'Advanced'
  },
];

export default function QuestionManagementPage() {
  const navigate = useNavigate();
  
  // State
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'templates'>('create');
  const [selectedType, setSelectedType] = useState<QuestionType | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<NCLEXCategory | 'all'>('all');
  const [filterType, setFilterType] = useState<QuestionType | 'all'>('all');

  const handleCreateQuestion = (type: QuestionType) => {
    setSelectedType(type);
    setShowCreateDialog(true);
  };

  const handleDownloadTemplate = (type: QuestionType, format: 'word' | 'pdf') => {
    generateQuestionTemplate(type, format);
  };

  const handleDownloadAllTemplates = (format: 'word' | 'pdf') => {
    QUESTION_TYPES.forEach(qt => {
      generateQuestionTemplate(qt.id, format);
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-7 h-7 text-blue-600" />
              Question Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create, upload, and manage NextGen NCLEX questions
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleDownloadAllTemplates('word')}>
            <Download className="w-4 h-4 mr-2" />
            All Templates
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'create', label: 'Create Questions', icon: Plus },
          { id: 'manage', label: 'Manage Questions', icon: Edit },
          { id: 'templates', label: 'Templates', icon: FileSpreadsheet },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Create Questions Tab */}
      {activeTab === 'create' && (
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-2 border-dashed border-blue-300 bg-blue-50/50 dark:bg-blue-900/20 hover:border-blue-500 cursor-pointer transition-colors">
              <CardContent className="pt-6 text-center">
                <Upload className="w-12 h-12 mx-auto text-blue-600 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Bulk Upload</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload questions from CSV or Excel
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-dashed border-green-300 bg-green-50/50 dark:bg-green-900/20 hover:border-green-500 cursor-pointer transition-colors">
              <CardContent className="pt-6 text-center">
                <Copy className="w-12 h-12 mx-auto text-green-600 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Import from Template</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use Word/PDF template format
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-dashed border-purple-300 bg-purple-50/50 dark:bg-purple-900/20 hover:border-purple-500 cursor-pointer transition-colors">
              <CardContent className="pt-6 text-center">
                <Book className="w-12 h-12 mx-auto text-purple-600 mb-3" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">AI Generate</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generate questions from content
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Question Types Grid */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Select Question Type to Create</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {QUESTION_TYPES.map(qType => (
                <Card 
                  key={qType.id}
                  className="hover:border-blue-400 cursor-pointer transition-all hover:shadow-md"
                  onClick={() => handleCreateQuestion(qType.id)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl">
                        {qType.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {qType.name}
                          </h3>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              qType.complexity === 'Basic' ? 'bg-green-100 text-green-700' :
                              qType.complexity === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}
                          >
                            {qType.complexity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {qType.description}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateQuestion(qType.id);
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Create
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadTemplate(qType.id, 'word');
                        }}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Manage Questions Tab */}
      {activeTab === 'manage' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as NCLEXCategory | 'all')}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              <option value="all">All Categories</option>
              {NCLEX_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as QuestionType | 'all')}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            >
              <option value="all">All Types</option>
              {QUESTION_TYPES.map(qt => (
                <option key={qt.id} value={qt.id}>{qt.name}</option>
              ))}
            </select>
          </div>

          {/* Questions Table */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No questions in the database yet.</p>
                <p className="text-sm">Create questions or upload from templates to get started.</p>
                <Button className="mt-4" onClick={() => setActiveTab('create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Question
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Download Question Templates</CardTitle>
              <CardDescription>
                Use these templates to prepare questions offline, then upload them to the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Word Templates */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Word Document Templates (.docx)
                  </h3>
                  <div className="space-y-2">
                    {QUESTION_TYPES.map(qt => (
                      <button
                        key={qt.id}
                        onClick={() => handleDownloadTemplate(qt.id, 'word')}
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-lg">{qt.icon}</span>
                          <span className="text-sm">{qt.name}</span>
                        </span>
                        <Download className="w-4 h-4 text-gray-400" />
                      </button>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleDownloadAllTemplates('word')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download All Word Templates
                  </Button>
                </div>

                {/* PDF Templates */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-red-600" />
                    PDF Templates (.pdf)
                  </h3>
                  <div className="space-y-2">
                    {QUESTION_TYPES.map(qt => (
                      <button
                        key={qt.id}
                        onClick={() => handleDownloadTemplate(qt.id, 'pdf')}
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-lg">{qt.icon}</span>
                          <span className="text-sm">{qt.name}</span>
                        </span>
                        <Download className="w-4 h-4 text-gray-400" />
                      </button>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleDownloadAllTemplates('pdf')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download All PDF Templates
                  </Button>
                </div>
              </div>

              {/* Template Instructions */}
              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  How to Use Templates
                </h4>
                <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                  <li>Download the template for the question type you want to create</li>
                  <li>Fill in the question details following the template format</li>
                  <li>Save the file and use the "Import from Template" option to upload</li>
                  <li>Review and confirm the imported questions</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* CSV/Excel Template */}
          <Card>
            <CardHeader>
              <CardTitle>Bulk Upload Templates</CardTitle>
              <CardDescription>
                For uploading multiple questions at once
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => generateQuestionTemplate('multiple-choice', 'csv')}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Download CSV Template
                </Button>
                <Button variant="outline" onClick={() => generateQuestionTemplate('multiple-choice', 'excel')}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Download Excel Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Question Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Create {selectedType ? getQuestionTypeName(selectedType) : ''} Question
            </DialogTitle>
            <DialogDescription>
              Fill in the question details below
            </DialogDescription>
          </DialogHeader>
          {selectedType && (
            <QuestionCreatorForm 
              questionType={selectedType} 
              onSave={(question) => {
                console.log('Question saved:', question);
                setShowCreateDialog(false);
              }}
              onCancel={() => setShowCreateDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
