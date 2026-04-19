import { useState, useEffect } from 'react';
import { FileText, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

export function TransactionTable({ currentRange, timeFilter, onNext, onPrev, onRefresh }) {
  const [transactions, setTransactions] = useState([]);

  const [page, setPage] = useState(0);
  const [isScraping, setIsScraping] = useState(false);
  const limit = 10;

  const fetchTransactions = () => {
    let url = `http://127.0.0.1:3000/api/transactions?limit=${limit}&offset=${page * limit}`;

    if (currentRange && currentRange.start) {
      url += `&start_date=${currentRange.start}&end_date=${currentRange.end}`;
    }

    fetch(url)
      .then(response => response.json())
      .then(data => {
        setTransactions(data);
      })
      .catch(error => console.error("Error conectando al backend:", error));
  };

  useEffect(() => {
    setPage(0);
  }, [currentRange, timeFilter]);

  useEffect(() => {
    fetchTransactions();
  }, [page, currentRange]);

  const handleActualizar = async () => {
    setIsScraping(true);
    try {
      await fetch('http://127.0.0.1:3000/api/scrape', { method: 'POST' });
      fetchTransactions();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error ejecutando scraper:", error);
    } finally {
      setIsScraping(false);
    }
  };

  const renderBadge = (tipo) => {
    const t = tipo?.toLowerCase();
    const styles = {
      'p2p_buy': 'bg-[#2E3C2E] text-[#4ADE80]',
      'compra': 'bg-[#2E3C2E] text-[#4ADE80]',
      'p2p_sell': 'bg-[#3C2E2E] text-[#F87171]',
      'cash_in': 'bg-[#2E363C] text-[#60A5FA]',
      'pay': 'bg-[#3C382E] text-[#FBBF24]',
    };
    const labels = { 'p2p_buy': 'BUY', 'compra': 'BUY', 'p2p_sell': 'SELL', 'cash_in': 'IN', 'pay': 'PAY' };
    return <span className={`px-2 py-0.5 rounded text-xs font-semibold tracking-wider ${styles[t] || 'bg-gray-700'}`}>{labels[t] || t}</span>;
  };

  const renderStatus = (estado) => {
    if (!estado) return null;
    const e = estado.toLowerCase();
    const styles = {
      'completada': 'text-[#4ADE80]', 'completed': 'text-[#4ADE80]',
      'en_curso': 'text-[#FBBF24]', 'processing': 'text-[#FBBF24]',
      'cancelada': 'text-[#F87171]', 'cancelled': 'text-[#F87171]',
    };
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

  // Obtenemos la fecha de hoy en formato YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  // DESHABILITAR FUTURO: Si la fecha de fin del rango es mayor o igual a hoy
  const isNextDisabled = timeFilter === 'all' || (currentRange && currentRange.end >= todayStr);

  // DESHABILITAR PASADO: Si la tabla ya no trajo datos.
  // Nota: Esto asume que si llegas a una semana/mes vacío, es el fin de la historia. 
  // (Si en el futuro tienes una semana sin transacciones en medio del mes, tendríamos que pedirle al backend la "fecha de tu primera transacción" para hacerlo 100% infalible).
  const isPrevDisabled = timeFilter === 'all' || transactions.length === 0;

  return (
    <div className="mt-8 border border-notion-border rounded-lg bg-notion-bg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-notion-border">
        <h2 className="text-lg font-semibold text-white">Transacciones</h2>

        <button
          onClick={handleActualizar}
          disabled={isScraping}
          className="bg-[#2EA043] hover:bg-[#3FB950] disabled:opacity-50 text-white text-sm font-medium px-3 py-1.5 rounded-md transition-colors flex items-center gap-2"
        >
          <RefreshCw size={14} className={isScraping ? "animate-spin" : ""} />
          <span>Actualizar</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
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
              <tr><td colSpan="7" className="text-center py-8 text-gray-500">No hay transacciones registradas para este periodo</td></tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-notion-hover/50 transition-colors">
                  <td className="px-4 py-3 text-gray-300">{formatearFecha(tx.fecha)}</td>
                  <td className="px-4 py-3">{tx.monto}</td>
                  <td className="px-4 py-3">{tx.total_fiat}</td>
                  <td className="px-4 py-3">{renderBadge(tx.tipo)}</td>
                  <td className="px-4 py-3 text-gray-300">{tx.activo}</td>
                  <td className="px-4 py-3">{renderStatus(tx.estado)}</td>
                  <td className="px-4 py-3 flex items-center gap-2 text-gray-400"><FileText size={14} />{tx.id_orden}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER: NAVEGACIÓN DE TIEMPO + PAGINACIÓN */}
      <div className="px-4 py-3 text-xs text-gray-500 border-t border-notion-border flex flex-col sm:flex-row justify-between items-center gap-4 bg-notion-sidebar/30">

        {/* NAVEGACIÓN EN EL TIEMPO (Semanas/Meses) */}
        {/* NAVEGACIÓN EN EL TIEMPO (Semanas/Meses) */}
        <div className="flex items-center gap-1 py-0">
          {/* IZQUIERDA = HACIA ADELANTE (onNext) */}
          <button
            onClick={onNext}
            disabled={isNextDisabled}
            className="p-1.5 rounded hover:bg-notion-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={22} />
          </button>

          <span className="px-3 py-2 bg-notion-sidebar border border-notion-border rounded-md text-zinc-300 text-xs font-medium tracking-wide">
            {currentRange && currentRange.start
              ? `${currentRange.start}  →  ${currentRange.end}`
              : "Histórico Completo"}
          </span>

          {/* DERECHA = HACIA ATRÁS (onPrev) */}
          <button
            onClick={onPrev}
            disabled={isPrevDisabled}
            className="p-1.5 rounded hover:bg-notion-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* PAGINACIÓN DE FILAS (> 50 transacciones) */}
        <div className="flex items-center gap-3">
          <span className="uppercase font-semibold tracking-wider">PÁG {page + 1}</span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded hover:bg-notion-hover border-notion-border hover:bg-notion-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={transactions.length < limit}
              className="p-1.5 rounded hover:bg-notion-hover border-notion-border hover:bg-notion-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}