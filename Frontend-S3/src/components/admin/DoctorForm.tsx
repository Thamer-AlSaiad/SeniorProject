import { useState, FormEvent } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select } from '../ui/select';
import { Doctor, Organization, CreateDoctorDto, UpdateDoctorDto } from '../../types';

interface DoctorFormProps {
  doctor?: Doctor;
  organizations: Organization[];
  onSubmit: (data: CreateDoctorDto | UpdateDoctorDto) => Promise<void>;
  onCancel: () => void;
  onAssignOrganization?: (doctorId: string, organizationId: string) => Promise<void>;
}

export const DoctorForm = ({ doctor, organizations, onSubmit, onCancel, onAssignOrganization }: DoctorFormProps) => {
  const currentOrgId = doctor?.organizationId || doctor?.organizations?.[0]?.id || '';
  const [formData, setFormData] = useState({
    email: doctor?.email || '',
    password: '',
    firstName: doctor?.firstName || '',
    lastName: doctor?.lastName || '',
    phoneNumber: doctor?.phoneNumber || '',
    specialization: doctor?.specialization || '',
    licenseNumber: doctor?.licenseNumber || '',
    organizationId: currentOrgId,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!doctor && !formData.email.trim()) newErrors.email = 'Email is required';
    if (!doctor && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!doctor && !formData.password.trim()) newErrors.password = 'Password is required';
    if (!doctor && formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.organizationId) newErrors.organizationId = 'Organization is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      if (doctor) {
        // Update - send editable fields
        await onSubmit({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber || undefined,
          specialization: formData.specialization || undefined,
          licenseNumber: formData.licenseNumber || undefined,
        });
        
        // If organization changed, assign to new organization
        if (onAssignOrganization && formData.organizationId !== currentOrgId) {
          await onAssignOrganization(doctor.id, formData.organizationId);
        }
      } else {
        // Create - send all fields including password
        await onSubmit({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber || undefined,
          specialization: formData.specialization || undefined,
          licenseNumber: formData.licenseNumber || undefined,
          organizationId: formData.organizationId,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const activeOrganizations = organizations.filter(org => org.isActive);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!doctor && (
        <Input
          label="Email *"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
          placeholder="Enter email address"
        />
      )}

      {!doctor && (
        <Input
          label="Password *"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          error={errors.password}
          placeholder="Enter password (min 6 characters)"
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name *"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          error={errors.firstName}
          placeholder="Enter first name"
        />

        <Input
          label="Last Name *"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          error={errors.lastName}
          placeholder="Enter last name"
        />
      </div>

      <Input
        label="Phone Number"
        value={formData.phoneNumber}
        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
        placeholder="Enter phone number (optional)"
      />

      <Input
        label="Specialization"
        value={formData.specialization}
        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
        placeholder="e.g., Cardiology, Pediatrics (optional)"
      />

      <Input
        label="License Number"
        value={formData.licenseNumber}
        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
        placeholder="Enter license number (optional)"
      />

      <Select
        label={doctor ? "Organization" : "Organization *"}
        value={formData.organizationId}
        onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
        error={errors.organizationId}
      >
        <option value="">Select an organization</option>
        {activeOrganizations.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))}
      </Select>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {doctor ? 'Update' : 'Create'} Doctor
        </Button>
      </div>
    </form>
  );
};
