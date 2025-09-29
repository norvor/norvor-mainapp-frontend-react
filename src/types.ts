
export enum UserRole {
  TEAM = 'Team',
  MANAGEMENT = 'Management',
  EXECUTIVE = 'Executive',
}

export interface User {
  id: number;
  name: string;
  role: UserRole;
  avatar: string;
  managerId?: number;
  teamIds?: string[]; // Added to associate users with teams
  // HR Info
  title: string;
  department: string;
  email: string;
  phone: string;
  address: string;
  emergencyContact: string;
  leaveBalance?: { [key: string]: number };
}


export interface Contact {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  ownerId: number | null;
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
  userId: number;
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
  ownerId: number;
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
    managerId: number;
    status: ProjectStatus;
    progress: number; // Percentage 0-100
    startDate: string;
    endDate: string;
    memberIds: number[];
}

export interface Task {
    id: number;
    name: string;
    description: string;
    status: TaskStatus;
    assigneeId: number;
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
    userId: number;
    type: LeaveType;
    startDate: string;
    endDate: string;
    status: RequestStatus;
    reason: string;
}

// --- Organiser Types (replaces Structure) ---
export enum OrganiserElementType {
    DEPARTMENT = 'Department',
    TEAM = 'Team',
    ROLE = 'Role',
    SOFTWARE = 'Software',
    PROCESS = 'Process Step',
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
    submittedBy: number; // userId
    teamId: string;
    createdAt: string;
}