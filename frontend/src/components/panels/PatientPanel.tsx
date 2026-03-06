import { useState } from 'react';
import { api } from '@/lib/api';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from 'lucide-react';

interface PatientPanelProps {
  patientId: string;
  setPatientId: (id: string) => void;
  patientMedications: string[];
  setPatientMedications: React.Dispatch<React.SetStateAction<string[]>>;
}

export function PatientPanel({ 
  patientId, 
  setPatientId, 
  patientMedications, 
  setPatientMedications 
}: PatientPanelProps) {
  
  const [medicationInput, setMedicationInput] = useState('');
  const [addMedStatus, setAddMedStatus] = useState<string | null>(null);

  const handleAddMedication = async () => {
    if (!medicationInput) return;
    try {
      await api.addPatientMedication({ user_id: patientId, drug: medicationInput });
      setPatientMedications(prev => [...prev, medicationInput]);
      setAddMedStatus(`Added ${medicationInput} to profile.`);
      setMedicationInput('');
      setTimeout(() => setAddMedStatus(null), 3000);
    } catch (e) {
      console.error(e);
      setAddMedStatus('Failed to add medication.');
    }
  };

  return (
    <div className="space-y-6">
        <div className="space-y-2">
          <Label>Patient ID</Label>
          <Input 
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Add Medication</Label>
          <div className="flex gap-2">
            <Input 
              placeholder="Search drug..." 
              value={medicationInput}
              onChange={(e) => setMedicationInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddMedication()}
            />
            <Button onClick={handleAddMedication}>Add</Button>
          </div>
        </div>

        <div className="space-y-2">
           <Label className="text-xs font-semibold uppercase text-slate-500">Active Prescriptions</Label>
           <div className="space-y-1">
              {patientMedications.length === 0 ? (
                 <div className="bg-slate-50 rounded border p-4 text-center">
                   <p className="text-xs text-slate-400 italic">No medications recorded this session.</p>
                 </div>
              ) : (
                 patientMedications.map((med, i) => (
                   <div key={i} className="flex items-center justify-between bg-white px-3 py-2 rounded border shadow-sm text-sm hover:bg-slate-50 transition-colors">
                      <span className="font-medium">{med}</span>
                      <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                   </div>
                 ))
              )}
           </div>
        </div>

         {addMedStatus && (
            <div className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> {addMedStatus}
            </div>
          )}
    </div>
  );
}
