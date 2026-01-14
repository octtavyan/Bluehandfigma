import React, { useState } from 'react';
import { AlertCircle, Copy, Check, ExternalLink } from 'lucide-react';

export const DatabaseMigrationAlert: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const sqlScript = `-- Add missing columns to paintings table
ALTER TABLE paintings ADD COLUMN IF NOT EXISTS orientation TEXT DEFAULT 'portrait';
ALTER TABLE paintings ADD COLUMN IF NOT EXISTS dominant_color TEXT;`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openSupabaseSQL = () => {
    // Try to construct the Supabase SQL Editor URL
    // The user will need to be logged into Supabase for this to work
    window.open('https://supabase.com/dashboard/project/_/sql', '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 max-w-md bg-white rounded-lg shadow-2xl border-2 border-orange-500 p-6 z-50 animate-fade-in">
      <div className="flex items-start gap-3 mb-4">
        <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-gray-900 mb-1">Database Migration Required</h3>
          <p className="text-sm text-gray-600">
            The paintings table needs new columns for orientation and color filters.
          </p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 mb-4 relative">
        <pre className="text-sm text-green-400 font-mono overflow-x-auto">
          {sqlScript}
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
          title="Copy SQL"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>

      <div className="space-y-2">
        <button
          onClick={openSupabaseSQL}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Open Supabase SQL Editor
        </button>
        
        <div className="text-xs text-gray-500 space-y-1">
          <p className="font-medium">Quick Steps:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Click "Copy SQL" above</li>
            <li>Click "Open Supabase SQL Editor"</li>
            <li>Paste the SQL code</li>
            <li>Click "Run" or press Cmd/Ctrl + Enter</li>
            <li>Refresh this page</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
