import { useState, useCallback } from 'react';

interface UsePaginationProps {
    initialPage?: number;
    initialSize?: number;
}

export const usePagination = ({ initialPage = 0, initialSize = 20 }: UsePaginationProps = {}) => {
    const [page, setPage] = useState(initialPage);
    const [size, setSize] = useState(initialSize);

    const nextPage = useCallback(() => {
        setPage((prev) => prev + 1);
    }, []);

    const prevPage = useCallback(() => {
        setPage((prev) => Math.max(0, prev - 1));
    }, []);

    const goToPage = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const changeSize = useCallback((newSize: number) => {
        setSize(newSize);
        setPage(0); // Reset to first page when changing size
    }, []);

    const reset = useCallback(() => {
        setPage(initialPage);
        setSize(initialSize);
    }, [initialPage, initialSize]);

    return {
        page,
        size,
        nextPage,
        prevPage,
        goToPage,
        changeSize,
        reset,
    };
};