import React from 'react';

export default function PHPFilesDownloadPage() {
  const files = [
    {
      name: '.htaccess',
      path: '/php-files/.htaccess',
      uploadTo: '/var/www/html/api/.htaccess',
      description: '⚠️ IMPORTANT: URL rewriting for .php extensions + CORS headers',
      icon: '⚙️'
    },
    {
      name: '01-config.php',
      path: '/php-files/01-config.php',
      uploadTo: '/var/www/html/api/config.php',
      description: 'Database configuration and PDO connection',
      icon: '⚙️'
    },
    {
      name: '02-health.php',
      path: '/php-files/02-health.php',
      uploadTo: '/var/www/html/api/health.php',
      description: 'Health check endpoint (test if API is running)',
      icon: '❤️'
    },
    {
      name: '03-paintings.php',
      path: '/php-files/03-paintings.php',
      uploadTo: '/var/www/html/api/paintings.php',
      description: 'Get all paintings from database',
      icon: '🖼️'
    },
    {
      name: '04-auth-login.php',
      path: '/php-files/04-auth-login.php',
      uploadTo: '/var/www/html/api/auth/login.php',
      description: 'Admin login endpoint (IMPORTANT: create auth/ folder first!)',
      icon: '🔐'
    },
    {
      name: '05-categories.php',
      path: '/php-files/05-categories.php',
      uploadTo: '/var/www/html/api/categories.php',
      description: 'Get all categories',
      icon: '📁'
    },
    {
      name: '06-sizes.php',
      path: '/php-files/06-sizes.php',
      uploadTo: '/var/www/html/api/sizes.php',
      description: 'Get all canvas sizes',
      icon: '📏'
    },
    {
      name: '07-orders.php',
      path: '/php-files/07-orders.php',
      uploadTo: '/var/www/html/api/orders.php',
      description: 'Get and create orders',
      icon: '🛒'
    },
    {
      name: '08-create-admin.php',
      path: '/php-files/08-create-admin.php',
      uploadTo: '/var/www/html/api/create-admin.php',
      description: '⚠️ CREATE ADMIN USER - Run once, then DELETE!',
      icon: '👤'
    },
    {
      name: '09-debug-login.php',
      path: '/php-files/09-debug-login.php',
      uploadTo: '/var/www/html/api/debug-login.php',
      description: '🔍 DEBUG LOGIN ISSUES - Shows users, tests passwords, fixes hash',
      icon: '🐛'
    },
    {
      name: '10-test-database.php',
      path: '/php-files/08-test-database.php',
      uploadTo: '/var/www/html/api/test-database.php',
      description: 'Test database connection and tables',
      icon: '🧪'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">🚀 PHP Backend Files</h1>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Problem Found</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Your current PHP files have a <strong>syntax error</strong> causing them to return HTML instead of JSON:</p>
                  <code className="bg-yellow-100 px-2 py-1 rounded mt-2 block">
                    Parse error: syntax error, unexpected '&lt;', expecting end of file
                  </code>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Solution</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Download these clean, tested PHP files and upload them to your server. They include proper CORS headers and error handling.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Files List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">📦 Files to Download</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {files.map((file, index) => (
              <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{file.icon}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{file.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{file.description}</p>
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-xs text-blue-900 mb-1 font-medium">Upload to:</p>
                      <code className="text-sm text-blue-700 font-mono">{file.uploadTo}</code>
                    </div>
                  </div>
                  <a
                    href={file.path}
                    download
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
                  >
                    ⬇️ Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Installation Steps */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Installation Steps</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Download all PHP files</h3>
                <p className="text-sm text-gray-600">Click the download button for each file above</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Create auth/ folder on server</h3>
                <code className="text-sm bg-gray-100 px-3 py-2 rounded block mt-2">
                  mkdir -p /var/www/html/api/auth
                </code>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Upload files to server</h3>
                <p className="text-sm text-gray-600">Use FTP, SFTP, or SSH to upload files to the paths shown above</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Update database credentials</h3>
                <p className="text-sm text-gray-600 mb-2">Edit <code className="bg-gray-100 px-2 py-1 rounded">config.php</code> and change:</p>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  <li><code className="bg-gray-100 px-2 py-1 rounded">DB_NAME</code> - your database name</li>
                  <li><code className="bg-gray-100 px-2 py-1 rounded">DB_USER</code> - your MySQL username</li>
                  <li><code className="bg-gray-100 px-2 py-1 rounded">DB_PASS</code> - your MySQL password</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                5
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Test in browser</h3>
                <p className="text-sm text-gray-600 mb-2">Visit:</p>
                <a 
                  href="https://bluehand.ro/api/health.php" 
                  target="_blank"
                  className="text-sm text-blue-600 hover:text-blue-800 underline block"
                >
                  https://bluehand.ro/api/health.php
                </a>
                <p className="text-sm text-gray-600 mt-2">Should return JSON (not HTML!)</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                ✓
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Test from Figma Make</h3>
                <p className="text-sm text-gray-600">Return here and click "🧪 Test API" - should show all green checkmarks!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📚 Documentation</h2>
          <div className="space-y-3">
            <a
              href="/php-files/README-INSTALLATION.md"
              download
              className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Installation Guide</h3>
                  <p className="text-sm text-gray-600">Complete step-by-step instructions with troubleshooting</p>
                </div>
                <span className="text-2xl">📖</span>
              </div>
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex gap-3">
          <a
            href="/admin/login"
            className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-center transition-colors"
          >
            ← Back to Login
          </a>
          <a
            href="/api-test"
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center transition-colors"
          >
            Test API →
          </a>
        </div>
      </div>
    </div>
  );
}