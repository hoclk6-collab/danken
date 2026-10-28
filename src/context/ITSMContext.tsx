/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  CMDBAsset,
  IssueScenario,
  RepairTicket,
  LoanerDevice,
  NotificationItem,
  UserRole,
  CategoryType,
  VendorRepairDetail,
  CSATSurvey,
} from '../types/itsm';
import {
  MOCK_USERS,
  MOCK_CMDB_ASSETS,
  ISSUE_SCENARIOS,
  INITIAL_TICKETS,
  MOCK_LOANER_DEVICES,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';

interface ITSMContextType {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  currentUser: UserProfile;
  users: UserProfile[];
  assets: CMDBAsset[];
  scenarios: IssueScenario[];
  tickets: RepairTicket[];
  loaners: LoanerDevice[];
  notifications: NotificationItem[];
  unreadNotifsCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  
  // Navigation & UI state
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedTicketId: string | null;
  setSelectedTicketId: (id: string | null) => void;
  isFSDDrawerOpen: boolean;
  setIsFSDDrawerOpen: (open: boolean) => void;
  highlightedFSDCode: string | null;
  setHighlightedFSDCode: (code: string | null) => void;
  triggerFSDHighlight: (code: string) => void;
  
  // Business logic actions
  createTicket: (data: {
    scenarioId: string;
    symptoms: string[];
    description: string;
    urgency: 'low' | 'normal' | 'urgent';
    attachmentUrls: string[];
    customAssetId?: string;
  }) => string;
  
  dispatchEngineer: (ticketId: string) => void;
  markAwayFromDesk: (ticketId: string, note: string, rescheduleTime: string) => void;
  completeInternalRepair: (ticketId: string, diagnosis: string) => void;
  transferToVendor: (ticketId: string, vendorData: {
    vendorName: string;
    contractNo: string;
    vendorContact: string;
    vendorPhone: string;
    logisticsTrackingNo: string;
    slaDays: number;
    etaDate: string;
    faultConfirmed: string;
    loanerDeviceId?: string;
  }) => void;
  
  reassignEngineer: (ticketId: string, engineerId: string, reason: string) => void;
  requestLoanerDevice: (ticketId: string, loanerDeviceId: string) => void;
  returnLoanerDevice: (ticketId: string) => void;
  closeTicketWithCSAT: (ticketId: string, csatData: { rating: number; tags: string[]; feedback: string }) => void;
  resolveManagerFollowup: (ticketId: string, note: string) => void;
  sendVendorReminder: (ticketId: string) => void;
  getTicketById: (ticketId: string) => RepairTicket | undefined;
}

const ITSMContext = createContext<ITSMContextType | undefined>(undefined);

export const ITSMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<UserRole>('user');
  const [users] = useState<UserProfile[]>(MOCK_USERS);
  const [assets] = useState<CMDBAsset[]>(MOCK_CMDB_ASSETS);
  const [scenarios] = useState<IssueScenario[]>(ISSUE_SCENARIOS);
  const [tickets, setTickets] = useState<RepairTicket[]>(INITIAL_TICKETS);
  const [loaners, setLoaners] = useState<LoanerDevice[]>(MOCK_LOANER_DEVICES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  
  const [activeTab, setActiveTab] = useState<string>('my_tickets');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(INITIAL_TICKETS[0].id);
  const [isFSDDrawerOpen, setIsFSDDrawerOpen] = useState<boolean>(false);
  const [highlightedFSDCode, setHighlightedFSDCode] = useState<string | null>(null);

  // Current user based on active role
  const currentUser = users.find(u => u.role === activeRole) || users[0];

  // Keep tab in sync when role changes
  useEffect(() => {
    if (activeRole === 'user') {
      setActiveTab('my_tickets');
    } else if (activeRole === 'engineer') {
      setActiveTab('engineer_pool');
    } else if (activeRole === 'manager') {
      setActiveTab('vendor_sla');
    }
  }, [activeRole]);

  const unreadNotifsCount = notifications.filter(
    n => !n.read && (n.targetRole === 'all' || n.targetRole === activeRole)
  ).length;

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const triggerFSDHighlight = (code: string) => {
    setHighlightedFSDCode(code);
    setIsFSDDrawerOpen(true);
    setTimeout(() => {
      const el = document.getElementById(`fsd-target-${code}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  const getTicketById = (ticketId: string) => {
    return tickets.find(t => t.id === ticketId);
  };

  // F-101 & F-102 & F-201: Create Ticket
  const createTicket = (data: {
    scenarioId: string;
    symptoms: string[];
    description: string;
    urgency: 'low' | 'normal' | 'urgent';
    attachmentUrls: string[];
    customAssetId?: string;
  }): string => {
    const scenario = scenarios.find(s => s.id === data.scenarioId) || scenarios[0];
    const assetIdToUse = data.customAssetId || currentUser.boundAssetId;
    const boundAsset = assets.find(a => a.id === assetIdToUse) || assets[0];
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newId = `TKT-${dateStr}-${(tickets.length + 1).toString().padStart(3, '0')}`;

    // Auto-dispatch rule (F-201)
    const assignedEngineer = users.find(u => u.role === 'engineer') || users[1];

    const newTicket: RepairTicket = {
      id: newId,
      createdAt: `${now.toISOString().split('T')[0]} ${timeStr}`,
      updatedAt: `${now.toISOString().split('T')[0]} ${timeStr}`,
      status: 'dispatched',
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      department: currentUser.department,
      extension: currentUser.extension,
      ipAddress: currentUser.ipAddress,
      assetId: boundAsset.id,
      assetSnapshot: boundAsset,
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      category: scenario.category,
      symptoms: data.symptoms,
      description: data.description,
      attachmentUrls: data.attachmentUrls,
      urgency: data.urgency,
      assignedEngineerId: assignedEngineer.id,
      assignedEngineerName: assignedEngineer.name,
      assignedEngineerPhone: `分機 ${assignedEngineer.extension}`,
      loanerRequested: false,
      timeline: [
        {
          id: `EVT-${Date.now()}-1`,
          timestamp: `${now.toISOString().split('T')[0]} ${timeStr}`,
          title: '已收單 (F-101 SSO & CMDB 資產自動帶入)',
          operator: currentUser.name,
          note: `自動帶出 IP: ${currentUser.ipAddress}、分機: ${currentUser.extension}、設備: ${boundAsset.name} (${boundAsset.id})`,
          statusChangeTo: 'received',
        },
        {
          id: `EVT-${Date.now()}-2`,
          timestamp: `${now.toISOString().split('T')[0]} ${timeStr}`,
          title: '智慧派工完成 (F-201)',
          operator: '系統智慧分派引擎',
          note: `依 [${scenario.category.toUpperCase()}] 類別自動分派至值班工程師：${assignedEngineer.name}`,
          statusChangeTo: 'dispatched',
        },
      ],
    };

    setTickets(prev => [newTicket, ...prev]);
    setSelectedTicketId(newId);

    // Push notification to engineer
    const newNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      timestamp: timeStr,
      title: '新報修派工通知 (F-201)',
      message: `${currentUser.name} 申報 [${scenario.title}]，已自動分派給您！`,
      type: 'info',
      ticketId: newId,
      read: false,
      targetRole: 'engineer',
    };
    setNotifications(prev => [newNotif, ...prev]);

    return newId;
  };

  // F-202: Engineer Departure
  const dispatchEngineer = (ticketId: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    setTickets(prev =>
      prev.map(t => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          status: 'inspecting',
          updatedAt: `${now.toISOString().split('T')[0]} ${timeStr}`,
          estimatedArrival: '已出發，預計約 5 分鐘抵達座位',
          engineerDepartedAt: `${now.toISOString().split('T')[0]} ${timeStr}`,
          isAwayFromDesk: false,
          timeline: [
            ...t.timeline,
            {
              id: `EVT-${Date.now()}`,
              timestamp: `${now.toISOString().split('T')[0]} ${timeStr}`,
              title: '工程師點選「出發前往」，發送即時預告 (F-202)',
              operator: currentUser.name,
              note: `工程師已帶齊設備與工具包，正前往 ${t.department} 同仁座位。`,
              statusChangeTo: 'inspecting',
            },
          ],
        };
      })
    );

    // Push notification to user (F-202)
    const targetTicket = tickets.find(t => t.id === ticketId);
    if (targetTicket) {
      setNotifications(prev => [
        {
          id: `NOTIF-${Date.now()}`,
          timestamp: timeStr,
          title: '工程師出發預告 (F-202)',
          message: `工程師 ${currentUser.name} 已點擊「出發前往」，預計 5 分鐘內抵達您的座位，請留意現場檢測！`,
          type: 'info',
          ticketId,
          read: false,
          targetRole: 'user',
        },
        ...prev,
      ]);
    }
  };

  // F-202: Mark Away from Desk
  const markAwayFromDesk = (ticketId: string, note: string, rescheduleTime: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setTickets(prev =>
      prev.map(t => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          isAwayFromDesk: true,
          awayFromDeskNote: note,
          rescheduleTime,
          updatedAt: `${now.toISOString().split('T')[0]} ${timeStr}`,
          timeline: [
            ...t.timeline,
            {
              id: `EVT-${Date.now()}`,
              timestamp: `${now.toISOString().split('T')[0]} ${timeStr}`,
              title: '工程師標註「不在座位」，排定二次預約檢測 (F-202)',
              operator: currentUser.name,
              note: `原因備註：${note}。已自動排定於 ${rescheduleTime} 進行二次檢測。`,
            },
          ],
        };
      })
    );

    setNotifications(prev => [
      {
        id: `NOTIF-${Date.now()}`,
        timestamp: timeStr,
        title: '工程師現場檢測撲空通知 (F-202)',
        message: `工程師剛才抵達但您不在座位。備註：${note}。已為您重新排定：${rescheduleTime}。`,
        type: 'warning',
        ticketId,
        read: false,
        targetRole: 'user',
      },
      ...prev,
    ]);
  };

  // F-203 & F-401: Internal Fix Completed
  const completeInternalRepair = (ticketId: string, diagnosis: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setTickets(prev =>
      prev.map(t => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          status: 'ready_pickup',
          inspectionDiagnosis: diagnosis,
          inspectionAction: 'internal_fixed',
          resolvedAt: `${now.toISOString().split('T')[0]} ${timeStr}`,
          updatedAt: `${now.toISOString().split('T')[0]} ${timeStr}`,
          timeline: [
            ...t.timeline,
            {
              id: `EVT-${Date.now()}`,
              timestamp: `${now.toISOString().split('T')[0]} ${timeStr}`,
              title: '內部檢測完修 (F-203)，發送完修確認單 (F-401)',
              operator: currentUser.name,
              note: `處置說明：${diagnosis}。系統已發送線上完修簽收單給申報同仁。`,
              statusChangeTo: 'ready_pickup',
            },
          ],
        };
      })
    );

    setNotifications(prev => [
      {
        id: `NOTIF-${Date.now()}`,
        timestamp: timeStr,
        title: '設備已內部完修，請簽收 (F-401)',
        message: `您的工單 (${ticketId}) 已檢修完成，請點選「確認簽收」並留下滿意度評價。`,
        type: 'success',
        ticketId,
        read: false,
        targetRole: 'user',
      },
      ...prev,
    ]);
  };

  // F-203, F-301, F-104: Transfer to Vendor
  const transferToVendor = (
    ticketId: string,
    vendorData: {
      vendorName: string;
      contractNo: string;
      vendorContact: string;
      vendorPhone: string;
      logisticsTrackingNo: string;
      slaDays: number;
      etaDate: string;
      faultConfirmed: string;
      loanerDeviceId?: string;
    }
  ) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const deadlineDate = new Date(now.getTime() + vendorData.slaDays * 24 * 60 * 60 * 1000);

    const vendorDetail: VendorRepairDetail = {
      vendorName: vendorData.vendorName,
      contractNo: vendorData.contractNo,
      vendorContact: vendorData.vendorContact,
      vendorPhone: vendorData.vendorPhone,
      sentDate: `${now.toISOString().split('T')[0]} ${timeStr}`,
      logisticsTrackingNo: vendorData.logisticsTrackingNo,
      slaDays: vendorData.slaDays,
      slaDeadline: deadlineDate.toISOString(),
      etaDate: vendorData.etaDate,
      isOverdue: false,
      vendorCaseNo: `VND-RMA-${Date.now().toString().slice(-6)}`,
      faultConfirmed: vendorData.faultConfirmed,
      quoteAmount: 0,
    };

    let allocatedLoanerName = '';
    if (vendorData.loanerDeviceId) {
      const loanerObj = loaners.find(l => l.id === vendorData.loanerDeviceId);
      if (loanerObj) {
        allocatedLoanerName = loanerObj.model;
        setLoaners(prev =>
          prev.map(l =>
            l.id === vendorData.loanerDeviceId
              ? {
                  ...l,
                  status: 'allocated',
                  allocatedToTicketId: ticketId,
                  allocatedToUserName: currentUser.name,
                  allocatedAt: `${now.toISOString().split('T')[0]} ${timeStr}`,
                }
              : l
          )
        );
      }
    }

    setTickets(prev =>
      prev.map(t => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          status: 'vendor_repair',
          inspectionAction: 'transferred_vendor',
          vendorRepair: vendorDetail,
          loanerRequested: !!vendorData.loanerDeviceId,
          loanerDeviceId: vendorData.loanerDeviceId,
          loanerDeviceName: allocatedLoanerName || undefined,
          loanerStatus: vendorData.loanerDeviceId ? 'issued' : undefined,
          updatedAt: `${now.toISOString().split('T')[0]} ${timeStr}`,
          timeline: [
            ...t.timeline,
            {
              id: `EVT-${Date.now()}-1`,
              timestamp: `${now.toISOString().split('T')[0]} ${timeStr}`,
              title: '判定轉送外部原廠維修 (F-203)',
              operator: currentUser.name,
              note: `故障判斷：${vendorData.faultConfirmed}。自動開立原廠報修單 (F-301)。`,
              statusChangeTo: 'vendor_repair',
            },
            {
              id: `EVT-${Date.now()}-2`,
              timestamp: `${now.toISOString().split('T')[0]} ${timeStr}`,
              title: '原廠報修單已開立，物流單號綁定 (F-301)',
              operator: '系統自動連動',
              note: `原廠：${vendorData.vendorName}，物流單號：${vendorData.logisticsTrackingNo}。SLA 限制：${vendorData.slaDays} 個工作天。`,
            },
            ...(vendorData.loanerDeviceId
              ? [
                  {
                    id: `EVT-${Date.now()}-3`,
                    timestamp: `${now.toISOString().split('T')[0]} ${timeStr}`,
                    title: '自動觸發臨時備用機申請與配發 (F-104)',
                    operator: 'MIS 備品管理庫',
                    note: `已配發備用機：${allocatedLoanerName}，請至 8F MIS 機房領取。`,
                  },
                ]
              : []),
          ],
        };
      })
    );

    // Push notification to user
    setNotifications(prev => [
      {
        id: `NOTIF-${Date.now()}`,
        timestamp: timeStr,
        title: '設備已轉外部原廠維修 (F-301 / F-104)',
        message: `您的設備已送至 ${vendorData.vendorName} 原廠維修${
          vendorData.loanerDeviceId ? `，已為您準備好臨時備用機：${allocatedLoanerName}` : ''
        }。`,
        type: 'info',
        ticketId,
        read: false,
        targetRole: 'user',
      },
      ...prev,
    ]);
  };

  // F-201: Reassign Engineer (by Manager)
  const reassignEngineer = (ticketId: string, engineerId: string, reason: string) => {
    const engineer = users.find(u => u.id === engineerId);
    if (!engineer) return;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setTickets(prev =>
      prev.map(t => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          assignedEngineerId: engineer.id,
          assignedEngineerName: engineer.name,
          assignedEngineerPhone: `分機 ${engineer.extension}`,
          updatedAt: `${now.toISOString().split('T')[0]} ${timeStr}`,
          timeline: [
            ...t.timeline,
            {
              id: `EVT-${Date.now()}`,
              timestamp: `${now.toISOString().split('T')[0]} ${timeStr}`,
              title: '主管手動調整指派工程師 (F-201)',
              operator: currentUser.name,
              note: `重新分派至：${engineer.name}。調度原因：${reason}`,
            },
          ],
        };
      })
    );

    setNotifications(prev => [
      {
        id: `NOTIF-${Date.now()}`,
        timestamp: timeStr,
        title: '派工重分配通知 (F-201)',
        message: `工單 ${ticketId} 已由主管重分配給工程師 ${engineer.name}。`,
        type: 'info',
        ticketId,
        read: false,
        targetRole: 'engineer',
      },
      ...prev,
    ]);
  };

  // F-104: Standalone Loaner Request
  const requestLoanerDevice = (ticketId: string, loanerDeviceId: string) => {
    const loaner = loaners.find(l => l.id === loanerDeviceId);
    if (!loaner) return;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setLoaners(prev =>
      prev.map(l =>
        l.id === loanerDeviceId
          ? {
              ...l,
              status: 'allocated',
              allocatedToTicketId: ticketId,
              allocatedToUserName: currentUser.name,
              allocatedAt: `${now.toISOString().split('T')[0]} ${timeStr}`,
            }
          : l
      )
    );

    setTickets(prev =>
      prev.map(t => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          loanerRequested: true,
          loanerDeviceId,
          loanerDeviceName: loaner.model,
          loanerStatus: 'issued',
          updatedAt: `${now.toISOString().split('T')[0]} ${timeStr}`,
          timeline: [
            ...t.timeline,
            {
              id: `EVT-${Date.now()}`,
              timestamp: `${now.toISOString().split('T')[0]} ${timeStr}`,
              title: '使用者借用臨時備用機 (F-104)',
              operator: currentUser.name,
              note: `申請借用 ${loaner.model} (序號: ${loaner.serialNumber})，已排入 MIS 待發放清單。`,
            },
          ],
        };
      })
    );
  };

  // F-104: Return Loaner
  const returnLoanerDevice = (ticketId: string) => {
    const targetTicket = tickets.find(t => t.id === ticketId);
    if (!targetTicket || !targetTicket.loanerDeviceId) return;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setLoaners(prev =>
      prev.map(l =>
        l.id === targetTicket.loanerDeviceId
          ? {
              ...l,
              status: 'available',
              allocatedToTicketId: undefined,
              allocatedToUserName: undefined,
              allocatedAt: undefined,
            }
          : l
      )
    );

    setTickets(prev =>
      prev.map(t => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          loanerStatus: 'returned',
          updatedAt: `${now.toISOString().split('T')[0]} ${timeStr}`,
          timeline: [
            ...t.timeline,
            {
              id: `EVT-${Date.now()}`,
              timestamp: `${now.toISOString().split('T')[0]} ${timeStr}`,
              title: '備用機已完整歸還驗收 (F-104)',
              operator: currentUser.name,
              note: `備用機 ${t.loanerDeviceName} 已歸還 MIS 庫存並重設系統完成。`,
            },
          ],
        };
      })
    );
  };

  // F-401 & F-402: Sign-off & CSAT
  const closeTicketWithCSAT = (
    ticketId: string,
    csatData: { rating: number; tags: string[]; feedback: string }
  ) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const isLowRating = csatData.rating <= 2;

    const csatRecord: CSATSurvey = {
      rating: csatData.rating,
      tags: csatData.tags,
      feedback: csatData.feedback,
      submittedAt: `${now.toISOString().split('T')[0]} ${timeStr}`,
      needsManagerFollowup: isLowRating,
      managerFollowupResolved: false,
    };

    setTickets(prev =>
      prev.map(t => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          status: 'closed',
          closureSignedAt: `${now.toISOString().split('T')[0]} ${timeStr}`,
          csat: csatRecord,
          updatedAt: `${now.toISOString().split('T')[0]} ${timeStr}`,
          timeline: [
            ...t.timeline,
            {
              id: `EVT-${Date.now()}-1`,
              timestamp: `${now.toISOString().split('T')[0]} ${timeStr}`,
              title: '使用者線上簽收完修 (F-401)',
              operator: currentUser.name,
              note: '同仁點選「確認完修無誤」，單據狀態正式變更為【已結案】。',
              statusChangeTo: 'closed',
            },
            {
              id: `EVT-${Date.now()}-2`,
              timestamp: `${now.toISOString().split('T')[0]} ${timeStr}`,
              title: `滿意度評分完成：${csatData.rating} 星 (F-402)`,
              operator: currentUser.name,
              note: `標籤：[${csatData.tags.join(', ')}]。意見回饋：${csatData.feedback || '無額外意見'}。${
                isLowRating ? '【警告】評分低於 3 星，系統自動建立主管關懷追蹤單！' : ''
              }`,
            },
          ],
        };
      })
    );

    // If low rating, send manager alert (F-402)
    if (isLowRating) {
      setNotifications(prev => [
        {
          id: `NOTIF-${Date.now()}`,
          timestamp: timeStr,
          title: '❗ 客訴品質低星關懷告警 (F-402)',
          message: `工單 ${ticketId}（申報人：${currentUser.name}）填寫滿意度為 ${csatData.rating} 星，已自動觸發主管關懷流程！`,
          type: 'alert',
          ticketId,
          read: false,
          targetRole: 'manager',
        },
        ...prev,
      ]);
    }
  };

  // F-402: Manager Follow-up Resolution
  const resolveManagerFollowup = (ticketId: string, note: string) => {
    setTickets(prev =>
      prev.map(t => {
        if (t.id !== ticketId || !t.csat) return t;
        return {
          ...t,
          csat: {
            ...t.csat,
            managerFollowupNote: note,
            managerFollowupResolved: true,
          },
          timeline: [
            ...t.timeline,
            {
              id: `EVT-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
              title: '主管完成客訴關懷與流程覆核 (F-402)',
              operator: currentUser.name,
              note: `主管說明：${note}`,
            },
          ],
        };
      })
    );
  };

  // F-302: Send Vendor Overdue Reminder
  const sendVendorReminder = (ticketId: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setTickets(prev =>
      prev.map(t => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          timeline: [
            ...t.timeline,
            {
              id: `EVT-${Date.now()}`,
              timestamp: `${now.toISOString().split('T')[0]} ${timeStr}`,
              title: '已發送原廠 SLA 逾期催繳信函與專線提醒 (F-302)',
              operator: currentUser.name,
              note: `已透過系統 API 發送 Email 給原廠專案窗口 (${t.vendorRepair?.vendorContact})，要求加速海外備料與派送。`,
            },
          ],
        };
      })
    );

    setNotifications(prev => [
      {
        id: `NOTIF-${Date.now()}`,
        timestamp: timeStr,
        title: 'SLA 逾期催繳郵件已發送 (F-302)',
        message: `已向廠商發送緊急催繳聯絡通知，紀錄已寫入稽核軌跡。`,
        type: 'info',
        ticketId,
        read: false,
        targetRole: 'manager',
      },
      ...prev,
    ]);
  };

  return (
    <ITSMContext.Provider
      value={{
        activeRole,
        setActiveRole,
        currentUser,
        users,
        assets,
        scenarios,
        tickets,
        loaners,
        notifications,
        unreadNotifsCount,
        markNotificationRead,
        markAllNotificationsRead,
        activeTab,
        setActiveTab,
        selectedTicketId,
        setSelectedTicketId,
        isFSDDrawerOpen,
        setIsFSDDrawerOpen,
        highlightedFSDCode,
        setHighlightedFSDCode,
        triggerFSDHighlight,
        createTicket,
        dispatchEngineer,
        markAwayFromDesk,
        completeInternalRepair,
        transferToVendor,
        reassignEngineer,
        requestLoanerDevice,
        returnLoanerDevice,
        closeTicketWithCSAT,
        resolveManagerFollowup,
        sendVendorReminder,
        getTicketById,
      }}
    >
      {children}
    </ITSMContext.Provider>
  );
};

export const useITSM = () => {
  const context = useContext(ITSMContext);
  if (!context) {
    throw new Error('useITSM must be used within an ITSMProvider');
  }
  return context;
};
