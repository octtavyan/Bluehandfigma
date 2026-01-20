import React from 'react';
import { Link } from 'react-router';
import { Calendar, ArrowRight } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const BlogPage: React.FC = () => {
  const { blogPosts } = useAdmin();

  // Filter to show only published posts, sorted by creation date (newest first)
  // The database already returns posts sorted by created_at descending
  const publishedPosts = blogPosts
    .filter(post => post.isPublished)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Standardized for Mobile */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-2xl md:text-3xl text-gray-900 mb-3 md:mb-4">Blog & Inspirație</h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Descoperă cele mai noi tendințe în decorarea interioară și sfaturi pentru alegerea
            tablourilor canvas perfecte
          </p>
        </div>
      </div>

      {/* Blog Posts Section - Standardized */}
      <div className="max-w-7xl mx-auto px-6 py-8 md:py-12">
        {publishedPosts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">Nu există articole publicate momentan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedPosts.map(post => (
              <article key={post.id} className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                <Link to={`/blog/${post.slug}`}>
                  <div className="aspect-video bg-gray-100 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>

                <div className="p-6">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                    <Calendar className="w-4 h-4" />
                    <time>{new Date(post.publishDate).toLocaleDateString('ro-RO', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</time>
                  </div>

                  <Link to={`/blog/${post.slug}`}>
                    <h2 className="text-gray-900 mb-3 hover:text-yellow-600 transition-colors">
                      {post.title}
                    </h2>
                  </Link>

                  <p className="text-gray-600 mb-4">{post.excerpt}</p>

                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center space-x-2 text-yellow-600 hover:text-yellow-700 transition-colors"
                  >
                    <span>Citește mai mult</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-16 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-8 text-center">
          <h2 className="text-gray-900 mb-4">Abonează-te la Newsletter</h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Primește cele mai noi articole, oferte exclusive și inspirație pentru casa ta
            direct în inbox
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Adresa ta de email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <button className="px-8 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
              Abonează-te
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};