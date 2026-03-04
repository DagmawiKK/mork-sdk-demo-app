'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InteractionGraph } from '@/components/InteractionGraph'; 
import { 
  AlertTriangle, 
  Activity, 
  Pill, 
  CheckCircle2, 
  Settings, 
  Network, 
  Trash2, 
  X,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  // UI State
  const [activePanel, setActivePanel] = useState<'interactions' | 'similarity' | 'patient' | null>('patient');

  // State for Ingest Interaction
  const [ingestForm, setIngestForm] = useState({ drug_a: '', drug_b: '', severity: 'High' });
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);

  // State for Chemical Similarity
  const [chemSimForm, setChemSimForm] = useState({ drug_a: '', drug_b: '' });
  const [chemSimStatus, setChemSimStatus] = useState<string | null>(null);

  // State for Patient Medication
  const [patientId, setPatientId] = useState('patient-001');
  const [medicationInput, setMedicationInput] = useState('');
  const [patientMedications, setPatientMedications] = useState<string[]>([]);
  const [addMedStatus, setAddMedStatus] = useState<string | null>(null);

  // State for Risk Analysis
  const [riskResults, setRiskResults] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  // Handlers
  const handleIngest = async () => {
    try {
      await api.ingestInteraction(ingestForm);
      setIngestStatus('Interaction rule added successfully!');
      setTimeout(() => setIngestStatus(null), 3000);
      setIngestForm({ drug_a: '', drug_b: '', severity: 'High' });
    } catch (e) {
      console.error(e);
      setIngestStatus('Failed to add interaction rule.');
    }
  };

  const handleChemSimIngest = async () => {
    try {
      await api.ingestChemicallySimilar(chemSimForm);
      setChemSimStatus('Similarity rule added successfully!');
      setTimeout(() => setChemSimStatus(null), 3000);
      setChemSimForm({ drug_a: '', drug_b: '' });
    } catch (e) {
      console.error(e);
      setChemSimStatus('Failed to add similarity rule.');
    }
  };

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

  const handleCheckRisks = async () => {
    setIsChecking(true);
    try {
      // 1. Trigger Inference
      await api.inferRisks();
      
      // 2. Check Risks
      const response = await api.checkRisks(patientId);
      // The backend returns { user_id, findings: [] }
      setRiskResults(response.findings || []);
    } catch (e) {
      console.error(e);
      setRiskResults(['Error checking risks.']);
    } finally {
      setIsChecking(false);
    }
  };

  // Helper to toggle panels
  const togglePanel = (panel: 'interactions' | 'similarity' | 'patient') => {
    if (activePanel === panel) {
      setActivePanel(null);
    } else {
      setActivePanel(panel);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* Top Navigation Bar */}
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
           </div>
        </div>

        <div className="flex items-center gap-4">
           {/* Clear Button (Disabled for now) */}
           <Button variant="outline" size="sm" disabled className="text-slate-400 border-slate-200">
             <Trash2 className="h-4 w-4 mr-2" />
             Clear Graph
           </Button>
           <div className="text-xs text-slate-400">
              System: <span className="text-green-500 font-medium">Online</span>
           </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Dynamic Sidebar Panel */}
        {activePanel && (
          <aside 
            className="w-96 flex-none bg-white border-r shadow-xl overflow-y-auto z-20 animate-in slide-in-from-left duration-300"
          >
            <div className="p-4 flex items-center justify-between border-b bg-slate-50/50 sticky top-0 backdrop-blur-sm">
               <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                 {activePanel === 'interactions' && <><Database className="h-4 w-4" /> Knowledge Base</>}
                 {activePanel === 'similarity' && <><Network className="h-4 w-4" /> Chemical Similarity</>}
                 {activePanel === 'patient' && <><Pill className="h-4 w-4" /> Patient Profile</>}
               </h2>
               <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setActivePanel(null)}>
                 <X className="h-4 w-4" />
               </Button>
            </div>

            <div className="p-6">
              
              {/* CONTENT: Interactions */}
              {activePanel === 'interactions' && (
                <div className="space-y-6">
                    <p className="text-sm text-muted-foreground">Define known adverse drug interactions to the global knowledge graph.</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Drug A</Label>
                          <Input 
                            placeholder="e.g. Aspirin" 
                            value={ingestForm.drug_a}
                            onChange={(e) => setIngestForm({...ingestForm, drug_a: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Drug B</Label>
                          <Input 
                            placeholder="e.g. Warfarin" 
                            value={ingestForm.drug_b}
                            onChange={(e) => setIngestForm({...ingestForm, drug_b: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Severity</Label>
                        <select 
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          value={ingestForm.severity}
                          onChange={(e) => setIngestForm({...ingestForm, severity: e.target.value})}
                        >
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>
                      <Button className="w-full" onClick={handleIngest}>Add Rule</Button>
                      
                      {ingestStatus && (
                        <div className="p-3 bg-green-50 text-green-700 text-xs rounded-md flex items-center gap-2 border border-green-200">
                          <CheckCircle2 className="h-3 w-3" /> {ingestStatus}
                        </div>
                      )}
                </div>
              )}

              {/* CONTENT: Similarity */}
              {activePanel === 'similarity' && (
                 <div className="space-y-6">
                    <p className="text-sm text-muted-foreground">Define chemically similar drugs. Example: Ibuprofen is similar to Naproxen.</p>
                    <div className="space-y-2">
                        <Label>Reference Drug (A)</Label>
                        <Input 
                          placeholder="e.g. Ibuprofen" 
                          value={chemSimForm.drug_a}
                          onChange={(e) => setChemSimForm({...chemSimForm, drug_a: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Similar Drug (B)</Label>
                        <Input 
                          placeholder="e.g. Naproxen" 
                          value={chemSimForm.drug_b}
                          onChange={(e) => setChemSimForm({...chemSimForm, drug_b: e.target.value})}
                        />
                      </div>
                      <Button variant="secondary" className="w-full mt-2" onClick={handleChemSimIngest}>Add Similarity Rule</Button>

                      {chemSimStatus && (
                        <div className="p-3 bg-green-50 text-green-700 text-xs rounded-md flex items-center gap-2 border border-green-200">
                          <CheckCircle2 className="h-3 w-3" /> {chemSimStatus}
                        </div>
                      )}
                 </div>
              )}

              {/* CONTENT: Patient */}
              {activePanel === 'patient' && (
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
              )}
            </div>
          </aside>
        )}

        {/* Dashboard Content (Graph & Alerts) */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-6 transition-all duration-300">
           <div className="max-w-6xl mx-auto h-full flex flex-col gap-6">
              
              {/* Action Bar */}
              <div className="flex items-center justify-between">
                 <div>
                   <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Risk Analysis Graph</h2>
                   <p className="text-slate-500">Visualizing interaction network for {patientId}</p>
                 </div>
                 <Button size="lg" onClick={handleCheckRisks} disabled={isChecking} className="shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-shadow">
                   {isChecking ? <Activity className="mr-2 h-4 w-4 animate-spin" /> : <Activity className="mr-2 h-4 w-4" />}
                   {isChecking ? 'Analyzing Protocols...' : 'Run Risk Analysis'}
                 </Button>
              </div>

              {/* Alert Section */}
              {riskResults.length > 0 && (
                <div className="space-y-2 animate-in slide-in-from-bottom-2 duration-500">
                  {riskResults.map((result, idx) => (
                    <Alert key={idx} variant="destructive" className="bg-red-50 border-red-200">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertTitle className="text-red-800">Interaction Detected</AlertTitle>
                      <AlertDescription className="text-red-700 font-medium">
                        {result}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
              
              {/* Graph Container */}
              <Card className="flex-1 min-h-[500px] border-slate-200 shadow-lg overflow-hidden flex flex-col bg-white">
                 <div className="flex-1 relative">
                   {/* We pass the medications and risks to the visualization */}
                   <InteractionGraph 
                      medications={patientMedications}
                      risks={riskResults}
                   />
                 </div>
                 <CardFooter className="bg-white text-xs text-slate-400 border-t py-3 flex justify-between">
                    <span>Powered by MeTTa-KG & Mork SDK</span>
                    <span>v1.0.0</span>
                 </CardFooter>
              </Card>

           </div>
        </main>

      </div>
    </div>
  );
}
