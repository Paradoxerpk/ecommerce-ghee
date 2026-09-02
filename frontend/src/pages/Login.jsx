import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertTriangle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (!email || !password) {
      setErrorMsg('Please enter email and password');
      setLoading(false);
      return;
    }

    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser && (loggedInUser.role === 'admin' || loggedInUser.role === 'staff')) {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 sm:py-20 min-h-[80vh] flex items-center bg-[#FAF9F6]">
      <div className="container mx-auto px-4 max-w-md">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center font-serif text-[#0033B4] mb-1">
            Welcome Back
          </h2>
          <p className="text-center text-slate-500 text-xs sm:text-sm mb-6">
            Login to track orders and manage details
          </p>

          {errorMsg && (
            <div className="bg-red-50 border border-red-400 text-red-600 p-3 rounded-xl mb-5 text-xs font-bold flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#0033B4]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#0033B4]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 text-sm font-black mt-2"
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center mt-6 text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#0033B4] font-bold underline">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
