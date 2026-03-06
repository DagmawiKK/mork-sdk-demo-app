import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  Activity, 
} from 'lucide-react';
import { InteractionGraph, RiskItem } from '@/components/InteractionGraph';
import { Card, CardFooter } from "@/components/ui/card";

interface DashboardViewProps {
    patientId: string;
    isChecking: boolean;
    handleCheckRisks: () => void;
    riskResults: RiskItem[];
    patientMedications: string[];
}

export function DashboardView({
    patientId,
    isChecking,
    handleCheckRisks,
    riskResults,
    patientMedications
}: DashboardViewProps) {
    return (
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
                        {result.description}
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
                    <span>Powered by Mork SDK</span>
                    <span>v0.2.1</span>
                 </CardFooter>
              </Card>
           </div>
        </main>
    );
}
