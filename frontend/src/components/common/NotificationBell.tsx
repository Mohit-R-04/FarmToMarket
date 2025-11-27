import { Bell } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
    const { unreadCount } = useNotifications();
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate('/notifications')}
            className="p-2 rounded-full hover:bg-white/10 transition-colors relative"
        >
            <Bell className="w-6 h-6 text-white" />
            {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-slate-900">
                    {unreadCount}
                </span>
            )}
        </button>
    );
}
