import React, { useState } from 'react';
import Header from '../components/Header';
import EmptyState from '../components/EmptyState';
import TransactionModal from '../components/TransactionModal';
import { useAuth } from '../context/AuthContext';
import {
  TrendingDown,
  DollarSign,
  Plus,
  Search,
  Filter,
  Receipt,
  Calendar,
  Tag,
  Trash2
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  const handleAddTransaction = (newTx) => {
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleDeleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || tx.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalSpent = transactions.reduce((acc, tx) => acc + tx.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Welcome & Overview Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-600/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              ¡Hola, {user?.name || 'Usuario'}! 👋
            </h1>
            <p className="text-emerald-100 text-sm mt-1">
              Aquí está el resumen general de tus finanzas este mes.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-5 py-3 rounded-2xl bg-white text-emerald-800 font-bold text-sm shadow-md hover:bg-emerald-50 transition transform active:scale-95"
          >
            <Plus className="w-5 h-5 mr-2 text-emerald-600" />
            Nueva Transacción
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Total Gastos */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Gastado</p>
              <h3 className="text-2xl font-black text-gray-900 mt-0.5">
                ${totalSpent.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
          </div>

          {/* Card 2: Presupuesto Disponible */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Presupuesto Restante</p>
              <h3 className="text-2xl font-black text-gray-900 mt-0.5">$0.00</h3>
            </div>
          </div>

          {/* Card 3: Cantidad de Transacciones */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Movimientos</p>
              <h3 className="text-2xl font-black text-gray-900 mt-0.5">
                {transactions.length} registrado{transactions.length === 1 ? '' : 's'}
              </h3>
            </div>
          </div>
        </div>

        {/* Transactions Section Header & Controls */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Historial de Transacciones</h2>
              <p className="text-xs text-gray-500">Lista detallada de tus gastos e ingresos registrados</p>
            </div>

            {/* Filter & Search Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar gastos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                />
              </div>

              <div className="relative">
                <Filter className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-9 pr-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white text-gray-700"
                >
                  <option value="Todas">Todas las categorías</option>
                  <option value="Comida">Comida</option>
                  <option value="Alimentación">Alimentación</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Entretenimiento">Entretenimiento</option>
                  <option value="Servicios">Servicios</option>
                  <option value="Salud">Salud</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>
            </div>
          </div>

          {/* Transactions List View or Empty State */}
          {filteredTransactions.length === 0 ? (
            <EmptyState onAddClick={() => setIsModalOpen(true)} />
          ) : (
            <div className="divide-y divide-gray-100 mt-2">
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="py-3 px-2 flex items-center justify-between hover:bg-gray-50/80 rounded-xl transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{tx.description}</h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mt-0.5">
                        <span className="inline-block px-2 py-0.5 bg-gray-100 rounded-md font-medium text-gray-600">
                          {tx.category}
                        </span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {tx.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-extrabold text-red-600">
                      -${tx.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleDeleteTransaction(tx.id)}
                      className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTransaction={handleAddTransaction}
      />
    </div>
  );
}
