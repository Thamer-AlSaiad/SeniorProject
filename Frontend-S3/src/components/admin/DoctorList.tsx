import { Doctor } from '../../types';

interface DoctorListProps {
  doctors: Doctor[];
  isLoading: boolean;
  onEdit: (doctor: Doctor) => void;
  onDelete: (id: string) => void;
  onViewDetails: (id: string) => void;
}

export const DoctorList = ({
  doctors,
  isLoading,
  onEdit,
  onDelete,
  onViewDetails,
}: DoctorListProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading doctors...</p>
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No doctors found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
            <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
            <th className="text-left py-3 px-4 font-medium text-gray-600">Specialization</th>
            <th className="text-left py-3 px-4 font-medium text-gray-600">Organization</th>
            <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((doctor) => (
            <tr key={doctor.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4">
                <button
                  onClick={() => onViewDetails(doctor.id)}
                  className="font-medium text-blue-600 hover:underline"
                >
                  Dr. {doctor.firstName} {doctor.lastName}
                </button>
              </td>
              <td className="py-3 px-4 text-gray-600">{doctor.email}</td>
              <td className="py-3 px-4 text-gray-600">{doctor.specialization || 'General'}</td>
              <td className="py-3 px-4 text-gray-600">
                {doctor.organization?.name || doctor.organizations?.[0]?.name || '-'}
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(doctor)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete Dr. ${doctor.firstName} ${doctor.lastName}? This action cannot be undone.`)) {
                        onDelete(doctor.id);
                      }
                    }}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
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
