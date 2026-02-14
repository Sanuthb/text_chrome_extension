import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Loader2, Sparkles, Zap, ArrowLeft, Send } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      toast.success('Reset link sent! Please check your email.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 relative overflow-hidden px-4">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/30 blur-[130px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-200/30 blur-[130px] rounded-full" />

      <Link to="/login" className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold text-sm bg-white/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-slate-200">
        <ArrowLeft size={18} />
        Back to Login
      </Link>

      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-500/20 mb-6 text-white text-3xl font-black italic">
            <Zap size={40} fill="currentColor" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Reset Password
          </h1>
          <p className="text-slate-500 font-medium">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        <div className="glass-card p-10 bg-white/70">
          <form onSubmit={handleResetRequest} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  className="input-premium w-full pl-12"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-premium w-full shadow-xl shadow-indigo-500/25 py-4 text-lg"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Send Reset Link
                  <Send size={20} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
