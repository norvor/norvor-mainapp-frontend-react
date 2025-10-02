import React, { useState, useEffect } from 'react';
import { Deal, Contact, User, DealStage, Company } from '../../types';

interface DealEditorModalProps {
  deal?: Deal | null;
  contacts: Contact[];
  companies: Company[];
  currentUser: User;
  onClose: () => void;
  onSave: (dealData: Omit<Deal, 'id' | 'dataCupId'>) => void;
  onDelete?: (dealId: number) => void;
}

const DealEditorModal: React.FC<DealEditorModalProps> = ({
  deal,
  contacts,
  companies,
  currentUser,
  onClose,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    value: 0,
    stage: DealStage.NEW_LEAD,
    contactId: 0,
    companyId: 0,
    ownerId: currentUser.id,
    closeDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    // Set initial company and contact if companies are available
    if (companies.length > 0) {
        const initialCompanyId = deal?.companyId || companies[0].id;
        const relevantContacts = contacts.filter(c => c.companyId === initialCompanyId);
        
        setFormData({
            name: deal?.name || '',
            value: deal?.value || 0,
            stage: deal?.stage || DealStage.NEW_LEAD,
            contactId: deal?.contactId || (relevantContacts.length > 0 ? relevantContacts[0].id : 0),
            companyId: initialCompanyId,
            ownerId: deal?.ownerId || currentUser.id,
            closeDate: deal?.closeDate || new Date().toISOString().split('T')[0],
        });
    }
  }, [deal, companies, contacts, currentUser.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumeric = ['value', 'companyId', 'contactId'].includes(name);
    setFormData((prev) => ({ ...prev, [name]: isNumeric ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const filteredContacts = useMemo(() => {
      return contacts.filter(c => c.companyId === formData.companyId);
  }, [contacts, formData.companyId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md animate-fade-in-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {deal ? 'Edit Deal' : 'Create New Deal'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Deal Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md bg-transparent dark:border-gray-600"/>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Value ($)</label>
            <input type="number" name="value" value={formData.value} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md bg-transparent dark:border-gray-600"/>
          </div>
           <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company</label>
            <select name="companyId" value={formData.companyId} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md bg-transparent dark:border-gray-600 dark:bg-gray-800">
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Primary Contact</label>
            <select name="contactId" value={formData.contactId} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md bg-transparent dark:border-gray-600 dark:bg-gray-800">
              {filteredContacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Stage</label>
            <select name="stage" value={formData.stage} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md bg-transparent dark:border-gray-600 dark:bg-gray-800">
              {Object.values(DealStage).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Close Date</label>
            <input type="date" name="closeDate" value={formData.closeDate} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md bg-transparent dark:border-gray-600"/>
          </div>
          <div className="pt-4 space-y-2">
            <button type="submit" className="w-full bg-violet-600 text-white py-2 rounded-md hover:bg-violet-700 font-semibold">
              {deal ? 'Save Changes' : 'Create Deal'}
            </button>
            {deal && onDelete && (
              <button type="button" onClick={() => onDelete(deal.id)} className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 font-semibold">
                Delete Deal
              </button>
            )}
            <button type="button" onClick={onClose} className="w-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DealEditorModal;