import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Package, AlertCircle, Upload, Loader } from 'lucide-react';
import { API_BASE, useAuth } from '../context/AuthContext';

export default function ProductFormModal({ isOpen, onClose, onSave, productToEdit, categories }) {
  const { token } = useAuth();
  
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(1);
  const [description, setDescription] = useState('');
  const [imagesList, setImagesList] = useState(['/images/cow_ghee_front.webp']);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [active, setActive] = useState(true);
  const [variants, setVariants] = useState([
    { weight_or_volume: '500g Jar', price: '350.00', stock: '50', sku: '', active: true }
  ]);
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || '');
      setCategoryId(productToEdit.category_id || (categories[0]?.id || 1));
      setDescription(productToEdit.description || '');
      
      if (Array.isArray(productToEdit.images) && productToEdit.images.length > 0) {
        setImagesList(productToEdit.images);
      } else if (typeof productToEdit.images === 'string') {
        setImagesList([productToEdit.images]);
      } else {
        setImagesList(['/images/cow_ghee_front.webp']);
      }
      
      setActive(productToEdit.active !== undefined ? productToEdit.active : true);

      if (Array.isArray(productToEdit.variants) && productToEdit.variants.length > 0) {
        setVariants(
          productToEdit.variants.map(v => ({
            id: v.id,
            weight_or_volume: v.weight_or_volume || '',
            price: v.price || '',
            stock: v.stock || '0',
            sku: v.sku || '',
            active: v.active !== undefined ? v.active : true
          }))
        );
      } else {
        setVariants([{ weight_or_volume: '500g Jar', price: '350.00', stock: '50', sku: '', active: true }]);
      }
    } else {
      setName('');
      setCategoryId(categories && categories.length > 0 ? categories[0].id : 1);
      setDescription('');
      setImagesList(['/images/cow_ghee_front.webp']);
      setCustomUrlInput('');
      setActive(true);
      setVariants([{ weight_or_volume: '500g Jar', price: '350.00', stock: '50', sku: '', active: true }]);
    }
    setError(null);
  }, [productToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImage(true);
    setError(null);

    try {
      const uploadedUrls = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch(`${API_BASE}/products/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Image upload failed');
        }
        uploadedUrls.push(data.imageUrl);
      }

      setImagesList(prev => [...prev, ...uploadedUrls]);
    } catch (err) {
      console.error('File upload error:', err);
      setError(err.message || 'Failed to upload image file');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    setImagesList(prev => [...prev, customUrlInput.trim()]);
    setCustomUrlInput('');
  };

  const handleRemoveImage = (indexToRemove) => {
    setImagesList(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddVariant = () => {
    setVariants(prev => [
      ...prev,
      { weight_or_volume: '', price: '', stock: '50', sku: '', active: true }
    ]);
  };

  const handleVariantChange = (index, field, value) => {
    setVariants(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveVariant = (indexToRemove) => {
    if (variants.length <= 1) {
      setError('Product must contain at least one package size/variant.');
      return;
    }
    setVariants(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Product Name is required.');
      return;
    }
    if (!description.trim()) {
      setError('Product Description is required.');
      return;
    }
    if (variants.length === 0) {
      setError('At least one variant must be defined.');
      return;
    }
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.weight_or_volume || !v.price) {
        setError(`Variant #${i + 1} requires weight and price.`);
        return;
      }
    }
    if (imagesList.length === 0) {
      setError('At least one product image is required.');
      return;
    }

    const payload = {
      name,
      category_id: parseInt(categoryId, 10),
      description,
      images: imagesList,
      active,
      variants: variants.map(v => ({
        ...v,
        price: parseFloat(v.price) || 0,
        stock: parseInt(v.stock, 10) || 0
      }))
    };

    setSaving(true);
    try {
      await onSave(payload, productToEdit ? productToEdit.id : null);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex justify-between items-center bg-[#FCFAF2] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Package size={22} className="text-[#0033B4]" />
            <h2 className="m-0 text-lg sm:text-xl font-extrabold text-slate-900 font-serif">
              {productToEdit ? `Edit Product: ${productToEdit.name}` : 'Add New Product'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-600 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Basic Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-8">
              <label className="block font-bold text-xs text-slate-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Sai Krishna Organic Pure Cow Ghee"
                required
                className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#0033B4]"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block font-bold text-xs text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:border-[#0033B4]"
              >
                {categories && categories.length > 0 ? (
                  categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value={1}>Cow Ghee</option>
                    <option value={2}>Buffalo Ghee</option>
                    <option value={3}>Premium A2 Ghee</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-xs text-slate-700 mb-1">
              Full Product Description *
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the product purity, traditional preparation method, taste profile, and health benefits..."
              required
              className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#0033B4]"
            />
          </div>

          {/* Image Upload & Active State Section */}
          <div className="border-t border-slate-200 pt-5 space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <label className="block font-extrabold text-sm text-slate-900 m-0">
                  Product Images Management *
                </label>
                <span className="text-xs text-slate-500">
                  Upload image files directly from your computer or provide image URLs.
                </span>
              </div>

              {/* Active Toggle Switch */}
              <div className="bg-amber-50 p-2 rounded-lg border border-amber-200">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-800">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={e => setActive(e.target.checked)}
                    className="accent-[#0033B4]"
                  />
                  Active (Live on Store)
                </label>
              </div>
            </div>

            {/* Upload Action Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              
              <label className="btn btn-primary px-4 py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shrink-0">
                {uploadingImage ? <Loader size={18} className="spin" /> : <Upload size={18} />}
                {uploadingImage ? 'Uploading Image...' : 'Upload Image File'}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>

              {/* Manual URL Input */}
              <div className="flex gap-2 flex-1">
                <input
                  type="text"
                  value={customUrlInput}
                  onChange={e => setCustomUrlInput(e.target.value)}
                  placeholder="Or paste image URL (e.g. /images/cow_ghee_front.webp)"
                  className="flex-1 p-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#0033B4]"
                />
                <button
                  type="button"
                  onClick={handleAddCustomUrl}
                  className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold cursor-pointer"
                >
                  Add URL
                </button>
              </div>
            </div>

            {/* Image Preview List */}
            {imagesList.length > 0 ? (
              <div className="flex gap-3 flex-wrap bg-[#FCFAF2] p-3 rounded-xl border border-slate-200">
                {imagesList.map((imgUrl, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 bg-white group">
                    <img
                      src={imgUrl}
                      alt={`Product image ${idx + 1}`}
                      className="w-full h-full object-contain p-1"
                      onError={(e) => { e.target.src = '/images/cow_ghee_front.webp'; }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-80 hover:opacity-100 cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-red-500 italic">No images added yet. Upload or add a URL above.</div>
            )}
          </div>

          {/* Package Variants Section */}
          <div className="border-t border-slate-200 pt-5 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <label className="block font-extrabold text-sm text-slate-900 m-0">
                  Package Options & Stock Inventory *
                </label>
                <span className="text-xs text-slate-500">
                  Define weights (e.g. 500g Jar, 1L Jar), price in INR, and inventory stock level.
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddVariant}
                className="btn btn-outline px-3 py-1.5 text-xs font-bold flex items-center gap-1"
              >
                <Plus size={14} /> Add Variant Option
              </button>
            </div>

            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div key={idx} className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Package Weight/Type</label>
                    <input
                      type="text"
                      placeholder="e.g. 500g Jar"
                      value={v.weight_or_volume}
                      onChange={e => handleVariantChange(idx, 'weight_or_volume', e.target.value)}
                      required
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#0033B4]"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="350.00"
                      value={v.price}
                      onChange={e => handleVariantChange(idx, 'price', e.target.value)}
                      required
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#0033B4]"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Stock Count</label>
                    <input
                      type="number"
                      placeholder="50"
                      value={v.stock}
                      onChange={e => handleVariantChange(idx, 'stock', e.target.value)}
                      required
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#0033B4]"
                    />
                  </div>

                  <div className="sm:col-span-2 flex justify-end items-center pt-2 sm:pt-4">
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                      title="Remove variant"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="border-t border-slate-200 pt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-xs text-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary px-6 py-2.5 text-xs font-black"
            >
              {saving ? 'Saving Changes...' : productToEdit ? 'Save Product Updates' : 'Create Product'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
