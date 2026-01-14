import React, { useState } from 'react';
import { Copy, Check, ExternalLink, AlertCircle } from 'lucide-react';
import { projectId } from '../utils/supabase/info';

const MIGRATION_SQL = `-- ============================================
-- ADD frame_prices COLUMN TO sizes TABLE
-- ============================================
-- This migration adds the frame_prices JSONB column to the sizes table
-- to store frame-specific pricing for each size

-- Add the frame_prices column to the sizes table
ALTER TABLE sizes ADD COLUMN IF NOT EXISTS frame_prices JSONB DEFAULT '{}';

-- Add a comment to document the column
COMMENT ON COLUMN sizes.frame_prices IS 'Stores frame prices for each frame type as a JSON object with frame_type_id as key and price as value';

-- Optional: Create an index on frame_prices for faster JSONB queries
CREATE INDEX IF NOT EXISTS idx_sizes_frame_prices ON sizes USING GIN (frame_prices);`;

export const MigrationGuide: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(MIGRATION_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border-2 border-red-200 p-6">
      <div className="flex items-start gap-3 mb-4">
        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-lg font-semibold text-red-900">⚠️ Database Migration Required</h3>
          <p className="text-sm text-red-700 mt-1">
            The <code className="bg-red-100 px-1 py-0.5 rounded">frame_prices</code> column needs to be added to your Supabase database.
          </p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-yellow-900 mb-2">📋 Follow These Steps:</h4>
        <ol className="text-sm text-yellow-800 list-decimal list-inside space-y-2">
          <li>Click the "Copy Migration SQL" button below</li>
          <li>Click "Open Supabase SQL Editor" to open your database</li>
          <li>Paste the SQL code (Ctrl+V or Cmd+V)</li>
          <li>Click the "Run" button (▶️) in Supabase</li>
          <li>Wait for "Success. No rows returned" message</li>
          <li>Return here and refresh the page</li>
        </ol>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Migration SQL
            </>
          )}
        </button>
        <a
          href={`https://supabase.com/dashboard/project/${projectId}/sql`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          Open Supabase SQL Editor
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
        <pre className="text-sm text-green-400 font-mono whitespace-pre">
          <code>{MIGRATION_SQL}</code>
        </pre>
      </div>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">ℹ️ What this does:</h4>
        <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
          <li>Adds a new <code className="bg-blue-100 px-1 rounded">frame_prices</code> column to the <code className="bg-blue-100 px-1 rounded">sizes</code> table</li>
          <li>Sets default value to empty JSON object <code className="bg-blue-100 px-1 rounded">{'{}'}</code></li>
          <li>Creates an index for faster queries</li>
          <li>Safe to run multiple times (uses IF NOT EXISTS)</li>
        </ul>
      </div>
    </div>
  );
};
