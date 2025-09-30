import React, { useState } from 'react';
import { OrganiserElement, OrganiserElementType } from '../../types';
import { useDispatch } from 'react-redux';
import { createOrganiserElement } from '../../store/slices/organiserSlice';
import { AppDispatch } from '../../store/store';

interface OrgStructureStepProps {
  onSubmit: (elements: OrganiserElement[]) => void;
}

const OrgStructureStep: React.FC<OrgStructureStepProps> = ({ onSubmit }) => {
  const dispatch: AppDispatch = useDispatch();
  const [elements, setElements] = useState<OrganiserElement[]>([]);
  const [newDeptName, setNewDeptName] = useState('');

  const handleAddDepartment = async () => {
    if (!newDeptName.trim()) return;
    const newElement: Omit<OrganiserElement, 'id'> = {
      label: newDeptName,
      type: OrganiserElementType.DEPARTMENT,
      parentId: null,
      properties: {},
    };
    try {
      const resultAction = await dispatch(createOrganiserElement(newElement));
      const createdElement = resultAction.payload as OrganiserElement;
      setElements(prev => [...prev, createdElement]);
      setNewDeptName('');
    } catch (e) {
      console.error('Failed to create department', e);
    }
  };
  
  return (
    <div>
      <h2 className="text-xl font-bold text-center">Step 1: Define Departments</h2>
      <p className="text-center mt-2 text-gray-500 dark:text-gray-400">
        Create the main departments in your company, like "Sales", "Engineering", or "Marketing".
      </p>

      <div className="mt-6 max-w-md mx-auto">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newDeptName}
            onChange={(e) => setNewDeptName(e.target.value)}
            placeholder="e.g., Sales"
            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 bg-transparent rounded-md"
          />
          <button onClick={handleAddDepartment} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-md">Add</button>
        </div>

        <div className="mt-4 space-y-2">
          <h3 className="text-sm font-semibold">Departments Created:</h3>
          {elements.length === 0 ? (
             <p className="text-sm text-gray-400">No departments added yet.</p>
          ) : (
            <ul className="list-disc list-inside">
              {elements.map(el => <li key={el.id}>{el.label}</li>)}
            </ul>
          )}
        </div>
      </div>
      
      <div className="text-center mt-8">
        <button onClick={() => onSubmit(elements)} className="px-8 py-3 bg-violet-600 text-white rounded-md font-semibold">
          Save & Continue
        </button>
      </div>
    </div>
  );
};

export default OrgStructureStep;