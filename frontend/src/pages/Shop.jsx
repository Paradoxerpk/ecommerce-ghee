import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, RefreshCw, Star, Heart, ArrowRight, X, ShieldCheck, Check } from 'lucide-react';
import { API_BASE } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

// Standard fallback if backend server is unavailable
const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: 'Sai Krishna Pure Cow Ghee',
    slug: 'sai-krishna-pure-cow-ghee',
    category_slug: 'cow-ghee',
    category_name: 'Cow Ghee',
    description: 'Made from fresh cow milk, ensuring a rich golden texture, divine aroma, and traditional homemade taste.',
    images: ['/images/cow_ghee_front.webp'],
    active: true,
    variants: [
      { id: 1, weight_or_volume: '100g Pouch', price: '75.00', stock: 500, sku: 'SKG-COW-100P' },
      { id: 2, weight_or_volume: '250g Jar', price: '185.00', stock: 200, sku: 'SKG-COW-250J' },
      { id: 3, weight_or_volume: '500g Jar', price: '360.00', stock: 150, sku: 'SKG-COW-500J' },
      { id: 4, weight_or_volume: '1L Jar', price: '700.00', stock: 100, sku: 'SKG-COW-1000J' }
    ],
    reviews: [
      { rating: 5 }, { rating: 5 }, { rating: 4 }
    ]
  },
  {
    id: 2,
    name: 'Sai Krishna Premium Buffalo Ghee',
    slug: 'sai-krishna-premium-buffalo-ghee',
    category_slug: 'buffalo-ghee',
    category_name: 'Buffalo Ghee',
    description: 'Crafted from high-quality buffalo milk featuring a distinctive granular white texture and rich flavor.',
    images: ['/images/buffalo_ghee_front.webp'],
    active: true,
    variants: [
      { id: 5, weight_or_volume: '500g Jar', price: '380.00', stock: 100, sku: 'SKG-BUF-500J' },
      { id: 6, weight_or_volume: '1L Jar', price: '740.00', stock: 75, sku: 'SKG-BUF-1000J' }
    ],
    reviews: [
      { rating: 5 }, { rating: 5 }
    ]
  },
  {
    id: 3,
    name: 'Sai Krishna Vedic A2 Cow Ghee (Bilona Method)',
    category_slug: 'premium-a2-ghee',
    category_name: 'Premium A2 Ghee',
    slug: 'sai-krishna-vedic-a2-cow-ghee',
    description: 'Prepared using the ancient Bilona method — curdling milk, churning butter, and slow boiling.',
    images: ['/images/a2_ghee_front.webp'],
    active: true,
    variants: [
      { id: 7, weight_or_volume: '250g Glass Jar', price: '450.00', stock: 50, sku: 'SKG-A2-250G' },
      { id: 8, weight_or_volume: '500g Glass Jar', price: '850.00', stock: 40, sku: 'SKG-A2-500G' },
      { id: 9, weight_or_volume: '1L Glass Jar', price: '1600.00', stock: 20, sku: 'SKG-A2-1000G' }
    ],
    reviews: [
      { rating: 5 }, { rating: 5 }, { rating: 5 }
    ]
  }
];

const WEIGHT_OPTIONS = ['100g Pouch', '250g Jar', '500g Jar', '1L Jar', '250g Glass Jar', '500g Glass Jar', '1L Glass Jar'];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [categories, setCategories] = useState([
    { name: 'Cow Ghee', slug: 'cow-ghee' },
    { name: 'Buffalo Ghee', slug: 'buffalo-ghee' },
    { name: 'Premium A2 Ghee', slug: 'premium-a2-ghee' }
  ]);
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedWeight, setSelectedWeight] = useState('');
  const [maxPrice, setMaxPrice] = useState(2500);

  // Track active variant selected per product card
  const [selectedVariantsMap, setSelectedVariantsMap] = useState({});

  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    const fetchCatalogData = async () => {
      setLoading(true);
      try {
        // Fetch active categories
        const catRes = await fetch(`${API_BASE}/products/categories`);
        if (catRes.ok) {
          const catData = await catRes.json();
          if (catData.length > 0) setCategories(catData);
        }

        // Build query string
        const params = new URLSearchParams();
        if (selectedCategory) params.append('category', selectedCategory);
        if (search) params.append('search', search);
        if (selectedWeight) params.append('weight', selectedWeight);
        if (maxPrice) params.append('max_price', maxPrice);

        const prodRes = await fetch(`${API_BASE}/products?${params.toString()}`);
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(prodData);
        } else {
          filterFallbackLocally();
        }
      } catch (err) {
        console.warn('Backend server offline, using fallback catalog.');
        filterFallbackLocally();
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogData();
  }, [selectedCategory, search, selectedWeight, maxPrice]);

  const filterFallbackLocally = () => {
    let filtered = [...FALLBACK_PRODUCTS];

    if (selectedCategory) {
      filtered = filtered.filter(p => p.category_slug === selectedCategory);
    }
    if (search) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (selectedWeight) {
      filtered = filtered.filter(p => 
        p.variants && p.variants.some(v => v.weight_or_volume === selectedWeight)
      );
    }
    if (maxPrice) {
      filtered = filtered.filter(p => 
        p.variants && p.variants.some(v => parseFloat(v.price) <= maxPrice)
      );
    }

    setProducts(filtered);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedWeight('');
    setMaxPrice(2500);
    setSearchParams({});
  };

  const handleSelectVariantForProduct = (productId, variant) => {
    setSelectedVariantsMap(prev => ({
      ...prev,
      [productId]: variant
    }));
  };

  return (
    <div style={{ backgroundColor: '#FAF9F5', minHeight: '90vh', paddingBottom: '5rem' }}>
      
      {/* 1. Header Banner */}
      <div style={{
        backgroundColor: 'var(--primary-color)',
        color: '#fff',
        padding: '3.5rem 0 3rem 0',
        backgroundImage: 'linear-gradient(135deg, rgba(0, 51, 180, 0.95) 0%, rgba(18, 31, 62, 0.98) 100%)',
        boxShadow: 'var(--shadow-md)',
        marginBottom: '3rem'
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span style={{
            color: 'var(--secondary-color)',
            fontSize: '0.85rem',
            fontWeight: 800,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '0.5rem'
          }}>
            Pure • Traditional • Unadulterated
          </span>

          <h1 style={{
            fontSize: '2.75rem',
            fontFamily: 'var(--font-headings)',
            fontWeight: 800,
            margin: '0 0 1rem 0',
            color: '#ffffff'
          }}>
            Our Ghee Collection
          </h1>

          <p style={{
            maxWidth: '650px',
            margin: '0 auto 2rem auto',
            color: 'rgba(255, 255, 255, 0.85)',
            fontSize: '1.05rem',
            lineHeight: 1.6
          }}>
            Crafted with traditional methods from 100% natural, farm-fresh milk. Experience divine aroma, granular texture, and health benefits in every spoon.
          </p>

          {/* Quick Category Filter Pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setSelectedCategory(''); setSearchParams({}); }}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '30px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backgroundColor: selectedCategory === '' ? 'var(--secondary-color)' : 'rgba(255, 255, 255, 0.1)',
                color: selectedCategory === '' ? 'var(--primary-color)' : '#fff',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.25s'
              }}
            >
              All Ghee ({products.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat.slug}
                onClick={() => { setSelectedCategory(cat.slug); setSearchParams({ category: cat.slug }); }}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '30px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backgroundColor: selectedCategory === cat.slug ? 'var(--secondary-color)' : 'rgba(255, 255, 255, 0.1)',
                  color: selectedCategory === cat.slug ? 'var(--primary-color)' : '#fff',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Store Layout */}
      <div className="container" style={{ maxWidth: '1500px', width: '96%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem' }} className="shop-layout">
          
          {/* Sidebar Filter Panel */}
          <aside style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            padding: '1.75rem',
            height: 'fit-content',
            boxShadow: 'var(--shadow-sm)',
            position: 'sticky',
            top: '100px'
          }} className="filters-sidebar">
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1rem', color: 'var(--primary-color)' }}>
                <Filter size={18} />
                <span>Filters</span>
              </div>
              <button 
                onClick={handleResetFilters} 
                style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <RefreshCw size={13} /> Reset
              </button>
            </div>

            {/* Category Section */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-light)' }}>
                Category
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', cursor: 'pointer', fontWeight: selectedCategory === '' ? 700 : 500 }}>
                  <input 
                    type="radio" 
                    name="category" 
                    checked={selectedCategory === ''} 
                    onChange={() => { setSelectedCategory(''); setSearchParams({}); }} 
                    style={{ accentColor: 'var(--primary-color)' }}
                  />
                  <span>All Categories</span>
                </label>
                {categories.map(cat => (
                  <label key={cat.slug} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', cursor: 'pointer', fontWeight: selectedCategory === cat.slug ? 700 : 500 }}>
                    <input 
                      type="radio" 
                      name="category" 
                      checked={selectedCategory === cat.slug} 
                      onChange={() => { setSelectedCategory(cat.slug); setSearchParams({ category: cat.slug }); }} 
                      style={{ accentColor: 'var(--primary-color)' }}
                    />
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Package Weight Section */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-light)' }}>
                Package Size
              </h4>
              <select 
                value={selectedWeight} 
                onChange={(e) => setSelectedWeight(e.target.value)}
                style={{
                  width: '100%',
                  fontSize: '0.875rem',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#fff',
                  cursor: 'pointer'
                }}
              >
                <option value="">All Package Sizes</option>
                {WEIGHT_OPTIONS.map(weight => (
                  <option key={weight} value={weight}>{weight}</option>
                ))}
              </select>
            </div>

            {/* Price Filter Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-light)' }}>
                  Max Price
                </h4>
                <strong style={{ color: 'var(--primary-color)', fontSize: '0.95rem' }}>₹{maxPrice}</strong>
              </div>
              <input 
                type="range" 
                min="50" 
                max="2500" 
                step="50" 
                value={maxPrice} 
                onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary-color)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.35rem' }}>
                <span>₹50</span>
                <span>₹2500</span>
              </div>
            </div>

            {/* Quality Commitment Callout */}
            <div style={{
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              fontSize: '0.8rem',
              color: 'var(--text-light)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                <ShieldCheck size={16} /> 100% Guarantee
              </div>
              <span>Lab tested for purity with zero chemical additives or artificial aroma.</span>
            </div>

          </aside>

          {/* Catalog View Main Grid */}
          <main>
            {/* Search Input Bar & Active Filter Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }} className="search-bar-row">
                <div style={{ position: 'relative', flexGrow: 1 }}>
                  <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                  <input 
                    type="text" 
                    placeholder="Search ghee products by name or description..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.75rem',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.95rem',
                      backgroundColor: '#fff',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  />
                  {search && (
                    <button 
                      onClick={() => setSearch('')} 
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: 600, whitespace: 'nowrap' }}>
                  Showing {products.length} {products.length === 1 ? 'Product' : 'Products'}
                </div>
              </div>

              {/* Active Filter Tags */}
              {(selectedCategory || selectedWeight || search || maxPrice < 2500) && (
                <div style={{ display: 'flex', items: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-light)' }}>Active Filters:</span>
                  {selectedCategory && (
                    <span style={{ backgroundColor: 'var(--bg-cream)', border: '1px solid var(--border-color)', padding: '0.2rem 0.6rem', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                      Cat: {selectedCategory} <X size={12} style={{ cursor: 'pointer' }} onClick={() => { setSelectedCategory(''); setSearchParams({}); }} />
                    </span>
                  )}
                  {selectedWeight && (
                    <span style={{ backgroundColor: 'var(--bg-cream)', border: '1px solid var(--border-color)', padding: '0.2rem 0.6rem', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                      Weight: {selectedWeight} <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSelectedWeight('')} />
                    </span>
                  )}
                  {search && (
                    <span style={{ backgroundColor: 'var(--bg-cream)', border: '1px solid var(--border-color)', padding: '0.2rem 0.6rem', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                      "{search}" <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSearch('')} />
                    </span>
                  )}
                  {maxPrice < 2500 && (
                    <span style={{ backgroundColor: 'var(--bg-cream)', border: '1px solid var(--border-color)', padding: '0.2rem 0.6rem', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                      Under ₹{maxPrice} <X size={12} style={{ cursor: 'pointer' }} onClick={() => setMaxPrice(2500)} />
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Catalog Products Grid */}
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-light)' }}>Loading Ghee Products...</div>
              </div>
            ) : products.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }} className="products-3-grid">
                {products.map(product => {
                  const variants = Array.isArray(product.variants) && product.variants.length > 0
                    ? product.variants
                    : [{ id: 99, weight_or_volume: '500g Jar', price: '350.00', stock: 50 }];

                  const activeVariant = selectedVariantsMap[product.id] || variants[0];
                  const inWish = isInWishlist(product.id);
                  const isOutOfStock = activeVariant.stock <= 0;

                  // Ratings summary
                  const reviews = product.reviews || [];
                  const avgRating = reviews.length > 0
                    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                    : '5.0';

                  const mainImage = Array.isArray(product.images) && product.images.length > 0
                    ? product.images[0]
                    : '/images/cow_ghee_front.webp';

                  return (
                    <div
                      key={product.id}
                      style={{
                        backgroundColor: '#fff',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.25s ease, box-shadow 0.25s ease'
                      }}
                      className="shop-product-card"
                    >
                      {/* Product Image Box */}
                      <div style={{
                        position: 'relative',
                        width: '100%',
                        height: '240px',
                        backgroundColor: 'var(--bg-cream)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderBottom: '1px solid var(--border-color)'
                      }}>
                        {/* Category Badge */}
                        <span style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          backgroundColor: 'var(--primary-color)',
                          color: '#fff',
                          padding: '0.2rem 0.65rem',
                          borderRadius: '20px',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          zIndex: 2
                        }}>
                          {product.category_name || 'Pure Ghee'}
                        </span>

                        {/* Wishlist Button */}
                        <button
                          onClick={() => toggleWishlist(product)}
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            backgroundColor: '#fff',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: inWish ? '#ef4444' : 'var(--text-light)',
                            boxShadow: 'var(--shadow-sm)',
                            zIndex: 2,
                            transition: 'all 0.2s'
                          }}
                          title={inWish ? "Remove from Wishlist" : "Add to Wishlist"}
                        >
                          <Heart size={18} fill={inWish ? "currentColor" : "none"} />
                        </button>

                        {/* High-quality Real Product Image */}
                        <Link to={`/product/${product.slug}`} style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
                          <img
                            src={mainImage}
                            alt={product.name}
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain',
                              transition: 'transform 0.3s ease'
                            }}
                            className="card-image-hover"
                            onError={(e) => { e.target.src = '/images/cow_ghee_front.webp'; }}
                          />
                        </Link>
                      </div>

                      {/* Product Content Body */}
                      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        
                        {/* Rating Stars Summary */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
                          <div style={{ display: 'flex', color: '#f59e0b' }}>
                            <Star size={14} fill="#f59e0b" stroke="#f59e0b" />
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{avgRating}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                            ({reviews.length > 0 ? reviews.length : '5'} reviews)
                          </span>
                        </div>

                        {/* Title */}
                        <Link to={`/product/${product.slug}`}>
                          <h3 style={{
                            margin: '0 0 0.5rem 0',
                            fontSize: '1.1rem',
                            fontWeight: 800,
                            fontFamily: 'var(--font-body)',
                            color: 'var(--text-dark)',
                            lineHeight: '1.3'
                          }}>
                            {product.name}
                          </h3>
                        </Link>

                        {/* Description */}
                        <p style={{
                          fontSize: '0.825rem',
                          color: 'var(--text-light)',
                          lineHeight: '1.4',
                          margin: '0 0 1rem 0',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          height: '2.3em'
                        }}>
                          {product.description}
                        </p>

                        {/* Interactive Weight/Variant Selector Pills */}
                        <div style={{ marginBottom: '1.25rem' }}>
                          <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-light)', display: 'block', marginBottom: '0.35rem' }}>
                            PACKAGE OPTIONS:
                          </span>
                          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                            {variants.map(v => {
                              const isSelected = activeVariant.id === v.id;
                              return (
                                <button
                                  key={v.id}
                                  onClick={() => handleSelectVariantForProduct(product.id, v)}
                                  style={{
                                    fontSize: '0.725rem',
                                    fontWeight: 700,
                                    padding: '0.2rem 0.55rem',
                                    borderRadius: '6px',
                                    border: isSelected ? '1.5px solid var(--primary-color)' : '1px solid var(--border-color)',
                                    backgroundColor: isSelected ? 'rgba(0, 51, 180, 0.08)' : '#fff',
                                    color: isSelected ? 'var(--primary-color)' : 'var(--text-dark)',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s'
                                  }}
                                >
                                  {v.weight_or_volume}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Footer Price & Add/View Button */}
                        <div style={{
                          marginTop: 'auto',
                          paddingTop: '1rem',
                          borderTop: '1px solid var(--border-color)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <span style={{ fontSize: '0.725rem', color: 'var(--text-light)', display: 'block' }}>Price</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-color)', fontFamily: 'var(--font-body)' }}>
                              ₹{parseFloat(activeVariant.price).toFixed(2)}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => addToCart(product, activeVariant, 1)}
                              disabled={isOutOfStock}
                              style={{
                                backgroundColor: 'var(--secondary-color)',
                                color: 'var(--primary-color)',
                                border: 'none',
                                padding: '0.5rem 0.85rem',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                            >
                              {isOutOfStock ? 'Sold Out' : '+ Cart'}
                            </button>

                            <Link
                              to={`/product/${product.slug}`}
                              style={{
                                backgroundColor: 'var(--primary-color)',
                                color: '#fff',
                                padding: '0.5rem 0.85rem',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                            >
                              View <ArrowRight size={14} />
                            </Link>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* No Results Graceful View */
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                backgroundColor: '#fff',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <Search size={48} style={{ color: 'var(--text-light)', marginBottom: '1rem', opacity: 0.4 }} />
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>No Matching Ghee Products</h3>
                <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  We couldn't find any products matching your current search filters.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button onClick={handleResetFilters} className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.875rem' }}>
                    Reset All Filters
                  </button>
                </div>
              </div>
            )}
          </main>

        </div>
      </div>

    </div>
  );
}
