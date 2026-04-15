import React, { useState } from 'react';

export const StatCard = ({ title, value, icon: Icon, type, initialTab = "Month" }) => {
    const [activeTab, setActiveTab] = useState(initialTab);

    const iconColor =
        type === 'income' ? 'text-emerald-500' :
            type === 'outcome' ? 'text-red-500' :
                'text-zinc-400';

    return (
        <div className="bg-[#1c1c1c]/50 border border-zinc-800/50 rounded-2xl p-5 flex flex-col gap-6 transition-all hover:bg-[#1c1c1c] w-full">

            {/* Header: Icono + Título a la izquierda, Tabs a la derecha */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-400">
                    <Icon size={18} className={iconColor} />
                    <span className="text-sm font-medium whitespace-nowrap">{title}</span>
                </div>

                {/* Selector de tiempo compacto */}
                <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-zinc-800/30">
                    {["Week", "Month", "Year"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${activeTab === tab
                                ? "bg-zinc-800 text-zinc-100 shadow-sm"
                                : "text-zinc-500 hover:text-zinc-400"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Valores e info inferior */}
            <div className="flex flex-col gap-1">
                <span className="text-3xl font-bold text-zinc-100 tracking-tight">
                    {value}
                </span>
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                    TOTAL {activeTab}
                </span>
            </div>
        </div>
    );
};