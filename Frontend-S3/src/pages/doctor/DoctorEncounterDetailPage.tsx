import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ProtectedDoctorRoute } from '../../components/doctor/ProtectedDoctorRoute';
import { DoctorLayout } from '../../components/doctor/DoctorLayout';
import { useEncounter, useStartEncounter, useCompleteEncounter } from '../../hooks/useEncounters';
import { useEncounterMedicalRecord, useCreateMedicalRecord } from '../../hooks/useMedicalRecords';
import { MedicalRecordForm } from '../../components/doctor/MedicalRecordForm';
import { VitalSignsPanel } from '../../components/doctor/VitalSignsPanel';
import { AllergyList } from '../../components/doctor/AllergyList';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { FormSkeleton, Skeleton } from '../../components/ui/skeleton';
import { EncounterStatus } from '../../types';

const statusVariant: Record<EncounterStatus, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  [EncounterStatus.PLANNED]: 'info',
  [EncounterStatus.IN_PROGRESS]: 'warning',
  [EncounterStatus.COMPLETED]: 'success',
  [EncounterStatus.CANCELLED]: 'error',
};

const DoctorEncounterDetailPage = () => {
  const [encounterId, setEncounterId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'record' | 'vitals' | 'allergies'>('record');

  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    if (id) setEncounterId(id);
  }, []);

  const { data: encounterData, isLoading: loadingEncounter } = useEncounter(encounterId);
  const { data: recordData, isLoading: loadingRecord } = useEncounterMedicalRecord(encounterId);
  const createMedicalRecord = useCreateMedicalRecord();
  const startEncounter = useStartEncounter();
  const completeEncounter = useCompleteEncounter();

  const encounter = encounterData?.data;
  const medicalRecord = recordData?.data;

  const handleCreateRecord = async () => {
    if (!encounter) return;
    await createMedicalRecord.mutateAsync({
      patientId: encounter.patientId,
      encounterId: encounter.id,
    });
  };

  const handleStartEncounter = async () => {
    if (!encounter) return;
    await startEncounter.mutateAsync(encounter.id);
  };

  const handleCompleteEncounter = async () => {
    if (!encounter) return;
    await completeEncounter.mutateAsync(encounter.id);
  };

  if (loadingEncounter) {
    return (
      <ProtectedDoctorRoute>
        <DoctorLayout>
          <div className="p-8">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-4 w-48 mb-8" />
            <FormSkeleton />
          </div>
        </DoctorLayout>
      </ProtectedDoctorRoute>
    );
  }

  if (!encounter) {
    return (
      <ProtectedDoctorRoute>
        <DoctorLayout>
          <div className="p-8 text-center">
            <h1 className="text-xl font-bold text-gray-900 mb-2">Visit not found</h1>
            <button onClick={() => window.location.href = '/doctor/visits'} className="text-purple-600 hover:underline">
              Back to Visits
            </button>
          </div>
        </DoctorLayout>
      </ProtectedDoctorRoute>
    );
  }

  const tabs = [
    { key: 'record', label: 'Medical Record' },
    { key: 'vitals', label: 'Vital Signs' },
    { key: 'allergies', label: 'Allergies' },
  ];

  return (
    <ProtectedDoctorRoute>
      <DoctorLayout>
        <div className="p-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <button onClick={() => window.location.href = '/doctor/visits'} className="text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Visits
            </button>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {encounter.patient?.firstName} {encounter.patient?.lastName}
                  </h1>
                  <Badge variant={statusVariant[encounter.status]}>{encounter.status.replace('_', ' ')}</Badge>
                </div>
                <p className="text-gray-500">
                  {encounter.encounterType.replace('_', ' ')} • {new Date(encounter.encounterDate).toLocaleDateString()}
                </p>
                {encounter.chiefComplaint && (
                  <p className="text-gray-600 mt-1">Chief Complaint: {encounter.chiefComplaint}</p>
                )}
              </div>
              <div className="flex gap-2">
                {encounter.status === EncounterStatus.PLANNED && (
                  <button
                    onClick={handleStartEncounter}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Start Visit
                  </button>
                )}
                {encounter.status === EncounterStatus.IN_PROGRESS && (
                  <button
                    onClick={handleCompleteEncounter}
                    className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800"
                  >
                    Complete Visit
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex gap-8">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {activeTab === 'record' && (
              <Card>
                <CardHeader>
                  <h2 className="font-semibold text-gray-900">Medical Record</h2>
                </CardHeader>
                <CardContent>
                  {loadingRecord ? (
                    <FormSkeleton />
                  ) : medicalRecord ? (
                    <MedicalRecordForm
                      record={medicalRecord}
                      patientId={encounter.patientId}
                      encounterId={encounter.id}
                      encounterStatus={encounter.status}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">No medical record for this visit yet</p>
                      {encounter.status === EncounterStatus.IN_PROGRESS ? (
                        <button
                          onClick={handleCreateRecord}
                          disabled={createMedicalRecord.isPending}
                          className="px-6 py-3 bg-[#1a0b2e] text-white rounded-full hover:bg-[#2a1b3e] disabled:opacity-50"
                        >
                          {createMedicalRecord.isPending ? 'Creating...' : 'Create Medical Record'}
                        </button>
                      ) : (
                        <p className="text-sm text-gray-400 italic">
                          {encounter.status === EncounterStatus.PLANNED 
                            ? 'Start the visit to create a medical record' 
                            : 'Visit completed'}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'vitals' && (
              <VitalSignsPanel patientId={encounter.patientId} encounterId={encounter.id} encounterStatus={encounter.status} />
            )}

            {activeTab === 'allergies' && (
              <AllergyList patientId={encounter.patientId} encounterStatus={encounter.status} />
            )}
          </motion.div>
        </div>
      </DoctorLayout>
    </ProtectedDoctorRoute>
  );
};

export default DoctorEncounterDetailPage;
