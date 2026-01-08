import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ProtectedDoctorRoute } from '../../components/doctor/ProtectedDoctorRoute';
import { DoctorLayout } from '../../components/doctor/DoctorLayout';
import { usePatientEncounters } from '../../hooks/useEncounters';
import { AllergyList } from '../../components/doctor/AllergyList';
import { EncounterForm } from '../../components/doctor/EncounterForm';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Modal } from '../../components/ui/modal';
import { ListSkeleton } from '../../components/ui/skeleton';
import { EncounterStatus, Patient } from '../../types';
import { patientService } from '../../services/patientService';

const statusVariant: Record<EncounterStatus, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  [EncounterStatus.PLANNED]: 'info',
  [EncounterStatus.IN_PROGRESS]: 'warning',
  [EncounterStatus.COMPLETED]: 'success',
  [EncounterStatus.CANCELLED]: 'error',
};

const DoctorPatientDetailPage = () => {
  const [patientId, setPatientId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'visits' | 'allergies'>('visits');
  const [showNewVisit, setShowNewVisit] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    if (id) setPatientId(id);
  }, []);

  const { data: encountersData, isLoading: loadingEncounters } = usePatientEncounters(patientId);

  const encounters = encountersData?.data || [];

  // Fetch patient info directly
  useEffect(() => {
    if (patientId) {
      patientService.getById(patientId).then((res) => {
        if (res.data) setPatient(res.data);
      }).catch(console.error);
    }
  }, [patientId]);

  const tabs = [
    { key: 'visits', label: 'Visits', count: encounters.length },
    { key: 'allergies', label: 'Allergies' },
  ];

  return (
    <ProtectedDoctorRoute>
      <DoctorLayout>
        <div className="p-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <button onClick={() => window.location.href = '/doctor/patients'} className="text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Patients
            </button>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xl font-semibold">
                  {patient ? `${patient.firstName?.[0] || ''}${patient.lastName?.[0] || ''}` : '?'}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {patient ? `${patient.firstName} ${patient.lastName}` : 'Loading...'}
                  </h1>
                  {patient && <p className="text-gray-500">{patient.email}</p>}
                  {patient?.phoneNumber && <p className="text-gray-400 text-sm">{patient.phoneNumber}</p>}
                </div>
              </div>
              <button
                onClick={() => setShowNewVisit(true)}
                className="px-6 py-3 bg-[#1a0b2e] text-white rounded-full hover:bg-[#2a1b3e] flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Visit
              </button>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex gap-8">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === tab.key
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="px-2 py-0.5 text-xs bg-gray-100 rounded-full">{tab.count}</span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {activeTab === 'visits' && (
              loadingEncounters ? (
                <ListSkeleton count={3} />
              ) : encounters.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No visits found</div>
              ) : (
                <div className="space-y-4">
                  {encounters.map((encounter) => (
                    <div key={encounter.id}>
                      <Card
                        onClick={() => window.location.href = `/doctor/visits/${encounter.id}`}
                        className="hover:border-purple-200 cursor-pointer"
                      >
                        <CardContent className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{encounter.encounterType.replace('_', ' ')}</span>
                              <Badge variant={statusVariant[encounter.status]}>{encounter.status.replace('_', ' ')}</Badge>
                            </div>
                            <p className="text-sm text-gray-500">{new Date(encounter.encounterDate).toLocaleDateString()}</p>
                            {encounter.chiefComplaint && (
                              <p className="text-sm text-gray-600 mt-1">{encounter.chiefComplaint}</p>
                            )}
                          </div>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              )
            )}

            {activeTab === 'allergies' && patientId && (
              <AllergyList patientId={patientId} />
            )}
          </motion.div>

          <Modal isOpen={showNewVisit} onClose={() => setShowNewVisit(false)} title="New Visit" size="lg">
            <EncounterForm
              patientId={patientId}
              onSuccess={() => setShowNewVisit(false)}
              onCancel={() => setShowNewVisit(false)}
            />
          </Modal>
        </div>
      </DoctorLayout>
    </ProtectedDoctorRoute>
  );
};

export default DoctorPatientDetailPage;
