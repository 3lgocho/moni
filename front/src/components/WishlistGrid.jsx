import { useState } from 'react'; // Necesitamos useState para controlar el límite visual
import { Plus } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import { WishlistCard } from './WishlistCard';

export function WishlistGrid() {
    const { wishlist, toggleComprado, deleteItem } = useWishlist();

    const [visibleCount, setVisibleCount] = useState(10);

    // Separamos los pendientes y limitamos la cantidad visible
    const pendientes = wishlist.filter(item => !item.comprado);
    const pendientesVisibles = pendientes.slice(0, visibleCount);

    const comprados = wishlist.filter(item => item.comprado);
    return (
        <div className="mt-6">
            <div className="flex items-center justify-between mb-4 group cursor-pointer">
                {/* Agrupamos Título y Contador a la izquierda */}
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-zinc-100">Mi Wishlist</h2>
                    <span className="text-sm font-medium text-zinc-500 bg-notion-sidebar border border-notion-border px-2 py-0.5 rounded-full">
                        {pendientes.length} pendientes
                    </span>
                </div>

                {/* El botón se va a la derecha */}
                <button
                    className="text-zinc-500 hover:text-zinc-200 transition-all p-1"
                    title="Añadir nuevo ítem"
                    onClick={() => console.log("Abrir modal de creación arriba")}
                >
                    <Plus size={18} />
                </button>
            </div>

            <div className="flex flex-col gap-3">
                {pendientesVisibles.map(item => (
                    <WishlistCard
                        key={item.id}
                        item={item}
                        onToggle={toggleComprado}
                        onDelete={deleteItem}
                    />
                ))}
            </div>

            {/* BOTÓN "CARGAR MÁS" (Paginación visual) */}
            {pendientes.length > visibleCount && (
                <button
                    onClick={() => setVisibleCount(prev => prev + 10)}
                    className="w-full py-2 text-sm text-zinc-500 hover:text-zinc-300 font-medium border border-transparent hover:border-notion-border rounded transition-colors"
                >
                    Cargar {pendientes.length - visibleCount} más...
                </button>
            )}

            <button
                onClick={() => console.log("Abrir modal de creación abajo")}
                className="w-full flex items-center gap-2 text-zinc-500 hover:text-[#4ADE80] font-medium p-3 rounded-lg border border-transparent hover:border-notion-border/50 hover:bg-notion-hover/30 transition-all mt-2"
            >
                <Plus size={18} />
                <span>Añadir nuevo deseo</span>
            </button>

            {/* LISTA DE COMPRADOS (Opcional, los podemos ocultar bajo un acordeón si son muchos luego) */}
            {comprados.length > 0 && (
                <div className="mt-6 pt-6 border-t border-notion-border/50">
                    <h3 className="text-sm font-semibold text-zinc-500 mb-3 px-1">Completados</h3>
                    <div className="flex flex-col gap-3">
                        {comprados.map(item => (
                            <WishlistCard
                                key={item.id}
                                item={item}
                                onToggle={toggleComprado}
                                onDelete={deleteItem}
                            />
                        ))}
                    </div>
                </div>
            )}

            {wishlist.length === 0 && (
                <div className="text-center py-12 border border-dashed border-notion-border rounded-lg">
                    <p className="text-zinc-500">Tu wishlist está vacía.</p>
                </div>
            )}
        </div>
    );
}