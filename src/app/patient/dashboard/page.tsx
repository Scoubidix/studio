

'use client'; // Need client component for state, effects, event handlers

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs
import { Program, Exercise, ProgramExercise, Feedback, Patient, Kine, BlogPost, ShopProgram, ProgressTest, CertificationBadge, PatientBadge } from "@/interfaces"; // Import needed interfaces
import FeedbackForm from '@/components/patient/feedback-form';
import PatientChatbot from '@/components/patient/patient-chatbot'; // Renamed import
import ExerciseDetailModal from '@/components/patient/exercise-detail-modal';
import MedicalReportSummarizer from '@/components/patient/medical-report-summarizer'; // Import new component
import BlogDisplay from '@/components/shared/blog-display'; // Import shared component
import ShopDisplay from '@/components/patient/shop-display'; // Import new component
import ProgressTestDisplay from '@/components/patient/progress-test-display'; // Import new component
import KineCertificationDisplay from '@/components/patient/kine-certification-display'; // Import new component
import PatientBadgesDisplay from '@/components/patient/patient-badges-display'; // Import new component
import Image from 'next/image';
import { Dumbbell, Activity, StretchVertical, Trophy, CalendarDays, ArrowRight, Target, Share2, BookOpen, Microscope, ShoppingBag, ClipboardCheck, Award, BarChart, Bot, Medal, Edit, Brain, Info, ListChecks, HelpCircle } from 'lucide-react'; // Added Bot, Medal, Edit, Brain, Info, ListChecks, HelpCircle
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import AddBlogPostForm from '@/components/kine/add-blog-post-form'; // Import placeholder
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert

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

// Mock Patient Badges
const mockPatientBadges: PatientBadge[] = [
    { id: 'pbadge1', name: 'Sérieux Confirmé', description: "10 séances complétées d'affilée !", dateAwarded: '2024-07-22T00:00:00.000Z', icon: 'Medal'},
    { id: 'pbadge2', name: 'Pro du Feedback', description: "5 feedbacks détaillés envoyés !", dateAwarded: '2024-07-18T00:00:00.000Z', icon: 'Medal'},
];


const mockPatientData: Patient = {
  id: 'patientTest', nom: 'Dupont', prénom: 'Jean', email: 'jean.dupont@email.com',
  date_naissance: '1985-03-15', pathologies: ['Lombalgie chronique'],
  remarques: 'Motivé mais craint la douleur.', kine_id: 'kineTest1',
  objectifs: ['Amélioration de la mobilité lombaire', 'Reprise progressive de la course à pied'],
  purchasedProgramIds: ['shopProg1'], // Example purchased program
  progressPoints: 1250, // Mock points
  pseudo: 'JeanD85', // Mock pseudo
  adherenceRatingByKine: 85, // Mock adherence rating
  badges: mockPatientBadges, // Assign mock badges
};

// Mock data for Kines, including the one assigned to the patient and potential shop creators
const mockKines: Kine[] = [
    {
        id: 'kineTest1', nom: 'Leroy', prénom: 'Sophie', email: 'sophie.leroy@kine.fr',
        spécialité: 'Sport', ville: 'Paris',
        certifications: [
            { id: 'cert1', name: 'Expert Rééducation Épaule', description: 'Formation avancée sur la rééducation de l\'épaule.', dateAwarded: '2023-05-15T00:00:00.000Z', icon: 'Award' },
            { id: 'cert2', name: 'Spécialiste Course à Pied', description: 'Certification en biomécanique et prévention des blessures du coureur.', dateAwarded: '2024-01-20T00:00:00.000Z', icon: 'Award' },
             { id: 'cert_shop', name: 'Créateur Marketplace', description: 'A publié des programmes sur la marketplace.', dateAwarded: '2024-07-25T00:00:00.000Z', icon: 'Award' }, // Added badge for shop
             { id: 'superkine1', name: 'SuperKiné 2024', description: 'Excellente satisfaction patient et utilisation de l\'outil.', dateAwarded: '2024-08-01T00:00:00.000Z', icon: 'Award', isSuperKineBadge: true }, // SuperKiné badge example
        ],
        progressPoints: 1500,
    },
    {
        id: 'kineTest2', nom: 'Dubois', prénom: 'Alain', email: 'alain.dubois@kine.fr',
        spécialité: 'Pédiatrie', ville: 'Lyon',
        certifications: [
            { id: 'cert3', name: 'Kiné Pédiatrique Certifié', description: 'Certification en kinésithérapie pédiatrique.', dateAwarded: '2022-11-01T00:00:00.000Z', icon: 'Award' },
        ],
        progressPoints: 700,
    }
];

const mockKineData = mockKines.find(k => k.id === mockPatientData.kine_id)!; // Get the specific kine for the patient

const mockBlogPosts: BlogPost[] = [
    { id: 'blog1', title: 'Comprendre la Lombalgie Chronique', summary: 'Un aperçu des causes et des approches de traitement pour les douleurs lombaires persistantes...', publishDate: '2024-07-15T00:00:00.000Z', tags: ['lombalgie', 'dos'], imageUrl: 'https://picsum.photos/seed/backpain/300/150' },
    { id: 'blog2', title: 'L\'importance de la Mobilité Articulaire', summary: 'Pourquoi maintenir une bonne mobilité est crucial pour prévenir les blessures et améliorer les performances...', publishDate: '2024-07-10T00:00:00.000Z', tags: ['mobilité', 'prévention'], imageUrl: 'https://picsum.photos/seed/mobility/300/150' },
];

// Updated Shop Programs with rating and reviews
const mockShopPrograms: ShopProgram[] = [
    {
        id: 'shopProg1', kine_id: 'kineTest2', title: 'Préparation Ski en 4 Semaines', description: 'Renforcez vos jambes et votre tronc pour dévaler les pentes en toute sécurité.',
        durationWeeks: 4, targetAudience: ['Skieurs'], price: 29.99, currency: 'EUR', exerciseList: [], tags: ['ski', 'préparation', 'hiver'],
        imageUrl: 'https://picsum.photos/seed/ski/300/150',
        rating: 4.5, // Added rating
        reviews: [ // Added reviews
            { id: 'rev1', reviewerName: 'JeanD85', rating: 5, comment: 'Super programme, très complet !', date: '2024-07-20T00:00:00.000Z'},
            { id: 'rev2', reviewerName: 'ClaireM', rating: 4, comment: 'Bonne préparation, peut-être un peu intense au début.', date: '2024-07-18T00:00:00.000Z'},
        ]
    },
    {
        id: 'shopProg2', kine_id: 'kineTest1', title: 'Programme Anti-Mal de Dos (Bureau)', description: 'Exercices simples pour soulager les tensions liées à la position assise prolongée.',
        targetAudience: ['Travailleurs de bureau'], price: 19.99, currency: 'EUR', exerciseList: [], tags: ['dos', 'bureau', 'sédentaire'],
        imageUrl: 'https://picsum.photos/seed/desk/300/150',
        rating: 4.8, // Added rating
        reviews: [ // Added reviews
            { id: 'rev3', reviewerName: 'LucP', rating: 5, comment: 'Très efficace pour mes douleurs de dos.', date: '2024-07-22T00:00:00.000Z'},
        ]
    },
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
const motivationalQuotes = [ "Chaque petit pas compte.", "La persévérance est la clé."]; // Corrected: No ellipsis inside quotes

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
  const [patientBadges, setPatientBadges] = useState<PatientBadge[]>(mockPatientData.badges || []); // State for patient badges
  const [currentPoints, setCurrentPoints] = useState(mockPatientData.progressPoints || 0); // Gamification points
  const { toast } = useToast();

  useEffect(() => {
    const today = new Date();
    setCurrentDate(format(today, "EEEE d MMMM yyyy", { locale: fr }));
    setMotivationalQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    // TODO: Fetch real data for patient, kine, program, etc.
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
    // Simulate earning a badge
    if (totalSessions + 1 === 16 && !patientBadges.some(b => b.id === 'pbadge_16sessions')) {
        const newBadge: PatientBadge = { id: 'pbadge_16sessions', name: 'Persévérance Paye', description: '16 séances complétées !', dateAwarded: new Date().toISOString(), icon: 'Medal' };
        setPatientBadges(prev => [...prev, newBadge]);
        toast({ title: "Badge Débloqué !", description: `Nouveau badge : ${newBadge.name}` });
    }
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
           <div className="space-y-2 flex-grow"> {/* Added flex-grow */}
               <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                   <CalendarDays className="w-5 h-5 text-primary"/>
                   <span className="capitalize">{currentDate}</span>
               </div>
               {/* Increased font size and italics for motivational quote */}
               <p className="text-lg text-muted-foreground italic">"{motivationalQuote}"</p>
               {patientGoals.length > 0 && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground pt-1">
                       <Target className="w-4 h-4 mt-0.5 text-accent flex-shrink-0"/>
                       <div>
                          <span className="font-medium text-foreground/90">Vos objectifs :</span>{' '}
                          {patientGoals.join(', ')}
                       </div>
                  </div>
               )}
                {/* Adherence Rating Display */}
                {mockPatientData.adherenceRatingByKine !== undefined && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground pt-1">
                        <Activity className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <div>
                           <span className="font-medium text-foreground/90">Adhérence (selon kiné) :</span>{' '}
                           {mockPatientData.adherenceRatingByKine}%
                        </div>
                    </div>
                 )}
           </div>
            <div className="flex flex-col items-end gap-4 flex-shrink-0"> {/* Increased gap */}
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
                 {/* Patient Badges Display */}
                 <PatientBadgesDisplay badges={patientBadges} />
                 {/* Kine Certifications Display (shows Kine's badges including SuperKine) */}
                 <KineCertificationDisplay certifications={kineCertifications} kineName={`${mockKineData.prénom} ${mockKineData.nom}`} />
            </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="chatbot" className="w-full">
        {/* Updated TabsList to include Chatbot first and highlighted */}
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 mb-6">
           {/* Highlighted Chatbot Tab */}
           <TabsTrigger value="chatbot" className="bg-primary/10 text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Bot className="w-4 h-4 mr-1 md:mr-2"/>Assistant
           </TabsTrigger>
          <TabsTrigger value="programme"><ListChecks className="w-4 h-4 mr-1 md:mr-2"/>Programme</TabsTrigger> {/* Updated Icon */}
          <TabsTrigger value="tests"><Activity className="w-4 h-4 mr-1 md:mr-2"/>Tests Prog.</TabsTrigger>
          <TabsTrigger value="blog"><BookOpen className="w-4 h-4 mr-1 md:mr-2"/>Infos</TabsTrigger>
          <TabsTrigger value="rapports"><Microscope className="w-4 h-4 mr-1 md:mr-2"/>Rapports</TabsTrigger>
          <TabsTrigger value="boutique"><ShoppingBag className="w-4 h-4 mr-1 md:mr-2"/>Boutique</TabsTrigger>
        </TabsList>

         {/* Patient Chatbot Tab */}
        <TabsContent value="chatbot" className="space-y-6">
            {/* Moved Alert here */}
            <Alert variant="default" className="border-primary bg-primary/5 dark:bg-primary/20">
                <Info className="h-4 w-4 !text-primary" />
                <AlertTitle className="ml-6 text-primary">Un assistant à votre service</AlertTitle>
                <AlertDescription className="ml-6 text-primary/90 text-xs">
                    Cet assistant est là pour vous guider ! Il connaît <span className='font-semibold'>votre programme spécifique</span>, vos <span className='font-semibold'>objectifs personnels</span> et est <span className='font-semibold'>personnalisé grâce aux conseils spécifiques de votre kiné</span>. Il agit comme l'assistant de votre thérapeute, connaissant ses recommandations pour vous. N'hésitez pas à lui poser des questions sur un exercice, une douleur ressentie (sans demander de diagnostic médical), ou si vous avez un doute. S'il ne peut pas répondre, il vous proposera de <span className='font-semibold'>contacter directement votre kiné</span>.
                </AlertDescription>
            </Alert>
           {mockPatientData ? (
                <PatientChatbot patient={mockPatientData} />
           ) : (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    Chargement des informations patient...
                  </CardContent>
                </Card>
           )}
        </TabsContent>

        {/* Programme Tab with Feedback Form */}
        <TabsContent value="programme" className="space-y-8">
            {/* Added Alert */}
             <Alert variant="default" className="border-primary bg-primary/5 dark:bg-primary/20">
                 <ListChecks className="h-4 w-4 !text-primary" />
                 <AlertTitle className="ml-6 text-primary">Votre Feuille de Route Personnalisée</AlertTitle>
                 <AlertDescription className="ml-6 text-primary/90 text-xs">
                     Suivez les exercices prescrits par votre kiné. Cliquez sur chaque exercice pour voir les <span className='font-semibold'>détails et instructions</span>. N'oubliez pas de remplir le <span className='font-semibold'>feedback</span> après chaque séance pour aider votre kiné à adapter au mieux votre programme.
                 </AlertDescription>
             </Alert>
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
             {/* Added Alert */}
             <Alert variant="default" className="border-primary bg-primary/5 dark:bg-primary/20">
                 <Activity className="h-4 w-4 !text-primary" />
                 <AlertTitle className="ml-6 text-primary">Évaluez et Suivez vos Progrès</AlertTitle>
                 <AlertDescription className="ml-6 text-primary/90 text-xs">
                     Réalisez régulièrement les tests proposés par votre kiné pour <span className='font-semibold'>mesurer objectivement votre évolution</span>. Vos résultats sont enregistrés et vous rapportent des points. Comparez-vous (anonymement) aux autres patients via le classement et débloquez des <span className='font-semibold'>récompenses</span> !
                 </AlertDescription>
             </Alert>
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
        <TabsContent value="blog" className="space-y-6">
            {/* Added Alert */}
            <Alert variant="default" className="border-primary bg-primary/5 dark:bg-primary/20">
                <BookOpen className="h-4 w-4 !text-primary" />
                <AlertTitle className="ml-6 text-primary">Informez-vous sur votre Santé</AlertTitle>
                <AlertDescription className="ml-6 text-primary/90 text-xs">
                    Consultez des articles et des résumés vulgarisés sur diverses pathologies et conseils de santé, rédigés ou validés par des professionnels. Comprendre votre condition est une étape clé de votre rééducation.
                </AlertDescription>
            </Alert>
             <BlogDisplay
                 posts={mockBlogPosts}
                 title="Infos & Conseils Santé"
                 description="Articles vulgarisés pour mieux comprendre votre corps et votre rééducation."
             />
        </TabsContent>

        {/* Medical Reports Tab */}
        <TabsContent value="rapports" className="space-y-6">
             {/* Added Alert */}
             <Alert variant="default" className="border-primary bg-primary/5 dark:bg-primary/20">
                 <Microscope className="h-4 w-4 !text-primary" />
                 <AlertTitle className="ml-6 text-primary">Décryptez vos Comptes Rendus</AlertTitle>
                 <AlertDescription className="ml-6 text-primary/90 text-xs">
                     Parfois difficiles à comprendre, collez ici le texte de vos comptes rendus médicaux (radio, IRM...). L'IA vous proposera un <span className='font-semibold'>résumé simplifié</span> pour vous aider à saisir les points essentiels. <strong className="block mt-1">Important :</strong> ce résumé ne remplace en aucun cas l'avis et l'interprétation de votre médecin ou de votre kiné.
                 </AlertDescription>
             </Alert>
            <MedicalReportSummarizer />
        </TabsContent>

        {/* Shop Tab */}
        <TabsContent value="boutique" className="space-y-6">
             {/* Added Alert */}
             <Alert variant="default" className="border-primary bg-primary/5 dark:bg-primary/20">
                 <ShoppingBag className="h-4 w-4 !text-primary" />
                 <AlertTitle className="ml-6 text-primary">Boutique de Programmes Experts</AlertTitle>
                 <AlertDescription className="ml-6 text-primary/90 text-xs">
                     Explorez des programmes conçus par des kinésithérapeutes pour des objectifs spécifiques (préparation sportive, prévention...). Consultez les <span className='font-semibold'>avis</span>, vérifiez les <span className='font-semibold'>badges</span> du créateur et trouvez le programme complémentaire idéal pour vous.
                 </AlertDescription>
             </Alert>
            <ShopDisplay
                programs={mockShopPrograms}
                allKines={mockKines} // Pass the list of all kines
                onPurchase={handlePurchase}
                purchasedProgramIds={mockPatientData.purchasedProgramIds || []}
            />
        </TabsContent>
      </Tabs>


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
