import React, { useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { OrganiserElement, OrganiserElementType, User, UserRole, Tool } from '../../types';
import SearchIcon from '../../components/icons/SearchIcon';
import TrashIcon from '../../components/icons/TrashIcon';
import TreeItem from '../../components/organiser/TreeItem';
import { NORVOR_TOOL_DEFINITIONS } from '../../components/organiser/TreeItem';
import {
    createOrganiserElement,
    updateOrganiserElement,
    deleteOrganiserElement,
    addTeamMember,
    removeTeamMember,
} from '../../store/slices/organiserSlice';

interface TreeNode extends OrganiserElement {
    children: TreeNode[];
}

interface TeamMember {
    id: string; // This is the team_role_id
    userId: string;
    role: string;
}

const MemberManagement: React.FC<{
    element: OrganiserElement;
    allUsers: User[];
    isEditable: boolean;
}> = ({ element, allUsers, isEditable }) => {
    const dispatch: AppDispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState('');
    
    const currentMembers = useMemo(() => {
        const roles = element.properties.team_roles || [];
        return roles.map((role: any) => ({
            id: role.id,
            userId: role.user.id,
            name: role.user.name,
            email: role.user.email,
            role: role.role,
        }));
    }, [element.properties.team_roles]);

    const memberIdSet = useMemo(() => new Set(currentMembers.map(m => m.userId)), [currentMembers]);
    const availableUsers = useMemo(() => {
        if (!searchTerm) return [];
        return allUsers.filter(user => !memberIdSet.has(user.id) && user.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [allUsers, memberIdSet, searchTerm]);

    const handleAddMember = (user: User) => {
        dispatch(addTeamMember({ teamId: element.id, userId: user.id, role: 'Member' }));
        setSearchTerm('');
    };
    
    const handleRemoveMember = (teamRoleId: string) => {
        dispatch(removeTeamMember({ teamRoleId }));
    };

    return (
        <div className="mt-8 border-t dark:border-gray-700 pt-6">
            <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Team Members ({currentMembers.length})</h4>
            {isEditable && (
                 <div className="border p-4 rounded-lg space-y-3 mb-6 bg-gray-50 dark:bg-slate-700/50">
                    <h5 className="font-semibold text-gray-700 dark:text-gray-200">Add Employee</h5>
                    <div className="relative">
                        <SearchIcon className="w-5 h-5 absolute top-2.5 left-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search existing employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 pl-10 border rounded-md text-sm bg-transparent"
                        />
                    </div>
                    {searchTerm && (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {availableUsers.map(user => (
                                <div key={user.id} className="p-2 border rounded-md flex justify-between items-center bg-white dark:bg-gray-800">
                                    <div><p className="text-sm font-medium">{user.name}</p></div>
                                    <button onClick={() => handleAddMember(user)} className="px-3 py-1 text-xs rounded-md bg-violet-600 text-white">+</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            <div className="space-y-3">
                {currentMembers.map(member => (
                    <div key={member.id} className="p-3 border rounded-lg flex justify-between items-center bg-white dark:bg-gray-800">
                        <div>
                            <p className="font-semibold">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.role}</p>
                        </div>
                        {isEditable && (
                            <button onClick={() => handleRemoveMember(member.id)} className="p-1 rounded text-red-500"><TrashIcon /></button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const OrganiserView: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const { currentUser, users: allUsers } = useSelector((state: RootState) => state.users);
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
                elementMap.get(el.parentId)?.children.push(node);
            } else if (el.type === OrganiserElementType.DEPARTMENT) {
                roots.push(node);
            }
        });
        return roots;
    }, [elements]);

    const handleSelect = (elementId: string) => setSelectedElementId(elementId);

    const handleUpdateLabel = (e: React.FocusEvent<HTMLInputElement>) => {
        if (!selectedElement || !isEditable || selectedElement.label === e.target.value) return;
        dispatch(updateOrganiserElement({ ...selectedElement, label: e.target.value }));
    };

    const addElement = (type: OrganiserElementType) => {
        if (!isEditable) return;
        const parentId = (type === OrganiserElementType.TEAM && selectedElement?.type === OrganiserElementType.DEPARTMENT) ? selectedElementId : null;
        const newElement: Omit<OrganiserElement, 'id'> = {
            type,
            label: `New ${type}`,
            parentId,
            properties: {},
        };
        dispatch(createOrganiserElement(newElement));
    };

    const handleDelete = () => {
        if (!selectedElement || !isEditable) return;
        if (window.confirm(`Are you sure you want to delete "${selectedElement.label}"?`)) {
            dispatch(deleteOrganiserElement(selectedElement));
            setSelectedElementId(null);
        }
    };
    
    const handleAddTool = (toolId: Tool) => {
        if (!isEditable || !selectedElement || selectedElement.type !== OrganiserElementType.TEAM) return;
        const currentTools = (selectedElement.properties.tools || []) as Tool[];
        if (!currentTools.includes(toolId)) {
            const updatedElement = { ...selectedElement, properties: { ...selectedElement.properties, tools: [...currentTools, toolId] } };
            dispatch(updateOrganiserElement(updatedElement));
        }
    };

    return (
        <div className="flex h-full bg-white dark:bg-gray-800 rounded-lg shadow-inner border dark:border-slate-700/50 overflow-hidden">
            <div className="w-1/3 min-w-80 bg-gray-50 dark:bg-slate-800 border-r dark:border-slate-700 p-4 overflow-y-auto">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Company Structure</h2>
                {isEditable && (
                    <div className="space-y-2">
                        <button onClick={() => addElement(OrganiserElementType.DEPARTMENT)} className="w-full text-left p-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-slate-700">+ Add Department</button>
                        <button onClick={() => addElement(OrganiserElementType.TEAM)} disabled={selectedElement?.type !== OrganiserElementType.DEPARTMENT} className="w-full text-left p-2 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">+ Add Team</button>
                    </div>
                )}
                <hr className="my-4 dark:border-gray-700"/>
                {orgTree.map(rootNode => (
                    <TreeItem key={rootNode.id} node={rootNode} level={0} selectedElementId={selectedElementId} onSelect={handleSelect} />
                ))}
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
                {selectedElement ? (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Properties</h3>
                            {isEditable && <button onClick={handleDelete} className="px-3 py-1 text-sm rounded-md bg-red-100 text-red-700">Delete</button>}
                        </div>
                        <div className="space-y-4">
                            <label className="text-sm font-medium">Label</label>
                            <input type="text" key={selectedElement.id} defaultValue={selectedElement.label} disabled={!isEditable} onBlur={handleUpdateLabel} className="w-full mt-1 p-2 border rounded-md text-sm bg-transparent" />
                        </div>
                        
                        {selectedElement.type === OrganiserElementType.TEAM && (
                            <MemberManagement element={selectedElement} allUsers={allUsers} isEditable={isEditable} />
                        )}

                        {isEditable && selectedElement.type === OrganiserElementType.TEAM && (
                            <div className="mt-8 border-t pt-6">
                                <h4 className="font-semibold mb-2">Add Norvor Tool</h4>
                                <div className="flex flex-wrap gap-2">
                                    {NORVOR_TOOL_DEFINITIONS.map(tool => (
                                        <button key={tool.id} onClick={() => handleAddTool(tool.id as Tool)} disabled={selectedElement.properties.tools?.includes(tool.id)} className="px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50">
                                            + Add {tool.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center text-gray-500">
                        <p>Select an element to view its details.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
export default OrganiserView;