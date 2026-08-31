import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div>
            <h3 className="footer-brand-title">Sai Krishna Ghee</h3>
            <p className="footer-brand-desc">
              Dedicated to bringing you the divine goodness of pure ghee prepared using traditional Vedic methods. Sourced from the finest dairy farms to guarantee purity, rich aroma, and premium quality.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary-color)', fontSize: '0.85rem', fontWeight: 600 }}>
              <ShieldCheck size={18} />
              <span>100% Pure & Lab Tested (FSSAI Certified)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/shop">Shop Ghee</Link></li>
              <li><Link to="/about">Our Heritage</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/faq">Frequently Asked FAQs</Link></li>
            </ul>
          </div>

          {/* Legal Information */}
          <div>
            <h4 className="footer-title">Policies</h4>
            <ul className="footer-links">
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms & Conditions</Link></li>
              <li><Link to="/shipping-policy">Shipping Policy</Link></li>
              <li><Link to="/refund-policy">Refund & Cancellation</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="footer-title">Get in Touch</h4>
            <div className="footer-contact-item">
              <Phone size={16} className="footer-contact-icon" />
              <div>
                <p style={{ fontWeight: 600, color: '#fff' }}>Phone Support</p>
                <p>+91 98765 43210</p>
              </div>
            </div>
            <div className="footer-contact-item">
              <Mail size={16} className="footer-contact-icon" />
              <div>
                <p style={{ fontWeight: 600, color: '#fff' }}>Email Address</p>
                <p>orders@saikrishnaghee.com</p>
              </div>
            </div>
            <div className="footer-contact-item">
              <MapPin size={16} className="footer-contact-icon" />
              <div>
                <p style={{ fontWeight: 600, color: '#fff' }}>Corporate Office</p>
                <p>Sai Krishna Dairy Farms, Main Highway Sector, Guntur, AP, India</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Sai Krishna Ghee Brand. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#718096' }}>Secured Payments:</span>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', color: '#fff', fontWeight: 600 }}>Razorpay UPI</span>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', color: '#fff', fontWeight: 600 }}>Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
