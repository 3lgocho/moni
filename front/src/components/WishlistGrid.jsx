import { useState, useMemo } from 'react';
import { Plus, SortDescIcon } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import { WishlistCard } from './WishlistCard';

export function WishlistGrid() {
    const { wishlist, toggleComprado, deleteItem, addItem, editItem } = useWishlist();

    const [visibleCount, setVisibleCount] = useState(10);
    const [isAdding, setIsAdding] = useState(false);

    // NUEVO: Estado para controlar el tipo de orden
    const [sortBy, setSortBy] = useState('priority'); // 'priority' | 'price'

    const pendientes = wishlist.filter(item => !item.comprado);

    // NUEVO: Lógica para ordenar las tarjetas
    const sortedPendientes = useMemo(() => {
        const priorityWeight = { alta: 3, media: 2, baja: 1 };

        return [...pendientes].sort((a, b) => {
            if (sortBy === 'priority') {
                // Si tienen la misma prioridad, desempata ordenando por precio (mayor a menor)
                if (priorityWeight[b.prioridad] === priorityWeight[a.prioridad]) {
                    return b.precio_usd - a.precio_usd;
                }
                // Orden principal: Prioridad (alta > media > baja)
                return priorityWeight[b.prioridad] - priorityWeight[a.prioridad];
            } else {
                // Orden principal: Precio (mayor a menor)
                return b.precio_usd - a.precio_usd;
            }
        });
    }, [pendientes, sortBy]);

    const pendientesVisibles = sortedPendientes.slice(0, visibleCount);
    const comprados = wishlist.filter(item => item.comprado);

    const handleSaveNew = (newItem) => {
        addItem(newItem);
        setIsAdding(false);
    };

    const toggleSort = () => {
        setSortBy(prev => prev === 'priority' ? 'price' : 'priority');
    };

    return (
        <div className="flex flex-col gap-2 w-full">

            <div className="flex items-center justify-between mb-2 group rounded">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-zinc-100">Mi Wishlist</h2>
                    <span className="text-sm font-semibold text-zinc-500 bg-notion-sidebar border border-notion-border px-2 py-0.5 rounded-full">
                        {pendientes.length} Pendientes
                    </span>
                </div>
                <div className="flex items-center justify-end">
                    <button
                        onClick={toggleSort}
                        className={`transition-all p-1 ${sortBy === 'price' ? 'text-[#4ADE80]' : 'text-zinc-500 hover:text-zinc-200'}`}
                        title={sortBy === 'priority' ? 'Cambiar a orden por Precio' : 'Cambiar a orden por Prioridad'}>
                        <SortDescIcon size={20} />
                    </button>
                    <button
                        className="text-zinc-500 hover:text-zinc-200 transition-all p-1"
                        title="Añadir nuevo ítem" onClick={() => setIsAdding(true)}>
                        <Plus size={20} />
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                {pendientesVisibles.map(item => (
                    <WishlistCard
                        key={item.id}
                        item={item}
                        onToggle={toggleComprado}
                        onDelete={deleteItem}
                        onEdit={editItem} />
                ))}

                {/* MOVIMOS LA TARJETA VACÍA AQUÍ ABAJO */}
                {isAdding && (
                    <WishlistCard
                        isNew={true}
                        onSaveNew={handleSaveNew}
                        onCancelNew={() => setIsAdding(false)}
                    />
                )}

                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full flex items-center gap-2 text-zinc-500 hover:text-[#4ADE80] font-medium p-3 rounded-lg border border-transparent hover:border-notion-border/50 hover:bg-notion-hover/30 transition-all">
                    <Plus size={18} />
                    <span>Añadir nuevo deseo</span>
                </button>
            </div>

            {pendientes.length > visibleCount && (
                <button
                    onClick={() => setVisibleCount(prev => prev + 10)}
                    className="w-full py-2 text-sm text-zinc-500 hover:text-zinc-300 font-medium border border-transparent hover:border-notion-border rounded transition-colors"
                >
                    Cargar {pendientes.length - visibleCount} más...
                </button>
            )}

            {comprados.length > 0 && (
                <div className="mt-2 pt-2 border-t border-notion-border/50">
                    <h3 className="text-sm font-semibold text-zinc-500 mb-3 px-1">Completados</h3>
                    <div className="flex flex-col gap-3">
                        {comprados.map(item => (
                            <WishlistCard
                                key={item.id}
                                item={item}
                                onToggle={toggleComprado}
                                onDelete={deleteItem}
                                onEdit={editItem}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}