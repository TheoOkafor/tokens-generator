'use client';

import { useState } from 'react';
import type { TokenResponse } from '@/tokens/token.type';

const EXPIRY_OPTIONS = [
  { label: '10 mins', minutes: 10 },
  { label: '30 mins', minutes: 30 },
  { label: '1 hour', minutes: 60 },
  { label: '6 hours', minutes: 360 },
  { label: '12 hours', minutes: 720 },
  { label: '24 hours', minutes: 1440 },
];

export default function Home() {
  const [createForm, setCreateForm] = useState({
    userId: '',
    scopes: '',
    expiryMinutes: 10, // 10 minutes default
  });
  const [queryUserId, setQueryUserId] = useState('');
  const [createdToken, setCreatedToken] = useState<TokenResponse | null>(null);
  const [tokens, setTokens] = useState<TokenResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');

  const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'dev-secret-key-12345';

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreatedToken(null);
    setLoading(true);

    try {
      const scopesArray = createForm.scopes
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      if (scopesArray.length === 0) {
        throw new Error('Please enter at least one scope');
      }

      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({
          userId: createForm.userId,
          scopes: scopesArray,
          expiresInMinutes: Number(createForm.expiryMinutes),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create token');
      }

      setCreatedToken(data);
      setCreateForm({ ...createForm, scopes: '' }); // Clear scopes but keep userId
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGetTokens = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTokens([]);
    setLoading(true);

    try {
      const response = await fetch(`/api/tokens?userId=${encodeURIComponent(queryUserId)}`, {
        method: 'GET',
        headers: {
          'X-API-Key': apiKey,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tokens');
      }

      setTokens(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Token Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage access tokens for your applications
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              setActiveTab('create');
              setError(null);
              setCreatedToken(null);
            }}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'create'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Create Token
          </button>
          <button
            onClick={() => {
              setActiveTab('list');
              setError(null);
              setTokens([]);
            }}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'list'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            List Tokens
          </button>
        </div>

        {/* Create Token Tab */}
        {activeTab === 'create' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <form onSubmit={handleCreateToken} className="space-y-6">
              <div>
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  User ID
                </label>
                <input
                  type="text"
                  id="userId"
                  value={createForm.userId}
                  onChange={(e) => setCreateForm({ ...createForm, userId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="e.g., user_12345"
                  required
                />
              </div>

              <div>
                <label htmlFor="scopes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Scopes (comma-separated)
                </label>
                <input
                  type="text"
                  id="scopes"
                  value={createForm.scopes}
                  onChange={(e) => setCreateForm({ ...createForm, scopes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="e.g., read, write, admin"
                  required
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Enter scopes separated by commas
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Expiry Period
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {EXPIRY_OPTIONS.map((option) => (
                    <button
                      key={option.minutes}
                      type="button"
                      onClick={() => setCreateForm({ ...createForm, expiryMinutes: option.minutes })}
                      className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                        createForm.expiryMinutes === option.minutes
                          ? 'bg-blue-600 text-white shadow-lg scale-105'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </span>
                ) : (
                  'Create Token'
                )}
              </button>
            </form>

            {/* Created Token Display */}
            {createdToken && (
              <div className="mt-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <svg className="w-6 h-6 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                    Token Created Successfully
                  </h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Token:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 bg-white dark:bg-gray-800 px-3 py-2 rounded border border-green-200 dark:border-green-700 text-sm break-all">
                        {createdToken.token}
                      </code>
                      <button
                        onClick={() => copyToClipboard(createdToken.token)}
                        className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        title="Copy to clipboard"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">User ID:</span>
                      <p className="text-gray-600 dark:text-gray-400">{createdToken.userId}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Scopes:</span>
                      <p className="text-gray-600 dark:text-gray-400">{createdToken.scopes.join(', ')}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Created:</span>
                      <p className="text-gray-600 dark:text-gray-400">{formatDate(createdToken.createdAt)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Expires:</span>
                      <p className="text-gray-600 dark:text-gray-400">{formatDate(createdToken.expiresAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* List Tokens Tab */}
        {activeTab === 'list' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <form onSubmit={handleGetTokens} className="mb-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={queryUserId}
                  onChange={(e) => setQueryUserId(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="Enter User ID to search"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>

            {/* Tokens List */}
            {tokens.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Active Tokens ({tokens.length})
                </h3>
                {tokens.map((token) => (
                  <div key={token.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-md transition-shadow">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                            {token.id}
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(token.token)}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy
                        </button>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded border border-gray-200 dark:border-gray-700">
                        <code className="text-sm text-gray-800 dark:text-gray-200 break-all">
                          {token.token}
                        </code>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {token.scopes.map((scope, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium rounded-full"
                          >
                            {scope}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Created: {formatDate(token.createdAt)}</span>
                        <span>Expires: {formatDate(token.expiresAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tokens.length === 0 && queryUserId && !loading && !error && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-600 dark:text-gray-400">
                  No active tokens found for this user
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
