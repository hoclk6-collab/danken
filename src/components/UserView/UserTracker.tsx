/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useITSM } from '../../context/ITSMContext';
import { TicketStatus, RepairTicket } from '../../types/itsm';
import { ClosureAndCSATModal } from './ClosureAndCSATModal';
import { LoanerRequestModal } from './LoanerRequestModal';
import {
  CheckCircle2,
  Clock,
  Wrench,
  Truck,
  PackageCheck,
  Archive,
  User,
  Phone,
  Laptop,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Calendar,
  FileText,
  Star,
  ShieldCheck,
} from 'lucide-react';

export const UserTracker: React.FC = () => {
  const {
    tickets,
    selectedTicketId,
    setSelectedTicketId,
    currentUser,
    triggerFSDHighlight,
    setActiveTab,
  } = useITSM();

  const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
  const [isLoanerModalOpen, setIsLoanerModalOpen] = useState(false);

  // Tickets belonging to current user or all if looking at demo
  const userTickets = tickets.filter(
    t => t.requesterId === currentUser.id || t.requesterName.includes('林怡君')
  );

  const activeTicket =
    tickets.find(t => t.id === selectedTicketId) || userTickets[0] || tickets[0];

  const steps: { key: TicketStatus; label: string; icon: React.ReactNode }[] = [
    { key: 'received', label: '已收單', icon: <FileText className="w-4 h-4" /> },
    { key: 'dispatched', label: '已派工', icon: <User className="w-4 h-4" /> },
    { key: 'inspecting', label: '檢測中', icon: <Wrench className="w-4 h-4" /> },
    { key: 'vendor_repair', label: '送外修', icon: <Truck className="w-4 h-4" /> },
    { key: 'ready_pickup', label: '待取件/完修', icon: <PackageCheck className="w-4 h-4" /> },
    { key: 'closed', label: '已結案', icon: <Archive className="w-4 h-4" /> },
  ];

  const statusOrder: Record<TicketStatus, number> = {
    received: 0,
    dispatched: 1,
    inspecting: 2,
    vendor_repair: 3,
    ready_pickup: 4,
    closed: 5,
  };

  const getStepState = (stepKey: TicketStatus, currentStatus: TicketStatus) => {
    // If currentStatus is ready_pickup or closed and didn't go through vendor repair, vendor repair can be bypassed or completed
    const currentIdx = statusOrder[currentStatus];
    const stepIdx = statusOrder[stepKey];

    if (currentStatus === stepKey) return 'current';
    if (currentIdx > stepIdx) return 'completed';
    return 'upcoming';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Top Banner introducing F-103 */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              IT 追蹤看板 (IT Tracker)
            </h1>
            <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
              模組一 · F-103
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            即時呈現報修單生命週期進度條、處理工程師資訊、抵達預告與歷程紀錄。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('new_repair')}
            className="text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            + 申報新案件
          </button>
          <button
            type="button"
            onClick={() => triggerFSDHighlight('F-103')}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>F-103 驗收規格</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: My Tickets List */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs h-fit space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              我的報修單據清單
            </span>
            <span className="font-mono text-xs text-slate-400">
              共 {tickets.length} 筆
            </span>
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {tickets.map(t => {
              const isSelected = activeTicket?.id === t.id;
              const isUserTicket = t.requesterId === currentUser.id;

              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-semibold text-slate-900">
                      {t.id}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {t.createdAt.split(' ')[0]}
                    </span>
                  </div>

                  <div className="text-xs font-medium text-slate-800 truncate mb-1">
                    {t.scenarioTitle}
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 truncate max-w-[140px]">
                      {t.requesterName}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        t.status === 'inspecting'
                          ? 'bg-amber-100 text-amber-800'
                          : t.status === 'vendor_repair'
                          ? 'bg-purple-100 text-purple-800'
                          : t.status === 'ready_pickup'
                          ? 'bg-emerald-100 text-emerald-800'
                          : t.status === 'closed'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {t.status === 'received' && '已收單'}
                      {t.status === 'dispatched' && '已派工'}
                      {t.status === 'inspecting' && '檢測中'}
                      {t.status === 'vendor_repair' && '送外修'}
                      {t.status === 'ready_pickup' && '待取件/完修'}
                      {t.status === 'closed' && '已結案'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Main Column: Active Ticket F-103 Visual Stepper & Details */}
        <div className="lg:col-span-2 space-y-5">
          {activeTicket ? (
            <>
              {/* Stepper Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
                
                {/* Stepper Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900 font-mono">
                        {activeTicket.id}
                      </h2>
                      {activeTicket.urgency === 'urgent' && (
                        <span className="px-2 py-0.5 text-[10px] bg-red-100 text-red-700 font-bold rounded">
                          🔥 急迫案件
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      申報設備：{activeTicket.assetSnapshot.name} ({activeTicket.assetId}) · 申報人：{activeTicket.requesterName}
                    </p>
                  </div>

                  {/* Actions for current status */}
                  <div className="flex items-center gap-2">
                    {activeTicket.status === 'ready_pickup' && (
                      <button
                        onClick={() => setIsClosureModalOpen(true)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <PackageCheck className="w-4 h-4" />
                        <span>確認完修並簽收 (F-401)</span>
                      </button>
                    )}

                    {activeTicket.status === 'vendor_repair' && !activeTicket.loanerRequested && (
                      <button
                        onClick={() => setIsLoanerModalOpen(true)}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Laptop className="w-4 h-4" />
                        <span>借用臨時備用機 (F-104)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Visual Progress Bar (F-103) */}
                <div className="py-2">
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                    {steps.map((st, idx) => {
                      const state = getStepState(st.key, activeTicket.status);
                      return (
                        <div
                          key={st.key}
                          className={`flex flex-col items-center text-center p-2 rounded-lg border transition-all ${
                            state === 'current'
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : state === 'completed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center mb-1.5 text-xs font-bold ${
                              state === 'current'
                                ? 'bg-white text-blue-600'
                                : state === 'completed'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {state === 'completed' ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              st.icon
                            )}
                          </div>
                          <span className="text-[11px] font-semibold tracking-tight">
                            {st.label}
                          </span>
                          <span
                            className={`text-[9px] mt-0.5 ${
                              state === 'current'
                                ? 'text-blue-100'
                                : state === 'completed'
                                ? 'text-emerald-700 font-mono'
                                : 'text-slate-400'
                            }`}
                          >
                            {state === 'current' && '處理中'}
                            {state === 'completed' && '已完成'}
                            {state === 'upcoming' && '待進入'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Engineer Departure & ETA Card (F-202) */}
                {activeTicket.assignedEngineerName && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {activeTicket.assignedEngineerName.slice(0, 1)}
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">當前指派資訊工程師</div>
                        <div className="text-sm font-bold text-slate-900">
                          {activeTicket.assignedEngineerName}
                        </div>
                        <div className="text-xs text-slate-600 flex items-center gap-2 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{activeTicket.assignedEngineerPhone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right bg-white sm:bg-transparent p-2.5 sm:p-0 rounded-lg border sm:border-0 border-slate-200">
                      <div className="text-[11px] text-slate-400">預計處理 / 到場動態</div>
                      <div className="text-xs font-semibold text-blue-700 mt-0.5">
                        {activeTicket.estimatedArrival || '已排入工單佇列，將依急迫度處理'}
                      </div>
                      {activeTicket.isAwayFromDesk && (
                        <div className="text-[11px] text-amber-700 font-medium mt-1 flex items-center gap-1 sm:justify-end">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>曾到場撲空，二次預約：{activeTicket.rescheduleTime}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Loaner Machine Notice (F-104) */}
                {activeTicket.loanerRequested && (
                  <div className="p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <Laptop className="w-5 h-5 text-indigo-700 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-indigo-950">
                          F-104 臨時備用機配發中
                        </div>
                        <div className="text-xs text-indigo-800">
                          已為您登記配發：{activeTicket.loanerDeviceName}（狀態：
                          {activeTicket.loanerStatus === 'issued' ? '已領用' : '待領取'}）
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-indigo-700 bg-white px-2.5 py-1 rounded-md border border-indigo-200 font-medium shrink-0">
                      8F MIS 機房借用
                    </span>
                  </div>
                )}

                {/* CSAT Display if closed (F-402) */}
                {activeTicket.csat && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        已完成滿意度評價 (F-402)
                      </span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(st => (
                          <Star
                            key={st}
                            className={`w-3.5 h-3.5 ${
                              activeTicket.csat!.rating >= st
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeTicket.csat.tags.map(tg => (
                        <span
                          key={tg}
                          className="text-[11px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-medium"
                        >
                          {tg}
                        </span>
                      ))}
                    </div>
                    {activeTicket.csat.feedback && (
                      <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100">
                        「{activeTicket.csat.feedback}」
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Problem Details & Attachment Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
                  故障申報特徵與補充說明 (F-102)
                </h3>

                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-1.5">
                    勾選之具體徵狀：
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeTicket.symptoms.map(s => (
                      <span
                        key={s}
                        className="px-2.5 py-1 text-xs bg-slate-100 text-slate-800 rounded-md font-medium"
                      >
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-1">
                    詳細描述備註：
                  </div>
                  <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                    {activeTicket.description}
                  </div>
                </div>

                {activeTicket.attachmentUrls.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-slate-700 mb-2">
                      上傳之故障照片 / 螢幕截圖：
                    </div>
                    <div className="flex gap-3">
                      {activeTicket.attachmentUrls.map((img, i) => (
                        <a
                          key={i}
                          href={img}
                          target="_blank"
                          rel="noreferrer"
                          className="w-24 h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 block group"
                        >
                          <img
                            src={img}
                            alt="Attachment"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline Audit Trail */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
                  工單流轉歷程與稽核軌跡 (Audit Log)
                </h3>

                <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {activeTicket.timeline.map((ev, idx) => (
                    <div key={ev.id} className="relative">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white" />
                      <div className="flex items-center justify-between text-xs mb-0.5">
                        <span className="font-semibold text-slate-900">{ev.title}</span>
                        <span className="font-mono text-[11px] text-slate-400">
                          {ev.timestamp}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">經辦人員：{ev.operator}</div>
                      {ev.note && (
                        <div className="text-xs text-slate-700 mt-1 bg-slate-50 p-2 rounded border border-slate-100">
                          {ev.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
              請從左側點選工單檢視追蹤進度
            </div>
          )}
        </div>

      </div>

      {/* Modals */}
      {activeTicket && (
        <>
          <ClosureAndCSATModal
            ticket={activeTicket}
            isOpen={isClosureModalOpen}
            onClose={() => setIsClosureModalOpen(false)}
          />
          <LoanerRequestModal
            ticket={activeTicket}
            isOpen={isLoanerModalOpen}
            onClose={() => setIsLoanerModalOpen(false)}
          />
        </>
      )}

    </div>
  );
};
