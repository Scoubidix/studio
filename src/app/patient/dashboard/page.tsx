import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Program, Exercise, ProgramExercise } from "@/interfaces"; // Assuming interfaces are defined
import FeedbackForm from '@/components/patient/feedback-form';
import PatientChatbot from '@/components/patient/patient-chatbot';
import Image from 'next/image';
import { Dumbbell, Activity, StretchVertical } from 'lucide-react';

// --- Mock Data (Replace with actual data fetching later) ---
const mockExercises: Exercise[] = [
  { id: 'ex1', nom: 'Squat', description: 'Flexion des genoux et des hanches.', niveau: 'débutant', catégorie: 'renforcement', image_url: 'https://picsum.photos/seed/squat/300/200' },
  { id: 'ex2', nom: 'Étirement Ischio-jambiers', description: 'Étirement des muscles postérieurs de la cuisse.', niveau: 'intermédiaire', catégorie: 'étirement', image_url: 'https://picsum.photos/seed/hamstring/300/200' },
  { id: 'ex3', nom: 'Rotation Tronc Assis', description: 'Mobilisation de la colonne vertébrale en rotation.', niveau: 'débutant', catégorie: 'mobilité', image_url: 'https://picsum.photos/seed/rotation/300/200' },
  { id: 'ex4', nom: 'Pont Fessier', description: 'Renforcement des fessiers et du bas du dos.', niveau: 'intermédiaire', catégorie: 'renforcement', image_url: 'https://picsum.photos/seed/bridge/300/200' },
];

const mockProgram: Program = {
  id: 'prog123',
  patient_id: 'patientTest',
  liste_exercices: [
    { exercice_id: 'ex1', séries: 3, répétitions: 12, fréquence: '3 fois/semaine' },
    { exercice_id: 'ex2', séries: 2, répétitions: 30, fréquence: 'Tous les jours (secondes)' }, // Indicate hold time for stretches
    { exercice_id: 'ex3', séries: 3, répétitions: 10, fréquence: 'Tous les jours' },
    { exercice_id: 'ex4', séries: 3, répétitions: 15, fréquence: '3 fois/semaine' },
  ],
  statut: 'actif',
  date_creation: new Date().toISOString(),
};

// Helper to get exercise details
const getExerciseDetails = (exerciseId: string): Exercise | undefined => {
  return mockExercises.find(ex => ex.id === exerciseId);
}

// Populate exercise details into the program list
const populatedProgramExercises: ProgramExercise[] = mockProgram.liste_exercices.map(progEx => ({
  ...progEx,
  exerciseDetails: getExerciseDetails(progEx.exercice_id),
}));
// --- End Mock Data ---

const getCategoryIcon = (category: Exercise['catégorie']) => {
  switch (category) {
    case 'renforcement': return <Dumbbell className="w-5 h-5 text-primary" />;
    case 'mobilité': return <Activity className="w-5 h-5 text-accent" />;
    case 'étirement': return <StretchVertical className="w-5 h-5 text-secondary-foreground" />;
    default: return null;
  }
};

export default function PatientDashboard() {
  // TODO: Replace with actual data fetching logic (e.g., using useEffect and API calls)

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Tableau de Bord Patient</h1>

      {/* Exercise Program Section */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Votre Programme d'Exercices</CardTitle>
          <CardDescription>Suivez les exercices prescrits par votre kinésithérapeute. Statut : <span className="font-semibold capitalize">{mockProgram.statut}</span></CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {populatedProgramExercises.length > 0 ? (
            populatedProgramExercises.map((progEx, index) => (
              progEx.exerciseDetails ? (
                <div key={progEx.exercice_id}>
                  <Card className="overflow-hidden border border-border/60 bg-card/80">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {progEx.exerciseDetails.image_url && (
                        <div className="relative md:col-span-1 h-40 md:h-full">
                           <Image
                              src={progEx.exerciseDetails.image_url}
                              alt={progEx.exerciseDetails.nom}
                              fill
                              style={{ objectFit: 'cover' }}
                              className="rounded-l-lg"
                              unoptimized // Added for picsum
                            />
                        </div>

                      )}
                       <div className={`p-4 ${progEx.exerciseDetails.image_url ? 'md:col-span-2' : 'md:col-span-3'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold">{progEx.exerciseDetails.nom}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground capitalize">
                                {getCategoryIcon(progEx.exerciseDetails.catégorie)}
                                {progEx.exerciseDetails.catégorie}
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">{progEx.exerciseDetails.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="font-medium">Séries: <span className="font-normal">{progEx.séries}</span></span>
                          <span className="font-medium">Répétitions: <span className="font-normal">{progEx.répétitions} {progEx.exerciseDetails.catégorie === 'étirement' ? 'sec' : ''}</span></span>
                          <span className="font-medium">Fréquence: <span className="font-normal">{progEx.fréquence}</span></span>
                           <span className="font-medium capitalize">Niveau: <span className="font-normal">{progEx.exerciseDetails.niveau}</span></span>
                        </div>
                        {progEx.exerciseDetails.contre_indications && progEx.exerciseDetails.contre_indications.length > 0 && (
                            <p className="text-xs text-destructive mt-2">Contre-indications: {progEx.exerciseDetails.contre_indications.join(', ')}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                  {index < populatedProgramExercises.length - 1 && <Separator className="my-6" />}
                </div>
              ) : (
                <p key={progEx.exercice_id} className="text-muted-foreground">Détails de l'exercice {progEx.exercice_id} non trouvés.</p>
              )
            ))
          ) : (
            <p className="text-muted-foreground">Aucun programme d'exercices actif pour le moment.</p>
          )}
        </CardContent>
      </Card>

       {/* Feedback Section */}
      <FeedbackForm programId={mockProgram.id} patientId={mockProgram.patient_id} />


      {/* Patient Chatbot Section */}
      <PatientChatbot />

      {/* Session History Section (Placeholder) */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Historique des Séances</CardTitle>
          <CardDescription>Consultez vos précédents feedbacks.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">L'historique des feedbacks sera disponible bientôt.</p>
          {/* TODO: Implement feedback history display */}
        </CardContent>
      </Card>
    </div>
  );
}
