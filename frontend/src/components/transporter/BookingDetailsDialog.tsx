import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { api } from '@/services/api';
import { MapPin, Calendar, Truck, CheckCircle, Clock } from 'lucide-react';

interface BookingDetailsDialogProps {
    open: boolean;
    onClose: () => void;
    booking: any;
}

export function BookingDetailsDialog({
    open,
    onClose,
    booking,
}: BookingDetailsDialogProps) {
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && booking?.batchId) {
            const fetchProduct = async () => {
                setLoading(true);
                try {
                    const data = await api.get<any>(`/products/${booking.batchId}`);
                    setProduct(data);
                } catch (error) {
                    console.error('Failed to fetch product details:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchProduct();
        } else {
            setProduct(null);
        }
    }, [open, booking]);

    // if (!booking) return null; // Removed early return

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Booking Details</DialogTitle>
                    <DialogDescription>
                        Transport details for Batch #{booking?.batchId?.substring(0, 8) || 'Unknown'}
                    </DialogDescription>
                </DialogHeader>

                {!booking ? (
                    <div className="p-4 text-center">No booking details available.</div>
                ) : (
                    <div className="space-y-6 mt-4">
                        {/* Status Banner */}
                        <div className={`p-4 rounded-lg flex items-center gap-3 ${booking.status === 'TRANSPORTED' ? 'bg-green-100 text-green-800' :
                            booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                            }`}>
                            {booking.status === 'TRANSPORTED' ? <CheckCircle className="w-5 h-5" /> :
                                booking.status === 'CANCELLED' ? <Clock className="w-5 h-5" /> :
                                    <Truck className="w-5 h-5" />}
                            <span className="font-medium">Status: {booking.status}</span>
                        </div>

                        {/* Key Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 border rounded-lg">
                                <p className="text-sm text-muted-foreground mb-1">Transport Date</p>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-emerald-600" />
                                    <span className="font-medium">{booking.transportDate || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="p-3 border rounded-lg">
                                <p className="text-sm text-muted-foreground mb-1">Destination</p>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-emerald-600" />
                                    <span className="font-medium truncate">
                                        {product?.sellerLocation || 'Seller Location'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Charges */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                            <h4 className="font-medium mb-2">Financials</h4>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Agreed Charge:</span>
                                <span className="font-medium">₹{booking.farmerDemandedCharge}</span>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div>
                            <h4 className="font-medium mb-3">Journey Timeline</h4>
                            {loading ? (
                                <div className="text-center py-4 text-muted-foreground">Loading timeline...</div>
                            ) : product?.journey && product.journey.length > 0 ? (
                                <div className="relative border-l-2 border-emerald-200 dark:border-emerald-800 ml-3 space-y-6 pl-6 py-2">
                                    {product.journey.map((event: any, index: number) => (
                                        <div key={index} className="relative">
                                            <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                                            <div>
                                                <p className="font-medium text-sm">{event.status}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</p>
                                                <p className="text-sm mt-1">{event.description}</p>
                                                {event.location && (
                                                    <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" /> {event.location}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">No timeline events recorded.</p>
                            )}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
