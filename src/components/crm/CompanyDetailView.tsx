import React, { useMemo } from 'react';
import { Company, Contact, Deal, User, CrmTask } from '../../types';
import CrmTaskWidget from './CrmTaskWidget';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

interface CompanyDetailViewProps {
  company: Company;
  contacts: Contact[];
  deals: Deal[];
  users: User[];
  currentUser: User;
  onBack: () => void;
}

const CompanyDetailView: React.FC<CompanyDetailViewProps> = ({ company, contacts, deals, users, currentUser, onBack }) => {
  const { tasks: allCrmTasks } = useSelector((state: RootState) => state.crmTasks);

  const associatedTasks = useMemo(() => {
    const contactIds = new Set(contacts.map(c => c.id));
    const dealIds = new Set(deals.map(d => d.id));
    return allCrmTasks.filter(task => 
      (task.contactId && contactIds.has(task.contactId)) || 
      (task.dealId && dealIds.has(task.dealId))
    );
  }, [allCrmTasks, contacts, deals]);

  const getUserName = (ownerId: string | null) => {
    if (!ownerId) return 'N/A';
    // Add a check to ensure users is not undefined
    if (!users) return 'Unknown'; 
    return users.find(u => u.id === ownerId)?.name || 'Unknown';
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 animate-fade-in">
      <button onClick={onBack} className="mb-4 text-sm font-medium text-violet-600 hover:underline">
        &larr; Back to Company List
      </button>
      
      <div className="border-b pb-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{company.name}</h2>
        <a href={`http://${company.domain}`} target="_blank" rel="noopener noreferrer" className="text-violet-500 hover:underline">{company.domain}</a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Contacts ({contacts.length})</h3>
          <div className="space-y-3">
            {contacts.map(contact => (
              <div key={contact.id} className="p-3 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="font-semibold text-gray-900 dark:text-gray-100">{contact.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{contact.email}</p>
                <p className="text-xs text-gray-400 mt-1">Owner: {getUserName(contact.ownerId)}</p>
              </div>
            ))}
            {contacts.length === 0 && <p className="text-sm text-gray-500">No contacts associated with this company.</p>}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Deals ({deals.length})</h3>
           <div className="space-y-3">
            {deals.map(deal => (
              <div key={deal.id} className="p-3 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <p className="font-semibold text-gray-900 dark:text-gray-100">{deal.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">${deal.value.toLocaleString()} - <span className="font-medium">{deal.stage}</span></p>
                 <p className="text-xs text-gray-400 mt-1">Owner: {getUserName(deal.ownerId)}</p>
              </div>
            ))}
            {deals.length === 0 && <p className="text-sm text-gray-500">No deals associated with this company.</p>}
          </div>
        </div>
      </div>
      
      <div className="mt-8 border-t dark:border-gray-700 pt-6">
        <CrmTaskWidget
            tasks={associatedTasks}
            users={users}
            currentUser={currentUser}
            associatedId={{ contactId: contacts[0]?.id }}
        />
      </div>
    </div>
  );
};

export default CompanyDetailView;