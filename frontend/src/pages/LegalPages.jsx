import React, { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle, HelpCircle } from 'lucide-react';
import { API_BASE } from '../context/AuthContext';

// --- ABOUT US PAGE COMPONENT ---
export function About() {
  return (
    <div className="py-12 sm:py-16 bg-[#FAF9F6] min-h-[80vh]">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-[#0033B4] text-center mb-8">
          Our Heritage & Story
        </h1>
        <div className="text-slate-600 text-base leading-relaxed space-y-6">
          <p>
            For generations, our family has been committed to health, vitality, and purity. The brand <strong>Sai Krishna Ghee</strong> was born out of a simple desire: to restore the authentic flavor and immense health benefits of traditional dairy products to modern households.
          </p>
          <p>
            Unlike massive commercial manufacturers who rely on chemical processing and rapid heat cream separation, we adhere strictly to traditional methods. Our cows are fed organic fodder and handled with deep care at partner dairy farms.
          </p>
          <div className="bg-[#FCFAF2] border-l-4 border-[#F5C518] p-6 rounded-r-xl text-slate-800 my-6 shadow-sm">
            <h3 className="font-bold text-lg text-slate-900 mb-2 font-serif">The Danedar Guarantee</h3>
            <p className="text-sm">
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

// --- CONTACT US PAGE COMPONENT ---
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
      const res = await fetch(`${API_BASE}/inquiries/sendInquiry`, {
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
    <div className="py-12 sm:py-16 bg-[#FAF9F6] min-h-[80vh]">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-[#0033B4] text-center mb-10">
          Contact Us
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Direct Details column */}
          <div className="lg:col-span-5">
            <h3 className="text-xl font-bold font-serif text-slate-900 mb-3">Get in Touch</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Have questions about bulk orders, corporate gifting, or franchise inquiries? Reach out to us directly through any of these channels:
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="text-[#0033B4] bg-[#FCFAF2] p-3 rounded-full shrink-0 border border-amber-200">
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Phone Support</h4>
                  <p className="text-slate-500 text-xs mt-0.5">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-[#0033B4] bg-[#FCFAF2] p-3 rounded-full shrink-0 border border-amber-200">
                  <Mail size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Email Address</h4>
                  <p className="text-slate-500 text-xs mt-0.5">orders@saikrishnaghee.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="text-[#0033B4] bg-[#FCFAF2] p-3 rounded-full shrink-0 border border-amber-200">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Corporate Office</h4>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Sai Krishna Dairy Farms, Main Highway Sector, Guntur, AP, India
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form column */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg font-bold font-serif text-slate-900 mb-4">Send Us an Inquiry</h3>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-500 text-emerald-800 p-6 rounded-xl text-center space-y-3">
                <CheckCircle size={36} className="mx-auto text-emerald-600" />
                <h4 className="text-base font-bold">Message Sent Successfully!</h4>
                <p className="text-xs sm:text-sm">Thank you for writing. Our sales team will get back to you within 24 hours.</p>
                <button onClick={() => setSubmitted(false)} className="btn btn-outline px-4 py-2 text-xs font-bold">
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry} className="space-y-4">
                {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Enter name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#0033B4]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#0033B4]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      placeholder="Enter number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#0033B4]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Message *</label>
                  <textarea
                    rows="4"
                    placeholder="Describe your inquiry details..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#0033B4]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full py-3 text-sm font-bold"
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
    <div className="py-12 sm:py-16 bg-[#FAF9F6] min-h-[80vh]">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-[#0033B4] text-center mb-8">
          Privacy Policy
        </h1>
        <div className="text-slate-600 text-sm leading-relaxed space-y-4">
          <p className="text-xs text-slate-400 font-medium">Last updated: August 2026</p>
          <p>
            At Sai Krishna Ghee, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by our e-commerce store and how we use it.
          </p>
          <h3 className="text-base font-bold text-slate-900 pt-2">Information We Collect</h3>
          <p>
            When you register for an Account or check out as a guest, we may ask for your contact information, including items such as name, company name, address, email address, and telephone number.
          </p>
          <h3 className="text-base font-bold text-slate-900 pt-2">How We Use Your Information</h3>
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
    <div className="py-12 sm:py-16 bg-[#FAF9F6] min-h-[80vh]">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-[#0033B4] text-center mb-8">
          Terms & Conditions
        </h1>
        <div className="text-slate-600 text-sm leading-relaxed space-y-4">
          <p>Welcome to Sai Krishna Ghee!</p>
          <p>
            These terms and conditions outline the rules and regulations for the use of Sai Krishna Ghee's Website. By accessing this website, we assume you accept these terms and conditions. Do not continue to use the site if you do not agree to take all of the terms and conditions stated on this page.
          </p>
          <h3 className="text-base font-bold text-slate-900 pt-2">E-Commerce Sales</h3>
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
    <div className="py-12 sm:py-16 bg-[#FAF9F6] min-h-[80vh]">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-[#0033B4] text-center mb-8">
          Frequently Asked Questions (FAQ)
        </h1>

        <div className="space-y-3">
          {faqsList.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                  className="w-full p-4 sm:p-5 text-left bg-none border-none font-bold text-sm sm:text-base text-slate-900 cursor-pointer flex justify-between items-center"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle size={18} className="text-[#0033B4] shrink-0" /> {faq.q}
                  </span>
                  <span className="font-mono text-slate-400 font-bold ml-2">{isOpen ? '-' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-0 pl-11 text-slate-600 text-xs sm:text-sm leading-relaxed">
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
