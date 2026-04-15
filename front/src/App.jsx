import { Search, Wallet, LayoutDashboard, Settings, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { TransactionTable } from './components/TransactionTable';
import { StatCard } from './components/StatCard';

function App() {
  return (
    <div className="flex h-screen bg-notion-bg text-notion-text font-sans">

      {/* SIDEBAR */}
      <aside className="w-64 bg-notion-sidebar border-r border-notion-border flex flex-col">
        <div className="p-4 flex items-center gap-2 cursor-pointer border-b border-notion-border hover:bg-notion-hover transition-colors">
          <div className="w-6 h-6 bg-zinc-400 rounded-sm flex items-center justify-center text-notion-bg text-xs font-bold">
            M
          </div>
          <span className="font-semibold text-sm">Moni Workspace</span>
        </div>

        {/* Cambiado de text-gray-400 a text-zinc-400 */}
        <nav className="flex-1 px-2 py-4 space-y-1 text-sm text-zinc-400">
          <button className="w-full flex items-center gap-3 px-2 py-1.5 rounded-md bg-notion-hover text-zinc-200">
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-notion-hover hover:text-zinc-200 transition-colors">
            <Wallet size={18} />
            Transacciones
          </button>
          <button className="w-full flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-notion-hover hover:text-zinc-200 transition-colors">
            <Settings size={18} />
            Configuración
          </button>
        </nav>

        <div className="p-4 border-t border-notion-border">
          <button className="w-full flex items-center gap-2 bg-[#2EA043] text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[#3FB950] transition-colors">
            <Plus size={16} />
            Nueva Entrada
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col">

        {/* HEADER: Reducido el padding de py-8 a py-6 y text-4xl a text-3xl */}
        <header className="px-12 py-6 flex items-center gap-8 max-w-5xl">
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Moni</h1>

          {/* SEARCH BAR */}
          <div className="flex items-center gap-2 bg-notion-sidebar border border-notion-border px-3 py-1.5 rounded-md flex-1 max-w-md focus-within:border-zinc-500 transition-colors">
            <Search size={18} className="text-zinc-500" />
            <input
              type="text"
              placeholder="Search transactions..."
              className="bg-transparent border-none outline-none text-sm w-full placeholder-zinc-500 text-zinc-200"
            />
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="px-12 max-w-5xl w-full">
          <p className="text-zinc-400 text-sm mb-8">
            An editorial approach to tracking assets and daily trade executions.
          </p>

          {/* Debajo del párrafo de descripción y ANTES de <TransactionTable /> */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatCard
              title="Total Balance"
              value="$1,240.50"
              icon={Wallet}
              type="neutral"
            />
            <StatCard
              title="Income"
              value="+$3,450.00"
              icon={ArrowUpRight}
              type="income"
            />
            <StatCard
              title="Outcome"
              value="-$2,209.50"
              icon={ArrowDownRight}
              type="outcome"
            />
          </div>

          <TransactionTable />

        </div>

      </main>
    </div>
  )
}

export default App;