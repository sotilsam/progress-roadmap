import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface GlobalTask {
    id: string;
    text: string;
    isCompleted: boolean;
}

export interface SubModule {
    id: string;
    name: string;
    isCompleted: boolean;
    notes?: string;
    images?: string[];
}

export interface Module {
    id: string;
    name: string;
    isCompleted: boolean;
    subModules: SubModule[];
    notes?: string;
    images?: string[];
}

export interface Pillar {
    id: string;
    name: string;
    color: string;
    modules: Module[];
    notes?: string;
    images?: string[];
}

export const PALETTE = [
    '#fde047', // Neobrutal Yellow
    '#f9a8d4', // Neobrutal Pink
    '#bef264', // Neobrutal Lime Green
    '#93c5fd', // Neobrutal Blue
    '#fdba74', // Neobrutal Orange
    '#fca5a5', // Neobrutal Red
    '#6ee7b7', // Neobrutal Emerald
    '#d8b4fe', // Neobrutal Lavender
    '#ffffff', // White
    '#ffcb7f', //orange
    '#bafca2', //light green
    '#feb2ef', //pink
    '#87ceea', //blue
    '#fbfc99', //yellow


];

interface RoadmapState {
    pillars: Pillar[];
    activeModuleId: string | null;
    activePillarId: string | null;
    viewMode: 'roadmap' | 'notes';
    activeNotesTarget: { type: 'pillar' | 'module' | 'submodule', pillarId: string, moduleId?: string, subModuleId?: string } | null;
    globalTasks: GlobalTask[];
    collapsedPillars: string[];
    collapsedModules: string[];

    // Pillar Actions
    addPillar: (name: string, color?: string) => string;
    updatePillarName: (id: string, name: string) => void;
    updatePillarColor: (id: string, color: string) => void;
    deletePillar: (id: string) => void;
    movePillarUp: (id: string) => void;
    movePillarDown: (id: string) => void;
    setActivePillarId: (pillarId: string | null) => void;
    setViewMode: (mode: 'roadmap' | 'notes') => void;
    openNotes: (type: 'pillar' | 'module' | 'submodule', pillarId: string, moduleId?: string, subModuleId?: string) => void;
    updatePillarNotes: (pillarId: string, notes: string) => void;
    togglePillarCollapse: (pillarId: string) => void;

    // Module Actions
    addModule: (pillarId: string, name: string) => string;
    updateModuleName: (pillarId: string, moduleId: string, name: string) => void;
    toggleModuleCompletion: (pillarId: string, moduleId: string) => void;
    deleteModule: (pillarId: string, moduleId: string) => void;
    moveModuleUp: (pillarId: string, moduleId: string) => void;
    moveModuleDown: (pillarId: string, moduleId: string) => void;
    reorderModules: (pillarId: string, modules: Module[]) => void;
    updateModuleNotes: (pillarId: string, moduleId: string, notes: string) => void;
    toggleModuleCollapse: (moduleId: string) => void;

    // Sub-Module Actions
    addSubModule: (pillarId: string, moduleId: string, name: string) => string;
    updateSubModuleName: (pillarId: string, moduleId: string, subModuleId: string, name: string) => void;
    toggleSubModuleCompletion: (pillarId: string, moduleId: string, subModuleId: string) => void;
    deleteSubModule: (pillarId: string, moduleId: string, subModuleId: string) => void;
    updateSubModuleNotes: (pillarId: string, moduleId: string, subModuleId: string, notes: string) => void;

    // Image Actions
    addImageToNoteTarget: (type: 'pillar' | 'module' | 'submodule', pillarId: string, moduleId?: string, subModuleId?: string, base64Image?: string) => void;
    removeImageFromNoteTarget: (type: 'pillar' | 'module' | 'submodule', pillarId: string, moduleId?: string, subModuleId?: string, imageIndex?: number) => void;

    // Global Tasks
    addGlobalTask: (text: string) => void;
    toggleGlobalTask: (id: string) => void;
    updateGlobalTask: (id: string, text: string) => void;
    deleteGlobalTask: (id: string) => void;
    reorderGlobalTasks: (tasks: GlobalTask[]) => void;

    setActiveModule: (moduleId: string | null) => void;
}

// Initial sample data to show off the visual aesthetic
const initialPillars: Pillar[] = [
    {
        id: 'p-1',
        name: 'Design Foundation',
        color: '#fde047', // Yellow
        modules: [
            { id: 'm-1', name: 'Color Layouts', isCompleted: true, subModules: [] },
            { id: 'm-2', name: 'Typography', isCompleted: true, subModules: [] },
            { id: 'm-3', name: 'Micro-interactions', isCompleted: false, subModules: [] },
        ],
    },
    {
        id: 'p-2',
        name: 'React Ecosystem',
        color: '#f9a8d4', // Pink
        modules: [
            {
                id: 'm-4', name: 'React Fundamentals', isCompleted: false,
                subModules: [
                    { id: 'sm-1', name: 'JSX Syntax', isCompleted: false },
                    { id: 'sm-2', name: 'Component LC', isCompleted: false }
                ]
            },
            { id: 'm-5', name: 'State (Zustand)', isCompleted: false, subModules: [] },
            { id: 'm-6', name: 'Framer Motion', isCompleted: false, subModules: [] },
        ],
    }
];

export const useRoadmapStore = create<RoadmapState>()(
    persist(
        (set) => ({
            pillars: initialPillars,
            activeModuleId: null,
            activePillarId: initialPillars[0].id,
            viewMode: 'roadmap',
            activeNotesTarget: null,
            globalTasks: [],
            collapsedPillars: [],
            collapsedModules: [],

            addPillar: (name, color) => {
                const id = uuidv4();
                set((state) => ({
                    pillars: [...state.pillars, { id, name, color: color || PALETTE[0], modules: [] }]
                }));
                return id;
            },

            updatePillarName: (id, name) => set((state) => ({
                pillars: state.pillars.map(p => p.id === id ? { ...p, name } : p)
            })),

            updatePillarColor: (id, color) => set((state) => ({
                pillars: state.pillars.map(p => p.id === id ? { ...p, color } : p)
            })),

            deletePillar: (id) => set((state) => ({
                pillars: state.pillars.filter(p => p.id !== id),
                activePillarId: state.activePillarId === id ? (state.pillars.find(p => p.id !== id)?.id || null) : state.activePillarId
            })),

            movePillarUp: (id) => set((state) => {
                const index = state.pillars.findIndex(p => p.id === id);
                if (index <= 0) return state;
                const newPillars = [...state.pillars];
                const temp = newPillars[index - 1];
                newPillars[index - 1] = newPillars[index];
                newPillars[index] = temp;
                return { pillars: newPillars };
            }),

            movePillarDown: (id) => set((state) => {
                const index = state.pillars.findIndex(p => p.id === id);
                if (index === -1 || index >= state.pillars.length - 1) return state;
                const newPillars = [...state.pillars];
                const temp = newPillars[index + 1];
                newPillars[index + 1] = newPillars[index];
                newPillars[index] = temp;
                return { pillars: newPillars };
            }),

            setActivePillarId: (pillarId) => set({ activePillarId: pillarId }),

            setViewMode: (mode) => set({ viewMode: mode }),

            openNotes: (type, pillarId, moduleId, subModuleId) => set({
                viewMode: 'notes',
                activeNotesTarget: { type, pillarId, moduleId, subModuleId }
            }),

            updatePillarNotes: (pillarId, notes) => set((state) => ({
                pillars: state.pillars.map(p => p.id === pillarId ? { ...p, notes } : p)
            })),

            togglePillarCollapse: (pillarId) => set((state) => ({
                collapsedPillars: state.collapsedPillars.includes(pillarId)
                    ? state.collapsedPillars.filter(id => id !== pillarId)
                    : [...state.collapsedPillars, pillarId]
            })),

            addModule: (pillarId, name) => {
                const id = uuidv4();
                set((state) => ({
                    pillars: state.pillars.map(p => {
                        if (p.id === pillarId) {
                            return {
                                ...p,
                                modules: [...p.modules, { id, name, isCompleted: false, subModules: [] }]
                            };
                        }
                        return p;
                    })
                }));
                return id;
            },

            updateModuleName: (pillarId, moduleId, name) => set((state) => ({
                pillars: state.pillars.map(p => {
                    if (p.id === pillarId) {
                        return {
                            ...p,
                            modules: p.modules.map(m => m.id === moduleId ? { ...m, name } : m)
                        };
                    }
                    return p;
                })
            })),

            toggleModuleCompletion: (pillarId, moduleId) => set((state) => ({
                pillars: state.pillars.map(p => {
                    if (p.id === pillarId) {
                        return {
                            ...p,
                            modules: p.modules.map(m => {
                                if (m.id === moduleId) {
                                    const newCompleted = !m.isCompleted;
                                    const safeSubModules = m.subModules || [];
                                    return {
                                        ...m,
                                        isCompleted: newCompleted,
                                        // Auto-complete sub-modules if hitting the parent Module override
                                        subModules: safeSubModules.map(sm => ({ ...sm, isCompleted: newCompleted }))
                                    };
                                }
                                return m;
                            })
                        };
                    }
                    return p;
                })
            })),

            deleteModule: (pillarId, moduleId) => set((state) => ({
                pillars: state.pillars.map(p => {
                    if (p.id === pillarId) {
                        return {
                            ...p,
                            modules: p.modules.filter(m => m.id !== moduleId)
                        };
                    }
                    return p;
                })
            })),

            moveModuleUp: (pillarId, moduleId) => set((state) => ({
                pillars: state.pillars.map(p => {
                    if (p.id === pillarId) {
                        const idx = p.modules.findIndex(m => m.id === moduleId);
                        if (idx > 0) {
                            const newModules = [...p.modules];
                            [newModules[idx - 1], newModules[idx]] = [newModules[idx], newModules[idx - 1]];
                            return { ...p, modules: newModules };
                        }
                    }
                    return p;
                })
            })),

            moveModuleDown: (pillarId, moduleId) => set((state) => ({
                pillars: state.pillars.map(p => {
                    if (p.id === pillarId) {
                        const idx = p.modules.findIndex(m => m.id === moduleId);
                        if (idx !== -1 && idx < p.modules.length - 1) {
                            const newModules = [...p.modules];
                            [newModules[idx + 1], newModules[idx]] = [newModules[idx], newModules[idx + 1]];
                            return { ...p, modules: newModules };
                        }
                    }
                    return p;
                })
            })),

            reorderModules: (pillarId, newModules) => set((state) => ({
                pillars: state.pillars.map(p =>
                    p.id === pillarId ? { ...p, modules: newModules } : p
                )
            })),

            updateModuleNotes: (pillarId, moduleId, notes) => set((state) => ({
                pillars: state.pillars.map(p => {
                    if (p.id === pillarId) {
                        return {
                            ...p,
                            modules: p.modules.map(m => m.id === moduleId ? { ...m, notes } : m)
                        };
                    }
                    return p;
                })
            })),

            toggleModuleCollapse: (moduleId) => set((state) => ({
                collapsedModules: state.collapsedModules.includes(moduleId)
                    ? state.collapsedModules.filter(id => id !== moduleId)
                    : [...state.collapsedModules, moduleId]
            })),

            // Sub-Module Implementations
            addSubModule: (pillarId, moduleId, name) => {
                const id = uuidv4();
                set((state) => ({
                    pillars: state.pillars.map(p => {
                        if (p.id === pillarId) {
                            return {
                                ...p,
                                modules: p.modules.map(m => {
                                    if (m.id === moduleId) {
                                        const safeSubModules = m.subModules || [];
                                        return { ...m, subModules: [...safeSubModules, { id, name, isCompleted: false }] };
                                    }
                                    return m;
                                })
                            }
                        }
                        return p;
                    })
                }));
                return id;
            },

            updateSubModuleName: (pillarId, moduleId, subModuleId, name) => set((state) => ({
                pillars: state.pillars.map(p => {
                    if (p.id === pillarId) {
                        return {
                            ...p,
                            modules: p.modules.map(m => {
                                if (m.id === moduleId) {
                                    const safeSubModules = m.subModules || [];
                                    return {
                                        ...m,
                                        subModules: safeSubModules.map(sm => sm.id === subModuleId ? { ...sm, name } : sm)
                                    }
                                }
                                return m;
                            })
                        }
                    }
                    return p;
                })
            })),

            toggleSubModuleCompletion: (pillarId, moduleId, subModuleId) => set((state) => ({
                pillars: state.pillars.map(p => {
                    if (p.id === pillarId) {
                        return {
                            ...p,
                            modules: p.modules.map(m => {
                                if (m.id === moduleId) {
                                    const safeSubModules = m.subModules || [];
                                    const newSubModules = safeSubModules.map(sm => sm.id === subModuleId ? { ...sm, isCompleted: !sm.isCompleted } : sm);
                                    // Calculate if ALL submodules are completed to auto-check parent
                                    const allCompleted = newSubModules.length > 0 && newSubModules.every(sm => sm.isCompleted);
                                    return { ...m, subModules: newSubModules, isCompleted: allCompleted };
                                }
                                return m;
                            })
                        }
                    }
                    return p;
                })
            })),

            deleteSubModule: (pillarId, moduleId, subModuleId) => set((state) => ({
                pillars: state.pillars.map(p => {
                    if (p.id === pillarId) {
                        return {
                            ...p,
                            modules: p.modules.map(m => {
                                if (m.id === moduleId) {
                                    const safeSubModules = m.subModules || [];
                                    return { ...m, subModules: safeSubModules.filter(sm => sm.id !== subModuleId) };
                                }
                                return m;
                            })
                        }
                    }
                    return p;
                })
            })),

            updateSubModuleNotes: (pillarId, moduleId, subModuleId, notes) => set((state) => ({
                pillars: state.pillars.map(p => {
                    if (p.id === pillarId) {
                        return {
                            ...p,
                            modules: p.modules.map(m => {
                                if (m.id === moduleId) {
                                    const safeSubModules = m.subModules || [];
                                    return {
                                        ...m,
                                        subModules: safeSubModules.map(sm => sm.id === subModuleId ? { ...sm, notes } : sm)
                                    };
                                }
                                return m;
                            })
                        }
                    }
                    return p;
                })
            })),

            addImageToNoteTarget: (type, pillarId, moduleId, subModuleId, base64Image) => set((state) => ({
                pillars: state.pillars.map(p => {
                    if (p.id !== pillarId) return p;
                    if (!base64Image) return p;

                    if (type === 'pillar') {
                        return { ...p, images: [...(p.images || []), base64Image] };
                    }

                    if (type === 'module' && moduleId) {
                        return {
                            ...p,
                            modules: p.modules.map(m => m.id === moduleId ? { ...m, images: [...(m.images || []), base64Image] } : m)
                        };
                    }

                    if (type === 'submodule' && moduleId && subModuleId) {
                        return {
                            ...p,
                            modules: p.modules.map(m => {
                                if (m.id === moduleId) {
                                    return {
                                        ...m,
                                        subModules: (m.subModules || []).map(sm => sm.id === subModuleId ? { ...sm, images: [...(sm.images || []), base64Image] } : sm)
                                    };
                                }
                                return m;
                            })
                        };
                    }
                    return p;
                })
            })),

            removeImageFromNoteTarget: (type, pillarId, moduleId, subModuleId, imageIndex) => set((state) => ({
                pillars: state.pillars.map(p => {
                    if (p.id !== pillarId) return p;
                    if (imageIndex === undefined) return p;

                    if (type === 'pillar') {
                        const newImages = [...(p.images || [])];
                        newImages.splice(imageIndex, 1);
                        return { ...p, images: newImages };
                    }

                    if (type === 'module' && moduleId) {
                        return {
                            ...p,
                            modules: p.modules.map(m => {
                                if (m.id === moduleId) {
                                    const newImages = [...(m.images || [])];
                                    newImages.splice(imageIndex, 1);
                                    return { ...m, images: newImages };
                                }
                                return m;
                            })
                        };
                    }

                    if (type === 'submodule' && moduleId && subModuleId) {
                        return {
                            ...p,
                            modules: p.modules.map(m => {
                                if (m.id === moduleId) {
                                    return {
                                        ...m,
                                        subModules: (m.subModules || []).map(sm => {
                                            if (sm.id === subModuleId) {
                                                const newImages = [...(sm.images || [])];
                                                newImages.splice(imageIndex, 1);
                                                return { ...sm, images: newImages };
                                            }
                                            return sm;
                                        })
                                    };
                                }
                                return m;
                            })
                        };
                    }
                    return p;
                })
            })),

            addGlobalTask: (text) => set((state) => ({
                globalTasks: [...state.globalTasks, { id: uuidv4(), text, isCompleted: false }]
            })),

            toggleGlobalTask: (id) => set((state) => ({
                globalTasks: state.globalTasks.map(t =>
                    t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
                )
            })),

            updateGlobalTask: (id, text) => set((state) => ({
                globalTasks: state.globalTasks.map(t =>
                    t.id === id ? { ...t, text } : t
                )
            })),

            deleteGlobalTask: (id) => set((state) => ({
                globalTasks: state.globalTasks.filter(t => t.id !== id)
            })),

            reorderGlobalTasks: (tasks) => set({ globalTasks: tasks }),

            setActiveModule: (moduleId) => set({ activeModuleId: moduleId })
        }),
        {
            name: 'progress-roadmap-storage',
        }
    )
);
