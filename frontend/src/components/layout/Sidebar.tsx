import { Button } from "@/components/ui/button";
import { 
  Pill, 
  Network, 
  X,
  Database,
  UploadCloud
} from 'lucide-react';
import { InteractionsPanel } from "../panels/InteractionsPanel";
import { SimilarityPanel } from "../panels/SimilarityPanel";
import { MettaUploadPanel } from "../panels/MettaUploadPanel";
import { PatientPanel } from "../panels/PatientPanel";

interface SidebarProps {
    activePanel: 'interactions' | 'similarity' | 'patient' | 'metta' | null;
    setActivePanel: (val: null) => void;
    patientId: string;
    setPatientId: (id: string) => void;
    patientMedications: string[];
    setPatientMedications: React.Dispatch<React.SetStateAction<string[]>>;
}

export function Sidebar({ 
    activePanel, 
    setActivePanel,
    patientId,
    setPatientId,
    patientMedications,
    setPatientMedications
}: SidebarProps) {
    if (!activePanel) return null;

    return (
        <aside 
            className="w-96 flex-none bg-white border-r shadow-xl overflow-y-auto z-20 animate-in slide-in-from-left duration-300"
        >
            <div className="p-4 flex items-center justify-between border-b bg-slate-50/50 sticky top-0 backdrop-blur-sm">
            <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                {activePanel === 'interactions' && <><Database className="h-4 w-4" /> Knowledge Base</>}
                {activePanel === 'similarity' && <><Network className="h-4 w-4" /> Chemical Similarity</>}
                {activePanel === 'patient' && <><Pill className="h-4 w-4" /> Patient Profile</>}
                {activePanel === 'metta' && <><UploadCloud className="h-4 w-4" /> Upload Metta</>}
            </h2>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setActivePanel(null)}>
                <X className="h-4 w-4" />
            </Button>
            </div>

            <div className="p-6">
                {activePanel === 'interactions' && <InteractionsPanel />}
                {activePanel === 'similarity' && <SimilarityPanel />}
                {activePanel === 'metta' && <MettaUploadPanel />}
                {activePanel === 'patient' && (
                    <PatientPanel 
                        patientId={patientId}
                        setPatientId={setPatientId}
                        patientMedications={patientMedications}
                        setPatientMedications={setPatientMedications}
                    />
                )}
            </div>
        </aside>
    );
}
