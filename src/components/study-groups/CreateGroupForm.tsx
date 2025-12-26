/**
 * CreateGroupForm Component - Form for creating new study groups
 * Follows existing form patterns with validation
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Globe, Lock, X, CheckCircle2, Plus, Users } from 'lucide-react';

const NCLEX_CATEGORIES = [
  'Management of Care',
  'Safety and Infection Control',
  'Health Promotion',
  'Psychosocial Integrity',
  'Basic Care and Comfort',
  'Pharmacological Therapies',
  'Reduction of Risk',
  'Physiological Adaptation'
];

interface CreateGroupFormProps {
  onSubmit: (data: {
    name: string;
    description: string;
    visibility: 'public' | 'private';
    focusAreas: string[];
    maxMembers?: number;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  isSuccess?: boolean;
}

export function CreateGroupForm({ onSubmit, onCancel, isSubmitting, isSuccess }: CreateGroupFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);
  const [maxMembers, setMaxMembers] = useState(6);

  const toggleFocusArea = (area: string) => {
    setSelectedFocusAreas(prev =>
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      visibility,
      focusAreas: selectedFocusAreas,
      maxMembers
    });
  };

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Group Created Successfully!
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Redirecting to your new group...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Group Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Group Name *
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., NCLEX Study Squad"
          maxLength={100}
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is your group about?"
          rows={3}
          maxLength={500}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Visibility */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Visibility
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setVisibility('public')}
            className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
              visibility === 'public'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <Globe className={`size-5 ${visibility === 'public' ? 'text-blue-600' : 'text-gray-400'}`} />
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white text-sm">Public</div>
              <div className="text-xs text-gray-500">Anyone can join</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setVisibility('private')}
            className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
              visibility === 'private'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <Lock className={`size-5 ${visibility === 'private' ? 'text-blue-600' : 'text-gray-400'}`} />
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white text-sm">Private</div>
              <div className="text-xs text-gray-500">Invite only</div>
            </div>
          </button>
        </div>
      </div>

      {/* Max Members */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <div className="flex items-center gap-2">
            <Users className="size-4" />
            Maximum Members
          </div>
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={2}
            max={10}
            value={maxMembers}
            onChange={(e) => setMaxMembers(parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-lg font-semibold text-gray-900 dark:text-white w-8 text-center">
            {maxMembers}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Optimal group size is 4-6 members for effective collaboration
        </p>
      </div>

      {/* Focus Areas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Focus Areas (Optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {NCLEX_CATEGORIES.map((area) => (
            <Badge
              key={area}
              variant={selectedFocusAreas.includes(area) ? 'default' : 'outline'}
              className={`cursor-pointer transition-all ${
                selectedFocusAreas.includes(area)
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => toggleFocusArea(area)}
            >
              {area}
              {selectedFocusAreas.includes(area) && (
                <X className="size-3 ml-1" />
              )}
            </Badge>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={!name.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Creating...
            </>
          ) : (
            <>
              <Plus className="size-4 mr-2" />
              Create Group
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default CreateGroupForm;
