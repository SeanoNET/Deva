'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [isLinearConnected, setIsLinearConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check for Linear auth status
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'success') {
      setIsLinearConnected(true);
      // Clean up URL
      window.history.replaceState({}, '', '/');
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
          </div>
        </div>
      </header>
      
      <main className="flex-1 p-8 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">Ready to create work items!</h2>
            <p className="text-gray-300">
              You're connected to Linear. The chat interface will be available soon.
            </p>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Test</h3>
            <textarea
              className="w-full p-3 border border-gray-600 bg-gray-700 text-white rounded-lg resize-none placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              rows={4}
              placeholder="Describe what you want to build..."
            />
            <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Process Request (Coming Soon)
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}