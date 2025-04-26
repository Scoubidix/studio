'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Sparkles, FileText, Microscope, AlertTriangle } from 'lucide-react'; // Import Microscope and AlertTriangle
import { useToast } from '@/hooks/use-toast';
// TODO: Import the actual Genkit flow for summarization when created
// import { summarizeMedicalReport } from '@/ai/flows/summarize-medical-report';

export default function MedicalReportSummarizer() {
  const [reportText, setReportText] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSummarize = async () => {
    if (!reportText.trim()) {
      setError("Veuillez coller le texte de votre rapport médical.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSummary('');

    try {
      // --- TODO: Replace with actual Genkit flow call ---
      console.log("Simulating AI summarization for:", reportText.substring(0, 100) + "...");
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI processing time
      const mockSummary = `Résumé simplifié : ${reportText.substring(0, 50)}... Il semble y avoir [mention simple d'un point clé simulé]. Discutez des détails avec votre kinésithérapeute.`;
      // const result = await summarizeMedicalReport({ reportText });
      // setSummary(result.summary);
      // --- End Replace ---

      setSummary(mockSummary); // Use mock summary for now

    } catch (err) {
      console.error("Error summarizing report:", err);
      setError("Une erreur est survenue lors de la génération du résumé. Veuillez réessayer.");
      toast({
        title: "Erreur de Résumé",
        description: "Impossible de générer le résumé pour le moment.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Microscope className="w-5 h-5 text-primary" /> Résumé de Rapport Médical (IA)
        </CardTitle>
        <CardDescription>
          Collez le texte de votre compte rendu (radiographie, IRM, etc.) pour obtenir un résumé simplifié.
          <strong className='ml-1'>Attention : Ceci est une simplification et ne remplace pas l'avis de votre médecin ou kiné.</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Collez ici le texte complet de votre compte rendu médical..."
          value={reportText}
          onChange={(e) => setReportText(e.target.value)}
          rows={10}
          className="text-sm"
          disabled={isLoading}
        />
        <Button onClick={handleSummarize} disabled={isLoading || !reportText.trim()}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          {isLoading ? 'Analyse en cours...' : 'Générer le Résumé Simplifié'}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {summary && !isLoading && (
          <Card className="bg-muted/50 mt-4">
             <CardHeader className="pb-2">
                 <CardTitle className="text-md flex items-center gap-2">
                    <FileText className="w-4 h-4 text-accent"/>
                    Votre Résumé Simplifié
                 </CardTitle>
             </CardHeader>
             <CardContent>
                 <p className="text-sm whitespace-pre-wrap">{summary}</p>
             </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
