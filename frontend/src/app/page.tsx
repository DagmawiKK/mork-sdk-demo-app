'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { RiskItem } from '@/components/InteractionGraph'; 
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardView } from '@/components/dashboard/DashboardView';

export default function Dashboard() {
  // UI State
  const [activePanel, setActivePanel] = useState<'interactions' | 'similarity' | 'patient' | 'metta' | null>('patient');

  // Global App State (Shared across panels/views)
  const [patientId, setPatientId] = useState('patient-001');
  const [patientMedications, setPatientMedications] = useState<string[]>([]);
  
  // Analysis State
  const [riskResults, setRiskResults] = useState<RiskItem[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [addMedStatus, setAddMedStatus] = useState<string | null>(null); 

  const handleCheckRisks = async () => {
    setIsChecking(true);
    try {
      await api.inferRisks();
      
      await api.checkRisks(patientId); 

      const exploreRes = await api.exploreData('/alerts', '$x', '');
      
      const results: { expr: string }[] = JSON.parse(exploreRes);
      
      const newRisks: RiskItem[] = [];
      const regex = /\(Warning\s+([^\s)]+)\s+([^\s)]+)\s+([^\s)]+)\)/;

      results.forEach(item => {
        const match = item.expr.match(regex);
        if (match) {
           const [_, d1, d2, severity] = match;
           const cleanD1 = d1.replace(/[()]/g, '');
           const cleanD2 = d2.replace(/[()]/g, '');
           const cleanSev = severity.replace(/[()]/g, '');
           
           newRisks.push({
             drugA: cleanD1,
             drugB: cleanD2,
             severity: cleanSev,
             description: `Interaction detected between ${cleanD1} and ${cleanD2} (${cleanSev})`
           });
        }
      });

      setRiskResults(newRisks);
    } catch (e) {
      console.error(e);
    } finally {
      setIsChecking(false);
    }
  };

  const handleClear = async () => {
      try {
        await api.clearData(`/patients/${patientId}`, '*');
        await api.clearData(`/alerts`, '*');
        setPatientMedications([]);
        setRiskResults([]);
        console.log("Patient data cleared.");
      } catch (e) {
        console.error(e);
      }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans overflow-hidden">
      
      <Header 
        activePanel={activePanel} 
        setActivePanel={setActivePanel} 
        handleClear={handleClear} 
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        
        <Sidebar 
            activePanel={activePanel}
            setActivePanel={setActivePanel}
            patientId={patientId}
            setPatientId={setPatientId}
            patientMedications={patientMedications}
            setPatientMedications={setPatientMedications}
        />

        <DashboardView 
            patientId={patientId}
            isChecking={isChecking}
            handleCheckRisks={handleCheckRisks}
            riskResults={riskResults}
            patientMedications={patientMedications}
        />
      </div>
    </div>
  );
}
