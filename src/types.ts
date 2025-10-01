export enum UserRole {
  TEAM = 'Team',
  MANAGEMENT = 'Management',
  EXECUTIVE = 'Executive',
}

export interface Organization {
  id: number;
  name: string;
  has_completed_onboarding: boolean;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  managerId?: string;
  teamIds?: string[];
  title: string;
  department: string;
  email: string;
  phone: string;
  address: string;
  emergencyContact: string;
  leaveBalance?: { [key: string]: number };
  organization: Organization;
}

export interface Company {
  id: number;
  name: string;
  domain: string | null;
  organizationId: number;
}

export interface Contact {
  id: number;
  name: string;
  companyId: number | null;
  email: string;
  phone: string;
  ownerId: string | null;
  createdAt: string;
}

export enum ActivityType {
  CALL = 'Call',
  EMAIL = 'Email',
  MEETING = 'Meeting',
  NOTE = 'Note',
}

export interface Activity {
  id: number;
  type: ActivityType;
  notes: string;
  date: string;
  contactId: number;
  userId: string;
}

export enum DealStage {
  NEW_LEAD = 'New Lead',
  PROPOSAL_SENT = 'Proposal Sent',
  NEGOTIATION = 'Negotiation',
  WON = 'Won',
  LOST = 'Lost',
}

export interface Deal {
  id: number;
  name: string;
  value: number;
  stage: DealStage;
  companyId: number;
  contactId: number;
  ownerId: string;
  closeDate: string;
}

export enum CrmTaskStatus {
    NOT_STARTED = "Not Started",
    IN_PROGRESS = "In Progress",
    COMPLETED = "Completed",
}

export interface CrmTask {
    id: number;
    title: string;
    dueDate: string; // ISO string format
    status: CrmTaskStatus;
    ownerId: string;
    contactId?: number | null;
    dealId?: number | null;
}

export enum ProjectStatus {
    ON_TRACK = 'On Track',
    AT_RISK = 'At Risk',
    OFF_TRACK = 'Off Track',
    COMPLETED = 'Completed',
}

export enum TaskStatus {
    TO_DO = 'To Do',
    IN_PROGRESS = 'In Progress',
    DONE = 'Done',
}

export interface Project {
    id: number;
    name: string;
    managerId: string;
    status: ProjectStatus;
    progress: number;
    startDate: string;
    endDate: string;
    memberIds: string[];
}

export interface Task {
    id: number;
    name: string;
    description: string;
    status: TaskStatus;
    assigneeId: string;
    projectId: number;
    dueDate: string;
}

export interface Team {
    id: string;
    name: string;
}

export enum LeaveType {
    VACATION = 'Vacation',
    SICK = 'Sick Leave',
    PERSONAL = 'Personal Day',
}

export enum RequestStatus {
    PENDING = 'Pending',
    APPROVED = 'Approved',
    DENIED = 'Denied',
}

export interface TimeOffRequest {
    id: number;
    userId: string;
    type: LeaveType;
    startDate: string;
    endDate: string;
    status: RequestStatus;
    reason: string;
}

export enum OrganiserElementType {
    DEPARTMENT = 'Department',
    TEAM = 'Team',
    SOFTWARE = 'Software',
    NORVOR_TOOL = 'Norvor Tool',
}

export interface OrganiserElement {
    id: string;
    parentId: string | null;
    type: OrganiserElementType;
    label: string;
    properties: { [key: string]: any };
}

export enum TicketStatus {
    OPEN = 'Open',
    IN_PROGRESS = 'In Progress',
    CLOSED = 'Closed',
}

export interface Ticket {
    id: number;
    title: string;
    description: string;
    status: TicketStatus;
    submittedBy: string;
    teamId: string;
    createdAt: string;
}