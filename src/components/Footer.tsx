import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import logoImage from 'figma:asset/e13722fae17f2ce12beb5ca6d76372429e2ea412.png';
import anpcLogo from 'figma:asset/eae8b3109dc56d840e1f79f2c33eef2a480957ea.png';
import solLogo from 'figma:asset/25913da363cd6c42f8a4a62602c125c85410c64f.png';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="max-w-[1600px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="inline-block mb-4">
              <img 
                src={logoImage} 
                alt="Bluehand Logo" 
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-gray-600 text-sm mb-4">
              Tablouri canvas personalizate și artă murală de calitate superioară pentru casa ta.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/Bluehand.Company" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-[#1877F2] transition-colors"
                title="Urmărește-ne pe Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/bluehand2026" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-[#E4405F] transition-colors"
                title="Urmărește-ne pe Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://wa.me/40752109002" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-green-600 transition-colors"
                title="Contactează-ne pe WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-gray-900 mb-4">Produse</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-gray-600 hover:text-gray-900 text-sm">
                  Tablouri Canvas
                </Link>
              </li>
              <li>
                <Link to="/configureaza-tablou" className="text-gray-600 hover:text-gray-900 text-sm">
                  Personalizate
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-gray-900 mb-4">Informații</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/blog" className="text-gray-600 hover:text-gray-900 text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-gray-900 text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/harta-site" className="text-gray-600 hover:text-gray-900 text-sm">
                  Harta Site
                </Link>
              </li>
              <li>
                <Link to="/termeni-si-conditii" className="text-gray-600 hover:text-gray-900 text-sm">
                  Termeni și Condiții
                </Link>
              </li>
              <li>
                <Link to="/gdpr" className="text-gray-600 hover:text-gray-900 text-sm">
                  GDPR
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-gray-600 hover:text-gray-900 text-sm">
                  CMS
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-gray-900 mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <a href="tel:+40752109002" className="hover:text-gray-900 transition-colors">
                  +40 752 109 002
                </a>
              </li>
              <li className="flex items-start space-x-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <a href="mailto:hello@bluehand.ro" className="hover:text-gray-900 transition-colors">
                  hello@bluehand.ro
                </a>
              </li>
              <li className="flex items-start space-x-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Str. Bisericii, nr. 5, Movilita, Ialomita</span>
              </li>
              <li className="flex items-start space-x-2 text-sm">
                <MessageCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                <a 
                  href="https://wa.me/40752109002" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 transition-colors"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <a 
                href="https://anpc.ro/ce-este-sal/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <img 
                  src={anpcLogo} 
                  alt="ANPC - Solutionarea Alternativa a Litigiilor" 
                  className="h-12 w-auto"
                />
              </a>
              <a 
                href="https://consumer-redress.ec.europa.eu/index_en" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <img 
                  src={solLogo} 
                  alt="SOL - Solutionarea Online a Litigiilor" 
                  className="h-12 w-auto"
                />
              </a>
            </div>
            <p className="text-center text-sm text-gray-600">&copy; 2024 BlueHand. Toate drepturile rezervate.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};