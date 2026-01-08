import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePatientAllergies, useDeleteAllergy } from '../../hooks/useAllergies';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { ListSkeleton } from '../ui/skeleton';
import { Modal } from '../ui/modal';
import { AllergyForm } from './AllergyForm';
import { Allergy, AllergySeverity, EncounterStatus } from '../../types';

interface AllergyListProps {
  patientId: string;
  showInactive?: boolean;
  encounterStatus?: EncounterStatus;
}

const severityVariant: Record<AllergySeverity, 'default' | 'success' | 'warning' | 'error'> = {
  [AllergySeverity.MILD]: 'default',
  [AllergySeverity.MODERATE]: 'warning',
  [AllergySeverity.SEVERE]: 'error',
  [AllergySeverity.LIFE_THREATENING]: 'error',
};

export const AllergyList = ({ patientId, showInactive = false, encounterStatus }: AllergyListProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingAllergy, setEditingAllergy] = useState<Allergy | null>(null);
  
  const { data, isLoading, error } = usePatientAllergies(patientId, !showInactive);
  const deleteAllergy = useDeleteAllergy();

  // Only allow editing when visit is in progress
  const canEdit = encounterStatus === EncounterStatus.IN_PROGRESS;

  if (isLoading) return <ListSkeleton count={3} />;
  if (error) return <div className="text-red-500 text-center py-4">Failed to load allergies</div>;

  const allergies = data?.data || [];

  const handleDelete = async (id: string) => {
    if (confirm('Delete this allergy record?')) {
      await deleteAllergy.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-gray-900">Allergies</h3>
        {canEdit && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 text-sm bg-[#1a0b2e] text-white rounded-lg hover:bg-[#2a1b3e]"
          >
            Add Allergy
          </button>
        )}
      </div>
      
      {!canEdit && encounterStatus && (
        <p className="text-sm text-gray-500 italic">
          {encounterStatus === EncounterStatus.PLANNED 
            ? 'Start the visit to manage allergies' 
            : 'Visit completed - allergies are read-only'}
        </p>
      )}

      {allergies.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No allergies recorded</div>
      ) : (
        allergies.map((allergy, index) => (
          <motion.div
            key={allergy.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={!allergy.isActive ? 'opacity-60' : ''}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{allergy.allergen}</span>
                    <Badge variant={severityVariant[allergy.severity]}>
                      {allergy.severity.replace('_', ' ')}
                    </Badge>
                    <Badge variant="info">{allergy.allergyType}</Badge>
                    {!allergy.isActive && <Badge variant="default">Inactive</Badge>}
                  </div>
                  {allergy.reaction && (
                    <p className="text-sm text-gray-600">Reaction: {allergy.reaction}</p>
                  )}
                </div>
                {canEdit && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingAllergy(allergy)}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(allergy.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))
      )}

      <Modal isOpen={showForm || !!editingAllergy} onClose={() => { setShowForm(false); setEditingAllergy(null); }} title={editingAllergy ? 'Edit Allergy' : 'Add Allergy'}>
        <AllergyForm
          allergy={editingAllergy || undefined}
          patientId={patientId}
          onSuccess={() => { setShowForm(false); setEditingAllergy(null); }}
          onCancel={() => { setShowForm(false); setEditingAllergy(null); }}
        />
      </Modal>
    </div>
  );
};
