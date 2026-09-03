import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, RefreshCw, Star, Heart, ArrowRight, X, ShieldCheck, Check, SlidersHorizontal, ShoppingBag } from 'lucide-react';
import { API_BASE } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

// Helper to format clean ~15-20 word descriptions ending with ....
const truncateDescription = (desc, maxWords = 18) => {
  if (!desc) return '';
  const clean = desc.trim();
  const words = clean.split(/\s+/);
  if (words.length <= maxWords) return clean;
  return words.slice(0, maxWords).join(' ') + '....';
};

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
  const selectedCategory = searchParams.get('category') || '';
  const setSelectedCategory = (cat) => {
    const newParams = new URLSearchParams(searchParams);
    if (cat) {
      newParams.set('category', cat);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };


  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [categories, setCategories] = useState([
    { name: 'Cow Ghee', slug: 'cow-ghee' },
    { name: 'Buffalo Ghee', slug: 'buffalo-ghee' },
    { name: 'Premium A2 Ghee', slug: 'premium-a2-ghee' }
  ]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedWeight, setSelectedWeight] = useState('');
  const [maxPrice, setMaxPrice] = useState(2500);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Track active variant selected per product card
  const [selectedVariantsMap, setSelectedVariantsMap] = useState({});

  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart, cartItems = [] } = useCart();

  useEffect(() => {
    const fetchCatalogData = async () => {
      setLoading(true);
      try {
        const catRes = await fetch(`${API_BASE}/products/categories`);
        if (catRes.ok) {
          const catData = await catRes.json();
          if (catData.length > 0) setCategories(catData);
        }

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

  const FilterContent = () => (
    <>
      <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-6">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
          <Filter size={18} className="text-[#0033B4]" />
          <span>Filters</span>
        </div>
        <button
          onClick={handleResetFilters}
          className="text-[#0033B4] hover:text-[#002688] text-xs font-bold flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw size={13} /> Reset
        </button>
      </div>

      {/* Category Section */}
      <div className="mb-6">
        <h4 className="text-xs font-extrabold mb-3 uppercase tracking-wider text-slate-500">
          Category
        </h4>
        <div className="space-y-2">
          <label className={`flex items-center gap-2.5 text-sm cursor-pointer ${selectedCategory === '' ? 'font-bold text-[#0033B4]' : 'text-slate-700'}`}>
            <input
              type="radio"
              name="category"
              checked={selectedCategory === ''}
              onChange={() => { setSelectedCategory(''); setSearchParams({}); setMobileFilterOpen(false); }}
              className="accent-[#0033B4]"
            />
            <span>All Categories</span>
          </label>
          {categories.map(cat => (
            <label key={cat.slug} className={`flex items-center gap-2.5 text-sm cursor-pointer ${selectedCategory === cat.slug ? 'font-bold text-[#0033B4]' : 'text-slate-700'}`}>
              <input
                type="radio"
                name="category"
                checked={selectedCategory === cat.slug}
                onChange={() => { setSelectedCategory(cat.slug); setSearchParams({ category: cat.slug }); setMobileFilterOpen(false); }}
                className="accent-[#0033B4]"
              />
              <span>{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Package Weight Section */}
      <div className="mb-6">
        <h4 className="text-xs font-extrabold mb-3 uppercase tracking-wider text-slate-500">
          Package Size
        </h4>
        <select
          value={selectedWeight}
          onChange={(e) => setSelectedWeight(e.target.value)}
          className="w-full text-sm p-2.5 rounded-lg border border-slate-200 bg-white text-slate-800"
        >
          <option value="">All Package Sizes</option>
          {WEIGHT_OPTIONS.map(weight => (
            <option key={weight} value={weight}>{weight}</option>
          ))}
        </select>
      </div>

      {/* Price Filter Slider */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Max Price
          </h4>
          <strong className="text-[#0033B4] text-sm">₹{maxPrice}</strong>
        </div>
        <input
          type="range"
          min="50"
          max="2500"
          step="50"
          value={maxPrice}
          onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
          className="w-full accent-[#0033B4] cursor-pointer"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>₹50</span>
          <span>₹2500</span>
        </div>
      </div>

      {/* Quality Commitment Callout */}
      <div className="pt-4 border-t border-slate-200 space-y-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-bold text-[#0033B4]">
          <ShieldCheck size={16} /> 100% Guarantee
        </div>
        <p>Lab tested for purity with zero chemical additives or artificial aroma.</p>
      </div>
    </>
  );

  return (
    <div className="bg-[#FAF9F5] min-h-screen pb-16">

      {/* 1. Header Banner */}
      <div className="bg-gradient-to-br from-[#0033B4] to-[#121F3E] text-white py-10 sm:py-14 shadow-md mb-8">
        <div className="container mx-auto px-4 text-center">
          <span className="text-[#F5C518] text-xs sm:text-sm font-extrabold tracking-widest uppercase block mb-2">
            Pure • Traditional • Unadulterated
          </span>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif mb-3 text-white">
            Our Ghee Collection
          </h1>

          <p className="max-w-2xl mx-auto text-slate-200 text-sm sm:text-base leading-relaxed mb-6">
            Crafted with traditional methods from 100% natural, farm-fresh milk. Experience divine aroma, granular texture, and health benefits in every spoon.
          </p>

          {/* Quick Category Filter Pills */}
          <div className="flex justify-center gap-2 flex-wrap">
            <button
              onClick={() => { setSelectedCategory(''); setSearchParams({}); }}
              className={`px-4 py-2 rounded-full font-extrabold text-xs sm:text-sm transition-all cursor-pointer border ${selectedCategory === ''
                ? 'bg-[#F5C518] text-[#0033B4] border-[#F5C518]'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`}
            >
              All Ghee ({products.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat.slug}
                onClick={() => { setSelectedCategory(cat.slug); setSearchParams({ category: cat.slug }); }}
                className={`px-4 py-2 rounded-full font-extrabold text-xs sm:text-sm transition-all cursor-pointer border ${selectedCategory === cat.slug
                  ? 'bg-[#F5C518] text-[#0033B4] border-[#F5C518]'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Store Layout */}
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="w-full bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-center gap-2 font-bold text-slate-800 shadow-sm"
          >
            <SlidersHorizontal size={18} className="text-[#0033B4]" />
            <span>Filter & Sort Products</span>
          </button>
        </div>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 lg:hidden flex justify-end" onClick={() => setMobileFilterOpen(false)}>
            <div
              className="bg-white w-4/5 max-w-xs h-full p-6 overflow-y-auto shadow-2xl flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
                  <h3 className="font-bold text-lg text-slate-900">Filter Products</h3>
                  <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-slate-500">
                    <X size={20} />
                  </button>
                </div>
                <FilterContent />
              </div>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="btn btn-primary w-full py-3 mt-6 text-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Desktop Sidebar Filter Panel */}
          <aside className="hidden lg:block lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 h-fit sticky top-24 shadow-sm">
            <FilterContent />
          </aside>

          {/* Catalog View Main Grid */}
          <main className="lg:col-span-9">
            {/* Search Input Bar & Active Filter Bar */}
            <div className="space-y-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search ghee products by name or description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm bg-white shadow-sm focus:outline-none focus:border-[#0033B4]"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div className="text-xs sm:text-sm text-slate-500 font-semibold whitespace-nowrap self-end sm:self-center">
                  Showing {products.length} {products.length === 1 ? 'Product' : 'Products'}
                </div>
              </div>

              {/* Active Filter Tags */}
              {(selectedCategory || selectedWeight || search || maxPrice < 2500) && (
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="font-bold text-slate-500">Active Filters:</span>
                  {selectedCategory && (
                    <span className="bg-amber-50 border border-amber-200 text-slate-800 px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium">
                      Cat: {selectedCategory} <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => { setSelectedCategory(''); setSearchParams({}); }} />
                    </span>
                  )}
                  {selectedWeight && (
                    <span className="bg-amber-50 border border-amber-200 text-slate-800 px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium">
                      Weight: {selectedWeight} <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => setSelectedWeight('')} />
                    </span>
                  )}
                  {search && (
                    <span className="bg-amber-50 border border-amber-200 text-slate-800 px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium">
                      "{search}" <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => setSearch('')} />
                    </span>
                  )}
                  {maxPrice < 2500 && (
                    <span className="bg-amber-50 border border-amber-200 text-slate-800 px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium">
                      Under ₹{maxPrice} <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => setMaxPrice(2500)} />
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Catalog Products Grid */}
            {loading ? (
              <div className="flex justify-center items-center min-h-[40vh]">
                <div className="font-semibold text-slate-400">Loading Ghee Products...</div>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => {
                  const variants = Array.isArray(product.variants) && product.variants.length > 0
                    ? product.variants
                    : [{ id: 99, weight_or_volume: '500g Jar', price: '350.00', stock: 50 }];

                  const activeVariant = selectedVariantsMap[product.id] || variants[0];
                  const inWish = isInWishlist(product.id);
                  const isOutOfStock = activeVariant.stock <= 0;
                  const isVariantInCart = cartItems.some(
                    item => Number(item.variant_id) === Number(activeVariant.id)
                  );

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
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      {/* Product Image Box */}
                      <div className="relative w-full h-56 bg-[#FAF9F5] overflow-hidden flex items-center justify-center border-b border-slate-100 p-4">
                        {/* Category Badge */}
                        <span className="absolute top-3 left-3 bg-[#0033B4] text-white px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide z-10">
                          {product.category_name || 'Pure Ghee'}
                        </span>

                        {/* Wishlist Button */}
                        <button
                          onClick={() => toggleWishlist(product)}
                          className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center cursor-pointer shadow-sm z-10 transition-colors ${inWish ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
                            }`}
                          title={inWish ? "Remove from Wishlist" : "Add to Wishlist"}
                        >
                          <Heart size={18} fill={inWish ? "currentColor" : "none"} />
                        </button>

                        <Link to={`/product/${product.slug}`} className="w-full h-full flex items-center justify-center p-2">
                          <img
                            src={mainImage}
                            alt={product.name}
                            className="max-w-full max-h-full object-contain transition-transform duration-500 hover:scale-105"
                            onError={(e) => { e.target.src = '/images/cow_ghee_front.webp'; }}
                          />
                        </Link>
                      </div>

                      {/* Product Content Body */}
                      <div className="p-5 flex flex-col flex-1">

                        {/* Rating Stars Summary */}
                        <div className="flex items-center gap-1 mb-2">
                          <div className="flex text-amber-400">
                            <Star size={14} fill="currentColor" stroke="currentColor" />
                          </div>
                          <span className="text-xs font-bold text-slate-800">{avgRating}</span>
                          <span className="text-xs text-slate-400">
                            ({reviews.length > 0 ? reviews.length : '5'})
                          </span>
                        </div>

                        {/* Title */}
                        <Link to={`/product/${product.slug}`}>
                          <h3 className="text-base font-extrabold text-slate-900 mb-1 line-clamp-1 font-serif hover:text-[#0033B4] transition-colors">
                            {product.name}
                          </h3>
                        </Link>

                        {/* Description */}
                        <p className="text-xs text-slate-500 leading-relaxed mb-4 min-h-[2.8rem] line-clamp-2">
                          {truncateDescription(product.description, 18)}
                        </p>

                        {/* Interactive Weight/Variant Selector Pills */}
                        <div className="mb-4">
                          <span className="text-[10px] font-extrabold text-slate-400 block mb-1.5 uppercase">
                            Package Options:
                          </span>
                          <div className="flex gap-1.5 flex-wrap">
                            {variants.map(v => {
                              const isSelected = activeVariant.id === v.id;
                              return (
                                <button
                                  key={v.id}
                                  onClick={() => handleSelectVariantForProduct(product.id, v)}
                                  className={`text-xs font-bold px-2 py-1 rounded-md cursor-pointer transition-all ${isSelected
                                    ? 'bg-[#0033B4]/10 text-[#0033B4] border border-[#0033B4]'
                                    : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                  {v.weight_or_volume}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Footer Price & Add/View Button */}
                        <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Price</span>
                            <span className="text-lg font-black text-[#0033B4]">
                              ₹{parseFloat(activeVariant.price).toFixed(2)}
                            </span>
                          </div>

                          <div className="flex gap-1.5">
                            {isVariantInCart ? (
                              <Link
                                to="/cart"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-colors shadow-sm"
                              >
                                <ShoppingBag size={13} /> Go to Cart
                              </Link>
                            ) : (
                              <button
                                onClick={() => addToCart(product, activeVariant, 1)}
                                disabled={isOutOfStock}
                                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-colors cursor-pointer ${isOutOfStock
                                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                  : 'bg-[#F5C518] hover:bg-[#D8AA0D] text-[#0033B4]'
                                  }`}
                              >
                                {isOutOfStock ? 'Sold Out' : '+ Cart'}
                              </button>
                            )}

                            <Link
                              to={`/product/${product.slug}`}
                              className="bg-[#0033B4] hover:bg-[#002688] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
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
              /* No Results View */
              <div className="text-center py-12 px-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <Search size={48} className="mx-auto text-slate-300 mb-3" />
                <h3 className="text-lg font-bold text-slate-900 mb-1">No Matching Ghee Products</h3>
                <p className="text-sm text-slate-500 mb-6">
                  We couldn't find any products matching your current search filters.
                </p>
                <button onClick={handleResetFilters} className="btn btn-primary px-6 py-2.5 text-sm">
                  Reset All Filters
                </button>
              </div>
            )}
          </main>

        </div>
      </div>

    </div>
  );
}
