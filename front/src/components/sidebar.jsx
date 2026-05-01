import { LayoutDashboard, List, Wallet, Settings, Plus } from 'lucide-react';

export function Sidebar({ activeTab, setActiveTab }) {
    return (
        <aside className="hidden md:flex w-64 bg-notion-sidebar border-r border-notion-border flex-col shrink-0">
            <div className="p-4 flex items-center gap-2 cursor-pointer border-b border-notion-border hover:bg-notion-hover transition-colors">
                <div className="w-6 h-6 bg-zinc-400 rounded-sm flex items-center justify-center text-notion-bg text-xs font-bold">M</div>
                <span className="font-semibold text-sm">Moni Workspace</span>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1 text-sm text-zinc-400">
                {/* 3. Conectamos los botones para cambiar el activeTab */}
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`w-full flex items-center gap-3 px-2 py-1.5 rounded-md transition-colors ${activeTab === 'dashboard' ? 'bg-notion-hover text-zinc-200' : 'hover:bg-notion-hover hover:text-zinc-200'}`}
                >
                    <LayoutDashboard size={18} />Dashboard
                </button>
                <button
                    onClick={() => setActiveTab('wishlist')}
                    className={`w-full flex items-center gap-3 px-2 py-1.5 rounded-md transition-colors ${activeTab === 'wishlist' ? 'bg-notion-hover text-zinc-200' : 'hover:bg-notion-hover hover:text-zinc-200'}`}
                >
                    <List size={18} />Wishlist
                </button>
                <button className="w-full flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-notion-hover hover:text-zinc-200 transition-colors">
                    <Wallet size={18} />Transacciones
                </button>
                <button className="w-full flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-notion-hover hover:text-zinc-200 transition-colors">
                    <Settings size={18} />Configuración
                </button>
            </nav>
            <div className="p-4 border-t border-notion-border">
                <button className="w-full flex items-center gap-2 bg-[#2EA043] text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-[#3FB950] transition-colors"><Plus size={16} />Nueva Entrada</button>
            </div>
        </aside>
    );
}