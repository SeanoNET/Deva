'use client';

import { useState } from 'react';
import { 
  Brain, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle, 
  AlertTriangle,
  Info,
  TrendingUp,
  Target,
  Tag,
  HelpCircle,
  Eye,
  Settings
} from 'lucide-react';
import type { AIReasoningData, ConfidenceMetrics, WorkType, Priority } from '@deva/types';

interface AIReasoningPanelProps {
  reasoning?: AIReasoningData;
  metrics?: ConfidenceMetrics;
  onOverride?: (field: string, newValue: any) => void;
  className?: string;
}

const confidenceColor = (confidence: number) => {
  if (confidence >= 85) return 'text-green-600 bg-green-50';
  if (confidence >= 70) return 'text-yellow-600 bg-yellow-50';
  if (confidence >= 50) return 'text-orange-600 bg-orange-50';
  return 'text-red-600 bg-red-50';
};

const confidenceIcon = (confidence: number) => {
  if (confidence >= 85) return <CheckCircle className="h-4 w-4 text-green-600" />;
  if (confidence >= 70) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
  return <AlertTriangle className="h-4 w-4 text-red-600" />;
};

function ReasoningSection({ 
  title, 
  icon, 
  children, 
  defaultExpanded = false 
}: { 
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
      >
        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        {icon}
        <span className="font-medium text-gray-900">{title}</span>
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}

function ConfidenceBar({ 
  label, 
  confidence, 
  className = "" 
}: { 
  label: string;
  confidence: number;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-700">{label}</span>
          <span className={`font-medium ${confidenceColor(confidence).split(' ')[0]}`}>
            {confidence}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${confidenceColor(confidence).replace('text-', 'bg-').replace('bg-', 'bg-').split(' ')[0].replace('text-', 'bg-')}`}
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function AlternativeOptions({
  alternatives,
  onSelect
}: {
  alternatives: { type: WorkType; confidence: number }[];
  onSelect?: (value: WorkType) => void;
}) {
  if (!alternatives.length) return null;

  return (
    <div className="mt-3">
      <h5 className="text-sm font-medium text-gray-700 mb-2">Alternative options:</h5>
      <div className="space-y-2">
        {alternatives.map((alt) => (
          <button
            key={alt.type}
            onClick={() => onSelect?.(alt.type)}
            className="flex items-center justify-between w-full p-2 text-left border border-gray-200 rounded hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm text-gray-700 capitalize">{alt.type}</span>
            <span className="text-xs text-gray-500">{alt.confidence}%</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AIReasoningPanel({ 
  reasoning, 
  metrics, 
  onOverride,
  className = "" 
}: AIReasoningPanelProps) {
  if (!reasoning && !metrics) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <Brain className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No AI reasoning data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Brain className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Analysis</h3>
            <p className="text-sm text-gray-600">
              Transparent decision-making process
            </p>
          </div>
        </div>
      </div>

      {/* Overall Confidence */}
      {metrics && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overall Confidence
            </h4>
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${confidenceColor(metrics.overall)} border-current`}>
              {metrics.overall}%
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(metrics.breakdown).map(([key, value]) => (
              <ConfidenceBar 
                key={key}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                confidence={value}
              />
            ))}
          </div>
        </div>
      )}

      {/* Reasoning Sections */}
      {reasoning && (
        <div>
          {/* Work Type Reasoning */}
          <ReasoningSection
            title="Work Type Analysis"
            icon={<Target className="h-4 w-4 text-purple-600" />}
            defaultExpanded={true}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                {confidenceIcon(reasoning.workTypeReasoning.confidence)}
                <div>
                  <div className="font-medium text-gray-900 capitalize">
                    {reasoning.workTypeReasoning.detected}
                  </div>
                  <div className="text-sm text-gray-600">
                    {reasoning.workTypeReasoning.confidence}% confidence
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-700">
                <strong>Reasoning:</strong> {reasoning.workTypeReasoning.reasoning}
              </div>
              
              <AlternativeOptions
                alternatives={reasoning.workTypeReasoning.alternatives}
                onSelect={(value) => onOverride?.('workType', value)}
              />
            </div>
          </ReasoningSection>

          {/* Priority Reasoning */}
          <ReasoningSection
            title="Priority Analysis"
            icon={<AlertTriangle className="h-4 w-4 text-orange-600" />}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                {confidenceIcon(reasoning.priorityReasoning.confidence)}
                <div>
                  <div className="font-medium text-gray-900 capitalize">
                    {reasoning.priorityReasoning.detected}
                  </div>
                  <div className="text-sm text-gray-600">
                    {reasoning.priorityReasoning.confidence}% confidence
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-700">
                <strong>Reasoning:</strong> {reasoning.priorityReasoning.reasoning}
              </div>
              
              {reasoning.priorityReasoning.factors.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Key factors:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {reasoning.priorityReasoning.factors.map((factor, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-orange-400 mt-1">•</span>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </ReasoningSection>

          {/* Label Reasoning */}
          <ReasoningSection
            title="Label Suggestions"
            icon={<Tag className="h-4 w-4 text-green-600" />}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                {confidenceIcon(reasoning.labelReasoning.confidence)}
                <div>
                  <div className="font-medium text-gray-900">
                    {reasoning.labelReasoning.suggested.length} labels suggested
                  </div>
                  <div className="text-sm text-gray-600">
                    {reasoning.labelReasoning.confidence}% confidence
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {reasoning.labelReasoning.suggested.map((label, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    {label}
                  </span>
                ))}
              </div>
              
              <div className="text-sm text-gray-700">
                <strong>Reasoning:</strong> {reasoning.labelReasoning.reasoning}
              </div>
              
              {reasoning.labelReasoning.sources.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Based on:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {reasoning.labelReasoning.sources.map((source, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        {source}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </ReasoningSection>

          {/* Questions Reasoning */}
          {reasoning.questionsReasoning.questions.length > 0 && (
            <ReasoningSection
              title="Clarifying Questions"
              icon={<HelpCircle className="h-4 w-4 text-blue-600" />}
            >
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium text-gray-900 mb-1">
                    {reasoning.questionsReasoning.questions.length} questions to improve accuracy
                  </div>
                  <div className="text-sm text-gray-600">
                    Could increase confidence by {reasoning.questionsReasoning.confidenceImpact}%
                  </div>
                </div>
                
                <div className="text-sm text-gray-700">
                  <strong>Reasoning:</strong> {reasoning.questionsReasoning.reasoning}
                </div>
                
                <div className="space-y-2">
                  {reasoning.questionsReasoning.questions.map((question, index) => (
                    <div key={index} className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                      <div className="font-medium text-blue-900 text-sm">
                        {index + 1}. {question}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ReasoningSection>
          )}
        </div>
      )}

      {/* Improvement Suggestions */}
      {metrics?.improvementSuggestions && metrics.improvementSuggestions.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Improvement Suggestions
          </h4>
          <div className="space-y-2">
            {metrics.improvementSuggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-3 text-sm">
                <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{suggestion}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
          <Settings className="h-3 w-3" />
          AI transparency helps build trust and understanding
        </p>
      </div>
    </div>
  );
}