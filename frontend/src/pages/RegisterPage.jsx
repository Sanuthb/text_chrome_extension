import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, Loader2, Sparkles, Zap, ArrowLeft, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('http://localhost:5000/api/auth/register', { 
        username,
        email, 
        password 
      });
      setSuccess(true);
      toast.success('Check your email for verification!');
      setTimeout(() => navigate('/login'), 4000);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 relative overflow-hidden px-4">
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-200/30 blur-[130px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-200/30 blur-[130px] rounded-full" />

      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold text-sm bg-white/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-slate-200">
        <ArrowLeft size={18} />
        Back to Landing
      </Link>

      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-500/20 mb-6 text-white">
            <Zap size={40} fill="currentColor" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Get Started
          </h1>
          <p className="text-slate-500 font-medium">
            Join 5,000+ developers building extensions with AI.
          </p>
        </div>

        <div className="glass-card p-10 bg-white/70">
          {success ? (
            <div className="text-center py-10 animate-in zoom-in duration-300">
               <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={48} />
               </div>
               <h3 className="text-2xl font-bold text-slate-900 mb-2">Verification Sent!</h3>
               <p className="text-slate-500 font-medium">Please check your email to verify your account. Redirecting you to login...</p>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Username</label>
                <div className="relative">
                  <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    className="input-premium w-full pl-12"
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

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
                <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    className="input-premium w-full pl-12"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
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
                    Create Account
                    <Sparkles size={20} />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 text-center pt-8 border-t border-slate-200">
            <p className="text-slate-500 text-sm font-medium">
              Already have an account?
              <Link
                to="/login"
                className="ml-2 text-indigo-600 font-black hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
