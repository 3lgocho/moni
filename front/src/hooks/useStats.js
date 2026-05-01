import { useState, useEffect, useCallback } from 'react';

const getDateRange = (filter, date) => {
    const d = new Date(date);
    if (filter === 'week') {
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const start = new Date(d.setDate(diff));
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        };
    }
    if (filter === 'month') {
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        };
    }
    return { start: null, end: null };
};

export function useStats() {
    const [stats, setStats] = useState({ total_balance: 0, income_volume: 0, outcome_volume: 0 });
    const [summary, setSummary] = useState({ income: 0, outcome: 0 });

    const [timeFilter, setTimeFilter] = useState('week');
    const [referenceDate, setReferenceDate] = useState(new Date());

    const currentRange = getDateRange(timeFilter, referenceDate);

    const navigateNext = () => {
        const newDate = new Date(referenceDate);
        if (timeFilter === 'week') newDate.setDate(newDate.getDate() + 7);
        else if (timeFilter === 'month') newDate.setMonth(newDate.getMonth() + 1);
        setReferenceDate(newDate);
    };

    const navigatePrev = () => {
        const newDate = new Date(referenceDate);
        if (timeFilter === 'week') newDate.setDate(newDate.getDate() - 7);
        else if (timeFilter === 'month') newDate.setMonth(newDate.getMonth() - 1);
        setReferenceDate(newDate);
    };

    const handleFilterChange = (newFilter) => {
        setTimeFilter(newFilter);
        setReferenceDate(new Date());
    };

    const fetchStats = useCallback(() => {
        fetch('http://127.0.0.1:3000/api/stats')
            .then(r => r.json())
            .then(data => setStats(data))
            .catch(e => console.error("Error stats:", e));
    }, []);

    const fetchSummary = useCallback((range) => {
        const url = range.start
            ? `http://127.0.0.1:3000/api/summary?start_date=${range.start}&end_date=${range.end}`
            : `http://127.0.0.1:3000/api/summary?filter=all`;

        fetch(url)
            .then(r => r.json())
            .then(data => setSummary(data))
            .catch(e => console.error("Error summary:", e));
    }, []);

    useEffect(() => {
        fetchSummary(currentRange);
    }, [timeFilter, referenceDate, fetchSummary]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const refreshAll = () => {
        fetchStats();
        fetchSummary(currentRange);
    };

    const netFlow = summary.income - summary.outcome;
    const isPositiveFlow = netFlow >= 0;
    const netFlowType = isPositiveFlow ? 'income' : 'outcome';
    const netFlowPrefix = isPositiveFlow ? "+" : "-";

    return {
        stats,
        summary,
        timeFilter,
        currentRange,
        navigateNext,
        navigatePrev,
        handleFilterChange,
        refreshAll,
        netFlow,
        isPositiveFlow,
        netFlowType,
        netFlowPrefix
    };
}