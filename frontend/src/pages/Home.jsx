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
    <div className="bg-[#FAF9F5] text-slate-800">
      
      {/* 1. Hero Showcase Section */}
      <section className="bg-gradient-to-br from-[#09122C] via-[#172554] to-[#1E3A8A] text-white py-12 lg:py-20 relative overflow-hidden">
        {/* Glow backdrop effect */}
        <div className="absolute -top-36 -right-36 w-96 h-96 lg:w-[600px] lg:h-[600px] rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Hero Headline & Description */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 text-[#F5C518] px-4 py-1.5 rounded-full text-xs sm:text-sm font-extrabold tracking-wide mb-6">
                <Sparkles size={15} />
                <span>100% Traditional Vedic Bilona Churned Ghee</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white mb-6 font-serif">
                Pure Traditional Ghee <br />
                <span className="bg-gradient-to-r from-[#F5C518] to-amber-300 bg-clip-text text-transparent">
                  Aroma & Granular Goodness
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8">
                Sai Krishna Ghee brings you authentic, unadulterated cow and buffalo ghee prepared through time-honored methods. Rich in natural vitamins and traditional aroma for your family’s everyday health.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                <Link
                  to="/shop"
                  className="w-full sm:w-auto bg-[#F5C518] hover:bg-[#D8AA0D] text-[#0033B4] px-8 py-3.5 rounded-full font-black text-base inline-flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-transform active:scale-95"
                >
                  Explore Ghee Range <ArrowRight size={18} />
                </Link>

                <Link
                  to="/about"
                  className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/25 px-7 py-3.5 rounded-full font-bold text-sm inline-flex items-center justify-center gap-2 transition-colors"
                >
                  Our Heritage Story
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 mt-10 pt-6 border-t border-white/15 max-w-md mx-auto lg:mx-0">
                <div>
                  <strong className="block text-xl sm:text-2xl font-black text-[#F5C518]">100%</strong>
                  <span className="text-xs text-slate-400">Pure Dairy</span>
                </div>
                <div>
                  <strong className="block text-xl sm:text-2xl font-black text-[#F5C518]">FSSAI</strong>
                  <span className="text-xs text-slate-400">Lab Certified</span>
                </div>
                <div>
                  <strong className="block text-xl sm:text-2xl font-black text-[#F5C518]">4.9 ★</strong>
                  <span className="text-xs text-slate-400">User Rating</span>
                </div>
              </div>

            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-400/30 max-w-md w-full bg-slate-800">
                <img
                  src="/images/ghee_hero.jpg"
                  alt="Sai Krishna Vedic Pure Ghee"
                  className="w-full h-80 sm:h-96 object-cover block"
                  onError={(e) => { e.target.src = '/uploads/product-1788196192064-385206.jpeg'; }}
                />

                {/* Overlay Badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-white/15 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#F5C518] text-[#0033B4] flex items-center justify-center shrink-0">
                    <Award size={24} />
                  </div>
                  <div>
                    <h4 className="m-0 text-sm sm:text-base font-extrabold text-white">
                      Traditional Danedar Texture
                    </h4>
                    <p className="m-0 text-xs text-slate-300">
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
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-10">
            <span className="text-xs font-extrabold text-[#0033B4] uppercase tracking-widest">
              Why Choose Sai Krishna
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-1 font-serif">
              The Purity Commitments We Live By
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-[#FAF9F5] p-6 rounded-2xl border border-slate-200 text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-full bg-[#0033B4]/10 text-[#0033B4] inline-flex items-center justify-center mb-4">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">100% Pure Dairy</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Directly sourced from trusted dairy farms, completely unadulterated with zero artificial preservatives or colors.</p>
            </div>

            <div className="bg-[#FAF9F5] p-6 rounded-2xl border border-slate-200 text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-full bg-amber-500/15 text-amber-600 inline-flex items-center justify-center mb-4">
                <Flame size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Granular (Danedar)</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Slowly simmered at controlled temperatures to build traditional golden grain texture and heavenly aroma.</p>
            </div>

            <div className="bg-[#FAF9F5] p-6 rounded-2xl border border-slate-200 text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-full bg-[#0033B4]/10 text-[#0033B4] inline-flex items-center justify-center mb-4">
                <Sparkles size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Immunity & Vitality</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Rich in healthy fatty acids and essential vitamins A, D, E, and K that support gut health and energy.</p>
            </div>

            <div className="bg-[#FAF9F5] p-6 rounded-2xl border border-slate-200 text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-full bg-amber-500/15 text-amber-600 inline-flex items-center justify-center mb-4">
                <Shield size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">FSSAI Certified</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Processed under strict hygiene control and certified under License No. 10123049000182.</p>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Category Spotlight Cards */}
      <section className="py-12 sm:py-16 bg-slate-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-10">
            <span className="text-xs font-extrabold text-[#0033B4] uppercase tracking-widest">
              Explore Categories
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-1 font-serif">
              Find Your Perfect Ghee Variety
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Cow Ghee */}
            <div className="bg-gradient-to-br from-[#002688] to-[#0033B4] text-white rounded-2xl p-8 shadow-md flex flex-col justify-between min-h-[280px]">
              <div>
                <span className="text-xs font-extrabold text-[#F5C518] uppercase tracking-wider">Daily Cooking Choice</span>
                <h3 className="text-2xl font-black my-2 font-serif">Pure Cow Ghee</h3>
                <p className="text-sm text-slate-300 leading-relaxed">Rich golden texture, divine aroma. Ideal for rotis, parathas, rice, and daily cooking.</p>
              </div>
              <Link
                to="/shop?category=cow-ghee"
                className="bg-[#F5C518] hover:bg-[#D8AA0D] text-[#0033B4] px-5 py-2.5 rounded-full font-black text-xs sm:text-sm inline-flex items-center gap-1.5 w-fit mt-6 transition-colors"
              >
                Shop Cow Ghee <ArrowRight size={15} />
              </Link>
            </div>

            {/* Buffalo Ghee */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-8 shadow-md flex flex-col justify-between min-h-[280px]">
              <div>
                <span className="text-xs font-extrabold text-[#F5C518] uppercase tracking-wider">High Smoke Point</span>
                <h3 className="text-2xl font-black my-2 font-serif">Premium Buffalo Ghee</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Crisp white granular structure. Perfect for traditional Indian sweets, frying, and roasting.</p>
              </div>
              <Link
                to="/shop?category=buffalo-ghee"
                className="bg-[#F5C518] hover:bg-[#D8AA0D] text-slate-900 px-5 py-2.5 rounded-full font-black text-xs sm:text-sm inline-flex items-center gap-1.5 w-fit mt-6 transition-colors"
              >
                Shop Buffalo Ghee <ArrowRight size={15} />
              </Link>
            </div>

            {/* Vedic A2 Ghee */}
            <div className="bg-gradient-to-br from-amber-500 to-[#F5C518] text-[#0033B4] rounded-2xl p-8 shadow-md flex flex-col justify-between min-h-[280px]">
              <div>
                <span className="text-xs font-extrabold text-[#0033B4] uppercase tracking-wider">Ancient Bilona Process</span>
                <h3 className="text-2xl font-black my-2 font-serif text-[#0033B4]">Vedic A2 Ghee</h3>
                <p className="text-sm text-slate-900 leading-relaxed font-medium">Hand-churned curd butter slowly boiled for maximum nutrients, digestion, and medicinal benefits.</p>
              </div>
              <Link
                to="/shop?category=premium-a2-ghee"
                className="bg-[#0033B4] hover:bg-[#002688] text-white px-5 py-2.5 rounded-full font-black text-xs sm:text-sm inline-flex items-center gap-1.5 w-fit mt-6 transition-colors"
              >
                Shop A2 Ghee <ArrowRight size={15} />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Best Selling Products Catalog */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
            <div>
              <span className="text-xs font-extrabold text-[#0033B4] uppercase tracking-widest">
                Storefront Catalog
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-1 font-serif">
                Featured Ghee Collection
              </h2>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1 text-[#0033B4] hover:text-[#002688] font-bold text-sm sm:text-base transition-colors"
            >
              Explore Full Shop <ChevronRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Image Container */}
                  <div className="relative w-full h-60 bg-[#FAF9F5] flex items-center justify-center overflow-hidden border-b border-slate-100 p-4">
                    <span className="absolute top-3 left-3 bg-[#0033B4] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase z-10">
                      {product.category_name || 'Pure Ghee'}
                    </span>

                    <button
                      onClick={() => toggleWishlist(product)}
                      className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center cursor-pointer transition-colors z-10 ${
                        inWish ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
                      }`}
                      title="Toggle Wishlist"
                    >
                      <Heart size={18} fill={inWish ? 'currentColor' : 'none'} />
                    </button>

                    <img
                      src={mainImage}
                      alt={product.name}
                      className="max-w-[85%] max-h-[85%] object-contain transition-transform duration-500 hover:scale-105"
                      onError={(e) => { e.target.src = '/uploads/product-1788196192064-385206.jpeg'; }}
                    />
                  </div>

                  {/* Details */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mb-1 line-clamp-1 font-serif">
                      <Link to={`/product/${product.slug}`} className="hover:text-[#0033B4] transition-colors">{product.name}</Link>
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 min-h-[2.8rem] line-clamp-2">
                      {truncateDescription(product.description, 18)}
                    </p>

                    {/* Variant Selector Pills */}
                    <div className="mb-4">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                        Package Options:
                      </span>
                      <div className="flex gap-1.5 flex-wrap">
                        {variants.map(v => (
                          <button
                            key={v.id}
                            onClick={() => handleSelectVariant(product.id, v)}
                            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                              activeVariant.id === v.id
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

                      <button
                        onClick={() => addToCart(product, activeVariant, 1)}
                        className="bg-[#0033B4] hover:bg-[#002688] text-white px-4 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
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
      <section className="py-12 sm:py-16 bg-[#FFFDF0] border-t border-b border-amber-200/60">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            <div className="lg:col-span-7">
              <span className="text-xs font-extrabold text-[#0033B4] uppercase tracking-widest">
                Vedic Heritage Craftsmanship
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-[#0033B4] my-2 font-serif">
                The Traditional Bilona Churning Method
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
                Unlike commercial factories that process cream at high speeds, Sai Krishna Ghee follows ancient Vedic principles. Milk is curdled overnight, hand-churned with a wooden bilona to separate butter, and gently simmered over slow fire.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0033B4] text-white flex items-center justify-center font-extrabold text-sm shrink-0">1</div>
                  <div>
                    <h4 className="m-0 text-sm sm:text-base font-bold text-slate-900">Whole A2 Milk Curdling</h4>
                    <p className="m-0 text-xs sm:text-sm text-slate-600">Fresh milk is boiled and fermented overnight into pure probiotics-rich curd.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0033B4] text-white flex items-center justify-center font-extrabold text-sm shrink-0">2</div>
                  <div>
                    <h4 className="m-0 text-sm sm:text-base font-bold text-slate-900">Bi-Directional Wood Churning</h4>
                    <p className="m-0 text-xs sm:text-sm text-slate-600">Curd is churned using wooden bilona rods to extract white cultured butter (Makkhan).</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0033B4] text-white flex items-center justify-center font-extrabold text-sm shrink-0">3</div>
                  <div>
                    <h4 className="m-0 text-sm sm:text-base font-bold text-slate-900">Slow Fire Clarification</h4>
                    <p className="m-0 text-xs sm:text-sm text-slate-600">Butter is gently clarified to produce fragrant, golden granular ghee.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-amber-200 shadow-md text-center max-w-md w-full">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 inline-flex items-center justify-center mb-4">
                  <Award size={32} />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-[#0033B4] mb-3 font-serif">
                  100% FSSAI Certified Plant
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  Processed under rigorous hygiene and safety protocols. Every batch is lab tested for purity, free from chemicals or vegetable oils.
                </p>
                <div className="text-sm sm:text-base font-extrabold text-slate-900 bg-amber-50 py-3 px-4 rounded-xl border border-amber-200">
                  LIC NO: <span className="text-[#0033B4]">10123049000182</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
