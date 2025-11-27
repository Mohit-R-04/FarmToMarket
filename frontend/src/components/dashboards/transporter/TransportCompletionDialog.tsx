import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TransportCompletionDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (kilometers: number) => void;
}

export function TransportCompletionDialog({
    open,
    onClose,
    onConfirm,
}: TransportCompletionDialogProps) {
    const [kilometers, setKilometers] = useState('');

    const handleConfirm = () => {
        const km = parseFloat(kilometers);
        if (km > 0) {
            onConfirm(km);
            setKilometers('');
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Transport Completion</AlertDialogTitle>
                    <AlertDialogDescription>
                        Please enter the total kilometers traveled for this trip to calculate your revenue.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                    <Label htmlFor="kilometers" className="mb-2 block">
                        Kilometers Traveled
                    </Label>
                    <Input
                        id="kilometers"
                        type="number"
                        placeholder="e.g. 150"
                        value={kilometers}
                        onChange={(e) => setKilometers(e.target.value)}
                        min="0"
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm} disabled={!kilometers || parseFloat(kilometers) <= 0}>
                        Confirm & Complete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
