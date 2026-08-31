import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, RefreshCw, Star, X } from 'lucide-react';
import { API_BASE } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

// Falling back to local data if server is off
const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: 'Sai Krishna Pure Cow Ghee',
    slug: 'sai-krishna-pure-cow-ghee',
    category_slug: 'cow-ghee',
    category_name: 'Cow Ghee',
    description: 'Sai Krishna Pure Cow Ghee is made from fresh cow milk, ensuring a rich golden texture, divine aroma, and traditional homemade taste.',
    images: ['/images/cow_ghee_front.webp'],
    variants: [
      { id: 1, weight_or_volume: '100g Pouch', price: '75.00', stock: 500 },
      { id: 2, weight_or_volume: '250g Jar', price: '185.00', stock: 200 },
      { id: 3, weight_or_volume: '500g Jar', price: '360.00', stock: 150 },
      { id: 4, weight_or_volume: '1L Jar', price: '700.00', stock: 100 }
    ]
  },
  {
    id: 2,
    name: 'Sai Krishna Premium Buffalo Ghee',
    slug: 'sai-krishna-premium-buffalo-ghee',
    category_slug: 'buffalo-ghee',
    category_name: 'Buffalo Ghee',
    description: 'Crafted from high-quality buffalo milk, Sai Krishna Buffalo Ghee features a distinctive granular white texture, rich flavor, and high smoke point.',
    images: ['/images/buffalo_ghee_front.webp'],
    variants: [
      { id: 5, weight_or_volume: '500g Jar', price: '380.00', stock: 100 },
      { id: 6, weight_or_volume: '1L Jar', price: '740.00', stock: 75 }
    ]
  },
  {
    id: 3,
    name: 'Sai Krishna Vedic A2 Cow Ghee (Bilona Method)',
    category_slug: 'premium-a2-ghee',
    category_name: 'Premium A2 Ghee',
    slug: 'sai-krishna-vedic-a2-cow-ghee',
    description: 'Our super premium Vedic A2 Ghee is prepared using the ancient Bilona method — curdling milk, churning the curd to butter, and slowly boiling it.',
    images: ['/images/a2_ghee_front.webp'],
    variants: [
      { id: 7, weight_or_volume: '250g Glass Jar', price: '450.00', stock: 50 },
      { id: 8, weight_or_volume: '500g Glass Jar', price: '850.00', stock: 40 },
      { id: 9, weight_or_volume: '1L Glass Jar', price: '1600.00', stock: 20 }
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
  const [maxPrice, setMaxPrice] = useState(2000);
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Keep state sync with url category
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    const fetchCatalogData = async () => {
      setLoading(true);
      try {
        // Fetch Categories
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
          // If error status, filter fallback locally for demonstration safety
          filterFallbackLocally();
        }
      } catch (err) {
        console.warn('Backend server offline, using client-side filtering for demo.');
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
        p.variants.some(v => v.weight_or_volume === selectedWeight)
      );
    }
    if (maxPrice) {
      filtered = filtered.filter(p => 
        p.variants.some(v => parseFloat(v.price) <= maxPrice)
      );
    }

    setProducts(filtered);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedWeight('');
    setMaxPrice(2000);
    setSearchParams({});
  };

  return (
    <div className="section" style={{ minHeight: '80vh', padding: '3rem 0' }}>
      <div className="container">
        <h1 className="section-title">Explore Ghee Catalog</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2.5rem', marginTop: '2rem' }} className="shop-layout">
          
          {/* 1. Sidebar Filters */}
          <aside style={{
            backgroundColor: 'var(--bg-white)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            padding: '1.75rem',
            height: 'fit-content',
            boxShadow: 'var(--shadow-sm)'
          }} className="filters-sidebar">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                <Filter size={18} />
                <span>Filters</span>
              </div>
              <button 
                onClick={handleResetFilters} 
                style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
              >
                <RefreshCw size={12} /> Reset
              </button>
            </div>

            {/* Category Filter */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Categories</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="category" 
                    checked={selectedCategory === ''} 
                    onChange={() => { setSelectedCategory(''); setSearchParams({}); }} 
                  />
                  <span>All Categories</span>
                </label>
                {categories.map(cat => (
                  <label key={cat.slug} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="category" 
                      checked={selectedCategory === cat.slug} 
                      onChange={() => { setSelectedCategory(cat.slug); setSearchParams({ category: cat.slug }); }} 
                    />
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Weight/Volume Filter */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pack Weight</h4>
              <select 
                className="form-control" 
                value={selectedWeight} 
                onChange={(e) => setSelectedWeight(e.target.value)}
                style={{ fontSize: '0.85rem', padding: '0.5rem' }}
              >
                <option value="">All Weights</option>
                {WEIGHT_OPTIONS.map(weight => (
                  <option key={weight} value={weight}>{weight}</option>
                ))}
              </select>
            </div>

            {/* Price Filter Slider */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Max Price: ₹{maxPrice}</h4>
              <input 
                type="range" 
                min="50" 
                max="2000" 
                step="50" 
                value={maxPrice} 
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                <span>₹50</span>
                <span>₹2000</span>
              </div>
            </div>
          </aside>

          {/* 2. Main Catalog Grid */}
          <main>
            {/* Search and results bar */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }} className="search-bar-row">
              <div style={{ position: 'relative', flexGrow: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search by name or description..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                {search && (
                  <button 
                    onClick={() => setSearch('')} 
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <div style={{ alignSelf: 'center', fontSize: '0.9rem', color: 'var(--text-light)', minWidth: '100px', textAlign: 'right' }}>
                {products.length} Products
              </div>
            </div>

            {/* Catalog Grid */}
            {products.length > 0 ? (
              <div className="grid-3" style={{ gap: '1.5rem' }}>
                {products.map(product => {
                  const baseVariant = product.variants[0] || { price: '0.00', weight_or_volume: '' };
                  const inWish = isInWishlist(product.id);

                  return (
                    <div key={product.id} className="card">
                      <div className="product-card-image-container">
                        <span className="product-badge">{product.category_name}</span>
                        <button
                          className={`wishlist-toggle ${inWish ? 'active' : ''}`}
                          onClick={() => toggleWishlist(product)}
                          title={inWish ? "Remove from Wishlist" : "Add to Wishlist"}
                        >
                          <Star size={18} fill={inWish ? "currentColor" : "none"} />
                        </button>
                        
                        {/* Mock packet visualization */}
                        <div style={{
                          width: '100px',
                          height: '130px',
                          backgroundColor: 'var(--primary-color)',
                          color: '#fff',
                          borderRadius: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          padding: '0.5rem',
                          boxShadow: 'var(--shadow-sm)'
                        }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--secondary-color)' }}>Sai Krishna</span>
                          <span style={{ fontSize: '0.6rem' }}>Ghee</span>
                          <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'var(--secondary-color)', margin: '0.25rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '0.8rem' }}>
                            ★
                          </div>
                          <span style={{ fontSize: '0.55rem' }}>{baseVariant.weight_or_volume || 'Pure'}</span>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <span className="product-card-category">{product.category_name}</span>
                        <h3 className="product-card-title">{product.name}</h3>
                        <p className="product-card-desc">{product.description}</p>
                        
                        {/* List available pack weights */}
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', margin: '0.5rem 0 1rem 0' }}>
                          {product.variants.map(v => (
                            <span key={v.id} style={{ fontSize: '0.7rem', backgroundColor: 'var(--bg-cream)', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', color: 'var(--text-light)' }}>
                              {v.weight_or_volume}
                            </span>
                          ))}
                        </div>

                        <div className="product-card-footer">
                          <div className="product-card-price-container">
                            <span className="product-card-price-label">Starting at</span>
                            <span className="product-card-price">₹{parseFloat(baseVariant.price).toFixed(2)}</span>
                          </div>
                          <Link to={`/product/${product.slug}`} className="btn btn-outline" style={{ padding: '0.4rem 1.1rem', fontSize: '0.8rem' }}>
                            Buy Now
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* No Results Graceful UI (FR-3.3) */
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                backgroundColor: 'var(--bg-white)',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <Search size={48} style={{ color: 'var(--text-light)', marginBottom: '1rem', opacity: 0.5 }} />
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Products Found</h3>
                <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>We couldn't find any products matching your selected search filters.</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button onClick={handleResetFilters} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.85rem' }}>
                    Reset Filters
                  </button>
                  <button onClick={() => { setSelectedCategory(''); setSearch(''); setSelectedWeight(''); setMaxPrice(2000); }} className="btn btn-outline" style={{ padding: '0.5rem 1.5rem', fontSize: '0.85rem' }}>
                    Browse All Ghee
                  </button>
                </div>

                {/* Suggestions layout */}
                <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border-color)', paddingTop: '2.5rem' }}>
                  <h4 style={{ fontSize: '1.1rem', color: 'var(--primary-color)', marginBottom: '1rem' }}>Browse Our Categories</h4>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {categories.map(cat => (
                      <button 
                        key={cat.slug} 
                        onClick={() => setSelectedCategory(cat.slug)}
                        style={{ border: '1px solid var(--primary-color)', background: 'none', color: 'var(--primary-color)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}
