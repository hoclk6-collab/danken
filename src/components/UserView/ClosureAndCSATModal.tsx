/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useITSM } from '../../context/ITSMContext';
import { RepairTicket } from '../../types/itsm';
import {
  X,
  Star,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ThumbsUp,
  FileCheck,
} from 'lucide-react';

interface ClosureAndCSATModalProps {
  ticket: RepairTicket;
  isOpen: boolean;
  onClose: () => void;
}

export const ClosureAndCSATModal: React.FC<ClosureAndCSATModalProps> = ({
  ticket,
  isOpen,
  onClose,
}) => {
  const { closeTicketWithCSAT, triggerFSDHighlight } = useITSM();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(['處理迅速', '態度良好']);
  const [feedback, setFeedback] = useState<string>('');
  const [confirmedRepaired, setConfirmedRepaired] = useState<boolean>(true);

  if (!isOpen) return null;

  const quickTags = [
    '處理迅速',
    '態度良好',
    '專業解說',
    '設備運作正常',
    '主動回報進度',
    '耗時過久',
    '缺料待調貨',
    '問題未徹底解決',
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedRepaired) return;

    closeTicketWithCSAT(ticket.id, {
      rating,
      tags: selectedTags,
      feedback: feedback.trim(),
    });

    onClose();
  };

  const isLowRating = rating <= 2;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                完修確認與品質滿意度評價
              </h3>
              <p className="text-[11px] text-slate-500">
                F-401 自動完修簽收 · F-402 滿意度回饋 (CSAT)
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* F-401 Confirmation Block */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                F-401 設備修復確認與歸還簽收
              </span>
              <span className="font-mono text-[11px] text-emerald-700 font-semibold">
                {ticket.id}
              </span>
            </div>

            <p className="text-xs text-emerald-900 leading-relaxed">
              維修工程師已回報處置完成：
              <span className="font-medium">
                {ticket.inspectionDiagnosis || '硬體與系統運作檢測正常，已放回座位。'}
              </span>
            </p>

            <label className="flex items-center gap-2.5 pt-2 text-xs font-semibold text-emerald-950 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmedRepaired}
                onChange={e => setConfirmedRepaired(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 border-emerald-300"
                required
              />
              <span>我已確認設備運作正常，同意驗收並結案歸檔</span>
            </label>
          </div>

          {/* F-402 Star Rating */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900">
                F-402 快速滿意度回饋 (1–5 星等)
              </label>
              <button
                type="button"
                onClick={() => triggerFSDHighlight('F-402')}
                className="text-[11px] text-blue-600 hover:underline"
              >
                查看 F-402 低星關懷規格
              </button>
            </div>

            {/* Stars */}
            <div className="flex items-center justify-center gap-2 py-2 bg-slate-50 rounded-xl border border-slate-100">
              {[1, 2, 3, 4, 5].map(star => {
                const isLit = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setRating(star)}
                    className="p-1.5 focus:outline-hidden transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        isLit
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 fill-slate-100'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="text-center text-xs font-medium text-slate-600">
              {rating === 5 && '🌟 非常滿意：服務極佳、迅速修復'}
              {rating === 4 && '👍 滿意：整體流程順暢'}
              {rating === 3 && '👌 普通：符合預期'}
              {rating === 2 && '⚠️ 不滿意：處理偏慢或溝通不良'}
              {rating === 1 && '🚨 非常不滿意：嚴重影響業務工作'}
            </div>

            {/* Low Rating Alert Notice (F-402) */}
            {isLowRating && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-900">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">F-402 主管關懷預警機制：</span>
                  評分低於 3 星時，系統將於結案時自動發送異常客訴單至資訊主管信箱，主管將於 24 小時內啟動專案關懷！
                </div>
              </div>
            )}
          </div>

          {/* Quick Tags */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700">
              快速體驗標籤（點擊選取）：
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickTags.map(tag => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 font-medium'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional feedback */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              其他寶貴建議或改善意見（選填）：
            </label>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="分享您的維修體驗或需要 IT 部門改善之處..."
              rows={2}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              稍後再評
            </button>
            <button
              type="submit"
              disabled={!confirmedRepaired}
              className="px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors shadow-xs"
            >
              確認完修並送出評價
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
