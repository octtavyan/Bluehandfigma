import React, { useState } from 'react';
import { Tag, Copy, Check } from 'lucide-react';

export const OffersPage: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const offers = [
    {
      id: '1',
      title: '10% Reducere la Prima Comandă',
      description: 'Folosește codul CANVAS10 și primești 10% reducere la prima ta comandă',
      code: 'CANVAS10',
      discount: '10%',
      validUntil: '31.12.2024',
      color: 'yellow',
    },
    {
      id: '2',
      title: 'Transport Gratuit',
      description: 'Livrare gratuită pentru comenzi peste 200 lei',
      code: 'FREESHIP',
      discount: 'Transport Gratuit',
      validUntil: '31.12.2024',
      color: 'blue',
    },
    {
      id: '3',
      title: '15% Reducere Multicanvas',
      description: 'Reducere specială pentru tablouri multicanvas 3+ piese',
      code: 'MULTI15',
      discount: '15%',
      validUntil: '25.12.2024',
      color: 'green',
    },
    {
      id: '4',
      title: 'Oferta Lunii',
      description: 'Reducere de 20% la toate tablourile personalizate',
      code: 'CUSTOM20',
      discount: '20%',
      validUntil: '31.12.2024',
      color: 'purple',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Tag className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h1 className="text-gray-900 mb-4">Oferte și Promoții</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descoperă cele mai bune oferte pentru tablourile tale canvas. Economisește acum!
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {offers.map(offer => (
            <div
              key={offer.id}
              className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div
                className={`p-6 bg-gradient-to-r ${
                  offer.color === 'yellow'
                    ? 'from-yellow-500 to-yellow-600'
                    : offer.color === 'blue'
                    ? 'from-blue-500 to-blue-600'
                    : offer.color === 'green'
                    ? 'from-green-500 to-green-600'
                    : 'from-purple-500 to-purple-600'
                } text-white`}
              >
                <div className="text-3xl mb-2">{offer.discount}</div>
                <h3 className="mb-2">{offer.title}</h3>
              </div>

              <div className="p-6">
                <p className="text-gray-700 mb-4">{offer.description}</p>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Cod Promoțional</p>
                      <p className="text-2xl text-gray-900">{offer.code}</p>
                    </div>
                    <button
                      onClick={() => handleCopyCode(offer.code)}
                      className="p-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      {copiedCode === offer.code ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-600">Valid până la: {offer.validUntil}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8">
          <h2 className="text-gray-900 mb-4 text-center">
            Cum Folosești Codurile Promoționale?
          </h2>
          <div className="max-w-3xl mx-auto">
            <ol className="space-y-4">
              <li className="flex items-start space-x-4">
                <span className="flex-shrink-0 w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center">
                  1
                </span>
                <div>
                  <h3 className="text-gray-900 mb-1">Adaugă Produse în Coș</h3>
                  <p className="text-gray-600">
                    Alege tablourile tale preferate și adaugă-le în coșul de cumpărături
                  </p>
                </div>
              </li>
              <li className="flex items-start space-x-4">
                <span className="flex-shrink-0 w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center">
                  2
                </span>
                <div>
                  <h3 className="text-gray-900 mb-1">Mergi la Coș</h3>
                  <p className="text-gray-600">
                    Verifică produsele din coș și găsește câmpul pentru cod promoțional
                  </p>
                </div>
              </li>
              <li className="flex items-start space-x-4">
                <span className="flex-shrink-0 w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center">
                  3
                </span>
                <div>
                  <h3 className="text-gray-900 mb-1">Aplică Codul</h3>
                  <p className="text-gray-600">
                    Introdu codul promoțional și apasă "Aplică" pentru a primi reducerea
                  </p>
                </div>
              </li>
              <li className="flex items-start space-x-4">
                <span className="flex-shrink-0 w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center">
                  4
                </span>
                <div>
                  <h3 className="text-gray-900 mb-1">Finalizează Comanda</h3>
                  <p className="text-gray-600">
                    Continuă cu comanda și bucură-te de reducerea ta
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-gray-900 mb-2">Oferte Exclusive</h3>
            <p className="text-gray-600">
              Abonează-te la newsletter pentru a primi cele mai bune oferte
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-gray-900 mb-2">Reduceri Sezoniere</h3>
            <p className="text-gray-600">
              Reduceri speciale de sărbători și evenimente speciale
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-gray-900 mb-2">Program Fidelitate</h3>
            <p className="text-gray-600">
              Câștigă puncte la fiecare comandă și primește reduceri
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
