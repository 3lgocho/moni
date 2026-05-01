import { FileText, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';

export function TransactionTable({ currentRange, timeFilter, onNext, onPrev, onRefresh }) {
  const { transactions, page, setPage, limit, isScraping, handleActualizar } =
    useTransactions(currentRange, timeFilter, onRefresh);

  const renderBadge = (valorOriginal) => {
    if (!valorOriginal) return null;
    const v = valorOriginal.toLowerCase();

    // Diccionario maestro: Mapea el valor de Binance a su etiqueta visual y color[cite: 11]
    const badgeConfig = {
      // Tipos de Transacción
      'crypto_deposit': { label: 'Deposit', style: 'bg-[#2E3C2E] text-[#4ADE80]' },
      'buy': { label: 'Buy', style: 'bg-[#2E3C2E] text-[#4ADE80]' },
      'sell': { label: 'Sell', style: 'bg-[#3C2E2E] text-[#F87171]' },
      'deposit': { label: 'Deposit', style: 'bg-[#2E363C] text-[#60A5FA]' },
      'pay': { label: 'Pay', style: 'bg-[#3C382E] text-[#FBBF24]' },

      // Activos (Monedas)
      'usdc': { label: 'USDC', style: 'bg-[#2E363C] text-[#60A5FA]' },
      'usdt': { label: 'USDT', style: 'bg-[#1C2C22] text-[#26A17B]' } // Verde oscuro característico de Tether
    };

    // Si Binance manda algo nuevo que no está en el diccionario, no se rompe, solo usa un estilo neutro
    const config = badgeConfig[v] || { label: valorOriginal, style: 'bg-zinc-800 text-zinc-300' };

    return (
      <span className={`px-2 py-0.5 rounded text-xs font-semibold tracking-wider ${config.style}`}>
        {config.label}
      </span>
    );
  };

  const renderStatus = (estadoOriginal) => {
    if (!estadoOriginal) return null;
    const e = estadoOriginal.toLowerCase();

    let label = e.replace('_', ' ');
    let colorClass = 'text-zinc-400';

    if (e === 'completed' || e === 'completada') {
      label = 'Completed';
      colorClass = 'text-[#4ADE80]';
    } else if (e === 'processing' || e === 'en_curso') {
      label = 'Processing';
      colorClass = 'text-[#FBBF24]';
    } else if (e.includes('cancel')) {
      label = 'Cancelled';
      colorClass = 'text-[#F87171]';
    }

    const dotClass = colorClass.replace('text', 'bg');

    return (
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></div>
        <span className={`text-sm capitalize font-medium ${colorClass}`}>{label}</span>
      </div>
    );
  };

  const formatearFecha = (fechaString) => {
    const fecha = new Date(fechaString);
    return isNaN(fecha) ? "Fecha inválida" : fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const todayStr = new Date().toISOString().split('T')[0];
  // Deshabilitamos "Anterior" SOLO si estamos en el "Histórico Completo" (all)
  const isPrevDisabled = timeFilter === 'all';

  // Deshabilitamos "Siguiente" si estamos en Histórico, 
  // o si el final de nuestro rango actual ya superó o igualó el día de hoy (para no viajar al futuro)
  const isNextDisabled = timeFilter === 'all' || (
    currentRange?.end && new Date(`${currentRange.end}T23:59:59`) >= new Date()
  );
  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between pb-3">
        <h2 className="text-xl font-bold text-zinc-100">Transacciones</h2>
        <button
          onClick={handleActualizar}
          disabled={isScraping}
          className="bg-[#2EA043] hover:bg-[#3FB950] disabled:opacity-50 text-white text-sm font-medium px-3 py-1.5 rounded-md transition-colors flex items-center gap-2"
        >
          <RefreshCw size={14} className={isScraping ? "animate-spin" : ""} />
          <span>Actualizar</span>
        </button>
      </div>

      <div className="border border-notion-border rounded-lg bg-notion-bg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
            <thead>
              <tr className="text-gray-400 text-base border-b border-notion-border bg-notion-sidebar/50">
                <th className="px-4 py-3 font-medium flex items-center gap-2">📅 fecha</th>
                <th className="px-4 py-3 font-medium">Monto</th>
                <th className="px-4 py-3 font-medium">Bolivares</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Activo</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">ID orden</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-notion-border">
              {transactions.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-8 text-gray-500">No hay transacciones registradas para este periodo</td></tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-notion-hover/50 transition-colors">
                    <td className="px-4 py-3 text-gray-300">{formatearFecha(tx.fecha)}</td>
                    <td className="px-4 py-3 text-gray-100 font-medium">{tx.monto}</td>
                    <td className="px-4 py-3 text-gray-100">{parseFloat(tx.total_fiat || 0).toFixed(2)}</td>
                    <td className="px-4 py-3">{renderBadge(tx.tipo)}</td>
                    <td className="px-4 py-3">{renderBadge(tx.activo)}</td>
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
                className="p-1.5 rounded hover:bg-notion-hover border-notion-border disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={transactions.length < limit}
                className="p-1.5 rounded hover:bg-notion-hover border-notion-border disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={22} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}