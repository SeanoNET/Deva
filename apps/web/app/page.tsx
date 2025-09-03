'use client';

import { useEffect, useState } from 'react';
import QuickCreateModal from '../components/QuickCreateModal';
import IssuePreview from '../components/IssuePreview';
import AIReasoningPanel from '../components/AIReasoningPanel';
import type { 
  IssueData, 
  Message, 
  EditableIssueData, 
  AIReasoningData, 
  ConfidenceMetrics 
} from '@deva/types';
import { LinearService } from '@deva/linear';

export default function Home() {
  const [isLinearConnected, setIsLinearConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [issuePreview, setIssuePreview] = useState<Partial<IssueData> | null>(null);
  const [editableIssue, setEditableIssue] = useState<EditableIssueData | null>(null);
  const [aiReasoning, setAiReasoning] = useState<AIReasoningData | null>(null);
  const [confidenceMetrics, setConfidenceMetrics] = useState<ConfidenceMetrics | null>(null);
  const [showReasoningPanel, setShowReasoningPanel] = useState(false); // Always start collapsed
  const [isCreatingIssue, setIsCreatingIssue] = useState(false);
  
  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        
        if (data.authenticated) {
          setIsLinearConnected(true);
        }
      } catch (err) {
        console.error('Error checking session:', err);
      }
    };
    
    // Check for Linear auth status from URL params
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'success') {
      setIsLinearConnected(true);
      // Clean up URL
      window.history.replaceState({}, '', '/');
    } else {
      // Check for existing session
      checkSession();
    }
    
    // Check for errors
    const errorParam = params.get('error');
    if (errorParam) {
      if (errorParam === 'oauth_not_configured') {
        setError('Please configure your Linear OAuth credentials in .env.local');
      } else {
        setError('Authentication failed. Please try again.');
      }
      // Clean up URL after showing error
      setTimeout(() => {
        window.history.replaceState({}, '', '/');
        setError(null);
      }, 5000);
    }
  }, []);

  const connectLinear = () => {
    window.location.href = '/api/auth/linear';
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setIsLinearConnected(false);
        setMessages([]);
        // Optionally refresh the page
        window.location.reload();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput('');
    setIsProcessing(true);

    // Add user message to chat
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      // Process with AI
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          context: messages.slice(-5) // Send last 5 messages for context
        }),
      });

      const data = await response.json();

      // Add assistant response
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: Date.now(),
        issuePreview: data.issuePreview,
      };
      setMessages(prev => [...prev, assistantMsg]);

      // Set enhanced UX data
      if (data.editableIssue) {
        setEditableIssue(data.editableIssue);
      }
      if (data.reasoning) {
        setAiReasoning(data.reasoning);
      }
      if (data.metrics) {
        setConfidenceMetrics(data.metrics);
      }

      // AI Analysis panel always starts collapsed by default
      // Users can expand it manually if they want to see the reasoning

      // Legacy fallback for old modal
      if (data.pattern === 'quick-create' && data.confidence > 70 && data.issuePreview && !data.editableIssue) {
        setIssuePreview(data.issuePreview);
        setShowQuickCreate(true);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateIssue = async (issueData: IssueData) => {
    try {
      setIsCreatingIssue(true);
      const response = await fetch('/api/linear/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueData }),
      });

      if (!response.ok) {
        throw new Error('Failed to create issue');
      }

      const result = await response.json();
      
      // Add success message
      const successMsg: Message = {
        id: Date.now().toString(),
        role: 'system',
        content: `✅ Issue created successfully! [${result.issue?.identifier}](${result.issue?.url})`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, successMsg]);
      
      // Clear all state
      setShowQuickCreate(false);
      setIssuePreview(null);
      setEditableIssue(null);
      setAiReasoning(null);
      setConfidenceMetrics(null);
      setShowReasoningPanel(false);
    } catch (error) {
      console.error('Error creating issue:', error);
      throw error;
    } finally {
      setIsCreatingIssue(false);
    }
  };

  // Enhanced UX Handlers
  const handleFieldUpdate = (field: keyof EditableIssueData, newFieldValue: any) => {
    if (editableIssue) {
      setEditableIssue({
        ...editableIssue,
        [field]: newFieldValue,
      });
    }
  };

  // Wrapper for AI Reasoning Panel (expects string field)
  const handleAIOverride = (field: string, newValue: any) => {
    handleFieldUpdate(field as keyof EditableIssueData, newValue);
  };

  const handleCreateFromPreview = () => {
    if (editableIssue) {
      const issueData: IssueData = {
        title: editableIssue.title.value,
        description: editableIssue.description.value,
        workType: editableIssue.workType.value,
        priority: editableIssue.priority.value,
        labels: editableIssue.labels.value,
        confidence: editableIssue.confidence,
        linkedIssues: [], // Default empty for now
      };
      handleCreateIssue(issueData);
    }
  };

  const handleRefineMore = () => {
    // Add a follow-up message to the conversation
    const followUpMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: 'Can you help me refine this issue further? I need more details.',
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, followUpMsg]);
    setInput('Can you help me refine this issue further? I need more details.');
  };

  if (!isLinearConnected) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="max-w-md w-full p-8 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
          <h1 className="text-3xl font-bold text-center mb-2 text-white">Welcome to Deva</h1>
          <p className="text-gray-300 text-center mb-8">
            Your intelligent development assistant for Linear
          </p>
          
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}
            
            <p className="text-sm text-gray-300">
              Connect your Linear account to get started. Deva will help you transform
              natural language into structured work items.
            </p>
            
            <button
              onClick={connectLinear}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={!!error}
            >
              Connect Linear Account
            </button>
            
            <p className="text-xs text-gray-400 text-center">
              You'll be redirected to Linear to authorize Deva
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Deva</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">
              Connected to Linear
            </span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex bg-gray-900">
        {/* Left Side - Issue Workspace */}
        <div className="flex-1 flex flex-col bg-gray-900">
          {/* Issue Preview Area */}
          {editableIssue ? (
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-4xl mx-auto">
                <IssuePreview
                  editableIssue={editableIssue}
                  onFieldUpdate={handleFieldUpdate}
                  onCreateIssue={handleCreateFromPreview}
                  onRefineMore={handleRefineMore}
                  showReasoningPanel={showReasoningPanel}
                  onToggleReasoning={() => setShowReasoningPanel(!showReasoningPanel)}
                  isCreating={isCreatingIssue}
                />
                
                {/* AI Reasoning Panel */}
                {showReasoningPanel && (aiReasoning || confidenceMetrics) && (
                  <div className="mt-6">
                    <AIReasoningPanel
                      reasoning={aiReasoning || undefined}
                      metrics={confidenceMetrics || undefined}
                      onOverride={handleAIOverride}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center max-w-lg">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white mb-3">Ready to create an issue</h2>
                <p className="text-gray-400 mb-6">
                  Describe what you need in the chat, and I'll help you build a detailed Linear issue here.
                </p>
                <div className="space-y-2 text-sm text-gray-500 text-left">
                  <p className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>"Fix the login button crash on mobile"</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>"Add dark mode toggle to settings"</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>"Document the user management API"</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Chat */}
        <div className="w-96 flex flex-col bg-gray-800 border-l border-gray-700 relative">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-white mb-2">Chat with Deva</h3>
                <p className="text-sm text-gray-400">
                  Tell me what you want to build and I'll help create the perfect Linear issue.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id}>
                  <div
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[280px] rounded-lg p-3 text-sm ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : message.role === 'system'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-100'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      
                      {/* Compact issue preview in chat */}
                      {message.issuePreview && (
                        <div className="mt-2 p-2 bg-black bg-opacity-20 rounded text-xs">
                          <p className="font-medium truncate">{message.issuePreview.title}</p>
                          <div className="flex gap-1 mt-1">
                            <span className="px-1 py-0.5 bg-white bg-opacity-20 rounded text-xs">
                              {message.issuePreview.workType}
                            </span>
                            <span className="px-1 py-0.5 bg-white bg-opacity-20 rounded text-xs">
                              {message.issuePreview.priority}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Typing indicator space for AI responses */}
                  {message.role === 'assistant' && (
                    <div className="text-xs text-gray-500 mt-1 ml-2">
                      <span className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                        Deva
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
            
            {/* Processing indicator */}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-700 rounded-lg p-3 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input - Fixed at bottom */}
          <form onSubmit={handleSubmit} className="absolute bottom-0 left-0 right-0 p-4 bg-gray-800 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe what to build..."
                className="flex-1 p-2 text-sm border border-gray-600 bg-gray-700 text-white rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isProcessing}
              />
              <button
                type="submit"
                disabled={!input.trim() || isProcessing}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Quick Create Modal (legacy fallback) */}
      <QuickCreateModal
        isOpen={showQuickCreate}
        onClose={() => {
          setShowQuickCreate(false);
          setIssuePreview(null);
        }}
        initialData={issuePreview || undefined}
        onSubmit={handleCreateIssue}
      />
    </div>
  );
}