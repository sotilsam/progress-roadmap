import { useEffect, useRef, useState } from 'react';
import { useRoadmapStore, PALETTE } from '../store/useRoadmapStore';
import { Edit2, Plus, Trash2, Check, ChevronUp, ChevronDown, ChevronRight, GripVertical, FileText, MoreHorizontal } from 'lucide-react';
import { Reorder } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Sidebar() {
    const {
        pillars,
        activeModuleId,
        activePillarId,
        addPillar,
        updatePillarName,
        updatePillarColor,
        deletePillar,
        movePillarUp,
        movePillarDown,
        setActivePillarId,
        addModule,
        updateModuleName,
        toggleModuleCompletion,
        deleteModule,
        reorderModules,
        addSubModule,
        updateSubModuleName,
        toggleSubModuleCompletion,
        deleteSubModule,
        setActiveModule,
        openNotes,
        collapsedPillars,
        collapsedModules,
        togglePillarCollapse,
        toggleModuleCollapse,
        setViewMode,
    } = useRoadmapStore();

    const [editingPillarId, setEditingPillarId] = useState<string | null>(null);
    const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
    const [editingSubModuleId, setEditingSubModuleId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to active module
    useEffect(() => {
        if (activeModuleId && scrollRef.current) {
            const activeElement = scrollRef.current.querySelector(`#sidebar-module-${activeModuleId}`);
            if (activeElement) {
                activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [activeModuleId]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleAddPillar = () => {
        const newId = addPillar('New Pillar');
        setEditingPillarId(newId);
        setEditName('New Pillar');
    };

    const handleSavePillarName = (id: string) => {
        updatePillarName(id, editName);
        setEditingPillarId(null);
    };

    const handleSaveModuleName = (pillarId: string, moduleId: string) => {
        updateModuleName(pillarId, moduleId, editName);
        setEditingModuleId(null);
    };

    const handleSaveSubModuleName = (pillarId: string, moduleId: string, subModuleId: string) => {
        updateSubModuleName(pillarId, moduleId, subModuleId, editName);
        setEditingSubModuleId(null);
    };

    const handleBackgroundClick = () => {
        setActivePillarId(null);
        setActiveModule(null);
        setViewMode('roadmap');
    };

    return (
        <div
            className="w-64 lg:w-80 shrink-0 h-full flex flex-col bg-[#a389ee] border-r-4 border-black z-20"
            onClick={handleBackgroundClick}
        >
            <div className="p-6 border-b-4 border-black shrink-0 bg-[#ccea76]">
                <h1 className="text-2xl font-black text-black uppercase flex items-center justify-between">
                    <span>PROGRESS.<br />ROADMAP</span>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleAddPillar(); }}
                        className="p-1 neobrutal-btn bg-white"
                        title="Add Core Pillar"
                    >
                        <Plus size={20} className="text-black" />
                    </button>
                </h1>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 overflow-x-hidden custom-scrollbar">
                {pillars.map((pillar) => {
                    const isPillarMenuOpen = openMenuId === pillar.id || pillar.modules.some(m => m.id === openMenuId || m.subModules?.some(s => s.id === openMenuId));
                    return (
                        <div key={pillar.id} className={twMerge("space-y-3 relative transition-all duration-300", isPillarMenuOpen ? "z-50" : "z-10")}>

                            {/* Pillar Header */}
                            <div
                                className={twMerge(
                                    "flex flex-col group p-3 rounded-xl cursor-pointer border-2 transition-all relative",
                                    activePillarId === pillar.id ? "bg-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1" : "bg-white/50 border-black/20 hover:bg-white hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1",
                                    openMenuId === pillar.id ? "z-50" : "z-10"
                                )}
                                style={{ zIndex: openMenuId === pillar.id ? 50 : 1 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActivePillarId(pillar.id);
                                    openNotes('pillar', pillar.id);
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    {editingPillarId === pillar.id ? (
                                        <div className="flex flex-col flex-1 space-y-3" onClick={e => e.stopPropagation()}>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    autoFocus
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSavePillarName(pillar.id)}
                                                    className="flex-1 bg-white border-2 border-black px-2 py-1 outline-none font-bold text-sm uppercase text-black focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                                />
                                                <button onClick={() => handleSavePillarName(pillar.id)} className="text-black hover:scale-110 neobrutal-btn p-1 bg-white">
                                                    <Check size={16} />
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {PALETTE.map(color => (
                                                    <button
                                                        key={color}
                                                        onClick={() => updatePillarColor(pillar.id, color)}
                                                        className={twMerge(
                                                            "w-6 h-6 rounded border-2 border-black transition-transform hover:scale-110",
                                                            pillar.color === color ? "scale-110 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : ""
                                                        )}
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center flex-1 space-x-3 py-1">
                                            <div className="w-5 h-5 rounded border-2 border-black flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" style={{ backgroundColor: pillar.color }} />
                                            <h2
                                                className="text-base font-black uppercase tracking-wider transition-colors text-black flex-1"
                                            >
                                                {pillar.name}
                                            </h2>
                                            {pillar.modules.length > 0 && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); togglePillarCollapse(pillar.id); }}
                                                    className="text-black/50 hover:text-black hover:bg-black/10 rounded p-1 transition-colors"
                                                >
                                                    {collapsedPillars.includes(pillar.id) ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                                                </button>
                                            )}
                                            <div className={clsx("flex items-center transition-opacity ml-auto relative", openMenuId === pillar.id ? "opacity-100" : "opacity-0 group-hover:opacity-100")} onClick={e => e.stopPropagation()}>
                                                <button
                                                    onClick={() => setOpenMenuId(openMenuId === pillar.id ? null : pillar.id)}
                                                    className="text-black/50 hover:text-black p-1"
                                                >
                                                    <MoreHorizontal size={16} />
                                                </button>

                                                {openMenuId === pillar.id && (
                                                    <div className="absolute right-0 top-full mt-1 bg-white border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-50 flex flex-col py-1 w-36">
                                                        <button
                                                            onClick={() => { setEditingPillarId(pillar.id); setEditName(pillar.name); setOpenMenuId(null); }}
                                                            className="flex items-center px-3 py-1.5 text-sm hover:bg-black/5 text-black w-full text-left"
                                                        >
                                                            <Edit2 size={14} className="mr-2" /> Rename
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setActivePillarId(pillar.id);
                                                                openNotes('pillar', pillar.id);
                                                                setOpenMenuId(null);
                                                            }}
                                                            className="flex items-center px-3 py-1.5 text-sm hover:bg-black/5 text-black w-full text-left"
                                                        >
                                                            <FileText size={14} className="mr-2" /> Notes
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                const newId = addModule(pillar.id, 'New Module');
                                                                setEditingModuleId(newId);
                                                                setEditName('New Module');
                                                                setOpenMenuId(null);
                                                            }}
                                                            className="flex items-center px-3 py-1.5 text-sm hover:bg-black/5 text-black w-full text-left"
                                                        >
                                                            <Plus size={14} className="mr-2" /> Add Module
                                                        </button>
                                                        <div className="flex items-center justify-between px-3 py-1.5 text-sm hover:bg-black/5 text-black w-full text-left">
                                                            <span className="flex items-center"><GripVertical size={14} className="mr-2" /> Move</span>
                                                            <div className="flex space-x-1">
                                                                <button onClick={(e) => { e.stopPropagation(); movePillarUp(pillar.id); }} className="hover:scale-110 p-0.5"><ChevronUp size={14} /></button>
                                                                <button onClick={(e) => { e.stopPropagation(); movePillarDown(pillar.id); }} className="hover:scale-110 p-0.5"><ChevronDown size={14} /></button>
                                                            </div>
                                                        </div>
                                                        <div className="h-px bg-black/10 my-1 w-full" />
                                                        <button
                                                            onClick={() => { deletePillar(pillar.id); setOpenMenuId(null); }}
                                                            className="flex items-center px-3 py-1.5 text-sm hover:bg-red-50 text-red-500 w-full text-left font-semibold"
                                                        >
                                                            <Trash2 size={14} className="mr-2" /> Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Modules List */}
                            {!collapsedPillars.includes(pillar.id) && (
                                <Reorder.Group
                                    axis="y"
                                    values={pillar.modules}
                                    onReorder={(newOrder) => reorderModules(pillar.id, newOrder)}
                                    className="space-y-2 pl-4 border-l-4 border-black ml-4"
                                >
                                    {pillar.modules.map((module) => {
                                        const isActive = activeModuleId === module.id;
                                        const isModuleMenuOpen = openMenuId === module.id || module.subModules?.some(s => s.id === openMenuId);

                                        return (
                                            <Reorder.Item
                                                key={module.id}
                                                value={module}
                                                className={twMerge("flex flex-col relative transition-all duration-300", isModuleMenuOpen ? "z-50" : "z-10")}
                                                style={{ position: 'relative', zIndex: isModuleMenuOpen ? 50 : 1 }}
                                            >
                                                <div
                                                    id={`sidebar-module-${module.id}`}
                                                    className={twMerge(
                                                        "flex items-center justify-between p-2 rounded-lg cursor-pointer group transition-all duration-300 border-2 relative",
                                                        isActive ? "bg-white border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5" : "bg-white/40 border-transparent hover:bg-white hover:border-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5",
                                                        module.isCompleted && !isActive ? "opacity-70" : "",
                                                        openMenuId === module.id ? "z-50" : "z-10"
                                                    )}
                                                    style={{ zIndex: openMenuId === module.id ? 50 : 1 }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActivePillarId(pillar.id);
                                                        setActiveModule(module.id);
                                                        openNotes('module', pillar.id, module.id);
                                                    }}
                                                >
                                                    <div className="flex items-center flex-1 space-x-3 overflow-hidden">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleModuleCompletion(pillar.id, module.id);
                                                            }}
                                                            className="shrink-0"
                                                        >
                                                            {module.isCompleted ? (
                                                                <div className="w-5 h-5 rounded border-2 border-black flex items-center justify-center transition-colors" style={{ backgroundColor: pillar.color }}>
                                                                    <Check size={14} className="text-black stroke-[3px]" />
                                                                </div>
                                                            ) : (
                                                                <div className="w-5 h-5 rounded border-2 border-black bg-white transition-colors hover:bg-black/10" style={{ backgroundColor: isActive ? pillar.color : undefined }} />
                                                            )}
                                                        </button>

                                                        {editingModuleId === module.id ? (
                                                            <div className="flex items-center flex-1 space-x-2">
                                                                <input
                                                                    autoFocus
                                                                    value={editName}
                                                                    onChange={(e) => setEditName(e.target.value)}
                                                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveModuleName(pillar.id, module.id)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="flex-1 bg-white border-2 border-black text-black px-2 py-1 outline-none font-bold text-sm w-full"
                                                                />
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleSaveModuleName(pillar.id, module.id); }}
                                                                    className="text-black hover:scale-110 neobrutal-btn p-1 bg-white"
                                                                >
                                                                    <Check size={14} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span
                                                                className={clsx("text-sm font-bold truncate", isActive ? "text-black" : "text-black/80")}
                                                            >
                                                                {module.name}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {!editingModuleId && (
                                                        <div className={clsx("shrink-0 flex items-center ml-2 transition-opacity relative", openMenuId === module.id ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
                                                            {module.subModules && module.subModules.length > 0 && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); toggleModuleCollapse(module.id); }}
                                                                    className="text-black/50 hover:text-black hover:bg-black/10 rounded p-1 transition-colors mr-1"
                                                                >
                                                                    {collapsedModules.includes(module.id) ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setOpenMenuId(openMenuId === module.id ? null : module.id);
                                                                }}
                                                                className="text-black/50 hover:text-black p-1"
                                                            >
                                                                <MoreHorizontal size={16} />
                                                            </button>

                                                            {openMenuId === module.id && (
                                                                <div className="absolute right-0 top-full mt-1 bg-white border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-50 flex flex-col py-1 w-32" onClick={e => e.stopPropagation()}>
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingModuleId(module.id);
                                                                            setEditName(module.name);
                                                                            setOpenMenuId(null);
                                                                        }}
                                                                        className="flex items-center px-3 py-1.5 text-sm hover:bg-black/5 text-black w-full text-left"
                                                                    >
                                                                        <Edit2 size={14} className="mr-2" /> Rename
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setActivePillarId(pillar.id);
                                                                            setActiveModule(module.id);
                                                                            openNotes('module', pillar.id, module.id);
                                                                            setOpenMenuId(null);
                                                                        }}
                                                                        className="flex items-center px-3 py-1.5 text-sm hover:bg-black/5 text-black w-full text-left"
                                                                    >
                                                                        <FileText size={14} className="mr-2" /> Notes
                                                                    </button>
                                                                    <div className="flex items-center px-3 py-1.5 text-sm hover:bg-black/5 text-black w-full text-left cursor-grab active:cursor-grabbing">
                                                                        <GripVertical size={14} className="mr-2" /> Move
                                                                    </div>
                                                                    <button
                                                                        onClick={() => {
                                                                            const newId = addSubModule(pillar.id, module.id, 'New Sub-module');
                                                                            setEditingSubModuleId(newId);
                                                                            setEditName('New Sub-module');
                                                                            setOpenMenuId(null);
                                                                        }}
                                                                        className="flex items-center px-3 py-1.5 text-sm hover:bg-black/5 text-black w-full text-left"
                                                                    >
                                                                        <Plus size={14} className="mr-2" /> Add Sub
                                                                    </button>
                                                                    <div className="h-px bg-black/10 my-1 w-full" />
                                                                    <button
                                                                        onClick={() => {
                                                                            deleteModule(pillar.id, module.id);
                                                                            setOpenMenuId(null);
                                                                        }}
                                                                        className="flex items-center px-3 py-1.5 text-sm hover:bg-red-50 text-red-500 w-full text-left font-semibold"
                                                                    >
                                                                        <Trash2 size={14} className="mr-2" /> Delete
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Sub-modules list */}
                                                {!collapsedModules.includes(module.id) && module.subModules && module.subModules.length > 0 && (
                                                    <div className="space-y-1 pl-6 py-2 relative">
                                                        {module.subModules.map(subModule => {
                                                            const isSubModuleMenuOpen = openMenuId === subModule.id;
                                                            return (
                                                                <div
                                                                    key={subModule.id}
                                                                    className={twMerge("flex items-center justify-between group py-1 px-2 rounded hover:bg-white/50 transition-colors border-2 border-transparent hover:border-black/10 relative cursor-pointer", isSubModuleMenuOpen ? "z-50" : "z-10")}
                                                                    style={{ zIndex: isSubModuleMenuOpen ? 50 : 1 }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setActivePillarId(pillar.id);
                                                                        setActiveModule(module.id);
                                                                        openNotes('submodule', pillar.id, module.id, subModule.id);
                                                                    }}
                                                                >
                                                                    <div className="flex items-center flex-1 space-x-2 overflow-hidden">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                toggleSubModuleCompletion(pillar.id, module.id, subModule.id);
                                                                            }}
                                                                            className="shrink-0"
                                                                        >
                                                                            {subModule.isCompleted ? (
                                                                                <div className="w-4 h-4 rounded border-2 border-black flex items-center justify-center bg-black">
                                                                                    <Check size={10} className="text-white stroke-[3px]" />
                                                                                </div>
                                                                            ) : (
                                                                                <div className="w-4 h-4 rounded border-2 border-black bg-white hover:bg-black/10 transition-colors" />
                                                                            )}
                                                                        </button>
                                                                        {editingSubModuleId === subModule.id ? (
                                                                            <div className="flex items-center flex-1 space-x-1">
                                                                                <input
                                                                                    autoFocus
                                                                                    value={editName}
                                                                                    onChange={(e) => setEditName(e.target.value)}
                                                                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveSubModuleName(pillar.id, module.id, subModule.id)}
                                                                                    className="flex-1 bg-white border-2 border-black text-black px-1 py-0.5 outline-none font-bold text-xs w-full"
                                                                                />
                                                                                <button
                                                                                    onClick={() => handleSaveSubModuleName(pillar.id, module.id, subModule.id)}
                                                                                    className="text-black hover:scale-110 bg-white border-2 border-black rounded"
                                                                                >
                                                                                    <Check size={12} />
                                                                                </button>
                                                                            </div>
                                                                        ) : (
                                                                            <span className={clsx("text-xs font-bold truncate", subModule.isCompleted ? "text-black/50 line-through" : "text-black/80")}>
                                                                                {subModule.name}
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {!editingSubModuleId && (
                                                                        <div className={clsx("shrink-0 flex items-center transition-opacity relative", openMenuId === subModule.id ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setOpenMenuId(openMenuId === subModule.id ? null : subModule.id);
                                                                                }}
                                                                                className="text-black/40 hover:text-black p-0.5"
                                                                            >
                                                                                <MoreHorizontal size={14} />
                                                                            </button>
                                                                            {openMenuId === subModule.id && (
                                                                                <div className="absolute right-0 top-full mt-1 bg-white border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-50 flex flex-col py-1 w-28" onClick={e => e.stopPropagation()}>
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            setEditingSubModuleId(subModule.id);
                                                                                            setEditName(subModule.name);
                                                                                            setOpenMenuId(null);
                                                                                        }}
                                                                                        className="flex items-center px-2 py-1.5 text-xs hover:bg-black/5 text-black w-full text-left"
                                                                                    >
                                                                                        <Edit2 size={12} className="mr-2" /> Rename
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            setActivePillarId(pillar.id);
                                                                                            setActiveModule(module.id);
                                                                                            openNotes('submodule', pillar.id, module.id, subModule.id);
                                                                                            setOpenMenuId(null);
                                                                                        }}
                                                                                        className="flex items-center px-2 py-1.5 text-xs hover:bg-black/5 text-black w-full text-left"
                                                                                    >
                                                                                        <FileText size={12} className="mr-2" /> Notes
                                                                                    </button>
                                                                                    <div className="h-px bg-black/10 my-1 w-full" />
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            deleteSubModule(pillar.id, module.id, subModule.id);
                                                                                            setOpenMenuId(null);
                                                                                        }}
                                                                                        className="flex items-center px-2 py-1.5 text-xs hover:bg-red-50 text-red-500 w-full text-left font-semibold"
                                                                                    >
                                                                                        <Trash2 size={12} className="mr-2" /> Delete
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                )}
                                            </Reorder.Item>
                                        );
                                    })}

                                    {pillar.modules.length === 0 && (
                                        <div className="text-xs text-black/60 font-bold p-2">Wait, what? Add modules to begin.</div>
                                    )}
                                </Reorder.Group>
                            )}
                        </div>
                    )
                })}
            </div>
        </div >
    );
}
