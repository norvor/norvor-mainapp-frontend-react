import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useDispatch, useSelector } from 'react-redux';
import { createDoc, deleteDoc, updateDoc } from '../../store/slices/docSlice';
import { RootState } from '../../store/store';

import ChevronDownIcon from '../../components/icons/ChevronDownIcon';
import HamburgerIcon from '../../components/icons/HamburgerIcon';
import XIcon from '../../components/icons/XIcon';
import TypeIcon from '../../components/icons/TypeIcon';
import Heading1Icon from '../../components/icons/Heading1Icon';
import Heading2Icon from '../../components/icons/Heading2Icon';
import BulletListIcon from '../../components/icons/BulletListIcon';
import NumberedListIcon from '../../components/icons/NumberedListIcon';
import QuoteIcon from '../../components/icons/QuoteIcon';
import CodeBlockIcon from '../../components/icons/CodeBlockIcon';
import TrashIcon from '../../components/icons/TrashIcon';

// --- TYPES ---
interface Doc {
    id: string;
    title: string;
    icon: string;
    parentId: string | null;
    content: string;
}
interface DocNode extends Doc {
    children: DocNode[];
}

const NavItem: React.FC<{
    node: DocNode;
    level: number;
    onSelect: (id: string) => void;
    onDelete: (id: string) => Promise<void>;
    activeDocId: string | null;
}> = ({ node, level, onSelect, onDelete, activeDocId }) => {
    const [isOpen, setIsOpen] = useState(true);
    const hasChildren = node.children.length > 0;
    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await onDelete(node.id);
    };
    return (
        <div>
            <div
                onClick={() => onSelect(node.id)}
                className={`flex items-center p-1.5 rounded-md cursor-pointer group ${activeDocId === node.id ? 'bg-violet-100 dark:bg-violet-900/40' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                style={{ paddingLeft: `${level * 16 + 4}px` }}
            >
                {hasChildren ? (
                    <ChevronDownIcon
                        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                        className={`w-4 h-4 mr-1 text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`}
                    />
                ) : <div className="w-4 h-4 mr-1 flex-shrink-0"></div>}
                <span className="text-sm mr-2">{node.icon}</span>
                <span className="text-sm text-gray-800 dark:text-gray-200 flex-1 truncate">{node.title}</span>
                <button
                    onClick={handleDelete}
                    className="p-1 rounded text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-200 hover:text-gray-800 dark:hover:bg-slate-600 dark:hover:text-gray-200"
                >
                    <TrashIcon />
                </button>
            </div>
            {hasChildren && isOpen && (
                <div className="mt-1">
                    {node.children.map(child => (
                        <NavItem key={child.id} node={child} level={level + 1} onSelect={onSelect} onDelete={onDelete} activeDocId={activeDocId} />
                    ))}
                </div>
            )}
        </div>
    );
};

const DocsView: React.FC = () => {
    const dispatch = useDispatch();
    const { docs } = useSelector((state: RootState) => state.docs);
    const { currentUser } = useSelector((state: RootState) => state.users);


    // Sidebar state
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

    // Active doc state
    const [activeDocId, setActiveDocId] = useState<string | null>(docs.length > 0 ? docs[0].id : null);

    // Find the active doc
    const activeDoc = useMemo(() => docs.find(d => d.id === activeDocId) || null, [docs, activeDocId]);

    // Ensure activeDocId is valid after data load/mutation
    useEffect(() => {
        if (!activeDocId && docs.length > 0) {
            setActiveDocId(docs[0].id);
        } else if (activeDocId && !docs.some(d => d.id === activeDocId)) {
            setActiveDocId(docs.length > 0 ? docs[0].id : null);
        }
    }, [docs, activeDocId]);

    // Editor instance
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: "Type '/' for commands…",
            }),
        ],
        content: activeDoc?.content || '',
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg m-5 focus:outline-none',
            },
        },
    });

    // Update editor content when activeDoc changes
    useEffect(() => {
        if (editor && activeDoc) {
            if (activeDoc.content !== editor.getHTML()) {
                editor.commands.setContent(activeDoc.content || '');
            }
        } else if (editor && !activeDoc) {
            editor.commands.setContent('');
        }
    }, [activeDoc, editor]);

    // Save handler
    const handleSave = useCallback(() => {
        if (!editor || !activeDoc) return;
        const html = editor.getHTML();
        if (html !== activeDoc.content) {
            const updatedDoc: Doc = { ...activeDoc, content: html };
            dispatch(updateDoc(updatedDoc));
        }
    }, [editor, activeDoc, dispatch]);

    // Auto-save on blur
    useEffect(() => {
        if (!editor) return;
        const handleBlur = () => handleSave();
        editor.on('blur', handleBlur);
        return () => {
            editor.off('blur', handleBlur);
        };
    }, [editor, handleSave]);

    // Title change handler
    const handleTitleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!activeDoc) return;
        const newTitle = e.target.value;
        const updatedDoc: Doc = { ...activeDoc, title: newTitle };
        try {
            await dispatch(updateDoc(updatedDoc)).unwrap();
        } catch (error) {
            console.error(`Failed to update document title ${activeDoc.id}:`, error);
        }
    };

    // Doc tree for sidebar
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

    // New doc handler
    const handleNewDoc = async () => {
        handleSave();
        const newDocPayload = {
            title: 'Untitled Page',
            icon: '📄',
            parentId: activeDocId,
            content: '',
        } as Omit<Doc, 'id'>;
        try {
            const result = await dispatch(createDoc(newDocPayload)).unwrap();
            setActiveDocId(result.id);
        } catch (error) {
            console.error('Failed to create new document:', error);
        }
    };

    // Delete doc handler
    const handleDeleteDoc = async (docIdToDelete: string) => {
        if (!window.confirm("Are you sure you want to delete this page and all its subpages? This action cannot be undone.")) return;
        try {
            await dispatch(deleteDoc(docIdToDelete)).unwrap();
        } catch (error) {
            console.error('Failed to delete document:', error);
            alert("Error: Could not delete document.");
        }
    };

    // Select doc handler
    const handleSelectDoc = (id: string) => {
        handleSave();
        setActiveDocId(id);
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    };

    // Slash commands for FloatingMenu
    const slashCommands = [
        { title: 'Text', description: 'Just start writing with plain text.', icon: <TypeIcon />, command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).setNode('paragraph').run()},
        { title: 'Heading 1', description: 'Big section heading.', icon: <Heading1Icon />, command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run()},
        { title: 'Heading 2', description: 'Medium section heading.', icon: <Heading2Icon />, command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run()},
        { title: 'Bullet List', description: 'Create a simple bulleted list.', icon: <BulletListIcon />, command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).toggleBulletList().run()},
        { title: 'Numbered List', description: 'Create a list with numbering.', icon: <NumberedListIcon />, command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).toggleOrderedList().run()},
        { title: 'Quote', description: 'Capture a quote.', icon: <QuoteIcon />, command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).toggleBlockquote().run()},
        { title: 'Code Block', description: 'Capture a code snippet.', icon: <CodeBlockIcon />, command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run()},
        { title: 'Divider', description: 'Visually divide sections.', icon: <div className="w-5 h-5 flex items-center justify-center"><div className="w-full h-0.5 bg-current"></div></div>, command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).setHorizontalRule().run()},
    ];

    return (
        <div className="relative flex h-full bg-white dark:bg-slate-900 rounded-lg shadow-inner overflow-hidden border border-gray-200/50 dark:border-slate-700/50">
            {isSidebarOpen && (
                <div onClick={() => setIsSidebarOpen(false)} className="absolute inset-0 z-40 bg-gray-900/10 lg:hidden" aria-hidden="true" />
            )}
            <nav className={`absolute lg:relative inset-y-0 left-0 z-50 lg:z-auto bg-gray-50 dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col transition-transform duration-300 ease-in-out w-72 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex justify-between items-center p-4 mb-2 shrink-0">
                    <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300">Library</h2>
                    <button onClick={() => setIsSidebarOpen(false)} className="p-1 text-gray-500 hover:text-gray-800 lg:hidden" aria-label="Close sidebar"><XIcon className="w-6 h-6" /></button>
                </div>
                <div className="flex-grow overflow-y-auto space-y-1 px-2">
                    {docTree.map(rootNode => (
                        <NavItem
                            key={rootNode.id}
                            node={rootNode}
                            level={0}
                            onSelect={handleSelectDoc}
                            onDelete={handleDeleteDoc}
                            activeDocId={activeDocId}
                        />
                    ))}
                </div>
                <div className="p-2 border-t border-gray-200 dark:border-slate-700">
                    <button onClick={handleNewDoc} className="w-full text-left text-sm p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700">+ New Page</button>
                </div>
            </nav>
            <main className="flex-1 overflow-y-auto flex flex-col relative">
                {!isSidebarOpen && (
                    <button onClick={() => setIsSidebarOpen(true)} className="absolute top-4 left-4 z-10 p-2 text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-slate-700" aria-label="Open sidebar">
                        <HamburgerIcon className="w-6 h-6" />
                    </button>
                )}
                {editor && activeDoc && (
                    <>
                        <BubbleMenu editor={editor} tippyOptions={{ duration: 100, placement: 'top-start' }} className="flex items-center bg-gray-800 text-white rounded-md shadow-lg overflow-hidden dark:bg-black dark:border dark:border-slate-700">
                            <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 hover:bg-gray-700 dark:hover:bg-slate-700 ${editor.isActive('bold') ? 'bg-gray-600 dark:bg-slate-600' : ''}`}><strong>B</strong></button>
                            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 hover:bg-gray-700 dark:hover:bg-slate-700 ${editor.isActive('italic') ? 'bg-gray-600 dark:bg-slate-600' : ''}`}><em>I</em></button>
                            <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`p-2 hover:bg-gray-700 dark:hover:bg-slate-700 ${editor.isActive('strike') ? 'bg-gray-600 dark:bg-slate-600' : ''}`}><s className="no-underline">S</s></button>
                            <button onClick={() => editor.chain().focus().toggleCode().run()} className={`p-2 hover:bg-gray-700 dark:hover:bg-slate-700 ${editor.isActive('code') ? 'bg-gray-600 dark:bg-slate-600' : ''}`}>&lt;/&gt;</button>
                        </BubbleMenu>
                        <FloatingMenu
                            editor={editor}
                            shouldShow={({ state }) => {
                                const { $from } = state.selection;
                                const currentLineText = $from.parent.textContent;
                                return $from.parent.isEmpty || currentLineText === '/';
                            }}
                            tippyOptions={{ duration: 100, maxWidth: 300 }}
                            className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border dark:border-slate-700 p-2 flex flex-col w-72 max-h-80 overflow-y-auto"
                        >
                            <h4 className="text-xs text-gray-400 font-semibold uppercase px-2 py-1">Basic Blocks</h4>
                            {slashCommands.map(item => (
                                <button
                                    key={item.title}
                                    onClick={() => {
                                        if (!editor) return;
                                        const { state } = editor;
                                        const { $from } = state.selection;
                                        const currentLineText = $from.parent.textContent;
                                        let range;
                                        if (currentLineText === '/') {
                                            range = { from: $from.pos - 1, to: $from.pos };
                                        } else {
                                            range = { from: $from.pos, to: $from.pos };
                                        }
                                        item.command({ editor, range });
                                    }}
                                    className="w-full flex items-center text-left p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700"
                                >
                                    <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-md mr-3 text-gray-600 dark:text-gray-300">{item.icon}</div>
                                    <div>
                                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">{item.title}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                                    </div>
                                </button>
                            ))}
                        </FloatingMenu>
                    </>
                )}
                {activeDoc ? (
                    <div className="flex-1 flex flex-col">
                        <header className="px-16 pt-12 pb-4">
                            <div className="text-6xl mb-4">{activeDoc.icon}</div>
                            <input
                                type="text"
                                value={activeDoc.title}
                                onChange={handleTitleChange}
                                onBlur={handleSave}
                                placeholder="Untitled"
                                className="w-full text-5xl font-bold border-none focus:ring-0 p-0 placeholder-gray-300 dark:placeholder-gray-600 bg-transparent text-gray-900 dark:text-white"
                            />
                        </header>
                        <div className="flex-1 px-16">
                            <EditorContent editor={editor} />
                        </div>
                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400 flex-col">
                        <p className="text-lg">Welcome to your Library!</p>
                        <p>Select a page to get started, or create a new one.</p>
                        <button onClick={handleNewDoc} className="mt-4 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-md hover:bg-violet-700">
                            Create a new page
                        </button>
                    </div>
                )}
            </main>
            <style>{`
                .ProseMirror {
                    min-height: 100%;
                }
                .ProseMirror:focus {
                    outline: none;
                }
                .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #adb5bd;
                    pointer-events: none;
                    height: 0;
                }
            `}</style>
        </div>
    );
};

export default DocsView;