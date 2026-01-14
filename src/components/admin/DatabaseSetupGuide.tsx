import React from 'react';
import { AlertCircle, CheckCircle, Database } from 'lucide-react';

export const DatabaseSetupGuide: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Database Setup Required</h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Missing Database Columns</h3>
                <p className="mt-2 text-sm text-yellow-700">
                  Your Supabase <code className="bg-yellow-100 px-1 rounded">paintings</code> table is missing the <code className="bg-yellow-100 px-1 rounded">dominant_color</code> and <code className="bg-yellow-100 px-1 rounded">orientation</code> columns needed for color filtering.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
              Open Supabase Table Editor
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-8">
              <li>Go to your Supabase dashboard at <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">app.supabase.com</a></li>
              <li>Select your project</li>
              <li>Click on <strong>Table Editor</strong> in the left sidebar</li>
              <li>Find and click on the <strong>paintings</strong> table</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
              Add the "dominant_color" Column
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-8">
              <li>Click the <strong>+ New Column</strong> button at the top right</li>
              <li>Enter the following details:
                <div className="mt-2 bg-gray-50 p-3 rounded border border-gray-200 font-mono text-xs space-y-1">
                  <div><strong>Name:</strong> dominant_color</div>
                  <div><strong>Type:</strong> text</div>
                  <div><strong>Default Value:</strong> (leave empty)</div>
                  <div><strong>Primary Key:</strong> unchecked</div>
                  <div><strong>Allow nullable:</strong> checked ✓</div>
                </div>
              </li>
              <li>Click <strong>Save</strong></li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
              Add the "orientation" Column
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-8">
              <li>Click the <strong>+ New Column</strong> button again</li>
              <li>Enter the following details:
                <div className="mt-2 bg-gray-50 p-3 rounded border border-gray-200 font-mono text-xs space-y-1">
                  <div><strong>Name:</strong> orientation</div>
                  <div><strong>Type:</strong> text</div>
                  <div><strong>Default Value:</strong> 'portrait'</div>
                  <div><strong>Primary Key:</strong> unchecked</div>
                  <div><strong>Allow nullable:</strong> checked ✓</div>
                </div>
              </li>
              <li>Click <strong>Save</strong></li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
              Refresh the Application
            </h3>
            <p className="text-sm text-gray-700 ml-8">
              After adding both columns, refresh this page (F5 or Cmd+R) and the color filter will work!
            </p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">What happens next?</h3>
                <p className="mt-2 text-sm text-blue-700">
                  Once you've added these columns, you'll need to edit each painting in the CMS and select its dominant color and orientation. The app will automatically save these values and the color filter will start working.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Alternative: SQL Query</h4>
            <p className="text-xs text-gray-600 mb-2">If you prefer, you can run these SQL commands in the Supabase SQL Editor:</p>
            <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`ALTER TABLE paintings 
ADD COLUMN dominant_color text,
ADD COLUMN orientation text DEFAULT 'portrait';`}
            </pre>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            I've Added the Columns - Refresh Now
          </button>
        </div>
      </div>
    </div>
  );
};
