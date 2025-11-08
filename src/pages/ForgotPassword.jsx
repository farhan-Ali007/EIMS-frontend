import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, CheckCircle, Key, Copy, Check } from 'lucide-react';
import { forgotPassword } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setCopied(false);
    setLoading(true);

    try {
      const response = await forgotPassword(email);
      
      setSuccess(true);
      
      // In development, show the token (in production this would be emailed)
      if (response.data.resetToken) {
        setResetToken(response.data.resetToken);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToken = async () => {
    try {
      await navigator.clipboard.writeText(resetToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-8 text-white text-center">
          <div className="bg-white bg-opacity-20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key size={40} />
          </div>
          <h1 className="text-3xl font-bold">Forgot Password</h1>
          <p className="text-slate-200 mt-2">Reset your admin password</p>
        </div>

        {/* Form */}
        <div className="p-8">
          {!success ? (
            <>
              {error && (
                <div className="mb-4 bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="text-rose-500 flex-shrink-0 mt-0.5" size={20} />
                  <p className="text-rose-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="text-gray-400" size={20} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="admin@example.com"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Enter your registered email address to receive a password reset token
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Key size={20} />
                      Get Reset Token
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="text-emerald-500 flex-shrink-0 mt-0.5" size={24} />
                <div>
                  <p className="text-emerald-700 font-medium">Reset Token Generated!</p>
                  <p className="text-emerald-600 text-sm mt-1">
                    Your password reset token has been created.
                  </p>
                </div>
              </div>

              {resetToken && (
                <div className="bg-slate-50 border border-slate-300 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Your Reset Token:</p>
                  <div className="relative">
                    <div className="bg-white border border-slate-300 rounded px-3 py-2 pr-12 font-mono text-sm break-all">
                      {resetToken}
                    </div>
                    <button
                      onClick={handleCopyToken}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                        copied 
                          ? 'bg-emerald-100 text-emerald-600' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      title="Copy token"
                    >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    ⚠️ {copied ? 'Token copied!' : 'Click the copy button to copy. '} Valid for 10 minutes.
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    📧 In production, this would be sent to your email
                  </p>
                </div>
              )}

              <Link
                to="/reset-password"
                className="block w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium py-3 rounded-lg transition-all duration-200 text-center shadow-lg"
              >
                Reset Password Now →
              </Link>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-gray-600 hover:text-emerald-600 font-medium inline-flex items-center gap-2">
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 text-center border-t">
          <p className="text-xs text-gray-500">
            Password reset tokens expire in 10 minutes
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
