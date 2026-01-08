import { useState, FormEvent, useEffect, useRef, useCallback } from 'react';
import { useCreateEncounter, useUpdateEncounter } from '../../hooks/useEncounters';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { RealtimeVoiceRecorder } from './RealtimeVoiceRecorder';
import { CreateEncounterDto, Encounter, EncounterType, Patient } from '../../types';
import { patientService } from '../../services/patientService';

interface EncounterFormProps {
  encounter?: Encounter;
  patientId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const EncounterForm = ({ encounter, patientId, onSuccess, onCancel }: EncounterFormProps) => {
  const [formData, setFormData] = useState<Partial<CreateEncounterDto>>({
    patientId: encounter?.patientId || patientId || '',
    encounterType: encounter?.encounterType || EncounterType.CONSULTATION,
    encounterDate: encounter?.encounterDate?.split('T')[0] || new Date().toISOString().split('T')[0],
    reasonForVisit: encounter?.reasonForVisit || '',
    chiefComplaint: encounter?.chiefComplaint || '',
    location: encounter?.location || '',
    notes: encounter?.notes || '',
  });

  // Patient search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const createEncounter = useCreateEncounter();
  const updateEncounter = useUpdateEncounter();

  // Search patients when query changes
  useEffect(() => {
    const searchPatients = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        const result = await patientService.getAll({ search: searchQuery, limit: 10 });
        setSearchResults(result.data?.items || []);
      } catch (error) {
        console.error('Failed to search patients:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchPatients, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setFormData((prev) => ({ ...prev, patientId: patient.id }));
    setSearchQuery(`${patient.firstName} ${patient.lastName}`);
    setShowDropdown(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientId) {
      return;
    }
    
    try {
      if (encounter) {
        await updateEncounter.mutateAsync({ id: encounter.id, data: formData });
      } else {
        await createEncounter.mutateAsync(formData as CreateEncounterDto);
      }
      onSuccess?.();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleChange = (field: keyof CreateEncounterDto, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTranscription = useCallback((field: keyof CreateEncounterDto, text: string, isFinal: boolean) => {
    setFormData((prev) => {
      if (isFinal) {
        const existing = (prev[field] as string) || '';
        return { ...prev, [field]: existing ? `${existing} ${text}` : text };
      }
      return { ...prev, [field]: text };
    });
  }, []);

  const isLoading = createEncounter.isPending || updateEncounter.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!patientId && !encounter && (
        <div className="space-y-2" ref={searchRef}>
          <label className="text-sm text-gray-600">Patient</label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
                if (!e.target.value) {
                  setSelectedPatient(null);
                  setFormData((prev) => ({ ...prev, patientId: '' }));
                }
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search patient by name..."
              className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="w-5 h-5 animate-spin text-purple-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            )}
            
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                {searchResults.map((patient) => (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => handleSelectPatient(patient)}
                    className="w-full px-4 py-3 text-left hover:bg-purple-50 flex items-center gap-3 border-b border-gray-100 last:border-0"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium">
                      {patient.firstName?.[0]}{patient.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{patient.firstName} {patient.lastName}</p>
                      <p className="text-sm text-gray-500">{patient.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {showDropdown && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
                No patients found
              </div>
            )}
          </div>
          {selectedPatient && (
            <p className="text-sm text-purple-600">Selected: {selectedPatient.firstName} {selectedPatient.lastName}</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm text-gray-600">Encounter Type</label>
        <select
          value={formData.encounterType}
          onChange={(e) => handleChange('encounterType', e.target.value)}
          className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
        >
          <option value={EncounterType.CONSULTATION}>Consultation</option>
          <option value={EncounterType.FOLLOW_UP}>Follow Up</option>
          <option value={EncounterType.EMERGENCY}>Emergency</option>
          <option value={EncounterType.ROUTINE_CHECKUP}>Routine Checkup</option>
          <option value={EncounterType.PROCEDURE}>Procedure</option>
        </select>
      </div>

      <Input
        label="Encounter Date"
        type="date"
        value={formData.encounterDate}
        onChange={(e) => handleChange('encounterDate', e.target.value)}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-600">Reason for Visit</label>
          <RealtimeVoiceRecorder onTranscription={(text, isFinal) => handleTranscription('reasonForVisit', text, isFinal)} />
        </div>
        <input
          type="text"
          value={formData.reasonForVisit}
          onChange={(e) => handleChange('reasonForVisit', e.target.value)}
          placeholder="Brief reason for the visit"
          className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-600">Chief Complaint</label>
          <RealtimeVoiceRecorder onTranscription={(text, isFinal) => handleTranscription('chiefComplaint', text, isFinal)} />
        </div>
        <textarea
          value={formData.chiefComplaint}
          onChange={(e) => handleChange('chiefComplaint', e.target.value)}
          placeholder="Patient's main complaint"
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 resize-none"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-600">Location</label>
          <RealtimeVoiceRecorder onTranscription={(text, isFinal) => handleTranscription('location', text, isFinal)} />
        </div>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => handleChange('location', e.target.value)}
          placeholder="Clinic, Room number, etc."
          className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-600">Notes</label>
          <RealtimeVoiceRecorder onTranscription={(text, isFinal) => handleTranscription('notes', text, isFinal)} />
        </div>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Additional notes"
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 resize-none"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" loading={isLoading} disabled={!formData.patientId && !patientId && !encounter}>
          {encounter ? 'Update Encounter' : 'Create Encounter'}
        </Button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-8 py-3 rounded-full border border-gray-300 hover:bg-gray-50">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};
