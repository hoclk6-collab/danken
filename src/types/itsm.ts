/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'user' | 'engineer' | 'manager';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  department: string;
  extension: string;
  ipAddress: string;
  avatar: string;
  role: UserRole;
  boundAssetId: string;
}

export interface CMDBAsset {
  id: string; // e.g. "AST-2024-0892"
  name: string;
  type: '筆記型電腦' | '桌上型主機' | '螢幕設備' | '辦公印表機' | '網路設備' | '外接週邊';
  brand: string;
  model: string;
  serialNumber: string;
  assignedUserId: string;
  assignedUserName: string;
  department: string;
  ipAddress: string;
  macAddress: string;
  purchaseDate: string;
  warrantyEndDate: string;
  warrantyStatus: '保固中' | '已過保' | '企業專屬維護約';
  vendorPartner: string;
  vendorContractNo: string;
  vendorContact: string;
  vendorPhone: string;
}

export type TicketStatus = 
  | 'received'       // 已收單
  | 'dispatched'     // 已派工
  | 'inspecting'     // 檢測中 (工程師出發 / 現場檢測)
  | 'vendor_repair'  // 送外修
  | 'ready_pickup'   // 待取件 / 完修待驗
  | 'closed';        // 已結案

export type CategoryType = 'hardware' | 'network' | 'software' | 'peripheral';

export interface IssueScenario {
  id: string;
  code: string;
  title: string;
  description: string;
  category: CategoryType;
  iconName: string;
  commonSymptoms: string[];
  recommendedCheck: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  operator: string;
  note?: string;
  statusChangeTo?: TicketStatus;
}

export interface VendorRepairDetail {
  vendorName: string;
  contractNo: string;
  vendorContact: string;
  vendorPhone: string;
  sentDate: string;
  logisticsTrackingNo: string;
  slaDays: number; // e.g., 3 working days (72 hours)
  slaDeadline: string; // ISO string
  etaDate: string;
  isOverdue: boolean;
  vendorCaseNo: string;
  faultConfirmed: string;
  quoteAmount?: number;
}

export interface LoanerDevice {
  id: string;
  model: string;
  type: string;
  serialNumber: string;
  status: 'available' | 'allocated' | 'maintenance';
  allocatedToTicketId?: string;
  allocatedToUserName?: string;
  allocatedAt?: string;
}

export interface CSATSurvey {
  rating: number; // 1 to 5
  tags: string[]; // e.g., '處理迅速', '態度良好', '專業解說'
  feedback?: string;
  submittedAt: string;
  needsManagerFollowup: boolean; // true if rating <= 2
  managerFollowupNote?: string;
  managerFollowupResolved?: boolean;
}

export interface RepairTicket {
  id: string; // e.g., "TKT-20261026-004"
  createdAt: string;
  updatedAt: string;
  status: TicketStatus;
  
  // Requester (F-101)
  requesterId: string;
  requesterName: string;
  department: string;
  extension: string;
  ipAddress: string;
  assetId: string;
  assetSnapshot: CMDBAsset;
  
  // Issue Info (F-102)
  scenarioId: string;
  scenarioTitle: string;
  category: CategoryType;
  symptoms: string[];
  description: string;
  attachmentUrls: string[];
  urgency: 'low' | 'normal' | 'urgent';
  
  // IT Back-End (F-201, F-202, F-203)
  assignedEngineerId?: string;
  assignedEngineerName?: string;
  assignedEngineerPhone?: string;
  estimatedArrival?: string; // e.g. "約 5 分鐘後抵達"
  engineerDepartedAt?: string;
  isAwayFromDesk?: boolean;
  awayFromDeskNote?: string;
  rescheduleTime?: string;
  inspectionDiagnosis?: string;
  inspectionAction?: 'internal_fixed' | 'transferred_vendor' | 'pending_parts';
  
  // Loaner (F-104)
  loanerRequested: boolean;
  loanerDeviceId?: string;
  loanerDeviceName?: string;
  loanerStatus?: 'requested' | 'issued' | 'returned';
  
  // Vendor (F-301, F-302)
  vendorRepair?: VendorRepairDetail;
  
  // Closure & CSAT (F-401, F-402)
  resolvedAt?: string;
  closureSignedAt?: string;
  csat?: CSATSurvey;
  
  // Audit Timeline
  timeline: TimelineEvent[];
}

export interface NotificationItem {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  ticketId: string;
  read: boolean;
  targetRole: UserRole | 'all';
}

export interface FSDCriterion {
  code: string;
  title: string;
  module: string;
  logic: string;
  acceptance: string;
  testedScenarioName: string;
}
