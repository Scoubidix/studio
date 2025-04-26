// @refresh reset - Prevent error during compilation
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { Feedback } from '@/interfaces';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertCircle, MessageSquare, TrendingDown, TrendingUp, Activity, Loader2 } from 'lucide-react'; // Added Loader2

// --- Mock Data (Moved to dashboard page for notification use) ---
import { mockFeedbacks } from './mock-data'; // Assuming mock data is moved to a separate file or passed as prop
// --- End Mock Data ---

interface PatientFeedbackDisplayProps {
  patientId: string;
}

export default function PatientFeedbackDisplay({ patientId }: PatientFeedbackDisplayProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // TODO: Replace with actual Firestore query to fetch feedbacks for the given patientId, ordered by date descending.
    console.log(`Fetching feedback for patient ID: ${patientId}`);
    // Simulate API call
    setTimeout(() => {
        const filteredFeedbacks = mockFeedbacks
                                  .filter(fb => fb.patient_id === patientId)
                                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date descending
        setFeedbacks(filteredFeedbacks);
        setIsLoading(false);
    }, 500); // Reduced loading time slightly

  }, [patientId]); // Re-fetch when patientId changes

  const getPainColor = (level: number): string => {
      if (level >= 7) return 'text-red-600 dark:text-red-500';
      if (level >= 4) return 'text-orange-500 dark:text-orange-400';
      return 'text-green-600 dark:text-green-500';
  };

   const getDifficultyColor = (level: number): string => {
      if (level >= 8) return 'text-red-600 dark:text-red-500';
      if (level >= 5) return 'text-orange-500 dark:text-orange-400';
      return 'text-blue-600 dark:text-blue-500'; // Use blue for easier difficulty
  };


  return (
    <Card className="shadow-md h-full"> {/* Ensure card takes full height if needed */}
      <CardHeader>
        <CardTitle>Feedbacks Patient</CardTitle>
        <CardDescription>Historique des retours du patient sur ses séances.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="flex justify-center items-center h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : feedbacks.length > 0 ? (
           <ScrollArea className="h-[400px] pr-4"> {/* Adjust height as needed */}
            <div className="space-y-4">
              {feedbacks.map((fb, index) => (
                <div key={fb.id || index}>
                  <div className="text-sm space-y-2">
                    <p className="font-semibold capitalize">
                      {format(new Date(fb.date), "EEEE d MMMM yyyy", { locale: fr })}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                       <span className="flex items-center gap-1">
                           <AlertCircle className={`w-3.5 h-3.5 ${getPainColor(fb.douleur_moyenne)}`} />
                           Douleur: <span className={`font-medium ${getPainColor(fb.douleur_moyenne)}`}>{fb.douleur_moyenne}/10</span>
                       </span>
                        <span className="flex items-center gap-1">
                           <Activity className={`w-3.5 h-3.5 ${getDifficultyColor(fb.difficulté)}`} />
                           Difficulté: <span className={`font-medium ${getDifficultyColor(fb.difficulté)}`}>{fb.difficulté}/10</span>
                       </span>
                    </div>
                    {fb.commentaire_libre && (
                      <div className="mt-2 p-3 bg-muted/50 rounded-md border border-border/50">
                           <p className="text-xs italic flex items-start gap-1.5">
                                <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary" />
                                <span>{fb.commentaire_libre}</span>
                           </p>
                      </div>
                    )}
                  </div>
                   {index < feedbacks.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <p className="text-center text-muted-foreground pt-4">Aucun feedback disponible pour ce patient.</p>
        )}
      </CardContent>
    </Card>
  );
}
