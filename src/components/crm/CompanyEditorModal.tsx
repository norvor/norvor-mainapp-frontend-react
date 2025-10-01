import React, { useState, useEffect } from 'react';
import { Company } from '../../types';

interface CompanyEditorModalProps {
  company?: Company | null;
  onClose: () => void;
  onSave: (companyData: Omit<Company, 'id' | 'organizationId'>) => void;
}

const CompanyEditorModal: React.FC<CompanyEditorModalProps> = ({ company, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
  });

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        domain: company.domain || '',
      });
    }
  }, [company]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            {company ? 'Edit Company' : 'Create New Company'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
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
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company Domain</label>
            <input
              type="text"
              name="domain"
              value={formData.domain}
              onChange={handleChange}
              placeholder="example.com"
              className="w-full mt-1 p-2 border rounded-md bg-transparent dark:border-gray-600"
            />
          </div>
          <div className="pt-4 space-y-2">
            <button
              type="submit"
              className="w-full bg-violet-600 text-white py-2 rounded-md hover:bg-violet-700 font-semibold"
            >
              {company ? 'Save Changes' : 'Create Company'}
            </button>
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

export default CompanyEditorModal;