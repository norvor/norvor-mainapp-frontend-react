import React from 'react';
import { Deal, DealStage, User } from '../../types';

interface DealListViewProps {
  deals: Deal[];
  users: User[];
  onDealClick: (deal: Deal) => void;
}

const getStageColor = (stage: DealStage) => {
  switch (stage) {
    case DealStage.NEW_LEAD: return 'bg-blue-100 text-blue-800';
    case DealStage.PROPOSAL_SENT: return 'bg-yellow-100 text-yellow-800';
    case DealStage.NEGOTIATION: return 'bg-violet-100 text-violet-800';
    case DealStage.WON: return 'bg-green-100 text-green-800';
    case DealStage.LOST: return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const DealListView: React.FC<DealListViewProps> = ({ deals, users, onDealClick }) => {
  const getUserName = (ownerId: string) => {
    return users.find(u => u.id === ownerId)?.name || 'N/A';
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deal Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Owner</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Value</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stage</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Close Date</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {deals.map((deal) => (
            <tr key={deal.id} onClick={() => onDealClick(deal)} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{deal.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{getUserName(deal.ownerId)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${deal.value.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStageColor(deal.stage)}`}>
                  {deal.stage}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{deal.closeDate}</td>
            </tr>
          ))}
          {deals.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-8 text-gray-500">No deals to display.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DealListView;