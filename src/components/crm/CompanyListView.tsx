import React from 'react';
import { Company } from '../../types';

interface CompanyListViewProps {
  companies: Company[];
  onCompanyClick: (company: Company) => void;
}

const CompanyListView: React.FC<CompanyListViewProps> = ({ companies, onCompanyClick }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Domain</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {companies.map((company) => (
            <tr key={company.id} onClick={() => onCompanyClick(company)} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{company.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{company.domain}</td>
            </tr>
          ))}
          {companies.length === 0 && (
            <tr>
              <td colSpan={2} className="text-center py-8 text-gray-500">No companies found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CompanyListView;