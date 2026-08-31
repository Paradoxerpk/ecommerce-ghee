import React, { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle, HelpCircle } from 'lucide-react';
import { API_BASE } from '../context/AuthContext';

// --- ABOUT US PAGE COMPONENT ---
export function About() {
  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 className="section-title">Our Heritage & Story</h1>
        <div style={{ fontSize: '1.05rem', color: 'var(--text-light)', display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
          <p>
            For generations, our family has been committed to health, vitality, and purity. The brand <strong>Sai Krishna Ghee</strong> was born out of a simple desire: to restore the authentic flavor and immense health benefits of traditional dairy products to modern households.
          </p>
          <p>
            Unlike massive commercial manufacturers who rely on chemical processing and rapid heat cream separation, we adhere strictly to traditional methods. Our cows are fed organic fodder and handled with deep care at partner dairy farms.
          </p>
          <div style={{
            backgroundColor: 'var(--bg-cream)',
            borderLeft: '4px solid var(--secondary-color)',
            padding: '1.5rem',
            borderRadius: '0 8px 8px 0',
            color: 'var(--text-dark)',
            margin: '1rem 0'
          }}>
            <h3 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-body)', fontWeight: 700 }}>The Danedar Guarantee</h3>
            <p style={{ fontSize: '0.95rem' }}>
              We slowly simmer butter to ensure moisture is completely removed, resulting in a rich granular structure. This Danedar texture is a natural sign of purity, signifying ghee made with patience and love.
            </p>
          </div>
          <p>
            Whether it is our golden Cow Ghee, rich Buffalo Ghee, or premium Vedic A2 Cow Ghee, every batch is certified by FSSAI and thoroughly tested for purity. Experience the divine goodness in every meal with Sai Krishna Ghee.
          </p>
        </div>
      </div>
    </div>
  );
}

// --- CONTACT US PAGE COMPONENT (Working Inquiry Form - FR-8.2) ---
export function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Submission failed');
      }

      setSubmitted(true);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err) {
      setError(err.message || 'Could not send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section">
      <div className="container">
        <h1 className="section-title">Contact Us</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '3rem', marginTop: '2.5rem' }} className="contact-layout">
          {/* Direct Details column */}
          <div>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--primary-color)', marginBottom: '1.5rem' }}>Get in Touch</h3>
            <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>
              Have questions about bulk orders, corporate gifting, or franchise inquiries? Reach out to us directly through any of these channels:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ color: 'var(--primary-color)', backgroundColor: 'var(--bg-cream)', padding: '0.75rem', borderRadius: '50%' }}>
                  <Phone size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Phone Support</h4>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginTop: '0.15rem' }}>+91 98765 43210</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ color: 'var(--primary-color)', backgroundColor: 'var(--bg-cream)', padding: '0.75rem', borderRadius: '50%' }}>
                  <Mail size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Email Address</h4>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginTop: '0.15rem' }}>orders@saikrishnaghee.com</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ color: 'var(--primary-color)', backgroundColor: 'var(--bg-cream)', padding: '0.75rem', borderRadius: '50%' }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Corporate Office</h4>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginTop: '0.15rem' }}>
                    Sai Krishna Dairy Farms, Main Highway Sector, Guntur, AP, India
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form column */}
          <div style={{ backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-dark)', marginBottom: '1.25rem' }}>Send Us an Inquiry</h3>
            
            {submitted ? (
              <div style={{
                backgroundColor: 'rgba(46, 125, 50, 0.05)',
                border: '1px solid #2e7d32',
                color: '#2e7d32',
                padding: '1.5rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <CheckCircle size={36} style={{ margin: '0 auto 1rem auto' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Message Sent Successfully!</h4>
                <p style={{ fontSize: '0.9rem' }}>Thank you for writing. Our sales team will get back to you within 24 hours.</p>
                <button onClick={() => setSubmitted(false)} className="btn btn-outline" style={{ marginTop: '1.5rem', padding: '0.4rem 1.25rem', fontSize: '0.85rem' }}>
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry}>
                {error && <p style={{ color: '#ff3b30', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>{error}</p>}
                
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="Enter number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Your Message *</label>
                  <textarea
                    rows="4"
                    className="form-control"
                    placeholder="Describe your inquiry details..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px' }}
                >
                  {loading ? 'Submitting Form...' : 'Submit Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- PRIVACY POLICY COMPONENT ---
export function PrivacyPolicy() {
  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 className="section-title">Privacy Policy</h1>
        <div style={{ color: 'var(--text-light)', display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '2rem', fontSize: '0.95rem' }}>
          <p>Last updated: August 2026</p>
          <p>
            At Sai Krishna Ghee, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by our e-commerce store and how we use it.
          </p>
          <h3 style={{ color: 'var(--text-dark)', marginTop: '1rem' }}>Information We Collect</h3>
          <p>
            When you register for an Account or check out as a guest, we may ask for your contact information, including items such as name, company name, address, email address, and telephone number.
          </p>
          <h3 style={{ color: 'var(--text-dark)', marginTop: '1rem' }}>How We Use Your Information</h3>
          <p>
            We use the information we collect in various ways, including to: provide, operate, and maintain our website; improve, personalize, and expand our store offerings; understand and analyze how you use our website; develop new products, services, and features; process your transactions; and send you emails related to order updates.
          </p>
        </div>
      </div>
    </div>
  );
}

// --- TERMS & CONDITIONS COMPONENT ---
export function TermsConditions() {
  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 className="section-title">Terms & Conditions</h1>
        <div style={{ color: 'var(--text-light)', display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '2rem', fontSize: '0.95rem' }}>
          <p>Welcome to Sai Krishna Ghee!</p>
          <p>
            These terms and conditions outline the rules and regulations for the use of Sai Krishna Ghee's Website. By accessing this website, we assume you accept these terms and conditions. Do not continue to use the site if you do not agree to take all of the terms and conditions stated on this page.
          </p>
          <h3 style={{ color: 'var(--text-dark)', marginTop: '1rem' }}>E-Commerce Sales</h3>
          <p>
            We reserve the right to cancel orders if item stocks are exhausted. Prices of ghee variants are subject to change without prior notice. Products once opened cannot be returned due to food safety and hygiene regulations.
          </p>
        </div>
      </div>
    </div>
  );
}

// --- FAQ COMPONENT ---
export function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqsList = [
    {
      q: 'How is Sai Krishna Ghee prepared?',
      a: 'Our Cow and Buffalo ghee are prepared by slowly simmering high-quality butter. Our Premium A2 Ghee is crafted using the traditional Vedic Bilona method — curdling milk, churning curd, separating butter, and slow-boiling.'
    },
    {
      q: 'Is Sai Krishna Ghee FSSAI certified?',
      a: 'Yes, Sai Krishna Ghee is FSSAI certified and undergoes regular laboratory checks to guarantee purity, moisture compliance, and shelf-life parameters.'
    },
    {
      q: 'What is the shelf life of the ghee?',
      a: 'Since we boil out 100% of moisture, our ghee has a natural shelf-life of 12 months when stored in a cool, dry place. Keep the jar lid tightly closed and use clean, dry spoons.'
    },
    {
      q: 'Does your checkout support Razorpay payments?',
      a: 'Yes! We support UPI, Card, NetBanking payments securely processed through Razorpay Sandbox for demo purposes.'
    }
  ];

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '750px' }}>
        <h1 className="section-title">Frequently Asked Questions (FAQ)</h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2.5rem' }}>
          {faqsList.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div 
                key={idx}
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                  style={{
                    width: '100%',
                    padding: '1.25rem',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: 'var(--text-dark)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <HelpCircle size={18} style={{ color: 'var(--primary-color)' }} /> {faq.q}
                  </span>
                  <span>{isOpen ? '-' : '+'}</span>
                </button>
                {isOpen && (
                  <div style={{ padding: '0 1.25rem 1.25rem 2.5rem', color: 'var(--text-light)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
