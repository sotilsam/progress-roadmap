import { useEffect, useState } from 'react';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { Save, Image as ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function NotesPanel() {
    const {
        pillars,
        activeNotesTarget,
        updatePillarNotes,
        updateModuleNotes,
        updateSubModuleNotes,
        addImageToNoteTarget,
        removeImageFromNoteTarget,
        setViewMode
    } = useRoadmapStore();

    const [localNotes, setLocalNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    if (!activeNotesTarget) return null;

    const pillar = pillars.find(p => p.id === activeNotesTarget.pillarId);
    if (!pillar) return null;

    let activeEntity: any = null;
    let entityTypeLabel = '';
    let parentContextName = ''; // Optional, to show what this belongs to

    if (activeNotesTarget.type === 'pillar') {
        activeEntity = pillar;
        entityTypeLabel = 'SUBJECT';
    } else if (activeNotesTarget.type === 'module') {
        activeEntity = pillar.modules.find(m => m.id === activeNotesTarget.moduleId);
        entityTypeLabel = 'MODULE';
        parentContextName = pillar.name;
    } else if (activeNotesTarget.type === 'submodule') {
        const parentModule = pillar.modules.find(m => m.id === activeNotesTarget.moduleId);
        activeEntity = parentModule?.subModules?.find(sm => sm.id === activeNotesTarget.subModuleId);
        entityTypeLabel = 'SUB-MODULE';
        parentContextName = `${pillar.name} > ${parentModule?.name}`;
    }

    if (!activeEntity) return null;

    // Reset local notes when changing target
    useEffect(() => {
        setLocalNotes(activeEntity.notes || '');
    }, [activeNotesTarget]);

    // Auto-save debounced
    useEffect(() => {
        const timer = setTimeout(() => {
            if (activeEntity && localNotes !== (activeEntity.notes || '')) {
                setIsSaving(true);

                if (activeNotesTarget.type === 'pillar') {
                    updatePillarNotes(activeNotesTarget.pillarId, localNotes);
                } else if (activeNotesTarget.type === 'module' && activeNotesTarget.moduleId) {
                    updateModuleNotes(activeNotesTarget.pillarId, activeNotesTarget.moduleId, localNotes);
                } else if (activeNotesTarget.type === 'submodule' && activeNotesTarget.moduleId && activeNotesTarget.subModuleId) {
                    updateSubModuleNotes(activeNotesTarget.pillarId, activeNotesTarget.moduleId, activeNotesTarget.subModuleId, localNotes);
                }

                setTimeout(() => setIsSaving(false), 500); // UI feedback delay
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [localNotes, activeNotesTarget]);

    // Drag and Drop Logic
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        if (files.length === 0) return;

        for (const file of files) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    // Compress image to ~800px max
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    // Export heavily compressed JPG
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                    addImageToNoteTarget(
                        activeNotesTarget.type,
                        activeNotesTarget.pillarId,
                        activeNotesTarget.moduleId,
                        activeNotesTarget.subModuleId,
                        dataUrl
                    );
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = (index: number) => {
        removeImageFromNoteTarget(
            activeNotesTarget.type,
            activeNotesTarget.pillarId,
            activeNotesTarget.moduleId,
            activeNotesTarget.subModuleId,
            index
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 flex flex-col w-full bg-white border-4 border-black rounded-xl shadow-[6px_6px_0_0_#000] overflow-hidden min-h-[400px]"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b-4 border-black bg-gray-100">
                <div className="flex items-center space-x-3 min-w-0">
                    <button
                        onClick={() => setViewMode('roadmap')}
                        className="bg-[#fca5a5] text-black border-2 border-black rounded p-1 shadow-[2px_2px_0_0_#000] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all shrink-0"
                        title="Close Notes"
                    >
                        <X size={16} className="stroke-[3px]" />
                    </button>
                    <div className="h-6 w-1 bg-black rounded shrink-0"></div>
                    <div className="flex flex-col min-w-0">
                        {parentContextName && (
                            <span className="text-[10px] tracking-widest text-black/50 font-bold uppercase truncate max-w-[200px]">
                                {parentContextName}
                            </span>
                        )}
                        <h2 className="text-base font-black tracking-widest uppercase flex flex-col items-start text-black max-w-[240px]" style={{ backgroundColor: pillar.color, padding: '4px 10px', border: '2px solid black', borderRadius: '4px', boxShadow: '2px 2px 0 0 #000' }}>
                            <span className="opacity-80 text-[10px] leading-tight text-left">{entityTypeLabel}:</span>
                            <span className="truncate w-full text-left">{activeEntity.name}</span>
                        </h2>
                    </div>
                </div>
                <div className="flex items-center space-x-2 text-black/60 font-bold text-xs uppercase shrink-0">
                    {isSaving ? (
                        <span className="text-black animate-pulse">Saving...</span>
                    ) : (
                        <span className="flex items-center space-x-1"><Save size={12} /><span>Saved</span></span>
                    )}
                </div>
            </div>

            {/* Editor Area */}
            <div
                className={`flex-1 flex flex-col p-6 relative transition-colors ${isDragging ? 'bg-[#bef264]/20' : 'bg-transparent'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {isDragging && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center border-4 border-dashed border-black bg-white/90 rounded-xl backdrop-blur-sm m-4">
                        <ImageIcon className="text-black w-12 h-12 mb-4 animate-bounce" />
                        <p className="text-black font-black tracking-widest uppercase">Drop Images Here</p>
                    </div>
                )}

                <textarea
                    value={localNotes}
                    onChange={(e) => setLocalNotes(e.target.value)}
                    placeholder={`Start typing notes for ${activeEntity.name}...\n\n- Track your progress\n- Save helpful links\n- Write down questions\n- Drag and drop photos here`}
                    className="flex-1 w-full bg-transparent text-black font-medium text-base leading-relaxed resize-none outline-none placeholder:text-black/40 custom-scrollbar z-10"
                />

                {/* Image Gallery */}
                {activeEntity.images && activeEntity.images.length > 0 && (
                    <div className="mt-4 pt-4 border-t-4 border-black grid grid-cols-2 md:grid-cols-4 gap-4 z-10 max-h-[300px] overflow-y-auto custom-scrollbar">
                        <AnimatePresence>
                            {activeEntity.images.map((img: string, index: number) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="relative group aspect-square rounded-xl overflow-hidden border-4 border-black bg-white shadow-[4px_4px_0_0_#000]"
                                >
                                    <img src={img} alt="Attachment" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                        <button
                                            onClick={() => handleRemoveImage(index)}
                                            className="bg-[#fca5a5] text-black p-2 rounded-full hover:scale-110 transition-all border-2 border-black shadow-[2px_2px_0_0_#000]"
                                        >
                                            <X size={16} className="stroke-[3px]" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
