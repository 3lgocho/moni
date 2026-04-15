import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';

export const StatCard = ({ title, value, icon: Icon, type }) => {
    // Le damos un toque sutil de color al ícono dependiendo de si es ingreso o egreso
    const iconColor =
        type === 'income' ? 'text-green-500' :
            type === 'outcome' ? 'text-red-500' :
                'text-zinc-400';

    return (
        <div className="bg-[#202020] border border-[#2E2E2E] rounded-lg p-5 flex flex-col gap-3 w-full transition-colors hover:bg-[#2c2c2c]/50">
            <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium tracking-wide">
                <Icon size={16} className={iconColor} />
                {title}
            </div>
            <div className="text-3xl font-bold text-zinc-100 tracking-tight">
                {value}
            </div>
        </div>
    );
};