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
  id: string; // Changed from number
  name: string;
  role: UserRole;
  avatar: string;
  managerId?: string; // Changed from number
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


export interface Contact {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  ownerId: string | null; // Changed from number
  createdAt: string;
}

export enum ActivityType {
  CALL = 'Call',
  EMAIL = 'Email',
  MEETING = 'Meeting',
}

export interface Activity {
  id: number;
  type: ActivityType;
  notes: string;
  date: string;
  contactId: number;
  userId: string; // Changed from number
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
  contactId: number;
  ownerId: string; // Changed from number
  closeDate: string;
}

// --- Project Management Types ---

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
    managerId: string; // Changed from number
    status: ProjectStatus;
    progress: number;
    startDate: string;
    endDate: string;
    memberIds: string[]; // Changed from number[]
}

export interface Task {
    id: number;
    name: string;
    description: string;
    status: TaskStatus;
    assigneeId: string; // Changed from number
    projectId: number;
    dueDate: string;
}

// --- Team Type ---
export interface Team {
    id: string;
    name: string;
}

// --- HR Types ---
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
    userId: string; // Changed from number
    type: LeaveType;
    startDate: string;
    endDate: string;
    status: RequestStatus;
    reason: string;
}

// --- Organiser Types ---
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


// --- Ticket / Request Types ---
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
    submittedBy: string; // Changed from number
    teamId: string;
    createdAt: string;
}