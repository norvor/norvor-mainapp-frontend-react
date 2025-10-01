import React, { memo } from 'react';
import { Deal, DealStage } from '../../types';

interface DealCardProps {
  deal: Deal;
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

const DealCard: React.FC<DealCardProps> = ({ deal, onDealClick }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("dealId", deal.id.toString());
  };

  return (
    <div 
      draggable 
      onDragStart={handleDragStart}
      onClick={() => onDealClick(deal)} 
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow dark:shadow-none mb-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-100">{deal.name}</h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Value: ${deal.value.toLocaleString()}</p>
      <div className="mt-3 flex justify-between items-center">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStageColor(deal.stage)}`}>{deal.stage}</span>
      </div>
    </div>
  );
};

export default memo(DealCard);