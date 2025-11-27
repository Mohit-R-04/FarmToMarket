import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import type { FarmerData, SellerData, TransporterData, RoleData } from '@/types/auth';
import { roleService } from '@/services/roleService';

interface ProfileEditorProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ProfileEditor({ open, onClose, onSuccess }: ProfileEditorProps) {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<RoleData>(user?.roleData || {} as RoleData);

    // Sync formData with user.roleData when dialog opens or user changes
    useEffect(() => {
        if (open && user?.roleData) {
            setFormData(user.roleData);
            setErrors({});
            setError('');
        }
    }, [open, user?.roleData]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (user?.role === 'FARMER') {
            const data = formData as FarmerData;
            if (!data.name?.trim()) newErrors.name = 'Name is required';
            if (!data.location?.trim()) newErrors.location = 'Location is required';
            if (!data.authorizedDocument?.trim()) {
                newErrors.authorizedDocument = 'Document link is required';
            } else {
                try {
                    const url = new URL(data.authorizedDocument);
                    if (!url.hostname.includes('drive.google.com') && !url.hostname.includes('docs.google.com')) {
                        newErrors.authorizedDocument = 'Please provide a valid Google Drive link';
                    }
                } catch {
                    newErrors.authorizedDocument = 'Please provide a valid URL';
                }
            }
        } else if (user?.role === 'SELLER') {
            const data = formData as SellerData;
            if (!data.shopName?.trim()) newErrors.shopName = 'Shop name is required';
            if (!data.address?.trim()) newErrors.address = 'Address is required';
        } else if (user?.role === 'TRANSPORTER') {
            const data = formData as TransporterData;
            if (!data.vehicleType?.trim()) newErrors.vehicleType = 'Vehicle type is required';
            if (!data.vehicleNumber?.trim()) newErrors.vehicleNumber = 'Vehicle number is required';
            if (!data.license?.trim()) newErrors.license = 'License is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateForm() || !user?.role || !user?.id) {
            return;
        }

        setLoading(true);
        try {
            await roleService.updateRoleData(user.id, user.role, formData);
            await refreshUser();
            onSuccess();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const renderFields = () => {
        if (user?.role === 'FARMER') {
            const data = formData as FarmerData;
            return (
                <>
                    <Input
                        label="Name"
                        type="text"
                        placeholder="Enter your name"
                        value={data.name || ''}
                        onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value });
                            setErrors({ ...errors, name: '' });
                        }}
                        error={errors.name}
                        disabled={loading}
                    />
                    <Input
                        label="Location"
                        type="text"
                        placeholder="Enter farm location"
                        value={data.location || ''}
                        onChange={(e) => {
                            setFormData({ ...formData, location: e.target.value });
                            setErrors({ ...errors, location: '' });
                        }}
                        error={errors.location}
                        disabled={loading}
                    />
                    <Input
                        label="Authorized Document (Google Drive Link)"
                        type="url"
                        placeholder="https://drive.google.com/file/d/..."
                        value={data.authorizedDocument || ''}
                        onChange={(e) => {
                            setFormData({ ...formData, authorizedDocument: e.target.value });
                            setErrors({ ...errors, authorizedDocument: '' });
                        }}
                        error={errors.authorizedDocument}
                        disabled={loading}
                    />
                </>
            );
        } else if (user?.role === 'SELLER') {
            const data = formData as SellerData;
            return (
                <>
                    <Input
                        label="Shop Name"
                        type="text"
                        placeholder="Enter your shop name"
                        value={data.shopName || ''}
                        onChange={(e) => {
                            setFormData({ ...formData, shopName: e.target.value });
                            setErrors({ ...errors, shopName: '' });
                        }}
                        error={errors.shopName}
                        disabled={loading}
                    />
                    <Input
                        label="Address"
                        type="text"
                        placeholder="Enter shop address"
                        value={data.address || ''}
                        onChange={(e) => {
                            setFormData({ ...formData, address: e.target.value });
                            setErrors({ ...errors, address: '' });
                        }}
                        error={errors.address}
                        disabled={loading}
                    />
                </>
            );
        } else if (user?.role === 'TRANSPORTER') {
            const data = formData as TransporterData;
            return (
                <>
                    <Input
                        label="Vehicle Type"
                        type="text"
                        placeholder="e.g., Truck, Van, etc."
                        value={data.vehicleType || ''}
                        onChange={(e) => {
                            setFormData({ ...formData, vehicleType: e.target.value });
                            setErrors({ ...errors, vehicleType: '' });
                        }}
                        error={errors.vehicleType}
                        disabled={loading}
                    />
                    <Input
                        label="Vehicle Number"
                        type="text"
                        placeholder="Enter vehicle registration number"
                        value={data.vehicleNumber || ''}
                        onChange={(e) => {
                            setFormData({ ...formData, vehicleNumber: e.target.value });
                            setErrors({ ...errors, vehicleNumber: '' });
                        }}
                        error={errors.vehicleNumber}
                        disabled={loading}
                    />
                    <Input
                        label="License Number"
                        type="text"
                        placeholder="Enter driving license number"
                        value={data.license || ''}
                        onChange={(e) => {
                            setFormData({ ...formData, license: e.target.value });
                            setErrors({ ...errors, license: '' });
                        }}
                        error={errors.license}
                        disabled={loading}
                    />
                    <Input
                        label="Expected Charge per Kilometer (₹)"
                        type="number"
                        placeholder="Enter your expected charge per km (optional)"
                        value={data.expectedChargePerKm?.toString() || ''}
                        onChange={(e) => {
                            const value = e.target.value;
                            setFormData({
                                ...formData,
                                expectedChargePerKm: value ? parseFloat(value) : undefined
                            });
                        }}
                        disabled={loading}
                        min="0"
                    />
                </>
            );
        }
        return null;
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                        Update your profile information
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                            {error}
                        </div>
                    )}

                    {renderFields()}

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
