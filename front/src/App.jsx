import { useState, useEffect } from 'react';
import { Search, Wallet, LayoutDashboard, Settings, Plus, ArrowUpRight, ArrowDownRight, Menu, List } from 'lucide-react';
import { TransactionTable } from './components/TransactionTable';
import { StatCard } from './components/StatCard';
import { WishlistGrid } from './components/WishlistGrid';
import { useStats } from './hooks/useStats';
import { Sidebar } from './components/sidebar';
import { TimeFilter } from './components/Timefilter';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { stats, summary, timeFilter, currentRange, navigateNext, navigatePrev, handleFilterChange, netFlow, isPositiveFlow, netFlowType, netFlowPrefix } = useStats();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2
    }).format(Math.abs(value || 0));
  };

  const NetFlowIcon = isPositiveFlow ? ArrowUpRight : ArrowDownRight;

  const filterLabels = { 'week': 'ESTA SEMANA', 'month': 'ESTE MES', 'all': 'HISTÓRICO' };

  return (
    <div className="flex h-screen bg-notion-bg text-notion-text font-sans overflow-hidden">

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 flex flex-col h-full overflow-y-auto pb-20 md:pb-0">
        <header className="px-4 md:px-12 py-6 flex items-center gap-4 md:gap-8 max-w-5xl mx-auto w-full">
          <button className="md:hidden text-zinc-400 hover:text-zinc-200"><Menu size={24} /></button>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight">Moni</h1>
          <div className="flex items-center gap-2 bg-notion-sidebar border border-notion-border px-3 py-1.5 rounded-md flex-1 max-w-md focus-within:border-zinc-500 transition-colors ml-auto md:ml-0">
            <Search size={18} className="text-zinc-500" />
            <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm w-full placeholder-zinc-500 text-zinc-200" />
          </div>
        </header>

        <div className="px-4 md:px-12 max-w-5xl w-full mx-auto">
          {/* 4. Renderizado Condicional de las Vistas */}

          {activeTab === 'dashboard' && (
            <>
              {/* HEADER DEL DASHBOARD Y FILTRO DE TIEMPO */}
              <div className="flex flex-col md:flex-row md:items-center items-end justify-end mb-6 gap-4">
                <TimeFilter timeFilter={timeFilter} onFilterChange={handleFilterChange} />
              </div>

              {/* GRID DE ESTADÍSTICAS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard title="Total Balance" value={formatCurrency(stats.total_balance)} icon={Wallet} type="neutral" subtitle="ACTUAL" />
                <StatCard title="Income" value={"+" + formatCurrency(summary.income)} icon={ArrowUpRight} type="income" subtitle={filterLabels[timeFilter]} />
                <StatCard title="Outcome" value={"-" + formatCurrency(summary.outcome)} icon={ArrowDownRight} type="outcome" subtitle={filterLabels[timeFilter]} />
                <StatCard title="Flujo Neto" value={netFlowPrefix + formatCurrency(netFlow)} icon={NetFlowIcon} type={netFlowType} subtitle={filterLabels[timeFilter]} />
              </div>
              <div className="flex flex-col xl:flex-row gap-8 items-start">

                {/* LADO IZQUIERDO (Tabla): Toma todo el ancho disponible, pero con min-w-0 para que no se desborde */}
                <div className="w-full xl:flex-1 min-w-0">
                  {/* Envolvemos la tabla para controlar su margen superior que antes traía por defecto */}
                  <div className="mt-0">
                    <TransactionTable
                      currentRange={currentRange}
                      timeFilter={timeFilter}
                      onNext={navigateNext}
                      onPrev={navigatePrev}
                      onRefresh={() => { fetchStats(); fetchSummary(currentRange); }} // Asumo que aún tienes el fetch en tu useStats
                    />
                  </div>
                </div>

                {/* LADO DERECHO (Wishlist): Ancho fijo en pantallas muy grandes, o fluido en medianas */}
                <div className="w-full xl:w-[350px] shrink-0">
                  <div className="-mt-6">
                    <WishlistGrid />
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default App;