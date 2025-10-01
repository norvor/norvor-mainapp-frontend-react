import React, { useState, useEffect } from 'react';
import { Contact, User, Company } from '../../types';

interface ContactEditorModalProps {
  contact?: Contact | null;
  currentUser: User;
  companies: Company[];
  onClose: () => void;
  onSave: (contactData: any) => void;
  onDelete?: (contactId: number) => void;
}

const ContactEditorModal: React.FC<ContactEditorModalProps> = ({
  contact,
  currentUser,
  companies,
  onClose,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    owner_id: currentUser.id,
    company_id: companies[0]?.id || 0,
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        owner_id: contact.ownerId || currentUser.id,
        company_id: contact.companyId || companies[0]?.id || 0,
      });
    }
  }, [contact, currentUser.id, companies]);

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
            {contact ? 'Edit Contact' : 'Create New Contact'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full mt-1 p-2 border rounded-md bg-transparent dark:border-gray-600"
            />
          </div>
           <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company</label>
            <select name="company_id" value={formData.company_id} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md bg-transparent dark:border-gray-600 dark:bg-gray-800">
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full mt-1 p-2 border rounded-md bg-transparent dark:border-gray-600"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded-md bg-transparent dark:border-gray-600"
            />
          </div>
          <div className="pt-4 space-y-2">
            <button
              type="submit"
              className="w-full bg-violet-600 text-white py-2 rounded-md hover:bg-violet-700 font-semibold"
            >
              {contact ? 'Save Changes' : 'Create Contact'}
            </button>
            {contact && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(contact.id)}
                className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 font-semibold"
              >
                Delete Contact
              </button>
            )}
             <button
              type="button"
              onClick={onClose}
              className="w-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactEditorModal;