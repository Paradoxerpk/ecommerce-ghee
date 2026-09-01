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

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div>Loading product details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="section container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h2>Product Not Found</h2>
        <p>The requested ghee product could not be found.</p>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          Return to Shop
        </Link>
      </div>
    );
  }

  const isWish = isInWishlist(product.id);
  const isOutOfStock = selectedVariant ? selectedVariant.stock <= 0 : true;

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

      const res = await fetch(`${API_BASE}/reviews/product/${product.id}`, {
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

  // Calculate average rating
  const reviewsList = product.reviews || [];
  const avgRating = reviewsList.length > 0
    ? (reviewsList.reduce((acc, curr) => acc + curr.rating, 0) / reviewsList.length).toFixed(1)
    : '5.0';

  return (
    <div className="section" style={{ padding: '3rem 0' }}>
      <div className="container">
        
        {/* Back Link */}
        <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-light)', marginBottom: '2rem', textDecoration: 'none', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to Catalog
        </Link>

        {/* 1. Product Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }} className="product-detail-grid">
          
          {/* Gallery Column */}
          <div>
            <div style={{
              width: '100%',
              height: '420px',
              borderRadius: '16px',
              overflow: 'hidden',
              backgroundColor: 'var(--bg-cream)',
              border: '1px solid var(--border-color)',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <img
                src={selectedImage || (product.images && product.images[0]) || '/images/cow_ghee_front.webp'}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={(e) => { e.target.src = '/images/cow_ghee_front.webp'; }}
              />
            </div>

            {/* Thumbnail switcher */}
            {product.images && product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: selectedImage === img ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      padding: 0,
                      backgroundColor: 'var(--bg-cream)'
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Column */}
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--secondary-color)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
              {product.category_name || 'Sai Krishna Pure Ghee'}
            </span>
            <h1 style={{ fontSize: '2.25rem', fontFamily: 'var(--font-body)', fontWeight: 800, margin: '0.25rem 0 1rem 0', lineHeight: 1.2 }}>
              {product.name}
            </h1>

            {/* Rating Stars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', color: '#f59e0b' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill={i < Math.round(avgRating) ? '#f59e0b' : 'none'} stroke="#f59e0b" />
                ))}
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{avgRating} / 5.0</span>
              <span style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>({reviewsList.length} customer reviews)</span>
            </div>

            <p style={{ color: 'var(--text-dark)', lineHeight: 1.6, fontSize: '1rem', marginBottom: '2rem' }}>
              {product.description}
            </p>

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                  Select Package Size / Weight:
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant && selectedVariant.id === v.id;
                    const vDisabled = v.stock <= 0;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        disabled={vDisabled}
                        style={{
                          padding: '0.65rem 1.25rem',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                          backgroundColor: isSelected ? 'rgba(46, 125, 50, 0.08)' : vDisabled ? '#f3f4f6' : '#fff',
                          color: vDisabled ? '#9ca3af' : 'var(--text-dark)',
                          fontWeight: 700,
                          cursor: vDisabled ? 'not-allowed' : 'pointer',
                          textDecoration: vDisabled ? 'line-through' : 'none'
                        }}
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
              <div style={{ backgroundColor: 'var(--bg-cream)', padding: '1.25rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Unit Price</span>
                    <h2 style={{ fontSize: '2rem', color: 'var(--primary-color)', fontFamily: 'var(--font-body)', fontWeight: 800, margin: 0 }}>
                      ₹{parseFloat(selectedVariant.price).toFixed(2)}
                    </h2>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    {isOutOfStock ? (
                      <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, fontSize: '0.95rem' }}>
                        <AlertTriangle size={18} /> Out of Stock
                      </span>
                    ) : selectedVariant.stock < 10 ? (
                      <span style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, fontSize: '0.95rem' }}>
                        <AlertTriangle size={18} /> Low Stock (Only {selectedVariant.stock} left!)
                      </span>
                    ) : (
                      <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, fontSize: '0.95rem' }}>
                        <Check size={18} /> In Stock (SKU: {selectedVariant.sku})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Quantity and Cart Actions */}
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '2.5rem' }}>
              {!isOutOfStock && (
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '30px', overflow: 'hidden', height: '48px', backgroundColor: '#fff' }}>
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    style={{ background: 'none', border: 'none', width: '40px', height: '100%', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}
                  >
                    -
                  </button>
                  <span style={{ width: '40px', textAlign: 'center', fontWeight: 600 }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity(prev => Math.min(selectedVariant.stock, prev + 1))}
                    style={{ background: 'none', border: 'none', width: '40px', height: '100%', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}
                  >
                    +
                  </button>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="btn btn-primary"
                style={{ flexGrow: 1, height: '48px', borderRadius: '30px' }}
              >
                <ShoppingBag size={18} /> {isOutOfStock ? 'Sold Out' : 'Add to Shopping Cart'}
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: isWish ? '#ef4444' : 'var(--text-light)',
                  transition: 'all 0.2s'
                }}
                title={isWish ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart size={20} fill={isWish ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Quality Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                <Shield size={16} style={{ color: 'var(--primary-color)' }} />
                <span>100% Pure Sourced Milk</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                <Shield size={16} style={{ color: 'var(--primary-color)' }} />
                <span>No Added Preservatives</span>
              </div>
            </div>

          </div>
        </div>

        {/* 2. Featured Ghee Collection Section (Inserted In-Between Product Detail & Reviews) */}
        {relatedProducts.length > 0 && (
          <section style={{ marginTop: '4rem', borderTop: '1px solid var(--border-color)', paddingTop: '3.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                  STOREFRONT CATALOG
                </span>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0F172A', marginTop: '0.3rem' }}>
                  Featured Ghee Collection
                </h2>
              </div>
              <Link
                to="/shop"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'var(--primary-color)',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  textDecoration: 'none'
                }}
              >
                Explore Full Shop <ChevronRight size={18} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }} className="products-3-grid">
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
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid var(--border-color)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all 0.25s ease'
                    }}
                    className="shop-product-card"
                  >
                    {/* Product Image Container */}
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
                        {p.category_name || 'Pure Ghee'}
                      </span>

                      <button
                        onClick={() => toggleWishlist(p)}
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
                          zIndex: 2
                        }}
                        title="Toggle Wishlist"
                      >
                        <Heart size={18} fill={inWish ? "currentColor" : "none"} />
                      </button>

                      <Link to={`/product/${p.slug}`} style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
                        <img
                          src={mainImage}
                          alt={p.name}
                          style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }}
                          className="card-image-hover"
                          onError={(e) => { e.target.src = '/images/cow_ghee_front.webp'; }}
                        />
                      </Link>
                    </div>

                    {/* Product Details Body */}
                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      
                      {/* Rating Stars Summary */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', color: '#f59e0b' }}>
                          <Star size={14} fill="#f59e0b" stroke="#f59e0b" />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>5.0</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                          ({p.reviews ? p.reviews.length : 5} reviews)
                        </span>
                      </div>

                      <Link to={`/product/${p.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>
                          {p.name}
                        </h3>
                      </Link>

                      <p style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-light)',
                        lineHeight: 1.5,
                        margin: '0.4rem 0 1rem 0',
                        minHeight: '2.8em'
                      }}>
                        {truncateDescription(p.description, 18)}
                      </p>

                      {/* Package Options */}
                      <div style={{ marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
                          PACKAGE OPTIONS:
                        </span>
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          {variants.map(v => (
                            <button
                              key={v.id}
                              onClick={() => handleSelectVariantForProduct(p.id, v)}
                              style={{
                                padding: '0.25rem 0.6rem',
                                borderRadius: '16px',
                                fontSize: '0.725rem',
                                fontWeight: 700,
                                border: activeVariant.id === v.id ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                                backgroundColor: activeVariant.id === v.id ? 'rgba(0, 51, 180, 0.08)' : '#FFF',
                                color: activeVariant.id === v.id ? 'var(--primary-color)' : 'var(--text-dark)',
                                cursor: 'pointer'
                              }}
                            >
                              {v.weight_or_volume}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Price & Action */}
                      <div style={{ marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', display: 'block' }}>{activeVariant.weight_or_volume}</span>
                          <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary-color)' }}>
                            ₹{parseFloat(activeVariant.price).toFixed(2)}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => addToCart(p, activeVariant, 1)}
                            style={{
                              backgroundColor: '#F5C518',
                              color: '#0033B4',
                              border: 'none',
                              padding: '0.55rem 0.85rem',
                              borderRadius: '8px',
                              fontWeight: 900,
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            <ShoppingBag size={14} /> + Cart
                          </button>

                          <Link
                            to={`/product/${p.slug}`}
                            style={{
                              backgroundColor: '#0033B4',
                              color: '#FFF',
                              padding: '0.55rem 0.85rem',
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem'
                            }}
                          >
                            View <ArrowRight size={13} />
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
        <section style={{ marginTop: '4rem', borderTop: '1px solid var(--border-color)', paddingTop: '3.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--primary-color)', margin: 0, fontWeight: 800 }}>
                Customer Reviews & Ratings
              </h2>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>
                Overall Rating: <strong>{avgRating} / 5.0</strong> based on {reviewsList.length} review(s).
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '3rem', alignItems: 'start' }}>
            
            {/* Write a Review Card */}
            <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 800 }}>Write a Product Review</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '1.25rem' }}>
                Share your feedback on aroma, taste, and quality with other buyers.
              </p>

              {reviewMsg && (
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  backgroundColor: reviewMsg.includes('Thank you') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: reviewMsg.includes('Thank you') ? '#16a34a' : '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <CheckCircle size={16} />
                  <span>{reviewMsg}</span>
                </div>
              )}

              <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                {/* Rating Selection */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Select Rating Stars *
                  </label>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.2rem',
                          color: star <= newRating ? '#f59e0b' : '#ccc'
                        }}
                      >
                        <Star size={24} fill={star <= newRating ? '#f59e0b' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reviewer Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Your Name / Display Title
                  </label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={e => setReviewerName(e.target.value)}
                    placeholder="e.g. Ananya Rao"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                {/* Comment */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Your Detailed Review *
                  </label>
                  <textarea
                    rows={3}
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Tell us about the aroma, taste, and experience..."
                    required
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.9rem',
                      lineHeight: '1.4'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn btn-primary"
                  style={{ borderRadius: '8px', padding: '0.65rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 700 }}
                >
                  <Send size={16} /> {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>

              </form>
            </div>

            {/* Reviews List Column */}
            <div>
              {reviewsList.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {reviewsList.map((rev, idx) => (
                    <div
                      key={rev.id || idx}
                      style={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        padding: '1.25rem 1.5rem',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.95rem' }}>
                          {rev.user_name || 'Verified Customer'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                          {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : 'Recent'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', color: '#f59e0b', marginBottom: '0.5rem' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < rev.rating ? '#f59e0b' : 'none'} stroke="#f59e0b" />
                        ))}
                      </div>

                      <p style={{ color: 'var(--text-dark)', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--text-light)' }}>
                  <Star size={36} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                  <h4>No Reviews Yet</h4>
                  <p style={{ fontSize: '0.875rem' }}>Be the first customer to leave a review for this product!</p>
                </div>
              )}
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
