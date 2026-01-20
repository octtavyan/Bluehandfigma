import React, { useState } from 'react';
import { useNavigate } from 'react-router';

interface MulticanvasLayout {
  id: string;
  pieces: number;
  title: string;
  description: string;
  preview: string;
}

export const MulticanvasPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedLayout, setSelectedLayout] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');

  const layouts: MulticanvasLayout[] = [
    {
      id: '2-piece',
      pieces: 2,
      title: 'Multicanvas 2 Piese',
      description: 'Perfect pentru spații mici și moderne',
      preview: 'https://images.unsplash.com/photo-1572851628744-79326da42498?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGNhbnZhcyUyMGFydHxlbnwxfHx8fDE3NjU1NDQyODl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: '3-piece',
      pieces: 3,
      title: 'Multicanvas 3 Piese',
      description: 'Cel mai popular format, ideal pentru living',
      preview: 'https://images.unsplash.com/photo-1713817130253-804323ab0094?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5kc2NhcGUlMjBtb3VudGFpbiUyMHBhaW50aW5nfGVufDF8fHx8MTc2NTU1MDYzOHww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: '4-piece',
      pieces: 4,
      title: 'Multicanvas 4 Piese',
      description: 'Pentru un impact vizual maxim',
      preview: 'https://images.unsplash.com/photo-1576535896385-38e7a6f5b7ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc2t5bGluZSUyMGFydHxlbnwxfHx8fDE3NjU1NTA2Mzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: '5-piece',
      pieces: 5,
      title: 'Multicanvas 5 Piese',
      description: 'Design spectaculos pentru pereți mari',
      preview: 'https://images.unsplash.com/photo-1685012851682-a2d021571fc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbG9yYWwlMjBjYW52YXMlMjBwYWludGluZ3xlbnwxfHx8fDE3NjU1NTA2MzZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ];

  const sizes = [
    { id: 'small', label: 'Dimensiune Mică', totalSize: '120×60 cm', price: 249 },
    { id: 'medium', label: 'Dimensiune Medie', totalSize: '150×80 cm', price: 329 },
    { id: 'large', label: 'Dimensiune Mare', totalSize: '200×100 cm', price: 449 },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-gray-900 mb-4">Multicanvas - Tablouri în Mai Multe Piese</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Creează un efect vizual impresionant cu tablourile multicanvas. Alege numărul de
            piese și dimensiunea perfectă pentru spațiul tău.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-16">
          <h2 className="text-gray-900 mb-8">Selectează Layout-ul</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {layouts.map(layout => (
              <button
                key={layout.id}
                onClick={() => setSelectedLayout(layout.id)}
                className={`text-left border-2 rounded-lg overflow-hidden transition-all ${
                  selectedLayout === layout.id
                    ? 'border-yellow-500 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="aspect-[4/3] bg-gray-100 relative">
                  <img
                    src={layout.preview}
                    alt={layout.title}
                    loading="lazy"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm">
                    {layout.pieces} piese
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-gray-900 mb-1">{layout.title}</h3>
                  <p className="text-sm text-gray-600">{layout.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedLayout && (
          <div className="mb-16">
            <h2 className="text-gray-900 mb-8">Selectează Dimensiunea</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {sizes.map(size => (
                <button
                  key={size.id}
                  onClick={() => setSelectedSize(size.id)}
                  className={`p-6 border-2 rounded-lg transition-all ${
                    selectedSize === size.id
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-gray-900 mb-2">{size.label}</div>
                  <div className="text-sm text-gray-600 mb-3">Total: {size.totalSize}</div>
                  <div className="text-2xl text-yellow-600">{size.price.toFixed(2)} lei</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedLayout && selectedSize && (
          <div className="bg-gray-50 rounded-lg p-8">
            <h3 className="text-gray-900 mb-4">Previzualizare Aranjament</h3>
            <div className="bg-white rounded-lg p-8 mb-6 flex items-center justify-center min-h-[400px]">
              <div className="flex items-center justify-center space-x-4">
                {Array.from({
                  length: layouts.find(l => l.id === selectedLayout)?.pieces || 0,
                }).map((_, i) => (
                  <div
                    key={i}
                    className={`bg-gray-200 rounded shadow-lg ${
                      i === 1 ? 'w-32 h-48' : 'w-28 h-40'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 mb-1">
                  Layout selectat:{' '}
                  <span className="text-gray-900">
                    {layouts.find(l => l.id === selectedLayout)?.title}
                  </span>
                </p>
                <p className="text-gray-700">
                  Dimensiune:{' '}
                  <span className="text-gray-900">
                    {sizes.find(s => s.id === selectedSize)?.label}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-600 mb-2">Preț total</p>
                <p className="text-3xl text-yellow-600">
                  {(sizes.find(s => s.id === selectedSize)?.price || 0).toFixed(2)} lei
                </p>
              </div>
            </div>

            <button className="w-full mt-6 px-8 py-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
              Adaugă în Coș
            </button>
          </div>
        )}

        <div className="mt-16 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-8">
          <h3 className="text-gray-900 mb-4 text-center">
            Vrei un Multicanvas Personalizat?
          </h3>
          <p className="text-gray-700 text-center mb-6">
            Transformă fotografiile tale preferate într-un tablou multicanvas spectaculos
          </p>
          <div className="text-center">
            <button
              onClick={() => navigate('/configureaza-tablou')}
              className="inline-block px-8 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Creează Multicanvas Personalizat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};