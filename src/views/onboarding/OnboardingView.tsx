import React, { useState } from 'react';
import { User, OrganiserElement } from '../../types';
import OrgStructureStep from './OrgStructureStep';
import AddUsersStep from './AddUsersStep';

interface OnboardingViewProps {
  currentUser: User;
  onOnboardingComplete: () => void;
}

const OnboardingView: React.FC<OnboardingViewProps> = ({ currentUser, onOnboardingComplete }) => {
  const [step, setStep] = useState(1);
  const [orgElements, setOrgElements] = useState<OrganiserElement[]>([]);

  const handleStructureSubmit = (elements: OrganiserElement[]) => {
    setOrgElements(elements);
    setStep(2);
  };

  const handleUsersSubmit = () => {
    // After users are added, the final step is to call the completion function
    onOnboardingComplete();
  };

  const getDepartments = () => {
    return orgElements.filter(el => el.type === 'Department');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-900 p-4">
      <div className="w-full max-w-4xl p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Welcome to Norvor, {currentUser.name}!
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Let's get your organization set up in two simple steps.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center items-center space-x-4">
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-violet-600' : 'text-gray-400'}`}>
                <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold">{step > 1 ? '✓' : '1'}</div>
                <span>Org Structure</span>
            </div>
            <div className="flex-1 h-px bg-gray-300"></div>
            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-violet-600' : 'text-gray-400'}`}>
                <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold">{step > 2 ? '✓' : '2'}</div>
                <span>Add Team</span>
            </div>
        </div>
        
        {/* Onboarding Steps Content */}
        <div className="pt-6">
          {step === 1 && (
            <OrgStructureStep onSubmit={handleStructureSubmit} />
          )}
          {step === 2 && (
            <AddUsersStep 
              departments={getDepartments()}
              onBack={() => setStep(1)}
              onFinish={handleUsersSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingView;