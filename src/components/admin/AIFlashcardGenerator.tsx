/**
 * AI Flashcard Generator Component
 * Allows admins to generate high-yield NCLEX flashcards using AI
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Layers,
  BookOpen
} from 'lucide-react';
import { apiClient } from '../../services/api';

// Types
interface FlashcardGenerationJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  totalBatches: number;
  completedBatches: number;
  generatedCards: number;
  savedCards: number;
  deckId?: string;
  errors: string[];
  warnings: string[];
}

interface AIFlashcardGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

// NCLEX Categories
const NCLEX_CATEGORIES = [
  { value: 'management_of_care', label: 'Management of Care', weight: '17-23%' },
  { value: 'safety_and_infection_control', label: 'Safety & Infection Control', weight: '9-15%' },
  { value: 'health_promotion', label: 'Health Promotion', weight: '6-12%' },
  { value: 'psychosocial_integrity', label: 'Psychosocial Integrity', weight: '6-12%' },
  { value: 'basic_care_and_comfort', label: 'Basic Care & Comfort', weight: '6-12%' },
  { value: 'pharmacology', label: 'Pharmacology', weight: '12-18%' },
  { value: 'risk_reduction', label: 'Risk Reduction', weight: '9-15%' },
  { value: 'physiological_adaptation', label: 'Physiological Adaptation', weight: '11-17%' }
];

// Flashcard Types
const CARD_TYPES = [
  { value: 'definition', label: 'Definitions', description: 'Key nursing terms' },
  { value: 'concept', label: 'Concepts', description: 'Nursing principles' },
  { value: 'clinical_scenario', label: 'Clinical Scenarios', description: 'Patient situations' },
  { value: 'medication', label: 'Medications', description: 'Drug info & nursing considerations' },
  { value: 'lab_values', label: 'Lab Values', description: 'Normal ranges & implications' },
  { value: 'procedure', label: 'Procedures', description: 'Step-by-step nursing procedures' },
  { value: 'nursing_intervention', label: 'Interventions', description: 'Priority nursing actions' }
];

const AIFlashcardGenerator: React.FC<AIFlashcardGeneratorProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  // State
  const [step, setStep] = useState<'configure' | 'progress' | 'complete'>('configure');
  const [totalCards, setTotalCards] = useState(20);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['management_of_care', 'pharmacology']);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['definition', 'concept', 'medication']);
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [deckTitle, setDeckTitle] = useState('');
  const [topics, setTopics] = useState('');
  
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<FlashcardGenerationJob | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Poll for job status
  useEffect(() => {
    if (!jobId || step !== 'progress') return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await apiClient.get(`/flashcards/generate/${jobId}`);
        const jobData = response.data.data;
        setJob(jobData);

        if (jobData.status === 'completed' || jobData.status === 'failed') {
          clearInterval(pollInterval);
          setStep('complete');
        }
      } catch (err) {
        console.error('Failed to poll job status:', err);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [jobId, step]);

  // Toggle category selection
  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  }, []);

  // Toggle card type selection
  const toggleType = useCallback((type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  }, []);

  // Start generation
  const handleGenerate = async () => {
    if (selectedCategories.length === 0) {
      setError('Please select at least one NCLEX category');
      return;
    }
    if (selectedTypes.length === 0) {
      setError('Please select at least one card type');
      return;
    }

    setError(null);
    setStep('progress');

    try {
      const response = await apiClient.post('/flashcards/generate', {
        totalCards,
        categories: selectedCategories,
        cardTypes: selectedTypes,
        difficulty,
        deckTitle: deckTitle || `AI Generated - ${new Date().toLocaleDateString()}`,
        topics: topics ? topics.split(',').map(t => t.trim()).filter(Boolean) : []
      });

      setJobId(response.data.data.jobId);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to start generation');
      setStep('configure');
    }
  };

  // Cancel generation
  const handleCancel = async () => {
    if (jobId) {
      try {
        await apiClient.delete(`/flashcards/generate/${jobId}`);
      } catch (err) {
        console.error('Failed to cancel job:', err);
      }
    }
    resetState();
  };

  // Reset state
  const resetState = () => {
    setStep('configure');
    setJobId(null);
    setJob(null);
    setError(null);
  };

  // Handle complete
  const handleComplete = () => {
    onComplete();
    onClose();
    resetState();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Layers className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI Flashcard Generator</h2>
              <p className="text-sm text-gray-500">Generate high-yield NCLEX flashcards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex border-b flex-shrink-0">
          {['Configure', 'Progress', 'Complete'].map((label, idx) => {
            const stepMap = ['configure', 'progress', 'complete'];
            const isActive = step === stepMap[idx];
            const isPast = stepMap.indexOf(step) > idx;
            return (
              <div
                key={label}
                className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
                  isActive ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600' :
                  isPast ? 'text-purple-600' : 'text-gray-400'
                }`}
              >
                {idx + 1}. {label}
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          {/* Configure Step */}
          {step === 'configure' && (
            <div className="space-y-6">
              {/* Deck Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deck Title (Optional)
                </label>
                <input
                  type="text"
                  value={deckTitle}
                  onChange={(e) => setDeckTitle(e.target.value)}
                  placeholder="e.g., Pharmacology Review"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Number of Cards */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Flashcards: <span className="text-purple-600 font-bold">{totalCards}</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={totalCards}
                  onChange={(e) => setTotalCards(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                <div className="flex gap-2">
                  {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
                        difficulty === level
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* NCLEX Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NCLEX Categories <span className="text-gray-400">({selectedCategories.length} selected)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {NCLEX_CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => toggleCategory(cat.value)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        selectedCategories.includes(cat.value)
                          ? 'bg-purple-50 border-purple-400 ring-1 ring-purple-400'
                          : 'bg-white border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900">{cat.label}</div>
                      <div className="text-xs text-gray-500">{cat.weight}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Types <span className="text-gray-400">({selectedTypes.length} selected)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CARD_TYPES.map(type => (
                    <button
                      key={type.value}
                      onClick={() => toggleType(type.value)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        selectedTypes.includes(type.value)
                          ? 'bg-purple-50 border-purple-400 ring-1 ring-purple-400'
                          : 'bg-white border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900">{type.label}</div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Topics */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Focus Topics (Optional)
                </label>
                <input
                  type="text"
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                  placeholder="e.g., diabetes, heart failure, medications"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">Separate topics with commas</p>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>
          )}

          {/* Progress Step */}
          {step === 'progress' && (
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="animate-spin">
                  <RefreshCw className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Generating Flashcards</div>
                  <div className="text-sm text-gray-500">
                    {job ? `${Math.round((job.completedBatches / job.totalBatches) * 100)}% complete` : 'Starting...'}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{job?.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${job?.progress || 0}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">{job?.generatedCards || 0}</div>
                  <div className="text-sm text-gray-500">Generated</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">{job?.savedCards || 0}</div>
                  <div className="text-sm text-gray-500">Saved</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {job ? `${job.completedBatches}/${job.totalBatches}` : '0/0'}
                  </div>
                  <div className="text-sm text-gray-500">Batches</div>
                </div>
              </div>

              {/* Errors */}
              {job?.errors && job.errors.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
                  <div className="text-sm text-amber-800">
                    {job.errors.map((err, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{err}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleCancel}
                className="mt-6 px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Complete Step */}
          {step === 'complete' && (
            <div className="text-center py-8">
              {job?.status === 'completed' ? (
                <>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Complete!</h3>
                  <p className="text-gray-600 mb-6">
                    Generated {job.savedCards} flashcards successfully.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-10 h-10 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Generation Failed</h3>
                  <p className="text-gray-600 mb-4">
                    {job?.savedCards || 0} flashcards were saved before the error.
                  </p>
                  {job?.errors && job.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left mb-6">
                      {job.errors.map((err, i) => (
                        <div key={i} className="text-sm text-red-700">{err}</div>
                      ))}
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-center gap-3">
                <button
                  onClick={resetState}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Generate More
                </button>
                <button
                  onClick={handleComplete}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  View Flashcards
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Configure Step */}
        {step === 'configure' && (
          <div className="p-6 border-t bg-gray-50 flex-shrink-0">
            <button
              onClick={handleGenerate}
              disabled={selectedCategories.length === 0 || selectedTypes.length === 0}
              className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Generate {totalCards} Flashcards
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIFlashcardGenerator;
