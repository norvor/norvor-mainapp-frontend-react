import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import { User, Contact, Deal, Activity, ActivityType, Company } from '../../../types';
import DealKanban from '../../../components/crm/DealKanban';
import ContactEditorModal from '../../../components/crm/ContactEditorModal';
import DealListView from '../../../components/crm/DealListView';
import { createContact, updateContact, deleteContact } from '../../../store/slices/contactSlice';
import { logActivity } from '../../../store/slices/activitySlice';
import DealEditorModal from '../../../components/crm/DealEditorModal';
import { createDeal, updateDeal, deleteDeal } from '../../../store/slices/dealSlice';
import CompanyListView from '../../../components/crm/CompanyListView';
import CompanyDetailView from '../../../components/crm/CompanyDetailView';
import { createCompany } from '../../../store/slices/companySlice';
import CompanyEditorModal from '../../../components/crm/CompanyEditorModal';


const ContactListView: React.FC<{
    contacts: Contact[];
    companies: Company[];
    onSelectContact: (contact: Contact) => void;
    onEditContact: (contact: Contact) => void;
}> = ({ contacts, companies, onSelectContact, onEditContact }) => {
    const getCompanyName = (companyId: number | null) => {
        if (!companyId) return 'N/A';
        return companies.find(c => c.id === companyId)?.name || 'Unknown Company';
    };

    return (
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
                            <td onClick={() => onSelectContact(contact)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 cursor-pointer">{getCompanyName(contact.companyId)}</td>
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
};

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
            <p className="text-gray-500 dark:text-gray-400">{contact.companyId}</p>
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


interface TeamCrmViewProps {
  currentUser: User;
  teamMembers: User[];
}

type MainTab = 'companies' | 'contacts' | 'deals';
type DealView = 'kanban' | 'list';

const TeamCrmView: React.FC<TeamCrmViewProps> = ({ currentUser, teamMembers }) => {
  const [mainTab, setMainTab] = useState<MainTab>('companies');
  const [dealView, setDealView] = useState<DealView>('kanban');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  
  const dispatch: AppDispatch = useDispatch();
  
  // --- Data fetched from Redux store ---
  const { users: allUsers } = useSelector((state: RootState) => state.users);
  const { contacts: allContacts } = useSelector((state: RootState) => state.contacts);
  const { deals: allDeals } = useSelector((state: RootState) => state.deals);
  const { activities } = useSelector((state: RootState) => state.activities);
  const { companies } = useSelector((state: RootState) => state.companies);
  // ------------------------------------

  const teamMemberIds = useMemo(() => new Set(teamMembers.map(m => m.id)), [teamMembers]);
  const teamContacts = useMemo(() => allContacts.filter(c => c.ownerId && teamMemberIds.has(c.ownerId)), [allContacts, teamMemberIds]);
  const teamDeals = useMemo(() => allDeals.filter(d => teamMemberIds.has(d.ownerId)), [allDeals, teamMemberIds]);
  
  const contactActivities = useMemo(() => {
    if (!selectedContact) return [];
    return activities.filter(a => a.contactId === selectedContact.id);
  }, [activities, selectedContact]);

  const companyContacts = useMemo(() => {
    if (!selectedCompany) return [];
    return allContacts.filter(c => c.companyId === selectedCompany.id);
  }, [allContacts, selectedCompany]);

  const companyDeals = useMemo(() => {
    if (!selectedCompany) return [];
    return allDeals.filter(d => (d as any).companyId === selectedCompany.id);
  }, [allDeals, selectedCompany]);

  const handleSaveContact = async (contactData: any) => {
    try {
      const payload = { ...contactData, ownerId: contactData.owner_id, companyId: contactData.company_id };
      if (editingContact) {
        await dispatch(updateContact({ ...editingContact, ...payload })).unwrap();
      } else {
        await dispatch(createContact(payload)).unwrap();
      }
      setIsContactModalOpen(false);
      setEditingContact(null);
    } catch (error) {
      console.error("Failed to save contact:", error);
      alert("Error: Could not save contact.");
    }
  };

  const handleDeleteContact = async (contactId: number) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
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
    try {
      const payload = { ...dealData, contactId: dealData.contact_id, ownerId: dealData.owner_id, closeDate: dealData.close_date, companyId: dealData.company_id };
      if (editingDeal) {
        await dispatch(updateDeal({ ...editingDeal, ...payload })).unwrap();
      } else {
        await dispatch(createDeal(payload)).unwrap();
      }
      setIsDealModalOpen(false);
      setEditingDeal(null);
    } catch (error) {
      console.error("Failed to save deal:", error);
      alert("Error: Could not save deal.");
    }
  };

  const handleDeleteDeal = async (dealId: number) => {
    if (window.confirm("Are you sure you want to delete this deal?")) {
        try {
            await dispatch(deleteDeal(dealId)).unwrap();
            setIsDealModalOpen(false);
            setEditingDeal(null);
        } catch (error) {
            console.error("Failed to delete deal:", error);
            alert("Error: Could not delete deal.");
        }
    }
  };

  const handleDealClick = (deal: Deal) => {
    setEditingDeal(deal);
    setIsDealModalOpen(true);
  };
  
  const handleSaveCompany = async (companyData: Omit<Company, 'id' | 'organizationId'>) => {
    try {
      if (editingCompany) {
        // Update logic will go here
      } else {
        await dispatch(createCompany(companyData)).unwrap();
      }
      setIsCompanyModalOpen(false);
      setEditingCompany(null);
    } catch (error) {
      console.error("Failed to save company:", error);
      alert("Error: Could not save company.");
    }
  };
  
  const renderContent = () => {
    switch (mainTab) {
        case 'companies':
            return selectedCompany ? (
                <CompanyDetailView
                    company={selectedCompany}
                    contacts={companyContacts}
                    deals={companyDeals}
                    users={allUsers}
                    currentUser={currentUser}
                    onBack={() => setSelectedCompany(null)}
                />
            ) : (
                <CompanyListView
                    companies={companies}
                    onCompanyClick={setSelectedCompany}
                />
            );
        case 'contacts':
            return selectedContact
                ? <ContactDetailView
                    contact={selectedContact}
                    activities={contactActivities}
                    currentUser={currentUser}
                    onBack={() => setSelectedContact(null)}
                  />
                : <ContactListView
                    contacts={teamContacts}
                    companies={companies}
                    onSelectContact={setSelectedContact}
                    onEditContact={(contact) => { setEditingContact(contact); setIsContactModalOpen(true); }}
                  />;
        case 'deals':
            if (dealView === 'kanban') {
                return <DealKanban deals={teamDeals} onDealClick={handleDealClick} />;
            }
            if (dealView === 'list') {
                return <DealListView deals={teamDeals} users={allUsers} onDealClick={handleDealClick} />;
            }
            return null;
        default:
            return null;
    }
  };

  return (
    <div>
      {isContactModalOpen && (
        <ContactEditorModal
            contact={editingContact}
            currentUser={currentUser}
            companies={companies}
            onClose={() => { setIsContactModalOpen(false); setEditingContact(null); }}
            onSave={handleSaveContact}
            onDelete={handleDeleteContact}
        />
      )}

      {isDealModalOpen && (
        <DealEditorModal
          deal={editingDeal}
          contacts={teamContacts}
          companies={companies}
          currentUser={currentUser}
          onClose={() => { setIsDealModalOpen(false); setEditingDeal(null); }}
          onSave={handleSaveDeal}
          onDelete={handleDeleteDeal}
        />
      )}
      
      {isCompanyModalOpen && (
        <CompanyEditorModal
          company={editingCompany}
          onClose={() => { setIsCompanyModalOpen(false); setEditingCompany(null); }}
          onSave={handleSaveCompany}
        />
      )}
      
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button onClick={() => setMainTab('companies')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${mainTab === 'companies' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                    Companies
                </button>
                <button onClick={() => setMainTab('contacts')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${mainTab === 'contacts' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                    Contacts
                </button>
                <button onClick={() => setMainTab('deals')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${mainTab === 'deals' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                    Deals
                </button>
            </nav>
        </div>
        <div className="mt-3 sm:mt-0 sm:ml-4 flex items-center space-x-4">
            {mainTab === 'deals' && (
                <div className="inline-flex rounded-md shadow-sm">
                    <button onClick={() => setDealView('kanban')} className={`px-3 py-2 text-sm font-medium ${dealView === 'kanban' ? 'bg-violet-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'} rounded-l-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600`}>
                        Kanban
                    </button>
                    <button onClick={() => setDealView('list')} className={`-ml-px px-3 py-2 text-sm font-medium ${dealView === 'list' ? 'bg-violet-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'} rounded-r-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600`}>
                        List
                    </button>
                </div>
            )}
             <div className="relative">
                <button
                  onClick={() => {
                      if (mainTab === 'contacts') setIsContactModalOpen(true);
                      if (mainTab === 'deals') setIsDealModalOpen(true);
                      if (mainTab === 'companies') setIsCompanyModalOpen(true);
                  }}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                >
                  + Create {mainTab === 'companies' ? 'Company' : mainTab === 'contacts' ? 'Contact' : 'Deal'}
                </button>
            </div>
        </div>
      </div>

      {renderContent()}
    </div>
  );
};

export default TeamCrmView;