import { Button } from "@/components/ui/button";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

// AlertDialog component for simple alert messages
interface AlertDialogProps {
    open: boolean;
    title: string;
    description: string;
    onClose: () => void;
}

export function AlertDialog({
    open,
    title,
    description,
    onClose,
}: AlertDialogProps) {
    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="flex justify-end mt-4">
                    <Button onClick={onClose}>OK</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
