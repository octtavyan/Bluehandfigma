import React, { useState, useEffect } from 'react';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { heroSlidesService } from '../lib/dataService';
import { blogPostsService } from '../lib/dataService';
import { useAdmin } from '../context/AdminContext';

export const DebugSupabasePage: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { heroSlides, blogPosts } = useAdmin();

  useEffect(() => {
    runTests();
  }, []);

  const addResult = (message: string) => {
    setResults(prev => [...prev, message]);
  };

  const runTests = async () => {
    setResults([]);
    addResult('=== SUPABASE CONNECTION TEST ===');
    
    // Test 1: Is configured?
    const configured = isSupabaseConfigured();
    addResult(`1. Is Supabase configured? ${configured ? '✅ YES' : '❌ NO'}`);
    
    if (!configured) {
      addResult('❌ CRITICAL: Supabase is NOT configured!');
      setLoading(false);
      return;
    }
    
    try {
      const supabase = getSupabase();
      addResult(`2. Supabase client created: ✅ YES`);
      
      // Test 2: Direct query to hero_slides
      addResult('3. Testing direct query to hero_slides table...');
      const { data: heroData, error: heroError } = await supabase
        .from('hero_slides')
        .select('*');
      
      if (heroError) {
        addResult(`   ❌ Hero slides error: ${heroError.message} (code: ${heroError.code})`);
      } else {
        addResult(`   ✅ Hero slides data retrieved: ${heroData?.length || 0} rows`);
        if (heroData && heroData.length > 0) {
          addResult(`   First hero slide: ${JSON.stringify(heroData[0], null, 2)}`);
        }
      }
      
      // Test 3: Direct query to blog_posts
      addResult('4. Testing direct query to blog_posts table...');
      const { data: blogData, error: blogError } = await supabase
        .from('blog_posts')
        .select('*');
      
      if (blogError) {
        addResult(`   ❌ Blog posts error: ${blogError.message} (code: ${blogError.code})`);
      } else {
        addResult(`   ✅ Blog posts data retrieved: ${blogData?.length || 0} rows`);
        if (blogData && blogData.length > 0) {
          addResult(`   First blog post: ${JSON.stringify(blogData[0], null, 2)}`);
        }
      }
      
      // Test 4: Service layer
      addResult('5. Testing heroSlidesService.getAll()...');
      const heroSlides = await heroSlidesService.getAll();
      addResult(`   Service returned: ${heroSlides.length} hero slides`);
      if (heroSlides.length > 0) {
        addResult(`   First slide from service: ${JSON.stringify(heroSlides[0], null, 2)}`);
      }
      
      addResult('6. Testing blogPostsService.getAll()...');
      const blogPosts = await blogPostsService.getAll();
      addResult(`   Service returned: ${blogPosts.length} blog posts`);
      if (blogPosts.length > 0) {
        addResult(`   First post from service: ${JSON.stringify(blogPosts[0], null, 2)}`);
      }
      
    } catch (error) {
      addResult(`❌ Test failed with error: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    addResult('=== TEST COMPLETE ===');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl mb-6">🔍 Supabase Connection Debug</h1>
          
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded">
            <h2 className="font-semibold mb-2">Context State (from useAdmin):</h2>
            <p>Hero Slides in Context: {heroSlides.length}</p>
            <p>Blog Posts in Context: {blogPosts.length}</p>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4">Running tests...</p>
            </div>
          )}

          <div className="bg-gray-900 text-green-400 p-6 rounded font-mono text-sm overflow-auto max-h-[600px]">
            {results.map((result, index) => (
              <div key={index} className="mb-1 whitespace-pre-wrap">
                {result}
              </div>
            ))}
          </div>

          <button
            onClick={runTests}
            className="mt-6 bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition-colors"
          >
            🔄 Run Tests Again
          </button>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="font-semibold mb-2">Common Issues:</h3>
            <ul className="list-disc ml-6 space-y-1 text-sm">
              <li>Table not found (PGRST204) - Table doesn't exist in database</li>
              <li>Permission denied (42501) - RLS policies blocking access</li>
              <li>Service returns 0 items - Check isMemoryConstrained() or service logic</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
