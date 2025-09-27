
import React, { useState, useMemo } from 'react';
// Fix: Use OrganiserElement and OrganiserElementType from types.ts as Structure types are deprecated.
import { OrganiserElement, OrganiserElementType, User, UserRole } from '../../types';

// Icons for tree nodes
import DepartmentIcon from '../../components/icons/DepartmentIcon';
import TeamIcon from '../../components/icons/TeamIcon';
import RoleIcon from '../../components/icons/RoleIcon';
import SoftwareIcon from '../../components/icons/SoftwareIcon';
import ProcessIcon from '../../components/icons/ProcessIcon';

// Prop interface for the main view
interface StructureViewProps {
    initialElements: OrganiserElement[];
    currentUser: User;
}

// Type for a node in the tree structure, with children
interface TreeNode extends OrganiserElement {
    children: TreeNode[];
}

// Icon mapping
const ELEMENT_ICONS: Record<OrganiserElementType, React.FC<{className?: string}>> = {
    [OrganiserElementType.DEPARTMENT]: DepartmentIcon,
    [OrganiserElementType.TEAM]: TeamIcon,
    [OrganiserElementType.ROLE]: RoleIcon,
    [OrganiserElementType.SOFTWARE]: SoftwareIcon,
    [OrganiserElementType.PROCESS]: ProcessIcon,
};

// Recursive component to render a single tree node and its children
const TreeItem: React.FC<{
    node: TreeNode;
    level: number;
    selectedElementId: string | null;
    onSelect: (elementId: string) => void;
    isEditable: boolean;
    onDragStart: (e: React.DragEvent, elementId: string) => void;
    onDrop: (e: React.DragEvent, parentId: string | null) => void;
    onDragOver: (e: React.DragEvent) => void;
}> = ({ node, level, selectedElementId, onSelect, isEditable, onDragStart, onDrop, onDragOver }) => {
    const Icon = ELEMENT_ICONS[node.type];
    const [isExpanded, setIsExpanded] = useState(true);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onDrop(e, node.id);
    };

    return (
        <div>
            <div
                className={`flex items-center p-2 rounded-md group ${selectedElementId === node.id ? 'bg-violet-100' : 'hover:bg-gray-100'}`}
                style={{ paddingLeft: `${level * 1.5}rem` }}
                onClick={() => onSelect(node.id)}
                draggable={isEditable}
                onDragStart={(e) => isEditable && onDragStart(e, node.id)}
                onDrop={handleDrop}
                onDragOver={onDragOver}
            >
                <div className="flex items-center flex-1 cursor-pointer">
                    <button
                        className="mr-2 p-0.5 rounded hover:bg-gray-200"
                        onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                    >
                        {node.children.length > 0 && (
                            <svg className={`w-3 h-3 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                            </svg>
                        )}
                        {node.children.length === 0 && <div className="w-3 h-3" />}
                    </button>
                    <Icon className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="text-sm font-medium text-gray-800">{node.label}</span>
                </div>
            </div>
            {isExpanded && node.children.length > 0 && (
                <div>
                    {node.children.map(child => (
                        <TreeItem
                            key={child.id}
                            node={child}
                            level={level + 1}
                            selectedElementId={selectedElementId}
                            onSelect={onSelect}
                            isEditable={isEditable}
                            onDragStart={onDragStart}
                            onDrop={onDrop}
                            onDragOver={onDragOver}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};


// Main Structure View Component
const StructureView: React.FC<StructureViewProps> = ({ initialElements, currentUser }) => {
    const [elements, setElements] = useState<OrganiserElement[]>(initialElements);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

    const isEditable = useMemo(() => currentUser.role === UserRole.EXECUTIVE, [currentUser.role]);

    const selectedElement = useMemo(() => {
        return elements.find(el => el.id === selectedElementId);
    }, [elements, selectedElementId]);

    // Build the tree from the flat list of elements
    const orgTree = useMemo((): TreeNode[] => {
        // Fix: Explicitly type `elementMap` to correct type inference issues where `get` was returning `unknown`.
        const elementMap: Map<string, TreeNode> = new Map(elements.map(el => [el.id, { ...el, children: [] } as TreeNode]));
        const roots: TreeNode[] = [];
        elements.forEach(el => {
            if (el.parentId && elementMap.has(el.parentId)) {
                elementMap.get(el.parentId)!.children.push(elementMap.get(el.id)!);
            } else {
                roots.push(elementMap.get(el.id)!);
            }
        });
        return roots;
    }, [elements]);

    const handleSelect = (elementId: string) => {
        setSelectedElementId(elementId);
    };
    
    // --- Drag and Drop Handlers ---
    const handleDragStart = (e: React.DragEvent, elementId: string) => {
        e.dataTransfer.setData('application/json', JSON.stringify({ elementId }));
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDropOnParent = (e: React.DragEvent, parentId: string | null) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isEditable) return;

        const { elementId } = JSON.parse(e.dataTransfer.getData('application/json'));
        
        const isDescendant = (potentialChildId: string, potentialAncestorId: string): boolean => {
             const child = elements.find(el => el.id === potentialChildId);
             if (!child) return false;
             if (child.parentId === potentialAncestorId) return true;
             if (!child.parentId) return false;
             return isDescendant(child.parentId, potentialAncestorId);
        }

        if (elementId === parentId || (parentId && isDescendant(parentId, elementId))) {
            console.error("Cannot drop an element into one of its own descendants.");
            return;
        }

        setElements(prev => prev.map(el =>
            el.id === elementId ? { ...el, parentId } : el
        ));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (isEditable) {
            e.dataTransfer.dropEffect = 'move';
        }
    };

    // --- Element Manipulation Handlers ---
    const handlePropertyChange = (key: string, value: string) => {
        if (!selectedElementId || !isEditable) return;
        setElements(prev => prev.map(el => el.id === selectedElementId ? {
            ...el, properties: { ...el.properties, [key]: value }
        } : el));
    };

    const handleLabelChange = (newLabel: string) => {
        if (!selectedElementId || !isEditable) return;
        setElements(prev => prev.map(el => el.id === selectedElementId ? { ...el, label: newLabel } : el));
    };
    
    const addElement = (type: OrganiserElementType) => {
        if (!isEditable) return;
        const newElement: OrganiserElement = {
            id: `el_${Date.now()}`,
            type,
            label: `New ${type}`,
            parentId: selectedElementId, // Add as child of selected, or root if none selected
            properties: {}
        };
        setElements(prev => [...prev, newElement]);
    };

    return (
        <div className="flex h-full bg-white rounded-lg shadow-inner border border-gray-200/50 overflow-hidden">
            {/* Left Panel: Tree View */}
            <div 
                className="w-1/3 min-w-80 bg-gray-50 border-r p-4 overflow-y-auto"
                onDrop={(e) => handleDropOnParent(e, null)} // Drop here for root
                onDragOver={handleDragOver}
            >
                <h2 className="text-lg font-bold text-gray-800 mb-4">Company Structure</h2>
                {orgTree.map(rootNode => (
                    <TreeItem
                        key={rootNode.id}
                        node={rootNode}
                        level={0}
                        selectedElementId={selectedElementId}
                        onSelect={handleSelect}
                        isEditable={isEditable}
                        onDragStart={handleDragStart}
                        onDrop={handleDropOnParent}
                        onDragOver={handleDragOver}
                    />
                ))}
            </div>

            {/* Right Panel: Editor/Properties */}
            <div className="flex-1 p-6 overflow-y-auto">
                {selectedElement ? (
                    <div className="animate-fade-in">
                        {!isEditable && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800 mb-4">
                                Viewing in read-only mode. Only Executives can edit the structure.
                            </div>
                        )}
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Properties</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Label</label>
                                <input
                                    type="text"
                                    value={selectedElement.label}
                                    disabled={!isEditable}
                                    onChange={(e) => handleLabelChange(e.target.value)}
                                    className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-violet-500 focus:border-violet-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Type</label>
                                <p className="mt-1 p-2 bg-gray-100 rounded-md text-sm">{selectedElement.type}</p>
                            </div>
                            {Object.entries(selectedElement.properties).map(([key, value]) => (
                                <div key={key}>
                                    <label className="text-sm font-medium text-gray-700">{key}</label>
                                    <input
                                        type="text"
                                        // Fix: Ensure value passed to input is a string.
                                        value={String(value)}
                                        disabled={!isEditable}
                                        onChange={(e) => handlePropertyChange(key, e.target.value)}
                                        className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-violet-500 focus:border-violet-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    />
                                </div>
                            ))}
                        </div>
                        {isEditable && (
                            <div className="mt-8 border-t pt-6">
                                <h4 className="font-semibold mb-2">Add Child Element</h4>
                                <div className="flex flex-wrap gap-2">
                                    {Object.values(OrganiserElementType).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => addElement(type)}
                                            className="px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
                                        >
                                            + {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center text-gray-500">
                        <p>Select an element from the structure to view its details.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
export default StructureView;
