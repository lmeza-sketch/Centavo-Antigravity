import React from 'react';
import { Receipt, Plus, ShieldCheck } from 'lucide-react';

export default function EmptyState({ onAddClick }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center shadow-sm max-w-2xl mx-auto my-6">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 ring-8 ring-emerald-50/50">
        <Receipt className="w-8 h-8" />
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">
        No hay transacciones registradas
      </h3>

      <p className="text-gray-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
        Aún no has añadido ningún movimiento a tu cuenta. Comienza registrando tu primer gasto o ingreso para llevar el control total de tus finanzas.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onAddClick}
          className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 hover:shadow-lg transition duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Registrar mi primer gasto
        </button>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center text-xs text-gray-400 space-x-1.5">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Tus movimientos están protegidos y sincronizados en tiempo real</span>
      </div>
    </div>
  );
}
