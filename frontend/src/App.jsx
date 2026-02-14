import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProfilePage from './pages/ProfilePage';
import TemplatesPage from './pages/TemplatesPage';
import DocumentationPage from './pages/DocumentationPage';
import Generator from './components/Generator';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [templatePrompt, setTemplatePrompt] = useState('');

  const checkAuth = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/me', { withCredentials: true });
      setUser(res.data.user);
      fetchHistory();
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await axios.get('http://localhost:5000/api/chats/history', { withCredentials: true });
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout', {}, { withCredentials: true });
      setUser(null);
      setHistory([]);
      setActiveChat(null);
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
    setTemplatePrompt(''); // Clear template if project selected
  };

  const handleSelectTemplate = (prompt) => {
    setTemplatePrompt(prompt);
    setActiveChat(null); // New generation from template
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-indigo-600">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin" />
          <p className="font-semibold animate-pulse text-slate-800">Initializing ExtensionAI...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
        
        {/* Auth Pages */}
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage onLoginSuccess={checkAuth} />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Dashboard - Using wildcard for sub-routes to prevent flickering */}
        <Route 
          path="/dashboard/*" 
          element={
            user ? (
              <Layout 
                user={user} 
                history={history} 
                onSelectChat={handleSelectChat} 
                activeChatId={activeChat?.id}
                onLogout={handleLogout}
                loadingHistory={loadingHistory}
              >
                <Routes>
                  <Route index element={
                    <Generator 
                      activeChat={activeChat} 
                      onGenerationComplete={fetchHistory} 
                      initialPrompt={templatePrompt}
                    />
                  } />
                  <Route path="profile" element={<ProfilePage user={user} onUpdate={checkAuth} />} />
                  <Route path="templates" element={
                    <TemplatesPage 
                      onSelectTemplate={(prompt) => {
                        handleSelectTemplate(prompt);
                      }} 
                    />
                  } />
                  <Route path="docs" element={<DocumentationPage />} />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;