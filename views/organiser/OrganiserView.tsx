
import React, { useState, useCallback, useRef, useMemo } from 'react';
import { OrganiserElement, OrganiserConnection, OrganiserElementType } from '../../types';
import DepartmentIcon from '../../components/icons/DepartmentIcon';
import TeamIcon from '../../components/icons/TeamIcon';
import RoleIcon from '../../components/icons/RoleIcon';
import SoftwareIcon from '../../components/icons/SoftwareIcon';
import ProcessIcon from '../../components/icons/ProcessIcon';

interface OrganiserViewProps {
    initialElements: OrganiserElement[];
    initialConnections: OrganiserConnection[];
}

const getElementColor = (type: OrganiserElementType) => {
    switch (type) {
        case OrganiserElementType.DEPARTMENT: return '#a78bfa'; // violet-400
        case OrganiserElementType.TEAM: return '#60a5fa'; // blue-400
        case OrganiserElementType.ROLE: return '#2dd4bf'; // turquoise-400
        case OrganiserElementType.SOFTWARE: return '#facc15'; // yellow-400
        case OrganiserElementType.PROCESS: return '#f87171'; // red-400
        default: return '#9ca3af'; // gray-400
    }
};

const ELEMENT_ICONS: Record<OrganiserElementType, React.FC<{className?: string}>> = {
    [OrganiserElementType.DEPARTMENT]: DepartmentIcon,
    [OrganiserElementType.TEAM]: TeamIcon,
    [OrganiserElementType.ROLE]: RoleIcon,
    [OrganiserElementType.SOFTWARE]: SoftwareIcon,
    [OrganiserElementType.PROCESS]: ProcessIcon,
};

interface TreeNode extends OrganiserElement {
    children: TreeNode[];
}

// Recursive component to render the hierarchical structure table
const StructureNode: React.FC<{
    node: TreeNode;
    level: number;
    selectedElementId: string | null;
    onSelect: (element: OrganiserElement) => void;
}> = ({ node, level, selectedElementId, onSelect }) => (
    <>
        <div 
            className={`flex items-center p-2 rounded-md cursor-pointer ${selectedElementId === node.id ? 'bg-violet-100' : 'hover:bg-gray-100'}`}
            style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
            onClick={() => onSelect(node)}
        >
            <span className="text-sm font-medium text-gray-700">{node.label}</span>
        </div>
        {node.children.length > 0 && (
            <div>
                {node.children.map(child => (
                    <StructureNode 
                        key={child.id} 
                        node={child} 
                        level={level + 1}
                        selectedElementId={selectedElementId}
                        onSelect={onSelect}
                    />
                ))}
            </div>
        )}
    </>
);


const OrganiserView: React.FC<OrganiserViewProps> = ({ initialElements, initialConnections }) => {
    const [elements, setElements] = useState(initialElements);
    const [connections, setConnections] = useState(initialConnections);
    const [selectedElement, setSelectedElement] = useState<OrganiserElement | null>(null);
    const [dragging, setDragging] = useState<{ id: string, x: number, y: number } | null>(null);
    const [activeTab, setActiveTab] = useState<'properties' | 'structure'>('properties');
    const svgRef = useRef<SVGSVGElement>(null);

    const handleSelectElement = (el: OrganiserElement | null) => {
        setSelectedElement(el);
        if (el) {
            setActiveTab('properties');
        }
    }

    const handleMouseDown = (e: React.MouseEvent, el: OrganiserElement) => {
        if (!svgRef.current) return;
        const pt = svgRef.current.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgP = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
        setDragging({ id: el.id, x: svgP.x - el.x, y: svgP.y - el.y });
        handleSelectElement(el);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (dragging && svgRef.current) {
            e.preventDefault();
            const pt = svgRef.current.createSVGPoint();
            pt.x = e.clientX;
            pt.y = e.clientY;
            const svgP = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
            
            setElements(prev => prev.map(el => 
                el.id === dragging.id ? { ...el, x: svgP.x - dragging.x, y: svgP.y - dragging.y } : el
            ));
        }
    }, [dragging]);

    const handleMouseUp = useCallback(() => {
        setDragging(null);
    }, []);

    React.useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    const connectionPaths = useMemo(() => {
        return connections.map(conn => {
            const fromEl = elements.find(el => el.id === conn.from);
            const toEl = elements.find(el => el.id === conn.to);
            if (!fromEl || !toEl) return null;
            return <path key={conn.id} d={`M ${fromEl.x + 75} ${fromEl.y + 25} L ${toEl.x + 75} ${toEl.y + 25}`} stroke="#9ca3af" strokeWidth="2" fill="none" />;
        }).filter(Boolean);
    }, [connections, elements]);

    const handlePropertyChange = (key: string, value: string) => {
        if(!selectedElement) return;
        const newElements = elements.map(el => el.id === selectedElement.id ? {
            ...el, properties: { ...el.properties, [key]: value }
        }: el);
        setElements(newElements);
        setSelectedElement(newElements.find(el => el.id === selectedElement.id) || null);
    }

    const addElement = (type: OrganiserElementType) => {
        const newElement: OrganiserElement = {
            id: `el_${Date.now()}`,
            type,
            label: `New ${type}`,
            x: 50, y: 50,
            properties: {}
        };
        setElements([...elements, newElement]);
    };

    const orgTree = useMemo(() => {
        const elementMap = new Map<string, TreeNode>(elements.map(el => [el.id, { ...el, children: [] }]));
        const roots: TreeNode[] = [];
        const childrenIds = new Set<string>(connections.map(c => c.to));
    
        for (const conn of connections) {
            const parent = elementMap.get(conn.from);
            const child = elementMap.get(conn.to);
            if (parent && child) {
                parent.children.push(child);
            }
        }
    
        for (const el of elementMap.values()) {
            if (!childrenIds.has(el.id)) {
                roots.push(el);
            }
        }
        return roots;
    }, [elements, connections]);

    return (
        <div className="flex h-full bg-gray-50 rounded-lg shadow-inner">
            {/* Toolbar */}
            <div className="w-52 bg-white border-r p-4 flex flex-col space-y-2">
                <h3 className="font-bold text-lg mb-2 text-gray-800">Tools</h3>
                {Object.values(OrganiserElementType).map(type => {
                    const Icon = ELEMENT_ICONS[type];
                    return (
                        <button key={type} onClick={() => addElement(type)} className="w-full p-2 text-sm text-left rounded-md bg-gray-100 hover:bg-gray-200 flex items-center space-x-2 text-gray-700 font-medium">
                            <Icon className="w-5 h-5" />
                            <span>Add {type}</span>
                        </button>
                    );
                })}
            </div>

            {/* Canvas */}
            <div className="flex-1 relative bg-dots">
                <svg ref={svgRef} className="w-full h-full" style={{minHeight: '80vh'}}>
                    <g>{connectionPaths}</g>
                    {elements.map(el => (
                        <g key={el.id} transform={`translate(${el.x}, ${el.y})`} onMouseDown={(e) => handleMouseDown(e, el)} className="cursor-grab active:cursor-grabbing">
                            <rect width="150" height="50" rx="8" fill={getElementColor(el.type)} stroke={selectedElement?.id === el.id ? '#4c1d95' : 'rgba(0,0,0,0.2)'} strokeWidth={selectedElement?.id === el.id ? 3 : 1} />
                            <text x="75" y="30" textAnchor="middle" fill="white" fontWeight="bold" style={{pointerEvents: 'none'}}>{el.label}</text>
                        </g>
                    ))}
                </svg>
            </div>
            
            {/* Right Panel */}
            <div className="w-96 bg-white border-l p-4 flex flex-col">
                 <div className="border-b border-gray-200 mb-4">
                    <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                        <button onClick={() => setActiveTab('properties')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'properties' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            Properties
                        </button>
                        <button onClick={() => setActiveTab('structure')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'structure' ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            Live Structure
                        </button>
                    </nav>
                </div>
                <div className="flex-grow overflow-y-auto">
                {activeTab === 'properties' && (
                    <div>
                        {selectedElement ? (
                            <div className="space-y-3 animate-fade-in">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Label</label>
                                    <input type="text" value={selectedElement.label} onChange={(e) => {
                                        const newLabel = e.target.value;
                                        setElements(els => els.map(el => el.id === selectedElement.id ? {...el, label: newLabel} : el));
                                        setSelectedElement(el => el ? {...el, label: newLabel} : null);
                                    }} className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-violet-500 focus:border-violet-500" />
                                </div>
                                {Object.entries(selectedElement.properties).map(([key, value]) => (
                                    <div key={key}>
                                        <label className="text-sm font-medium text-gray-700">{key}</label>
                                        <input type="text" value={value} onChange={(e) => handlePropertyChange(key, e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-violet-500 focus:border-violet-500" />
                                    </div>
                                ))}
                            </div>
                        ): (
                            <p className="text-sm text-gray-500">Select an element to see its properties.</p>
                        )}
                    </div>
                )}
                {activeTab === 'structure' && (
                     <div className="animate-fade-in">
                        {orgTree.length > 0 ? orgTree.map(rootNode => (
                             <StructureNode 
                                key={rootNode.id}
                                node={rootNode}
                                level={0}
                                selectedElementId={selectedElement?.id || null}
                                onSelect={(el) => handleSelectElement(el)}
                             />
                        )) : <p className="text-sm text-gray-500">No organizational structure defined yet.</p>}
                     </div>
                )}
                </div>
            </div>
        </div>
    );
};

export default OrganiserView;
