import { useState, useEffect } from 'react';

export function useWishlist() {
    const [wishlist, setWishlist] = useState([]);

    // Simulamos la carga de datos del backend
    useEffect(() => {
        const mockData = [
            { id: 1, nombre: "Monitor LG 24'", precio_usd: 120.50, link: "https://amazon.com", prioridad: "alta", comprado: false },
            { id: 2, nombre: "Silla Ergonómica", precio_usd: 85.00, link: null, prioridad: "media", comprado: false },
            { id: 3, nombre: "Teclado Mecánico", precio_usd: 45.00, link: "https://mercadolibre.com.ve", prioridad: "baja", comprado: true },
        ];
        setWishlist(mockData);
    }, []);

    // Funciones placeholder para los botones (se conectarán al backend luego)
    const toggleComprado = (id) => {
        setWishlist(prev => prev.map(item =>
            item.id === id ? { ...item, comprado: !item.comprado } : item
        ));
        // Futuro: fetch(`http://127.0.0.1:3000/api/wishlist/${id}/toggle`, { method: 'PATCH' })
    };

    const deleteItem = (id) => {
        setWishlist(prev => prev.filter(item => item.id !== id));
        // Futuro: fetch(`http://127.0.0.1:3000/api/wishlist/${id}`, { method: 'DELETE' })
    };

    return {
        wishlist,
        toggleComprado,
        deleteItem
    };
}