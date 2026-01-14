// This function initializes sample paintings data if none exists
export const initializeSamplePaintings = () => {
  const samplePaintings = [
    {
      id: 'painting-1',
      name: 'Abstract Modern Blue',
      category: 'Living',
      subcategory: 'Abstract',
      description: 'Tablou abstract modern cu nuanțe de albastru și auriu, perfect pentru spații contemporane.',
      imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800',
      sizes: [
        { sizeId: 'size-2', sizeName: '20×30 cm', price: 63 },
        { sizeId: 'size-3', sizeName: '30×40 cm', price: 78 },
        { sizeId: 'size-6', sizeName: '40×60 cm', price: 105 }
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: 'painting-2',
      name: 'Peisaj Romantic',
      category: 'Dormitor',
      subcategory: 'Romantic',
      description: 'Peisaj delicat cu culori calde, ideal pentru crearea unei atmosfere romantice în dormitor.',
      imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
      sizes: [
        { sizeId: 'size-4', sizeName: '30×50 cm', price: 115 },
        { sizeId: 'size-5', sizeName: '35×50 cm', price: 125 },
        { sizeId: 'size-6', sizeName: '40×60 cm', price: 148 }
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: 'painting-3',
      name: 'Fresh Vegetables',
      category: 'Bucătărie',
      subcategory: 'Fresh',
      description: 'Compoziție vibrantă cu legume proaspete, perfectă pentru decorarea bucătăriei.',
      imageUrl: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800',
      sizes: [
        { sizeId: 'size-3', sizeName: '30×40 cm', price: 89 },
        { sizeId: 'size-6', sizeName: '40×60 cm', price: 135 }
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: 'painting-4',
      name: 'Motivational Quote',
      category: 'Birou',
      subcategory: 'Motivațional',
      description: 'Design minimal cu citat motivațional, ideal pentru spațiul de lucru.',
      imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
      sizes: [
        { sizeId: 'size-2', sizeName: '20×30 cm', price: 68 },
        { sizeId: 'size-3', sizeName: '30×40 cm', price: 95 }
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: 'painting-5',
      name: 'Cute Animals',
      category: 'Copii',
      subcategory: 'Animale',
      description: 'Tablou colorat cu animale drăguțe, perfect pentru camera copiilor.',
      imageUrl: 'https://images.unsplash.com/photo-1694856624966-478202b1a046?w=800',
      sizes: [
        { sizeId: 'size-2', sizeName: '20×30 cm', price: 72 },
        { sizeId: 'size-3', sizeName: '30×40 cm', price: 98 },
        { sizeId: 'size-6', sizeName: '40×60 cm', price: 142 }
      ],
      createdAt: new Date().toISOString()
    },
    {
      id: 'painting-6',
      name: 'Spa Relaxation',
      category: 'Baie',
      subcategory: 'Spa',
      description: 'Atmosferă relaxantă de spa pentru baie, cu tonuri calmante.',
      imageUrl: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800',
      sizes: [
        { sizeId: 'size-2', sizeName: '20×30 cm', price: 65 },
        { sizeId: 'size-3', sizeName: '30×40 cm', price: 88 }
      ],
      createdAt: new Date().toISOString()
    }
  ];

  return samplePaintings;
};