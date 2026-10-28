/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useITSM } from '../../context/ITSMContext';
import { RepairTicket } from '../../types/itsm';
import { InspectionActionModal } from './InspectionActionModal';
import {
  Wrench,
  Navigation,
  UserX,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Phone,
  Laptop,
  Building,
  UserCheck,
  Send,
  Calendar,
} from 'lucide-react';

export const EngineerWorkstation: React.FC = () => {
  const {
    tickets,
    dispatchEngineer,
    markAwayFromDesk,
    currentUser,
    triggerFSDHighlight,
  } = useITSM();

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Inspection modal state
  const [inspectingTicket, setInspectingTicket] = useState<RepairTicket | null>(null);

  // Away from desk modal state
  const [awayTicket, setAwayTicket] = useState<RepairTicket | null>(null);
  const [awayReason, setAwayReason] = useState('抵達 12F 業務部同仁不在座位，座位桌面留有開會紙條');
  const [rescheduleTime, setRescheduleTime] = useState('今日 16:30 (待業務會議結束後二次抵達)');

  const filteredTickets = tickets.filter(t => {
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    return true;
  });

  const handleAwaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!awayTicket) return;
    markAwayFromDesk(awayTicket.id, awayReason, rescheduleTime);
    setAwayTicket(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              資訊人員後台 - 派工與檢修管理
            </h1>
            <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
              模組二 · F-201 / F-202 / F-203
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            智慧派工分派清單 · 出發預告降低撲空率 · 現場檢測處置與轉外修判定
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => triggerFSDHighlight('F-201')}
            className="text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>F-201~F-203 規範</span>
          </button>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600 mr-1">狀態篩選：</span>
          {[
            { id: 'all', label: '全部單據' },
            { id: 'dispatched', label: '待出發檢測 (已派工)' },
            { id: 'inspecting', label: '檢測中 (已出發)' },
            { id: 'vendor_repair', label: '送外修中' },
            { id: 'ready_pickup', label: '完修待簽收' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                filterStatus === f.id
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600">類別：</span>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-medium"
          >
            <option value="all">全類別 (硬體/網路/軟體/週邊)</option>
            <option value="hardware">硬體設備</option>
            <option value="network">網路連線</option>
            <option value="software">軟體與系統</option>
            <option value="peripheral">週邊設備</option>
          </select>
        </div>
      </div>

      {/* Ticket Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredTickets.map(t => {
          const isInspecting = t.status === 'inspecting';
          const isDispatched = t.status === 'dispatched';

          return (
            <div
              key={t.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all space-y-4"
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {t.id}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                      {t.category.toUpperCase()}
                    </span>
                    {t.urgency === 'urgent' && (
                      <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded">
                        🔥 急迫
                      </span>
                    )}
                  </div>

                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                      t.status === 'inspecting'
                        ? 'bg-amber-100 text-amber-900'
                        : t.status === 'vendor_repair'
                        ? 'bg-purple-100 text-purple-900'
                        : t.status === 'ready_pickup'
                        ? 'bg-emerald-100 text-emerald-900'
                        : t.status === 'closed'
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-blue-100 text-blue-900'
                    }`}
                  >
                    {t.status === 'received' && '已收單'}
                    {t.status === 'dispatched' && '待出發檢測'}
                    {t.status === 'inspecting' && '現場檢測中'}
                    {t.status === 'vendor_repair' && '送外修'}
                    {t.status === 'ready_pickup' && '完修待簽收'}
                    {t.status === 'closed' && '已結案'}
                  </span>
                </div>

                {/* Scenario & Asset */}
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {t.scenarioTitle}
                </h3>
                <div className="text-xs text-slate-500 mb-2 flex items-center gap-2">
                  <Laptop className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {t.assetSnapshot.name} ({t.assetId})
                  </span>
                </div>

                {/* Requester Info (F-101) */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 space-y-1 mb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">申報人員：</span>
                    <span className="font-semibold text-slate-800">
                      {t.requesterName} ({t.department})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">分機 / IP：</span>
                    <span className="font-mono">
                      {t.extension} / {t.ipAddress}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">目前指派工程師：</span>
                    <span className="font-semibold text-blue-700">
                      {t.assignedEngineerName || '系統排程中'}
                    </span>
                  </div>
                </div>

                {/* Symptoms Preview */}
                <div className="text-xs text-slate-700 line-clamp-2 bg-white border border-slate-100 p-2.5 rounded-lg">
                  <span className="font-semibold text-slate-900">故障特徵：</span>
                  {t.symptoms.join('； ')}
                </div>

                {/* Away from desk warning if active */}
                {t.isAwayFromDesk && (
                  <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">不在座位註記 (F-202)：</span>
                      {t.awayFromDeskNote}。預約二次檢測：{t.rescheduleTime}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="text-[11px] text-slate-400 font-mono">
                  建立時間: {t.createdAt}
                </div>

                <div className="flex items-center gap-2">
                  {/* F-202: Departure Notification Button */}
                  {isDispatched && (
                    <button
                      onClick={() => dispatchEngineer(t.id)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>出發前往 (推播預告 F-202)</span>
                    </button>
                  )}

                  {/* F-202: Away From Desk Button */}
                  {isInspecting && (
                    <button
                      onClick={() => setAwayTicket(t)}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>不在座位 (F-202)</span>
                    </button>
                  )}

                  {/* F-203: Inspection & Resolution Button */}
                  {isInspecting && (
                    <button
                      onClick={() => setInspectingTicket(t)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>檢測處置 (F-203)</span>
                    </button>
                  )}

                  {/* If in other states, show details badge */}
                  {(t.status === 'vendor_repair' || t.status === 'ready_pickup' || t.status === 'closed') && (
                    <span className="text-xs text-slate-500 font-medium px-2 py-1 bg-slate-100 rounded">
                      {t.status === 'vendor_repair' && '原廠維修中 (SLA 倒數)'}
                      {t.status === 'ready_pickup' && '待同仁線上驗收簽收'}
                      {t.status === 'closed' && '已完成歸檔'}
                    </span>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Inspection Modal (F-203) */}
      {inspectingTicket && (
        <InspectionActionModal
          ticket={inspectingTicket}
          isOpen={!!inspectingTicket}
          onClose={() => setInspectingTicket(null)}
        />
      )}

      {/* Away From Desk Modal (F-202) */}
      {awayTicket && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setAwayTicket(null)}
          />

          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <UserX className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    同仁不在座位註記 (F-202)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    工單：{awayTicket.id} · 申報人：{awayTicket.requesterName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAwayTicket(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAwaySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  現場撲空原因說明：
                </label>
                <textarea
                  value={awayReason}
                  onChange={e => setAwayReason(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  重新預約檢測時間 (將自動推播通知給同仁)：
                </label>
                <input
                  type="text"
                  value={rescheduleTime}
                  onChange={e => setRescheduleTime(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="p-3 bg-amber-50 text-xs text-amber-900 rounded-lg border border-amber-200">
                系統將發送撲空預警與重新排程時間至同仁的通知中心，避免工程師二度撲空。
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAwayTicket(null)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
                >
                  儲存並發送推播通知
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
