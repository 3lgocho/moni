import { useState } from 'react';
import { ExternalLink, Target, Link as LinkIcon } from 'lucide-react';

export function WishlistTable() {
    // Datos mockeados para visualizar la estructura. Luego lo conectamos al backend.
    const [wishlist, setWishlist] = useState([
        {
            id: 1,
            producto: "Intel i7-2670QM (Sandy Bridge)",
            url: "https://es.aliexpress.com/item/...",
            monto: 35.50,
            prioridad: "Alta",
            dependencia: "Laptop VIT M2420"
        },
        {
            id: 2,
            producto: "MikroTik hEX RB750Gr3",
            url: null,
            monto: 60.00,
            prioridad: "Media",
            dependencia: "Multi-WAN Failover"
        }
    ]);

    const renderPrioridad = (prioridad) => {
        const p = prioridad?.toLowerCase();
        const styles = {
            'alta': 'bg-[#3C2E2E] text-[#F87171]',
            'media': 'bg-[#3C382E] text-[#FBBF24]',
            'baja': 'bg-[#2E363C] text-[#60A5FA]'
        };
        return (
            <span className={`px-2 py-0.5 rounded text-xs font-semibold tracking-wider ${styles[p] || 'bg-gray-700'}`}>
                {prioridad.toUpperCase()}
            </span>
        );
    };

    return (
        <div className="mt-8 border border-notion-border rounded-lg bg-notion-bg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-notion-border">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Target size={18} className="text-gray-400" />
                    Wishlist & Proyectos
                </h2>
                <button className="bg-[#2EA043] hover:bg-[#3FB950] text-white text-sm font-medium px-3 py-1.5 rounded-md transition-colors">
                    + Añadir Item
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
                    <thead>
                        <tr className="text-gray-400 text-sm border-b border-notion-border bg-notion-sidebar/50">
                            <th className="px-4 py-3 font-medium">📦 Producto</th>
                            <th className="px-4 py-3 font-medium"># Monto (USD)</th>
                            <th className="px-4 py-3 font-medium">⚡ Prioridad</th>
                            <th className="px-4 py-3 font-medium">🔗 Dependencia</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-notion-border">
                        {wishlist.length === 0 ? (
                            <tr><td colSpan="4" className="text-center py-8 text-gray-500">No hay elementos en la Wishlist</td></tr>
                        ) : (
                            wishlist.map((item) => (
                                <tr key={item.id} className="hover:bg-notion-hover/50 transition-colors">
                                    <td className="px-4 py-3 flex items-center gap-2 text-gray-200 font-medium">
                                        {item.producto}
                                        {item.url && (
                                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
                                                <ExternalLink size={14} />
                                            </a>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-gray-300 font-mono">${item.monto.toFixed(2)}</td>
                                    <td className="px-4 py-3">{renderPrioridad(item.prioridad)}</td>
                                    <td className="px-4 py-3 text-gray-400 flex items-center gap-2">
                                        <LinkIcon size={14} />
                                        {item.dependencia || "Ninguna"}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}