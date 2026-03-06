import { useState } from 'react';
import { api } from '@/lib/api';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from 'lucide-react';

export function SimilarityPanel() {
  const [chemSimForm, setChemSimForm] = useState({ drug_a: '', drug_b: '' });
  const [chemSimStatus, setChemSimStatus] = useState<string | null>(null);

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

  return (
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
  );
}
