import React, { useState, useMemo } from 'react';
import { Contact, Deal, DealStage } from '../../../types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AnalyticsDashboard: React.FC<{ deals: Deal[] }> = ({ deals }) => {
    const totalSales = useMemo(() => deals.filter(d => d.stage === DealStage.WON).reduce((sum, d) => sum + d.value, 0), [deals]);
    const conversionRate = useMemo(() => {
        const won = deals.filter(d => d.stage === DealStage.WON).length;
        const total = deals.filter(d => d.stage === DealStage.WON || d.stage === DealStage.LOST).length;
        return total > 0 ? ((won / total) * 100).toFixed(1) : '0.0';
    }, [deals]);

    const salesByStageData = useMemo(() => {
        const stages = Object.values(DealStage);
        return stages.map(stage => ({
            name: stage,
            value: deals.filter(d => d.stage === stage).reduce((sum, d) => sum + d.value, 0),
        }));
    }, [deals]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-gray-500 dark:text-gray-400">Total Sales (Won)</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">${totalSales.toLocaleString()}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-gray-500 dark:text-gray-400">Overall Conversion Rate</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{conversionRate}%</p>
            </div>
             <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-gray-500 dark:text-gray-400">Active Deals</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{deals.filter(d => d.stage !== 'Won' && d.stage !== 'Lost').length}</p>
            </div>
            <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                 <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Pipeline Value by Stage</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesByStageData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                        <XAxis dataKey="name" tick={{ fill: '#A0AEC0' }} />
                        <YAxis tickFormatter={(value) => `$${Number(value).toLocaleString()}`} tick={{ fill: '#A0AEC0' }} />
                        <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} contentStyle={{ backgroundColor: '#2D3748', border: 'none' }} />
                        <Bar dataKey="value" fill="#7C3AED" name="Pipeline Value" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const SalesForecastingReport: React.FC<{ deals: Deal[] }> = ({ deals }) => {
    const forecastData = useMemo(() => {
        const data: {[key: string]: number} = {};
        deals.filter(d => d.stage !== DealStage.LOST).forEach(deal => {
            const month = new Date(deal.closeDate).toISOString().slice(0, 7); // YYYY-MM
            if (!data[month]) data[month] = 0;
            data[month] += deal.value;
        });
        return Object.keys(data).sort().map(month => ({ month, revenue: data[month] }));
    }, [deals]);
    
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Projected Revenue by Close Date</h3>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                    <XAxis dataKey="month" tick={{ fill: '#A0AEC0' }} />
                    <YAxis tickFormatter={(value) => `$${Number(value/1000).toLocaleString()}k`} tick={{ fill: '#A0AEC0' }} />
                    <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} contentStyle={{ backgroundColor: '#2D3748', border: 'none' }}/>
                    <Legend wrapperStyle={{ color: '#A0AEC0' }} />
                    <Line type="monotone" dataKey="revenue" stroke="#7C3AED" strokeWidth={2} name="Projected Revenue" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

const DataExportView: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Export Data</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">Download all CRM data as CSV files.</p>
        <div className="flex space-x-4">
            <button className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-md hover:bg-violet-700">Export Contacts</button>
            <button className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-md hover:bg-violet-700">Export Deals</button>
            <button className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-md hover:bg-violet-700">Export Activities</button>
        </div>
    </div>
);

// Main Executive View Component
interface ExecutiveCrmViewProps {
  contacts: Contact[];
  deals: Deal[];
}

type ExecutiveViewTab = 'analytics' | 'forecasting' | 'export';

const ExecutiveCrmView: React.FC<ExecutiveCrmViewProps> = ({ contacts, deals }) => {
  const [activeTab, setActiveTab] = useState<ExecutiveViewTab>('analytics');

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics': return <AnalyticsDashboard deals={deals} />;
      case 'forecasting': return <SalesForecastingReport deals={deals} />;
      case 'export': return <DataExportView />;
      default: return null;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Executive CRM Control Center</h1>
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button onClick={() => setActiveTab('analytics')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'analytics' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}`}>
            Company-Wide Analytics
          </button>
          <button onClick={() => setActiveTab('forecasting')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'forecasting' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}`}>
            Sales Forecasting
          </button>
          <button onClick={() => setActiveTab('export')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'export' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}`}>
            Data Export
          </button>
        </nav>
      </div>
      {renderContent()}
    </div>
  );
};

export default ExecutiveCrmView;