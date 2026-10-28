/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useITSM } from '../../context/ITSMContext';
import {
  Laptop,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Building2,
  ShieldCheck,
} from 'lucide-react';

export const LoanerInventoryView: React.FC = () => {
  const { loaners, tickets, returnLoanerDevice, triggerFSDHighlight } = useITSM();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              MIS 臨時備用機庫存與領用管理
            </h1>
            <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
              模組一 · F-104
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            當設備轉送原廠外修或大修時，系統自動啟用備用機借用流程，確保同仁日常業務不中斷。
          </p>
        </div>

        <button
          type="button"
          onClick={() => triggerFSDHighlight('F-104')}
          className="text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>F-104 驗收條件</span>
        </button>
      </div>

      {/* Stock Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">備用機總台數</div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {loaners.length} <span className="text-xs text-slate-400 font-normal">台</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">8F MIS 機房備品庫存</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-emerald-600">在庫可借用</div>
          <div className="text-2xl font-bold text-emerald-600 font-mono mt-1">
            {loaners.filter(l => l.status === 'available').length}{' '}
            <span className="text-xs text-slate-400 font-normal">台</span>
          </div>
          <div className="text-[11px] text-emerald-700 mt-1">已預裝企業標準環境</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-indigo-600">外借使用中</div>
          <div className="text-2xl font-bold text-indigo-600 font-mono mt-1">
            {loaners.filter(l => l.status === 'allocated').length}{' '}
            <span className="text-xs text-slate-400 font-normal">台</span>
          </div>
          <div className="text-[11px] text-indigo-700 mt-1">外修期間無縫接軌</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">平均借用天數</div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            3.2 <span className="text-xs text-slate-400 font-normal">天</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">隨原機完修自動回收</div>
        </div>
      </div>

      {/* Loaner Devices List */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
          <span>備用機設備在庫與領用清冊</span>
          <span className="text-xs text-slate-400 font-normal">
            取件處：台北總部 8F MIS 技術支援櫃檯
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loaners.map(l => {
            const isAllocated = l.status === 'allocated';
            const matchedTicket = tickets.find(t => t.id === l.allocatedToTicketId);

            return (
              <div
                key={l.id}
                className={`p-4 rounded-xl border transition-all ${
                  isAllocated
                    ? 'border-indigo-200 bg-indigo-50/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isAllocated
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 leading-snug">
                        {l.model}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">{l.type}</p>
                      <div className="font-mono text-[10px] text-slate-400 mt-1">
                        序號: {l.serialNumber} · 編號: {l.id}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 text-[11px] font-semibold rounded shrink-0 ${
                      isAllocated
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isAllocated ? '已借出使用' : '在庫可領'}
                  </span>
                </div>

                {isAllocated ? (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-indigo-100 text-xs text-slate-700 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">目前借用人:</span>
                      <span className="font-semibold text-slate-900">
                        {l.allocatedToUserName || matchedTicket?.requesterName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">關聯工單編號:</span>
                      <span className="font-mono text-blue-700 font-medium">
                        {l.allocatedToTicketId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">借出領用時間:</span>
                      <span className="font-mono">{l.allocatedAt}</span>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => returnLoanerDevice(l.allocatedToTicketId!)}
                        className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-medium rounded-md transition-colors flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>歸還驗收入庫</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>已完成標準系統重灌與消毒</span>
                    <span className="text-emerald-700 font-medium">隨時可供調撥</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
