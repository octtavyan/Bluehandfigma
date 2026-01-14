import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Home, ShoppingBag, Image, Palette, ShoppingCart, Percent, BookOpen, Mail, FileCheck, Shield } from 'lucide-react';

interface SitemapLink {
  title: string;
  path: string;
  icon: React.ReactNode;
  description: string;
}

interface SitemapSection {
  category: string;
  links: SitemapLink[];
}

export const SitemapPage: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<Array<{ id: string; title: string; slug: string }>>([]);
  const [paintings, setPaintings] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    // Load blog posts from localStorage
    const storedBlogPosts = localStorage.getItem('blogPosts');
    if (storedBlogPosts) {
      const posts = JSON.parse(storedBlogPosts);
      setBlogPosts(posts.filter((post: any) => post.status === 'published'));
    }

    // Load paintings from localStorage
    const storedPaintings = localStorage.getItem('paintings');
    if (storedPaintings) {
      setPaintings(JSON.parse(storedPaintings));
    }
  }, []);

  const sitemapSections: SitemapSection[] = [
    {
      category: 'Pagini Principale',
      links: [
        {
          title: 'Acasă',
          path: '/',
          icon: <Home className="w-5 h-5" />,
          description: 'Pagina principală BlueHand Canvas'
        },
        {
          title: 'Produse',
          path: '/products',
          icon: <ShoppingBag className="w-5 h-5" />,
          description: 'Catalogul complet de tablouri canvas'
        },
        {
          title: 'Tablouri Canvas',
          path: '/tablouri-canvas',
          icon: <Image className="w-5 h-5" />,
          description: 'Explorează colecția de tablouri canvas'
        },
        {
          title: 'Multicanvas',
          path: '/multicanvas',
          icon: <Palette className="w-5 h-5" />,
          description: 'Tablouri multicanvas pentru decorare impresionantă'
        },
        {
          title: 'Personalizate',
          path: '/configureaza-tablou',
          icon: <Palette className="w-5 h-5" />,
          description: 'Configurează propriul tău tablou canvas personalizat'
        }
      ]
    },
    {
      category: 'Cumpărături',
      links: [
        {
          title: 'Coș de Cumpărături',
          path: '/cart',
          icon: <ShoppingCart className="w-5 h-5" />,
          description: 'Vizualizează și gestionează coșul tău'
        },
        {
          title: 'Checkout',
          path: '/checkout',
          icon: <FileCheck className="w-5 h-5" />,
          description: 'Finalizare comandă'
        },
        {
          title: 'Oferte',
          path: '/oferte',
          icon: <Percent className="w-5 h-5" />,
          description: 'Oferte speciale și reduceri'
        }
      ]
    },
    {
      category: 'Informații',
      links: [
        {
          title: 'Blog',
          path: '/blog',
          icon: <BookOpen className="w-5 h-5" />,
          description: 'Articole, știri și inspirație pentru decorarea casei'
        },
        {
          title: 'Contact',
          path: '/contact',
          icon: <Mail className="w-5 h-5" />,
          description: 'Contactează-ne pentru informații și suport'
        },
        {
          title: 'Termeni și Condiții',
          path: '/termeni-si-conditii',
          icon: <FileText className="w-5 h-5" />,
          description: 'Termeni și condiții de utilizare'
        },
        {
          title: 'GDPR',
          path: '/gdpr',
          icon: <Shield className="w-5 h-5" />,
          description: 'Politica de confidențialitate și protecția datelor'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-16">
        <div className="max-w-[1600px] mx-auto px-6 text-center">
          <h1 className="text-3xl text-gray-900 mb-4">Harta Site</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explorează toate paginile și produsele disponibile pe BlueHand Canvas
          </p>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-16">
        {sitemapSections.map((section) => (
          <div key={section.category} className="mb-12">
            <h2 className="text-gray-900 mb-6 pb-3 border-b border-gray-200">
              {section.category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="text-[#6994FF] mt-1 group-hover:scale-110 transition-transform">
                    {link.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-900 mb-1">{link.title}</h3>
                    <p className="text-sm text-gray-600">{link.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Blog Posts */}
        {blogPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-gray-900 mb-6 pb-3 border-b border-gray-200">
              Articole Blog
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {blogPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="text-[#6994FF] mt-1 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-900">{post.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Paintings */}
        {paintings.length > 0 && (
          <div className="mb-12">
            <h2 className="text-gray-900 mb-6 pb-3 border-b border-gray-200">
              Tablouri ({paintings.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {paintings.map((painting) => (
                <Link
                  key={painting.id}
                  to={`/product/${painting.id}`}
                  className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="text-[#6994FF] mt-1 group-hover:scale-110 transition-transform">
                    <Image className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-900 text-sm">{painting.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
