import React from 'react';

export const StatCard = ({ title, value, icon: Icon, type, subtitle }) => {
    const iconColor =
        type === 'income' ? 'text-emerald-500' :
        type === 'outcome' ? 'text-red-500' :
        'text-zinc-400';

    return (
        <div className="bg-[#1c1c1c]/50 border border-zinc-800/50 rounded-2xl p-5 flex flex-col gap-6 transition-all hover:bg-[#1c1c1c] w-full">
            <div className="flex items-center gap-2 text-zinc-400">
                <Icon size={18} className={iconColor} />
                <span className="text-sm font-medium whitespace-nowrap">{title}</span>
            </div>

            <div className="flex flex-col gap-1">
                <span className="text-3xl font-bold text-zinc-100 tracking-tight">
                    {value}
                </span>
                {subtitle && (
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                        {subtitle}
                    </span>
                )}
            </div>
        </div>
    );
};