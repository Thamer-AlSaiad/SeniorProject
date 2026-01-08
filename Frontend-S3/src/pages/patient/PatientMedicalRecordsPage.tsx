import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { CardSkeleton } from '../../components/ui/skeleton';
import { MedicalRecordView } from '../../components/patient';
import { usePatientMedicalRecordsPage } from '../../hooks/usePatientMedicalRecords';
import { MedicalRecord, Encounter, Allergy, AllergyType, AllergySeverity } from '../../types';
import { clearAuth } from '../../utils/auth';

const severityVariant: Record<AllergySeverity, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  [AllergySeverity.MILD]: 'info',
  [AllergySeverity.MODERATE]: 'warning',
  [AllergySeverity.SEVERE]: 'error',
  [AllergySeverity.LIFE_THREATENING]: 'error',
};

const PatientMedicalRecordsPage = () => {
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'records' | 'allergies' | 'encounters'>('records');

  const {
    medicalRecords,
    allergies,
    encounters,
    isLoadingRecords,
    isLoadingAllergies,
    isLoadingEncounters,
  } = usePatientMedicalRecordsPage();

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const tabs = [
    { id: 'records', label: 'Medical Records', count: medicalRecords.length },
    { id: 'allergies', label: 'Allergies', count: allergies.length },
    { id: 'encounters', label: 'Visit History', count: encounters.length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#1a0b2e]">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 border-b border-purple-500/20">
        <a href="/" className="text-2xl font-bold text-white">EMR System</a>
        <div className="flex-1 flex justify-center items-center gap-8">
          <a href="/patient/booking" className="text-purple-300 hover:text-white transition-colors">
            Book Appointment
          </a>
          <a href="/patient/appointments" className="text-purple-300 hover:text-white transition-colors">
            My Appointments
          </a>
          <a href="/patient/medical-records" className="text-purple-300 hover:text-white transition-colors">
            Medical Records
          </a>
        </div>
        <div className="flex items-center gap-4">
          <a href="/profile">
            <Button variant="outline" className="border-purple-500 text-purple-300">
              Profile
            </Button>
          </a>
          <Button variant="outline" onClick={handleLogout} className="border-purple-500 text-purple-300">
            Log Out
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">My Medical Records</h1>
          <p className="text-purple-300 mt-1">View your health history and medical information</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex gap-2 border-b border-purple-500/20">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-purple-500/30">
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"
                  />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        {activeTab === 'records' && (
          <motion.div
            key="records"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {isLoadingRecords ? (
              <div className="space-y-4">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : medicalRecords.length === 0 ? (
              <Card className="bg-white/10 border-purple-500/20">
                <CardContent className="py-12 text-center">
                  <p className="text-purple-300 text-lg">No medical records available</p>
                  <p className="text-purple-400 text-sm mt-2">
                    Your medical records will appear here after your visits are completed
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Records List */}
                <div className="space-y-4">
                  {medicalRecords.map((record, idx) => (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card
                        className={`bg-white/10 border-purple-500/20 cursor-pointer transition-all hover:bg-white/15 ${
                          selectedRecord?.id === record.id ? 'ring-2 ring-purple-500' : ''
                        }`}
                        onClick={() => setSelectedRecord(record)}
                      >
                        <CardContent className="py-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-white">
                                {record.encounter?.encounterType?.replace('_', ' ') || 'Medical Record'}
                              </h3>
                              <p className="text-purple-300 text-sm mt-1">
                                Dr. {record.doctor?.firstName} {record.doctor?.lastName}
                              </p>
                              <p className="text-purple-400 text-xs mt-1">
                                {formatDate(record.createdAt)}
                              </p>
                            </div>
                            <Badge variant="success">Finalized</Badge>
                          </div>
                          {record.presentComplaint && (
                            <p className="text-purple-300 text-sm mt-3 line-clamp-2">
                              {record.presentComplaint}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Record Detail */}
                <div className="lg:sticky lg:top-8">
                  {selectedRecord ? (
                    <MedicalRecordView record={selectedRecord} />
                  ) : (
                    <Card className="bg-white/10 border-purple-500/20">
                      <CardContent className="py-12 text-center">
                        <p className="text-purple-300">Select a record to view details</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'allergies' && (
          <motion.div
            key="allergies"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {isLoadingAllergies ? (
              <div className="space-y-4">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : allergies.length === 0 ? (
              <Card className="bg-white/10 border-purple-500/20">
                <CardContent className="py-12 text-center">
                  <p className="text-purple-300 text-lg">No allergies recorded</p>
                  <p className="text-purple-400 text-sm mt-2">
                    Your allergies will be recorded by your healthcare provider
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allergies.map((allergy, idx) => (
                  <motion.div
                    key={allergy.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="bg-white/10 border-purple-500/20">
                      <CardContent className="py-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-white">{allergy.allergen}</h3>
                          <Badge variant={severityVariant[allergy.severity]}>
                            {allergy.severity.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-purple-300 text-sm capitalize">
                          Type: {allergy.allergyType}
                        </p>
                        {allergy.reaction && (
                          <p className="text-purple-400 text-sm mt-2">
                            Reaction: {allergy.reaction}
                          </p>
                        )}
                        {allergy.onsetDate && (
                          <p className="text-purple-400 text-xs mt-2">
                            Since: {formatDate(allergy.onsetDate)}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'encounters' && (
          <motion.div
            key="encounters"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {isLoadingEncounters ? (
              <div className="space-y-4">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : encounters.length === 0 ? (
              <Card className="bg-white/10 border-purple-500/20">
                <CardContent className="py-12 text-center">
                  <p className="text-purple-300 text-lg">No visit history</p>
                  <p className="text-purple-400 text-sm mt-2">
                    Your visit history will appear here after your appointments
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {encounters.map((encounter, idx) => (
                  <motion.div
                    key={encounter.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="bg-white/10 border-purple-500/20">
                      <CardContent className="py-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-white capitalize">
                              {encounter.encounterType.replace('_', ' ')}
                            </h3>
                            <p className="text-purple-300 text-sm mt-1">
                              Dr. {encounter.doctor?.firstName} {encounter.doctor?.lastName}
                            </p>
                            <p className="text-purple-400 text-xs mt-1">
                              {formatDate(encounter.encounterDate)}
                            </p>
                          </div>
                          <Badge
                            variant={
                              encounter.status === 'completed'
                                ? 'success'
                                : encounter.status === 'cancelled'
                                ? 'error'
                                : 'info'
                            }
                          >
                            {encounter.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        {encounter.reasonForVisit && (
                          <p className="text-purple-300 text-sm mt-3">
                            Reason: {encounter.reasonForVisit}
                          </p>
                        )}
                        {encounter.chiefComplaint && (
                          <p className="text-purple-400 text-sm mt-1">
                            Chief Complaint: {encounter.chiefComplaint}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PatientMedicalRecordsPage;
