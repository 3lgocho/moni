import { useState, useEffect } from 'react';
import { Search, Wallet, LayoutDashboard, Settings, Plus, ArrowUpRight, ArrowDownRight, Menu, List } from 'lucide-react';
import { TransactionTable } from './components/TransactionTable';
import { StatCard } from './components/StatCard';

const getDateRange = (filter, date) => {
  const d = new Date(date);
  if (filter === 'week') {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajuste a Lunes
    const start = new Date(d.setDate(diff));
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  }
  if (filter === 'month') {
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  }
  return { start: null, end: null };
};

function App() {
  const [stats, setStats] = useState({ total_balance: 0, income_volume: 0, outcome_volume: 0 });
  const [summary, setSummary] = useState({ income: 0, outcome: 0 });

  // Estados de navegación
  const [timeFilter, setTimeFilter] = useState('week');
  const [referenceDate, setReferenceDate] = useState(new Date());

  const currentRange = getDateRange(timeFilter, referenceDate);

  // Funciones de navegación para viajar en el tiempo
  const navigateNext = () => {
    const newDate = new Date(referenceDate);
    if (timeFilter === 'week') newDate.setDate(newDate.getDate() + 7);
    else if (timeFilter === 'month') newDate.setMonth(newDate.getMonth() + 1);
    setReferenceDate(newDate);
  };

  const navigatePrev = () => {
    const newDate = new Date(referenceDate);
    if (timeFilter === 'week') newDate.setDate(newDate.getDate() - 7);
    else if (timeFilter === 'month') newDate.setMonth(newDate.getMonth() - 1);
    setReferenceDate(newDate);
  };

  // Resetear la fecha de referencia a HOY si cambias el filtro (de Semana a Mes, etc)
  const handleFilterChange = (newFilter) => {
    setTimeFilter(newFilter);
    setReferenceDate(newDate());
  };

  const fetchStats = () => {
    fetch('http://127.0.0.1:3000/api/stats')
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(e => console.error("Error stats:", e));
  };

  const fetchSummary = (range) => {
    const url = range.start
      ? `http://127.0.0.1:3000/api/summary?start_date=${range.start}&end_date=${range.end}`
      : `http://127.0.0.1:3000/api/summary?filter=all`;

    fetch(url)
      .then(r => r.json())
      .then(data => setSummary(data))
      .catch(e => console.error("Error summary:", e));
  };

  // Solo un useEffect para controlar las actualizaciones del summary según la fecha/filtro
  useEffect(() => {
    fetchSummary(currentRange);
  }, [timeFilter, referenceDate]); // Se ejecuta al cambiar filtro o navegar

  // Solo cargar los stats globales al iniciar (o al refrescar manualmente)
  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2
    }).format(Math.abs(value || 0));
  };

  const netFlow = summary.income - summary.outcome;
  const isPositiveFlow = netFlow >= 0;
  const NetFlowIcon = isPositiveFlow ? ArrowUpRight : ArrowDownRight;
  const netFlowType = isPositiveFlow ? 'income' : 'outcome';
  const netFlowPrefix = isPositiveFlow ? "+" : "-";

  const filterLabels = { 'week': 'ESTA SEMANA', 'month': 'ESTE MES', 'all': 'HISTÓRICO' };

  return (
    <div className="flex h-screen bg-notion-bg text-notion-text font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-64 bg-notion-sidebar border-r border-notion-border flex-col shrink-0">
        <div className="p-4 flex items-center gap-2 cursor-pointer border-b border-notion-border hover:bg-notion-hover transition-colors">
          <div className="w-6 h-6 bg-zinc-400 rounded-sm flex items-center justify-center text-notion-bg text-xs font-bold">M</div>
          <span className="font-semibold text-sm">Moni Workspace</span>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1 text-sm text-zinc-400">
          <button className="w-full flex items-center gap-3 px-2 py-1.5 rounded-md bg-notion-hover text-zinc-200"><LayoutDashboard size={18} />Dashboard</button>
          <button className="w-full flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-notion-hover hover:text-zinc-200 transition-colors"><List size={18} />Wishlist</button>
          <button className="w-full flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-notion-hover hover:text-zinc-200 transition-colors"><Wallet size={18} />Transacciones</button>
          <button className="w-full flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-notion-hover hover:text-zinc-200 transition-colors"><Settings size={18} />Configuración</button>
        </nav>
        <div className="p-4 border-t border-notion-border">
          <button className="w-full flex items-center gap-2 bg-[#2EA043] text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[#3FB950] transition-colors"><Plus size={16} />Nueva Entrada</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto pb-20 md:pb-0">
        {/* HEADER */}
        <header className="px-4 md:px-12 py-6 flex items-center gap-4 md:gap-8 max-w-5xl mx-auto w-full">
          <button className="md:hidden text-zinc-400 hover:text-zinc-200"><Menu size={24} /></button>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight">Moni</h1>
          <div className="flex items-center gap-2 bg-notion-sidebar border border-notion-border px-3 py-1.5 rounded-md flex-1 max-w-md focus-within:border-zinc-500 transition-colors ml-auto md:ml-0">
            <Search size={18} className="text-zinc-500" />
            <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm w-full placeholder-zinc-500 text-zinc-200" />
          </div>
        </header>

        <div className="px-4 md:px-12 max-w-5xl w-full mx-auto">
          {/* HEADER DEL DASHBOARD Y FILTRO GLOBAL */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <p className="hidden md:block text-zinc-400 text-sm">An editorial approach to tracking assets and daily trade executions.</p>

            <div className="flex bg-zinc-900/80 p-1 rounded-xl border border-zinc-800/50 self-start sm:self-auto shadow-sm">
              {[
                { id: 'week', label: 'Semana' },
                { id: 'month', label: 'Mes' },
                { id: 'all', label: 'Todo' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleFilterChange(tab.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${timeFilter === tab.id
                    ? "bg-zinc-800 text-zinc-100 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* GRID DE ESTADÍSTICAS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Balance"
              value={formatCurrency(stats.total_balance)}
              icon={Wallet}
              type="neutral"
              subtitle="ACTUAL"
            />
            <StatCard
              title="Income"
              value={"+" + formatCurrency(summary.income)}
              icon={ArrowUpRight}
              type="income"
              subtitle={filterLabels[timeFilter]}
            />
            <StatCard
              title="Outcome"
              value={"-" + formatCurrency(summary.outcome)}
              icon={ArrowDownRight}
              type="outcome"
              subtitle={filterLabels[timeFilter]}
            />
            <StatCard
              title="Flujo Neto"
              value={netFlowPrefix + formatCurrency(netFlow)}
              icon={NetFlowIcon}
              type={netFlowType}
              subtitle={filterLabels[timeFilter]}
            />
          </div>

          {/* PASAMOS LOS PROPS DE FECHA Y NAVEGACIÓN A LA TABLA */}
          <TransactionTable
            currentRange={currentRange}
            timeFilter={timeFilter}
            onNext={navigateNext}
            onPrev={navigatePrev}
            onRefresh={() => { fetchStats(); fetchSummary(currentRange); }}
          />
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-notion-sidebar border-t border-notion-border flex justify-around items-center py-3 px-2 z-50">
        {/* Nav móvil */}
      </nav>
    </div>
  )
}

export default App;