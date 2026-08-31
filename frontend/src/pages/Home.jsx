import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Flame, Sparkles, CheckCircle2 } from 'lucide-react';
import { API_BASE } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

// Hardcoded fallback data in case DB isn't initialized yet (for reliable Sep 5 demo)
const FALLBACK_PRODUCTS = [
  {
    id: 1,
    name: 'Sai Krishna Pure Cow Ghee',
    slug: 'sai-krishna-pure-cow-ghee',
    category_name: 'Cow Ghee',
    description: 'Sai Krishna Pure Cow Ghee is made from fresh cow milk, ensuring a rich golden texture, divine aroma, and traditional homemade taste.',
    images: ['/images/cow_ghee_front.webp'],
    variants: [{ id: 1, weight_or_volume: '500g Jar', price: '360.00', stock: 150 }]
  },
  {
    id: 2,
    name: 'Sai Krishna Premium Buffalo Ghee',
    slug: 'sai-krishna-premium-buffalo-ghee',
    category_name: 'Buffalo Ghee',
    description: 'Crafted from high-quality buffalo milk, Sai Krishna Buffalo Ghee features a distinctive granular white texture, rich flavor, and high smoke point.',
    images: ['/images/buffalo_ghee_front.webp'],
    variants: [{ id: 5, weight_or_volume: '1L Jar', price: '740.00', stock: 75 }]
  },
  {
    id: 3,
    name: 'Sai Krishna Vedic A2 Cow Ghee (Bilona Method)',
    slug: 'sai-krishna-vedic-a2-cow-ghee',
    category_name: 'Premium A2 Ghee',
    description: 'Our super premium Vedic A2 Ghee is prepared using the ancient Bilona method — curdling milk, churning the curd to butter, and slowly boiling it.',
    images: ['/images/a2_ghee_front.webp'],
    variants: [{ id: 7, weight_or_volume: '500g Glass Jar', price: '850.00', stock: 40 }]
  }
];

export default function Home() {
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/products`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setProducts(data.slice(0, 3)); // Display first 3 products
          }
        }
      } catch (err) {
        console.warn('Backend offline, using local fallback product data for demo.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div>
      {/* Premium Hero Banner */}
      <section className="section" style={{
        background: 'linear-gradient(135deg, #001C66 0%, #0033B4 100%)',
        color: '#fff',
        padding: '6rem 0 7rem 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Light Spots */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 197, 24, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container grid-2" style={{ alignItems: 'center' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(255,255,255,0.08)',
              padding: '0.4rem 1rem',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--secondary-color)',
              marginBottom: '1.5rem',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <Sparkles size={14} />
              <span>100% Traditional Vedic Method Churned</span>
            </div>

            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: '1.5rem',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              Divine Goodness <br />
              In Every Spoonful
            </h1>

            <p style={{
              fontSize: '1.15rem',
              color: '#D2DAFF',
              marginBottom: '2.5rem',
              maxWidth: '500px'
            }}>
              Sai Krishna Ghee brings you the authentic granular texture and rich aroma of pure cow ghee, prepared with heritage processes to boost immunity and wellness.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/shop" className="btn btn-secondary">
                Shop Our Ghee Range <ArrowRight size={16} />
              </Link>
              <Link to="/about" className="btn btn-outline" style={{ borderColor: '#fff', color: '#fff' }}>
                Our Churning Process
              </Link>
            </div>
          </div>

          {/* Hero Image / Packet Mockup Representation */}
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <div style={{
              width: '320px',
              height: '420px',
              backgroundColor: '#002688',
              borderRadius: '24px',
              padding: '2rem',
              boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.4)',
              border: '2px solid rgba(245, 197, 24, 0.25)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              textAlign: 'center',
              overflow: 'hidden'
            }}>
              {/* Product Packet Mockup Art */}
              <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: 'rgba(245, 197, 24, 0.2)',
                filter: 'blur(30px)'
              }} />

              {/* Logo shape inside card */}
              <div style={{ marginTop: '1rem' }}>
                <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>Sai KRISHNA</span>
                <span style={{ display: 'block', fontSize: '0.9rem', color: 'var(--secondary-color)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Ghee</span>
              </div>

              {/* Draw Golden Bowl / Ghee Droplet graphic representation */}
              <div style={{
                width: '140px',
                height: '140px',
                background: 'radial-gradient(circle, #F5C518 30%, #D8AA0D 90%)',
                borderRadius: '50%',
                boxShadow: '0 8px 24px rgba(245, 197, 24, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#121F3E',
                margin: '1.5rem 0'
              }}>
                <Flame size={48} style={{ color: '#fff', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
              </div>

              <div>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>100% PURE COW GHEE</p>
                <span style={{ fontSize: '0.8rem', color: 'var(--secondary-color)', border: '1px solid var(--secondary-color)', padding: '0.15rem 0.5rem', borderRadius: '12px' }}>
                  DIVINE GOODNESS
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand USPs Section */}
      <section className="section" style={{ backgroundColor: 'var(--bg-white)' }}>
        <div className="container">
          <h2 className="section-title">Why Choose Sai Krishna Ghee?</h2>
          <div className="grid-4" style={{ gap: '2rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(0, 51, 180, 0.05)', color: 'var(--primary-color)', display: 'inline-flex', alignItems: 'center', justifyCenter: 'center', marginBottom: '1.25rem', display: 'inline-flex', justifyContent: 'center' }}>
                <CheckCircle2 size={32} style={{ alignSelf: 'center' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontFamily: 'var(--font-body)' }}>100% Dairy Purity</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Sourced from direct partner dairy farms, completely free of colors, preservatives, or adulteration.</p>
            </div>

            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(245, 197, 24, 0.08)', color: 'var(--secondary-hover)', display: 'inline-flex', alignItems: 'center', justifyCenter: 'center', marginBottom: '1.25rem', display: 'inline-flex', justifyContent: 'center' }}>
                <Star size={32} style={{ alignSelf: 'center' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontFamily: 'var(--font-body)' }}>Granular Texture</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Slowly boiled to perfection to develop the traditional granular (Danedar) structure of high-quality ghee.</p>
            </div>

            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(0, 51, 180, 0.05)', color: 'var(--primary-color)', display: 'inline-flex', alignItems: 'center', justifyCenter: 'center', marginBottom: '1.25rem', display: 'inline-flex', justifyContent: 'center' }}>
                <Sparkles size={32} style={{ alignSelf: 'center' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontFamily: 'var(--font-body)' }}>Immunity Booster</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Rich in short-chain fatty acids (butyrate) and vitamins A, D, E, K that bolster digestive health and immunity.</p>
            </div>

            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(245, 197, 24, 0.08)', color: 'var(--secondary-hover)', display: 'inline-flex', alignItems: 'center', justifyCenter: 'center', marginBottom: '1.25rem', display: 'inline-flex', justifyContent: 'center' }}>
                <Flame size={32} style={{ alignSelf: 'center' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontFamily: 'var(--font-body)' }}>Divine Aroma</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>The rich heritage recipe infuses a deep, traditional aroma that elevates the taste of daily culinary dishes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Banner Grid */}
      <section className="section" style={{ backgroundColor: 'var(--bg-cream)' }}>
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <div className="grid-3" style={{ gap: '2rem' }}>
            {/* Cow Ghee */}
            <div style={{
              backgroundImage: 'linear-gradient(to bottom, rgba(0, 28, 102, 0.8), rgba(0, 51, 180, 0.95))',
              color: '#fff',
              padding: '2.5rem',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '260px',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary-color)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Daily Essence</span>
                <h3 style={{ fontSize: '1.75rem', margin: '0.25rem 0 0.75rem 0' }}>Pure Cow Ghee</h3>
                <p style={{ fontSize: '0.9rem', color: '#E2E8F0' }}>Traditional aroma, rich gold color, perfect for roti, dal, and everyday recipes.</p>
              </div>
              <Link to="/shop?category=cow-ghee" className="btn btn-secondary" style={{ alignSelf: 'flex-start', padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                Shop Cow Ghee <ArrowRight size={14} />
              </Link>
            </div>

            {/* Buffalo Ghee */}
            <div style={{
              backgroundImage: 'linear-gradient(to bottom, rgba(18, 31, 62, 0.85), rgba(18, 31, 62, 0.98))',
              color: '#fff',
              padding: '2.5rem',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '260px',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary-color)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Rich & Delicious</span>
                <h3 style={{ fontSize: '1.75rem', margin: '0.25rem 0 0.75rem 0' }}>Premium Buffalo Ghee</h3>
                <p style={{ fontSize: '0.9rem', color: '#CBD5E0' }}>Crisp granular texture, high smoke point. Excellent for traditional Indian sweets and roasting.</p>
              </div>
              <Link to="/shop?category=buffalo-ghee" className="btn btn-secondary" style={{ alignSelf: 'flex-start', padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                Shop Buffalo Ghee <ArrowRight size={14} />
              </Link>
            </div>

            {/* A2 Ghee */}
            <div style={{
              backgroundImage: 'linear-gradient(to bottom, rgba(216, 170, 13, 0.9), rgba(245, 197, 24, 0.98))',
              color: '#121F3E',
              padding: '2.5rem',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '260px',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Super Premium</span>
                <h3 style={{ fontSize: '1.75rem', margin: '0.25rem 0 0.75rem 0', color: 'var(--primary-color)' }}>Vedic A2 Ghee</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-dark)' }}>Prepared using the authentic Bilona curd-churning method. Ideal for medicinal and health usage.</p>
              </div>
              <Link to="/shop?category=premium-a2-ghee" className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                Shop A2 Ghee <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="section" style={{ backgroundColor: 'var(--bg-white)' }}>
        <div className="container">
          <h2 className="section-title">Our Best Selling Ghee</h2>
          <div className="grid-3" style={{ gap: '2rem' }}>
            {products.map((product) => {
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
                    {/* Display mock packet graphic representation */}
                    <div style={{
                      width: '120px',
                      height: '160px',
                      backgroundColor: 'var(--primary-color)',
                      color: '#fff',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      boxShadow: 'var(--shadow-md)',
                      textAlign: 'center',
                      padding: '0.5rem'
                    }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--secondary-color)' }}>Sai Krishna</span>
                      <span style={{ fontSize: '0.7rem' }}>{product.category_name}</span>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--secondary-color)', margin: '0.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                        ★
                      </div>
                      <span style={{ fontSize: '0.65rem' }}>{baseVariant.weight_or_volume || '100% Pure'}</span>
                    </div>
                  </div>
                  <div className="product-card-content">
                    <span className="product-card-category">{product.category_name}</span>
                    <h3 className="product-card-title">{product.name}</h3>
                    <p className="product-card-desc">{product.description}</p>
                    <div className="product-card-footer">
                      <div className="product-card-price-container">
                        <span className="product-card-price-label">Starting at</span>
                        <span className="product-card-price">₹{parseFloat(baseVariant.price).toFixed(2)}</span>
                      </div>
                      <Link to={`/product/${product.slug}`} className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/shop" className="btn btn-primary">
              View All Products <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Traditional Bilona Curd Churning Callout */}
      <section className="section" style={{
        backgroundColor: '#FFFDF0',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div className="container grid-2" style={{ alignItems: 'center', gap: '3rem' }}>
          <div>
            <h2 style={{ fontSize: '2.25rem', color: 'var(--primary-color)', marginBottom: '1.25rem' }}>
              The Ancient Bilona Churning Process
            </h2>
            <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
              Most commercial ghee is prepared by heating cream, which damages nutritional profiles. Our premium A2 Ghee is prepared using the ancient Vedic <strong>Bilona churn method</strong>:
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
                <span><strong>Step 1:</strong> Fresh A2 cow milk is boiled and curdled overnight.</span>
              </li>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
                <span><strong>Step 2:</strong> Curd is churned in two directions using a wooden churner (Bilona).</span>
              </li>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
                <span><strong>Step 3:</strong> Butter (Makkhan) separates and is heated slowly over a fire.</span>
              </li>
              <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
                <span><strong>Result:</strong> Highly medicinal, aromatic, granular, nutrient-dense golden A2 Ghee.</span>
              </li>
            </ul>
            <Link to="/about" className="btn btn-outline">
              Learn More Heritage Details
            </Link>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: '100%',
              maxWidth: '450px',
              height: '300px',
              backgroundColor: '#fff',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-md)',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              borderLeft: '5px solid var(--secondary-color)',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--primary-color)', marginBottom: '1rem' }}>FSSAI Registered Brand</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                Our dairy processing plant and ghee products are 100% FSSAI certified, conforming to strict hygiene and quality management practices to assure your family receives the best.
              </p>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)', letterSpacing: '0.05em' }}>
                LIC NO: <span style={{ color: 'var(--primary-color)' }}>10123049000182</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
