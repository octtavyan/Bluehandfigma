import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, RefreshCw, Zap, ExternalLink } from 'lucide-react';
import { isSupabaseConfigured, getSupabase } from '../lib/supabase';
import { projectId } from '../utils/supabase/info';

const FIGMA_MAKE_SUPABASE = !!projectId;

export const SupabaseDebugPanel: React.FC = () => {
  const [status, setStatus] = useState<{
    configured: boolean;
    usingFigmaMake: boolean;
    slidesCount: number;
    tablesExist: boolean;
    error: string | null;
  }>({
    configured: false,
    usingFigmaMake: false,
    slidesCount: 0,
    tablesExist: false,
    error: null
  });
  
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = async () => {
    setIsChecking(true);
    
    const newStatus = {
      configured: isSupabaseConfigured(),
      usingFigmaMake: FIGMA_MAKE_SUPABASE && !localStorage.getItem('supabase_config'),
      slidesCount: 0,
      tablesExist: false,
      error: null as string | null
    };

    if (newStatus.configured) {
      try {
        const supabase = getSupabase();
        
        // Test basic connection with a simple query to kv_store table
        const { error } = await supabase
          .from('kv_store_bbc0c500')
          .select('key', { count: 'exact' })
          .limit(1);
        
        if (error) {
          console.error('❌ Supabase Debug: Error querying database:', error);
          throw error;
        }
        
        newStatus.tablesExist = true;
        newStatus.slidesCount = 0; // Not tracking hero slides anymore
        
      } catch (error: any) {
        // Check error code to provide specific messages
        if (error.code === '42P01' || (error.message && error.message.includes('does not exist'))) {
          // Table doesn't exist
          newStatus.error = 'TABLES_NOT_CREATED';
        } else if (error.code === '42703') {
          // Column doesn't exist - table structure is wrong
          newStatus.error = 'TABLES_INCOMPLETE';
        } else {
          // Other error
          newStatus.error = error.message || 'Connection failed';
        }
      }
    }
    
    setStatus(newStatus);
    setIsChecking(false);
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-500" />
          Supabase Connection Status
        </h3>
        <button
          onClick={checkStatus}
          disabled={isChecking}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
          Check Status
        </button>
      </div>

      <div className="space-y-3">
        {/* Figma Make Notice */}
        {FIGMA_MAKE_SUPABASE && status.usingFigmaMake && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Zap className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-medium text-blue-900">
                Figma Make Supabase Active
              </div>
              <div className="text-sm text-blue-700">
                Using automatic Supabase connection (Project: {projectId})
              </div>
            </div>
          </div>
        )}

        {/* Configuration Status */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          {status.configured ? (
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          )}
          <div className="flex-1">
            <div className="font-medium text-gray-900">
              {status.configured ? 'Supabase Connected' : 'Supabase Not Connected'}
            </div>
            <div className="text-sm text-gray-600">
              {status.configured 
                ? (status.usingFigmaMake 
                    ? 'Using Figma Make automatic connection' 
                    : 'Using custom Supabase configuration')
                : 'No Supabase connection available'}
            </div>
          </div>
        </div>

        {/* Database Status */}
        {status.configured && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            {status.error ? (
              <>
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-red-900">Database Error</div>
                  <div className="text-sm text-red-600">{status.error}</div>
                </div>
              </>
            ) : status.tablesExist ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    Database Ready
                  </div>
                  <div className="text-sm text-gray-600">
                    {status.slidesCount} active hero slide{status.slidesCount !== 1 ? 's' : ''} in database
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          {!status.configured && !FIGMA_MAKE_SUPABASE && (
            <a
              href="/admin/supabase"
              className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Configure Supabase Now
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {/* Show setup instructions when tables don't exist */}
          {status.configured && (status.error === 'TABLES_NOT_CREATED' || status.error === 'TABLES_INCOMPLETE') && (
            <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
              <div className="font-medium text-yellow-900 mb-2">⚠️ Database Setup Required</div>
              <div className="text-sm text-yellow-800 mb-3">
                {status.error === 'TABLES_INCOMPLETE' 
                  ? 'Tables exist but are incomplete or have wrong structure. Please re-run the SQL schema.'
                  : 'Tables haven\'t been created yet. You need to run the SQL setup script.'}
              </div>
              <ol className="text-sm text-yellow-800 list-decimal list-inside space-y-1 mb-3">
                <li>Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">Supabase Dashboard</a></li>
                <li>Open your project: <code className="bg-yellow-100 px-1 rounded">{projectId}</code></li>
                <li>Click <strong>SQL Editor</strong> → <strong>New query</strong></li>
                <li>Copy/paste ALL contents of <code className="bg-yellow-100 px-1 rounded">/supabase_schema.sql</code></li>
                <li>Click <strong>Run</strong> (▶️ button)</li>
                <li>Refresh this page</li>
              </ol>
              <div className="flex gap-2">
                <a
                  href={`https://supabase.com/dashboard/project/${projectId}/sql`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                >
                  Open SQL Editor
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={checkStatus}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Recheck
                </button>
              </div>
            </div>
          )}

          {status.configured && status.tablesExist && status.slidesCount === 0 && (
            <a
              href="/admin/heroslides"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Add Your First Hero Slide
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {status.configured && status.tablesExist && (
            <a
              href="/admin/supabase-test"
              className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              View Database Debug Info
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};