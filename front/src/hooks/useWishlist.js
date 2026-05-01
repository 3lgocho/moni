import { useState, useEffect, useCallback } from 'react';

// Ajusta el puerto si tu backend corre en otro
const API_URL = 'http://127.0.0.1:3000/api/wishlist';

export function useWishlist() {
    const [wishlist, setWishlist] = useState([]);

    // 1. CARGAR DATOS (GET)
    const fetchWishlist = useCallback(async () => {
        try {
            const res = await fetch(API_URL);
            if (res.ok) {
                const data = await res.json();
                setWishlist(data);
            }
        } catch (error) {
            console.error("Error cargando wishlist:", error);
        }
    }, []);

    // Se ejecuta al montar el componente
    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    // 2. AGREGAR ÍTEM (POST)
    const addItem = async (newItem) => {
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem)
            });

            if (res.ok) {
                // El backend nos devuelve la tarjeta con el ID real de BD y el Nombre scrapeado
                const savedItem = await res.json();
                setWishlist(prev => [savedItem, ...prev]);
            } else {
                console.error("Error del servidor al agregar el ítem");
            }
        } catch (error) {
            console.error("Error de red agregando a wishlist:", error);
        }
    };

    // 3. EDITAR ÍTEM (PUT)
    const editItem = async (id, updatedFields) => {
        // Optimistic UI: Actualizamos el front al instante para que se sienta rápido
        setWishlist(prev => prev.map(item =>
            item.id === id ? { ...item, ...updatedFields } : item
        ));

        try {
            await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedFields)
            });
        } catch (error) {
            console.error("Error editando wishlist:", error);
        }
    };

    // 4. MARCAR COMPRADO (PATCH)
    const toggleComprado = async (id) => {
        const itemToToggle = wishlist.find(i => i.id === id);
        if (!itemToToggle) return;

        const newStatus = !itemToToggle.comprado;

        // Optimistic UI
        setWishlist(prev => prev.map(item =>
            item.id === id ? { ...item, comprado: newStatus } : item
        ));

        try {
            await fetch(`${API_URL}/${id}/toggle`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comprado: newStatus })
            });
        } catch (error) {
            console.error("Error actualizando estado:", error);
        }
    };

    // 5. ELIMINAR ÍTEM (DELETE)
    const deleteItem = async (id) => {
        // Optimistic UI
        setWishlist(prev => prev.filter(item => item.id !== id));

        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error("Error eliminando de wishlist:", error);
        }
    };

    return { wishlist, toggleComprado, deleteItem, addItem, editItem };
}