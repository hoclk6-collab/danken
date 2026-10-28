/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useITSM } from '../../context/ITSMContext';
import { RepairTicket } from '../../types/itsm';
import {
  Building2,
  Clock,
  AlertCircle,
  Truck,
  Send,
  Sparkles,
  Phone,
  FileText,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Filter,
} from 'lucide-react';

export const VendorSLAMonitor: React.FC = () => {
  const {
    tickets,
    sendVendorReminder,
    triggerFSDHighlight,
    reassignEngineer,
    users,
    resolveManagerFollowup,
  } = useITSM();

  // Active tickets in vendor repair status
  const vendorTickets = tickets.filter(t => t.vendorRepair);

  // Tickets needing manager CSAT followup (F-402)
  const lowRatingTickets = tickets.filter(
    t => t.csat && t.csat.needsManagerFollowup
  );

  // Reassignment modal
  const [reassignTicket, setReassignTicket] = useState<RepairTicket | null>(null);
  const [targetEngineerId, setTargetEngineerId] = useState<string>('USR-5002');
  const [reassignReason, setReassignReason] = useState('因原工程師出勤支援遠端分公司，主管手動調整分派');

  // Followup modal for F-402
  const [followupTicket, setFollowupTicket] = useState<RepairTicket | null>(null);
  const [followupNote, setFollowupNote] = useState('');

  const engineers = users.filter(u => u.role === 'engineer');

  const handleReassignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignTicket) return;
    reassignEngineer(reassignTicket.id, targetEngineerId, reassignReason);
    setReassignTicket(null);
  };

  const handleFollowupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followupTicket) return;
    resolveManagerFollowup(followupTicket.id, followupNote);
    setFollowupTicket(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              外部廠商與 SLA 追蹤監控台
            </h1>
            <span className="text-xs font-mono bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
              模組三 · F-301 / F-302
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            原廠維修時效監控 · 72小時 SLA 倒數 · 逾期紅色預警與自動催修信函
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => triggerFSDHighlight('F-302')}
            className="text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>查看 SLA 預警規範 (F-302)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">外修中案件總數</div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            {vendorTickets.length} <span className="text-xs text-slate-400 font-normal">件</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">原廠授權保固維修中</div>
        </div>

        <div className="bg-white border border-red-200 rounded-xl p-4 shadow-xs bg-red-50/20">
          <div className="text-xs font-semibold text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            SLA 逾期警報 (F-302)
          </div>
          <div className="text-2xl font-bold text-red-600 font-mono mt-1">
            {vendorTickets.filter(t => t.vendorRepair?.isOverdue).length}{' '}
            <span className="text-xs text-red-400 font-normal">件</span>
          </div>
          <div className="text-[11px] text-red-700 mt-1">超過 3 工作天合約承諾時限</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">外修平均週轉天數</div>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
            2.4 <span className="text-xs text-slate-400 font-normal">天</span>
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">
            合約基準：3 工作天 (72h)
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">低星客訴關懷待處理 (F-402)</div>
          <div className="text-2xl font-bold text-amber-600 font-mono mt-1">
            {lowRatingTickets.filter(t => !t.csat?.managerFollowupResolved).length}{' '}
            <span className="text-xs text-slate-400 font-normal">件</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">評分 ≤ 2 星主管關懷</div>
        </div>
      </div>

      {/* Section 1: Active Vendor Repair Tickets (F-301 & F-302) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-700" />
            外部原廠維修單與 SLA 逾期預警看板 (F-301 / F-302)
          </h2>
          <span className="text-xs text-slate-500">即時倒數與即時催修發送</span>
        </div>

        <div className="space-y-4">
          {vendorTickets.map(t => {
            const vr = t.vendorRepair!;
            const isOverdue = vr.isOverdue;

            return (
              <div
                key={t.id}
                className={`bg-white rounded-xl border p-5 shadow-xs transition-all ${
                  isOverdue
                    ? 'border-red-400 ring-2 ring-red-100 bg-red-50/10'
                    : 'border-slate-200'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-slate-900">
                      {t.id}
                    </span>
                    <span className="text-xs font-bold text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
                      {vr.vendorName}
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                      原廠案號: {vr.vendorCaseNo}
                    </span>
                  </div>

                  {/* Overdue Badge */}
                  {isOverdue ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-lg border border-red-200 self-start sm:self-auto">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>⚠️ F-302 SLA 已逾期 21 小時 (合約 3 天)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200 self-start sm:self-auto">
                      <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>SLA 倒數中 (尚餘 18 小時)</span>
                    </div>
                  )}
                </div>

                {/* Details Grid (F-301) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                  {/* Equipment & Requester */}
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 text-xs space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase">
                      設備與申報人
                    </div>
                    <div className="font-semibold text-slate-900">
                      {t.assetSnapshot.name}
                    </div>
                    <div className="text-slate-600">
                      申報人：{t.requesterName} ({t.department})
                    </div>
                    <div className="font-mono text-slate-500">
                      資產編號：{t.assetId}
                    </div>
                  </div>

                  {/* Vendor Contract & Logistics */}
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 text-xs space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase">
                      合約與外送物流 (F-301)
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">合約編號:</span>
                      <span className="font-mono font-medium text-slate-800">
                        {vr.contractNo}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">外送時間:</span>
                      <span className="font-mono">{vr.sentDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">物流追蹤碼:</span>
                      <span className="font-mono font-semibold text-blue-700">
                        {vr.logisticsTrackingNo}
                      </span>
                    </div>
                  </div>

                  {/* SLA Terms & ETA */}
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 text-xs space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase">
                      時限與返還預估 (ETA)
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">SLA 門檻:</span>
                      <span className="font-bold text-slate-900">
                        {vr.slaDays} 個工作天 (72 小時)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">承諾完修日:</span>
                      <span className="font-mono text-slate-800">
                        {vr.slaDeadline.split('T')[0]} 14:00
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">原廠聯絡窗口:</span>
                      <span>
                        {vr.vendorContact} ({vr.vendorPhone})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fault Diagnosis Note */}
                <div className="text-xs text-slate-700 bg-white border border-slate-200 p-3 rounded-lg mb-4">
                  <span className="font-bold text-slate-900">故障判定說明：</span>
                  {vr.faultConfirmed}
                </div>

                {/* Action Buttons for SLA */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>負責 MIS 工程師：{t.assignedEngineerName}</span>
                    {t.loanerDeviceName && (
                      <span className="text-indigo-700 font-medium">
                        · 已借用備用機：{t.loanerDeviceName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setReassignTicket(t)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      手動轉單重劃 (F-201)
                    </button>

                    <button
                      onClick={() => sendVendorReminder(t.id)}
                      className={`px-4 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 ${
                        isOverdue
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isOverdue ? '發送原廠逾期催修通知 (F-302)' : '發送進度詢問'}</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Low-CSAT Customer Care Followup (F-402) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              F-402 品質滿意度異常關懷看板 (低於 3 星自動告警)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              依據 FSD 規範，同仁評價低於 3 星時自動觸發 IT 主管關懷追蹤機制
            </p>
          </div>

          <button
            type="button"
            onClick={() => triggerFSDHighlight('F-402')}
            className="text-xs font-medium text-blue-600 hover:underline"
          >
            F-402 規格細節
          </button>
        </div>

        <div className="space-y-3">
          {lowRatingTickets.map(t => {
            const cs = t.csat!;
            return (
              <div
                key={t.id}
                className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {t.id}
                    </span>
                    <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      滿意度：{cs.rating} 顆星 ⚠️
                    </span>
                    <span className="text-xs text-slate-600">
                      申報同仁：{t.requesterName} ({t.department})
                    </span>
                  </div>

                  <span
                    className={`text-xs px-2.5 py-1 rounded font-medium ${
                      cs.managerFollowupResolved
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800 font-bold'
                    }`}
                  >
                    {cs.managerFollowupResolved ? '✓ 主管已完成關懷覆核' : '待主管主動致電關懷'}
                  </span>
                </div>

                <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-amber-200/80">
                  <div className="font-semibold text-slate-900 mb-1">
                    同仁反映意見回饋：
                  </div>
                  <div className="flex gap-1.5 mb-1.5">
                    {cs.tags.map(tg => (
                      <span
                        key={tg}
                        className="text-[11px] bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded"
                      >
                        {tg}
                      </span>
                    ))}
                  </div>
                  <p className="text-slate-600">「{cs.feedback}」</p>
                </div>

                {cs.managerFollowupNote && (
                  <div className="text-xs text-emerald-900 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                    <span className="font-bold">主管處置紀錄：</span>
                    {cs.managerFollowupNote}
                  </div>
                )}

                {!cs.managerFollowupResolved && (
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => {
                        setFollowupTicket(t);
                        setFollowupNote('資訊主管已致電了解狀況，已於庫存系統將耗材安全存量提升，同仁滿意此改善措施。');
                      }}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
                    >
                      紀錄主管關懷處置措施
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Reassign Engineer Modal (F-201) */}
      {reassignTicket && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setReassignTicket(null)}
          />

          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                手動調整派工指派 (F-201)
              </h3>
              <button
                onClick={() => setReassignTicket(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReassignSubmit} className="p-6 space-y-4">
              <div className="text-xs text-slate-600">
                工單號：<span className="font-mono font-bold text-slate-900">{reassignTicket.id}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  請選擇重新指派之工程師：
                </label>
                <select
                  value={targetEngineerId}
                  onChange={e => setTargetEngineerId(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                >
                  {engineers.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.department}) - {e.extension}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  調度指派原因說明 (將記錄於歷程)：
                </label>
                <textarea
                  value={reassignReason}
                  onChange={e => setReassignReason(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReassignTicket(null)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  確認重新分派
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manager Followup Note Modal (F-402) */}
      {followupTicket && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setFollowupTicket(null)}
          />

          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                填寫客訴關懷與流程覆核說明 (F-402)
              </h3>
              <button
                onClick={() => setFollowupTicket(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFollowupSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  主管關懷處置紀錄：
                </label>
                <textarea
                  value={followupNote}
                  onChange={e => setFollowupNote(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFollowupTicket(null)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                >
                  完成關懷覆核
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
