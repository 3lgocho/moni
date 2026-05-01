export function TimeFilter({ timeFilter, onFilterChange }) { // 1. Recibimos onFilterChange
    return (
        <div className="flex bg-zinc-900/80 p-1 rounded-xl border border-zinc-800/50 self-start sm:self-auto shadow-sm">
            {[
                { id: 'week', label: 'Semana' },
                { id: 'month', label: 'Mes' },
                { id: 'all', label: 'Todo' }
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onFilterChange(tab.id)}
                    className={`px-3 py-2 text-sm font-bold rounded-lg transition-all ${timeFilter === tab.id
                        ? "bg-zinc-800 text-zinc-100 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                        }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}