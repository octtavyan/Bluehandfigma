import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, User, Calendar, Edit2 } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin, BlogPost } from '../../context/AdminContext';
import { CacheService, CACHE_KEYS } from '../../lib/cacheService';

export const AdminBlogPostsPage: React.FC = () => {
  const { blogPosts, updateBlogPost, deleteBlogPost, refreshData } = useAdmin();
  const navigate = useNavigate();
  
  // Force fresh data load on mount (clear cache)
  useEffect(() => {
    const loadFreshData = async () => {
      console.log('🔄 AdminBlogPostsPage: Clearing blog posts cache and forcing fresh load...');
      CacheService.invalidate(CACHE_KEYS.BLOG_POSTS);
      await refreshData();
      console.log('✅ AdminBlogPostsPage: Fresh blog posts loaded');
    };
    loadFreshData();
  }, []); // Run once on mount

  // Sort posts by publish date (newest first)
  const sortedPosts = [...blogPosts].sort((a, b) => 
    new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );

  const handleDelete = (postId: string) => {
    if (confirm('Ești sigur că vrei să ștergi acest articol?')) {
      deleteBlogPost(postId);
    }
  };

  const handleTogglePublish = (post: BlogPost) => {
    updateBlogPost(post.id, { isPublished: !post.isPublished });
  };

  return (
    <AdminLayout>
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2">Blog Posts</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Gestionează articolele din blog
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/blog-posts/new')}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center space-x-2 text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Adaugă Articol Nou</span>
            <span className="sm:hidden">Adaugă</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-lg border-2 border-gray-200 p-3 sm:p-6">
          <div className="text-xs sm:text-base text-gray-600 mb-1 sm:mb-2">Total Articole</div>
          <div className="text-xl sm:text-3xl text-gray-900">{blogPosts.length}</div>
        </div>
        <div className="bg-white rounded-lg border-2 border-gray-200 p-3 sm:p-6">
          <div className="text-xs sm:text-base text-gray-600 mb-1 sm:mb-2">Publicate</div>
          <div className="text-xl sm:text-3xl text-green-600">
            {blogPosts.filter(p => p.isPublished).length}
          </div>
        </div>
        <div className="bg-white rounded-lg border-2 border-gray-200 p-3 sm:p-6">
          <div className="text-xs sm:text-base text-gray-600 mb-1 sm:mb-2">Ciorne</div>
          <div className="text-xl sm:text-3xl text-yellow-600">
            {blogPosts.filter(p => !p.isPublished).length}
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-3 mb-6">
        {sortedPosts.length === 0 ? (
          <div className="bg-white rounded-lg border-2 border-gray-200 p-8 text-center text-gray-500">
            <Eye className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Nu există articole. Adaugă primul articol!</p>
          </div>
        ) : (
          sortedPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg border-2 border-gray-200 p-4">
              {/* Image */}
              <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden mb-3">
                {post.image ? (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Eye className="w-8 h-8" />
                  </div>
                )}
              </div>

              {/* Title & Excerpt */}
              <div className="mb-3">
                <h3 className="text-sm text-gray-900 mb-1 line-clamp-2">{post.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{post.excerpt}</p>
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div>
                  <span className="text-gray-500">Categorie:</span>
                  <div className="mt-1">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Autor:</span>
                  <div className="text-gray-900 mt-1 flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span className="truncate">{post.author}</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Data:</span>
                  <div className="text-gray-900 mt-1 flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(post.publishDate).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Vizualizări:</span>
                  <div className="text-gray-900 mt-1">{post.views}</div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <button
                  onClick={() => handleTogglePublish(post)}
                  className={`px-3 py-1.5 rounded-full text-xs flex items-center space-x-1 ${
                    post.isPublished
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {post.isPublished ? (
                    <>
                      <Eye className="w-3 h-3" />
                      <span>Publicat</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3" />
                      <span>Ciornă</span>
                    </>
                  )}
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate(`/admin/blog-posts/edit/${post.id}`)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    title="Editează"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    title="Șterge"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider">
                Articol
              </th>
              <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider">
                Categorie
              </th>
              <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider">
                Autor
              </th>
              <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider">
                Dată
              </th>
              <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider">
                Vizualizări
              </th>
              <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs text-gray-600 uppercase tracking-wider">
                Acțiuni
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedPosts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {post.image ? (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Eye className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {post.title}
                      </div>
                      <div className="text-xs text-gray-500 max-w-xs truncate">
                        {post.excerpt}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {post.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(post.publishDate).toLocaleDateString('ro-RO')}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">{post.views}</div>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleTogglePublish(post)}
                    className={`px-3 py-1 rounded-full text-xs flex items-center space-x-1 ${
                      post.isPublished
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {post.isPublished ? (
                      <>
                        <Eye className="w-3 h-3" />
                        <span>Publicat</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" />
                        <span>Ciornă</span>
                      </>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate(`/admin/blog-posts/edit/${post.id}`)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Editează"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="Șterge"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {blogPosts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Eye className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Nu există articole. Adaugă primul articol!</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};