
import { User, UserRole, Contact, Deal, DealStage, Activity, ActivityType, Project, Task, ProjectStatus, TaskStatus, Team, TimeOffRequest, LeaveType, RequestStatus, OrganiserElement, OrganiserElementType, OrganiserConnection } from '../types';

export const USERS: User[] = [
  { 
    id: 1, name: 'Alex Johnson', role: UserRole.TEAM, avatar: 'https://picsum.photos/id/1005/200/200', managerId: 3,
    title: 'Sales Representative', department: 'Sales', email: 'alex.j@norvor.com', phone: '555-1111', address: '123 Market St, San Francisco, CA', emergencyContact: 'Jane Doe 555-1112', 
    leaveBalance: { 'Vacation': 10, 'Sick Leave': 5 },
  },
  { 
    id: 2, name: 'Brenda Smith', role: UserRole.TEAM, avatar: 'https://picsum.photos/id/1011/200/200', managerId: 3,
    title: 'Sales Representative', department: 'Sales', email: 'brenda.s@norvor.com', phone: '555-2222', address: '456 Oak Ave, San Francisco, CA', emergencyContact: 'John Smith 555-2223', 
    leaveBalance: { 'Vacation': 12, 'Sick Leave': 8 },
  },
  { 
    id: 3, name: 'Charles Brown', role: UserRole.MANAGEMENT, avatar: 'https://picsum.photos/id/1025/200/200',
    title: 'Sales Manager', department: 'Sales', email: 'charles.b@norvor.com', phone: '555-3333', address: '789 Pine Ln, San Francisco, CA', emergencyContact: 'Mary Brown 555-3334', 
    leaveBalance: { 'Vacation': 15, 'Sick Leave': 10 },
  },
  { 
    id: 4, name: 'Diana Green', role: UserRole.EXECUTIVE, avatar: 'https://picsum.photos/id/1027/200/200',
    title: 'CEO', department: 'Executive', email: 'diana.g@norvor.com', phone: '555-4444', address: '101 Hillside Dr, San Francisco, CA', emergencyContact: 'Peter Green 555-4445',
    leaveBalance: { 'Vacation': 20, 'Sick Leave': 10 },
  },
  { 
    id: 5, name: 'Ethan Hunt', role: UserRole.TEAM, avatar: 'https://picsum.photos/id/10/200/200', managerId: 3,
    title: 'Account Executive', department: 'Sales', email: 'ethan.h@norvor.com', phone: '555-5555', address: '210 River Rd, San Francisco, CA', emergencyContact: 'Sarah Hunt 555-5556',
    leaveBalance: { 'Vacation': 8, 'Sick Leave': 3 },
  },
];

export const TEAMS: Team[] = [
    { id: 'bd1', name: 'BD Team 1' },
    { id: 'dev1', name: 'Dev Team 1' },
    { id: 'dev2', name: 'Dev Team 2' },
];

export const CONTACTS: Contact[] = [
  { id: 101, name: 'InnoTech Solutions', company: 'InnoTech', email: 'contact@innotech.com', phone: '555-0101', ownerId: 1, createdAt: '2023-10-01' },
  { id: 102, name: 'Quantum Dynamics', company: 'Quantum', email: 'info@quantum.com', phone: '555-0102', ownerId: 1, createdAt: '2023-10-05' },
  { id: 103, name: 'Apex Innovations', company: 'Apex', email: 'sales@apex.com', phone: '555-0103', ownerId: 2, createdAt: '2023-10-10' },
  { id: 104, name: 'Stellar Corp', company: 'Stellar', email: 'support@stellar.com', phone: '555-0104', ownerId: 2, createdAt: '2023-10-12' },
  { id: 105, name: 'Fusion Enterprises', company: 'Fusion', email: 'hello@fusion.com', phone: '555-0105', ownerId: 5, createdAt: '2023-10-15' },
  { id: 106, name: 'Zenith Systems', company: 'Zenith', email: 'connect@zenith.com', phone: '555-0106', ownerId: null, createdAt: '2023-10-20' },
  { id: 107, name: 'Nova Industries', company: 'Nova', email: 'inquiries@nova.com', phone: '555-0107', ownerId: null, createdAt: '2023-10-22' },
];

export const DEALS: Deal[] = [
  { id: 201, name: 'InnoTech Website Relaunch', value: 50000, stage: DealStage.PROPOSAL_SENT, contactId: 101, ownerId: 1, closeDate: '2024-08-30' },
  { id: 202, name: 'Quantum AI Integration', value: 75000, stage: DealStage.NEGOTIATION, contactId: 102, ownerId: 1, closeDate: '2024-09-15' },
  { id: 203, name: 'Apex Cloud Migration', value: 30000, stage: DealStage.WON, contactId: 103, ownerId: 2, closeDate: '2024-07-20' },
  { id: 204, name: 'Stellar Marketing Campaign', value: 25000, stage: DealStage.NEW_LEAD, contactId: 104, ownerId: 2, closeDate: '2024-09-01' },
  { id: 205, name: 'Fusion Data Analytics', value: 60000, stage: DealStage.LOST, contactId: 105, ownerId: 5, closeDate: '2024-07-10' },
  { id: 206, name: 'InnoTech Support Contract', value: 15000, stage: DealStage.NEW_LEAD, contactId: 101, ownerId: 1, closeDate: '2024-10-01' },
  { id: 207, name: 'Apex Security Audit', value: 22000, stage: DealStage.PROPOSAL_SENT, contactId: 103, ownerId: 2, closeDate: '2024-08-25' },
  { id: 208, name: 'Fusion CRM Setup', value: 45000, stage: DealStage.NEGOTIATION, contactId: 105, ownerId: 5, closeDate: '2024-09-10' },
  { id: 209, name: 'Stellar HR Software', value: 90000, stage: DealStage.WON, contactId: 104, ownerId: 2, closeDate: '2024-06-30' },
];

export const ACTIVITIES: Activity[] = [
  { id: 301, type: ActivityType.CALL, notes: 'Initial discovery call with InnoTech CTO.', date: '2023-10-02', contactId: 101, userId: 1 },
  { id: 302, type: ActivityType.EMAIL, notes: 'Sent proposal for website relaunch.', date: '2023-10-15', contactId: 101, userId: 1 },
  { id: 303, type: ActivityType.MEETING, notes: 'Met with Apex team to discuss cloud options.', date: '2023-10-11', contactId: 103, userId: 2 },
  { id: 304, type: ActivityType.CALL, notes: 'Follow-up call with Quantum Dynamics.', date: '2023-10-20', contactId: 102, userId: 1 },
];

export const PROJECTS: Project[] = [
    { id: 501, name: 'Q3 Marketing Campaign', managerId: 3, status: ProjectStatus.ON_TRACK, progress: 75, startDate: '2024-07-01', endDate: '2024-09-30', memberIds: [1, 2, 5] },
    { id: 502, name: 'New CRM Feature Development', managerId: 3, status: ProjectStatus.AT_RISK, progress: 40, startDate: '2024-08-15', endDate: '2024-11-15', memberIds: [1, 5] },
    { id: 503, name: '2024 Annual Sales Summit', managerId: 3, status: ProjectStatus.COMPLETED, progress: 100, startDate: '2024-01-10', endDate: '2024-04-20', memberIds: [1, 2] },
];

export const TASKS: Task[] = [
    // Project 501
    { id: 601, name: 'Draft campaign brief', description: 'Create the initial brief for the Q3 campaign, outlining goals, target audience, and budget.', status: TaskStatus.DONE, assigneeId: 1, projectId: 501, dueDate: '2024-07-10' },
    { id: 602, name: 'Design ad creatives', description: 'Develop visual assets for the social media and display ads.', status: TaskStatus.IN_PROGRESS, assigneeId: 2, projectId: 501, dueDate: '2024-08-01' },
    { id: 603, name: 'Set up tracking URLs', description: 'Generate and test all tracking links for the campaign assets.', status: TaskStatus.TO_DO, assigneeId: 5, projectId: 501, dueDate: '2024-08-15' },
    { id: 604, name: 'Launch PPC campaign', description: 'Finalize keywords and launch the Google Ads campaign.', status: TaskStatus.TO_DO, assigneeId: 1, projectId: 501, dueDate: '2024-09-01' },
    // Project 502
    { id: 605, name: 'Gather user requirements', description: 'Interview sales team for feedback on the proposed CRM feature.', status: TaskStatus.DONE, assigneeId: 5, projectId: 502, dueDate: '2024-08-25' },
    { id: 606, name: 'Create wireframes', description: 'Design the UI/UX for the new contact import feature.', status: TaskStatus.IN_PROGRESS, assigneeId: 1, projectId: 502, dueDate: '2024-09-10' },
    { id: 607, name: 'Develop backend API', description: 'Build the necessary API endpoints to support the feature.', status: TaskStatus.TO_DO, assigneeId: 1, projectId: 502, dueDate: '2024-10-01' },
    // Project 503
    { id: 608, name: 'Book venue', description: 'Finalize and book the venue for the sales summit.', status: TaskStatus.DONE, assigneeId: 2, projectId: 503, dueDate: '2024-01-20' },
    { id: 609, name: 'Send invitations', description: 'Design and send out invitations to all attendees.', status: TaskStatus.DONE, assigneeId: 1, projectId: 503, dueDate: '2024-02-15' },
];

export const TIME_OFF_REQUESTS: TimeOffRequest[] = [
    { id: 401, userId: 1, type: LeaveType.VACATION, startDate: '2024-08-01', endDate: '2024-08-05', status: RequestStatus.APPROVED, reason: 'Family trip.' },
    { id: 402, userId: 2, type: LeaveType.SICK, startDate: '2024-07-22', endDate: '2024-07-22', status: RequestStatus.APPROVED, reason: 'Fever.' },
    { id: 403, userId: 1, type: LeaveType.PERSONAL, startDate: '2024-09-10', endDate: '2024-09-10', status: RequestStatus.PENDING, reason: 'Appointment.' },
    { id: 404, userId: 5, type: LeaveType.VACATION, startDate: '2024-10-10', endDate: '2024-10-20', status: RequestStatus.PENDING, reason: 'Extended holiday.' },
];

export const ORGANISER_ELEMENTS: OrganiserElement[] = [
    { id: 'd1', type: OrganiserElementType.DEPARTMENT, label: 'Sales', x: 100, y: 100, properties: { Head: 'Diana Green' } },
    { id: 't1', type: OrganiserElementType.TEAM, label: 'US Sales Team', x: 100, y: 250, properties: { Manager: 'Charles Brown' } },
    { id: 'r1', type: OrganiserElementType.ROLE, label: 'Sales Rep', x: 50, y: 400, properties: { Count: 3 } },
    { id: 'r2', type: OrganiserElementType.ROLE, label: 'Sales Manager', x: 200, y: 400, properties: { Count: 1 } },
    { id: 's1', type: OrganiserElementType.SOFTWARE, label: 'Salesforce CRM', x: 400, y: 100, properties: { Licenses: 10 } },
];

export const ORGANISER_CONNECTIONS: OrganiserConnection[] = [
    { id: 'c1', from: 'd1', to: 't1' },
    { id: 'c2', from: 't1', to: 'r1' },
    { id: 'c3', from: 't1', to: 'r2' },
    { id: 'c4', from: 't1', to: 's1' },
];
