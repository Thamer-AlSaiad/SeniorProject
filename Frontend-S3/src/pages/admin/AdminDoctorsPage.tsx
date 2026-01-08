import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ProtectedAdminRoute } from '../../components/admin/ProtectedAdminRoute';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { DoctorList } from '../../components/admin/DoctorList';
import { DoctorForm } from '../../components/admin/DoctorForm';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Modal } from '../../components/ui/modal';
import { useDoctorManagement, useDoctor } from '../../hooks/useDoctorManagement';
import { useOrganizations } from '../../hooks/useOrganizations';
import { doctorManagementService } from '../../services/doctorManagementService';
import { Doctor, CreateDoctorDto, UpdateDoctorDto } from '../../types';

const AdminDoctorsPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useDoctorManagement({ page, limit: 10, search });
  const { data: selectedDoctorData } = useDoctor(selectedDoctorId || '');
  const { data: orgsData } = useOrganizations({ page: 1, limit: 100 });

  const doctors = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;
  const organizations = orgsData?.data?.items || [];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('new') === 'true') {
      setShowForm(true);
    }
  }, []);

  const handleCreate = async (dto: CreateDoctorDto) => {
    try {
      await doctorManagementService.create(dto);
      toast.success('Doctor created successfully. Welcome email sent.');
      setShowForm(false);
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create doctor');
    }
  };

  const handleUpdate = async (dto: UpdateDoctorDto) => {
    if (!editingDoctor) return;
    try {
      await doctorManagementService.update(editingDoctor.id, dto);
      toast.success('Doctor updated successfully');
      setEditingDoctor(null);
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update doctor');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await doctorManagementService.delete(id);
      toast.success('Doctor deleted successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete doctor');
    }
  };

  const handleAssignOrganization = async (doctorId: string, organizationId: string) => {
    try {
      await doctorManagementService.assignToOrganization(doctorId, organizationId);
      toast.success('Organization updated');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update organization');
    }
  };

  return (
    <ProtectedAdminRoute>
      <AdminLayout>
        <div className="p-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
              <p className="text-gray-500">Manage doctor accounts and assignments</p>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Doctor
            </Button>
          </motion.div>

          <Card>
            <CardHeader>
              <div className="flex gap-4">
                <Input
                  placeholder="Search by name, email, or specialization..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <DoctorList
                doctors={doctors}
                isLoading={isLoading}
                onEdit={setEditingDoctor}
                onDelete={handleDelete}
                onViewDetails={setSelectedDoctorId}
              />
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Create Modal */}
          <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Create Doctor">
            <DoctorForm
              organizations={organizations}
              onSubmit={handleCreate}
              onCancel={() => setShowForm(false)}
            />
          </Modal>

          {/* Edit Modal */}
          <Modal isOpen={!!editingDoctor} onClose={() => setEditingDoctor(null)} title="Edit Doctor">
            {editingDoctor && (
              <DoctorForm
                doctor={editingDoctor}
                organizations={organizations}
                onSubmit={handleUpdate}
                onCancel={() => setEditingDoctor(null)}
                onAssignOrganization={handleAssignOrganization}
              />
            )}
          </Modal>

          {/* Details Modal */}
          <Modal isOpen={!!selectedDoctorId} onClose={() => setSelectedDoctorId(null)} title="Doctor Details">
            {selectedDoctorData?.data && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Name</label>
                  <p className="font-medium">Dr. {selectedDoctorData.data.firstName} {selectedDoctorData.data.lastName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="font-medium">{selectedDoctorData.data.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Phone</label>
                  <p className="font-medium">{selectedDoctorData.data.phoneNumber || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Specialization</label>
                  <p className="font-medium">{selectedDoctorData.data.specialization || 'General'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">License Number</label>
                  <p className="font-medium">{selectedDoctorData.data.licenseNumber || '-'}</p>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </AdminLayout>
    </ProtectedAdminRoute>
  );
};

export default AdminDoctorsPage;
