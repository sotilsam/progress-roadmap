import { Sidebar } from './components/Sidebar';
import { Map } from './components/Map';
import { NotesPanel } from './components/NotesPanel';
import { GlobalTasksPanel } from './components/GlobalTasksPanel';
import { useRoadmapStore } from './store/useRoadmapStore';

function App() {
  const { viewMode } = useRoadmapStore();

  return (
    // min-w-[620px] ensures the app never squishes smaller than the Sidebar (256px) + Tasks Panel (320px) + Gap (16px) + Padding (16px)
    <div className="w-screen h-screen flex overflow-x-auto overflow-y-hidden text-black selection:bg-black selection:text-white bg-[#e5e7eb] min-w-[620px]">
      <Sidebar />
      <div className="flex-1 flex relative h-full p-4 space-x-4">

        {/* CENTER COLUMN: MAP */}
        <div className="hidden lg:flex flex-1 rounded-2xl overflow-hidden neobrutal-panel flex-col relative h-full z-10 bg-[#e5e7eb] min-w-[300px]">
          <Map />
        </div>

        {/* RIGHT COLUMN: NOTES & GLOBAL TASKS (The "Notes Box") */}
        <div className="flex-1 lg:flex-none shrink-0 flex flex-col space-y-4 h-full lg:w-[400px] min-w-[320px]">
          <GlobalTasksPanel />
          {viewMode === 'notes' && <NotesPanel />}
        </div>

      </div>
    </div>
  );
}

export default App;
