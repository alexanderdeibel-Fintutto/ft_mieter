import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ITEMS_PER_PAGE = 10;

export default function PaginatedSharedDocuments({ documents, renderItem }) {
  const [currentPage, setCurrentPage] = useState(1);

  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(documents.length / ITEMS_PER_PAGE);
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIdx = startIdx + ITEMS_PER_PAGE;
    const currentDocs = documents.slice(startIdx, endIdx);

    return { totalPages, currentDocs, startIdx, endIdx };
  }, [documents, currentPage]);

  if (paginationData.totalPages <= 1) {
    return (
      <div className="space-y-3">
        {paginationData.currentDocs.map((doc, idx) => (
          <div key={idx}>{renderItem(doc)}</div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Items */}
      <div className="space-y-3 mb-4">
        {paginationData.currentDocs.map((doc, idx) => (
          <div key={idx}>{renderItem(doc)}</div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <span className="text-xs text-gray-600">
          {paginationData.startIdx + 1}-{Math.min(paginationData.endIdx, documents.length)} von {documents.length}
        </span>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-1 px-2">
            {Array.from({ length: paginationData.totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-6 h-6 rounded text-xs font-medium transition-colors ${
                  page === currentPage
                    ? 'bg-violet-600 text-white'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(paginationData.totalPages, p + 1))}
            disabled={currentPage === paginationData.totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}