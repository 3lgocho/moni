import { useState } from 'react';
import { CheckCircle, Circle, MoreVertical, Edit2, Trash2, Check, X } from 'lucide-react'; // Eliminamos ExternalLink, agregamos iconos de edición

export function WishlistCard({ item, onToggle, onDelete, onEdit, isNew, onSaveNew, onCancelNew }) {
    // === ESTADOS PARA LA EDICIÓN ===
    const [isEditing, setIsEditing] = useState(isNew || false);
    const [nombre, setNombre] = useState(item?.nombre || '');
    const [precio, setPrecio] = useState(item?.precio_usd || '');
    const [prioridad, setPrioridad] = useState(item?.prioridad || 'media');
    const [showMenu, setShowMenu] = useState(false);

    const priorityStyles = {
        alta: 'bg-[#3C2E2E] text-[#F87171]',
        media: 'bg-[#3C382E] text-[#FBBF24]',
        baja: 'bg-[#2E363C] text-[#60A5FA]'
    };

    // === LÓGICA DE GUARDADO ===
    const handleSave = () => {
        if (!nombre.trim()) return;
        const data = { nombre, precio_usd: parseFloat(precio) || 0, prioridad };

        if (isNew) {
            onSaveNew(data);
        } else {
            onEdit(item.id, data);
            setIsEditing(false);
        }
    };

    if (isEditing) {
        return (
            <div className="p-1 rounded-lg border bg-notion-sidebar border-zinc-500 shadow-lg flex flex-col gap-2 relative z-10">
                {/* Input Nombre/Link */}
                <div className="flex items-center gap-2">
                    <Circle size={18} className="text-zinc-600 shrink-0" />
                    <input
                        autoFocus
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Nombre del deseo o Link (http://...)"
                        className="w-full bg-transparent text-zinc-100 font-semibold outline-none border-b border-zinc-700 focus:border-zinc-400 placeholder:text-zinc-600 text-sm pb-1"
                    />
                </div>

                {/* Inputs Precio, Prioridad y Botones */}
                <div className="flex items-center gap-3 ml-[26px]">
                    <span className="text-[#4ADE80] font-bold text-sm">$</span>
                    <input
                        type="number"
                        value={precio}
                        onChange={(e) => setPrecio(e.target.value)}
                        placeholder="0.00"
                        className="w-20 bg-transparent text-[#4ADE80] font-bold outline-none border-b border-zinc-700 focus:border-[#4ADE80] text-sm pb-1"
                    />

                    <select
                        value={prioridad}
                        onChange={(e) => setPrioridad(e.target.value)}
                        className={`text-[10px] font-bold tracking-wider uppercase rounded px-1 cursor-pointer outline-none ${priorityStyles[prioridad]}`}
                    >
                        <option value="alta" className="bg-zinc-900 text-[#F87171]">ALTA</option>
                        <option value="media" className="bg-zinc-900 text-[#FBBF24]">MEDIA</option>
                        <option value="baja" className="bg-zinc-900 text-[#60A5FA]">BAJA</option>
                    </select>

                    <div className="ml-auto flex items-center gap-2">
                        <button onClick={handleSave} className="p-1 rounded text-green-500 hover:bg-green-500/20 transition-colors"><Check size={16} /></button>
                        <button onClick={() => isNew ? onCancelNew() : setIsEditing(false)} className="p-1 rounded text-red-500 hover:bg-red-500/20 transition-colors"><X size={16} /></button>
                    </div>
                </div>
            </div>
        );
    }

    const isLink = item.nombre.startsWith('http');

    return (
        <div className={`p-3 rounded-lg border transition-all flex flex-col gap-1 ${item.comprado ? 'bg-notion-sidebar/30 border-notion-border/50 opacity-60' : 'bg-notion-sidebar border-notion-border hover:border-zinc-500'}`}>

            {/* LÍNEA 1: Check + Nombre del Producto + [Dots] */}
            <div className="flex items-center justify-between w-full gap-2">

                {/* Lado Izquierdo: Check y Nombre */}
                <div className="flex items-center gap-2 overflow-hidden">
                    <button
                        onClick={() => onToggle(item.id)}
                        className={`shrink-0 transition-colors ${item.comprado ? 'text-[#4ADE80]' : 'text-zinc-500 hover:text-zinc-300'}`}>
                        {item.comprado ? <CheckCircle size={18} /> : <Circle size={18} />}
                    </button>

                    {/* Reemplazamos el h3 estático por nuestra validación del link */}
                    {isLink ? (
                        <a href={item.nombre} target="_blank" rel="noopener noreferrer" className={`font-semibold truncate hover:underline ${item.comprado ? 'line-through text-zinc-500' : 'text-[#60A5FA]'}`}>
                            {item.nombre}
                        </a>
                    ) : (
                        <h3 className={`font-semibold text-zinc-100 truncate ${item.comprado ? 'line-through text-zinc-500' : ''}`}>
                            {item.nombre}
                        </h3>
                    )}
                </div>

                {/* Lado Derecho: Menú (Reemplazó al botón de link externo) */}
                <div className="flex items-center gap-1 shrink-0 text-zinc-500 relative">
                    <button onClick={() => setShowMenu(!showMenu)} className="p-1 hover:text-zinc-200 transition-colors">
                        <MoreVertical size={16} />
                    </button>

                    {/* Menú Desplegable */}
                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
                            <div className="absolute right-0 top-6 w-32 bg-zinc-800 border border-notion-border rounded shadow-xl overflow-hidden z-20 flex flex-col">
                                <button onClick={() => { setIsEditing(true); setShowMenu(false); }} className="px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-700 flex items-center gap-2 transition-colors">
                                    <Edit2 size={14} /> Editar
                                </button>
                                <button onClick={() => { onDelete(item.id); setShowMenu(false); }} className="px-3 py-2 text-left text-sm text-red-400 hover:bg-zinc-700 flex items-center gap-2 transition-colors">
                                    <Trash2 size={14} /> Eliminar
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* LÍNEA 2: Precio + Prioridad */}
            <div className="flex items-center gap-3 ml-[26px]">
                <p className={`text-base font-bold ${item.comprado ? 'text-[#4ADE80]/60' : 'text-[#4ADE80]'}`}>
                    ${Number(item.precio_usd).toFixed(2)}
                </p>
                <span className={`px-2 py-0 rounded text-[10px] font-bold tracking-wider uppercase ${priorityStyles[item.prioridad] || 'bg-gray-700'}`}>
                    {item.prioridad}
                </span>
            </div>

        </div>
    );
}