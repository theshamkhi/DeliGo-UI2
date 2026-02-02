import React from 'react';
import './Pagination.css';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalElements: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
                                                          currentPage,
                                                          totalPages,
                                                          pageSize,
                                                          totalElements,
                                                          onPageChange,
                                                          onPageSizeChange,
                                                      }) => {
    const startItem = currentPage * pageSize + 1;
    const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 0; i < totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(0);

            if (currentPage > 2) {
                pages.push('...');
            }

            const start = Math.max(1, currentPage - 1);
            const end = Math.min(totalPages - 2, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 3) {
                pages.push('...');
            }

            pages.push(totalPages - 1);
        }

        return pages;
    };

    return (
        <div className="pagination-container">
            <div className="pagination-info">
                Affichage de {startItem} à {endItem} sur {totalElements} éléments
            </div>

            <div className="pagination-controls">
                <button
                    className="pagination-button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                >
                    Précédent
                </button>

                {getPageNumbers().map((page, index) =>
                        page === '...' ? (
                            <span key={`ellipsis-${index}`} className="pagination-ellipsis">
              ...
            </span>
                        ) : (
                            <button
                                key={page}
                                className={`pagination-button ${
                                    page === currentPage ? 'pagination-button-active' : ''
                                }`}
                                onClick={() => onPageChange(page as number)}
                            >
                                {(page as number) + 1}
                            </button>
                        )
                )}

                <button
                    className="pagination-button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                >
                    Suivant
                </button>
            </div>

            {onPageSizeChange && (
                <div className="pagination-size">
                    <label htmlFor="page-size">Éléments par page:</label>
                    <select
                        id="page-size"
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="pagination-size-select"
                    >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                </div>
            )}
        </div>
    );
};