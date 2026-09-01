import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Flame, Sparkles, CheckCircle2, Shield, Heart, ShoppingBag, Award, ChevronRight } from 'lucide-react';
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

const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: 'Sai Krishna Pure Cow Ghee',
    slug: 'sai-krishna-pure-cow-ghee',
    category_name: 'Cow Ghee',
    description: 'Fresh cow milk ghee boasting a rich golden granular texture, divine natural aroma, and traditional homemade taste.',
    images: ['/uploads/product-1788196192064-385206.jpeg'],
    variants: [
      { id: 1, weight_or_volume: '250g Jar', price: '190.00', stock: 100 },
      { id: 2, weight_or_volume: '500g Jar', price: '360.00', stock: 150 },
      { id: 3, weight_or_volume: '1L Jar', price: '710.00', stock: 80 }
    ]
  },
  {
    id: 2,
    name: 'Sai Krishna Premium Buffalo Ghee',
    slug: 'sai-krishna-premium-buffalo-ghee',
    category_name: 'Buffalo Ghee',
    description: 'High-fat buffalo milk ghee featuring a crisp white granular structure, high smoke point, and deep rich flavor.',
    images: ['/uploads/product-1788196197866-378062.jpg'],
    variants: [
      { id: 4, weight_or_volume: '500g Jar', price: '380.00', stock: 90 },
      { id: 5, weight_or_volume: '1L Jar', price: '740.00', stock: 75 }
    ]
  },
  {
    id: 3,
    name: 'Sai Krishna Vedic A2 Cow Ghee (Bilona)',
    slug: 'sai-krishna-vedic-a2-cow-ghee',
    category_name: 'Premium A2 Ghee',
    description: 'Super premium Vedic A2 Ghee prepared using the ancient Bilona method — curdling milk, churning to butter, and slow simmering.',
    images: ['/images/ghee_hero.jpg'],
    variants: [
      { id: 6, weight_or_volume: '250g Glass Jar', price: '450.00', stock: 30 },
      { id: 7, weight_or_volume: '500g Glass Jar', price: '850.00', stock: 40 }
    ]
  }
];

export default function Home() {
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [selectedVariantsMap, setSelectedVariantsMap] = useState({});

  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/products`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setProducts(data.slice(0, 3));
          }
        }
      } catch (err) {
        console.warn('Using local fallback product catalog for demo.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const handleSelectVariant = (productId, variant) => {
    setSelectedVariantsMap(prev => ({
      ...prev,
      [productId]: variant
    }));
  };

  return (
    <div style={{ backgroundColor: '#FAF9F5', color: '#1E293B' }}>
      
      {/* 1. Hero Showcase Section */}
      <section style={{
        background: 'linear-gradient(135deg, #09122C 0%, #172554 60%, #1E3A8A 100%)',
        color: '#ffffff',
        padding: '5rem 0 6rem 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow backdrop effects */}
        <div style={{
          position: 'absolute',
          top: '-30%',
          right: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 197, 24, 0.18) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ maxWidth: '1440px', width: '95%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '4rem', alignItems: 'center' }} className="hero-grid">
            
            {/* Left Hero Headline & Description */}
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(245, 197, 24, 0.12)',
                border: '1px solid rgba(245, 197, 24, 0.3)',
                color: '#F5C518',
                padding: '0.45rem 1.15rem',
                borderRadius: '30px',
                fontSize: '0.85rem',
                fontWeight: 800,
                letterSpacing: '0.5px',
                marginBottom: '1.75rem'
              }}>
                <Sparkles size={15} />
                <span>100% Traditional Vedic Bilona Churned Ghee</span>
              </div>

              <h1 style={{
                fontSize: '3.6rem',
                fontWeight: 900,
                lineHeight: 1.12,
                color: '#FFFFFF',
                letterSpacing: '-1px',
                marginBottom: '1.5rem'
              }}>
                Pure Traditional Ghee <br />
                <span style={{
                  background: 'linear-gradient(135deg, #F5C518 0%, #FFDF6D 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Aroma & Granular Goodness
                </span>
              </h1>

              <p style={{
                fontSize: '1.15rem',
                color: '#CBD5E1',
                lineHeight: 1.65,
                maxWidth: '560px',
                marginBottom: '2.5rem'
              }}>
                Sai Krishna Ghee brings you authentic, unadulterated cow and buffalo ghee prepared through time-honored methods. Rich in natural vitamins and traditional aroma for your family’s everyday health.
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <Link
                  to="/shop"
                  style={{
                    backgroundColor: '#F5C518',
                    color: '#0033B4',
                    padding: '0.9rem 2.25rem',
                    borderRadius: '30px',
                    fontWeight: 900,
                    fontSize: '1rem',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 8px 24px rgba(245, 197, 24, 0.3)',
                    transition: 'all 0.25s ease'
                  }}
                >
                  Explore Ghee Range <ArrowRight size={18} />
                </Link>

                <Link
                  to="/about"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    padding: '0.9rem 2rem',
                    borderRadius: '30px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  Our Heritage Story
                </Link>
              </div>

              {/* Trust Badges */}
              <div style={{ display: 'flex', gap: '2rem', marginTop: '3rem', borderTop: '1px solid rgba(255, 255, 255, 0.12)', paddingTop: '1.75rem' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '1.4rem', fontWeight: 900, color: '#F5C518' }}>100%</strong>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Pure & Unadulterated</span>
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '1.4rem', fontWeight: 900, color: '#F5C518' }}>FSSAI</strong>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Certified Quality</span>
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '1.4rem', fontWeight: 900, color: '#F5C518' }}>4.9 ★</strong>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Customer Rating</span>
                </div>
              </div>

            </div>

            {/* Right Hero Image Card */}
            <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <div style={{
                position: 'relative',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                border: '2px solid rgba(245, 197, 24, 0.3)',
                maxWidth: '480px',
                width: '100%',
                backgroundColor: '#1E293B'
              }}>
                <img
                  src="/images/ghee_hero.jpg"
                  alt="Sai Krishna Vedic Pure Ghee"
                  style={{ width: '100%', height: '420px', objectFit: 'cover', display: 'block' }}
                  onError={(e) => { e.target.src = '/uploads/product-1788196192064-385206.jpeg'; }}
                />

                {/* Overlay Badge */}
                <div style={{
                  position: 'absolute',
                  bottom: '1.5rem',
                  left: '1.5rem',
                  right: '1.5rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.88)',
                  backdropFilter: 'blur(10px)',
                  padding: '1.25rem',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: '#F5C518',
                    color: '#0033B4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Award size={24} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#FFF' }}>
                      Traditional Danedar Texture
                    </h4>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#CBD5E1' }}>
                      Slowly simmered milk fat for maximum aroma & golden grains
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Brand Value Proposition Pillars */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#FFFFFF' }}>
        <div className="container" style={{ maxWidth: '1500px', width: '96%' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              Why Choose Sai Krishna
            </span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0F172A', marginTop: '0.5rem' }}>
              The Purity Commitments We Live By
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
            
            <div style={{ backgroundColor: '#FAF9F5', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(0, 51, 180, 0.08)', color: 'var(--primary-color)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <CheckCircle2 size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.6rem' }}>100% Pure Dairy</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', lineHeight: 1.6 }}>Directly sourced from trusted dairy farms, completely unadulterated with zero artificial preservatives or colors.</p>
            </div>

            <div style={{ backgroundColor: '#FAF9F5', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(245, 197, 24, 0.15)', color: '#D97706', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Flame size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.6rem' }}>Granular (Danedar)</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', lineHeight: 1.6 }}>Slowly simmered at controlled temperatures to build traditional golden grain texture and heavenly aroma.</p>
            </div>

            <div style={{ backgroundColor: '#FAF9F5', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(0, 51, 180, 0.08)', color: 'var(--primary-color)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Sparkles size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.6rem' }}>Immunity & Vitality</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', lineHeight: 1.6 }}>Rich in healthy fatty acids and essential vitamins A, D, E, and K that support gut health and energy.</p>
            </div>

            <div style={{ backgroundColor: '#FAF9F5', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(245, 197, 24, 0.15)', color: '#D97706', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Shield size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.6rem' }}>FSSAI Certified</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', lineHeight: 1.6 }}>Processed under strict hygiene control and certified under License No. 10123049000182.</p>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Category Spotlight Cards */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#F8FAFC' }}>
        <div className="container" style={{ maxWidth: '1500px', width: '96%' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              Explore Categories
            </span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0F172A', marginTop: '0.5rem' }}>
              Find Your Perfect Ghee Variety
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }} className="products-3-grid">
            
            {/* Cow Ghee */}
            <div style={{
              backgroundColor: '#0033B4',
              backgroundImage: 'linear-gradient(135deg, #002688 0%, #0033B4 100%)',
              color: '#FFFFFF',
              borderRadius: '20px',
              padding: '2.5rem',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '280px'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#F5C518', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Daily Cooking Choice</span>
                <h3 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '0.35rem 0 0.75rem 0' }}>Pure Cow Ghee</h3>
                <p style={{ fontSize: '0.925rem', color: '#CBD5E1', lineHeight: 1.6 }}>Rich golden texture, divine aroma. Ideal for rotis, parathas, rice, and daily cooking.</p>
              </div>
              <Link
                to="/shop?category=cow-ghee"
                style={{
                  backgroundColor: '#F5C518',
                  color: '#0033B4',
                  padding: '0.65rem 1.35rem',
                  borderRadius: '30px',
                  fontWeight: 900,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  width: 'fit-content',
                  marginTop: '1.5rem'
                }}
              >
                Shop Cow Ghee <ArrowRight size={15} />
              </Link>
            </div>

            {/* Buffalo Ghee */}
            <div style={{
              backgroundColor: '#0F172A',
              backgroundImage: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
              color: '#FFFFFF',
              borderRadius: '20px',
              padding: '2.5rem',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '280px'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#F5C518', textTransform: 'uppercase', letterSpacing: '1.5px' }}>High Smoke Point</span>
                <h3 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '0.35rem 0 0.75rem 0' }}>Premium Buffalo Ghee</h3>
                <p style={{ fontSize: '0.925rem', color: '#94A3B8', lineHeight: 1.6 }}>Crisp white granular structure. Perfect for traditional Indian sweets, frying, and roasting.</p>
              </div>
              <Link
                to="/shop?category=buffalo-ghee"
                style={{
                  backgroundColor: '#F5C518',
                  color: '#0F172A',
                  padding: '0.65rem 1.35rem',
                  borderRadius: '30px',
                  fontWeight: 900,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  width: 'fit-content',
                  marginTop: '1.5rem'
                }}
              >
                Shop Buffalo Ghee <ArrowRight size={15} />
              </Link>
            </div>

            {/* Vedic A2 Ghee */}
            <div style={{
              backgroundColor: '#F5C518',
              backgroundImage: 'linear-gradient(135deg, #D49B00 0%, #F5C518 100%)',
              color: '#0033B4',
              borderRadius: '20px',
              padding: '2.5rem',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '280px'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0033B4', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Ancient Bilona Process</span>
                <h3 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '0.35rem 0 0.75rem 0', color: '#0033B4' }}>Vedic A2 Ghee</h3>
                <p style={{ fontSize: '0.925rem', color: '#1E293B', lineHeight: 1.6 }}>Hand-churned curd butter slowly boiled for maximum nutrients, digestion, and medicinal benefits.</p>
              </div>
              <Link
                to="/shop?category=premium-a2-ghee"
                style={{
                  backgroundColor: '#0033B4',
                  color: '#FFFFFF',
                  padding: '0.65rem 1.35rem',
                  borderRadius: '30px',
                  fontWeight: 900,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  width: 'fit-content',
                  marginTop: '1.5rem'
                }}
              >
                Shop A2 Ghee <ArrowRight size={15} />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Best Selling Products Catalog */}
      <section style={{ padding: '5rem 0', backgroundColor: '#FFFFFF' }}>
        <div className="container" style={{ maxWidth: '1500px', width: '96%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                Storefront Catalog
              </span>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0F172A', marginTop: '0.4rem' }}>
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
            {products.map((product) => {
              const variants = Array.isArray(product.variants) && product.variants.length > 0
                ? product.variants
                : [{ id: 99, weight_or_volume: '500g Jar', price: '350.00', stock: 50 }];

              const activeVariant = selectedVariantsMap[product.id] || variants[0];
              const inWish = isInWishlist(product.id);
              const mainImage = Array.isArray(product.images) && product.images.length > 0
                ? product.images[0]
                : '/images/ghee_hero.jpg';

              return (
                <div
                  key={product.id}
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
                  {/* Image Container */}
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '240px',
                    backgroundColor: '#FAF9F5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    borderBottom: '1px solid var(--border-color)'
                  }}>
                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      backgroundColor: 'var(--primary-color)',
                      color: '#FFF',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '12px',
                      textTransform: 'uppercase',
                      zIndex: 2
                    }}>
                      {product.category_name || 'Pure Ghee'}
                    </span>

                    <button
                      onClick={() => toggleWishlist(product)}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: '#FFF',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: inWish ? '#EF4444' : 'var(--text-light)',
                        zIndex: 2
                      }}
                      title="Toggle Wishlist"
                    >
                      <Heart size={18} fill={inWish ? 'currentColor' : 'none'} />
                    </button>

                    <img
                      src={mainImage}
                      alt={product.name}
                      style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }}
                      className="card-image-hover"
                      onError={(e) => { e.target.src = '/uploads/product-1788196192064-385206.jpeg'; }}
                    />
                  </div>

                  {/* Details */}
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>
                      <Link to={`/product/${product.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{product.name}</Link>
                    </h3>

                    <p style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-light)',
                      lineHeight: 1.5,
                      margin: '0.4rem 0 1rem 0',
                      minHeight: '2.8em'
                    }}>
                      {truncateDescription(product.description, 18)}
                    </p>

                    {/* Variant Selector Pills */}
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
                        Package Options:
                      </span>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {variants.map(v => (
                          <button
                            key={v.id}
                            onClick={() => handleSelectVariant(product.id, v)}
                            style={{
                              padding: '0.25rem 0.6rem',
                              borderRadius: '16px',
                              fontSize: '0.75rem',
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

                      <button
                        onClick={() => addToCart(product, activeVariant, 1)}
                        style={{
                          backgroundColor: 'var(--primary-color)',
                          color: '#FFF',
                          border: 'none',
                          padding: '0.55rem 1rem',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <ShoppingBag size={14} /> + Cart
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Traditional Bilona Churning Story */}
      <section style={{ padding: '5rem 0', backgroundColor: '#FFFDF0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ maxWidth: '1440px', width: '95%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }} className="hero-grid">
            
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                Vedic Heritage Craftsmanship
              </span>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--primary-color)', margin: '0.5rem 0 1.25rem 0' }}>
                The Traditional Bilona Churning Method
              </h2>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-light)', lineHeight: 1.65, marginBottom: '2rem' }}>
                Unlike commercial factories that process cream at high speeds, Sai Krishna Ghee follows ancient Vedic principles. Milk is curdled overnight, hand-churned with a wooden bilona to separate butter, and gently simmered over slow fire.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>1</div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Whole A2 Milk Curdling</h4>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-light)' }}>Fresh milk is boiled and fermented overnight into pure probiotics-rich curd.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>2</div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Bi-Directional Wood Churning</h4>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-light)' }}>Curd is churned using wooden bilona rods to extract white cultured butter (Makkhan).</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>3</div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Slow Fire Clarification</h4>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-light)' }}>Butter is gently clarified to produce fragrant, golden granular ghee.</p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                padding: '2.5rem',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-md)',
                textAlign: 'center',
                maxWidth: '450px',
                width: '100%'
              }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(245, 197, 24, 0.2)', color: '#D97706', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <Award size={32} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary-color)', marginBottom: '0.75rem' }}>
                  100% FSSAI Certified Plant
                </h3>
                <p style={{ fontSize: '0.925rem', color: 'var(--text-light)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  Processed under rigorous hygiene and safety protocols. Every batch is lab tested for purity, free from chemicals or vegetable oils.
                </p>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', backgroundColor: 'var(--bg-cream)', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  LIC NO: <span style={{ color: 'var(--primary-color)' }}>10123049000182</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
