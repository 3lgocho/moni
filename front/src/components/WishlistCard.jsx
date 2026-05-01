import { ExternalLink, CheckCircle, Circle, MoreVertical } from 'lucide-react';

export function WishlistCard({ item, onToggle, onDelete }) {
    const priorityStyles = {
        alta: 'bg-[#3C2E2E] text-[#F87171]',
        media: 'bg-[#3C382E] text-[#FBBF24]',
        baja: 'bg-[#2E363C] text-[#60A5FA]'
    };

    return (
        <div className={`p-3 rounded-lg border transition-all flex flex-col gap-1 ${item.comprado ? 'bg-notion-sidebar/30 border-notion-border/50 opacity-60' : 'bg-notion-sidebar border-notion-border hover:border-zinc-500'}`}>

            {/* LÍNEA 1: Check + Nombre del Producto + [Link] + [Dots] */}
            <div className="flex items-center justify-between w-full gap-2">

                {/* Lado Izquierdo: Check y Nombre */}
                <div className="flex items-center gap-2 overflow-hidden">
                    <button
                        onClick={() => onToggle(item.id)}
                        className={`shrink-0 transition-colors ${item.comprado ? 'text-[#4ADE80]' : 'text-zinc-500 hover:text-zinc-300'}`}>
                        {item.comprado ? <CheckCircle size={18} /> : <Circle size={18} />}
                    </button>
                    <h3 className={`font-semibold text-zinc-100 truncate ${item.comprado ? 'line-through text-zinc-500' : ''}`}>
                        {item.nombre}
                    </h3>
                </div>

                {/* Lado Derecho: Link y Menú */}
                <div className="flex items-center gap-1 shrink-0 text-zinc-500">
                    {item.link && (
                        <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:text-zinc-200 transition-colors"
                            title="Ir a la tienda">
                            <ExternalLink size={16} />
                        </a>
                    )}
                    <button className="p-1 hover:text-zinc-200 transition-colors">
                        <MoreVertical size={16} />
                    </button>
                </div>
            </div>

            {/* LÍNEA 2: Precio + Prioridad */}
            <div className="flex items-center gap-3 ml-[26px]">
                <p className={`text-base font-bold ${item.comprado ? 'text-[#4ADE80]/60' : 'text-[#4ADE80]'}`}>
                    ${item.precio_usd.toFixed(2)}
                </p>
                <span className={`px-2 py-[1px] rounded text-[10px] font-bold tracking-wider uppercase ${priorityStyles[item.prioridad] || 'bg-gray-700'}`}>
                    {item.prioridad}
                </span>
            </div>

        </div>
    );
}