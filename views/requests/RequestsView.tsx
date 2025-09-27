
import React from 'react';
import { Ticket, TicketStatus, User } from '../../types';

const getStatusColor = (status: TicketStatus) => {
    switch (status) {
        case TicketStatus.OPEN: return 'bg-green-100 text-green-800';
        case TicketStatus.IN_PROGRESS: return 'bg-yellow-100 text-yellow-800';
        case TicketStatus.CLOSED: return 'bg-gray-100 text-gray-800';
    }
};

interface RequestsViewProps {
    teamId: string;
    tickets: Ticket[];
    allUsers: User[];
    currentUser: User;
}

const RequestsView: React.FC<RequestsViewProps> = ({ teamId, tickets, allUsers, currentUser }) => {

    const getUserName = (userId: number) => {
        return allUsers.find(u => u.id === userId)?.name || 'Unknown User';
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Ticket List */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Incoming Requests</h2>
                <div className="space-y-4">
                    {tickets.map(ticket => (
                        <div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                                <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                                    {ticket.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{ticket.description}</p>
                            <div className="text-xs text-gray-400 mt-3">
                                Submitted by {getUserName(ticket.submittedBy)} on {new Date(ticket.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                    {tickets.length === 0 && (
                        <p className="text-center text-gray-500 py-8">No requests for this team yet.</p>
                    )}
                </div>
            </div>

            {/* New Ticket Form */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Submit a Request</h2>
                <form className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                        <input type="text" id="title" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea id="description" rows={5} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm"></textarea>
                    </div>
                    <button type="button" className="w-full px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-md hover:bg-violet-700">
                        Submit Request
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RequestsView;
