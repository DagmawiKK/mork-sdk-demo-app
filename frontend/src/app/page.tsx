'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InteractionGraph } from '@/components/InteractionGraph'; // Ensure this matches export
import { AlertTriangle, Plus, Activity, Pill, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
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

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <header className="mb-8 flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
             <Activity className="h-8 w-8 text-blue-600" />
             MediGraph Dashboard
           </h1>
           <p className="text-slate-500 mt-2">AI-Powered Drug Interaction Analysis Service</p>
        </div>
        <div className="text-sm text-slate-400">
           System Status: <span className="text-green-500 font-medium">Online</span>
        </div>
      </header>
      
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Actions */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Admin / Knowledge Base Ingestion */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" /> Knowledge Base
              </CardTitle>
              <CardDescription>Define known drug interactions (Admin)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
            <CardFooter className="flex-col items-start gap-2">
              <Button className="w-full" onClick={handleIngest}>Add Interaction Rule</Button>
              {ingestStatus && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> {ingestStatus}
                </p>
              )}
            </CardFooter>
          </Card>
          {/* 1b. Chemical Similarity Knowledge Base */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" /> Chemical Similarity
              </CardTitle>
              <CardDescription>Define similar drugs (e.g. Ibuprofen ~ Naproxen)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Drug A</Label>
                  <Input 
                    placeholder="e.g. Ibuprofen" 
                    value={chemSimForm.drug_a}
                    onChange={(e) => setChemSimForm({...chemSimForm, drug_a: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Similar Drug B</Label>
                  <Input 
                    placeholder="e.g. Naproxen" 
                    value={chemSimForm.drug_b}
                    onChange={(e) => setChemSimForm({...chemSimForm, drug_b: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2">
              <Button className="w-full" variant="secondary" onClick={handleChemSimIngest}>Add Similarity Rule</Button>
              {chemSimStatus && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> {chemSimStatus}
                </p>
              )}
            </CardFooter>
          </Card>
          {/* Patient Profile Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" /> Patient Profile
              </CardTitle>
              <CardDescription>Manage patient medications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    placeholder="e.g. Ibuprofen" 
                    value={medicationInput}
                    onChange={(e) => setMedicationInput(e.target.value)}
                  />
                  <Button variant="secondary" onClick={handleAddMedication}>Add</Button>
                </div>
              </div>
              
              {/* List of current meds added in session */}
              <div className="mt-4">
                <Label className="text-xs text-muted-foreground mb-2 block">Current Medications (Session)</Label>
                <div className="flex flex-wrap gap-2">
                  {patientMedications.map((med, i) => (
                    <span key={i} className="bg-slate-100 text-slate-800 text-xs px-2 py-1 rounded-full border border-slate-200">
                      {med}
                    </span>
                  ))}
                  {patientMedications.length === 0 && <span className="text-xs text-slate-400 italic">No medications added yet</span>}
                </div>
              </div>

            </CardContent>
            <CardFooter>
               {addMedStatus && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> {addMedStatus}
                </p>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Visualization & Results */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Risk Analysis & Visualization</CardTitle>
                <CardDescription>Graph view of interactions for {patientId}</CardDescription>
              </div>
              <Button onClick={handleCheckRisks} disabled={isChecking}>
                {isChecking ? 'Analyzing...' : 'Check Risks'}
              </Button>
            </CardHeader>
            
            <CardContent className="flex-1 min-h-[500px] flex flex-col gap-4">
              
              {/* Alert Area */}
              {riskResults.length > 0 ? (
                <div className="space-y-2">
                  {riskResults.map((result, idx) => (
                    <Alert key={idx} variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Interaction Detected</AlertTitle>
                      <AlertDescription>
                        {result}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <Alert className="bg-green-50 border-green-200 text-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle>No Risks Detected</AlertTitle>
                  <AlertDescription>
                    Patient profile currently shows no known interactions based on analysis.
                  </AlertDescription>
                </Alert>
              )}

              {/* Graph Area */}
              <div className="flex-1 bg-white border rounded-lg shadow-inner relative overflow-hidden">
                 <InteractionGraph 
                   medications={patientMedications}
                   risks={riskResults}
                 />
              </div>

            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  );
}
