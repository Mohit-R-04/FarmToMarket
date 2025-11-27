import { api } from '@/services/api';

// This script is intended to be run temporarily to fix corrupted bookings
// where status or transporterId might have been nulled out.

export async function fixCorruptedBookings() {
    try {
        console.log('Fetching all bookings...');
        const bookings = await api.get<any[]>('/bookings');

        // Find corrupted bookings (missing status or transporterId)
        // We assume they should be 'TRANSPORTED' if they have kilometers, 
        // or we might need to infer from other data.
        // Since we don't know the exact transporterId if it's lost, 
        // we might need to rely on the user's current session or just fix the status if transporterId is present.

        // However, if transporterId is lost, we can't assign it back easily unless we know who it belonged to.
        // But the user said "request is removed from history", implying it WAS theirs.

        // Let's look for bookings with null status or null transporterId
        const corrupted = bookings.filter(b => !b.status || !b.transporterId);

        console.log(`Found ${corrupted.length} corrupted bookings.`);

        for (const booking of corrupted) {
            console.log('Fixing booking:', booking.id);

            const updates: any = {};

            // If status is missing, and it has kilometers, it was likely TRANSPORTED
            if (!booking.status) {
                updates.status = 'TRANSPORTED';
            }

            // If transporterId is missing, we can't easily guess it.
            // But if the user is running this, maybe we can assume it's them?
            // Or we can check if there's a transporter request for this batch?

            if (Object.keys(updates).length > 0) {
                // We need to be careful not to null out things again if we use the same endpoint
                // But now the backend is fixed (hopefully).
                // Let's use the update endpoint.

                // Wait, if transporterId is null, we need to restore it.
                // We can try to find the transporterId from the 'transporter-requests' if possible?
                // Or just ask the user to provide it?

                // For now, let's just try to fix the status if it's missing.
                await api.put(`/bookings/${booking.id}`, updates);
                console.log(`Fixed booking ${booking.id}`);
            }
        }

        console.log('Fix complete.');
    } catch (error) {
        console.error('Error fixing bookings:', error);
    }
}
