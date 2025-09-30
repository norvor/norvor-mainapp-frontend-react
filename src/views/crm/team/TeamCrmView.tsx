import React, { useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { User, Contact, Deal, Activity, ActivityType } from '../../../types';
import DealKanban from '../../../components/crm/DealKanban';
import ContactEditorModal from '../../../components/crm/ContactEditorModal';
import { createContact, updateContact, deleteContact } from '../../../store/slices/contactSlice';
import { logActivity } from '../../../store/slices/activitySlice';
import DealEditorModal from '../../../components/crm/DealEditorModal'; // Import the new modal

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
const ContactDetailView: React.FC<{ contact: Contact; activities: Activity[]; currentUser: User; onBack: () => void; }> = ({ contact, activities, currentUser, onBack }) => {
    const dispatch = useDispatch();
    const [notes, setNotes] = useState('');
    const [activityType, setActivityType] = useState<ActivityType>(ActivityType.CALL);
    const [isLogging, setIsLogging] = useState(false);
    
    const handleSubmitActivity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!notes.trim()) return;

        setIsLogging(true);
        
        const newActivityPayload: Omit<Activity, 'id'> = {
            type: activityType,
            notes: notes.trim(),
            date: new Date().toISOString().split('T')[0],
            contactId: contact.id,
            userId: currentUser.id,
        };
        
        try {
            await dispatch(logActivity(newActivityPayload)).unwrap();
            setNotes('');
            alert('Activity logged successfully!');

        } catch (error) {
            console.error('Failed to log activity:', error);
            alert('Error logging activity.');
        } finally {
            setIsLogging(false);
        }
    };

    return (
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
                
                <form className="mt-4 border-t dark:border-gray-700 pt-4" onSubmit={handleSubmitActivity}>
                    <select
                        value={activityType}
                        onChange={(e) => setActivityType(e.target.value as ActivityType)}
                        className="w-full mb-2 p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-violet-500 focus:border-violet-500 bg-transparent"
                        disabled={isLogging}
                    >
                        {Object.values(ActivityType).map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    <textarea 
                        rows={3} 
                        placeholder="Log new activity notes..." 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-violet-500 focus:border-violet-500 bg-transparent"
                        disabled={isLogging}
                    ></textarea>
                    <button 
                        type="submit" 
                        disabled={isLogging || !notes.trim()}
                        className="mt-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-md hover:bg-violet-700 disabled:bg-violet-400"
                    >
                        {isLogging ? 'Logging...' : 'Log Activity'}
                    </button>
                </form>
            </div>
        </div>
    );
};

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
  
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  
  const dispatch = useDispatch();

  const myContacts = useMemo(() => contacts.filter(c => c.ownerId === currentUser.id), [contacts, currentUser.id]);
  const myDeals = useMemo(() => deals.filter(d => d.ownerId === currentUser.id), [deals, currentUser.id]);
  const contactActivities = useMemo(() => {
    if (!selectedContact) return [];
    return activities.filter(a => a.contactId === selectedContact.id);
  }, [activities, selectedContact]);

  const handleSaveContact = async (contactData: any) => {
    try {
      if (editingContact) {
        const contactToUpdate = { ...editingContact, ...contactData, ownerId: contactData.owner_id } as Contact; 
        await dispatch(updateContact(contactToUpdate as Contact)).unwrap();
      } else {
        const newContact = { ...contactData, ownerId: contactData.owner_id } as Omit<Contact, 'id' | 'createdAt'>;
        await dispatch(createContact(newContact)).unwrap();
      }
      setIsContactModalOpen(false);
      setEditingContact(null);
    } catch (error) {
      console.error("Failed to save contact:", error);
      alert("Error: Could not save contact.");
    }
  };

  const handleDeleteContact = async (contactId: number) => {
    if (window.confirm("Are you sure you want to delete this contact? This action cannot be undone.")) {
        try {
            await dispatch(deleteContact(contactId)).unwrap();
            setIsContactModalOpen(false);
            setEditingContact(null);
        } catch (error) {
            console.error("Failed to delete contact:", error);
            alert("Error: Could not delete contact.");
        }
    }
  };

  const handleSaveDeal = async (dealData: any) => {
    // Placeholder for Redux action
    console.log("Saving Deal:", dealData);
    alert("Deal saving functionality will be added in the next step.");
    setIsDealModalOpen(false);
    setEditingDeal(null);
  };
  
  const renderContent = () => {
    if (activeTab === 'contacts') {
      return selectedContact 
        ? <ContactDetailView 
            contact={selectedContact} 
            activities={contactActivities} 
            currentUser={currentUser}
            onBack={() => setSelectedContact(null)} 
          />
          : <ContactListView 
            contacts={myContacts} 
            onSelectContact={setSelectedContact}
            onEditContact={(contact) => { setEditingContact(contact); setIsContactModalOpen(true); }}
          />;
    }
    if (activeTab === 'deals') {
      return (
        <div>
            <DealKanban deals={myDeals} />
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {isContactModalOpen && (
        <ContactEditorModal 
            contact={editingContact}
            currentUser={currentUser}
            onClose={() => { setIsContactModalOpen(false); setEditingContact(null); }}
            onSave={handleSaveContact}
            onDelete={handleDeleteContact}
        />
      )}

      {isDealModalOpen && (
        <DealEditorModal
          deal={editingDeal}
          contacts={myContacts}
          currentUser={currentUser}
          onClose={() => { setIsDealModalOpen(false); setEditingDeal(null); }}
          onSave={handleSaveDeal}
          // onDelete will be wired up later
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
        <div className="mt-3 sm:mt-0 sm:ml-4 flex space-x-2">
            {activeTab === 'contacts' && !selectedContact && (
                <button onClick={() => { setEditingContact(null); setIsContactModalOpen(true); }} className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500">
                    + Create Contact
                </button>
            )}
            {activeTab === 'deals' && (
                <button onClick={() => { setEditingDeal(null); setIsDealModalOpen(true); }} className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500">
                    + Create Deal
                </button>
            )}
        </div>
      </div>

      {renderContent()}
    </div>
  );
};

export default TeamCrmView;