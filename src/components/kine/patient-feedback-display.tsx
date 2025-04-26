'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { Feedback } from '@/interfaces';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertCircle, MessageSquare, TrendingDown, TrendingUp, Activity } from 'lucide-react'; // Import relevant icons

// --- Mock Data (Replace with actual data fetching based on patientId) ---
const mockFeedbacks: Feedback[] = [
  {
    id: 'fb1',
    programme_id: 'prog123',
    patient_id: 'patientTest', // Feedback for Jean Dupont
    date: new Date(Date.now() - 86400000 * 1).toISOString(), // Yesterday
    douleur_moyenne: 5,
    difficulté: 6,
    commentaire_libre: "L'étirement des ischios était un peu douloureux aujourd'hui.",
  },
  {
    id: 'fb2',
    programme_id: 'prog123',
    patient_id: 'patientTest', // Feedback for Jean Dupont
    date: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    douleur_moyenne: 4,
    difficulté: 5,
    commentaire_libre: "Séance ok, RAS.",
  },
  {
      id: 'fb3',
      programme_id: 'progXYZ', // Different program ID example
      patient_id: 'patientTest2', // Feedback for Claire Martin
      date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
      douleur_moyenne: 3,
      difficulté: 7,
      commentaire_libre: "Les exercices de renforcement de la cheville sont difficiles mais je sens que ça progresse. Pas de douleur particulière.",
  },
  {
      id: 'fb4',
      programme_id: 'progXYZ',
      patient_id: 'patientTest2', // Feedback for Claire Martin
      date: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
      douleur_moyenne: 4,
      difficulté: 6,
      // No comment
  },
   {
      id: 'fb5',
      programme_id: 'progABC',
      patient_id: 'patientTest3', // Feedback for Lucas Petit
      date: new Date(Date.now() - 86400000 * 1).toISOString(), // Yesterday
      douleur_moyenne: 6,
      difficulté: 5,
      commentaire_libre: "J'ai ressenti une gêne au genou droit pendant les squats.",
  },
];
// --- End Mock Data ---

interface PatientFeedbackDisplayProps {
  patientId: string;
}

export default function PatientFeedbackDisplay({ patientId }: PatientFeedbackDisplayProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

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
    }, 1000); // Simulate 1 second loading time

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
    <Card className="shadow-md h-fit"> {/* Added h-fit */}
      <CardHeader>
        <CardTitle>Feedbacks Patient</CardTitle>
        <CardDescription>Historique des retours du patient sur ses séances.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
             // Basic Skeleton Loader
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="space-y-2 p-3 border rounded-md animate-pulse">
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                        <div className="h-3 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                        <div className="h-6 bg-muted rounded w-full mt-2"></div>
                    </div>
                ))}
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
                       {/* Removed Fatigue and Adherence display */}
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
          <p className="text-center text-muted-foreground">Aucun feedback disponible pour ce patient.</p>
        )}
      </CardContent>
    </Card>
  );
}
