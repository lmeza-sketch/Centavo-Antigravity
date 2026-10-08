import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Wallet, LogOut, User, Bell, PieChart, ArrowLeftRight } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo & Navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900 tracking-tight">Centavo</span>
                <span className="block text-[10px] font-medium text-emerald-600 uppercase tracking-wider">Finanzas Personales</span>
              </div>
            </div>

            <nav className="hidden md:flex space-x-1">
              <a
                href="#transactions"
                className="px-3 py-2 rounded-lg text-sm font-semibold bg-emerald-50 text-emerald-700 flex items-center space-x-2"
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>Transacciones</span>
              </a>
              <a
                href="#budgets"
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition flex items-center space-x-2 opacity-60 cursor-not-allowed"
                title="Próximamente"
              >
                <PieChart className="w-4 h-4" />
                <span>Presupuestos</span>
              </a>
            </nav>
          </div>

          {/* User & Actions */}
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition relative"
              title="Notificaciones"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full"></span>
            </button>

            <div className="h-6 w-px bg-gray-200"></div>

            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm border border-emerald-200">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.name || 'Usuario'}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>

              <button
                onClick={logout}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
