import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Pill, 
  Network, 
  Trash2, 
  Database,
  UploadCloud
} from 'lucide-react';

interface HeaderProps {
    activePanel: string | null;
    setActivePanel: (panel: 'interactions' | 'similarity' | 'patient' | 'metta' | null) => void;
    handleClear: () => void;
}

export function Header({ activePanel, setActivePanel, handleClear }: HeaderProps) {
    const togglePanel = (panel: 'interactions' | 'similarity' | 'patient' | 'metta') => {
        if (activePanel === panel) {
          setActivePanel(null);
        } else {
          setActivePanel(panel);
        }
    };

    return (
        <header className="flex-none h-16 border-b bg-white px-6 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
             <Activity className="h-6 w-6 text-blue-600" />
             <h1 className="text-xl font-bold text-slate-900">MediGraph</h1>
           </div>
           
           {/* Primary Actions Toolbar */}
           <div className="flex items-center gap-2 pl-6 border-l h-8">
             <Button 
                variant={activePanel === 'interactions' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => togglePanel('interactions')}
                className="gap-2"
             >
                <Database className="h-4 w-4" />
                Interactions
             </Button>
             <Button 
                variant={activePanel === 'similarity' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => togglePanel('similarity')}
                className="gap-2"
             >
                <Network className="h-4 w-4" />
                Similarity
             </Button>
             <Button 
                variant={activePanel === 'patient' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => togglePanel('patient')}
                className="gap-2"
             >
                <Pill className="h-4 w-4" />
                Patient
             </Button>
             <Button 
                variant={activePanel === 'metta' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => togglePanel('metta')}
                className="gap-2"
             >
                <UploadCloud className="h-4 w-4" />
                Upload Metta
             </Button>
           </div>
        </div>

        <div className="flex items-center gap-4">
           {/* Clear Button */}
           <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClear}
            className="text-slate-500 border-slate-300 hover:text-red-600 hover:border-red-600 hover:bg-red-50"
           >
             <Trash2 className="h-4 w-4 mr-2" />
             Clear Graph
           </Button>
           <div className="text-xs text-slate-400">
              System: <span className="text-green-500 font-medium">Online</span>
           </div>
        </div>
      </header>
    );
}
