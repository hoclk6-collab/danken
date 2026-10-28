/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useITSM } from '../../context/ITSMContext';
import {
  Monitor,
  WifiOff,
  Printer,
  AlertTriangle,
  Keyboard,
  PowerOff,
  Upload,
  CheckCircle2,
  Info,
  ShieldCheck,
  Send,
  Sparkles,
  Laptop,
  Image as ImageIcon,
  X,
} from 'lucide-react';

export const SmartRepairForm: React.FC = () => {
  const {
    currentUser,
    assets,
    scenarios,
    createTicket,
    setActiveTab,
    triggerFSDHighlight,
  } = useITSM();

  // Selected asset (default to bound asset)
  const [selectedAssetId, setSelectedAssetId] = useState(currentUser.boundAssetId);
  const selectedAsset = assets.find(a => a.id === selectedAssetId) || assets[0];

  // Selected scenario
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(scenarios[0].id);
  const activeScenario = scenarios.find(s => s.id === selectedScenarioId) || scenarios[0];

  // Selected symptoms
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'urgent'>('normal');

  // Simulated photo upload
  const [attachments, setAttachments] = useState<string[]>([
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80',
  ]);

  const scenarioIcons: Record<string, React.ReactNode> = {
    Monitor: <Monitor className="w-5 h-5" />,
    WifiOff: <WifiOff className="w-5 h-5" />,
    Printer: <Printer className="w-5 h-5" />,
    AlertTriangle: <AlertTriangle className="w-5 h-5" />,
    Keyboard: <Keyboard className="w-5 h-5" />,
    PowerOff: <PowerOff className="w-5 h-5" />,
  };

  const handleScenarioSelect = (id: string) => {
    setSelectedScenarioId(id);
    setSelectedSymptoms([]);
  };

  const toggleSymptom = (sym: string) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const handleAddSampleImage = () => {
    if (attachments.length >= 3) return;
    const samples = [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    ];
    setAttachments([...attachments, samples[attachments.length % samples.length]]);
  };

  const handleRemoveImage = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSymptoms =
      selectedSymptoms.length > 0
        ? selectedSymptoms
        : [activeScenario.commonSymptoms[0] || '一般異常'];
    
    createTicket({
      scenarioId: selectedScenarioId,
      symptoms: finalSymptoms,
      description: description.trim() || `${activeScenario.title}，請派員協助檢測。`,
      urgency,
      attachmentUrls: attachments,
      customAssetId: selectedAssetId,
    });

    setActiveTab('my_tickets');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Banner introducing F-101 and F-102 */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              智慧報修申請表
            </h1>
            <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
              模組一 · F-101 / F-102
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            透過情境圖文點選替代傳統空白表單，系統已自動帶入您的 HR 資料與 CMDB 資產庫。
          </p>
        </div>

        <button
          type="button"
          onClick={() => triggerFSDHighlight('F-101')}
          className="self-start sm:self-auto text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>查看 F-101/F-102 規格要求</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: F-101 SSO & CMDB Auto-Population */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-semibold text-slate-900">
                F-101: SSO 與 CMDB 資產自動帶入 (免手動填寫)
              </h2>
            </div>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              已自 HR / CMDB 自動同步
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Requester Profile */}
            <div className="bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/80">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                申報人個人資料 (HR 資料庫)
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">同仁姓名:</span>
                  <span className="font-semibold text-slate-900">{currentUser.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">所屬部門:</span>
                  <span>{currentUser.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">分機號碼:</span>
                  <span className="font-mono">{currentUser.extension}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">目前 IP 位址:</span>
                  <span className="font-mono text-blue-700">{currentUser.ipAddress}</span>
                </div>
              </div>
            </div>

            {/* Bound CMDB Asset */}
            <div className="bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  關聯故障設備 (CMDB 資產庫)
                </div>
                <select
                  value={selectedAssetId}
                  onChange={e => setSelectedAssetId(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded px-2 py-0.5 text-slate-700 font-medium"
                >
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">設備型號:</span>
                  <span className="font-semibold text-slate-900">{selectedAsset.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">資產編號:</span>
                  <span className="font-mono text-blue-700">{selectedAsset.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">硬體序號:</span>
                  <span className="font-mono">{selectedAsset.serialNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">保固狀態:</span>
                  <span className="text-emerald-700 font-medium">
                    {selectedAsset.warrantyStatus} (至 {selectedAsset.warrantyEndDate})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: F-102 Contextual 6 Scenarios */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-semibold text-slate-900">
                F-102: 情境化圖文選單 (點選主要故障情境)
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">
              點擊圖示帶入專屬特徵清單
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            {scenarios.map(sc => {
              const isSelected = selectedScenarioId === sc.id;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => handleScenarioSelect(sc.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all relative ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-500'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {scenarioIcons[sc.iconName] || <Monitor className="w-5 h-5" />}
                  </div>
                  <div className="text-xs font-semibold text-slate-900 leading-snug">
                    {sc.title}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                    {sc.description}
                  </p>
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Dynamic symptom picker based on active scenario */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-2">
                請勾選符合的具體徵狀（可複選，引導精確派工）：
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeScenario.commonSymptoms.map(sym => {
                  const isChecked = selectedSymptoms.includes(sym);
                  return (
                    <label
                      key={sym}
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-blue-50/90 border-blue-400 text-blue-900 font-medium'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSymptom(sym)}
                        className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span className="leading-tight">{sym}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Quick check tip */}
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-900">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">IT 自檢建議：</span>
                {activeScenario.recommendedCheck}
              </div>
            </div>

            {/* Supplementary Details */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                補充說明或現場狀況備註：
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="例如：何時開始發生、是否有特定操作動作導致、是否有出現錯誤代碼..."
                rows={2}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Photo Upload (max 3) & Urgency */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                故障照片 / 螢幕截圖上傳 (最多 3 張)
              </h2>
              <p className="text-[11px] text-slate-500">
                可上傳錯誤代碼截圖、主機燈號照片或破圖外觀，協助工程師攜帶適當零件。
              </p>
            </div>
            <span className="font-mono text-xs text-slate-400">
              {attachments.length} / 3 張
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {attachments.map((url, idx) => (
              <div
                key={idx}
                className="relative group w-24 h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0"
              >
                <img
                  src={url}
                  alt={`Attachment ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors opacity-90 group-hover:opacity-100"
                  title="移除此圖片"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {attachments.length < 3 && (
              <button
                type="button"
                onClick={handleAddSampleImage}
                className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 flex flex-col items-center justify-center text-slate-500 hover:text-blue-600 transition-all shrink-0 text-center p-2"
              >
                <Upload className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-medium leading-tight">
                  新增截圖/照片
                </span>
              </button>
            )}
          </div>

          {/* Urgency Level */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-800">
                工單急迫度評定：
              </span>
              <p className="text-[11px] text-slate-500">
                若因設備故障導致重大業務或會議全面停擺，請勾選「急迫 (高優先)」
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUrgency('normal')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  urgency === 'normal'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                一般案件 (標準排程)
              </button>
              <button
                type="button"
                onClick={() => setUrgency('urgent')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  urgency === 'urgent'
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-white text-red-600 border-red-200 hover:bg-red-50'
                }`}
              >
                🔥 急迫 (影響重要會議/客戶提案)
              </button>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-500">
            送出後系統將立即進行智慧派工 (F-201) 並同步推播通知
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-xs transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>立即送出智慧報修單</span>
          </button>
        </div>

      </form>
    </div>
  );
};
