import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { api } from '../services/api';

export interface Notification {
    id: string;
    userId: string;
    message: string;
    type: 'INFO' | 'ALERT' | 'CANCELLATION_REQUEST';
    relatedEntityId?: string;
    status: 'UNREAD' | 'READ' | 'ACTION_REQUIRED' | 'ACTION_TAKEN';
    createdAt: string;
    actionStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    fetchNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    respondToCancellation: (bookingId: string, action: 'ACCEPT' | 'REJECT') => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useUser();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const data = await api.get<Notification[]>(`/notifications/user/${user.id}`);
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    }, [user]);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markAsRead = async (id: string) => {
        try {
            await api.put<Notification>(`/notifications/${id}/read`, {});
            setNotifications(prev =>
                prev.map(n => (n.id === id ? { ...n, status: 'READ' } : n))
            );
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const respondToCancellation = async (bookingId: string, action: 'ACCEPT' | 'REJECT') => {
        try {
            await api.post(`/bookings/${bookingId}/respond-cancellation`, { action });
            await fetchNotifications(); // Refresh to update notification status if needed
        } catch (error) {
            console.error('Failed to respond to cancellation:', error);
            throw error;
        }
    };

    const unreadCount = notifications.filter(n => n.status !== 'READ' && n.status !== 'ACTION_TAKEN').length;

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, fetchNotifications, markAsRead, respondToCancellation }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
