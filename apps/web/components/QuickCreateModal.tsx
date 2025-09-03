'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle, AlertCircle, Zap, Info } from 'lucide-react';
import type { IssueData, WorkType, Priority } from '@deva/types';

interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<IssueData>;
  onSubmit: (data: IssueData) => Promise<void>;
}

export default function QuickCreateModal({
  isOpen,
  onClose,
  initialData,
  onSubmit,
}: QuickCreateModalProps) {
  const [formData, setFormData] = useState<Partial<IssueData>>({
    title: '',
    description: '',
    workType: 'feature',
    priority: 'medium',
    labels: [],
    linkedIssues: [],
    confidence: 85,
    ...initialData,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!formData.title || !formData.description) {
        throw new Error('Title and description are required');
      }

      await onSubmit({
        ...formData,
        title: formData.title,
        description: formData.description,
        workType: formData.workType || 'feature',
        priority: formData.priority || 'medium',
        labels: formData.labels || [],
        linkedIssues: formData.linkedIssues || [],
        confidence: formData.confidence || 85,
      } as IssueData);

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({
          title: '',
          description: '',
          workType: 'feature',
          priority: 'medium',
          labels: [],
          linkedIssues: [],
          confidence: 85,
        });
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create issue');
      setIsSubmitting(false);
    }
  };

  const workTypes: WorkType[] = ['bug', 'feature', 'documentation', 'testing', 'infrastructure', 'research'];
  const priorities: Priority[] = ['critical', 'high', 'medium', 'low'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-700">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-b border-gray-700">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Zap className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-100">Quick Create</h2>
                <p className="text-sm text-gray-400">For simple issues and quick fixes</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors"
              disabled={isSubmitting}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Info Banner */}
          <div className="px-6 pb-4">
            <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Info className="h-4 w-4 text-blue-400 flex-shrink-0" />
              <p className="text-sm text-blue-300">
                For complex projects or when you need AI assistance, use the enhanced conversation flow above.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-220px)]">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all"
              placeholder="Brief, descriptive title"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Work Type and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type *
              </label>
              <select
                value={formData.workType || 'feature'}
                onChange={(e) => setFormData({ ...formData, workType: e.target.value as WorkType })}
                className="w-full px-4 py-3 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all"
                disabled={isSubmitting}
              >
                {workTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Priority *
              </label>
              <select
                value={formData.priority || 'medium'}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                className="w-full px-4 py-3 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all"
                disabled={isSubmitting}
              >
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all resize-none"
              placeholder="Brief description for quick creation..."
              rows={4}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Labels */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Labels
              <span className="text-gray-500 font-normal ml-2">(optional)</span>
            </label>
            <input
              type="text"
              value={formData.labels?.join(', ') || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                labels: e.target.value.split(',').map(l => l.trim()).filter(Boolean) 
              })}
              className="w-full px-4 py-3 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 focus:outline-none transition-all"
              placeholder="bug, urgent, frontend"
              disabled={isSubmitting}
            />
          </div>

          {/* Confidence Indicator */}
          {formData.confidence && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">AI Confidence</span>
              <span className={`font-medium ${
                formData.confidence > 80 ? 'text-green-400' :
                formData.confidence > 60 ? 'text-yellow-400' :
                'text-orange-400'
              }`}>
                {formData.confidence}%
              </span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
              <p className="text-sm text-green-400">Issue created successfully!</p>
            </div>
          )}
        </form>

        <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-800/50">
          <div className="text-sm text-gray-400">
            Quick creation for simple issues
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-gray-100 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.title || !formData.description}
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2 shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Quick Create
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}