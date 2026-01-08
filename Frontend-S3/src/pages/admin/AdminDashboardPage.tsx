import { motion } from 'framer-motion';
import { ProtectedAdminRoute } from '../../components/admin/ProtectedAdminRoute';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { useOrganizations } from '../../hooks/useOrganizations';
import { useDoctorManagement } from '../../hooks/useDoctorManagement';

const AdminDashboardPage = () => {
  const { data: orgsData, isLoading: loadingOrgs } = useOrganizations({ page: 1, limit: 3 });
  const { data: doctorsData, isLoading: loadingDoctors } = useDoctorManagement({ page: 1, limit: 3 });

  const organizations = orgsData?.data?.items || [];
  const totalOrgs = orgsData?.data?.total || 0;
  const doctors = doctorsData?.data?.items || [];
  const totalDoctors = doctorsData?.data?.total || 0;

  const activeDoctors = doctors.filter((d: any) => !d.isSuspended).length;
  const activeOrgs = organizations.filter((o: any) => o.isActive).length;

  const navigate = (path: string) => {
    window.location.href = path;
  };

  return (
    <ProtectedAdminRoute>
      <AdminLayout>
        <div className="p-8 min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#1a0b2e]">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-purple-300 mt-1">Overview of your medical clinic system</p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-white/10 border-purple-500/30 hover:bg-white/15 transition-all">
                <CardContent className="py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-300 text-sm font-medium">Total Organizations</p>
                      <p className="text-3xl font-bold text-white mt-1">{loadingOrgs ? '...' : totalOrgs}</p>
                      <p className="text-xs text-green-400 mt-1">{activeOrgs} active</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/30 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-white/10 border-purple-500/30 hover:bg-white/15 transition-all">
                <CardContent className="py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-300 text-sm font-medium">Total Doctors</p>
                      <p className="text-3xl font-bold text-white mt-1">{loadingDoctors ? '...' : totalDoctors}</p>
                      <p className="text-xs text-green-400 mt-1">{activeDoctors} active</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/30 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/admin/organizations?new=true')}
                className="flex items-center gap-4 p-4 bg-white/10 rounded-xl border border-purple-500/30 hover:border-purple-400 hover:bg-white/15 transition-all group"
              >
                <div className="w-10 h-10 bg-purple-500/30 rounded-lg flex items-center justify-center group-hover:bg-purple-500/50 transition-colors">
                  <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-white">Add Organization</p>
                  <p className="text-sm text-purple-300">Create a new clinic</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/admin/doctors?new=true')}
                className="flex items-center gap-4 p-4 bg-white/10 rounded-xl border border-purple-500/30 hover:border-purple-400 hover:bg-white/15 transition-all group"
              >
                <div className="w-10 h-10 bg-purple-500/30 rounded-lg flex items-center justify-center group-hover:bg-purple-500/50 transition-colors">
                  <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-white">Add Doctor</p>
                  <p className="text-sm text-purple-300">Register a new doctor</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/admin/organizations')}
                className="flex items-center gap-4 p-4 bg-white/10 rounded-xl border border-purple-500/30 hover:border-purple-400 hover:bg-white/15 transition-all group"
              >
                <div className="w-10 h-10 bg-purple-500/30 rounded-lg flex items-center justify-center group-hover:bg-purple-500/50 transition-colors">
                  <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-white">Manage All</p>
                  <p className="text-sm text-purple-300">View all records</p>
                </div>
              </button>
            </div>
          </motion.div>

          {/* Recent Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Organizations */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
              <Card className="bg-white/10 border-purple-500/30">
                <CardHeader className="flex flex-row items-center justify-between border-b border-purple-500/20 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <h2 className="font-semibold text-white">Recent Organizations</h2>
                  </div>
                  <button onClick={() => navigate('/admin/organizations')} className="text-sm text-purple-300 hover:text-white font-medium">
                    View All →
                  </button>
                </CardHeader>
                <CardContent className="pt-4">
                  {loadingOrgs ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                    </div>
                  ) : organizations.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <p className="text-purple-300">No organizations yet</p>
                      <button onClick={() => navigate('/admin/organizations?new=true')} className="mt-2 text-sm text-purple-400 hover:text-white">
                        Add your first organization
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {organizations.map((org: any) => (
                        <div
                          key={org.id}
                          onClick={() => navigate(`/admin/organizations/${org.id}`)}
                          className="p-4 rounded-xl border border-purple-500/20 hover:border-purple-400 hover:bg-white/5 cursor-pointer transition-all"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-purple-500/30 rounded-lg flex items-center justify-center">
                                <span className="text-purple-300 font-semibold">{org.name?.charAt(0) || 'O'}</span>
                              </div>
                              <span className="font-medium text-white">{org.name}</span>
                            </div>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${org.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {org.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-sm text-purple-400 ml-13">{org.code || 'No code assigned'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Doctors */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
              <Card className="bg-white/10 border-purple-500/30">
                <CardHeader className="flex flex-row items-center justify-between border-b border-purple-500/20 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <h2 className="font-semibold text-white">Recent Doctors</h2>
                  </div>
                  <button onClick={() => navigate('/admin/doctors')} className="text-sm text-purple-300 hover:text-white font-medium">
                    View All →
                  </button>
                </CardHeader>
                <CardContent className="pt-4">
                  {loadingDoctors ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                    </div>
                  ) : doctors.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-purple-300">No doctors yet</p>
                      <button onClick={() => navigate('/admin/doctors?new=true')} className="mt-2 text-sm text-purple-400 hover:text-white">
                        Add your first doctor
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {doctors.map((doctor: any) => (
                        <div
                          key={doctor.id}
                          onClick={() => navigate(`/admin/doctors/${doctor.id}`)}
                          className="p-4 rounded-xl border border-purple-500/20 hover:border-purple-400 hover:bg-white/5 cursor-pointer transition-all"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-purple-500/30 rounded-lg flex items-center justify-center">
                                <span className="text-purple-300 font-semibold">{doctor.firstName?.charAt(0) || 'D'}</span>
                              </div>
                              <span className="font-medium text-white">Dr. {doctor.firstName} {doctor.lastName}</span>
                            </div>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${doctor.isSuspended ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                              {doctor.isSuspended ? 'Suspended' : 'Active'}
                            </span>
                          </div>
                          <p className="text-sm text-purple-400 ml-13">{doctor.specialization || 'General'} • {doctor.email}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedAdminRoute>
  );
};

export default AdminDashboardPage;
