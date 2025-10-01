import React from 'react';
import { Deal, DealStage } from '../../types';
import { useDispatch } from 'react-redux';
import { updateDeal } from '../../store/slices/dealSlice';
import { AppDispatch } from '../../store/store';
import DealCard from './DealCard';

interface KanbanColumnProps {
  stage: DealStage;
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
  onDrop: (stage: DealStage, dealId: number) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ stage, deals, onDealClick, onDrop }) => {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dealId = Number(e.dataTransfer.getData("dealId"));
    onDrop(stage, dealId);
  };
  
  return (
    <div 
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="flex-shrink-0 w-72 bg-gray-100 dark:bg-slate-800 rounded-lg p-3"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">{stage}</h3>
        <span className="text-xs font-bold text-gray-400 bg-gray-200 dark:bg-gray-700 dark:text-gray-400 rounded-full px-2 py-1">{deals.length}</span>
      </div>
      <div className="h-full overflow-y-auto">
        {deals.map(deal => <DealCard key={deal.id} deal={deal} onDealClick={onDealClick} />)}
      </div>
    </div>
  );
};

interface DealKanbanProps {
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
}

const DealKanban: React.FC<DealKanbanProps> = ({ deals, onDealClick }) => {
  const dispatch: AppDispatch = useDispatch();
  const stages = Object.values(DealStage);
  
  const dealsByStage = (stage: DealStage) => deals.filter(deal => deal.stage === stage);

  const handleDrop = async (newStage: DealStage, dealId: number) => {
    const dealToUpdate = deals.find(d => d.id === dealId);
    if (dealToUpdate && dealToUpdate.stage !== newStage) {
      try {
        await dispatch(updateDeal({ ...dealToUpdate, stage: newStage })).unwrap();
      } catch (error) {
        console.error("Failed to update deal stage:", error);
        alert("Could not update deal stage.");
      }
    }
  };

  return (
    <div className="flex space-x-4 overflow-x-auto pb-4">
      {stages.map(stage => (
        <KanbanColumn 
          key={stage} 
          stage={stage} 
          deals={dealsByStage(stage)} 
          onDealClick={onDealClick}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
};

export default DealKanban;