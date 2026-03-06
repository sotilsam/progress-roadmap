import { useMemo } from 'react';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function Map() {
    const {
        pillars,
        activeModuleId,
        activePillarId,
        collapsedPillars,
        setActivePillarId,
        setActiveModule,
        togglePillarCollapse,
        viewMode
    } = useRoadmapStore();

    const activePillar = useMemo(() => {
        return pillars.find(p => p.id === activePillarId) || pillars[0];
    }, [pillars, activePillarId]);

    // Layout Constants
    const PILLAR_SPACING_Y = 120;
    const MODULE_SPACING_Y = 90;
    const START_Y = 100;
    const CENTER_X = viewMode === 'notes' ? 150 : 250; // Dynamic center depending on width

    // Calculate vertical coordinates for all visible items
    const layoutPositions = useMemo(() => {
        const positions: any[] = [];
        let currentY = START_Y;

        pillars.forEach((pillar) => {
            const isCollapsed = collapsedPillars.includes(pillar.id);
            const isPillarDone = pillar.modules.length > 0 && pillar.modules.every(m => m.isCompleted);

            // Record Pillar position
            positions.push({
                type: 'pillar',
                id: pillar.id,
                name: pillar.name,
                color: pillar.color,
                x: CENTER_X,
                y: currentY,
                isCompleted: isPillarDone,
                isCollapsed,
                hasModules: pillar.modules.length > 0
            });

            currentY += isCollapsed || pillar.modules.length === 0 ? PILLAR_SPACING_Y : MODULE_SPACING_Y;

            // Record Module positions if not collapsed
            if (!isCollapsed) {
                pillar.modules.forEach((module, mIndex) => {
                    positions.push({
                        type: 'module',
                        id: module.id,
                        pillarId: pillar.id,
                        pillarColor: pillar.color,
                        name: module.name,
                        x: CENTER_X,
                        y: currentY,
                        isCompleted: module.isCompleted,
                        isLastInPillar: mIndex === pillar.modules.length - 1
                    });
                    currentY += (mIndex === pillar.modules.length - 1) ? PILLAR_SPACING_Y : MODULE_SPACING_Y;
                });
            }
        });

        return { positions, finalY: currentY };
    }, [pillars, collapsedPillars, CENTER_X]);

    const { positions, finalY } = layoutPositions;

    // Generate SVG path connecting the timeline
    const svgSegments = useMemo(() => {
        if (positions.length < 2) return [];
        const segments = [];

        for (let i = 0; i < positions.length - 1; i++) {
            const start = positions[i];
            const end = positions[i + 1];

            const startColor = start.type === 'pillar' ? start.color : start.pillarColor;
            const endColor = end.type === 'pillar' ? end.color : end.pillarColor;

            const isTransition = startColor && endColor && startColor !== endColor;
            const gradientId = isTransition ? `grad-trans-${i}` : undefined;

            segments.push({
                x1: start.x,
                y1: start.y,
                x2: end.x,
                y2: end.y,
                startColor,
                endColor,
                isCompleted: start.isCompleted && end.isCompleted,
                isTransition,
                gradientId
            });
        }
        return segments;
    }, [positions]);

    // Find the last completed task index for the cursor globally
    const cursorTarget = useMemo(() => {
        // Flatten all modules to find the true last completed
        const allModules = pillars.flatMap(p => p.modules.map(m => ({ ...m, pId: p.id })));
        let lastCompletedGlobal: typeof allModules[0] | null = null;
        for (let i = allModules.length - 1; i >= 0; i--) {
            if (allModules[i].isCompleted) {
                lastCompletedGlobal = allModules[i];
                break;
            }
        }

        if (!lastCompletedGlobal) {
            // Default to first item position
            return positions.length > 0 ? { x: positions[0].x, y: positions[0].y } : { x: CENTER_X, y: START_Y };
        }

        const targetNode = lastCompletedGlobal;

        // Is the parent pillar collapsed?
        const isCollapsed = collapsedPillars.includes(targetNode.pId);
        if (isCollapsed) {
            // Move cursor to the pillar header
            const pillarNode = positions.find(p => p.type === 'pillar' && p.id === targetNode.pId);
            return pillarNode ? { x: pillarNode.x, y: pillarNode.y } : { x: CENTER_X, y: START_Y };
        } else {
            // Move cursor to the specific module
            const moduleNode = positions.find(p => p.type === 'module' && p.id === targetNode.id);
            return moduleNode ? { x: moduleNode.x, y: moduleNode.y } : { x: CENTER_X, y: START_Y };
        }

    }, [pillars, positions, collapsedPillars, CENTER_X]);

    const containerHeight = Math.max(800, finalY + START_Y);

    return (
        <div className="flex-1 relative overflow-auto bg-[#e5e7eb] pt-12 p-8 h-full custom-scrollbar flex flex-col items-center justify-start">
            {positions.length === 0 ? (
                <div className="text-black flex items-center justify-center h-full font-black text-2xl uppercase">
                    Awaiting Progress Roadmap... (Add modules)
                </div>
            ) : (
                <div
                    className="relative shrink-0"
                    style={{ width: '100%', height: containerHeight, maxWidth: '600px' }}
                >
                    {/* SVG Connector Lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                        <defs>
                            {svgSegments.filter(seg => seg.isTransition).map(seg => (
                                <linearGradient
                                    key={seg.gradientId}
                                    id={seg.gradientId}
                                    gradientUnits="userSpaceOnUse"
                                    x1={seg.x1} y1={seg.y1}
                                    x2={seg.x2} y2={seg.y2}
                                >
                                    <stop offset="0%" stopColor={seg.startColor} />
                                    <stop offset="100%" stopColor={seg.endColor} />
                                </linearGradient>
                            ))}
                        </defs>

                        {/* Background Dashed Lines */}
                        {svgSegments.map((seg, i) => (
                            <line
                                key={`bg-${i}`}
                                x1={seg.x1} y1={seg.y1}
                                x2={seg.x2} y2={seg.y2}
                                stroke="#000000"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray="0.1 15"
                                className="opacity-20"
                            />
                        ))}

                        {/* Active Solid Lines */}
                        {svgSegments.map((seg, i) => {
                            if (!seg.isCompleted) return null;
                            return (
                                <line
                                    key={`active-${i}`}
                                    x1={seg.x1} y1={seg.y1}
                                    x2={seg.x2} y2={seg.y2}
                                    stroke="url(#gradientId)" // Fallback removed for simplicity, just black for now
                                    style={{ stroke: seg.isTransition ? `url(#${seg.gradientId})` : seg.startColor }}
                                    strokeWidth="8"
                                    className="transition-all duration-500 shadow-xl"
                                />
                            );
                        })}
                    </svg>

                    {/* Cursor Progress Indicator */}
                    <motion.div
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-lg pointer-events-none z-0"
                        animate={{
                            left: cursorTarget.x,
                            top: cursorTarget.y,
                        }}
                        transition={{ type: "tween", ease: "easeInOut", duration: 0.6 }} // Replaced spring with smooth tween
                        style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: activePillar?.color || 'black',
                            border: '4px solid black',
                            boxShadow: '4px 4px 0 0 #000',
                        }}
                    >
                        <div className="w-full h-full rounded-lg bg-white opacity-20" />
                    </motion.div>

                    {/* Nodes Render Loop */}
                    {positions.map((node, i) => {

                        if (node.type === 'pillar') {
                            const isDone = node.isCompleted;
                            const isActive = activePillarId === node.id;

                            return (
                                <motion.div
                                    key={`p-${node.id}`}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
                                    style={{ left: node.x, top: node.y }}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div
                                        onClick={() => {
                                            setActivePillarId(node.id);
                                            node.hasModules && togglePillarCollapse(node.id);
                                        }}
                                        className={twMerge(
                                            "flex items-center justify-between gap-4 border-4 border-black bg-white rounded-xl px-6 py-3 cursor-pointer transition-all duration-300 min-w-[240px]",
                                            isActive ? "shadow-[6px_6px_0_0_#000] -translate-y-1" : "opacity-90 hover:opacity-100 hover:shadow-[6px_6px_0_0_#000] hover:-translate-y-1",
                                            isDone ? "border-dashed" : ""
                                        )}
                                        style={{ backgroundColor: node.color }}
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black tracking-widest text-black/60 uppercase">
                                                {isDone ? 'COMPLETED' : 'SUBJECT'}
                                            </span>
                                            <span className="text-lg font-black tracking-widest uppercase text-black">
                                                {node.name}
                                            </span>
                                        </div>

                                        {node.hasModules && (
                                            <div className="bg-white/50 p-2 rounded-lg border-2 border-black/20">
                                                {node.isCollapsed ? <ChevronDown size={20} className="text-black" /> : <ChevronUp size={20} className="text-black" />}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        }

                        if (node.type === 'module') {
                            const isActive = activeModuleId === node.id;

                            return (
                                <motion.div
                                    key={`m-${node.id}`}
                                    onClick={() => { setActivePillarId(node.pillarId); setActiveModule(node.id); }}
                                    className="absolute flex items-center justify-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-10 group"
                                    style={{ left: node.x, top: node.y }}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: i * 0.05 }}
                                >
                                    {/* Visual Node */}
                                    <div
                                        className={twMerge(
                                            "w-10 h-10 rounded-lg border-4 border-black flex items-center justify-center transition-all duration-300 shadow-[4px_4px_0_0_#000] group-hover:-translate-y-1",
                                            node.isCompleted || isActive ? "bg-white" : "bg-gray-300 opacity-60"
                                        )}
                                        style={node.isCompleted || isActive ? { backgroundColor: node.pillarColor } : {}}
                                    >
                                        <div className={twMerge(
                                            "w-4 h-4 rounded-[4px] border-2 border-black transition-all",
                                            node.isCompleted ? "bg-black scale-100" : "bg-white scale-75",
                                            isActive && !node.isCompleted ? "scale-100 animate-pulse" : ""
                                        )} />
                                    </div>

                                    {/* Module Label (Offset to the right) */}
                                    <div className={twMerge(
                                        "absolute left-14 px-4 py-2 bg-white border-2 border-black rounded-lg shadow-[3px_3px_0_0_#000] text-sm font-bold truncate transition-colors duration-300 text-black min-w-[160px] group-hover:-translate-y-1",
                                        node.isCompleted || isActive ? "opacity-100" : "opacity-60"
                                    )}>
                                        {node.name}
                                    </div>
                                </motion.div>
                            );
                        }

                        return null;
                    })}
                </div>
            )}
        </div>
    );
}
