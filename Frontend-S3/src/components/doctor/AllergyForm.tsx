import { useState, FormEvent, useCallback } from 'react';
import { useCreateAllergy, useUpdateAllergy } from '../../hooks/useAllergies';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { RealtimeVoiceRecorder } from './RealtimeVoiceRecorder';
import { CreateAllergyDto, Allergy, AllergyType, AllergySeverity } from '../../types';

interface AllergyFormProps {
  allergy?: Allergy;
  patientId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AllergyForm = ({ allergy, patientId, onSuccess, onCancel }: AllergyFormProps) => {
  const [formData, setFormData] = useState<Partial<CreateAllergyDto>>({
    patientId: allergy?.patientId || patientId,
    allergyType: allergy?.allergyType || AllergyType.DRUG,
    allergen: allergy?.allergen || '',
    severity: allergy?.severity || AllergySeverity.MILD,
    reaction: allergy?.reaction || '',
    onsetDate: allergy?.onsetDate?.split('T')[0] || '',
    notes: allergy?.notes || '',
  });

  const createAllergy = useCreateAllergy();
  const updateAllergy = useUpdateAllergy();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      if (allergy) {
        await updateAllergy.mutateAsync({ id: allergy.id, data: formData });
      } else {
        await createAllergy.mutateAsync(formData as CreateAllergyDto);
      }
      onSuccess?.();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleChange = (field: keyof CreateAllergyDto, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTranscription = useCallback((field: keyof CreateAllergyDto, text: string, isFinal: boolean) => {
    setFormData((prev) => {
      if (isFinal) {
        const existing = (prev[field] as string) || '';
        return { ...prev, [field]: existing ? `${existing} ${text}` : text };
      }
      return { ...prev, [field]: text };
    });
  }, []);

  const isLoading = createAllergy.isPending || updateAllergy.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm text-gray-600">Allergy Type</label>
        <select
          value={formData.allergyType}
          onChange={(e) => handleChange('allergyType', e.target.value)}
          className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
        >
          <option value={AllergyType.DRUG}>Drug</option>
          <option value={AllergyType.FOOD}>Food</option>
          <option value={AllergyType.ENVIRONMENTAL}>Environmental</option>
          <option value={AllergyType.OTHER}>Other</option>
        </select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-600">Allergen</label>
          <RealtimeVoiceRecorder onTranscription={(text, isFinal) => handleTranscription('allergen', text, isFinal)} />
        </div>
        <input
          type="text"
          value={formData.allergen}
          onChange={(e) => handleChange('allergen', e.target.value)}
          placeholder="e.g., Penicillin, Peanuts"
          className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-600">Severity</label>
        <select
          value={formData.severity}
          onChange={(e) => handleChange('severity', e.target.value)}
          className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
        >
          <option value={AllergySeverity.MILD}>Mild</option>
          <option value={AllergySeverity.MODERATE}>Moderate</option>
          <option value={AllergySeverity.SEVERE}>Severe</option>
          <option value={AllergySeverity.LIFE_THREATENING}>Life Threatening</option>
        </select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-600">Reaction</label>
          <RealtimeVoiceRecorder onTranscription={(text, isFinal) => handleTranscription('reaction', text, isFinal)} />
        </div>
        <input
          type="text"
          value={formData.reaction}
          onChange={(e) => handleChange('reaction', e.target.value)}
          placeholder="Describe the allergic reaction"
          className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
        />
      </div>

      <Input
        label="Onset Date"
        type="date"
        value={formData.onsetDate}
        onChange={(e) => handleChange('onsetDate', e.target.value)}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-600">Notes</label>
          <RealtimeVoiceRecorder onTranscription={(text, isFinal) => handleTranscription('notes', text, isFinal)} />
        </div>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Additional notes"
          rows={2}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={isLoading}>
          {allergy ? 'Update' : 'Add Allergy'}
        </Button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-6 py-3 rounded-full border border-gray-300 hover:bg-gray-50">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};
