import { useState } from 'react';
import { Organization } from '../../types';

interface OrganizationListProps {
  organizations: Organization[];
  isLoading: boolean;
  onEdit: (org: Organization) => void;
  onDelete: (id: string) => void;
  onViewDetails: (id: string) => void;
}

export const OrganizationList = ({
  organizations,
  isLoading,
  onEdit,
  onDelete,
  onViewDetails,
}: OrganizationListProps) => {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading organizations...</p>
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No organizations found</p>
      </div>
    );
  }

  const handleDeleteClick = (id: string) => {
    if (deleteConfirm === id) {
      onDelete(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
            <th className="text-left py-3 px-4 font-medium text-gray-600">Code</th>
            <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
            <th className="text-left py-3 px-4 font-medium text-gray-600">Phone</th>
            <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {organizations.map((org) => (
            <tr key={org.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4">
                <button
                  onClick={() => onViewDetails(org.id)}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {org.name}
                </button>
              </td>
              <td className="py-3 px-4 text-gray-600">{org.code || '-'}</td>
              <td className="py-3 px-4 text-gray-600">{org.email || '-'}</td>
              <td className="py-3 px-4 text-gray-600">{org.phone || '-'}</td>
              <td className="py-3 px-4 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(org)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(org.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      deleteConfirm === org.id
                        ? 'bg-red-600 text-white'
                        : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                    }`}
                    title={deleteConfirm === org.id ? 'Click again to confirm' : 'Delete'}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
