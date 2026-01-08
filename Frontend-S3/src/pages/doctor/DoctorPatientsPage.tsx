import { useState } from 'react';
import { motion } from 'framer-motion';
import { ProtectedDoctorRoute } from '../../components/doctor/ProtectedDoctorRoute';
import { DoctorLayout } from '../../components/doctor/DoctorLayout';
import { usePatients } from '../../hooks/usePatients';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { ListSkeleton } from '../../components/ui/skeleton';

const DoctorPatientsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePatients({ page, limit: 20, search: searchTerm || undefined });

  const patients = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;

  const handleSelectPatient = (patientId: string) => {
    window.location.href = `/doctor/patients/${patientId}`;
  };

  return (
    <ProtectedDoctorRoute>
      <DoctorLayout>
        <div className="p-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
            <p className="text-gray-500">View and manage your patients</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
            <Input
              placeholder="Search patients by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="max-w-md"
            />
          </motion.div>

          {isLoading ? (
            <ListSkeleton count={5} />
          ) : patients.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchTerm ? 'No patients found matching your search' : 'No patients found'}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {patients.map((patient, index) => (
                  <motion.div
                    key={patient.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card onClick={() => handleSelectPatient(patient.id)} className="hover:border-purple-200 cursor-pointer">
                      <CardContent className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
                          {patient.firstName?.[0]}{patient.lastName?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {patient.firstName} {patient.lastName}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">{patient.email}</p>
                          {patient.phoneNumber && (
                            <p className="text-sm text-gray-400">{patient.phoneNumber}</p>
                          )}
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-6">
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
            </>
          )}
        </div>
      </DoctorLayout>
    </ProtectedDoctorRoute>
  );
};

export default DoctorPatientsPage;
