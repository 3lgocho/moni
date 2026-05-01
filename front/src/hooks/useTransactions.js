import { useState, useEffect, useCallback } from 'react';

export function useTransactions(currentRange, timeFilter, onRefresh) {
    const [transactions, setTransactions] = useState([]);
    const [page, setPage] = useState(0);
    const [isScraping, setIsScraping] = useState(false);
    const limit = 10;

    const fetchTransactions = useCallback(() => {
        let url = `http://127.0.0.1:3000/api/transactions?limit=${limit}&offset=${page * limit}`;

        if (currentRange && currentRange.start) {
            url += `&start_date=${currentRange.start}&end_date=${currentRange.end}`;
        }

        fetch(url)
            .then(response => response.json())
            .then(data => {
                setTransactions(data);
            })
            .catch(error => console.error("Error conectando al backend:", error));
    }, [page, currentRange, limit]);

    // Reiniciar la paginación a 0 si cambiamos el rango de fechas
    useEffect(() => {
        setPage(0);
    }, [currentRange, timeFilter]);

    // Hacer fetch cuando cambie la página o el rango
    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    // Lógica para el botón de actualizar (scraper en Rust)
    const handleActualizar = async () => {
        setIsScraping(true);
        try {
            await fetch('http://127.0.0.1:3000/api/scrape', { method: 'POST' });
            fetchTransactions();
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error("Error ejecutando scraper:", error);
        } finally {
            setIsScraping(false);
        }
    };

    return {
        transactions,
        page,
        setPage,
        limit,
        isScraping,
        handleActualizar
    };
}