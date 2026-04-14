import { Search, Wallet, LayoutDashboard, Settings, Plus } from 'lucide-react';

function App() {
  return (
    <div className="flex h-screen bg-notion-bg text-notion-text font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-notion-sidebar border-r border-notion-border flex flex-col">
        <div className="p-4 flex items-center gap-2 cursor-pointer hover:bg-notion-hover transition-colors">
          <div className="w-6 h-6 bg-gray-400 rounded-sm flex items-center justify-center text-notion-bg text-xs font-bold">
            M
          </div>
          <span className="font-semibold text-sm">Moni Workspace</span>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 text-sm text-gray-400">
          <button className="w-full flex items-center gap-3 px-2 py-1.5 rounded-md bg-notion-hover text-gray-200">
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-notion-hover transition-colors">
            <Wallet size={18} />
            Transacciones
          </button>
          <button className="w-full flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-notion-hover transition-colors">
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
        
        {/* HEADER */}
        <header className="px-12 py-8 flex items-center gap-8 max-w-5xl">
          <h1 className="text-4xl font-bold text-white tracking-tight">Moni</h1>
          
          {/* SEARCH BAR (A la altura del título) */}
          <div className="flex items-center gap-2 bg-notion-sidebar border border-notion-border px-3 py-1.5 rounded-md flex-1 max-w-md focus-within:border-gray-500 transition-colors">
            <Search size={18} className="text-gray-500" />
            <input 
              type="text" 
              placeholder="Search transactions..." 
              className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-500 text-gray-200"
            />
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="px-12 max-w-5xl w-full">
          <p className="text-gray-400 text-sm mb-8">
            An editorial approach to tracking assets and daily trade executions.
          </p>
          
          <div className="h-64 border border-dashed border-notion-border rounded-lg flex items-center justify-center text-gray-500">
            [ Área de Widgets Financieros ]
          </div>
        </div>

      </main>
    </div>
  )
}

export default App;