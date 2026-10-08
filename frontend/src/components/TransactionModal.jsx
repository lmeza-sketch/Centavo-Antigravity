import React, { useState } from 'react';
import { X, DollarSign, Calendar, Tag, FileText } from 'lucide-react';

export default function TransactionModal({ isOpen, onClose, onAddTransaction }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Alimentación');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount) return;

    onAddTransaction({
      id: Date.now().toString(),
      description,
      amount: parseFloat(amount),
      category,
      date,
    });

    setDescription('');
    setAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Registrar Nuevo Gasto</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Descripción
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                required
                placeholder="Ej. Supermercado, Cine, Gasolina"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Monto ($)
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Categoría
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition bg-white"
              >
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

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Fecha
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition"
            >
              Guardar Gasto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
