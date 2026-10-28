/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useITSM } from '../context/ITSMContext';
import { X, Bell, CheckCheck, AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setSelectedTicketId,
    setActiveTab,
    activeRole,
  } = useITSM();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-600 shrink-0" />;
    }
  };

  const handleTicketClick = (ticketId: string, id: string) => {
    markNotificationRead(id);
    setSelectedTicketId(ticketId);
    if (activeRole === 'user') {
      setActiveTab('my_tickets');
    } else if (activeRole === 'engineer') {
      setActiveTab('engineer_pool');
    } else {
      setActiveTab('vendor_sla');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-start justify-center pt-16 sm:pt-20 px-4">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">即時推播通知中心</h3>
              <p className="text-[11px] text-slate-500">
                模擬企業 Email 與系統即時通訊推播 (出發預告 / SLA 警報 / 完修簽收)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsRead}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium px-2 py-1 hover:bg-blue-50 rounded"
              title="全部標為已讀"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>全部已讀</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">目前暫無任何推播通知</div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => handleTicketClick(n.ticketId, n.id)}
                className={`p-3.5 rounded-lg transition-colors cursor-pointer flex items-start gap-3 ${
                  n.read ? 'hover:bg-slate-50 bg-white' : 'bg-blue-50/40 hover:bg-blue-50/70'
                }`}
              >
                <div className="mt-0.5">{getIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-900">
                      {n.title}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 shrink-0">
                      {n.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-1.5">
                    {n.message}
                  </p>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      工單: {n.ticketId}
                    </span>
                    {!n.read && (
                      <span className="text-blue-600 font-medium">● 未讀</span>
                    )}
                    <span className="text-blue-600 hover:underline ml-auto">
                      點擊檢視工單 →
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
          <span>支援 Email、Teams 與行動端 Push 推播通知</span>
          <button
            onClick={onClose}
            className="text-xs font-medium text-slate-700 hover:text-slate-900 px-3 py-1 bg-white border border-slate-200 rounded-md"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
