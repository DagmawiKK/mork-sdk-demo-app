import { useState } from 'react';
import { api } from '@/lib/api';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from 'lucide-react';

export function InteractionsPanel() {
  const [ingestForm, setIngestForm] = useState({ drug_a: '', drug_b: '', severity: 'High' });
  const [ingestStatus, setIngestStatus] = useState<string | null>(null);

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

  return (
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
  );
}
