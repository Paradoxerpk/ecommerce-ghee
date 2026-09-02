import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#121F3E] text-white pt-12 pb-8 border-t-4 border-[#F5C518]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div>
            <h3 className="font-serif text-2xl text-[#F5C518] font-bold mb-3">Sai Krishna Ghee</h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              Dedicated to bringing you the divine goodness of pure ghee prepared using traditional Vedic methods. Sourced from the finest dairy farms to guarantee purity, rich aroma, and premium quality.
            </p>
            <div className="flex items-center gap-2 text-[#F5C518] text-xs font-semibold">
              <ShieldCheck size={18} />
              <span>100% Pure & Lab Tested (FSSAI Certified)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-semibold mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-[#F5C518]">
              Quick Links
            </h4>
            <ul className="list-none space-y-2 text-sm p-0 m-0">
              <li><Link to="/" className="text-slate-300 hover:text-[#F5C518] transition-colors">Home</Link></li>
              <li><Link to="/shop" className="text-slate-300 hover:text-[#F5C518] transition-colors">Shop Ghee</Link></li>
              <li><Link to="/about" className="text-slate-300 hover:text-[#F5C518] transition-colors">Our Heritage</Link></li>
              <li><Link to="/contact" className="text-slate-300 hover:text-[#F5C518] transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="text-slate-300 hover:text-[#F5C518] transition-colors">Frequently Asked FAQs</Link></li>
            </ul>
          </div>

          {/* Legal Information */}
          <div>
            <h4 className="text-base font-semibold mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-[#F5C518]">
              Policies
            </h4>
            <ul className="list-none space-y-2 text-sm p-0 m-0">
              <li><Link to="/privacy" className="text-slate-300 hover:text-[#F5C518] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-slate-300 hover:text-[#F5C518] transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/shipping-policy" className="text-slate-300 hover:text-[#F5C518] transition-colors">Shipping Policy</Link></li>
              <li><Link to="/refund-policy" className="text-slate-300 hover:text-[#F5C518] transition-colors">Refund & Cancellation</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-base font-semibold mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-[#F5C518]">
              Get in Touch
            </h4>
            <div className="flex items-start gap-3 mb-3 text-sm text-slate-300">
              <Phone size={16} className="text-[#F5C518] shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-white">Phone Support</p>
                <p>+91 98765 43210</p>
              </div>
            </div>
            <div className="flex items-start gap-3 mb-3 text-sm text-slate-300">
              <Mail size={16} className="text-[#F5C518] shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-white">Email Address</p>
                <p>orders@saikrishnaghee.com</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm text-slate-300">
              <MapPin size={16} className="text-[#F5C518] shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-white">Corporate Office</p>
                <p>Sai Krishna Dairy Farms, Main Highway Sector, Guntur, AP, India</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-4 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Sai Krishna Ghee Brand. All rights reserved.</p>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-slate-500">Secured Payments:</span>
            <span className="bg-white/10 px-2 py-1 rounded text-white text-[10px] font-bold">Razorpay UPI</span>
            <span className="bg-white/10 px-2 py-1 rounded text-white text-[10px] font-bold">Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
