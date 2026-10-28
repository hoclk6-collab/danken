/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useITSM } from '../../context/ITSMContext';
import { RepairTicket } from '../../types/itsm';
import {
  X,
  Wrench,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Laptop,
  Sparkles,
} from 'lucide-react';

interface InspectionActionModalProps {
  ticket: RepairTicket;
  isOpen: boolean;
  onClose: () => void;
}

export const InspectionActionModal: React.FC<InspectionActionModalProps> = ({
  ticket,
  isOpen,
  onClose,
}) => {
  const {
    completeInternalRepair,
    transferToVendor,
    loaners,
    triggerFSDHighlight,
  } = useITSM();

  const [actionType, setActionType] = useState<'internal' | 'vendor'>('internal');

  // Internal Fix inputs
  const [internalDiagnosis, setInternalDiagnosis] = useState(
    '現場檢測完成，已重新固定螢幕轉軸排線與重整內部散熱膏，並安裝最新驅動，開機測試 30 分鐘顯示訊號無跳動花屏。'
  );

  // Vendor inputs (pre-filled from CMDB asset snapshot)
  const [vendorName, setVendorName] = useState(
    ticket.assetSnapshot.vendorPartner || 'Lenovo 原廠企業服務中心'
  );
  const [contractNo, setContractNo] = useState(
    ticket.assetSnapshot.vendorContractNo || 'LNV-ENT-2024-TW09'
  );
  const [vendorContact, setVendorContact] = useState(
    ticket.assetSnapshot.vendorContact || '聯想企業客服專案工程師'
  );
  const [vendorPhone, setVendorPhone] = useState(
    ticket.assetSnapshot.vendorPhone || '0800-000-702 #4'
  );
  const [logisticsTrackingNo, setLogisticsTrackingNo] = useState(
    `BLACKCAT-${Math.floor(100000000 + Math.random() * 900000000)}`
  );
  const [slaDays, setSlaDays] = useState<number>(3); // 3 working days
  const [etaDate, setEtaDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [faultConfirmed, setFaultConfirmed] = useState(
    '主機板內建顯示晶片 (GPU) 接腳焊點老化微裂，需轉送原廠無塵室進行 BGA 重新植珠封裝檢修。'
  );

  // Loaner device pairing (F-104)
  const availableLoaners = loaners.filter(l => l.status === 'available');
  const [selectedLoanerId, setSelectedLoanerId] = useState<string>(
    availableLoaners[0]?.id || ''
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (actionType === 'internal') {
      completeInternalRepair(ticket.id, internalDiagnosis);
    } else {
      transferToVendor(ticket.id, {
        vendorName,
        contractNo,
        vendorContact,
        vendorPhone,
        logisticsTrackingNo,
        slaDays,
        etaDate,
        faultConfirmed,
        loanerDeviceId: selectedLoanerId || undefined,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                現場檢測判定與處置回報 (F-203)
              </h3>
              <p className="text-[11px] text-slate-500">
                工單號：{ticket.id} · 申報設備：{ticket.assetSnapshot.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          
          {/* Action Choice Tabs */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900">
                檢測結果判定：
              </label>
              <button
                type="button"
                onClick={() => triggerFSDHighlight('F-203')}
                className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>查看 F-203 判定規格</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setActionType('internal')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  actionType === 'internal'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>內部維修完畢 (內部完修)</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  更換備品或現場調校完成，自動發送完修簽收單給使用者 (F-401)。
                </p>
              </button>

              <button
                type="button"
                onClick={() => setActionType('vendor')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  actionType === 'vendor'
                    ? 'border-purple-600 bg-purple-50/70 ring-1 ring-purple-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 text-purple-800 font-bold text-xs mb-1">
                  <Truck className="w-4 h-4" />
                  <span>轉外部原廠維修 (轉外修)</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  涉及主機板大修或原廠零件，自動開立 F-301 單據並觸發 F-104 備用機借用。
                </p>
              </button>
            </div>
          </div>

          {/* Option 1: Internal Fixed */}
          {actionType === 'internal' && (
            <div className="space-y-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
              <label className="block text-xs font-semibold text-emerald-950">
                維修處置說明與更換料件紀錄：
              </label>
              <textarea
                value={internalDiagnosis}
                onChange={e => setInternalDiagnosis(e.target.value)}
                rows={3}
                required
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <p className="text-[11px] text-emerald-800">
                ✓ 提交後工單狀態將立即推進至【待取件/完修 (ready_pickup)】，同仁將收到通知線上簽收。
              </p>
            </div>
          )}

          {/* Option 2: Vendor Repair (F-301) */}
          {actionType === 'vendor' && (
            <div className="space-y-4 bg-purple-50/40 p-4 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-purple-700" />
                  F-301 外部原廠報修單據自動帶入
                </span>
                <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-mono">
                  SLA 追蹤模組
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    原廠/維護廠商名稱：
                  </label>
                  <input
                    type="text"
                    value={vendorName}
                    onChange={e => setVendorName(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    企業維護合約號碼：
                  </label>
                  <input
                    type="text"
                    value={contractNo}
                    onChange={e => setContractNo(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    廠商聯絡窗口：
                  </label>
                  <input
                    type="text"
                    value={vendorContact}
                    onChange={e => setVendorContact(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    廠商專案服務電話：
                  </label>
                  <input
                    type="text"
                    value={vendorPhone}
                    onChange={e => setVendorPhone(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    物流快遞寄送單號 (F-301)：
                  </label>
                  <input
                    type="text"
                    value={logisticsTrackingNo}
                    onChange={e => setLogisticsTrackingNo(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    合約承諾 SLA 門檻 (工作天)：
                  </label>
                  <select
                    value={slaDays}
                    onChange={e => setSlaDays(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value={1}>1 個工作天 (24小時 VIP)</option>
                    <option value={2}>2 個工作天 (48小時)</option>
                    <option value={3}>3 個工作天 (72小時 - 標準)</option>
                    <option value={5}>5 個工作天 (120小時)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    廠商預估完修返還日 (ETA)：
                  </label>
                  <input
                    type="date"
                    value={etaDate}
                    onChange={e => setEtaDate(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  故障確認與維修說明 (Fault Description)：
                </label>
                <textarea
                  value={faultConfirmed}
                  onChange={e => setFaultConfirmed(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                  required
                />
              </div>

              {/* F-104 Auto Loaner Trigger */}
              <div className="pt-3 border-t border-purple-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                    <Laptop className="w-4 h-4 text-indigo-600" />
                    F-104 連動觸發：為同仁配發臨時備用機
                  </span>
                  <span className="text-[11px] text-purple-700">
                    大修期間業務零中斷
                  </span>
                </div>

                <select
                  value={selectedLoanerId}
                  onChange={e => setSelectedLoanerId(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="">暫不配發備用機</option>
                  {availableLoaners.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.model} ({l.serialNumber}) - 在庫可領
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-xs font-medium text-white rounded-lg transition-colors shadow-xs ${
                actionType === 'internal'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {actionType === 'internal' ? '確認內部完修並送簽收' : '開立外修單並啟動 SLA 計時'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
