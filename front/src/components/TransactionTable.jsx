import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';

export function TransactionTable() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:3000/api/transactions')
      .then(response => response.json())
      .then(data => {
        console.log("Datos recibidos de Rust:", data);
        setTransactions(data);
      })
      .catch(error => console.error("Error conectando al backend:", error));
  }, []);

  const renderBadge = (tipo) => {
    // Normalizamos a minúsculas para evitar fallos de case-sensitivity
    const t = tipo?.toLowerCase();
    const styles = {
      'p2p_buy': 'bg-[#2E3C2E] text-[#4ADE80]',
      'compra': 'bg-[#2E3C2E] text-[#4ADE80]', // Soporte para el dummy data "Compra"
      'p2p_sell': 'bg-[#3C2E2E] text-[#F87171]',
      'cash_in': 'bg-[#2E363C] text-[#60A5FA]',
      'pay': 'bg-[#3C382E] text-[#FBBF24]',
    };
    const labels = {
      'p2p_buy': 'BUY',
      'compra': 'BUY',
      'p2p_sell': 'SELL',
      'cash_in': 'IN',
      'pay': 'PAY'
    };
    return <span className={`px-2 py-0.5 rounded text-xs font-semibold tracking-wider ${styles[t] || 'bg-gray-700'}`}>{labels[t] || t}</span>;
  };

  const renderStatus = (estado) => {
    if (!estado) return null;

    // Normalizamos el valor del Enum de la BD para que coincida con el objeto
    const e = estado.toLowerCase();

    const styles = {
      'completada': 'text-[#4ADE80]',
      'completed': 'text-[#4ADE80]', // Match con el dummy data 'Completed'
      'en_curso': 'text-[#FBBF24]',
      'processing': 'text-[#FBBF24]',
      'cancelada': 'text-[#F87171]',
      'cancelled': 'text-[#F87171]',
    };

    // Si el estado no existe en nuestro diccionario, usamos un color neutro
    const colorClass = styles[e] || 'text-gray-400';
    const dotClass = colorClass.replace('text', 'bg');

    return (
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></div>
        <span className={`text-sm capitalize ${colorClass}`}>{e.replace('_', ' ')}</span>
      </div>
    );
  };

  const formatearFecha = (fechaString) => {
    const fecha = new Date(fechaString);
    return isNaN(fecha) ? "Fecha inválida" : fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="mt-8 border border-notion-border rounded-lg bg-notion-bg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-notion-border">
        <h2 className="text-lg font-semibold text-white">Transacciones</h2>
        <button className="bg-[#2EA043] hover:bg-[#3FB950] text-white text-sm font-medium px-3 py-1.5 rounded-md transition-colors flex items-center gap-2">
          <span>Nuevo</span>
          <span className="text-xs opacity-70">▼</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="text-gray-400 text-sm border-b border-notion-border bg-notion-sidebar/50">
              <th className="px-4 py-3 font-medium flex items-center gap-2">📅 fecha</th>
              <th className="px-4 py-3 font-medium"># Monto</th>
              <th className="px-4 py-3 font-medium"># Bolivares</th>
              <th className="px-4 py-3 font-medium">≡ Tipo</th>
              <th className="px-4 py-3 font-medium">⊙ Activo</th>
              <th className="px-4 py-3 font-medium">⚙ Estado</th>
              <th className="px-4 py-3 font-medium">Aa ID orden</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-notion-border">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">No hay transacciones registradas</td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-notion-hover/50 transition-colors">
                  <td className="px-4 py-3 text-gray-300">{formatearFecha(tx.fecha)}</td>
                  <td className="px-4 py-3">{tx.monto}</td>
                  <td className="px-4 py-3">{tx.total_fiat}</td>
                  <td className="px-4 py-3">{renderBadge(tx.tipo)}</td>
                  <td className="px-4 py-3 text-gray-300">{tx.activo}</td>
                  <td className="px-4 py-3">{renderStatus(tx.estado)}</td>
                  <td className="px-4 py-3 flex items-center gap-2 text-gray-400">
                    <FileText size={14} />
                    {tx.id_orden}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 text-xs text-gray-500 border-t border-notion-border flex justify-between">
        <span>SHOWING {transactions.length} TRANSACTIONS</span>
      </div>
    </div>
  );
}