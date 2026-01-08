import { motion } from 'framer-motion';
import { ProtectedDoctorRoute } from '../../components/doctor/ProtectedDoctorRoute';
import { DoctorLayout } from '../../components/doctor/DoctorLayout';
import { useActiveEncounters, useEncounters } from '../../hooks/useEncounters';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { CardSkeleton } from '../../components/ui/skeleton';
import { EncounterStatus } from '../../types';

const statusVariant: Record<EncounterStatus, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  [EncounterStatus.PLANNED]: 'info',
  [EncounterStatus.IN_PROGRESS]: 'warning',
  [EncounterStatus.COMPLETED]: 'success',
  [EncounterStatus.CANCELLED]: 'error',
};

const DoctorDashboardPage = () => {
  const { data: activeData, isLoading: loadingActive } = useActiveEncounters();
  const { data: recentData, isLoading: loadingRecent } = useEncounters({ page: 1, limit: 3 });

  const activeVisits = activeData?.data || [];
  const recentVisits = recentData?.data?.items || [];
  const totalVisits = recentData?.data?.total || 0;

  const navigate = (path: string) => {
    window.location.href = path;
  };

  return (
    <ProtectedDoctorRoute>
      <DoctorLayout>
        <div className="p-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500">Welcome back, Doctor</p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white">
                <CardContent className="py-6">
                  <p className="text-purple-100 text-sm">Active Visits</p>
                  <p className="text-3xl font-bold mt-1">{loadingActive ? '...' : activeVisits.length}</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-gradient-to-br from-purple-600 to-purple-800 text-white">
                <CardContent className="py-6">
                  <p className="text-purple-100 text-sm">Total Visits</p>
                  <p className="text-3xl font-bold mt-1">{loadingRecent ? '...' : totalVisits}</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-gradient-to-br from-purple-700 to-purple-900 text-white cursor-pointer hover:shadow-lg" onClick={() => navigate('/doctor/visits?new=true')}>
                <CardContent className="py-6 flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Quick Action</p>
                    <p className="text-xl font-bold mt-1">New Visit</p>
                  </div>
                  <svg className="w-8 h-8 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Active Visits */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <h2 className="font-semibold text-gray-900">Active Visits</h2>
                  <button onClick={() => navigate('/doctor/visits')} className="text-sm text-purple-600 hover:underline">
                    View All
                  </button>
                </CardHeader>
                <CardContent>
                  {loadingActive ? (
                    <div className="space-y-4">
                      <CardSkeleton />
                      <CardSkeleton />
                    </div>
                  ) : activeVisits.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No active visits</p>
                  ) : (
                    <div className="space-y-3">
                      {activeVisits.slice(0, 3).map((visit) => (
                        <div
                          key={visit.id}
                          onClick={() => navigate(`/doctor/visits/${visit.id}`)}
                          className="p-4 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{visit.patient?.firstName} {visit.patient?.lastName}</span>
                            <Badge variant={statusVariant[visit.status]}>{visit.status.replace('_', ' ')}</Badge>
                          </div>
                          <p className="text-sm text-gray-500">{visit.chiefComplaint || visit.reasonForVisit || 'No complaint recorded'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Visits */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <h2 className="font-semibold text-gray-900">Recent Visits</h2>
                  <button onClick={() => navigate('/doctor/visits')} className="text-sm text-purple-600 hover:underline">
                    View All
                  </button>
                </CardHeader>
                <CardContent>
                  {loadingRecent ? (
                    <div className="space-y-4">
                      <CardSkeleton />
                      <CardSkeleton />
                    </div>
                  ) : recentVisits.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No visits yet</p>
                  ) : (
                    <div className="space-y-3">
                      {recentVisits.map((visit) => (
                        <div
                          key={visit.id}
                          onClick={() => navigate(`/doctor/visits/${visit.id}`)}
                          className="p-4 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{visit.patient?.firstName} {visit.patient?.lastName}</span>
                            <Badge variant={statusVariant[visit.status]}>{visit.status.replace('_', ' ')}</Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            {visit.encounterType.replace('_', ' ')} • {new Date(visit.encounterDate).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </DoctorLayout>
    </ProtectedDoctorRoute>
  );
};

export default DoctorDashboardPage;
