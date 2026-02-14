import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Save, Loader2, Camera, Shield, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage = ({ user, onUpdate }) => {
  const [username, setUsername] = useState(user?.profile?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.profile?.username || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put('http://localhost:5000/api/auth/profile', { 
        username 
      }, { withCredentials: true });
      
      toast.success('Profile updated successfully!');
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row items-center gap-6 p-8 glass-card bg-white/50 border-white/40">
        <div className="relative group">
          <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-indigo-500/20">
            {username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?'}
          </div>
          <button className="absolute -bottom-2 -right-2 p-2.5 bg-white rounded-xl shadow-lg border border-slate-100 text-slate-600 hover:text-indigo-600 transition-all hover:scale-110">
            <Camera size={18} />
          </button>
        </div>
        
        <div className="text-center md:text-left space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {username || 'Developer Account'}
          </h1>
          <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2">
            <Mail size={16} />
            {email}
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 mt-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-wider">
            <Zap size={10} fill="currentColor" />
            Premium Member
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Settings Form */}
        <div className="md:col-span-2 glass-card p-8 space-y-8 bg-white/70">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">Account Settings</h2>
            <p className="text-sm text-slate-500 font-medium">Update your public profile and account details.</p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
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
              <label className="text-sm font-bold text-slate-700 ml-1 opacity-50">Email Address (Locked)</label>
              <div className="relative opacity-50">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  className="input-premium w-full pl-12 cursor-not-allowed"
                  value={email}
                  disabled
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-premium w-full md:w-auto px-8"
            >
              {saving ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Info */}
        <div className="space-y-6">
          <div className="glass-card p-6 bg-indigo-600 text-white space-y-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
               <Shield size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold">Security</h3>
              <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                Your account is protected with end-to-end encryption and Supabase Auth security.
              </p>
            </div>
            <Link to="/forgot-password" size="sm" className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center transition-all">
              Change Password
            </Link>
          </div>

          <div className="glass-card p-6 bg-white/70 border-slate-100 flex flex-col items-center text-center gap-3">
             <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                <Zap size={24} />
             </div>
             <p className="text-sm font-bold text-slate-900">Need Help?</p>
             <p className="text-xs text-slate-500 font-medium leading-relaxed">
               Contact support or check our documentation for more info.
             </p>
             <button className="text-xs font-black text-indigo-600 hover:underline">Support Portal</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
