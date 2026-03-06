import { useState } from 'react';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { Plus, Trash2, CheckCircle2, GripVertical, Edit2, Check } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Reorder } from 'framer-motion';

export function GlobalTasksPanel() {
    const { globalTasks, addGlobalTask, toggleGlobalTask, deleteGlobalTask, reorderGlobalTasks, updateGlobalTask } = useRoadmapStore();
    const [inputValue, setInputValue] = useState('');
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editTaskText, setEditTaskText] = useState('');

    const handleAddTask = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (inputValue.trim()) {
            addGlobalTask(inputValue.trim());
            setInputValue('');
        }
    };

    const handleSaveEdit = (id: string, e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (editTaskText.trim()) {
            updateGlobalTask(id, editTaskText.trim());
        }
        setEditingTaskId(null);
    };

    return (
        <div className="w-full flex-1 flex flex-col bg-white border-4 border-black rounded-xl shadow-[6px_6px_0_0_#000] z-20 overflow-hidden min-h-[250px]">

            {/* Header / Input */}
            <div className="p-3 border-b-4 border-black bg-[#93c5fd]">
                <form onSubmit={handleAddTask} className="flex item-center gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="ADD GLOBAL TASK..."
                        className="flex-1 bg-white border-2 border-black px-2 py-1 text-black font-bold text-xs outline-none placeholder:text-black/50 uppercase tracking-widest rounded transition-shadow focus:shadow-[2px_2px_0_0_#000]"
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim()}
                        className="text-black bg-white border-2 border-black rounded p-1 hover:bg-black/10 transition-all disabled:opacity-50 disabled:bg-gray-200 shadow-[2px_2px_0_0_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                    >
                        <Plus size={16} className="stroke-[3px]" />
                    </button>
                </form>
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {globalTasks.length === 0 ? (
                    <div className="p-4 text-center text-[10px] font-bold text-black/60 uppercase tracking-widest">
                        No active tasks
                    </div>
                ) : (
                    <Reorder.Group axis="y" values={globalTasks} onReorder={reorderGlobalTasks} className="space-y-1">
                        {globalTasks.map(task => (
                            <Reorder.Item
                                key={task.id}
                                value={task}
                                className="group flex items-center justify-between p-1.5 rounded hover:bg-black/5 transition-colors border-2 border-transparent hover:border-black/20 bg-white"
                            >
                                <div className="flex items-center flex-1 overflow-hidden text-left min-w-0">
                                    <div className="text-black/30 hover:text-black cursor-grab active:cursor-grabbing px-1 shrink-0 -ml-1">
                                        <GripVertical size={14} />
                                    </div>

                                    {editingTaskId === task.id ? (
                                        <form onSubmit={(e) => handleSaveEdit(task.id, e)} className="flex-1 flex gap-2 ml-1 items-center min-w-0">
                                            <input
                                                autoFocus
                                                value={editTaskText}
                                                onChange={(e) => setEditTaskText(e.target.value)}
                                                onBlur={() => handleSaveEdit(task.id)}
                                                className="flex-1 bg-white border-2 border-black px-1.5 py-0.5 text-black font-bold text-xs outline-none rounded min-w-0"
                                            />
                                            <button
                                                type="submit"
                                                onMouseDown={(e) => e.preventDefault()} // Prevent blur before saving
                                                className="text-black bg-white border-2 border-black rounded hover:bg-black/10 transition-all shrink-0 p-0.5"
                                            >
                                                <Check size={14} className="stroke-[3px]" />
                                            </button>
                                        </form>
                                    ) : (
                                        <button
                                            onClick={() => toggleGlobalTask(task.id)}
                                            className="flex items-center flex-1 gap-2 overflow-hidden text-left ml-1"
                                        >
                                            {task.isCompleted ? (
                                                <div className="w-5 h-5 flex-shrink-0 rounded border-2 border-black flex items-center justify-center bg-black transition-colors">
                                                    <CheckCircle2 size={12} className="text-white stroke-[3px]" />
                                                </div>
                                            ) : (
                                                <div className="w-5 h-5 flex-shrink-0 rounded border-2 border-black bg-white hover:bg-black/10 transition-colors" />
                                            )}

                                            <span className={twMerge(
                                                "font-bold text-xs truncate transition-all duration-300",
                                                task.isCompleted ? "text-black/50 line-through" : "text-black"
                                            )}>
                                                {task.text}
                                            </span>
                                        </button>
                                    )}
                                </div>

                                {!editingTaskId && (
                                    <div className="opacity-0 group-hover:opacity-100 flex items-center shrink-0 ml-1 transition-all">
                                        <button
                                            onClick={() => { setEditingTaskId(task.id); setEditTaskText(task.text); }}
                                            className="p-1 text-black/50 hover:text-black transition-all"
                                            title="Edit Task"
                                        >
                                            <Edit2 size={13} className="stroke-[2.5px]" />
                                        </button>
                                        <button
                                            onClick={() => deleteGlobalTask(task.id)}
                                            className="p-1 text-black/50 hover:text-red-500 transition-all"
                                            title="Delete Task"
                                        >
                                            <Trash2 size={14} className="stroke-[2.5px]" />
                                        </button>
                                    </div>
                                )}
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                )}
            </div>


            {globalTasks.length > 0 && (
                <div className="px-3 py-1.5 bg-gray-100 border-t-4 border-black flex justify-between items-center text-[9px] font-bold tracking-widest text-black/60 uppercase">
                    <span>{globalTasks.filter(t => t.isCompleted).length} / {globalTasks.length} DONE</span>
                    <span className="text-black font-black">GLOBAL TASKS</span>
                </div>
            )}
        </div>
    );
}
