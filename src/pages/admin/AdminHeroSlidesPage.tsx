import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, MoveUp, MoveDown, Image as ImageIcon, Upload } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { cloudinaryService } from '../../services/cloudinaryService';
import { toast } from 'sonner';

export const AdminHeroSlidesPage: React.FC = () => {
  const { heroSlides, addHeroSlide, updateHeroSlide, deleteHeroSlide } = useAdmin();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    buttonText: '',
    buttonLink: '',
    backgroundImage: '',
    order: 1,
  });

  // Sort slides by order
  const sortedSlides = [...heroSlides].sort((a, b) => a.order - b.order);

  const handleOpenModal = (slideId?: string) => {
    if (slideId) {
      const slide = heroSlides.find(s => s.id === slideId);
      if (slide) {
        setFormData({
          title: slide.title,
          buttonText: slide.buttonText,
          buttonLink: slide.buttonLink,
          backgroundImage: slide.backgroundImage,
          order: slide.order,
        });
        setEditingSlide(slideId);
      }
    } else {
      setFormData({
        title: '',
        buttonText: '',
        buttonLink: '',
        backgroundImage: '',
        order: heroSlides.length + 1,
      });
      setEditingSlide(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSlide(null);
    setFormData({
      title: '',
      buttonText: '',
      buttonLink: '',
      backgroundImage: '',
      order: 1,
    });
    setImagePreview('');
    setUploadedImageUrls(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSlide) {
        await updateHeroSlide(editingSlide, formData);
      } else {
        await addHeroSlide(formData);
      }
      
      handleCloseModal();
    } catch (error) {
      // Error toast is already shown by AdminContext
      console.error('Error submitting slide:', error);
    }
  };

  const handleDelete = async (slideId: string) => {
    if (confirm('Ești sigur că vrei să ștergi acest slide?')) {
      try {
        await deleteHeroSlide(slideId);
      } catch (error) {
        // Error toast is already shown by AdminContext
        console.error('Error deleting slide:', error);
      }
    }
  };

  const handleMoveUp = async (slideId: string, currentOrder: number) => {
    if (currentOrder <= 1) return;
    
    // Find the slide above
    const slideAbove = heroSlides.find(s => s.order === currentOrder - 1);
    
    if (slideAbove) {
      try {
        await updateHeroSlide(slideAbove.id, { order: currentOrder });
        await updateHeroSlide(slideId, { order: currentOrder - 1 });
      } catch (error) {
        console.error('Error moving slide up:', error);
      }
    }
  };

  const handleMoveDown = async (slideId: string, currentOrder: number) => {
    if (currentOrder >= heroSlides.length) return;
    
    // Find the slide below
    const slideBelow = heroSlides.find(s => s.order === currentOrder + 1);
    
    if (slideBelow) {
      try {
        await updateHeroSlide(slideBelow.id, { order: currentOrder });
        await updateHeroSlide(slideId, { order: currentOrder + 1 });
      } catch (error) {
        console.error('Error moving slide down:', error);
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Te rugăm să încarci un fișier imagine valid (JPG, PNG, etc.)');
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploadingImage(true);
    
    try {
      // Upload to Cloudinary
      toast.info('Încărcare imagine pe Cloudinary...');
      const cloudinaryUrl = await cloudinaryService.uploadImage(file, 'hero-slides');
      
      // Update form data with Cloudinary URL
      setFormData({ 
        ...formData, 
        backgroundImage: cloudinaryUrl
      });
      
      toast.success('Imagine încărcată cu succes pe Cloudinary!');
    } catch (error) {
      toast.error('Eroare la încărcarea imaginii. Te rugăm să încerci din nou.');
      console.error('Error uploading image:', error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl text-gray-900 mb-2">Hero Slides</h1>
            <p className="text-gray-600">
              Gestionează slide-urile hero de pe pagina principală
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Adaugă Slide Nou</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sortedSlides.map((slide) => (
          <div key={slide.id} className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
            <div className="flex">
              {/* Image Preview */}
              <div className="w-64 h-40 flex-shrink-0 bg-gray-100 relative overflow-hidden">
                {slide.backgroundImage ? (
                  <img
                    src={slide.backgroundImage}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                  Ordine: {slide.order}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-6">
                <h3 className="text-xl text-gray-900 mb-2">{slide.title}</h3>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div>
                    <span className="text-gray-700">Buton:</span> {slide.buttonText}
                  </div>
                  <div>
                    <span className="text-gray-700">Link:</span> {slide.buttonLink}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 flex flex-col items-end justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenModal(slide.id)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    title="Editează"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(slide.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    title="Șterge"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleMoveUp(slide.id, slide.order)}
                    disabled={slide.order === 1}
                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Mută în sus"
                  >
                    <MoveUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(slide.id, slide.order)}
                    disabled={slide.order === heroSlides.length}
                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Mută în jos"
                  >
                    <MoveDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {heroSlides.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Nu există slide-uri hero. Adaugă primul slide!</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl text-gray-900">
                {editingSlide ? 'Editează Slide' : 'Adaugă Slide Nou'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Titlu</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none text-gray-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Text Buton</label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">Link Buton</label>
                  <input
                    type="text"
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none text-gray-900"
                    placeholder="/configureaza-tablou"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Imagine Fundal</label>
                
                {/* Upload Button */}
                <div className="mb-3">
                  <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-yellow-500 transition-colors bg-gray-50 hover:bg-yellow-50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Upload className="w-5 h-5 mr-2 text-gray-600" />
                    <span className="text-gray-700">
                      {isUploadingImage ? `Se încarcă... (${uploadProgress}%)` : 'Încarcă imagine de pe calculator'}
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Sau introdu un URL mai jos (JPG, PNG - max 2MB)
                  </p>
                </div>

                {/* URL Input */}
                <input
                  type="text"
                  value={formData.backgroundImage}
                  onChange={(e) => setFormData({ ...formData, backgroundImage: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none text-gray-900"
                  placeholder="https://images.unsplash.com/photo-... sau încarcă un fișier mai sus"
                  required
                />
                
                {/* Image Preview */}
                {formData.backgroundImage && (
                  <div className="mt-3">
                    <img
                      src={formData.backgroundImage}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3Ctext fill=%22%23999%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3EEroare imagine%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Ordine (poziție în slider)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none text-gray-900"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>{editingSlide ? 'Salvează Modificările' : 'Adaugă Slide'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};