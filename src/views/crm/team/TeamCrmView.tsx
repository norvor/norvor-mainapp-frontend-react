import React, { useState, useMemo } from 'react';
import { User, Contact, Deal, Activity } from '../../../types';
import DealKanban from '../../../components/crm/DealKanban';
import apiClient from '../../../utils/apiClient';
import ContactEditorModal from '../../../components/crm/ContactEditorModal';

// --- Contact List View Component ---
const ContactListView: React.FC<{
    contacts: Contact[];
    onSelectContact: (contact: Contact) => void;
    onEditContact: (contact: Contact) => void;
}> = ({ contacts, onSelectContact, onEditContact }) => (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email & Phone</th>
                    <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Edit</span>
                    </th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {contacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 group">
                        <td onClick={() => onSelectContact(contact)} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer">{contact.name}</td>
                        <td onClick={() => onSelectContact(contact)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 cursor-pointer">{contact.company}</td>
                        <td onClick={() => onSelectContact(contact)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 cursor-pointer">
                            <div>{contact.email}</div>
                            <div>{contact.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={() => onEditContact(contact)} className="text-violet-600 hover:text-violet-900 opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
                        </td>
                    </tr>
                ))}
                 {contacts.length === 0 && (
                    <tr>
                        <td colSpan={4} className="text-center py-8 text-gray-500">You haven't created any contacts yet.</td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
);


// --- Contact Detail View Component ---
const ContactDetailView: React.FC<{ contact: Contact; activities: Activity[]; onBack: () => void; }> = ({ contact, activities, onBack }) => (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 animate-fade-in">
        <button onClick={onBack} className="mb-4 text-sm font-medium text-violet-600 hover:underline">
            &larr; Back to Contact List
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{contact.name}</h2>
        <p className="text-gray-500 dark:text-gray-400">{contact.company}</p>
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <p><strong>Email:</strong> {contact.email}</p>
            <p><strong>Phone:</strong> {contact.phone}</p>
        </div>
        <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Activity Log</h3>
            <div className="mt-4 space-y-4">
                {activities.map(activity => (
                    <div key={activity.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                        <p className="font-semibold text-sm">{activity.type} on {new Date(activity.date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{activity.notes}</p>
                    </div>
                ))}
                 {activities.length === 0 && <p className="text-sm text-gray-500">No activities logged for this contact yet.</p>}
            </div>
            <form className="mt-4 border-t dark:border-gray-700 pt-4">
                <textarea rows={3} placeholder="Log new activity..." className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-violet-500 focus:border-violet-500 bg-transparent"></textarea>
                <button type="button" className="mt-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-md hover:bg-violet-700">Log Activity</button>
            </form>
        </div>
    </div>
);


// --- Main Team View Component ---
interface TeamCrmViewProps {
  currentUser: User;
  contacts: Contact[];
  deals: Deal[];
  activities: Activity[];
  refetchContacts: () => void;
}

type TeamViewTab = 'contacts' | 'deals';

const TeamCrmView: React.FC<TeamCrmViewProps> = ({ currentUser, contacts, deals, activities, refetchContacts }) => {
  const [activeTab, setActiveTab] = useState<TeamViewTab>('contacts');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const myContacts = useMemo(() => contacts.filter(c => c.ownerId === currentUser.id), [contacts, currentUser.id]);
  const myDeals = useMemo(() => deals.filter(d => d.ownerId === currentUser.id), [deals, currentUser.id]);
  const contactActivities = useMemo(() => {
    if (!selectedContact) return [];
    return activities.filter(a => a.contactId === selectedContact.id);
  }, [activities, selectedContact]);

  const handleSaveContact = async (contactData: Omit<Contact, 'id' | 'createdAt'>) => {
    try {
      if (editingContact) {
        await apiClient(`/crm/contacts/${editingContact.id}`, { method: 'PUT', body: JSON.stringify(contactData) });
      } else {
        await apiClient('/crm/contacts/', { method: 'POST', body: JSON.stringify(contactData) });
      }
      await refetchContacts();
      setIsModalOpen(false);
      setEditingContact(null);
    } catch (error) {
      console.error("Failed to save contact:", error);
      alert("Error: Could not save contact.");
    }
  };

  const handleDeleteContact = async (contactId: number) => {
    if (window.confirm("Are you sure you want to delete this contact? This action cannot be undone.")) {
        try {
            await apiClient(`/crm/contacts/${contactId}`, { method: 'DELETE' });
            await refetchContacts();
            setIsModalOpen(false);
            setEditingContact(null);
        } catch (error) {
            console.error("Failed to delete contact:", error);
            alert("Error: Could not delete contact.");
        }
    }
  };
  
  const renderContent = () => {
    if (activeTab === 'contacts') {
      return selectedContact 
        ? <ContactDetailView contact={selectedContact} activities={contactActivities} onBack={() => setSelectedContact(null)} />
        : <ContactListView 
            contacts={myContacts} 
            onSelectContact={setSelectedContact}
            onEditContact={(contact) => { setEditingContact(contact); setIsModalOpen(true); }}
          />;
    }
    if (activeTab === 'deals') {
      return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">My Deal Kanban</h2>
            <DealKanban deals={myDeals} />
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {isModalOpen && (
        <ContactEditorModal 
            contact={editingContact}
            currentUser={currentUser}
            onClose={() => { setIsModalOpen(false); setEditingContact(null); }}
            onSave={handleSaveContact}
            onDelete={handleDeleteContact}
        />
      )}
      
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button onClick={() => { setActiveTab('contacts'); setSelectedContact(null); }} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'contacts' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}`}>
                My Contacts
            </button>
            <button onClick={() => setActiveTab('deals')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'deals' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}`}>
                Personal Deal Kanban
            </button>
            </nav>
        </div>
        {activeTab === 'contacts' && !selectedContact && (
            <div className="mt-3 sm:mt-0 sm:ml-4">
                <button onClick={() => { setEditingContact(null); setIsModalOpen(true); }} className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500">
                    + Create Contact
                </button>
            </div>
        )}
      </div>

      {renderContent()}
    </div>
  );
};

export default TeamCrmView;