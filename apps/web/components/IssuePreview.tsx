'use client';

import { useState, useCallback } from 'react';
import { 
  Edit3, 
  Check, 
  X, 
  AlertCircle, 
  Info, 
  TrendingUp, 
  Brain,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { 
  EditableIssueData, 
  AIReasoningData, 
  ConfidenceMetrics,
  WorkType,
  Priority 
} from '@deva/types';

interface IssuePreviewProps {
  editableIssue: EditableIssueData;
  onFieldUpdate: (field: keyof EditableIssueData, value: any) => void;
  onCreateIssue: () => void;
  onRefineMore: () => void;
  showReasoningPanel?: boolean;
  onToggleReasoning?: () => void;
  isCreating?: boolean;
}

const workTypeIcons: Record<WorkType, string> = {
  bug: '🐛',
  feature: '✨',
  documentation: '📚',
  testing: '🧪',
  infrastructure: '🏗️',
  research: '🔬',
};

const priorityColors: Record<Priority, string> = {
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-blue-500 text-white',
  low: 'bg-gray-500 text-white',
};

const confidenceColor = (confidence: number) => {
  if (confidence >= 85) return 'text-green-600 bg-green-50 border-green-200';
  if (confidence >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  if (confidence >= 50) return 'text-orange-600 bg-orange-50 border-orange-200';
  return 'text-red-600 bg-red-50 border-red-200';
};

export default function IssuePreview({
  editableIssue,
  onFieldUpdate,
  onCreateIssue,
  onRefineMore,
  showReasoningPanel = false,
  onToggleReasoning,
  isCreating = false
}: IssuePreviewProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  }, []);

  const handleFieldEdit = useCallback((field: keyof EditableIssueData, value: any) => {
    onFieldUpdate(field, value);
  }, [onFieldUpdate]);

  const startEditing = useCallback((field: keyof EditableIssueData) => {
    const currentField = editableIssue[field];
    if (typeof currentField === 'object' && 'isEditing' in currentField) {
      onFieldUpdate(field, { ...currentField, isEditing: true });
    }
  }, [editableIssue, onFieldUpdate]);

  const saveField = useCallback((field: keyof EditableIssueData, newValue: any) => {
    const currentField = editableIssue[field];
    if (typeof currentField === 'object' && 'isEditing' in currentField) {
      onFieldUpdate(field, {
        ...currentField,
        value: newValue,
        isEditing: false,
        hasChanges: newValue !== currentField.originalValue
      });
    }
  }, [editableIssue, onFieldUpdate]);

  const cancelEdit = useCallback((field: keyof EditableIssueData) => {
    const currentField = editableIssue[field];
    if (typeof currentField === 'object' && 'isEditing' in currentField) {
      onFieldUpdate(field, {
        ...currentField,
        value: currentField.originalValue,
        isEditing: false
      });
    }
  }, [editableIssue, onFieldUpdate]);

  const EditableField = ({ 
    field, 
    children, 
    className = '',
    multiline = false 
  }: { 
    field: keyof EditableIssueData;
    children: React.ReactNode;
    className?: string;
    multiline?: boolean;
  }) => {
    const fieldData = editableIssue[field];
    
    if (typeof fieldData !== 'object' || !('isEditing' in fieldData)) {
      return <div className={className}>{children}</div>;
    }

    const { isEditing, value, hasChanges, validationError } = fieldData;

    if (!isEditing) {
      return (
        <div 
          className={`${className} group cursor-pointer hover:bg-gray-50 rounded px-2 py-1 -mx-2 -my-1 transition-colors ${hasChanges ? 'bg-blue-50 border-l-2 border-blue-400' : ''}`}
          onClick={() => startEditing(field)}
        >
          {children}
          <Edit3 className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity inline ml-2" />
          {hasChanges && <span className="text-xs text-blue-600 ml-2">✓ Modified</span>}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => handleFieldEdit(field, { ...fieldData, value: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationError ? 'border-red-400' : 'border-gray-300'}`}
            rows={4}
            autoFocus
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldEdit(field, { ...fieldData, value: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationError ? 'border-red-400' : 'border-gray-300'}`}
            autoFocus
          />
        )}
        {validationError && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {validationError}
          </p>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => saveField(field, fieldData.value)}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center gap-1"
          >
            <Check className="h-3 w-3" />
            Save
          </button>
          <button
            onClick={() => cancelEdit(field)}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Cancel
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">
              {workTypeIcons[(editableIssue.workType?.value as WorkType) || 'feature']}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Issue Preview</h3>
              <p className="text-sm text-gray-600">
                AI-generated Linear issue • 
                <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium border ${confidenceColor(editableIssue.confidence)}`}>
                  {editableIssue.confidence}% confidence
                </span>
              </p>
            </div>
          </div>
          
          {onToggleReasoning && (
            <button
              onClick={onToggleReasoning}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Brain className="h-4 w-4" />
              {showReasoningPanel ? 'Hide' : 'Show'} AI Reasoning
              {showReasoningPanel ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <EditableField field="title" className="text-xl font-semibold text-gray-900">
            {editableIssue.title?.value || 'Untitled Issue'}
          </EditableField>
        </div>

        {/* Metadata Row */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <EditableField field="workType">
              <span className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-purple-100 text-purple-800`}>
                {workTypeIcons[(editableIssue.workType?.value as WorkType) || 'feature']} 
                {(editableIssue.workType?.value || 'feature').charAt(0).toUpperCase() + (editableIssue.workType?.value || 'feature').slice(1)}
              </span>
            </EditableField>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <EditableField field="priority">
              <span className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${priorityColors[(editableIssue.priority?.value as Priority) || 'medium']}`}>
                {(editableIssue.priority?.value || 'medium').charAt(0).toUpperCase() + (editableIssue.priority?.value || 'medium').slice(1)}
              </span>
            </EditableField>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Labels</label>
            <EditableField field="labels">
              <div className="flex flex-wrap gap-2">
                {(editableIssue.labels?.value || []).map((label: string, index: number) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                  >
                    {label}
                  </span>
                ))}
                {(!editableIssue.labels?.value || editableIssue.labels.value.length === 0) && (
                  <span className="text-sm text-gray-500 italic">No labels</span>
                )}
              </div>
            </EditableField>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <EditableField field="description" multiline>
            <div className="prose prose-sm text-gray-700 whitespace-pre-wrap">
              {editableIssue.description?.value || 'No description provided'}
            </div>
          </EditableField>
        </div>

        {/* Confidence Breakdown */}
        {editableIssue.metrics && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Confidence Breakdown
            </h4>
            <div className="grid grid-cols-5 gap-3">
              {Object.entries(editableIssue.metrics.breakdown).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className={`text-lg font-semibold ${confidenceColor(value).split(' ')[0]}`}>
                    {value}%
                  </div>
                  <div className="text-xs text-gray-600 capitalize">{key}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Improvement Suggestions */}
        {editableIssue.metrics?.improvementSuggestions && editableIssue.metrics.improvementSuggestions.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Suggestions to improve accuracy
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              {editableIssue.metrics.improvementSuggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onRefineMore}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isCreating}
          >
            Ask Follow-up
          </button>
          <button
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            disabled={isCreating}
          >
            <ExternalLink className="h-4 w-4" />
            Preview in Linear
          </button>
        </div>
        
        <button
          onClick={onCreateIssue}
          disabled={isCreating || editableIssue.confidence < 50}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
        >
          {isCreating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Creating Issue...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Create Issue
            </>
          )}
        </button>
      </div>
    </div>
  );
}