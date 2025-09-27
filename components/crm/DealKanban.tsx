import React from 'react';
import { Deal, DealStage } from '../../types';

interface DealCardProps {
  deal: Deal;
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

const DealCard: React.FC<DealCardProps> = ({ deal }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow dark:shadow-none mb-4 cursor-pointer hover:shadow-md transition-shadow">
    <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-100">{deal.name}</h4>
    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Value: ${deal.value.toLocaleString()}</p>
    <div className="mt-3 flex justify-between items-center">
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStageColor(deal.stage)}`}>{deal.stage}</span>
    </div>
  </div>
);

interface KanbanColumnProps {
  stage: DealStage;
  deals: Deal[];
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ stage, deals }) => (
  <div className="flex-shrink-0 w-72 bg-gray-100 dark:bg-slate-800 rounded-lg p-3">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">{stage}</h3>
      <span className="text-xs font-bold text-gray-400 bg-gray-200 dark:bg-gray-700 dark:text-gray-400 rounded-full px-2 py-1">{deals.length}</span>
    </div>
    <div className="h-full overflow-y-auto">
      {deals.map(deal => <DealCard key={deal.id} deal={deal} />)}
    </div>
  </div>
);

interface DealKanbanProps {
  deals: Deal[];
}

const DealKanban: React.FC<DealKanbanProps> = ({ deals }) => {
  const stages = Object.values(DealStage);
  
  const dealsByStage = (stage: DealStage) => deals.filter(deal => deal.stage === stage);

  return (
    <div className="flex space-x-4 overflow-x-auto pb-4">
      {stages.map(stage => (
        <KanbanColumn key={stage} stage={stage} deals={dealsByStage(stage)} />
      ))}
    </div>
  );
};

export default DealKanban;