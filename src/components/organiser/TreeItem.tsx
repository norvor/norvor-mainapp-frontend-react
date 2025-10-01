import React, { useState, memo } from 'react';
import { OrganiserElement, OrganiserElementType } from '../../types';

// Icons
import DepartmentIcon from '../icons/DepartmentIcon';
import TeamIcon from '../icons/TeamIcon';
import SoftwareIcon from '../icons/SoftwareIcon';
import CrmIcon from '../icons/CrmIcon';
import PmIcon from '../icons/PmIcon';
import DocsIcon from '../icons/DocsIcon';
import HrIcon from '../icons/HrIcon';
import DataLabsIcon from '../icons/DataLabsIcon';

interface TreeNode extends OrganiserElement {
    children: TreeNode[];
}

const ELEMENT_ICONS: Record<string, React.FC<{className?: string}>> = {
    [OrganiserElementType.DEPARTMENT]: DepartmentIcon,
    [OrganiserElementType.TEAM]: TeamIcon,
    [OrganiserElementType.SOFTWARE]: SoftwareIcon,
    [OrganiserElementType.NORVOR_TOOL]: DocsIcon,
};

const NORVOR_TOOL_DEFINITIONS = [
    { id: 'crm', label: 'CRM', icon: CrmIcon },
    { id: 'pm', label: 'Projects', icon: PmIcon },
    { id: 'docs', label: 'Library', icon: DocsIcon },
    { id: 'hr', label: 'HR', icon: HrIcon },
    { id: 'datalabs', label: 'Data Labs', icon: DataLabsIcon },
];

const TreeItem: React.FC<{
    node: TreeNode;
    level: number;
    selectedElementId: string | null;
    onSelect: (elementId: string) => void;
}> = ({ node, level, selectedElementId, onSelect }) => {
    let Icon = ELEMENT_ICONS[node.type];
    if (node.type === OrganiserElementType.NORVOR_TOOL) {
        const tool = NORVOR_TOOL_DEFINITIONS.find(t => t.id === node.properties.tool_id);
        if (tool) Icon = tool.icon;
    }

    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div>
            <div
                className={`flex items-center p-2 rounded-md group ${selectedElementId === node.id ? 'bg-violet-100 dark:bg-violet-900/40' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                style={{ paddingLeft: `${level * 1.5}rem` }}
                onClick={() => onSelect(node.id)}
            >
                <div className="flex items-center flex-1 cursor-pointer">
                    <button
                        className="mr-2 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                        onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                    >
                        {hasChildren ? (
                            <svg className={`w-3 h-3 text-gray-500 dark:text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                            </svg>
                        ) : <div className="w-3 h-3" />}
                    </button>
                    <Icon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{node.label}</span>
                </div>
            </div>
            {hasChildren && isExpanded && (
                <div>
                    {node.children.map(child => (
                        <TreeItem
                            key={child.id}
                            node={child}
                            level={level + 1}
                            selectedElementId={selectedElementId}
                            onSelect={onSelect}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default memo(TreeItem);