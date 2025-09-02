'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  issuePreview?: {
    title: string;
    description: string;
    workType: string;
    priority: string;
    confidence: number;
  };
}

export function ChatInterface({ userId }: { userId: Id<'users'> }) {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationId, setConversationId] = useState<Id<'conversations'> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const createConversation = useMutation(api.conversations.createConversation);
  const addMessage = useMutation(api.conversations.addMessage);
  const conversation = useQuery(
    api.conversations.getConversation,
    conversationId ? { conversationId } : 'skip'
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput('');
    setIsProcessing(true);

    try {
      let currentConversationId = conversationId;
      
      if (!currentConversationId) {
        currentConversationId = await createConversation({
          userId,
          firstMessage: userMessage,
        });
        setConversationId(currentConversationId);
      } else {
        await addMessage({
          conversationId: currentConversationId,
          message: {
            role: 'user',
            content: userMessage,
          },
        });
      }

      // Process with AI (this will be implemented next)
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      await addMessage({
        conversationId: currentConversationId,
        message: {
          role: 'assistant',
          content: data.response,
          issuePreview: data.issuePreview,
        },
      });
    } catch (error) {
      console.error('Error processing message:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation?.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-2xl rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              
              {message.issuePreview && (
                <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                  <h4 className="font-semibold text-sm text-gray-700">
                    Issue Preview
                  </h4>
                  <p className="font-medium mt-1">{message.issuePreview.title}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {message.issuePreview.description}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                      {message.issuePreview.workType}
                    </span>
                    <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded">
                      {message.issuePreview.priority}
                    </span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                      {Math.round(message.issuePreview.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what you need to build..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}