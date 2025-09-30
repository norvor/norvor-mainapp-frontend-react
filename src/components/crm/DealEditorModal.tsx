import React, { useState, useEffect } from 'react';
import { Deal, Contact, User, DealStage } from '../../types';

interface DealEditorModalProps {
  deal?: Deal | null;
  contacts: Contact[];
  currentUser: User;
  onClose: () => void;
  onSave: (dealData: any) => void;
  onDelete?: (dealId: number) => void;
}

const DealEditorModal: React.FC<DealEditorModalProps> = ({
  deal,
  contacts,
  currentUser,
  onClose,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    value: 0,
    stage: DealStage.NEW_LEAD,
    contact_id: contacts[0]?.id || 0,
    owner_id: currentUser.id,
    close_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (deal) {
      setFormData({
        name: deal.name || '',
        value: deal.value || 0,
        stage: deal.stage || DealStage.NEW_LEAD,
        contact_id: deal.contactId,
        owner_id: deal.ownerId,
        close_date: deal.closeDate,
      });
    }
  }, [deal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

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
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Stage</label>
            <select name="stage" value={formData.stage} onChange={handleChange} className="w-full mt-1 p-2 border rounded-md bg-transparent dark:border-gray-600 dark:bg-gray-800">
              {Object.values(DealStage).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
           <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Contact</label>
            <select name="contact_id" value={formData.contact_id} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md bg-transparent dark:border-gray-600 dark:bg-gray-800">
              {contacts.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company})</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Close Date</label>
            <input type="date" name="close_date" value={formData.close_date} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md bg-transparent dark:border-gray-600"/>
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