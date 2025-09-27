import React, { useState, useMemo } from 'react';
import { User, Contact, Deal, Activity } from '../../../types';
import DealKanban from '../../../components/crm/DealKanban';

// Sub-components defined within the same file to avoid prop drilling and keep logic co-located.

// Contact List View Component
const ContactListView: React.FC<{ contacts: Contact[]; onSelectContact: (contact: Contact) => void; }> = ({ contacts, onSelectContact }) => (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email & Phone</th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {contacts.map((contact) => (
                    <tr key={contact.id} onClick={() => onSelectContact(contact)} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{contact.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{contact.company}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div>{contact.email}</div>
                            <div>{contact.phone}</div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


// Contact Detail View Component
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
            </div>
            <form className="mt-4 border-t dark:border-gray-700 pt-4">
                <textarea rows={3} placeholder="Log new activity..." className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-violet-500 focus:border-violet-500 bg-transparent"></textarea>
                <button type="button" className="mt-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-md hover:bg-violet-700">Log Activity</button>
            </form>
        </div>
    </div>
);


// Main Team View Component
interface TeamCrmViewProps {
  currentUser: User;
  contacts: Contact[];
  deals: Deal[];
  activities: Activity[];
}

type TeamViewTab = 'contacts' | 'deals';

const TeamCrmView: React.FC<TeamCrmViewProps> = ({ currentUser, contacts, deals, activities }) => {
  const [activeTab, setActiveTab] = useState<TeamViewTab>('contacts');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const myContacts = useMemo(() => contacts.filter(c => c.ownerId === currentUser.id), [contacts, currentUser.id]);
  const myDeals = useMemo(() => deals.filter(d => d.ownerId === currentUser.id), [deals, currentUser.id]);
  const contactActivities = useMemo(() => {
    if (!selectedContact) return [];
    return activities.filter(a => a.contactId === selectedContact.id);
  }, [activities, selectedContact]);

  const handleSelectContact = (contact: Contact) => setSelectedContact(contact);
  const handleBackToList = () => setSelectedContact(null);

  const renderContent = () => {
    if (activeTab === 'contacts') {
      return selectedContact 
        ? <ContactDetailView contact={selectedContact} activities={contactActivities} onBack={handleBackToList} />
        : <ContactListView contacts={myContacts} onSelectContact={handleSelectContact} />;
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
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button onClick={() => { setActiveTab('contacts'); setSelectedContact(null); }} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'contacts' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}`}>
            My Contacts
          </button>
          <button onClick={() => setActiveTab('deals')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'deals' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}`}>
            Personal Deal Kanban
          </button>
        </nav>
      </div>
      {renderContent()}
    </div>
  );
};

export default TeamCrmView;