import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, ArrowRight, User } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const truncateDescription = (desc, maxWords = 18) => {
  if (!desc) return '';
  const clean = desc.trim();
  const words = clean.split(/\s+/);
  if (words.length <= maxWords) return clean;
  return words.slice(0, maxWords).join(' ') + '....';
};

export default function Wishlist() {
  const { isAuthenticated } = useAuth();
  const { wishlistItems, toggleWishlist, clearWishlist } = useWishlist();
  const { addToCart, cartItems = [] } = useCart();

  if (!isAuthenticated) {
    return (
      <div className="py-16 min-h-[60vh] flex items-center justify-center bg-[#FAF9F6]">
        <div className="text-center p-8 bg-white rounded-2xl border border-slate-200 max-w-md shadow-sm mx-4">
          <User size={48} className="text-[#0033B4] mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-serif text-slate-900 mb-2">Login Required</h2>
          <p className="text-slate-500 text-sm mb-6">
            Please log in to view and manage your saved wishlist products.
          </p>
          <Link to="/login" className="btn btn-primary px-6 py-2.5 text-sm">
            Log In Now <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = (product) => {
    if (product.variants && product.variants.length > 0) {
      const baseVariant = product.variants[0];
      if (baseVariant.stock > 0) {
        addToCart(product, baseVariant, 1);
        toggleWishlist(product);
      }
    }
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="py-16 min-h-[60vh] flex items-center justify-center bg-[#FAF9F6]">
        <div className="text-center p-8">
          <div className="w-20 h-20 rounded-full bg-amber-100 text-[#0033B4] inline-flex items-center justify-center mb-6">
            <Heart size={40} />
          </div>
          <h2 className="text-3xl font-extrabold font-serif text-slate-900 mb-2">Your Wishlist is Empty</h2>
          <p className="text-slate-500 text-sm mb-6">Browse our pure cow and buffalo ghee collection to save items for later purchase!</p>
          <Link to="/shop" className="btn btn-primary px-8 py-3 text-sm">
            Browse Ghee Catalog <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 sm:py-14 bg-[#FAF9F6] min-h-screen">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black font-serif text-slate-900 m-0">My Wishlist</h1>
          <button onClick={clearWishlist} className="text-red-500 hover:underline text-xs sm:text-sm font-bold cursor-pointer">
            Clear Wishlist
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((product) => {
            const baseVariant = product.variants && product.variants.length > 0
              ? product.variants[0]
              : { price: '0.00', weight_or_volume: '', stock: 0 };
            const isOutOfStock = baseVariant.stock <= 0;
            const mainImage = Array.isArray(product.images) && product.images.length > 0
              ? product.images[0]
              : '/images/cow_ghee_front.webp';

            return (
              <div key={product.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col hover:shadow-xl transition-all duration-300">
                <div className="relative w-full h-56 bg-[#FCFAF2] border-b border-slate-100 flex items-center justify-center p-4">
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center cursor-pointer text-red-500 shadow-sm z-10"
                    title="Remove from Wishlist"
                  >
                    <Star size={18} fill="currentColor" />
                  </button>

                  <img
                    src={mainImage}
                    alt={product.name}
                    className="max-w-[85%] max-h-[85%] object-contain"
                    onError={(e) => { e.target.src = '/images/cow_ghee_front.webp'; }}
                  />
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-base font-extrabold text-slate-900 mb-1 font-serif line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4 min-h-[2.8rem] line-clamp-2">
                    {truncateDescription(product.description, 18)}
                  </p>

                  <div className="mt-auto pt-3 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs text-slate-400">Pack: {baseVariant.weight_or_volume}</span>
                      <span className="text-lg font-black text-[#0033B4]">₹{parseFloat(baseVariant.price).toFixed(2)}</span>
                    </div>

                    <div className="flex gap-2">
                      <Link to={`/product/${product.slug}`} className="btn btn-outline flex-1 py-2 text-xs text-center rounded-lg">
                        Details
                      </Link>
                      {cartItems.some(item => Number(item.variant_id) === Number(baseVariant.id)) ? (
                        <Link
                          to="/cart"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 py-2 text-xs flex items-center justify-center gap-1 rounded-lg font-extrabold transition-colors shadow-sm"
                        >
                          <ShoppingCart size={14} /> Go to Cart
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={isOutOfStock}
                          className="btn btn-primary flex-1 py-2 text-xs flex items-center justify-center gap-1 rounded-lg font-extrabold"
                        >
                          <ShoppingCart size={14} /> Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
