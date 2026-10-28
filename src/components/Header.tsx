/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useITSM } from '../context/ITSMContext';
import { UserRole } from '../types/itsm';
import {
  Wrench,
  Bell,
  FileText,
  UserCheck,
  ChevronDown,
  CheckCircle2,
  Clock,
  ShieldAlert,
} from 'lucide-react';

interface HeaderProps {
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNotifications }) => {
  const {
    activeRole,
    setActiveRole,
    currentUser,
    users,
    activeTab,
    setActiveTab,
    unreadNotifsCount,
    setIsFSDDrawerOpen,
  } = useITSM();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const roleLabels: Record<UserRole, { label: string; badge: string; desc: string }> = {
    user: {
      label: '同仁端 (報修人)',
      badge: '一般同仁',
      desc: '業務部 · 智慧報修與進度追蹤',
    },
    engineer: {
      label: '工程師端 (技術組)',
      badge: 'MIS 工程師',
      desc: '技術支援 · 接單出發與現場檢測',
    },
    manager: {
      label: '主管端 (管理與SLA)',
      badge: '資訊主管',
      desc: '營運維護 · 派工調度與原廠 SLA 預警',
    },
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight whitespace-nowrap">
                ITSM 資訊設備報修與維修管理系統
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-slate-500 font-mono">
                FSD v2.4 Compliant
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 shrink-0">
            <button
              onClick={() => setActiveTab('my_tickets')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'my_tickets'
                  ? 'bg-slate-100 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              我的報修追蹤 (F-103)
            </button>

            <button
              onClick={() => setActiveTab('new_repair')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'new_repair'
                  ? 'bg-slate-100 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              智慧報修 (F-101/F-102)
            </button>

            <button
              onClick={() => setActiveTab('engineer_pool')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'engineer_pool'
                  ? 'bg-slate-100 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              工程師檢修後台 (F-201~203)
            </button>

            <button
              onClick={() => setActiveTab('vendor_sla')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'vendor_sla'
                  ? 'bg-slate-100 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              外部廠商 SLA 監控 (F-301/302)
            </button>

            <button
              onClick={() => setActiveTab('loaners')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'loaners'
                  ? 'bg-slate-100 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              備用機庫存 (F-104)
            </button>
          </nav>

          {/* Zone 3: Actions & Role Switcher */}
          <div className="flex items-center gap-2.5 shrink-0">
            
            {/* FSD Interactive Spec Drawer Button */}
            <button
              onClick={() => setIsFSDDrawerOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
              title="開啟 FSD 規格書驗收對照表"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">FSD 規格驗收對照</span>
              <span className="sm:hidden">FSD</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="系統與推播通知中心"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* Role Switcher Popover */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors text-left"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover border border-slate-200"
                />
                <div className="hidden lg:block text-left">
                  <div className="font-semibold text-slate-800 leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight">
                    {roleLabels[activeRole].badge}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isRoleDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsRoleDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                    <div className="px-3 py-1.5 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-700">RBAC 權限切換體驗</p>
                      <p className="text-[11px] text-slate-400">
                        切換不同視角體驗 FSD 規範的端到端流程
                      </p>
                    </div>

                    {(['user', 'engineer', 'manager'] as UserRole[]).map(role => {
                      const userObj = users.find(u => u.role === role);
                      const isSelected = activeRole === role;
                      return (
                        <button
                          key={role}
                          onClick={() => {
                            setActiveRole(role);
                            setIsRoleDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left flex items-start gap-2.5 hover:bg-slate-50 transition-colors ${
                            isSelected ? 'bg-blue-50/70' : ''
                          }`}
                        >
                          <img
                            src={userObj?.avatar}
                            alt={userObj?.name}
                            className="w-7 h-7 rounded-full object-cover mt-0.5 border border-slate-200"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-xs font-medium ${
                                  isSelected ? 'text-blue-700' : 'text-slate-800'
                                }`}
                              >
                                {roleLabels[role].label}
                              </span>
                              {isSelected && (
                                <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">{userObj?.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {roleLabels[role].desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
