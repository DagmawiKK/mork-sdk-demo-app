import { useState } from 'react';
import { api } from '@/lib/api';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function MettaUploadPanel() {
  const [mettaCode, setMettaCode] = useState('');
  const [mettaStatus, setMettaStatus] = useState<string | null>(null);

  const handleFileRead = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) setMettaCode(content);
    };
    reader.readAsText(file);
  };

  const handleMettaUpload = async () => {
    try {
      const res = await api.ingestMetta(mettaCode);
      setMettaStatus(res);
      setMettaCode('');
      setTimeout(() => setMettaStatus(null), 5000);
    } catch (e) {
      console.error(e);
      setMettaStatus('Failed to upload Metta file.');
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Upload raw Metta code to bulk-ingest facts.</p>
      <div className="space-y-2">
         <Label>Upload File (.metta)</Label>
         <Input 
           type="file" 
           accept=".metta,.txt"
           onChange={handleFileRead}
         />
      </div>
      <Button className="w-full" onClick={handleMettaUpload}>Upload Facts</Button>

      {mettaStatus && (
        <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-200 whitespace-pre-wrap">
           {mettaStatus}
        </div>
      )}
    </div>
  );
}
