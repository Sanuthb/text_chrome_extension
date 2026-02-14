import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2, Sparkles, Zap, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const LoginPage = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('http://localhost:5000/api/auth/login', { 
        email, 
        password 
      }, { withCredentials: true });
      
      toast.success('Welcome back!');
      onLoginSuccess();
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 relative overflow-hidden px-4">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/30 blur-[130px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-200/30 blur-[130px] rounded-full" />

      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold text-sm bg-white/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-slate-200">
        <ArrowLeft size={18} />
        Back to Landing
      </Link>

      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-500/20 mb-6 text-white text-3xl font-black italic">
            <Zap size={40} fill="currentColor" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-500 font-medium italic">
            "Your next big extension is one prompt away."
          </p>
        </div>

        <div className="glass-card p-10 bg-white/70">
          <form onSubmit={handleLogin} className="space-y-6">
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

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-bold text-slate-700">Password</label>
                <Link to="/forgot-password" size="sm" className="text-xs text-indigo-600 font-bold hover:underline">Forgot?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  className="input-premium w-full pl-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  Sign In
                  <Sparkles size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-8 border-t border-slate-200">
            <p className="text-slate-500 text-sm font-medium">
              New to ExtensionAI?
              <Link
                to="/register"
                className="ml-2 text-indigo-600 font-black hover:underline"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
