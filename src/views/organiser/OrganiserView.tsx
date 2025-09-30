import React, { useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { OrganiserElement, OrganiserElementType, User, UserRole } from '../../types';

// Icons
import DepartmentIcon from '../../components/icons/DepartmentIcon';
import TeamIcon from '../../components/icons/TeamIcon';
import SoftwareIcon from '../../components/icons/SoftwareIcon';
import CrmIcon from '../../components/icons/CrmIcon';
import PmIcon from '../../components/icons/PmIcon';
import DocsIcon from '../../components/icons/DocsIcon';


import { 
    createOrganiserElement, 
    updateOrganiserElement,
    deleteOrganiserElement 
} from '../../store/slices/organiserSlice'; 

interface OrganiserViewProps {}

interface TreeNode extends OrganiserElement {
    children: TreeNode[];
}

const ELEMENT_ICONS: Record<string, React.FC<{className?: string}>> = {
    [OrganiserElementType.DEPARTMENT]: DepartmentIcon,
    [OrganiserElementType.TEAM]: TeamIcon,
    [OrganiserElementType.SOFTWARE]: SoftwareIcon,
    [OrganiserElementType.NORVOR_TOOL]: DocsIcon, // Default icon
};

const NORVOR_TOOL_DEFINITIONS = [
    { id: 'crm', label: 'CRM', icon: CrmIcon },
    { id: 'pm', label: 'Projects', icon: PmIcon },
    { id: 'docs', label: 'Library', icon: DocsIcon },
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


const OrganiserView: React.FC<OrganiserViewProps> = () => {
    const dispatch: AppDispatch = useDispatch();
    const { currentUser } = useSelector((state: RootState) => state.users);
    const { organiserElements: elements } = useSelector((state: RootState) => state.organiserElements);
    
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

    const isEditable = useMemo(() => currentUser?.role === UserRole.EXECUTIVE, [currentUser?.role]);

    const selectedElement = useMemo(() => {
        return elements.find(el => el.id === selectedElementId);
    }, [elements, selectedElementId]);

    const orgTree = useMemo((): TreeNode[] => {
        const elementMap: Map<string, TreeNode> = new Map(elements.map(el => [el.id, { ...el, children: [] } as TreeNode]));
        const roots: TreeNode[] = [];
        elements.forEach(el => {
            const node = elementMap.get(el.id);
            if (!node) return;
            if (el.parentId && elementMap.has(el.parentId)) {
                const parentNode = elementMap.get(el.parentId);
                parentNode?.children.push(node);
            } else {
                roots.push(node);
            }
        });
        return roots;
    }, [elements]);

    const handleSelect = (elementId: string) => {
        setSelectedElementId(elementId);
    };
    
    const handleUpdateLabel = async (e: React.FocusEvent<HTMLInputElement>) => {
        if (!selectedElement || !isEditable || selectedElement.label === e.target.value) return;
        const updatedElement = { ...selectedElement, label: e.target.value };
        await dispatch(updateOrganiserElement(updatedElement));
    };

    const addElement = async (type: OrganiserElementType, label: string, properties: any = {}) => {
        if (!isEditable) return;
        const newElement: Omit<OrganiserElement, 'id'> = {
            type,
            label,
            parentId: selectedElementId,
            properties
        };
        await dispatch(createOrganiserElement(newElement));
    };

    const handleDelete = async () => {
        if (!selectedElement || !isEditable) return;
        if (window.confirm(`Are you sure you want to delete "${selectedElement.label}"?`)) {
            await dispatch(deleteOrganiserElement(selectedElement.id));
            setSelectedElementId(null);
        }
    };

    return (
        <div className="flex h-full bg-white dark:bg-gray-800 rounded-lg shadow-inner border border-gray-200/50 dark:border-slate-700/50 overflow-hidden">
            <div className="w-1/3 min-w-80 bg-gray-50 dark:bg-slate-800 border-r dark:border-slate-700 p-4 overflow-y-auto">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Company Structure</h2>
                <div className="space-y-2">
                    <button onClick={() => addElement(OrganiserElementType.DEPARTMENT, 'New Department')} className="w-full text-left p-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-slate-700">+ Add Department</button>
                    <button onClick={() => addElement(OrganiserElementType.TEAM, 'New Team')} className="w-full text-left p-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-slate-700">+ Add Team</button>
                </div>
                <hr className="my-4 dark:border-gray-700"/>
                {orgTree.map(rootNode => (
                    <TreeItem key={rootNode.id} node={rootNode} level={0} selectedElementId={selectedElementId} onSelect={handleSelect} />
                ))}
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
                {selectedElement ? (
                    <div className="animate-fade-in">
                        {!isEditable && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800 mb-4">
                                Viewing in read-only mode. Only Executives can edit the structure.
                            </div>
                        )}
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Properties</h3>
                            {isEditable && <button onClick={handleDelete} className="px-3 py-1 text-sm rounded-md bg-red-100 hover:bg-red-200 text-red-700 font-medium">Delete</button>}
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Label</label>
                                <input
                                    type="text"
                                    key={selectedElement.id} // Re-mount input on selection change
                                    defaultValue={selectedElement.label}
                                    disabled={!isEditable}
                                    onBlur={handleUpdateLabel}
                                    className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-violet-500 focus:border-violet-500 disabled:bg-gray-700 disabled:cursor-not-allowed bg-transparent"
                                />
                            </div>
                        </div>
                        
                        {isEditable && (selectedElement.type === OrganiserElementType.TEAM || selectedElement.type === OrganiserElementType.DEPARTMENT) && (
                            <div className="mt-8 border-t dark:border-gray-700 pt-6">
                                <h4 className="font-semibold mb-2">Add Norvor Tool</h4>
                                <div className="flex flex-wrap gap-2">
                                    {NORVOR_TOOL_DEFINITIONS.map(tool => (
                                        <button
                                            key={tool.id}
                                            onClick={() => addElement(OrganiserElementType.NORVOR_TOOL, tool.label, { tool_id: tool.id })}
                                            className="px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 font-medium"
                                        >
                                            + Add {tool.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
                        <p>Select an element from the structure to view its details.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
export default OrganiserView;