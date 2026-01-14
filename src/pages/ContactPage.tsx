import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, Facebook, Instagram, MessageCircle } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Standardized for Mobile */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-8 md:py-12">
        <div className="max-w-[1600px] mx-auto px-6 text-center">
          <h1 className="text-2xl md:text-3xl text-gray-900 mb-3 md:mb-4">Contact</h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Avem răspunsuri la întrebările tale. Contactează-ne și te vom ajuta cu plăcere!
          </p>
        </div>
      </div>

      {/* Contact Cards Section - Standardized */}
      <div className="max-w-[1600px] mx-auto px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl text-gray-900 mb-2">Telefon</h3>
            <p className="text-gray-700 mb-2">Suntem disponibili Luni - Vineri</p>
            <a href="tel:+40752109002" className="text-yellow-600 hover:text-yellow-700">
              +40 752 109 002
            </a>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl text-gray-900 mb-2">Email</h3>
            <p className="text-gray-700 mb-2">Răspundem în 24 ore</p>
            <a href="mailto:hello@bluehand.ro" className="text-blue-600 hover:text-blue-700">
              hello@bluehand.ro
            </a>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl text-gray-900 mb-2">Adresă</h3>
            <p className="text-gray-700 mb-2">Vizitează showroom-ul nostru</p>
            <p className="text-green-600">Str. Bisericii, nr. 5, Movilita, Ialomita</p>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="mb-16">
          <div className="bg-gradient-to-br from-[#6994FF]/10 to-[#5078E6]/10 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-gray-900 mb-3">Urmărește-ne pe Rețelele Sociale</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Fii la curent cu cele mai noi colecții, oferte speciale și inspirație pentru decorarea casei tale!
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <a
                href="https://www.facebook.com/Bluehand.Company"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3 bg-white border-2 border-[#1877F2] text-[#1877F2] rounded-lg hover:bg-[#1877F2] hover:text-white transition-all shadow-md hover:shadow-lg"
              >
                <Facebook className="w-5 h-5" />
                <span className="font-medium">Facebook</span>
              </a>
              <a
                href="https://www.instagram.com/bluehand2026"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3 bg-white border-2 border-[#E4405F] text-[#E4405F] rounded-lg hover:bg-[#E4405F] hover:text-white transition-all shadow-md hover:shadow-lg"
              >
                <Instagram className="w-5 h-5" />
                <span className="font-medium">Instagram</span>
              </a>
              <a
                href="https://wa.me/40752109002"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-3 bg-white border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-md hover:shadow-lg"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-gray-900 mb-6">Trimite-ne un Mesaj</h2>

            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-green-900 mb-2">Mesaj Trimis!</h3>
                <p className="text-green-700">
                  Mulțumim pentru mesaj. Vom reveni cu un răspuns în cel mai scurt timp posibil.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-gray-700 mb-2">
                    Nume Complet
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-gray-700 mb-2">
                    Subiect
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-gray-700 mb-2">
                    Mesaj
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-8 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                  <span>Trimite Mesaj</span>
                </button>
              </form>
            )}
          </div>

          <div>
            <h2 className="text-gray-900 mb-6">Informații Utile</h2>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-gray-900 mb-2">Program</h3>
                    <div className="space-y-1 text-gray-700">
                      <p>Luni - Vineri: 09:00 - 18:00</p>
                      <p>Sâmbătă: 10:00 - 16:00</p>
                      <p>Duminică: Închis</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-gray-900 mb-3">Întrebări Frecvente</h3>
                <div className="space-y-3">
                  <details className="group">
                    <summary className="cursor-pointer text-gray-700 hover:text-gray-900">
                      Care este timpul de livrare?
                    </summary>
                    <p className="mt-2 text-gray-600 text-sm">
                      Livrarea standard durează 24-48 ore. Pentru București, oferim și livrare
                      express în 1-4 ore.
                    </p>
                  </details>
                  <details className="group">
                    <summary className="cursor-pointer text-gray-700 hover:text-gray-900">
                      Pot returna produsul?
                    </summary>
                    <p className="mt-2 text-gray-600 text-sm">
                      Da, ai la dispoziție 14 zile pentru a returna produsul conform legislației
                      în vigoare.
                    </p>
                  </details>
                  <details className="group">
                    <summary className="cursor-pointer text-gray-700 hover:text-gray-900">
                      Cum pot plăti comanda?
                    </summary>
                    <p className="mt-2 text-gray-600 text-sm">
                      Acceptăm plata cu cardul online, transfer bancar și numerar la livrare.
                    </p>
                  </details>
                </div>
              </div>

              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <iframe
                  src="https://maps.google.com/maps?q=44.631958,26.476440&z=17&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Harta locație BlueHand Canvas - Str. Bisericii, nr. 5, Movilita, Ialomita"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};