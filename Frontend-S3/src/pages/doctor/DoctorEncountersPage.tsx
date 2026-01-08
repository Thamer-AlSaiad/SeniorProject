import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ProtectedDoctorRoute } from '../../components/doctor/ProtectedDoctorRoute';
import { DoctorLayout } from '../../components/doctor/DoctorLayout';
import { EncounterList } from '../../components/doctor/EncounterList';
import { EncounterForm } from '../../components/doctor/EncounterForm';
import { Modal } from '../../components/ui/modal';
import { Encounter } from '../../types';

const DoctorEncountersPage = () => {
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedEncounter, setSelectedEncounter] = useState<Encounter | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('new') === 'true') {
      setShowNewForm(true);
    }
  }, []);

  const handleSelectEncounter = (encounter: Encounter) => {
    window.location.href = `/doctor/visits/${encounter.id}`;
  };

  return (
    <ProtectedDoctorRoute>
      <DoctorLayout>
        <div className="p-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Visits</h1>
              <p className="text-gray-500">Manage patient visits</p>
            </div>
            <button
              onClick={() => setShowNewForm(true)}
              className="px-6 py-3 bg-[#1a0b2e] text-white rounded-full hover:bg-[#2a1b3e] transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Visit
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <EncounterList onSelect={handleSelectEncounter} />
          </motion.div>

          <Modal isOpen={showNewForm} onClose={() => setShowNewForm(false)} title="New Visit" size="lg">
            <EncounterForm
              onSuccess={() => setShowNewForm(false)}
              onCancel={() => setShowNewForm(false)}
            />
          </Modal>
        </div>
      </DoctorLayout>
    </ProtectedDoctorRoute>
  );
};

export default DoctorEncountersPage;
