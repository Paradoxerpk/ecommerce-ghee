import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, Heart, Shield, Check, AlertTriangle, ArrowLeft } from 'lucide-react';
import { API_BASE } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

// Local Fallback list
const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: 'Sai Krishna Pure Cow Ghee',
    slug: 'sai-krishna-pure-cow-ghee',
    category_name: 'Cow Ghee',
    description: 'Sai Krishna Pure Cow Ghee is made from fresh cow milk, ensuring a rich golden texture, divine aroma, and traditional homemade taste. Rich in natural nutrients, vitamins, and antioxidants, it is an essential ingredient for a healthy daily diet and traditional cooking.',
    images: ['/images/cow_ghee_front.webp', '/images/cow_ghee_back.webp'],
    variants: [
      { id: 1, weight_or_volume: '100g Pouch', price: '75.00', stock: 500, sku: 'SKG-COW-100P' },
      { id: 2, weight_or_volume: '250g Jar', price: '185.00', stock: 200, sku: 'SKG-COW-250J' },
      { id: 3, weight_or_volume: '500g Jar', price: '360.00', stock: 150, sku: 'SKG-COW-500J' },
      { id: 4, weight_or_volume: '1L Jar', price: '700.00', stock: 0, sku: 'SKG-COW-1000J' } // Mock out of stock
    ],
    reviews: [
      { id: 1, user_name: 'Rajesh Kumar', rating: 5, comment: 'Excellent aroma! Reminds me of traditional home-churned ghee. Highly recommended.', created_at: '2026-08-15' },
      { id: 2, user_name: 'Sneha Patel', rating: 4, comment: 'Very nice granular texture. Perfect for rotis.', created_at: '2026-08-20' }
    ]
  },
  {
    id: 2,
    name: 'Sai Krishna Premium Buffalo Ghee',
    slug: 'sai-krishna-premium-buffalo-ghee',
    category_name: 'Buffalo Ghee',
    description: 'Crafted from high-quality buffalo milk, Sai Krishna Buffalo Ghee features a distinctive granular white texture, rich flavor, and high smoke point. Excellent for traditional Indian sweets, deep-frying, and enhancing everyday meals.',
    images: ['/images/buffalo_ghee_front.webp'],
    variants: [
      { id: 5, weight_or_volume: '500g Jar', price: '380.00', stock: 100, sku: 'SKG-BUF-500J' },
      { id: 6, weight_or_volume: '1L Jar', price: '740.00', stock: 75, sku: 'SKG-BUF-1000J' }
    ],
    reviews: []
  },
  {
    id: 3,
    name: 'Sai Krishna Vedic A2 Cow Ghee (Bilona Method)',
    category_name: 'Premium A2 Ghee',
    slug: 'sai-krishna-vedic-a2-cow-ghee',
    description: 'Our super premium Vedic A2 Ghee is prepared using the ancient Bilona method — curdling milk, churning the curd to butter, and slowly boiling it. Sourced exclusively from purebred native cows, it offers unmatched medicinal values, deep aroma, and an exquisite granular structure.',
    images: ['/images/a2_ghee_front.webp'],
    variants: [
      { id: 7, weight_or_volume: '250g Glass Jar', price: '450.00', stock: 50, sku: 'SKG-A2-250G' },
      { id: 8, weight_or_volume: '500g Glass Jar', price: '850.00', stock: 40, sku: 'SKG-A2-500G' },
      { id: 9, weight_or_volume: '1L Glass Jar', price: '1600.00', stock: 20, sku: 'SKG-A2-1000G' }
    ],
    reviews: [
      { id: 1, user_name: 'Amit Sharma', rating: 5, comment: 'Pure Bilona Ghee. Best A2 cow ghee in the market, helps a lot with digestion.', created_at: '2026-08-25' }
    ]
  }
];

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

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
      } else {
        // Redirect to shop if slug not found
        navigate('/shop');
      }
    };

    fetchProductDetails();
  }, [slug, navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div>Loading product details...</div>
      </div>
    );
  }

  if (!product) return null;

  const isWish = isInWishlist(product.id);
  const isOutOfStock = selectedVariant ? selectedVariant.stock <= 0 : true;

  const handleAddToCart = () => {
    if (selectedVariant && !isOutOfStock) {
      addToCart(product, selectedVariant, quantity);
      // Optional toast alert implementation or redirect to cart
      navigate('/cart');
    }
  };

  return (
    <div className="section" style={{ padding: '3.5rem 0' }}>
      <div className="container">
        
        {/* Back Button */}
        <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)', fontWeight: 600, marginBottom: '2rem' }}>
          <ArrowLeft size={16} /> Back to Shop
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3.5rem' }} className="product-detail-layout">
          
          {/* 1. Image Gallery Component */}
          <div>
            {/* Main Image Display Box */}
            <div style={{
              width: '100%',
              backgroundColor: 'var(--bg-cream)',
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              padding: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '380px',
              position: 'relative'
            }}>
              {/* Product graphic display mockup representing packet */}
              <div style={{
                width: '200px',
                height: '260px',
                backgroundColor: 'var(--primary-color)',
                color: '#fff',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                boxShadow: 'var(--shadow-md)',
                textAlign: 'center',
                padding: '1rem'
              }}>
                <span style={{ fontSize: '1.4rem', color: 'var(--secondary-color)' }}>Sai Krishna</span>
                <span style={{ fontSize: '0.9rem' }}>{product.category_name}</span>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--secondary-color)', margin: '1rem 0', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: '#000', display: 'inline-flex', justifyContent: 'center' }}>
                  <Star size={24} style={{ alignSelf: 'center', color: '#121F3E', fill: '#121F3E' }} />
                </div>
                <span style={{ fontSize: '0.85rem' }}>{selectedVariant?.weight_or_volume || 'Pure'}</span>
              </div>
            </div>

            {/* Thumbnail Gallery (FR-2.2) */}
            {product.images && product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: '8px',
                      border: `2px solid ${selectedImage === img ? 'var(--primary-color)' : 'var(--border-color)'}`,
                      padding: '0.25rem',
                      backgroundColor: 'var(--bg-cream)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {/* Small representation */}
                    <div style={{ fontSize: '0.6rem', fontWeight: 'bold', color: 'var(--text-light)' }}>
                      Image {idx + 1}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Buy Details Panel */}
          <div>
            <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--primary-color)', fontWeight: 700, letterSpacing: '0.05em' }}>
              {product.category_name}
            </span>
            <h1 style={{ fontSize: '2.5rem', color: 'var(--text-dark)', marginTop: '0.5rem', marginBottom: '1rem' }}>
              {product.name}
            </h1>

            {/* Mock Ratings summary */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', color: 'var(--secondary-color)' }}>
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
              </div>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: 500 }}>
                (5.0 based on {product.reviews?.length || 3} reviews)
              </span>
            </div>

            <p style={{ color: 'var(--text-light)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              {product.description}
            </p>

            {/* Weight/Volume variant selection (FR-2.1) */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Select Package Weight
              </h4>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {product.variants.map((v) => {
                  const out = v.stock <= 0;
                  const isSelected = selectedVariant?.id === v.id;

                  return (
                    <button
                      key={v.id}
                      disabled={false} // Allow selecting even if out of stock to see out-of-stock UI state
                      onClick={() => { setSelectedVariant(v); setQuantity(1); }}
                      style={{
                        padding: '0.6rem 1.25rem',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        border: isSelected 
                          ? '2px solid var(--primary-color)' 
                          : '1px solid var(--border-color)',
                        backgroundColor: isSelected 
                          ? 'rgba(0, 51, 180, 0.03)' 
                          : '#fff',
                        color: out ? 'var(--text-light)' : 'var(--text-dark)',
                        position: 'relative'
                      }}
                    >
                      <span>{v.weight_or_volume}</span>
                      <span style={{ fontSize: '0.75rem', color: out ? 'var(--text-light)' : 'var(--primary-color)', marginTop: '0.15rem' }}>
                        ₹{parseFloat(v.price).toFixed(2)}
                      </span>
                      {out && (
                        <span style={{ fontSize: '0.6rem', color: '#ff3b30', fontWeight: 'bold' }}>
                          Out of Stock
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Display and Stock Indicator */}
            {selectedVariant && (
              <div style={{
                backgroundColor: 'var(--bg-cream)',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '2rem',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Unit Price</span>
                    <h2 style={{ fontSize: '2rem', color: 'var(--primary-color)', fontFamily: 'var(--font-body)', fontWeight: 800 }}>
                      ₹{parseFloat(selectedVariant.price).toFixed(2)}
                    </h2>
                  </div>

                  {/* Stock Level Notification (FR-10.3 / FR-10.1) */}
                  <div style={{ textAlign: 'right' }}>
                    {isOutOfStock ? (
                      <span style={{ color: '#ff3b30', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, fontSize: '0.95rem' }}>
                        <AlertTriangle size={18} /> Out of Stock
                      </span>
                    ) : selectedVariant.stock < 10 ? (
                      <span style={{ color: '#d8aa0d', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, fontSize: '0.95rem' }}>
                        <AlertTriangle size={18} /> Low Stock (Only {selectedVariant.stock} left!)
                      </span>
                    ) : (
                      <span style={{ color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, fontSize: '0.95rem' }}>
                        <Check size={18} /> In Stock (SKU: {selectedVariant.sku})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Quantity and Actions Bar */}
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
                <ShoppingBag size={18} /> {isOutOfStock ? 'Sold Out (Unavailable)' : 'Add to Shopping Cart'}
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
                  color: isWish ? '#ff3b30' : 'var(--text-light)',
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
                <span>100% Pure Milk Sourced</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                <Shield size={16} style={{ color: 'var(--primary-color)' }} />
                <span>No Artificial Colors/Aromas</span>
              </div>
            </div>

          </div>
        </div>

        {/* 3. Product Reviews section (FR-9.2) */}
        <section style={{ marginTop: '4rem', borderTop: '1px solid var(--border-color)', paddingTop: '3rem' }}>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--primary-color)', marginBottom: '2rem' }}>
            Customer Reviews & Ratings
          </h2>

          {product.reviews && product.reviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {product.reviews.map((rev) => (
                <div key={rev.id} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{rev.user_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{rev.created_at}</div>
                  </div>
                  <div style={{ display: 'flex', color: 'var(--secondary-color)', marginBottom: '0.75rem' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} fill={i < rev.rating ? "currentColor" : "none"} />
                    ))}
                  </div>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>{rev.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--text-light)' }}>
              No reviews yet for this product. Be the first to leave a review after purchase!
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
