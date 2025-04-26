'use client'; // Need client component for state, effects, event handlers

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Program, Exercise, ProgramExercise, Feedback, Patient } from "@/interfaces"; // Import Patient
import FeedbackForm from '@/components/patient/feedback-form';
import PatientChatbotPopup from '@/components/patient/patient-chatbot'; // Import the new popup component
import ExerciseDetailModal from '@/components/patient/exercise-detail-modal'; // Import the new detail modal
import Image from 'next/image';
import { Dumbbell, Activity, StretchVertical, Trophy, CalendarDays, ArrowRight, Target, Share2 } from 'lucide-react'; // Added Target and Share2 icons
import { format } from 'date-fns';
import { fr } from 'date-fns/locale'; // Import French locale
import { useToast } from '@/hooks/use-toast'; // Import useToast

// --- Mock Data (Replace with actual data fetching later) ---
const mockExercises: Exercise[] = [
  {
    id: 'ex1',
    nom: 'Squat',
    description: 'Flexion des genoux et des hanches pour renforcer les cuisses et les fessiers.',
    detailed_steps: [
        "Tenez-vous debout, pieds écartés à la largeur des épaules, pointes légèrement vers l'extérieur.",
        "Gardez le dos droit, la poitrine haute et le regard devant vous.",
        "Descendez comme si vous alliez vous asseoir sur une chaise, en poussant les hanches vers l'arrière.",
        "Les genoux doivent suivre la direction des pointes de pieds et ne pas dépasser celles-ci.",
        "Descendez jusqu'à ce que vos cuisses soient parallèles au sol (ou selon votre mobilité).",
        "Remontez en poussant sur les talons pour revenir à la position de départ.",
        "Contractez les fessiers en haut du mouvement."
    ],
    niveau: 'débutant',
    catégorie: 'renforcement',
    image_url: 'https://picsum.photos/seed/squat/300/200'
  },
  {
    id: 'ex2',
    nom: 'Étirement Ischio-jambiers',
    description: 'Étirement des muscles postérieurs de la cuisse pour améliorer la souplesse.',
    detailed_steps: [
        "Asseyez-vous au sol, une jambe tendue devant vous, l'autre pliée avec le pied contre l'intérieur de la cuisse tendue.",
        "Gardez le dos droit.",
        "Penchez-vous lentement vers l'avant à partir des hanches, en direction du pied de la jambe tendue.",
        "Essayez d'attraper votre pied, votre cheville ou votre tibia, selon votre souplesse.",
        "Maintenez la position lorsque vous sentez un étirement léger à modéré (pas de douleur).",
        "Respirez profondément et détendez-vous dans l'étirement.",
        "Maintenez la durée indiquée (souvent 30 secondes)." ,
        "Changez de côté."
    ],
    niveau: 'intermédiaire',
    catégorie: 'étirement',
    image_url: 'https://picsum.photos/seed/hamstring/300/200'
  },
  {
    id: 'ex3',
    nom: 'Rotation Tronc Assis',
    description: 'Mobilisation de la colonne vertébrale en rotation pour améliorer la mobilité du tronc.',
    detailed_steps: [
        "Asseyez-vous droit sur une chaise, les pieds à plat au sol.",
        "Placez vos mains sur vos cuisses ou croisez les bras sur votre poitrine.",
        "Tournez lentement le haut de votre corps (épaules et tête) vers un côté, sans bouger les hanches.",
        "Allez jusqu'où vous pouvez confortablement.",
        "Maintenez brièvement la position.",
        "Revenez lentement au centre.",
        "Répétez de l'autre côté.",
        "Gardez le mouvement fluide et contrôlé."
    ],
    niveau: 'débutant',
    catégorie: 'mobilité',
    image_url: 'https://picsum.photos/seed/rotation/300/200'
  },
];

const mockProgram: Program = {
  id: 'prog123',
  patient_id: 'patientTest',
  liste_exercices: [
    { exercice_id: 'ex1', séries: 3, répétitions: 12 },
    { exercice_id: 'ex2', séries: 2, répétitions: 30 }, // Represents 30 seconds hold for stretches
    { exercice_id: 'ex3', séries: 3, répétitions: 10 }, // Represents 10 rotations each side
  ],
  statut: 'actif',
  date_creation: new Date().toISOString(),
};

// Update mock patient data to include objectifs and email
const mockPatientData: Patient = {
  id: 'patientTest',
  nom: 'Dupont',
  prénom: 'Jean',
  email: 'jean.dupont@email.com', // Added email
  date_naissance: '1985-03-15',
  pathologies: ['Lombalgie chronique', 'Tendinopathie épaule droite'],
  remarques: 'Motivé mais craint la douleur.',
  kine_id: 'kineTest1',
  objectifs: ['Amélioration de la mobilité lombaire', 'Reprise progressive de la course à pied'], // Added objectives
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

// Motivational Quotes
const motivationalQuotes = [
    "Chaque petit pas compte. Continuez d'avancer !",
    "La persévérance est la clé de la réussite.",
    "Votre corps est capable de grandes choses. Croyez en vous !",
    "La douleur d'aujourd'hui est la force de demain.",
    "Soyez patient et constant, les résultats viendront.",
    "N'abandonnez jamais. Les grands accomplissements prennent du temps.",
    "Félicitations pour votre engagement envers votre santé !",
];

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
  const [currentDate, setCurrentDate] = useState('');
  const [motivationalQuote, setMotivationalQuote] = useState('');
  const [sessionStreak, setSessionStreak] = useState(0); // Example: track consecutive days with feedback
  const [totalSessions, setTotalSessions] = useState(0); // Example: track total feedback submissions
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [patientGoals, setPatientGoals] = useState<string[]>([]); // State for goals
  const { toast } = useToast(); // Initialize toast

  // Set date, initial quote, and patient goals on mount
  useEffect(() => {
    const today = new Date();
    setCurrentDate(format(today, "EEEE d MMMM yyyy", { locale: fr }));
    setMotivationalQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);

    // TODO: Fetch actual streak and total sessions from user data/feedback history
    // Example initialization
    setSessionStreak(3); // Replace with actual data
    setTotalSessions(15); // Replace with actual data

    // TODO: Fetch actual patient goals from data source
    setPatientGoals(mockPatientData.objectifs); // Use mock data for now
  }, []);

  // Function to update gamification state when feedback is submitted
  const handleFeedbackSubmitted = () => {
    // TODO: Implement logic to check if feedback is for today, update streak, etc.
    // This is a simplified mock update
    setSessionStreak(prev => prev + 1);
    setTotalSessions(prev => prev + 1);
    // Potentially show a congratulatory toast or update UI element
    console.log("Gamification state updated (simulated)");
    // Select a new quote after feedback submission
    setMotivationalQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  };

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsDetailModalOpen(true);
  };

  const handleShareClick = () => {
    // Basic share functionality (e.g., copy link or open native share)
    if (navigator.share) {
      navigator.share({
        title: 'Mon Assistant Kiné Progrès',
        text: `J'ai complété ${totalSessions} séances avec Mon Assistant Kiné ! Objectif : ${patientGoals.join(', ')}`,
        url: window.location.href, // Share the current dashboard URL
      }).then(() => {
        toast({ title: "Partagé !", description: "Votre progression a été partagée." });
      }).catch((error) => {
        console.error('Error sharing:', error);
        // Fallback for browsers without navigator.share or if user cancels
        navigator.clipboard.writeText(`J'ai complété ${totalSessions} séances avec Mon Assistant Kiné ! Objectif : ${patientGoals.join(', ')} - ${window.location.href}`);
        toast({ title: "Lien copié !", description: "Le lien vers votre tableau de bord a été copié dans le presse-papiers." });
      });
    } else {
      // Fallback for browsers without navigator.share
      navigator.clipboard.writeText(`J'ai complété ${totalSessions} séances avec Mon Assistant Kiné ! Objectif : ${patientGoals.join(', ')} - ${window.location.href}`);
      toast({ title: "Lien copié !", description: "Le lien vers votre tableau de bord a été copié dans le presse-papiers." });
    }
  };


  // TODO: Replace with actual data fetching logic for program, exercises, feedback history

  return (
    <div className="space-y-8">
       {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6 p-4 bg-card rounded-lg shadow-sm border">
           {/* Left Side: Date, Quote, Goals */}
           <div className="space-y-2">
               <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                   <CalendarDays className="w-5 h-5 text-primary"/>
                   <span className="capitalize">{currentDate}</span>
               </div>
               <p className="text-sm text-muted-foreground italic">"{motivationalQuote}"</p>
               {/* Patient Goals Section */}
               {patientGoals.length > 0 && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground pt-1">
                       <Target className="w-4 h-4 mt-0.5 text-accent flex-shrink-0"/>
                       <div>
                          <span className="font-medium text-foreground/90">Vos objectifs :</span>{' '}
                          {patientGoals.join(', ')}
                       </div>
                  </div>
               )}
           </div>

           {/* Right Side: Gamification & Sharing */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                 {/* Gamification */}
                 <div className="text-right">
                     <div className="flex items-center gap-2 justify-end">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <span className="font-semibold">{sessionStreak}</span>
                        <span className="text-sm text-muted-foreground">jours de suite</span>
                     </div>
                     <p className="text-xs text-muted-foreground mt-1">{totalSessions} séances complétées au total</p>
                 </div>
                 {/* Sharing Button */}
                  <Button
                     variant="outline"
                     size="sm"
                     onClick={handleShareClick}
                     className="flex items-center gap-1.5 h-8 text-xs"
                     aria-label="Partager ma progression"
                   >
                    <Share2 className="w-3.5 h-3.5" />
                    Partager
                  </Button>
            </div>
      </div>

      {/* Exercise Program Section */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Votre Programme d'Exercices</CardTitle>
          <CardDescription>Suivez les exercices prescrits par votre kinésithérapeute. Cliquez sur un exercice pour voir les détails. Statut : <span className="font-semibold capitalize">{mockProgram.statut}</span></CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {populatedProgramExercises.length > 0 ? (
            populatedProgramExercises.map((progEx, index) => (
              progEx.exerciseDetails ? (
                <div key={progEx.exercice_id}>
                  {/* Make the Card clickable */}
                  <Card
                    className="overflow-hidden border border-border/60 bg-card/80 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group"
                    onClick={() => handleExerciseClick(progEx.exerciseDetails!)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Voir les détails de l'exercice ${index + 1}: ${progEx.exerciseDetails.nom}`}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleExerciseClick(progEx.exerciseDetails!)}
                  >
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
                       <div className={`p-4 ${progEx.exerciseDetails.image_url ? 'md:col-span-2' : 'md:col-span-3'} relative`}>
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold">{index + 1}. {progEx.exerciseDetails.nom}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground capitalize">
                                {getCategoryIcon(progEx.exerciseDetails.catégorie)}
                                {progEx.exerciseDetails.catégorie}
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">{progEx.exerciseDetails.description}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm mb-4">
                          <span className="font-medium">Séries: <span className="font-normal">{progEx.séries}</span></span>
                          <span className="font-medium">Répétitions: <span className="font-normal">{progEx.répétitions} {progEx.exerciseDetails.catégorie === 'étirement' ? 'sec' : ''}</span></span>
                           <span className="font-medium capitalize">Niveau: <span className="font-normal">{progEx.exerciseDetails.niveau}</span></span>
                        </div>
                        {progEx.exerciseDetails.contre_indications && progEx.exerciseDetails.contre_indications.length > 0 && (
                            <p className="text-xs text-destructive mt-2">Contre-indications: {progEx.exerciseDetails.contre_indications.join(', ')}</p>
                        )}
                         {/* Click prompt */}
                         <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-primary">
                             Voir détails <ArrowRight className="w-3 h-3" />
                         </div>
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
      <FeedbackForm
        programId={mockProgram.id}
        patientId={mockProgram.patient_id}
        onFeedbackSubmitted={handleFeedbackSubmitted} // Pass the handler
        />


      {/* Patient Chatbot Popup Trigger */}
      <PatientChatbotPopup patient={mockPatientData} /> {/* Pass patient data */}


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

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <ExerciseDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          exercise={selectedExercise}
        />
      )}
    </div>
  );
}
