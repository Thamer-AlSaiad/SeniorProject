import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ProtectedAdminRoute } from '../../components/admin/ProtectedAdminRoute';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { OrganizationList } from '../../components/admin/OrganizationList';
import { OrganizationForm } from '../../components/admin/OrganizationForm';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Modal } from '../../components/ui/modal';
import { useOrganizations, useOrganization } from '../../hooks/useOrganizations';
import { organizationService } from '../../services/organizationService';
import { Organization, CreateOrganizationDto, UpdateOrganizationDto } from '../../types';

const AdminOrganizationsPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useOrganizations({ page, limit: 10, search });
  const { data: selectedOrgData } = useOrganization(selectedOrgId || '');

  const organizations = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('new') === 'true') {
      setShowForm(true);
    }
  }, []);

  const handleCreate = async (dto: CreateOrganizationDto) => {
    try {
      await organizationService.create(dto);
      toast.success('Organization created successfully');
      setShowForm(false);
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create organization');
    }
  };

  const handleUpdate = async (dto: UpdateOrganizationDto) => {
    if (!editingOrg) return;
    try {
      await organizationService.update(editingOrg.id, dto);
      toast.success('Organization updated successfully');
      setEditingOrg(null);
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update organization');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await organizationService.delete(id);
      toast.success('Organization deleted');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete organization');
    }
  };

  return (
    <ProtectedAdminRoute>
      <AdminLayout>
        <div className="p-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
              <p className="text-gray-500">Manage clinics and medical facilities</p>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Organization
            </Button>
          </motion.div>

          <Card>
            <CardHeader>
              <div className="flex gap-4">
                <Input
                  placeholder="Search by name or code..."
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
              <OrganizationList
                organizations={organizations}
                isLoading={isLoading}
                onEdit={setEditingOrg}
                onDelete={handleDelete}
                onViewDetails={setSelectedOrgId}
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
          <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Create Organization">
            <OrganizationForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
          </Modal>

          {/* Edit Modal */}
          <Modal isOpen={!!editingOrg} onClose={() => setEditingOrg(null)} title="Edit Organization">
            {editingOrg && (
              <OrganizationForm
                organization={editingOrg}
                onSubmit={handleUpdate}
                onCancel={() => setEditingOrg(null)}
              />
            )}
          </Modal>

          {/* Details Modal */}
          <Modal isOpen={!!selectedOrgId} onClose={() => setSelectedOrgId(null)} title="Organization Details">
            {selectedOrgData?.data && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Name</label>
                  <p className="font-medium">{selectedOrgData.data.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Code</label>
                  <p className="font-medium">{selectedOrgData.data.code || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Address</label>
                  <p className="font-medium">{selectedOrgData.data.address || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Phone</label>
                  <p className="font-medium">{selectedOrgData.data.phone || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="font-medium">{selectedOrgData.data.email || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Status</label>
                  <p className={`font-medium ${selectedOrgData.data.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedOrgData.data.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </AdminLayout>
    </ProtectedAdminRoute>
  );
};

export default AdminOrganizationsPage;
