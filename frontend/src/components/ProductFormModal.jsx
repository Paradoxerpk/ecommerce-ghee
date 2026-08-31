import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Package, Check, AlertCircle, Upload, Image as ImageIcon, Loader } from 'lucide-react';
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
      // Reset form for fresh product creation
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

  // File Upload Handler
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
      // Reset file input value
      e.target.value = '';
    }
  };

  const handleAddCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    setImagesList(prev => [...prev, customUrlInput.trim()]);
    setCustomUrlInput('');
  };

  const handleRemoveImage = (index) => {
    setImagesList(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddVariant = () => {
    setVariants(prev => [
      ...prev,
      { weight_or_volume: '1L Jar', price: '700.00', stock: '25', sku: '', active: true }
    ]);
  };

  const handleRemoveVariant = (index) => {
    if (variants.length <= 1) {
      alert('A product must have at least one variant size/price option.');
      return;
    }
    setVariants(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleVariantChange = (index, field, value) => {
    setVariants(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Product name is required.');
      return;
    }
    if (!description.trim()) {
      setError('Product description is required.');
      return;
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
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1.5rem'
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '850px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.5rem 2rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-cream)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Package size={22} style={{ color: 'var(--primary-color)' }} />
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>
              {productToEdit ? `Edit Product: ${productToEdit.name}` : 'Add New Product'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-light)',
              padding: '0.25rem',
              borderRadius: '50%'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {error && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #ef4444',
                color: '#ef4444',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Basic Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                Product Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Sai Krishna Organic Pure Cow Ghee"
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                Category *
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.95rem',
                  backgroundColor: '#fff'
                }}
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
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              Full Product Description *
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the product purity, traditional preparation method, taste profile, and health benefits..."
              required
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                lineHeight: '1.5'
              }}
            />
          </div>

          {/* Image Upload & Active State Section */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.95rem', margin: 0 }}>
                  Product Images Management *
                </label>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>
                  Upload image files directly from your computer or provide image URLs.
                </span>
              </div>

              {/* Active Toggle Switch */}
              <div style={{ backgroundColor: 'var(--bg-cream)', padding: '0.4rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={e => setActive(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--primary-color)' }}
                  />
                  Active (Live on Store)
                </label>
              </div>
            </div>

            {/* Upload Action Bar */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
              
              {/* File Upload Button */}
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'var(--primary-color)',
                  color: '#fff',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: uploadingImage ? 'wait' : 'pointer',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {uploadingImage ? <Loader size={18} className="spin" /> : <Upload size={18} />}
                {uploadingImage ? 'Uploading Image...' : 'Upload Image File'}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  disabled={uploadingImage}
                  style={{ display: 'none' }}
                />
              </label>

              {/* Manual URL Input */}
              <div style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '260px' }}>
                <input
                  type="text"
                  value={customUrlInput}
                  onChange={e => setCustomUrlInput(e.target.value)}
                  placeholder="Or paste image URL (e.g. /images/cow_ghee_front.webp)"
                  style={{
                    flex: 1,
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem'
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomUrl}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: '#fff',
                    fontWeight: 700,
                    fontSize: '0.825rem',
                    cursor: 'pointer'
                  }}
                >
                  Add URL
                </button>
              </div>
            </div>

            {/* Image Preview List */}
            {imagesList.length > 0 ? (
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', backgroundColor: 'var(--bg-cream)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                {imagesList.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'relative',
                      width: '90px',
                      height: '90px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '2px solid var(--border-color)',
                      backgroundColor: '#fff'
                    }}
                  >
                    <img
                      src={imgUrl}
                      alt={`Product image ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = '/images/cow_ghee_front.webp'; }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      title="Remove image"
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        backgroundColor: 'rgba(239, 68, 68, 0.9)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '22px',
                        height: '22px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      <X size={14} />
                    </button>
                    {idx === 0 && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          color: '#fff',
                          fontSize: '0.65rem',
                          textAlign: 'center',
                          padding: '0.1rem 0',
                          fontWeight: 700
                        }}
                      >
                        Main
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#ef4444', fontStyle: 'italic' }}>
                No images added yet. Please upload an image file or add an image path.
              </div>
            )}
          </div>

          {/* Dynamic Variant Matrix Section */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Pricing & Stock Variants</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                  Define size options (e.g. 250g, 500g, 1L Jar) with specific prices and stock levels.
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddVariant}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: 'var(--primary-color)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Plus size={16} /> Add Variant Size
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {variants.map((v, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.5fr 1.5fr 2fr 0.5fr',
                    gap: '0.75rem',
                    alignItems: 'center',
                    backgroundColor: 'var(--bg-cream)',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-light)' }}>Weight / Volume</label>
                    <input
                      type="text"
                      value={v.weight_or_volume}
                      onChange={e => handleVariantChange(idx, 'weight_or_volume', e.target.value)}
                      placeholder="e.g. 500g Jar"
                      required
                      style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-light)' }}>Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={v.price}
                      onChange={e => handleVariantChange(idx, 'price', e.target.value)}
                      placeholder="350.00"
                      required
                      style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-light)' }}>Stock Quantity</label>
                    <input
                      type="number"
                      value={v.stock}
                      onChange={e => handleVariantChange(idx, 'stock', e.target.value)}
                      placeholder="50"
                      required
                      style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-light)' }}>SKU Code (Optional)</label>
                    <input
                      type="text"
                      value={v.sku}
                      onChange={e => handleVariantChange(idx, 'sku', e.target.value)}
                      placeholder="Auto-generated if empty"
                      style={{ width: '100%', padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '1rem' }}>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      title="Remove Variant"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '0.2rem'
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div
            style={{
              display: 'flex',
              justify: 'flex-end',
              gap: '1rem',
              marginTop: '1rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-color)'
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.65rem 1.5rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: '#fff',
                color: 'var(--text-dark)',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || uploadingImage}
              style={{
                padding: '0.65rem 2rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--secondary-color)',
                color: 'var(--primary-color)',
                fontWeight: 800,
                cursor: (saving || uploadingImage) ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {saving ? (
                'Saving Changes...'
              ) : (
                <>
                  <Check size={18} /> {productToEdit ? 'Update Product' : 'Create & Publish Product'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
