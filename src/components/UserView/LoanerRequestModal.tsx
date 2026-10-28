/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useITSM } from '../../context/ITSMContext';
import { RepairTicket } from '../../types/itsm';
import { X, Laptop, CheckCircle2, ShieldCheck, Sparkles, Building2 } from 'lucide-react';

interface LoanerRequestModalProps {
  ticket: RepairTicket;
  isOpen: boolean;
  onClose: () => void;
}

export const LoanerRequestModal: React.FC<LoanerRequestModalProps> = ({
  ticket,
  isOpen,
  onClose,
}) => {
  const { loaners, requestLoanerDevice, triggerFSDHighlight } = useITSM();

  const availableLoaners = loaners.filter(l => l.status === 'available');
  const [selectedLoanerId, setSelectedLoanerId] = useState<string>(
    availableLoaners[0]?.id || ''
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanerId) return;

    requestLoanerDevice(ticket.id, selectedLoanerId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                借用臨時備用機申請 (F-104)
              </h3>
              <p className="text-[11px] text-slate-500">
                原機外修或重大檢修期間，保障同仁業務零中斷
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
            <div className="flex items-center justify-between font-semibold mb-1">
              <span>關聯工單：{ticket.id}</span>
              <button
                type="button"
                onClick={() => triggerFSDHighlight('F-104')}
                className="text-[11px] text-blue-700 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>F-104 規格</span>
              </button>
            </div>
            送修設備為「{ticket.assetSnapshot.name}」。當判定需送外修或等待主機板更換時，系統自動啟用備用機調度服務。
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-2">
              請選擇目前 MIS 庫存可用備用機：
            </label>

            <div className="space-y-2">
              {availableLoaners.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                  目前所有備用機皆已借出，請洽詢 MIS 庫存櫃檯調撥。
                </div>
              ) : (
                availableLoaners.map(l => {
                  const isSelected = selectedLoanerId === l.id;
                  return (
                    <label
                      key={l.id}
                      className={`block p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-500'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2">
                          <input
                            type="radio"
                            name="loaner"
                            value={l.id}
                            checked={isSelected}
                            onChange={() => setSelectedLoanerId(l.id)}
                            className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <div className="font-semibold text-slate-900">{l.model}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{l.type}</div>
                            <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                              資產序號: {l.serialNumber}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">
                          在庫可調配
                        </span>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start gap-2">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800">取件地點：</span>
              請於送出申請後攜帶識別證至「8F 資訊處 MIS 機房庫存櫃檯」完成配發領取。
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!selectedLoanerId}
              className="px-5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors shadow-xs"
            >
              確認申請並建立領用單
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
