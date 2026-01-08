import { useState, MouseEvent, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useEncounters, useDeleteEncounter, useStartEncounter, useCompleteEncounter, useCancelEncounter } from '../../hooks/useEncounters';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { ListSkeleton } from '../ui/skeleton';
import { Encounter, EncounterStatus } from '../../types';

interface EncounterListProps {
  onSelect?: (encounter: Encounter) => void;
  patientId?: string;
}

const statusVariant: Record<EncounterStatus, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  [EncounterStatus.PLANNED]: 'info',
  [EncounterStatus.IN_PROGRESS]: 'warning',
  [EncounterStatus.COMPLETED]: 'success',
  [EncounterStatus.CANCELLED]: 'error',
};

export const EncounterList = ({ onSelect, patientId }: EncounterListProps) => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  const { data, isLoading, error } = useEncounters({ 
    page, 
    limit: 10, 
    patientId,
    search: debouncedSearch || undefined 
  });
  const deleteEncounter = useDeleteEncounter();
  const startEncounter = useStartEncounter();
  const completeEncounter = useCompleteEncounter();
  const cancelEncounter = useCancelEncounter();

  if (isLoading) return <ListSkeleton count={5} />;
  if (error) return <div className="text-red-500 text-center py-8">Failed to load encounters</div>;

  const encounters = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;

  const handleAction = async (e: MouseEvent, action: 'start' | 'complete' | 'cancel' | 'delete', id: string) => {
    e.stopPropagation();
    switch (action) {
      case 'start': await startEncounter.mutateAsync(id); break;
      case 'complete': await completeEncounter.mutateAsync(id); break;
      case 'cancel': await cancelEncounter.mutateAsync(id); break;
      case 'delete': if (confirm('Delete this encounter?')) await deleteEncounter.mutateAsync(id); break;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by patient name or reason for visit..."
          className="w-full h-12 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
        />
        <svg 
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {encounters.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {debouncedSearch ? `No visits found for "${debouncedSearch}"` : 'No visits found'}
        </div>
      ) : (
        encounters.map((encounter, index) => (
          <motion.div
            key={encounter.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card onClick={() => onSelect?.(encounter)} className="hover:border-purple-200">
              <CardContent className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-gray-900">
                      {encounter.patient?.firstName} {encounter.patient?.lastName}
                    </h3>
                    <Badge variant={statusVariant[encounter.status]}>
                      {encounter.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    {encounter.encounterType.replace('_', ' ')} • {new Date(encounter.encounterDate).toLocaleDateString()}
                  </p>
                  {encounter.reasonForVisit && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                      <span className="text-gray-500">Reason:</span> {encounter.reasonForVisit}
                    </p>
                  )}
                  {encounter.chiefComplaint && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                      <span className="text-gray-500">Complaint:</span> {encounter.chiefComplaint}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {encounter.status === EncounterStatus.PLANNED && (
                    <button
                      onClick={(e) => handleAction(e, 'start', encounter.id)}
                      className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                    >
                      Start
                    </button>
                  )}
                  {encounter.status === EncounterStatus.IN_PROGRESS && (
                    <button
                      onClick={(e) => handleAction(e, 'complete', encounter.id)}
                      className="px-3 py-1.5 text-sm bg-purple-200 text-purple-800 rounded-lg hover:bg-purple-300"
                    >
                      Complete
                    </button>
                  )}
                  {(encounter.status === EncounterStatus.PLANNED || encounter.status === EncounterStatus.IN_PROGRESS) && (
                    <button
                      onClick={(e) => handleAction(e, 'cancel', encounter.id)}
                      className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={(e) => handleAction(e, 'delete', encounter.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-600">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
