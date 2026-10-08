import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Wallet, Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor ingresa tu correo y contraseña');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      try {
        login(email, password);
      } catch (err) {
        setError('Error al iniciar sesión. Inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const handleDemoLogin = () => {
    setEmail('demo@centavo.app');
    setPassword('centavo2026');
    setLoading(true);
    setTimeout(() => {
      login('demo@centavo.app', 'centavo2026');
      setLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-gray-50 to-emerald-100/40 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 mb-4 ring-8 ring-emerald-100">
            <Wallet className="w-9 h-9" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Centavo</h1>
          <p className="text-sm text-gray-600 mt-1 font-medium">Control Inteligente de tus Finanzas Personales</p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Iniciar Sesión</h2>
            <p className="text-xs text-gray-500 mt-1">Ingresa tus datos para acceder a tu panel financiero</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs font-medium flex items-center">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition bg-gray-50/50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Contraseña
                </label>
                <a href="#forgot" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                  ¿Olvidaste tu clave?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition bg-gray-50/50 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 hover:shadow-xl transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-70"
            >
              <span>{loading ? 'Iniciando sesión...' : 'Ingresar'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Quick Demo Access button */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 px-4 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/50 text-emerald-800 text-xs font-semibold transition flex items-center justify-center space-x-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Acceder con cuenta Demo (Scaffold Mode)</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Antigravity Centavo Caso Estudio &copy; 2026
        </p>
      </div>
    </div>
  );
}
