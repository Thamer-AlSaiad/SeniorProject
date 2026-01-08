import { useState, useCallback, FormEvent } from 'react';
import { useCreateMedicalRecord, useUpdateMedicalRecord, useFinalizeMedicalRecord } from '../../hooks/useMedicalRecords';
import { Button } from '../ui/button';
import { RealtimeVoiceRecorder } from './RealtimeVoiceRecorder';
import { CreateMedicalRecordDto, MedicalRecord, EncounterStatus } from '../../types';

interface MedicalRecordFormProps {
  record?: MedicalRecord;
  patientId: string;
  encounterId?: string;
  encounterStatus?: EncounterStatus;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const fields = [
  { key: 'presentComplaint', label: 'Present Complaint' },
  { key: 'historyOfPresentingComplaint', label: 'History of Presenting Complaint' },
  { key: 'pastMedicalHistory', label: 'Past Medical History' },
  { key: 'pastSurgicalHistory', label: 'Past Surgical History' },
  { key: 'drugHistory', label: 'Drug History' },
  { key: 'familyHistory', label: 'Family History' },
  { key: 'socialHistory', label: 'Social History' },
  { key: 'assessment', label: 'Assessment' },
  { key: 'plan', label: 'Plan' },
  { key: 'additionalNotes', label: 'Additional Notes' },
] as const;

export const MedicalRecordForm = ({ record, patientId, encounterId, encounterStatus, onSuccess, onCancel }: MedicalRecordFormProps) => {
  const [formData, setFormData] = useState<Partial<CreateMedicalRecordDto>>({
    patientId: record?.patientId || patientId,
    encounterId: record?.encounterId || encounterId,
    presentComplaint: record?.presentComplaint || '',
    historyOfPresentingComplaint: record?.historyOfPresentingComplaint || '',
    pastMedicalHistory: record?.pastMedicalHistory || '',
    pastSurgicalHistory: record?.pastSurgicalHistory || '',
    drugHistory: record?.drugHistory || '',
    familyHistory: record?.familyHistory || '',
    socialHistory: record?.socialHistory || '',
    assessment: record?.assessment || '',
    plan: record?.plan || '',
    additionalNotes: record?.additionalNotes || '',
  });

  const [activeField, setActiveField] = useState<string | null>(null);

  const createRecord = useCreateMedicalRecord();
  const updateRecord = useUpdateMedicalRecord();
  const finalizeRecord = useFinalizeMedicalRecord();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      if (record) {
        // For update, exclude patientId and encounterId
        const { patientId: _, encounterId: __, ...updateData } = formData;
        await updateRecord.mutateAsync({ id: record.id, data: updateData });
      } else {
        await createRecord.mutateAsync(formData as CreateMedicalRecordDto);
      }
      onSuccess?.();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleFinalize = async () => {
    if (!record) return;
    if (confirm('Finalize this medical record? This action cannot be undone.')) {
      await finalizeRecord.mutateAsync(record.id);
      onSuccess?.();
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTranscription = useCallback((field: string, text: string, isFinal: boolean) => {
    setFormData((prev) => {
      // For real-time updates, replace the text; for final, append
      if (isFinal) {
        const existing = prev[field as keyof CreateMedicalRecordDto] as string || '';
        return { ...prev, [field]: existing ? `${existing} ${text}` : text };
      }
      // During recording, show live transcription
      return { ...prev, [field]: text };
    });
  }, []);

  const isLoading = createRecord.isPending || updateRecord.isPending || finalizeRecord.isPending;
  const isFinalized = record?.isFinalized;
  
  // Only allow editing when visit is in progress
  const canEdit = encounterStatus === EncounterStatus.IN_PROGRESS && !isFinalized;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isFinalized && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-purple-700">
          This medical record has been finalized and cannot be edited.
        </div>
      )}
      
      {!canEdit && !isFinalized && encounterStatus && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-600">
          {encounterStatus === EncounterStatus.PLANNED 
            ? 'Start the visit to edit the medical record' 
            : 'Visit completed - medical record is read-only'}
        </div>
      )}

      {fields.map(({ key, label }) => (
        <div key={key} className="relative">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-600">{label}</label>
            {canEdit && (
              <RealtimeVoiceRecorder
                onTranscription={(text, isFinal) => handleTranscription(key, text, isFinal)}
              />
            )}
          </div>
          <textarea
            value={(formData[key as keyof CreateMedicalRecordDto] as string) || ''}
            onChange={(e) => handleChange(key, e.target.value)}
            onFocus={() => setActiveField(key)}
            onBlur={() => setActiveField(null)}
            disabled={!canEdit}
            rows={3}
            className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-200 resize-none ${
              activeField === key ? 'border-purple-400' : 'border-gray-300'
            } ${!canEdit ? 'bg-gray-50' : ''}`}
            placeholder={`Enter ${label.toLowerCase()}...`}
          />
        </div>
      ))}

      {canEdit && (
        <div className="flex gap-3 pt-4">
          <Button type="submit" loading={isLoading}>
            {record ? 'Update Record' : 'Create Record'}
          </Button>
          {record && (
            <button
              type="button"
              onClick={handleFinalize}
              disabled={isLoading}
              className="px-8 py-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
            >
              Finalize
            </button>
          )}
          {onCancel && (
            <button type="button" onClick={onCancel} className="px-8 py-3 rounded-full border border-gray-300 hover:bg-gray-50">
              Cancel
            </button>
          )}
        </div>
      )}
    </form>
  );
};
