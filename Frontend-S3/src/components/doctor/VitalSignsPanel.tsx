import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { useEncounterVitalSigns, useCreateVitalSign, useDeleteVitalSign } from '../../hooks/useVitalSigns';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { VitalSignType, CreateVitalSignDto, EncounterStatus } from '../../types';

interface VitalSignsPanelProps {
  patientId: string;
  encounterId: string;
  encounterStatus?: EncounterStatus;
}

const vitalSignConfig: Record<VitalSignType, { label: string; unit: string; hasSecondary?: boolean; secondaryLabel?: string }> = {
  [VitalSignType.BLOOD_PRESSURE]: { label: 'Blood Pressure', unit: 'mmHg', hasSecondary: true, secondaryLabel: 'Diastolic' },
  [VitalSignType.HEART_RATE]: { label: 'Heart Rate', unit: 'bpm' },
  [VitalSignType.TEMPERATURE]: { label: 'Temperature', unit: '°C' },
  [VitalSignType.RESPIRATORY_RATE]: { label: 'Respiratory Rate', unit: '/min' },
  [VitalSignType.OXYGEN_SATURATION]: { label: 'SpO2', unit: '%' },
  [VitalSignType.WEIGHT]: { label: 'Weight', unit: 'kg' },
  [VitalSignType.HEIGHT]: { label: 'Height', unit: 'cm' },
  [VitalSignType.BMI]: { label: 'BMI', unit: 'kg/m²' },
};

export const VitalSignsPanel = ({ patientId, encounterId, encounterStatus }: VitalSignsPanelProps) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateVitalSignDto>>({
    patientId,
    encounterId,
    type: VitalSignType.BLOOD_PRESSURE,
    value: 0,
    secondaryValue: undefined,
    unit: 'mmHg',
  });

  const { data: encounterData, isLoading } = useEncounterVitalSigns(encounterId);
  const createVitalSign = useCreateVitalSign();
  const deleteVitalSign = useDeleteVitalSign();

  const encounterVitals = encounterData?.data || [];
  
  // Only allow editing when visit is in progress
  const canEdit = encounterStatus === EncounterStatus.IN_PROGRESS;
  
  // Build a map of latest vitals for this encounter
  const vitalsByType: Record<string, typeof encounterVitals[0]> = {};
  encounterVitals.forEach((vital) => {
    if (!vitalsByType[vital.type] || new Date(vital.recordedAt) > new Date(vitalsByType[vital.type].recordedAt)) {
      vitalsByType[vital.type] = vital;
    }
  });

  const handleTypeChange = (type: VitalSignType) => {
    setFormData((prev) => ({
      ...prev,
      type,
      unit: vitalSignConfig[type].unit,
      secondaryValue: vitalSignConfig[type].hasSecondary ? prev.secondaryValue : undefined,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createVitalSign.mutateAsync(formData as CreateVitalSignDto);
      setShowForm(false);
      setFormData({ patientId, encounterId, type: VitalSignType.BLOOD_PRESSURE, value: 0, unit: 'mmHg' });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this vital sign?')) {
      await deleteVitalSign.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-gray-900">Vital Signs for this Visit</h3>
        {canEdit && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 text-sm bg-[#1a0b2e] text-white rounded-lg hover:bg-[#2a1b3e]"
          >
            {showForm ? 'Cancel' : 'Record Vitals'}
          </button>
        )}
      </div>
      
      {!canEdit && encounterStatus && (
        <p className="text-sm text-gray-500 italic">
          {encounterStatus === EncounterStatus.PLANNED 
            ? 'Start the visit to record vital signs' 
            : 'Visit completed - vital signs are read-only'}
        </p>
      )}

      {showForm && canEdit && (
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-600">Vital Sign Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleTypeChange(e.target.value as VitalSignType)}
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
                >
                  {Object.entries(vitalSignConfig).map(([type, config]) => (
                    <option key={type} value={type}>{config.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={vitalSignConfig[formData.type!].hasSecondary ? 'Systolic' : 'Value'}
                  type="number"
                  value={formData.value?.toString() || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                  placeholder={`Enter value (${vitalSignConfig[formData.type!].unit})`}
                />
                {vitalSignConfig[formData.type!].hasSecondary && (
                  <Input
                    label={vitalSignConfig[formData.type!].secondaryLabel}
                    type="number"
                    value={formData.secondaryValue?.toString() || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, secondaryValue: parseFloat(e.target.value) || undefined }))}
                    placeholder="Enter value"
                  />
                )}
              </div>

              <Button type="submit" loading={createVitalSign.isPending}>
                Record
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Vitals Grid for this Visit */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <Card>
                <CardContent className="py-3">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-16" />
                </CardContent>
              </Card>
            </div>
          ))
        ) : (
          Object.entries(vitalSignConfig).map(([type, config]) => {
            const vital = vitalsByType[type];
            return (
              <motion.div key={type} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card>
                  <CardContent className="py-3">
                    <p className="text-xs text-gray-500 mb-1">{config.label}</p>
                    {vital ? (
                      <p className="text-lg font-semibold text-gray-900">
                        {config.hasSecondary && vital.secondaryValue
                          ? `${vital.value}/${vital.secondaryValue}`
                          : vital.value}
                        <span className="text-sm font-normal text-gray-500 ml-1">{config.unit}</span>
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400">--</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Vitals History for this Visit */}
      {encounterVitals.length > 0 && (
        <Card>
          <CardHeader>
            <h4 className="font-medium text-gray-900">Vitals History</h4>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {encounterVitals.map((vital) => (
                <div key={vital.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <span className="font-medium">{vitalSignConfig[vital.type].label}: </span>
                    <span>
                      {vitalSignConfig[vital.type].hasSecondary && vital.secondaryValue
                        ? `${vital.value}/${vital.secondaryValue}`
                        : vital.value}
                      {' '}{vital.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {new Date(vital.recordedAt).toLocaleTimeString()}
                    </span>
                    {canEdit && (
                      <button
                        onClick={() => handleDelete(vital.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
