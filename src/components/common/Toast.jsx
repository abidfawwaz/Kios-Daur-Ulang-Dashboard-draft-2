import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const Toast = () => {
  const { notification } = useApp();

  if (!notification) return null;

  const getIconAndStyle = () => {
    switch (notification.type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
          bg: 'bg-emerald-50 border-emerald-300 text-emerald-900',
        };
      case 'error':
        return {
          icon: <XCircle className="w-5 h-5 text-rose-600 shrink-0" />,
          bg: 'bg-rose-50 border-rose-300 text-rose-900',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
          bg: 'bg-amber-50 border-amber-300 text-amber-900',
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5 text-bsi-teal shrink-0" />,
          bg: 'bg-teal-50 border-teal-300 text-teal-900',
        };
    }
  };

  const style = getIconAndStyle();

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-200">
      <div className={`p-4 rounded-xl border shadow-elevated flex items-start gap-3 ${style.bg}`}>
        {style.icon}
        <div className="flex-1 text-xs font-semibold leading-relaxed">
          {notification.message}
        </div>
      </div>
    </div>
  );
};
