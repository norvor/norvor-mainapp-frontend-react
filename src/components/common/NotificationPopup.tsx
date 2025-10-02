import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { hideNotification } from '../../store/slices/notificationSlice';

const NotificationPopup: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { isVisible, message, type } = useSelector((state: RootState) => state.notification);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        dispatch(hideNotification());
      }, 5000); // Auto-hide after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, dispatch]);

  if (!isVisible) {
    return null;
  }

  const bgColor = type === 'error' ? 'bg-red-600' : 'bg-green-600';

  return (
    <div 
      className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-2xl text-white ${bgColor} animate-fade-in-up z-50 max-w-sm`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{message}</p>
        <button 
          onClick={() => dispatch(hideNotification())} 
          className="ml-4 -mr-2 p-1 rounded-full hover:bg-white/20"
          aria-label="Close notification"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NotificationPopup;