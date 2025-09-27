import React, { useState, useMemo } from 'react';
import ChevronDownIcon from '../../components/icons/ChevronDownIcon';

// --- TYPES ---
interface Doc {
    id: string;
    title: string;
    icon: string; // emoji
    parentId: string | null;
    content: React.ReactNode;
}

interface DocNode extends Doc {
    children: DocNode[];
}

// --- MOCK DATA ---
const MOCK_DOCS: Doc[] = [
    { 
        id: '1', title: 'Onboarding Guide', icon: '🚀', parentId: null, 
        content: (
            <>
                <h2>Welcome to Norvor!</h2>
                <p>This guide will walk you through everything you need to know to get started. We're excited to have you on the team.</p>
                <h3>Our Mission</h3>
                <p>Our mission is to build the most intuitive and powerful CRM on the market, empowering teams to achieve more.</p>
                <h3>Key Resources</h3>
                <ul>
                    <li>Company Policies (see the "Company Policies" section)</li>
                    <li>Engineering Style Guide (for developers)</li>
                    <li>Brand Assets</li>
                </ul>
            </>
        ) 
    },
    { 
        id: '2', title: 'First Week Checklist', icon: '✅', parentId: '1', 
        content: (
            <>
                <h2>Your First Week Checklist</h2>
                <p>Use this list to track your progress during your first week.</p>
                <ul className="list-none space-y-2">
                    <li><label><input type="checkbox" className="mr-2"/> Set up your development environment.</label></li>
                    <li><label><input type="checkbox" className="mr-2"/> Have introductory meetings with your direct team members.</label></li>
                    <li><label><input type="checkbox" className="mr-2"/> Get access to all necessary software (Slack, Figma, GitHub).</label></li>
                    <li><label><input type="checkbox" className="mr-2"/> Review the company-wide onboarding guide.</label></li>
                </ul>
            </>
        ) 
    },
    { 
        id: '3', title: 'Company Policies', icon: '⚖️', parentId: null, 
        content: (
            <>
                <h2>Company Policies Overview</h2>
                <p>This section contains important information about company policies. Please review them carefully.</p>
            </>
        ) 
    },
    { 
        id: '4', title: 'Remote Work Policy', icon: '🏠', parentId: '3', 
        content: (
            <>
                <h2>Remote Work Policy</h2>
                <p>We are a remote-first company. This means you can work from anywhere with a reliable internet connection. We expect you to be available during core collaboration hours (10am - 4pm in your local timezone).</p>
            </>
        ) 
    },
    { 
        id: '5', title: 'Time Off Policy', icon: '✈️', parentId: '3', 
        content: (
            <>
                <h2>Time Off Policy</h2>
                <p>We offer a flexible, unlimited PTO policy. We trust you to take the time you need to rest and recharge, while still ensuring your work is completed. Please provide at least 2 weeks notice for any vacation longer than 3 days.</p>
            </>
        ) 
    },
    { 
        id: '6', title: 'Engineering', icon: '⚙️', parentId: null, 
        content: (
            <>
                <h2>Engineering Documentation</h2>
                <p>A collection of technical documentation, style guides, and best practices for the engineering team.</p>
            </>
        ) 
    },
    { 
        id: '7', title: 'Style Guide', icon: '🎨', parentId: '6', 
        content: (
            <>
                <h2>Frontend Style Guide</h2>
                <p>Our frontend stack is built on React, TypeScript, and TailwindCSS.</p>
                <h3>Component Naming</h3>
                <p>Components should be named using PascalCase (e.g., `MyComponent.tsx`).</p>
                <h3>State Management</h3>
                <p>For local state, use `useState`. For global state, we use React Context for simplicity, but may adopt a more robust library if needed.</p>
            </>
        ) 
    },
];

// --- COMPONENTS ---

const NavItem: React.FC<{ 
    node: DocNode; 
    level: number;
    onSelect: (id: string) => void;
    activeDocId: string;
}> = ({ node, level, onSelect, activeDocId }) => {
    const [isOpen, setIsOpen] = useState(true);
    const hasChildren = node.children.length > 0;

    return (
        <div>
            <div 
                onClick={() => onSelect(node.id)}
                className={`flex items-center p-1.5 rounded-md cursor-pointer group ${activeDocId === node.id ? 'bg-violet-100' : 'hover:bg-gray-200'}`}
                style={{ paddingLeft: `${level * 16 + 4}px` }}
            >
                {hasChildren && (
                    <ChevronDownIcon 
                        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} 
                        className={`w-4 h-4 mr-1 text-gray-400 group-hover:text-gray-700 transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`} 
                    />
                )}
                {!hasChildren && <div className="w-4 h-4 mr-1"></div>}
                <span className="text-sm mr-2">{node.icon}</span>
                <span className="text-sm text-gray-800 flex-1 truncate">{node.title}</span>
            </div>
            {hasChildren && isOpen && (
                 <div className="mt-1">
                    {node.children.map(child => (
                        <NavItem key={child.id} node={child} level={level + 1} onSelect={onSelect} activeDocId={activeDocId} />
                    ))}
                </div>
            )}
        </div>
    );
};

const DocsView: React.FC = () => {
    const [docs] = useState<Doc[]>(MOCK_DOCS);
    const [activeDocId, setActiveDocId] = useState<string>('1');

    const docTree = useMemo(() => {
        const nodes: Record<string, DocNode> = {};
        docs.forEach(doc => {
            nodes[doc.id] = { ...doc, children: [] };
        });

        const tree: DocNode[] = [];
        docs.forEach(doc => {
            if (doc.parentId && nodes[doc.parentId]) {
                nodes[doc.parentId].children.push(nodes[doc.id]);
            } else {
                tree.push(nodes[doc.id]);
            }
        });
        return tree;
    }, [docs]);

    const activeDoc = useMemo(() => docs.find(d => d.id === activeDocId), [docs, activeDocId]);

    return (
        <div className="flex h-full bg-white rounded-lg shadow-inner overflow-hidden border border-gray-200/50">
            {/* Left Nav */}
            <nav className="w-72 bg-gray-50/50 border-r border-gray-200 p-3 flex flex-col space-y-1">
                <h2 className="px-2 py-1 text-sm font-semibold text-gray-700">Workspace</h2>
                {docTree.map(rootNode => (
                    <NavItem key={rootNode.id} node={rootNode} level={0} onSelect={setActiveDocId} activeDocId={activeDocId} />
                ))}
            </nav>

            {/* Main Content */}
            <main className="flex-1 p-8 lg:p-16 overflow-y-auto">
                {activeDoc ? (
                    <article>
                        <div className="flex items-center space-x-3 text-4xl font-bold mb-10 text-gray-800">
                           <span className="text-5xl -mt-2">{activeDoc.icon}</span>
                           <h1>{activeDoc.title}</h1>
                        </div>
                        <div className="prose-custom space-y-4">
                            {activeDoc.content}
                        </div>
                    </article>
                ) : (
                    <div className="text-center text-gray-500">
                        <p>Select a document to view its content.</p>
                    </div>
                )}
            </main>
            <style>{`
                .prose-custom h2 {
                    font-size: 1.875rem;
                    font-weight: 700;
                    margin-top: 2.5rem;
                    margin-bottom: 1rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid #e5e7eb;
                }
                .prose-custom h3 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin-top: 2rem;
                    margin-bottom: 0.75rem;
                }
                .prose-custom p, .prose-custom li {
                    font-size: 1.125rem;
                    line-height: 1.75;
                    color: #374151;
                }
                .prose-custom ul {
                    list-style-type: disc;
                    padding-left: 1.5rem;
                }
            `}</style>
        </div>
    );
};

export default DocsView;
