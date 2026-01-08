import { useState, FormEvent } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Organization, CreateOrganizationDto, UpdateOrganizationDto } from '../../types';

interface OrganizationFormProps {
  organization?: Organization;
  onSubmit: (data: CreateOrganizationDto | UpdateOrganizationDto) => Promise<void>;
  onCancel: () => void;
}

export const OrganizationForm = ({ organization, onSubmit, onCancel }: OrganizationFormProps) => {
  const [formData, setFormData] = useState({
    name: organization?.name || '',
    code: organization?.code || '',
    address: organization?.address || '',
    phone: organization?.phone || '',
    email: organization?.email || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Organization Name *"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
        placeholder="Enter organization name"
      />

      <Input
        label="Code"
        value={formData.code}
        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
        placeholder="Enter organization code (optional)"
      />

      <Input
        label="Address"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        placeholder="Enter address (optional)"
      />

      <Input
        label="Phone"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        placeholder="Enter phone number (optional)"
      />

      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={errors.email}
        placeholder="Enter email (optional)"
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {organization ? 'Update' : 'Create'} Organization
        </Button>
      </div>
    </form>
  );
};
