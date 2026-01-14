import { Product, Category, BlogPost } from '../types';

export const categories: Category[] = [
  { id: '1', name: 'Living', image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXZpbmclMjByb29tJTIwY2FudmFzfGVufDF8fHx8MTc2NTU1MDYzNXww&ixlib=rb-4.1.0&q=80&w=1080', slug: 'living' },
  { id: '2', name: 'Dormitor', image: 'https://images.unsplash.com/photo-1709544345887-3b677acf8751?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWRyb29tJTIwd2FsbCUyMGFydHxlbnwxfHx8fDE3NjU1NTA2MzV8MA&ixlib=rb-4.1.0&q=80&w=1080', slug: 'dormitor' },
  { id: '3', name: 'Bucatarie', image: 'https://images.unsplash.com/photo-1761175345608-a04e095c5c03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraXRjaGVuJTIwd2FsbCUyMGRlY29yfGVufDF8fHx8MTc2NTU1MDYzNnww&ixlib=rb-4.1.0&q=80&w=1080', slug: 'bucatarie' },
  { id: '4', name: 'Feng Shui', image: 'https://images.unsplash.com/photo-1572851628744-79326da42498?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGNhbnZhcyUyMGFydHxlbnwxfHx8fDE3NjU1NDQyODl8MA&ixlib=rb-4.1.0&q=80&w=1080', slug: 'feng-shui' },
  { id: '5', name: 'Minimaliste', image: 'https://images.unsplash.com/photo-1613759007428-9d918fe2d36f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwYXJ0JTIwcG9zdGVyfGVufDF8fHx8MTc2NTU1MDYzOHww&ixlib=rb-4.1.0&q=80&w=1080', slug: 'minimaliste' },
  { id: '6', name: 'Abstracte', image: 'https://images.unsplash.com/photo-1572851628744-79326da42498?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGNhbnZhcyUyMGFydHxlbnwxfHx8fDE3NjU1NDQyODl8MA&ixlib=rb-4.1.0&q=80&w=1080', slug: 'abstracte' },
  { id: '7', name: 'Flori', image: 'https://images.unsplash.com/photo-1685012851682-a2d021571fc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbG9yYWwlMjBjYW52YXMlMjBwYWludGluZ3xlbnwxfHx8fDE3NjU1NTA2MzZ8MA&ixlib=rb-4.1.0&q=80&w=1080', slug: 'flori' },
  { id: '8', name: 'Peisaje', image: 'https://images.unsplash.com/photo-1713817130253-804323ab0094?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5kc2NhcGUlMjBtb3VudGFpbiUyMHBhaW50aW5nfGVufDF8fHx8MTc2NTU1MDYzOHww&ixlib=rb-4.1.0&q=80&w=1080', slug: 'peisaje' },
  { id: '9', name: 'Orase', image: 'https://images.unsplash.com/photo-1576535896385-38e7a6f5b7ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc2t5bGluZSUyMGFydHxlbnwxfHx8fDE3NjU1NTA2Mzd8MA&ixlib=rb-4.1.0&q=80&w=1080', slug: 'orase' },
  { id: '10', name: 'Gold & Black', image: 'https://images.unsplash.com/photo-1743594789385-323b38491cdc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkJTIwYmxhY2slMjBsdXh1cnl8ZW58MXx8fHwxNzY1NTUwNjM3fDA&ixlib=rb-4.1.0&q=80&w=1080', slug: 'gold-black' },
  { id: '11', name: 'Motivationale', image: 'https://images.unsplash.com/photo-1568622462875-e8bf271ca830?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RpdmF0aW9uYWwlMjBxdW90ZSUyMGFydHxlbnwxfHx8fDE3NjU1NTA2Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080', slug: 'motivationale' },
  { id: '12', name: 'Animale', image: 'https://images.unsplash.com/photo-1694856624966-478202b1a046?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltYWwlMjB3aWxkbGlmZSUyMHBvcnRyYWl0fGVufDF8fHx8MTc2NTU1MDYzOXww&ixlib=rb-4.1.0&q=80&w=1080', slug: 'animale' },
];

export const products: Product[] = [
  {
    id: '1',
    title: 'Peisaj Abstract Auriu',
    price: 149,
    image: 'https://images.unsplash.com/photo-1572851628744-79326da42498?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGNhbnZhcyUyMGFydHxlbnwxfHx8fDE3NjU1NDQyODl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'abstracte',
    dimensions: [
      { size: '30x40 cm', price: 89 },
      { size: '40x60 cm', price: 129 },
      { size: '60x80 cm', price: 189 },
      { size: '80x120 cm', price: 289 },
    ],
  },
  {
    id: '2',
    title: 'Flori de Primăvară',
    price: 119,
    image: 'https://images.unsplash.com/photo-1685012851682-a2d021571fc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbG9yYWwlMjBjYW52YXMlMjBwYWludGluZ3xlbnwxfHx8fDE3NjU1NTA2MzZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'flori',
    dimensions: [
      { size: '30x40 cm', price: 79 },
      { size: '40x60 cm', price: 119 },
      { size: '60x80 cm', price: 169 },
    ],
  },
  {
    id: '3',
    title: 'Munte Maiestuos',
    price: 139,
    image: 'https://images.unsplash.com/photo-1713817130253-804323ab0094?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW5kc2NhcGUlMjBtb3VudGFpbiUyMHBhaW50aW5nfGVufDF8fHx8MTc2NTU1MDYzOHww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'peisaje',
    dimensions: [
      { size: '40x60 cm', price: 139 },
      { size: '60x80 cm', price: 199 },
      { size: '80x120 cm', price: 299 },
    ],
  },
  {
    id: '4',
    title: 'Oraș Modern',
    price: 159,
    image: 'https://images.unsplash.com/photo-1576535896385-38e7a6f5b7ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc2t5bGluZSUyMGFydHxlbnwxfHx8fDE3NjU1NTA2Mzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'orase',
    dimensions: [
      { size: '40x60 cm', price: 159 },
      { size: '60x80 cm', price: 219 },
      { size: '80x120 cm', price: 319 },
    ],
  },
  {
    id: '5',
    title: 'Lux Gold & Black',
    price: 199,
    image: 'https://images.unsplash.com/photo-1743594789385-323b38491cdc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkJTIwYmxhY2slMjBsdXh1cnl8ZW58MXx8fHwxNzY1NTUwNjM3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'gold-black',
    dimensions: [
      { size: '40x60 cm', price: 199 },
      { size: '60x80 cm', price: 279 },
      { size: '80x120 cm', price: 389 },
    ],
  },
  {
    id: '6',
    title: 'Motivație Zilnică',
    price: 99,
    image: 'https://images.unsplash.com/photo-1568622462875-e8bf271ca830?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RpdmF0aW9uYWwlMjBxdW90ZSUyMGFydHxlbnwxfHx8fDE3NjU1NTA2Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'motivationale',
    dimensions: [
      { size: '30x40 cm', price: 99 },
      { size: '40x60 cm', price: 139 },
      { size: '60x80 cm', price: 189 },
    ],
  },
  {
    id: '7',
    title: 'Minimalist Art',
    price: 129,
    image: 'https://images.unsplash.com/photo-1613759007428-9d918fe2d36f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwYXJ0JTIwcG9zdGVyfGVufDF8fHx8MTc2NTU1MDYzOHww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'minimaliste',
    dimensions: [
      { size: '30x40 cm', price: 89 },
      { size: '40x60 cm', price: 129 },
      { size: '60x80 cm', price: 179 },
    ],
  },
  {
    id: '8',
    title: 'Wildlife Portrait',
    price: 149,
    image: 'https://images.unsplash.com/photo-1694856624966-478202b1a046?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltYWwlMjB3aWxkbGlmZSUyMHBvcnRyYWl0fGVufDF8fHx8MTc2NTU1MDYzOXww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'animale',
    dimensions: [
      { size: '30x40 cm', price: 99 },
      { size: '40x60 cm', price: 149 },
      { size: '60x80 cm', price: 209 },
    ],
  },
];

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Cum alegi tabloul canvas perfect pentru living',
    excerpt: 'Ghid complet pentru alegerea celui mai potrivit tablou canvas pentru camera ta de zi.',
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXZpbmclMjByb29tJTIwY2FudmFzfGVufDF8fHx8MTc2NTU1MDYzNXww&ixlib=rb-4.1.0&q=80&w=1080',
    date: '2024-12-10',
    slug: 'tablou-canvas-living',
  },
  {
    id: '2',
    title: 'Tendințe în decorarea cu tablouri canvas în 2024',
    excerpt: 'Descoperă cele mai noi tendințe și stiluri în artă murală pentru casa ta.',
    image: 'https://images.unsplash.com/photo-1572851628744-79326da42498?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGNhbnZhcyUyMGFydHxlbnwxfHx8fDE3NjU1NDQyODl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    date: '2024-12-08',
    slug: 'tendinte-2024',
  },
  {
    id: '3',
    title: 'Tablouri personalizate - Cadouri perfecte',
    excerpt: 'De ce un tablou personalizat este cel mai frumos cadou pentru cei dragi.',
    image: 'https://images.unsplash.com/photo-1722173205783-d602329f0743?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjBwaG90byUyMGZyYW1lfGVufDF8fHx8MTc2NTQ3NzQ0N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    date: '2024-12-05',
    slug: 'tablouri-cadouri',
  },
];

export const personalizationModels = [
  {
    id: 'model-1',
    title: 'Canvas Standard 20×30 cm',
    price: 89,
    image: 'https://images.unsplash.com/photo-1722173205783-d602329f0743?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjBwaG90byUyMGZyYW1lfGVufDF8fHx8MTc2NTQ3NzQ0N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'canvas',
    sizes: ['20×30 cm', '30×40 cm', '40×60 cm', '60×80 cm'],
  },
  {
    id: 'model-2',
    title: 'Canvas Standard 30×40 cm',
    price: 119,
    image: 'https://images.unsplash.com/photo-1722173205783-d602329f0743?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjBwaG90byUyMGZyYW1lfGVufDF8fHx8MTc2NTQ3NzQ0N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'canvas',
    sizes: ['30×40 cm', '40×60 cm', '60×80 cm', '80×120 cm'],
  },
  {
    id: 'model-3',
    title: 'Colaj Familie 3 Fotografii',
    price: 159,
    image: 'https://images.unsplash.com/photo-1722173205783-d602329f0743?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjBwaG90byUyMGZyYW1lfGVufDF8fHx8MTc2NTQ3NzQ0N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'familie',
    sizes: ['40×60 cm', '60×80 cm', '80×120 cm'],
  },
  {
    id: 'model-4',
    title: 'King & Queen',
    price: 189,
    image: 'https://images.unsplash.com/photo-1758810410699-2dc1daec82dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21hbnRpYyUyMGNvdXBsZSUyMHNpbGhvdWV0dGV8ZW58MXx8fHwxNzY1NTEzODUwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'cupluri',
    sizes: ['40×60 cm', '60×80 cm'],
  },
  {
    id: 'model-5',
    title: 'Tablou Copii Personalizat',
    price: 99,
    image: 'https://images.unsplash.com/photo-1633104319071-4fa6fa12a613?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMGtpZHMlMjBwbGF5cm9vbXxlbnwxfHx8fDE3NjU1NTA2NDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'copii',
    sizes: ['30×40 cm', '40×60 cm', '60×80 cm'],
  },
  {
    id: 'model-6',
    title: 'Aniversare Personalizată',
    price: 129,
    image: 'https://images.unsplash.com/photo-1650584997985-e713a869ee77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXJ0aGRheSUyMGNlbGVicmF0aW9uJTIwcGFydHl8ZW58MXx8fHwxNzY1NDg4NTA4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'aniversari',
    sizes: ['30×40 cm', '40×60 cm', '60×80 cm'],
  },
];
