
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ChevronDownIcon from '../../components/icons/ChevronDownIcon';
import ChevronLeftIcon from '../../components/icons/ChevronLeftIcon';
import HamburgerIcon from '../../components/icons/HamburgerIcon';
import XIcon from '../../components/icons/XIcon';

// --- TYPES ---
interface Doc {
    id: string;
    title: string;
    icon: string; // emoji
    parentId: string | null;
    content: string; // Now HTML content
}

interface DocNode extends Doc {
    children: DocNode[];
}

// --- MOCK DATA (Content is now HTML) ---
const MOCK_DOCS: Doc[] = [
    { 
        id: '1', title: 'Onboarding Guide', icon: '🚀', parentId: null, 
        content: `<h2>Welcome to Norvor!</h2><p>This guide will walk you through everything you need to know to get started. We're excited to have you on the team.</p><h3>Our Mission</h3><p>Our mission is to build the most intuitive and powerful CRM on the market, empowering teams to achieve more.</p><h3>Key Resources</h3><ul><li>Company Policies (see the "Company Policies" section)</li><li>Engineering Style Guide (for developers)</li><li>Brand Assets</li></ul>`
    },
    { 
        id: '2', title: 'First Week Checklist', icon: '✅', parentId: '1', 
        content: `<h2>Your First Week Checklist</h2><p>Use this list to track your progress during your first week.</p><ul><li>Set up your development environment.</li><li>Have introductory meetings with your direct team members.</li><li>Get access to all necessary software (Slack, Figma, GitHub).</li><li>Review the company-wide onboarding guide.</li></ul>`
    },
    { 
        id: '3', title: 'Company Policies', icon: '⚖️', parentId: null, 
        content: `<h2>Company Policies Overview</h2><p>This section contains important information about company policies. Please review them carefully.</p>`
    },
    { 
        id: '4', title: 'Remote Work Policy', icon: '🏠', parentId: '3', 
        content: `<h2>Remote Work Policy</h2><p>We are a remote-first company. This means you can work from anywhere with a reliable internet connection. We expect you to be available during core collaboration hours (10am - 4pm in your local timezone).</p>`
    },
    { 
        id: '5', title: 'Time Off Policy', icon: '✈️', parentId: '3', 
        content: `<h2>Time Off Policy</h2><p>We offer a flexible, unlimited PTO policy. We trust you to take the time you need to rest and recharge, while still ensuring your work is completed. Please provide at least 2 weeks notice for any vacation longer than 3 days.</p>`
    },
    { 
        id: '6', title: 'Engineering', icon: '⚙️', parentId: null, 
        content: `<h2>Engineering Documentation</h2><p>A collection of technical documentation, style guides, and best practices for the engineering team.</p>`
    },
    { 
        id: '7', title: 'Style Guide', icon: '🎨', parentId: '6', 
        content: `<h2>Frontend Style Guide</h2><p>Our frontend stack is built on React, TypeScript, and TailwindCSS.</p><h3>Component Naming</h3><p>Components should be named using PascalCase (e.g., <code>MyComponent.tsx</code>).</p><h3>State Management</h3><p>For local state, use <code>useState</code>. For global state, we use React Context for simplicity, but may adopt a more robust library if needed.</p>`
    },
];

// --- COMPONENTS ---

const MenuBar: React.FC<{ editor: Editor | null }> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex items-center space-x-1 bg-white border border-gray-200 rounded-md p-1 sticky top-4 z-10 shadow-sm">
      <button onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} className={`p-2 rounded ${editor.isActive('bold') ? 'is-active' : ''}`}>
        <strong>B</strong>
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} className={`p-2 rounded ${editor.isActive('italic') ? 'is-active' : ''}`}>
        <em>I</em>
      </button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-2 rounded ${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}>
        H1
      </button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}>
        H2
      </button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-2 rounded ${editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}`}>
        H3
      </button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded ${editor.isActive('bulletList') ? 'is-active' : ''}`}>
        UL
      </button>
    </div>
  );
};


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

const LibraryView: React.FC = () => {
    const [docs, setDocs] = useState<Doc[]>(MOCK_DOCS);
    const [activeDocId, setActiveDocId] = useState<string>('1');
    const [isEditing, setIsEditing] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
    
    const activeDoc = useMemo(() => docs.find(d => d.id === activeDocId), [docs, activeDocId]);

    const handleResize = useCallback(() => {
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        } else {
            setIsSidebarOpen(true);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check on load
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);
    
    const handleSelectDoc = (id: string) => {
        setActiveDocId(id);
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    };

    const editor = useEditor({
        extensions: [StarterKit],
        content: activeDoc?.content || '',
        editable: isEditing,
    });
    
    useEffect(() => {
        if (editor) {
            editor.setEditable(isEditing);
        }
    }, [isEditing, editor]);

    useEffect(() => {
        if (editor && activeDoc) {
            if (editor.getHTML() !== activeDoc.content) {
                editor.commands.setContent(activeDoc.content);
            }
        }
        setIsEditing(false);
    }, [activeDocId, editor, activeDoc]);

    const handleEdit = () => setIsEditing(true);

    const handleCancel = () => {
        if (editor && activeDoc) {
            editor.commands.setContent(activeDoc.content);
        }
        setIsEditing(false);
    };

    const handleSave = () => {
        if (activeDoc && editor) {
            setDocs(docs.map(doc => doc.id === activeDocId ? { ...doc, content: editor.getHTML() } : doc));
            setIsEditing(false);
        }
    };
    
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

    return (
        <div className="relative flex h-full bg-white rounded-lg shadow-inner overflow-hidden border border-gray-200/50">
            {isSidebarOpen && (
                <div 
                    onClick={() => setIsSidebarOpen(false)}
                    className="absolute inset-0 z-40 bg-gray-900/10 lg:hidden"
                    aria-hidden="true"
                ></div>
            )}
            
            <nav className={`
                absolute lg:relative inset-y-0 left-0 z-50 lg:z-auto
                bg-gray-50 border-r border-gray-200
                flex flex-col
                transition-all duration-300 ease-in-out
                w-72
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
                ${isSidebarOpen ? 'lg:w-72 lg:p-3' : 'lg:w-0 lg:p-0'}
                overflow-hidden
            `}>
                <div className="flex justify-between items-center p-2 mb-2 shrink-0">
                    <h2 className="text-sm font-semibold text-gray-700 px-2">Workspace</h2>
                    <div>
                         <button 
                            onClick={() => setIsSidebarOpen(false)} 
                            className="p-1 text-gray-500 hover:text-gray-800 hidden lg:block rounded-md hover:bg-gray-200"
                            aria-label="Collapse sidebar"
                        >
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => setIsSidebarOpen(false)} 
                            className="p-1 text-gray-500 hover:text-gray-800 lg:hidden"
                            aria-label="Close sidebar"
                        >
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto space-y-1">
                    {docTree.map(rootNode => (
                        <NavItem key={rootNode.id} node={rootNode} level={0} onSelect={handleSelectDoc} activeDocId={activeDocId} />
                    ))}
                </div>
            </nav>

            <main className="flex-1 p-8 lg:p-12 overflow-y-auto flex flex-col relative transition-all duration-300">
                {activeDoc ? (
                    <>
                        <header className="flex justify-between items-center mb-8">
                           <div className="flex items-center space-x-3 text-2xl sm:text-4xl font-bold text-gray-800">
                               {!isSidebarOpen && (
                                   <button 
                                       onClick={() => setIsSidebarOpen(true)} 
                                       className="p-1 text-gray-500 hover:text-gray-800 mr-2 -ml-2 rounded-full hover:bg-gray-200"
                                       aria-label="Open sidebar"
                                   >
                                       <HamburgerIcon className="w-6 h-6" />
                                   </button>
                               )}
                               <span className="text-3xl sm:text-5xl -mt-2">{activeDoc.icon}</span>
                               <h1>{activeDoc.title}</h1>
                            </div>
                            <div className="flex space-x-2">
                                {isEditing ? (
                                    <>
                                        <button onClick={handleSave} className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-md hover:bg-violet-700">Save</button>
                                        <button onClick={handleCancel} className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300">Cancel</button>
                                    </>
                                ) : (
                                    <button onClick={handleEdit} className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300">Edit</button>
                                )}
                            </div>
                        </header>
                         {isEditing && <MenuBar editor={editor} />}
                        <article className="flex-1 mt-4">
                           <EditorContent editor={editor} />
                        </article>
                    </>
                ) : (
                    <div className="text-center text-gray-500 m-auto">
                        <p>Select a document to view its content.</p>
                    </div>
                )}
            </main>
            <style>{`
                .ProseMirror {
                    outline: none;
                }
                .ProseMirror-focused {
                    outline: none;
                }
                .ProseMirror > * + * {
                    margin-top: 0.75em;
                }
                .ProseMirror ul, .ProseMirror ol {
                    padding: 0 1rem;
                }
                .ProseMirror h1, .ProseMirror h2, .ProseMirror h3 {
                    line-height: 1.1;
                    font-weight: 600;
                }
                .ProseMirror h1 { font-size: 2em; }
                .ProseMirror h2 { font-size: 1.5em; }
                .ProseMirror h3 { font-size: 1.25em; }
                .ProseMirror code {
                    background-color: rgba(97, 97, 97, 0.1);
                    color: #616161;
                    font-size: 0.9rem;
                    padding: 0.1rem 0.3rem;
                    border-radius: 0.25rem;
                }
                
                button.is-active {
                    background-color: #e0e0e0;
                }
            `}</style>
        </div>
    );
};

export default LibraryView;
