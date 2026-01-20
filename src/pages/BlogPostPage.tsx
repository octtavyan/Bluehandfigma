import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router';
import { Calendar, ArrowLeft } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { processBlogContentForDisplay } from '../utils/formatBlogContent';

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { blogPosts, paintings } = useAdmin();
  const post = blogPosts.find(p => p.slug === slug && p.isPublished);

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-gray-900 mb-4">Articolul nu a fost găsit</h2>
          <Link to="/blog" className="text-yellow-600 hover:text-yellow-700">
            ← Înapoi la Blog
          </Link>
        </div>
      </div>
    );
  }

  // Get related posts (other published posts excluding the current one)
  const relatedPosts = blogPosts
    .filter(p => p.id !== post.id && p.isPublished)
    .slice(0, 2);

  // Get random canvas paintings for recommendations (4 paintings)
  const recommendedPaintings = useMemo(() => {
    const activePaintings = paintings.filter(p => p.isActive);
    const shuffled = [...activePaintings].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  }, [paintings, slug]); // Re-randomize when slug changes (new article)

  // Format the content - if already has HTML, use it, otherwise auto-format
  const formattedContent = post.content.includes('<p>') || post.content.includes('<h2>') || post.content.includes('<h3>')
    ? post.content // Already formatted with rich text editor
    : processBlogContentForDisplay(post.content); // Legacy content - auto-format

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/blog"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Înapoi la Blog</span>
        </Link>

        <article>
          <header className="mb-12">
            <div className="flex items-center space-x-2 text-gray-600 text-sm mb-6">
              <Calendar className="w-4 h-4" />
              <time>
                {new Date(post.publishDate).toLocaleDateString('ro-RO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-8 leading-tight">
              {post.title}
            </h1>

            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-8">
              <img src={post.image} alt={post.title} loading="lazy" className="w-full h-full object-cover" />
            </div>
          </header>

          <div className="prose prose-lg max-w-none">
            {/* Excerpt/Introduction */}
            <p className="text-xl text-gray-700 leading-relaxed mb-8 font-medium">
              {post.excerpt}
            </p>

            {/* Main Content - formatted with better readability */}
            <div 
              className="text-gray-700 leading-relaxed space-y-6
                [&>p]:mb-6 [&>p]:text-lg [&>p]:leading-relaxed
                [&>h2]:text-2xl [&>h2]:text-gray-900 [&>h2]:mt-12 [&>h2]:mb-4
                [&>h3]:text-xl [&>h3]:text-gray-900 [&>h3]:mt-8 [&>h3]:mb-3
                [&>h4]:text-lg [&>h4]:text-gray-900 [&>h4]:mt-6 [&>h4]:mb-2
                [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ul]:space-y-2
                [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-6 [&>ol]:space-y-2
                [&>blockquote]:border-l-4 [&>blockquote]:border-[#6994FF] [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-6
                [&>img]:rounded-lg [&>img]:my-8 [&>img]:w-full
                [&>a]:text-[#6994FF] [&>a]:underline [&>a]:hover:text-[#5078E6]
                [&>strong]:font-semibold [&>strong]:text-gray-900
                [&>em]:italic"
              dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
          </div>
        </article>

        {recommendedPaintings.length > 0 && (
          <div className="mt-16 pt-8 border-t-2 border-gray-200">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl text-gray-900 mb-3 md:mb-4">Recomandările Noastre!</h3>
              <p className="text-sm md:text-base text-gray-600">Descoperă tablouri canvas perfecte pentru decorarea casei tale</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {recommendedPaintings.map(painting => (
                <Link
                  key={painting.id}
                  to={`/produs/${painting.id}`}
                  className="group"
                >
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                    <img
                      src={painting.imageUrls?.medium || painting.image}
                      alt={painting.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h4 className="text-sm md:text-base text-gray-900 group-hover:text-[#6994FF] transition-colors line-clamp-2">
                    {painting.title}
                  </h4>
                  <p className="text-sm md:text-base text-gray-900 mt-1">
                    {painting.price} RON
                  </p>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                to="/tablouri-canvas"
                className="inline-block px-6 py-3 bg-[#6994FF] text-white rounded-lg hover:bg-[#5078E6] transition-colors"
              >
                Vezi Toate Tablourile Canvas
              </Link>
            </div>
          </div>
        )}

        {relatedPosts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-gray-900 mb-6">Articole Similare</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map(relatedPost => (
                <Link
                  key={relatedPost.id}
                  to={`/blog/${relatedPost.slug}`}
                  className="group"
                >
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
                    <img
                      src={relatedPost.image}
                      alt={relatedPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h4 className="text-gray-900 group-hover:text-yellow-600 transition-colors">
                    {relatedPost.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};