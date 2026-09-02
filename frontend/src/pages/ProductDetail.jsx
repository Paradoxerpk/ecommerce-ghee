import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, Heart, Shield, Check, AlertTriangle, ArrowLeft, Send, CheckCircle, ChevronRight, ArrowRight } from 'lucide-react';
import { API_BASE, useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

// Helper to format clean ~15-20 word descriptions ending with ....
const truncateDescription = (desc, maxWords = 18) => {
  if (!desc) return '';
  const clean = desc.trim();
  const words = clean.split(/\s+/);
  if (words.length <= maxWords) return clean;
  return words.slice(0, maxWords).join(' ') + '....';
};

// Local Fallback list
const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: 'Sai Krishna Pure Cow Ghee',
    slug: 'sai-krishna-pure-cow-ghee',
    category_name: 'Cow Ghee',
    description: 'Sai Krishna Pure Cow Ghee is made from fresh cow milk, ensuring a rich golden texture, divine aroma, and traditional homemade taste.',
    images: ['/uploads/product-1788196192064-385206.jpeg'],
    variants: [
      { id: 1, weight_or_volume: '100g Pouch', price: '75.00', stock: 500, sku: 'SKG-COW-100P' },
      { id: 2, weight_or_volume: '250g Jar', price: '185.00', stock: 200, sku: 'SKG-COW-250J' },
      { id: 3, weight_or_volume: '500g Jar', price: '360.00', stock: 150, sku: 'SKG-COW-500J' },
      { id: 4, weight_or_volume: '1L Jar', price: '700.00', stock: 100, sku: 'SKG-COW-1000J' }
    ],
    reviews: [
      { id: 1, user_name: 'Rajesh Kumar', rating: 5, comment: 'Authentic divine aroma! The granular texture is top notch and reminds me of homemade ghee.', created_at: '2026-08-15' },
      { id: 2, user_name: 'Sneha Patel', rating: 5, comment: 'We use this daily for cooking and for hot rotis. Excellent quality and packaging.', created_at: '2026-08-20' }
    ]
  },
  {
    id: 2,
    name: 'Sai Krishna Premium Buffalo Ghee',
    slug: 'sai-krishna-premium-buffalo-ghee',
    category_name: 'Buffalo Ghee',
    description: 'Crafted from high-quality buffalo milk, Sai Krishna Buffalo Ghee features a distinctive granular white texture, rich flavor, and high smoke point.',
    images: ['/uploads/product-1788196197866-378062.jpg'],
    variants: [
      { id: 5, weight_or_volume: '500g Jar', price: '380.00', stock: 100, sku: 'SKG-BUF-500J' },
      { id: 6, weight_or_volume: '1L Jar', price: '740.00', stock: 75, sku: 'SKG-BUF-1000J' }
    ],
    reviews: [
      { id: 3, user_name: 'Venkatesh Rao', rating: 5, comment: 'Rich white granular texture, ideal for making traditional sweet delicacies like Halwa!', created_at: '2026-08-22' }
    ]
  },
  {
    id: 3,
    name: 'Sai Krishna Vedic A2 Cow Ghee (Bilona Method)',
    category_name: 'Premium A2 Ghee',
    slug: 'sai-krishna-vedic-a2-cow-ghee',
    description: 'Our super premium Vedic A2 Ghee is prepared using the ancient Bilona method — curdling milk, churning the curd to butter, and slowly boiling it.',
    images: ['/images/ghee_hero.jpg'],
    variants: [
      { id: 7, weight_or_volume: '250g Glass Jar', price: '450.00', stock: 50, sku: 'SKG-A2-250G' },
      { id: 8, weight_or_volume: '500g Glass Jar', price: '850.00', stock: 40, sku: 'SKG-A2-500G' },
      { id: 9, weight_or_volume: '1L Glass Jar', price: '1600.00', stock: 20, sku: 'SKG-A2-1000G' }
    ],
    reviews: [
      { id: 4, user_name: 'Amit Sharma', rating: 5, comment: 'Pure Bilona Ghee. Best A2 cow ghee in the market, helps a lot with digestion.', created_at: '2026-08-25' }
    ]
  }
];

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Related Collection State
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedVariantsMap, setSelectedVariantsMap] = useState({});

  // Review Submission State
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewerName, setReviewerName] = useState(user ? user.name : '');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState(null);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    if (user && user.name) {
      setReviewerName(user.name);
    }
  }, [user]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/products/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          if (data.variants && data.variants.length > 0) {
            setSelectedVariant(data.variants[0]);
          }
          if (data.images && data.images.length > 0) {
            setSelectedImage(data.images[0]);
          }
        } else {
          loadFallbackDetails();
        }
      } catch (err) {
        console.warn('Backend server offline, loading fallback details in client.');
        loadFallbackDetails();
      } finally {
        setLoading(false);
      }
    };

    const loadFallbackDetails = () => {
      const fbProd = FALLBACK_PRODUCTS.find(p => p.slug === slug);
      if (fbProd) {
        setProduct(fbProd);
        setSelectedVariant(fbProd.variants[0]);
        setSelectedImage(fbProd.images[0]);
      }
    };

    fetchProductDetails();
  }, [slug]);

  // Fetch Related Products for Collection Section
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/products`);
        if (res.ok) {
          const all = await res.json();
          setRelatedProducts(all.filter(p => p.slug !== slug));
        } else {
          setRelatedProducts(FALLBACK_PRODUCTS.filter(p => p.slug !== slug));
        }
      } catch (err) {
        setRelatedProducts(FALLBACK_PRODUCTS.filter(p => p.slug !== slug));
      }
    };

    fetchRelatedProducts();
  }, [slug]);

  const handleSelectVariantForProduct = (productId, variant) => {
    setSelectedVariantsMap(prev => ({
      ...prev,
      [productId]: variant
    }));
  };

  const isWish = product ? isInWishlist(product.id) : false;
  const isOutOfStock = selectedVariant ? selectedVariant.stock <= 0 : false;

  const handleAddToCart = () => {
    if (!selectedVariant || isOutOfStock) return;
    addToCart(product, selectedVariant, quantity);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingReview(true);
    setReviewMsg(null);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE}/reviews/addReview/${product.id}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          rating: newRating,
          comment: newComment,
          reviewer_name: reviewerName || 'Verified Buyer'
        })
      });

      if (res.ok) {
        const addedReview = await res.json();
        setProduct(prev => ({
          ...prev,
          reviews: [addedReview, ...(prev.reviews || [])]
        }));
        setNewComment('');
        setReviewMsg('Thank you! Your review has been submitted successfully.');
      } else {
        const errData = await res.json();
        setReviewMsg(errData.message || 'Failed to submit review.');
      }
    } catch (err) {
      setReviewMsg('Error submitting review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center font-semibold text-slate-500">
        Loading Product Details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Product Not Found</h2>
        <Link to="/shop" className="btn btn-primary px-6 py-2.5">
          Back to Shop Catalog
        </Link>
      </div>
    );
  }

  // Calculate average rating
  const reviewsList = product.reviews || [];
  const avgRating = reviewsList.length > 0
    ? (reviewsList.reduce((acc, curr) => acc + curr.rating, 0) / reviewsList.length).toFixed(1)
    : '5.0';

  return (
    <div className="py-8 sm:py-12 bg-[#FAF9F6]">
      <div className="container mx-auto px-4 max-w-7xl pb-16 md:pb-0">

        {/* Back Link */}
        <Link to="/shop" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-[#0033B4] font-semibold text-sm mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Catalog
        </Link>

        {/* 1. Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* Gallery Column */}
          <div className="lg:col-span-6">
            <div className="w-full h-80 sm:h-96 lg:h-[420px] rounded-2xl overflow-hidden bg-[#FCFAF2] border border-slate-200 mb-4 flex items-center justify-center p-6 shadow-sm">
              <img
                src={selectedImage || (product.images && product.images[0]) || '/images/cow_ghee_front.webp'}
                alt={product.name}
                className="max-w-full max-h-full object-contain"
                onError={(e) => { e.target.src = '/images/cow_ghee_front.webp'; }}
              />
            </div>

            {/* Thumbnail switcher */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden cursor-pointer border p-1 bg-[#FCFAF2] shrink-0 transition-all ${selectedImage === img ? 'border-2 border-[#0033B4]' : 'border-slate-200'
                      }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Column */}
          <div className="lg:col-span-6">
            <span className="text-xs font-extrabold text-[#F5C518] uppercase tracking-wider block">
              {product.category_name || 'Sai Krishna Pure Ghee'}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif text-slate-900 my-2 leading-tight">
              {product.name}
            </h1>

            {/* Rating Stars */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill={i < Math.round(avgRating) ? "currentColor" : "none"} stroke="currentColor" />
                ))}
              </div>
              <span className="font-bold text-sm text-slate-800">{avgRating} / 5.0</span>
              <span className="text-slate-400 text-xs sm:text-sm">({reviewsList.length} customer reviews)</span>
            </div>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <label className="block font-bold text-xs sm:text-sm text-slate-800 mb-3">
                  Select Package Size / Weight:
                </label>
                <div className="flex gap-2.5 flex-wrap">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant && selectedVariant.id === v.id;
                    const vDisabled = v.stock <= 0;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        disabled={vDisabled}
                        className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${isSelected
                          ? 'bg-[#0033B4]/10 border-[#0033B4] text-[#0033B4]'
                          : vDisabled
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                      >
                        {v.weight_or_volume} — ₹{parseFloat(v.price).toFixed(2)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price & Stock status */}
            {selectedVariant && (
              <div className="bg-[#FCFAF2] p-4 sm:p-5 rounded-2xl border border-slate-200 mb-6 flex justify-between items-center">
                <div>
                  <span className="text-xs text-slate-400 block">Unit Price</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#0033B4] font-serif m-0">
                    ₹{parseFloat(selectedVariant.price).toFixed(2)}
                  </h2>
                </div>

                <div className="text-right">
                  {isOutOfStock ? (
                    <span className="text-red-500 flex items-center gap-1 font-bold text-xs sm:text-sm">
                      <AlertTriangle size={18} /> Out of Stock
                    </span>
                  ) : selectedVariant.stock < 10 ? (
                    <span className="text-amber-600 flex items-center gap-1 font-bold text-xs sm:text-sm">
                      <AlertTriangle size={18} /> Low Stock ({selectedVariant.stock} left!)
                    </span>
                  ) : (
                    <span className="text-emerald-600 flex items-center gap-1 font-bold text-xs sm:text-sm">
                      <Check size={18} /> In Stock (SKU: {selectedVariant.sku})
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Quantity and Cart Actions */}
            <div className="flex gap-3 items-center mb-8">
              {!isOutOfStock && (
                <div className="flex items-center border border-slate-200 rounded-full h-12 bg-white shrink-0">
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="w-10 h-full flex items-center justify-center font-bold text-lg text-slate-600 hover:text-slate-900"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-slate-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(prev => Math.min(selectedVariant.stock, prev + 1))}
                    className="w-10 h-full flex items-center justify-center font-bold text-lg text-slate-600 hover:text-slate-900"
                  >
                    +
                  </button>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="btn btn-primary flex-1 h-12 text-sm sm:text-base font-extrabold"
              >
                <ShoppingBag size={18} /> {isOutOfStock ? 'Sold Out' : 'Add to Shopping Cart'}
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`w-12 h-12 rounded-full border border-slate-200 bg-white flex items-center justify-center cursor-pointer shrink-0 transition-colors ${isWish ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
                  }`}
                title={isWish ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart size={20} fill={isWish ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Quality Badges */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-6">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 font-medium">
                <Shield size={16} className="text-[#0033B4]" />
                <span>100% Pure Sourced Milk</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 font-medium">
                <Shield size={16} className="text-[#0033B4]" />
                <span>No Added Preservatives</span>
              </div>
            </div>

          </div>
        </div>

        {/* 2. Featured Ghee Collection Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 border-t border-slate-200 pt-12">
            <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
              <div>
                <span className="text-xs font-extrabold text-[#0033B4] uppercase tracking-widest">
                  STOREFRONT CATALOG
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 font-serif">
                  Featured Ghee Collection
                </h2>
              </div>
              <Link
                to="/shop"
                className="inline-flex items-center gap-1 text-[#0033B4] hover:text-[#002688] font-bold text-sm transition-colors"
              >
                Explore Full Shop <ChevronRight size={18} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((p) => {
                const variants = Array.isArray(p.variants) && p.variants.length > 0
                  ? p.variants
                  : [{ id: 99, weight_or_volume: '500g Jar', price: '350.00', stock: 50 }];

                const activeVariant = selectedVariantsMap[p.id] || variants[0];
                const inWish = isInWishlist(p.id);
                const mainImage = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : '/images/cow_ghee_front.webp';

                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Product Image Container */}
                    <div className="relative w-full h-56 bg-[#FAF9F5] overflow-hidden flex items-center justify-center border-b border-slate-100 p-4">
                      <span className="absolute top-3 left-3 bg-[#0033B4] text-white px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide z-10">
                        {p.category_name || 'Pure Ghee'}
                      </span>

                      <button
                        onClick={() => toggleWishlist(p)}
                        className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center cursor-pointer shadow-sm z-10 transition-colors ${inWish ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
                          }`}
                        title="Toggle Wishlist"
                      >
                        <Heart size={18} fill={inWish ? "currentColor" : "none"} />
                      </button>

                      <Link to={`/product/${p.slug}`} className="w-full h-full flex items-center justify-center p-2">
                        <img
                          src={mainImage}
                          alt={p.name}
                          className="max-w-full max-h-full object-contain transition-transform duration-500 hover:scale-105"
                          onError={(e) => { e.target.src = '/images/cow_ghee_front.webp'; }}
                        />
                      </Link>
                    </div>

                    {/* Details */}
                    <div className="p-5 flex flex-col flex-1">

                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex text-amber-400">
                          <Star size={14} fill="currentColor" stroke="currentColor" />
                        </div>
                        <span className="text-xs font-bold text-slate-800">5.0</span>
                        <span className="text-xs text-slate-400">({p.reviews ? p.reviews.length : 5})</span>
                      </div>

                      <Link to={`/product/${p.slug}`}>
                        <h3 className="text-base font-extrabold text-slate-900 mb-1 line-clamp-1 font-serif hover:text-[#0033B4] transition-colors">
                          {p.name}
                        </h3>
                      </Link>

                      <p className="text-xs text-slate-500 leading-relaxed mb-4 min-h-[2.8rem] line-clamp-2">
                        {truncateDescription(p.description, 18)}
                      </p>

                      {/* Package Options */}
                      <div className="mb-4">
                        <span className="text-[10px] font-extrabold text-slate-400 block mb-1.5 uppercase">
                          PACKAGE OPTIONS:
                        </span>
                        <div className="flex gap-1.5 flex-wrap">
                          {variants.map(v => (
                            <button
                              key={v.id}
                              onClick={() => handleSelectVariantForProduct(p.id, v)}
                              className={`text-xs font-bold px-2 py-1 rounded-md cursor-pointer transition-all ${activeVariant.id === v.id
                                ? 'bg-[#0033B4]/10 text-[#0033B4] border border-[#0033B4]'
                                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                                }`}
                            >
                              {v.weight_or_volume}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Price & Action */}
                      <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-slate-400 block">{activeVariant.weight_or_volume}</span>
                          <span className="text-lg font-black text-[#0033B4]">
                            ₹{parseFloat(activeVariant.price).toFixed(2)}
                          </span>
                        </div>

                        <div className="flex gap-1.5">
                          <button
                            onClick={() => addToCart(p, activeVariant, 1)}
                            className="bg-[#F5C518] hover:bg-[#D8AA0D] text-[#0033B4] px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <ShoppingBag size={14} /> + Cart
                          </button>

                          <Link
                            to={`/product/${p.slug}`}
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
          </section>
        )}

        {/* 3. Product Reviews & Ratings Section */}
        <section className="mt-16 border-t border-slate-200 pt-12">
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold font-serif text-[#0033B4] m-0">
                Customer Reviews & Ratings
              </h2>
              <span className="text-xs sm:text-sm text-slate-500">
                Overall Rating: <strong>{avgRating} / 5.0</strong> based on {reviewsList.length} review(s).
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Write a Review Card */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-extrabold text-slate-900 mb-1">Write a Product Review</h3>
              <p className="text-xs text-slate-500 mb-5">
                Share your feedback on aroma, taste, and quality with other buyers.
              </p>

              {reviewMsg && (
                <div className={`p-3 rounded-xl mb-4 text-xs font-bold flex items-center gap-2 ${reviewMsg.includes('Thank you') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                  }`}>
                  <CheckCircle size={16} />
                  <span>{reviewMsg}</span>
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-4">

                {/* Rating Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Rating Stars *
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className={`p-1 ${star <= newRating ? 'text-amber-400' : 'text-slate-300'}`}
                      >
                        <Star size={24} fill={star <= newRating ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reviewer Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Name / Display Title
                  </label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={e => setReviewerName(e.target.value)}
                    placeholder="e.g. Ananya Rao"
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#0033B4]"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Detailed Review *
                  </label>
                  <textarea
                    rows={3}
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Tell us about the aroma, taste, and experience..."
                    required
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#0033B4]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn btn-primary w-full py-2.5 text-sm font-bold flex items-center justify-center gap-2"
                >
                  <Send size={16} /> {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>

              </form>
            </div>

            {/* Reviews List Column */}
            <div className="lg:col-span-7">
              {reviewsList.length > 0 ? (
                <div className="space-y-4">
                  {reviewsList.map((rev, idx) => (
                    <div
                      key={rev.id || idx}
                      className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-bold text-slate-900 text-sm">
                          {rev.user_name || 'Verified Customer'}
                        </div>
                        <div className="text-xs text-slate-400">
                          {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Recent'}
                        </div>
                      </div>

                      <div className="flex text-amber-400 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < rev.rating ? "currentColor" : "none"} />
                        ))}
                      </div>

                      <p className="text-slate-700 text-sm m-0 leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-400">
                  <Star size={36} className="mx-auto opacity-30 mb-2" />
                  <h4 className="font-bold text-slate-700 text-base mb-1">No Reviews Yet</h4>
                  <p className="text-xs">Be the first customer to leave a review for this product!</p>
                </div>
              )}
            </div>

          </div>
        </section>

      </div>

      {/* Mobile Sticky Bottom Action Bar */}
      {selectedVariant && (
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 md:hidden flex items-center justify-between shadow-2xl">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">{selectedVariant.weight_or_volume}</span>
            <span className="text-lg font-black text-[#0033B4]">
              ₹{(parseFloat(selectedVariant.price) * quantity).toFixed(2)}
            </span>
          </div>

          <div className="flex gap-2 items-center">
            {!isOutOfStock && (
              <div className="flex items-center border border-slate-200 rounded-lg h-9 bg-white">
                <button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="w-7 h-full text-xs font-bold text-slate-600"
                >
                  -
                </button>
                <span className="w-6 text-center text-xs font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(prev => Math.min(selectedVariant.stock, prev + 1))}
                  className="w-7 h-full text-xs font-bold text-slate-600"
                >
                  +
                </button>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="bg-[#0033B4] hover:bg-[#002688] text-white px-4 py-2 rounded-lg text-xs font-extrabold flex items-center gap-1 shadow-md"
            >
              <ShoppingBag size={14} /> {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
