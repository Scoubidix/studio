

'use client'; // Need client component for state, effects, event handlers

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs
import { Program, Exercise, ProgramExercise, Feedback, Patient, Kine, BlogPost, ShopProgram, ProgressTest, CertificationBadge } from "@/interfaces"; // Import needed interfaces
import FeedbackForm from '@/components/patient/feedback-form';
import PatientChatbotPopup from '@/components/patient/patient-chatbot';
import ExerciseDetailModal from '@/components/patient/exercise-detail-modal';
import MedicalReportSummarizer from '@/components/patient/medical-report-summarizer'; // Import new component
import BlogDisplay from '@/components/shared/blog-display'; // Import shared component
import ShopDisplay from '@/components/patient/shop-display'; // Import new component
import ProgressTestDisplay from '@/components/patient/progress-test-display'; // Import new component
import KineCertificationDisplay from '@/components/patient/kine-certification-display'; // Import new component
import Image from 'next/image';
import { Dumbbell, Activity, StretchVertical, Trophy, CalendarDays, ArrowRight, Target, Share2, BookOpen, Microscope, ShoppingBag, ClipboardCheck, Award, BarChart, MessageSquarePlus } from 'lucide-react'; // Added MessageSquarePlus
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

// --- Mock Data (Replace with actual data fetching later) ---
const mockExercises: Exercise[] = [
  { id: 'ex1', nom: 'Squat', description: 'Flexion des genoux et des hanches...', detailed_steps: ["Tenez-vous debout, pieds écartés à la largeur des épaules.", "Gardez le dos droit, la poitrine haute et les abdominaux engagés.", "Descendez comme si vous vous asseyiez sur une chaise, en gardant les genoux alignés avec les orteils.", "Remontez en poussant sur les talons."], niveau: 'débutant', catégorie: 'renforcement', image_url: 'https://picsum.photos/seed/squat/300/200' },
  { id: 'ex2', nom: 'Étirement Ischio-jambiers', description: 'Étirement des muscles postérieurs...', detailed_steps: ["Asseyez-vous au sol, une jambe tendue devant vous.", "Ramenez l'autre pied vers l'intérieur de la cuisse tendue.", "Penchez-vous doucement vers l'avant à partir des hanches, en gardant le dos droit.", "Maintenez la position pendant 30 secondes, puis changez de jambe."], niveau: 'intermédiaire', catégorie: 'étirement', image_url: 'https://picsum.photos/seed/hamstring/300/200' },
  { id: 'ex3', nom: 'Rotation Tronc Assis', description: 'Mobilisation de la colonne...', detailed_steps: ["Asseyez-vous droit sur une chaise, pieds à plat au sol.", "Placez une main sur le genou opposé et l'autre derrière vous sur la chaise.", "Tournez doucement le tronc vers l'arrière, en regardant par-dessus votre épaule.", "Maintenez brièvement, puis revenez lentement et changez de côté."], niveau: 'débutant', catégorie: 'mobilité', image_url: 'https://picsum.photos/seed/rotation/300/200' },
];

const mockProgram: Program = {
  id: 'prog123', patient_id: 'patientTest',
  liste_exercices: [
    { exercice_id: 'ex1', séries: 3, répétitions: 12 },
    { exercice_id: 'ex2', séries: 2, répétitions: 30 }, // Reps are seconds for stretching
    { exercice_id: 'ex3', séries: 3, répétitions: 10 },
  ],
  statut: 'actif', date_creation: new Date().toISOString(),
};

const mockPatientData: Patient = {
  id: 'patientTest', nom: 'Dupont', prénom: 'Jean', email: 'jean.dupont@email.com',
  date_naissance: '1985-03-15', pathologies: ['Lombalgie chronique'],
  remarques: 'Motivé mais craint la douleur.', kine_id: 'kineTest1',
  objectifs: ['Amélioration de la mobilité lombaire', 'Reprise progressive de la course à pied'],
  purchasedProgramIds: ['shopProg1'], // Example purchased program
  progressPoints: 1250, // Mock points
  pseudo: 'JeanD85', // Mock pseudo
};

const mockKineData: Kine = { // Mock data for the assigned Kine
    id: 'kineTest1', nom: 'Leroy', prénom: 'Sophie', email: 'sophie.leroy@kine.fr',
    spécialité: 'Sport',
    certifications: [ // Add mock certifications
        { id: 'cert1', name: 'Expert Rééducation Épaule', description: 'Formation avancée sur la rééducation de l\'épaule.', dateAwarded: '2023-05-15T00:00:00.000Z', icon: 'Award' },
        { id: 'cert2', name: 'Spécialiste Course à Pied', description: 'Certification en biomécanique et prévention des blessures du coureur.', dateAwarded: '2024-01-20T00:00:00.000Z', icon: 'Award' },
    ]
};

const mockBlogPosts: BlogPost[] = [
    { id: 'blog1', title: 'Comprendre la Lombalgie Chronique', summary: 'Un aperçu des causes et des approches de traitement pour les douleurs lombaires persistantes...', publishDate: '2024-07-15T00:00:00.000Z', tags: ['lombalgie', 'dos'], imageUrl: 'https://picsum.photos/seed/backpain/300/150' },
    { id: 'blog2', title: 'L\'importance de la Mobilité Articulaire', summary: 'Pourquoi maintenir une bonne mobilité est crucial pour prévenir les blessures et améliorer les performances...', publishDate: '2024-07-10T00:00:00.000Z', tags: ['mobilité', 'prévention'], imageUrl: 'https://picsum.photos/seed/mobility/300/150' },
];

const mockShopPrograms: ShopProgram[] = [
    { id: 'shopProg1', kine_id: 'kineTest2', title: 'Préparation Ski en 4 Semaines', description: 'Renforcez vos jambes et votre tronc pour dévaler les pentes en toute sécurité.', durationWeeks: 4, targetAudience: 'Skieurs', price: 29.99, currency: 'EUR', exerciseList: [], tags: ['ski', 'préparation', 'hiver'], imageUrl: 'https://picsum.photos/seed/ski/300/150' },
    { id: 'shopProg2', kine_id: 'kineTest1', title: 'Programme Anti-Mal de Dos (Bureau)', description: 'Exercices simples pour soulager les tensions liées à la position assise prolongée.', targetAudience: 'Travailleurs de bureau', price: 19.99, currency: 'EUR', exerciseList: [], tags: ['dos', 'bureau', 'sédentaire'], imageUrl: 'https://picsum.photos/seed/desk/300/150' },
];

const mockProgressTests: ProgressTest[] = [
    { id: 'test1', name: 'Test de Mobilité Lombaire', description: 'Évaluez l\'amplitude de vos mouvements lombaires.', instructions: ['Penchez-vous en avant...', 'Inclinez-vous sur les côtés...'], metrics: [{ name: 'Flexion Avant', unit: 'cm' }, { name: 'Inclinaison Droite', unit: 'cm' }], frequency: 'Toutes les 4 semaines', imageUrl: 'https://picsum.photos/seed/lumbar/300/150' },
    { id: 'test2', name: 'Test d\'Équilibre Unipodal', description: 'Mesurez votre stabilité sur une jambe.', instructions: ['Tenez-vous sur un pied...', 'Gardez les yeux ouverts...'], metrics: [{ name: 'Temps (yeux ouverts)', unit: 'sec' }, { name: 'Temps (yeux fermés)', unit: 'sec' }], frequency: 'Toutes les 2 semaines', imageUrl: 'https://picsum.photos/seed/balance/300/150' },
];

// Mock Leaderboard Data
const mockLeaderboard = [
    { pseudo: 'AlexR92', points: 1850, rank: 1 },
    { pseudo: 'RunnerGirl', points: 1500, rank: 2 },
    { pseudo: mockPatientData.pseudo, points: mockPatientData.progressPoints, rank: 3 }, // Current patient
    { pseudo: 'KneePro', points: 1100, rank: 4 },
    { pseudo: 'BackFlex', points: 950, rank: 5 },
];

// Mock Rewards Data
const mockRewards = [
    { pointsRequired: 1000, description: "5€ de réduction sur la boutique", claimed: true }, // Example claimed
    { pointsRequired: 2500, description: "15€ de réduction sur la boutique", claimed: false },
    { pointsRequired: 5000, description: "Programme au choix offert", claimed: false },
];


const getExerciseDetails = (exerciseId: string): Exercise | undefined => mockExercises.find(ex => ex.id === exerciseId);
const populatedProgramExercises: ProgramExercise[] = mockProgram.liste_exercices.map(progEx => ({ ...progEx, exerciseDetails: getExerciseDetails(progEx.exercice_id) }));
const motivationalQuotes = [ "Chaque petit pas compte.", "La persévérance est la clé."];

const getCategoryIcon = (category: Exercise['catégorie']) => {
  switch (category) {
    case 'renforcement': return <Dumbbell className="w-5 h-5 text-primary" />;
    case 'mobilité': return <Activity className="w-5 h-5 text-accent" />;
    case 'étirement': return <StretchVertical className="w-5 h-5 text-secondary-foreground" />;
    default: return null;
  }
};
// --- End Mock Data ---

export default function PatientDashboard() {
  const [currentDate, setCurrentDate] = useState('');
  const [motivationalQuote, setMotivationalQuote] = useState('');
  const [sessionStreak, setSessionStreak] = useState(3);
  const [totalSessions, setTotalSessions] = useState(15);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [patientGoals, setPatientGoals] = useState<string[]>(mockPatientData.objectifs);
  const [kineCertifications, setKineCertifications] = useState<CertificationBadge[]>(mockKineData.certifications || []); // State for certifications
  const [currentPoints, setCurrentPoints] = useState(mockPatientData.progressPoints || 0); // Gamification points
  const { toast } = useToast();

  useEffect(() => {
    const today = new Date();
    setCurrentDate(format(today, "EEEE d MMMM yyyy", { locale: fr }));
    setMotivationalQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    // TODO: Fetch real data
  }, []);

  const handleFeedbackSubmitted = () => {
    setSessionStreak(prev => prev + 1);
    setTotalSessions(prev => prev + 1);
    // Simulate earning points for feedback
    const pointsEarned = 50;
    setCurrentPoints(prev => prev + pointsEarned);
    setMotivationalQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    toast({ title: "Feedback envoyé !", description: `Vous avez gagné ${pointsEarned} points !`});
    console.log("Gamification state updated (simulated)");
  };

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsDetailModalOpen(true);
  };

  const handleShareClick = () => {
    const text = `J'ai complété ${totalSessions} séances avec Mon Assistant Kiné ! Objectif : ${patientGoals.join(', ')}`;
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: 'Mon Assistant Kiné Progrès', text, url })
        .then(() => toast({ title: "Partagé !" }))
        .catch((error) => {
            console.error('Error sharing:', error);
            navigator.clipboard.writeText(`${text} - ${url}`);
            toast({ title: "Lien copié !", description: "Le lien a été copié." });
        });
    } else {
      navigator.clipboard.writeText(`${text} - ${url}`);
      toast({ title: "Lien copié !", description: "Le lien a été copié." });
    }
  };

  const handlePurchase = (program: ShopProgram) => {
      // Simulate purchase
      console.log("Purchasing program:", program.title);
      toast({ title: "Achat simulé", description: `Programme "${program.title}" ajouté à vos programmes.`});
      // TODO: Add logic to update patient's purchased programs and possibly activate it.
  };

  const handleTestSubmit = (testId: string, results: any) => {
      console.log("Submitting test results for:", testId, results);
      // Simulate earning points for test submission
      const pointsEarned = 100;
      setCurrentPoints(prev => prev + pointsEarned);
      toast({ title: "Résultats enregistrés !", description: `Vos résultats de test ont été sauvegardés. Vous avez gagné ${pointsEarned} points !`});
      // TODO: Save results to Firestore
  };

  const handleClaimReward = (rewardDescription: string) => {
      // Simulate claiming reward
      console.log("Claiming reward:", rewardDescription);
      toast({ title: "Récompense réclamée !", description: `Code promo pour "${rewardDescription}" simulé.`});
      // TODO: Add logic to mark reward as claimed and potentially deduct points or generate code
  };


  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6 p-4 bg-card rounded-lg shadow-sm border">
           <div className="space-y-2">
               <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                   <CalendarDays className="w-5 h-5 text-primary"/>
                   <span className="capitalize">{currentDate}</span>
               </div>
               <p className="text-sm text-muted-foreground italic">"{motivationalQuote}"</p>
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
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                 <div className="flex items-center gap-4"> {/* Container for trophy and share */}
                     <div className="text-right">
                         <div className="flex items-center gap-2 justify-end">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            <span className="font-semibold">{sessionStreak}</span>
                            <span className="text-sm text-muted-foreground">jrs suite</span>
                         </div>
                         <p className="text-xs text-muted-foreground mt-1">{totalSessions} séances complétées</p>
                          {/* Display Current Points */}
                         <p className="text-xs text-muted-foreground mt-1 font-medium">{currentPoints} points</p>
                     </div>
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
                 {/* Kine Certifications Display */}
                  <KineCertificationDisplay certifications={kineCertifications} kineName={`${mockKineData.prénom} ${mockKineData.nom}`} />
            </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="programme" className="w-full">
        {/* Updated TabsList for 5 items */}
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 mb-6">
          <TabsTrigger value="programme"><Dumbbell className="w-4 h-4 mr-1 md:mr-2"/>Programme</TabsTrigger>
          <TabsTrigger value="tests"><Activity className="w-4 h-4 mr-1 md:mr-2"/>Tests Prog.</TabsTrigger>
          <TabsTrigger value="blog"><BookOpen className="w-4 h-4 mr-1 md:mr-2"/>Infos</TabsTrigger>
          <TabsTrigger value="rapports"><Microscope className="w-4 h-4 mr-1 md:mr-2"/>Rapports</TabsTrigger>
          <TabsTrigger value="boutique"><ShoppingBag className="w-4 h-4 mr-1 md:mr-2"/>Boutique</TabsTrigger>
        </TabsList>

        {/* Programme Tab with Feedback Form */}
        <TabsContent value="programme" className="space-y-8">
            <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Votre Programme d'Exercices</CardTitle>
              <CardDescription>Suivez les exercices prescrits. Cliquez pour voir les détails. Statut : <span className="font-semibold capitalize">{mockProgram.statut}</span></CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {populatedProgramExercises.length > 0 ? (
                populatedProgramExercises.map((progEx, index) => (
                  progEx.exerciseDetails ? (
                    <div key={progEx.exercice_id}>
                      <Card
                        className="overflow-hidden border border-border/60 bg-card/80 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group"
                        onClick={() => handleExerciseClick(progEx.exerciseDetails!)} role="button" tabIndex={0}
                        aria-label={`Détails: ${progEx.exerciseDetails.nom}`}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleExerciseClick(progEx.exerciseDetails!)}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {progEx.exerciseDetails.image_url && (
                            <div className="relative md:col-span-1 h-40 md:h-full">
                              <Image src={progEx.exerciseDetails.image_url} alt={progEx.exerciseDetails.nom} fill style={{ objectFit: 'cover' }} className="rounded-l-lg" unoptimized />
                            </div>
                          )}
                           <div className={`p-4 ${progEx.exerciseDetails.image_url ? 'md:col-span-2' : 'md:col-span-3'} relative`}>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-semibold">{index + 1}. {progEx.exerciseDetails.nom}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground capitalize">
                                    {getCategoryIcon(progEx.exerciseDetails.catégorie)} {progEx.exerciseDetails.catégorie}
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{progEx.exerciseDetails.description}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm mb-4">
                              <span>Séries: {progEx.séries}</span>
                              <span>Répétitions: {progEx.répétitions} {progEx.exerciseDetails.catégorie === 'étirement' ? 'sec' : ''}</span>
                              <span className="capitalize">Niveau: {progEx.exerciseDetails.niveau}</span>
                            </div>
                            {progEx.exerciseDetails.contre_indications && progEx.exerciseDetails.contre_indications.length > 0 && (
                                <p className="text-xs text-destructive mt-2">Contre-indications: {progEx.exerciseDetails.contre_indications.join(', ')}</p>
                            )}
                             <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-primary">
                                 Voir détails <ArrowRight className="w-3 h-3" />
                             </div>
                          </div>
                        </div>
                      </Card>
                      {index < populatedProgramExercises.length - 1 && <Separator className="my-6" />}
                    </div>
                  ) : <p key={progEx.exercice_id}>Détails exercice {progEx.exercice_id} non trouvés.</p>
                ))
              ) : <p className="text-muted-foreground">Aucun programme actif.</p>}
            </CardContent>
            </Card>

            {/* Feedback Form moved here */}
             <FeedbackForm
                programId={mockProgram.id}
                patientId={mockProgram.patient_id}
                onFeedbackSubmitted={handleFeedbackSubmitted}
            />
        </TabsContent>

         {/* Progress Tests Tab with Leaderboard/Rewards */}
        <TabsContent value="tests" className="space-y-8">
            <ProgressTestDisplay
                tests={mockProgressTests}
                patientId={mockPatientData.id}
                onSubmit={handleTestSubmit}
            />
             {/* Leaderboard and Rewards Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Leaderboard Card */}
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BarChart className="w-5 h-5 text-primary" /> Classement des Tests</CardTitle>
                        <CardDescription>Comparez vos points avec d'autres patients.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {mockLeaderboard.length > 0 ? (
                            <ol className="space-y-2">
                                {mockLeaderboard.slice(0, 5).map(entry => ( // Show top 5
                                    <li key={entry.pseudo} className={`flex justify-between items-center p-2 rounded-md text-sm ${entry.pseudo === mockPatientData.pseudo ? 'bg-accent/20 border border-accent' : ''}`}>
                                        <span className="flex items-center gap-2">
                                            <span className="font-bold w-6 text-center">{entry.rank}.</span>
                                            <span>{entry.pseudo}</span>
                                        </span>
                                        <span className="font-semibold">{entry.points} pts</span>
                                    </li>
                                ))}
                            </ol>
                        ) : (
                             <p className="text-muted-foreground text-center">Le classement sera bientôt disponible.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Rewards Card */}
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> Récompenses</CardTitle>
                        <CardDescription>Utilisez vos points pour obtenir des réductions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="space-y-3">
                            {mockRewards.map((reward, index) => (
                                <div key={index} className="flex justify-between items-center p-3 border rounded-md bg-muted/30">
                                    <div className="flex-grow mr-4">
                                        <p className="font-medium">{reward.description}</p>
                                        <p className="text-xs text-muted-foreground">{reward.pointsRequired} points requis</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="text-xs h-7"
                                        variant={reward.claimed ? "outline" : "default"}
                                        disabled={currentPoints < reward.pointsRequired || reward.claimed}
                                        onClick={() => handleClaimReward(reward.description)}
                                    >
                                        {reward.claimed ? 'Réclamé' : (currentPoints >= reward.pointsRequired ? 'Réclamer' : 'Points insuf.')}
                                    </Button>
                                </div>
                            ))}
                         </div>
                    </CardContent>
                </Card>

            </div>
        </TabsContent>

        {/* Blog/Info Tab */}
        <TabsContent value="blog">
             <BlogDisplay posts={mockBlogPosts} />
        </TabsContent>

        {/* Medical Reports Tab */}
        <TabsContent value="rapports">
            <MedicalReportSummarizer />
        </TabsContent>

        {/* Shop Tab */}
        <TabsContent value="boutique">
            <ShopDisplay
                programs={mockShopPrograms}
                onPurchase={handlePurchase}
                purchasedProgramIds={mockPatientData.purchasedProgramIds || []}
            />
        </TabsContent>
      </Tabs>


      {/* Patient Chatbot Popup Trigger */}
      {mockPatientData && <PatientChatbotPopup patient={mockPatientData} />}

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
