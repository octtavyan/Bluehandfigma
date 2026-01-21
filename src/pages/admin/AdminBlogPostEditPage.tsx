import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Save, X, Upload, ArrowLeft, Eye } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { toast } from 'sonner';
import { processBlogContentForDisplay } from '../../utils/formatBlogContent';
import { RichTextEditor } from '../../components/admin/RichTextEditor';
import { cloudinaryService } from '../../services/cloudinaryService';
import { blogPostsService } from '../../lib/supabaseDataService';

export const AdminBlogPostEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { blogPosts, addBlogPost, updateBlogPost } = useAdmin();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image: '',
    category: 'Home Decor',
    author: '',
    publishDate: new Date().toISOString().split('T')[0],
    isPublished: true,
  });

  const isEditing = !!id;

  useEffect(() => {
    const loadBlogPost = async () => {
      if (id) {
        setLoading(true);
        try {
          // Fetch full blog post with content from database
          console.log('🔄 Loading full blog post with content for ID:', id);
          const post = await blogPostsService.getById(id);
          
          if (post) {
            console.log('✅ Blog post loaded:', { 
              title: post.title, 
              contentLength: post.content?.length || 0 
            });
            setFormData({
              title: post.title,
              slug: post.slug,
              excerpt: post.excerpt,
              content: post.content,
              image: post.image,
              category: post.category,
              author: post.author,
              publishDate: post.publishDate,
              isPublished: post.isPublished,
            });
          } else {
            console.error('❌ Blog post not found with ID:', id);
            toast.error('Articolul nu a fost găsit');
            navigate('/admin/blog-posts');
          }
        } catch (error) {
          console.error('❌ Error loading blog post:', error);
          toast.error('Eroare la încărcarea articolului');
        } finally {
          setLoading(false);
        }
      }
    };

    loadBlogPost();
  }, [id, navigate]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        await updateBlogPost(id, formData);
      } else {
        await addBlogPost(formData);
      }
      navigate('/admin/blog-posts');
    } catch (error) {
      console.error('❌ Error saving blog post:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Te rugăm să încarci un fișier imagine valid (JPG, PNG, etc.)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imaginea este prea mare. Dimensiunea maximă este 5MB.');
      return;
    }

    setUploadingImage(true);

    try {
      // Upload to Cloudinary
      toast.info('Încărcare imagine pe Cloudinary...');
      const cloudinaryUrl = await cloudinaryService.uploadImage(file, 'blog-posts');
      
      setFormData({ ...formData, image: cloudinaryUrl });
      toast.success('Imagine încărcată cu succes pe Cloudinary!');
    } catch (error) {
      toast.error('Eroare la încărcarea imaginii. Te rugăm să încerci din nou.');
      console.error('Error uploading image:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/blog-posts')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Înapoi la Blog Posts</span>
          </button>
          <h1 className="text-2xl sm:text-3xl text-gray-900">
            {isEditing ? 'Editează Articol' : 'Adaugă Articol Nou'}
          </h1>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Titlu</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Slug (URL)</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Excerpt (scurt rezumat)</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none resize-none text-gray-900"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Conținut</label>
              <p className="text-xs text-gray-500 mb-2">
                💡 Folosește toolbar-ul pentru formatare sau tastează direct. Selectează textul pentru a-l formata.
              </p>
              <RichTextEditor
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="Scrie sau lipește aici conținutul articolului..."
                minHeight="400px"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Imagine Articol</label>
              
              {/* Upload Button */}
              <div className="mb-3">
                <label className="flex items-center justify-center w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-yellow-500 transition-colors bg-gray-50 hover:bg-yellow-50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-600" />
                  <span className="text-gray-700 text-sm sm:text-base">
                    {uploadingImage ? 'Se încarcă...' : 'Încarcă imagine'}
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Sau introdu un URL mai jos (JPG, PNG - max 2MB)
                </p>
              </div>

              {/* URL Input */}
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none text-gray-900"
                placeholder="URL imagine..."
                required
              />
              
              {/* Image Preview */}
              {formData.image && (
                <div className="mt-3">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-48 sm:h-64 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3Ctext fill=%22%23999%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3EEroare imagine%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Categorie</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Autor</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none text-gray-900"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Dată Publicare</label>
                <input
                  type="date"
                  value={formData.publishDate}
                  onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Status</label>
                <select
                  value={formData.isPublished ? 'published' : 'draft'}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.value === 'published' })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none text-gray-900"
                >
                  <option value="published">Publicat</option>
                  <option value="draft">Ciornă</option>
                </select>
              </div>
            </div>

            {/* Action Buttons - Fixed at bottom on mobile */}
            <div className="sticky bottom-0 left-0 right-0 bg-white pt-4 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 border-t sm:border-t-0 mt-6">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/admin/blog-posts')}
                  className="w-full sm:flex-1 px-4 sm:px-6 py-3 text-sm sm:text-base bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Anulează</span>
                </button>
                <button
                  type="submit"
                  className="w-full sm:flex-1 px-4 sm:px-6 py-3 text-sm sm:text-base bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{isEditing ? 'Salvează Modificările' : 'Adaugă Articol'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Preview Button */}
        <div className="mt-4">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="w-full px-4 py-3 text-sm sm:text-base bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
          >
            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{showPreview ? 'Ascunde Previzualizare' : 'Previzualizare Articol'}</span>
          </button>
        </div>

        {/* Preview Content */}
        {showPreview && (
          <div className="mt-4 bg-white rounded-lg border-2 border-gray-200 p-6 sm:p-8">
            <div className="max-w-3xl mx-auto">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">PREVIZUALIZARE</p>
              
              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-6 leading-tight">
                {formData.title || 'Titlul articolului'}
              </h1>
              
              {/* Meta */}
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
                <span>De {formData.author || 'Autor'}</span>
                <span>•</span>
                <span>{new Date(formData.publishDate).toLocaleDateString('ro-RO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}</span>
              </div>
              
              {/* Image */}
              {formData.image && (
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-8">
                  <img
                    src={formData.image}
                    alt="Previzualizare articol"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3Ctext fill=%22%23999%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3EEroare imagine%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              )}
              
              {/* Excerpt */}
              <p className="text-xl text-gray-700 leading-relaxed mb-8 font-medium">
                {formData.excerpt || 'Excerpt-ul va apărea aici...'}
              </p>
              
              {/* Content - formatted */}
              <div 
                className="text-gray-700 leading-relaxed space-y-6
                  [&>p]:mb-6 [&>p]:text-lg [&>p]:leading-relaxed
                  [&>h2]:text-2xl [&>h2]:text-gray-900 [&>h2]:mt-12 [&>h2]:mb-4 [&>h2]:font-semibold
                  [&>h3]:text-xl [&>h3]:text-gray-900 [&>h3]:mt-8 [&>h3]:mb-3 [&>h3]:font-semibold
                  [&>h4]:text-lg [&>h4]:text-gray-900 [&>h4]:mt-6 [&>h4]:mb-2 [&>h4]:font-semibold
                  [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ul]:space-y-2
                  [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-6 [&>ol]:space-y-2
                  [&>blockquote]:border-l-4 [&>blockquote]:border-[#6994FF] [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-6
                  [&>img]:rounded-lg [&>img]:my-8 [&>img]:w-full
                  [&>a]:text-[#6994FF] [&>a]:underline [&>a]:hover:text-[#5078E6]
                  [&>strong]:font-semibold [&>strong]:text-gray-900
                  [&>em]:italic"
                dangerouslySetInnerHTML={{ __html: formData.content || '<p class="text-gray-400">Conținutul formatat va apărea aici...</p>' }}
              />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};