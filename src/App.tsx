/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ITSMProvider, useITSM } from './context/ITSMContext';
import { Header } from './components/Header';
import { FSDInspectorDrawer } from './components/FSDInspectorDrawer';
import { NotificationModal } from './components/NotificationModal';
import { SmartRepairForm } from './components/UserView/SmartRepairForm';
import { UserTracker } from './components/UserView/UserTracker';
import { EngineerWorkstation } from './components/ITEngineer/EngineerWorkstation';
import { VendorSLAMonitor } from './components/VendorAndManager/VendorSLAMonitor';
import { LoanerInventoryView } from './components/Loaners/LoanerInventoryView';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  HelpCircle,
} from 'lucide-react';

function ITSMApp() {
  const {
    activeTab,
    setActiveTab,
    activeRole,
    currentUser,
    setIsFSDDrawerOpen,
  } = useITSM();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'new_repair':
        return '模組一：使用者前端 / 智慧報修申請 (F-101 & F-102)';
      case 'my_tickets':
        return '模組一：使用者前端 / IT 追蹤看板 (F-103 & F-401 & F-402)';
      case 'engineer_pool':
        return '模組二：資訊人員後台 / 派工與檢修管理 (F-201 ~ F-203)';
      case 'vendor_sla':
        return '模組三：外部廠商與 SLA 追蹤監控 (F-301 & F-302)';
      case 'loaners':
        return '模組一：備用機申請與 MIS 庫存管理 (F-104)';
      default:
        return '資訊設備報修與維修管理系統 (ITSM)';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header onOpenNotifications={() => setIsNotificationsOpen(true)} />

      {/* Sub-header Context Bar */}
      <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="font-semibold text-slate-700">ITSM 系統導覽</span>
            <span aria-hidden="true">/</span>
            <span className="text-blue-700 font-medium">{getBreadcrumb()}</span>
          </div>

          <div className="flex items-center gap-3 text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>當前身份：{currentUser.name} ({currentUser.department})</span>
            </span>
            <span aria-hidden="true" className="text-slate-300">|</span>
            <button
              onClick={() => setIsFSDDrawerOpen(true)}
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:underline"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>規格驗收矩陣 (FSD)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'new_repair' && <SmartRepairForm />}
        {activeTab === 'my_tickets' && <UserTracker />}
        {activeTab === 'engineer_pool' && <EngineerWorkstation />}
        {activeTab === 'vendor_sla' && <VendorSLAMonitor />}
        {activeTab === 'loaners' && <LoanerInventoryView />}
      </main>

      {/* FSD Drawer and Notifications Modal */}
      <FSDInspectorDrawer />
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* Subtle Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <span>資訊設備報修與維修管理系統 (ITSM)</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span>依據功能規格說明書 (FSD) 標準打造</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>F-101~F-104 使用者端</span>
            <span>·</span>
            <span>F-201~F-203 資訊工程師</span>
            <span>·</span>
            <span>F-301~F-302 廠商 SLA 追蹤</span>
            <span>·</span>
            <span>F-401~F-402 結案滿意度</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ITSMProvider>
      <ITSMApp />
    </ITSMProvider>
  );
}
