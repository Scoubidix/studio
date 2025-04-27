

// @refresh reset - Prevent error during compilation
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs
import PatientSelector from '@/components/kine/patient-selector';
import PatientInfoForm from '@/components/kine/patient-info-form';
import PatientFeedbackDisplay from '@/components/kine/patient-feedback-display';
import NotificationArea from '@/components/kine/notification-area';
import AddPatientModal from '@/components/kine/add-patient-modal';
import MarketplaceManager from '@/components/kine/marketplace-manager'; // Import new component
import BlogDisplay from '@/components/shared/blog-display'; // Import shared BlogDisplay
import KineCertificationManager from '@/components/kine/kine-certification-manager'; // Import new component
import KineChatbot from '@/components/kine/kine-chatbot'; // Import KineChatbot
import KineCollaborationHub from '@/components/kine/kine-collaboration-hub'; // Import new component
import KineReputationDisplay from '@/components/kine/kine-reputation-display'; // Import new component
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Patient, Kine, Feedback, MessageToKine, ShopProgram, BlogPost, RehabProtocol, CertificationBadge } from '@/interfaces';
import { mockFeedbacks } from '@/components/kine/mock-data';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, CalendarDays, BellRing, UserCheck, BookOpen, Store, Award, ChevronDown, ChevronUp, Bot, Share2, Star, Trophy, Users, BarChart3, Crown } from 'lucide-react'; // Import new icons, removed Layers
import { format, differenceInDays, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import KineCertificationDisplay from '@/components/patient/kine-certification-display'; // Import display component (can reuse)

// --- Mock Data (Initial Data - now managed by state) ---
const initialMockKine: Kine = {
    id: 'kineTest1', nom: 'Leroy', prénom: 'Sophie', email: 'sophie.leroy@kine.fr', spécialité: 'Sport', ville: 'Paris',
    progressPoints: 850, // Add mock points for Kine
    certifications: [ // Add mock certifications with pointsRequired
        { id: 'cert1', name: 'Expert Rééducation Épaule', description: 'Formation avancée sur la rééducation de l\'épaule.', dateAwarded: '2023-05-15T00:00:00.000Z', icon: 'Award', pointsRequired: 1000 },
        { id: 'cert2', name: 'Spécialiste Course à Pied', description: 'Certification en biomécanique et prévention des blessures du coureur.', dateAwarded: '2024-01-20T00:00:00.000Z', icon: 'Award', pointsRequired: 2500 },
        { id: 'cert3', name: 'Contributeur Blog Pro', description: 'A rédigé des articles pour le blog professionnel.', dateAwarded: '2024-07-10T00:00:00.000Z', icon: 'Award', pointsRequired: 500 }, // Example activity badge
        { id: 'superkine1', name: 'SuperKiné 2024', description: 'Excellente satisfaction patient et utilisation de l\'outil.', dateAwarded: '2024-08-01T00:00:00.000Z', icon: 'Crown', isSuperKineBadge: true }, // SuperKiné badge example
    ]
};

// Mock next badge threshold (find the lowest points required for an unearned badge)
const findNextBadge = (kine: Kine | null): CertificationBadge | null => {
    if (!kine || !kine.certifications) return null;
    const earnedIds = kine.certifications.map(c => c.id);
    const unearnedBadges = mockAvailableBadges.filter(b => !earnedIds.includes(b.id) && b.pointsRequired);
    if (unearnedBadges.length === 0) return null;
    unearnedBadges.sort((a, b) => (a.pointsRequired || Infinity) - (b.pointsRequired || Infinity));
    return unearnedBadges[0];
};

// Assume a list of all possible badges exists somewhere
const mockAvailableBadges: CertificationBadge[] = [
    ...(initialMockKine.certifications || []), // Include earned ones
    { id: 'cert4', name: 'Créateur Marketplace', description: 'A publié son premier programme sur la marketplace.', dateAwarded: '', pointsRequired: 1500 },
    { id: 'cert5', name: 'Mentor Patient', description: 'A suivi plus de 10 patients actifs simultanément.', dateAwarded: '', pointsRequired: 3000 },
];


const initialMockPatients: Patient[] = [
    { id: 'patientTest', nom: 'Dupont', prénom: 'Jean', email: 'jean.dupont@email.com', date_naissance: '1985-03-15', pathologies: ['Lombalgie chronique', 'Tendinopathie épaule droite'], remarques: 'Motivé mais craint la douleur.', kine_id: 'kineTest1', objectifs: ['Amélioration de la mobilité lombaire', 'Reprise progressive de la course à pied'], subscriptionEndDate: new Date(Date.now() + 86400000 * 10).toISOString(), subscriptionStatus: 'active', adherenceRatingByKine: 85, pseudo: 'JeanD85' },
    { id: 'patientTest2', nom: 'Martin', prénom: 'Claire', email: 'claire.martin@email.com', date_naissance: '1992-07-22', pathologies: ['Entorse cheville gauche (récente)'], remarques: 'Sportive (Volley), veut reprendre rapidement.', kine_id: 'kineTest1', objectifs: ['Récupération complète mobilité cheville', 'Renforcement musculaire préventif'], subscriptionEndDate: new Date(Date.now() + 86400000 * 5).toISOString(), subscriptionStatus: 'active', adherenceRatingByKine: 95, pseudo: 'ClaireM' },
    { id: 'patientTest3', nom: 'Petit', prénom: 'Lucas', email: 'lucas.petit@email.com', date_naissance: '2005-11-10', pathologies: ['Syndrome rotulien genou droit'], remarques: 'Jeune footballeur, en pleine croissance.', kine_id: 'kineTest1', objectifs: ['Diminution douleur pendant effort', 'Correction posture/gestuelle'], subscriptionEndDate: new Date(Date.now() - 86400000 * 2).toISOString(), subscriptionStatus: 'expired', adherenceRatingByKine: 70, pseudo: 'LucasP' },
    { id: 'patientTest4', nom: 'Dubois', prénom: 'Marie', email: 'marie.dubois@email.com', date_naissance: '1978-12-01', pathologies: ['Arthrose cervicale'], remarques: 'Sédentaire, cherche à soulager les douleurs.', kine_id: 'kineTest1', objectifs: ['Augmenter la mobilité cervicale', 'Réduire les céphalées de tension'], subscriptionEndDate: new Date(Date.now() + 86400000 * 45).toISOString(), subscriptionStatus: 'active', adherenceRatingByKine: 90, pseudo: 'MarieD' },
];

const mockMessages: MessageToKine[] = [
    { id: 'msg1', patient_id: 'patientTest', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), original_question: "Mon genou craque beaucoup pendant les squats, est-ce normal ?", message: "Bonjour, j'ai demandé au chatbot ...", status: 'unread' },
    { id: 'msg2', patient_id: 'patientTest3', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), original_question: "Puis-je remplacer l'exercice X par l'exercice Y ?", message: "Bonjour, j'ai demandé au chatbot ...", status: 'unread' },
    { id: 'msg3', patient_id: 'patientTest2', timestamp: new Date(Date.now() - 86400000 * 4).toISOString(), original_question: "Où acheter un bon tapis de sol ?", message: "Bonjour, le chatbot ne savait pas...", status: 'read' }
];

// Mock data for new Kine features
const mockKineShopPrograms: ShopProgram[] = [
    { id: 'shopProg2', kine_id: 'kineTest1', title: 'Programme Anti-Mal de Dos (Bureau)', description: 'Exercices simples pour soulager les tensions...', targetAudience: 'Travailleurs de bureau', price: 19.99, currency: 'EUR', exerciseList: [], tags: ['dos', 'bureau'], imageUrl: 'https://picsum.photos/seed/desk/300/150' },
];

// Mock Blog posts for Kine (Scientific summaries)
const mockKineBlogPosts: BlogPost[] = [
     { id: 'kblog1', title: 'Optimiser la Récupération Post-Op LCA', summary: 'Points clés et dernières recommandations pour la rééducation après une ligamentoplastie du LCA. Inclut revue de littérature sur protocoles accélérés vs conservateurs.', publishDate: '2024-07-20T00:00:00.000Z', tags: ['LCA', 'genou', 'post-op', 'evidence-based'], author: 'Dr. Sophie Leroy', contentUrl: '#', imageUrl: 'https://picsum.photos/seed/lca-science/300/150' },
     { id: 'kblog2', title: 'Tendinopathies d\'Achille : Approches Thérapeutiques Actuelles', summary: 'Synthèse des données sur la prise en charge des tendinopathies achilléennes, focus sur les exercices excentriques, ondes de choc et thérapie manuelle.', publishDate: '2024-07-18T00:00:00.000Z', tags: ['tendinopathie', 'achille', 'rééducation', 'evidence-based'], author: 'Dr. Alain Dubois', contentUrl: '#', imageUrl: 'https://picsum.photos/seed/achilles/300/150' },
     { id: 'kblog3', title: 'Syndrome Douloureux Fémoro-Patellaire : Diagnostic et Traitement', summary: 'Critères diagnostiques et revue des interventions efficaces (renforcement quadricipital et fessier, taping, orthèses plantaires).', publishDate: '2024-06-10T00:00:00.000Z', tags: ['genou', 'SDFP', 'syndrome rotulien', 'diagnostic', 'traitement'], author: 'Dr. Sophie Leroy', contentUrl: '#', imageUrl: 'https://picsum.photos/seed/pfps/300/150' },
];

// Mock other Kines for collaboration examples
const mockOtherKines: Kine[] = [
    { id: 'kineTest2', nom: 'Dubois', prénom: 'Alain', email: 'alain.dubois@kine.fr', spécialité: 'Pédiatrie', ville: 'Paris' },
    { id: 'kineTest3', nom: 'Garcia', prénom: 'Maria', email: 'maria.garcia@kine.fr', spécialité: 'Neurologie', ville: 'Lyon' },
];

// Mock Kine Rankings (replace with actual data/logic)
const mockKineRankings = [
    { kineId: 'kineTest1', rank: 1, area: 'Rééducation Genou - Paris' },
    { kineId: 'kineTestX', rank: 2, area: 'Rééducation Genou - Paris' },
    { kineId: 'kineTestY', rank: 1, area: 'Rééducation Épaule - Lyon' },
];
// --- End Mock Data ---


export default function KineDashboard() {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [kineData, setKineData] = useState<Kine | null>(initialMockKine);
  const [patients, setPatients] = useState<Patient[]>(initialMockPatients);
  const [notifications, setNotifications] = useState<{ feedbackAlerts: Feedback[], messages: MessageToKine[] }>({ feedbackAlerts: [], messages: [] });
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState('');
  const [expiringSubscriptions, setExpiringSubscriptions] = useState<Patient[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(true); // State for notification accordion

  // Data states for new Kine features
  const [shopPrograms, setShopPrograms] = useState<ShopProgram[]>(mockKineShopPrograms);
  const [kineBlogPosts] = useState<BlogPost[]>(mockKineBlogPosts); // Assuming read-only for now
  const [certifications, setCertifications] = useState<CertificationBadge[]>(initialMockKine.certifications || []);

  // Gamification state
  const [currentPoints, setCurrentPoints] = useState(initialMockKine.progressPoints || 0);
  const [nextBadge, setNextBadge] = useState<CertificationBadge | null>(null);


  useEffect(() => {
    const today = new Date();
    setCurrentDate(format(today, "EEEE d MMMM yyyy", { locale: fr }));
    const expiring = patients.filter(p => {
        if (!p.subscriptionEndDate) return false;
        const daysLeft = differenceInDays(parseISO(p.subscriptionEndDate), today);
        return daysLeft >= 0 && daysLeft <= 14;
    }).sort((a, b) => differenceInDays(parseISO(a.subscriptionEndDate!), today) - differenceInDays(parseISO(b.subscriptionEndDate!), today));
    setExpiringSubscriptions(expiring);
  }, [patients]);

  useEffect(() => {
      const kinePatientIds = patients.map(p => p.id);
      const highPainFeedback = mockFeedbacks.filter(fb => kinePatientIds.includes(fb.patient_id) && fb.douleur_moyenne > 5);
      const unreadMessages = mockMessages.filter(msg => kinePatientIds.includes(msg.patient_id) && msg.status === 'unread');
      highPainFeedback.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      unreadMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setNotifications({ feedbackAlerts: highPainFeedback, messages: unreadMessages });
       // Open notifications accordion only if there are new notifications
      setIsNotificationsOpen(highPainFeedback.length > 0 || unreadMessages.length > 0);
  }, [kineData, patients]); // Depend on patients to update notifications when a new patient is added

   // Update next badge when kineData changes
  useEffect(() => {
      setNextBadge(findNextBadge(kineData));
      setCurrentPoints(kineData?.progressPoints || 0);
      setCertifications(kineData?.certifications || []);
  }, [kineData]);

  const handlePatientSelect = (patientId: string) => setSelectedPatientId(patientId);

  const handleMarkMessageAsRead = (messageId: string) => {
        console.log(`Marking message ${messageId} as read (simulated)`);
        setNotifications(prev => ({ ...prev, messages: prev.messages.filter(msg => msg.id !== messageId) }));
        const index = mockMessages.findIndex(m => m.id === messageId);
        if (index > -1) mockMessages[index].status = 'read';
  };

   // Handle saving updated patient data (including adherence rating)
   const handleSavePatientInfo = (updatedPatient: Patient) => {
        console.log("Saving patient info (simulated):", updatedPatient);
        setPatients(prevPatients => prevPatients.map(p => p.id === updatedPatient.id ? updatedPatient : p));
        // Simulate earning points for updating info/rating
        if (kineData) {
            const pointsEarned = 5;
            setKineData(prev => prev ? ({ ...prev, progressPoints: (prev.progressPoints || 0) + pointsEarned }) : prev);
            toast({ title: "Activité enregistrée !", description: `Vous avez gagné ${pointsEarned} points pour la mise à jour du dossier patient.` });
        }
        toast({ title: "Informations Patient Sauvegardées (Simulation)" });
   };


  const handleAddPatient = (newPatientData: Omit<Patient, 'id' | 'kine_id' | 'pathologies' | 'remarques' | 'objectifs'>) => {
      const newPatient: Patient = {
          ...newPatientData,
          id: `patientTest${patients.length + 1}`, kine_id: kineData?.id || 'unknownKine',
          pathologies: [], remarques: '', objectifs: [],
          subscriptionEndDate: new Date(Date.now() + 86400000 * 30).toISOString(), subscriptionStatus: 'active',
      };
      console.log('Simulating adding patient:', newPatient);
      console.log(`Simulating sending credentials to ${newPatient.email}`);
      toast({ title: "Patient ajouté (Simulation)", description: `${newPatient.prénom} ${newPatient.nom} a été ajouté.` });
      setPatients(prevPatients => [...prevPatients, newPatient]);
      setIsAddPatientModalOpen(false);
      setSelectedPatientId(newPatient.id);
      // Simulate earning points for adding a patient
      if (kineData) {
          const pointsEarned = 20;
          setKineData(prev => prev ? ({ ...prev, progressPoints: (prev.progressPoints || 0) + pointsEarned }) : prev);
          toast({ title: "Activité enregistrée !", description: `Vous avez gagné ${pointsEarned} points pour l'ajout d'un patient.` });
      }
  };

  // --- Handlers for new Kine features (Simulated) ---
  const handleSaveShopProgram = (program: ShopProgram) => {
    console.log("Saving shop program (simulated):", program);
    // In real app: Save to Firestore, update state
    setShopPrograms(prev => {
        const index = prev.findIndex(p => p.id === program.id);
        if (index > -1) {
            const updated = [...prev];
            updated[index] = program;
            return updated;
        }
        // Simulate earning points for creating a program
         if (kineData) {
             const pointsEarned = 50;
             setKineData(prev => prev ? ({ ...prev, progressPoints: (prev.progressPoints || 0) + pointsEarned }) : prev);
             toast({ title: "Activité enregistrée !", description: `Vous avez gagné ${pointsEarned} points pour la création d'un programme.` });
         }
        return [...prev, { ...program, id: `shopProg${prev.length + 1}` }]; // Add with new mock ID
    });
    toast({ title: "Programme sauvegardé (Simulation)" });
  };

  const handleDeleteShopProgram = (programId: string) => {
    console.log("Deleting shop program (simulated):", programId);
    setShopPrograms(prev => prev.filter(p => p.id !== programId));
    toast({ title: "Programme supprimé (Simulation)", variant: "destructive" });
  };

   // --- Collaboration Handlers (Simulated) ---
   const handleTransferPatient = (patientId: string, targetKineId: string) => {
        console.log(`Simulating transfer of patient ${patientId} to kine ${targetKineId}`);
        toast({ title: "Transfert Patient (Simulation)", description: `Demande de transfert de ${selectedPatientName} vers Kine ID ${targetKineId} envoyée.` });
        // In real app: Update patient's kine_id in Firestore, handle notifications/acceptance
   };

   const handleSharePatient = (patientId: string, collaboratingKineId: string) => {
        console.log(`Simulating sharing patient ${patientId} with kine ${collaboratingKineId}`);
        toast({ title: "Partage Patient (Simulation)", description: `Accès au dossier de ${selectedPatientName} partagé avec Kine ID ${collaboratingKineId}.` });
        // In real app: Update access control lists in Firestore
   };
  // --- End Collaboration Handlers ---

  // --- Share Kine Progress ---
  const handleShareKineProgress = () => {
    if (!kineData) return;
    const text = `J'ai atteint ${kineData.progressPoints || 0} points et obtenu ${kineData.certifications?.length || 0} badges sur Mon Assistant Kiné ! Découvrez mon profil.`; // Adjusted text
    const url = window.location.href; // Or a specific profile URL
    if (navigator.share) {
      navigator.share({ title: 'Ma Progression sur Mon Assistant Kiné', text, url })
        .then(() => toast({ title: "Partagé !" }))
        .catch((error) => {
            console.error('Error sharing:', error);
            navigator.clipboard.writeText(`${text} - ${url}`);
            toast({ title: "Lien copié !", description: "Le lien de votre progression a été copié." });
        });
    } else {
      navigator.clipboard.writeText(`${text} - ${url}`);
      toast({ title: "Lien copié !", description: "Le lien de votre progression a été copié." });
    }
  };
  // --- End Share Kine Progress ---


  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const selectedPatientName = selectedPatient ? `${selectedPatient.prénom} ${selectedPatient.nom}` : 'le patient sélectionné';
  const totalNotifications = notifications.feedbackAlerts.length + notifications.messages.length;

  // Find SuperKine badge
  const superKineBadge = certifications.find(c => c.isSuperKineBadge);

  return (
    <div className="space-y-8">
        {/* Date, Gamification, and Subscription Reminders Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6 p-4 bg-card rounded-lg shadow-sm border">
            {/* Left Side: Date & Gamification */}
            <div className="space-y-3">
                {/* Date */}
                <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                    <CalendarDays className="w-5 h-5 text-primary"/>
                    <span className="capitalize">{currentDate}</span>
                </div>
                 {/* SuperKiné Badge */}
                 {superKineBadge && (
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-yellow-600 bg-yellow-100 border border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700 px-2 py-1 rounded-md w-fit">
                       <Crown className="w-4 h-4" /> {superKineBadge.name}
                    </div>
                 )}
                {/* Kine Gamification */}
                {kineData && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                             <Star className="w-5 h-5 text-yellow-500" />
                             <span className="font-semibold text-foreground">{currentPoints} points</span>
                        </div>
                         {nextBadge && nextBadge.pointsRequired && (
                            <div className="flex items-center gap-1.5 text-xs">
                                <Trophy className="w-4 h-4 text-indigo-500" />
                                <span>{nextBadge.pointsRequired - currentPoints} pts pour "{nextBadge.name}"</span>
                            </div>
                         )}
                         <Button
                             variant="outline"
                             size="xs"
                             onClick={handleShareKineProgress}
                             className="flex items-center gap-1.5 h-6 px-2 text-xs"
                             aria-label="Partager ma progression kiné"
                           >
                            <Share2 className="w-3.5 h-3.5" />
                            Partager
                         </Button>
                    </div>
                )}
                 {/* Kine Certifications Display - Reusing patient component for brevity */}
                 {certifications.length > 0 && (
                     <KineCertificationDisplay certifications={certifications} kineName={`${kineData?.prénom} ${kineData?.nom}`} showSuperKine={false} /> // Hide SuperKine here as it's displayed above
                 )}


            </div>

            {/* Right Side: Expiring Subscriptions */}
            {expiringSubscriptions.length > 0 && (
                <div className="w-full md:w-auto md:max-w-md lg:max-w-lg mt-4 md:mt-0">
                    <Alert variant="default" className="border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 dark:border-yellow-700">
                        <BellRing className="h-4 w-4 !text-yellow-600 dark:!text-yellow-400 !left-3 !top-3.5" />
                        <AlertTitle className="ml-6 text-sm font-semibold text-yellow-800 dark:text-yellow-200">Abonnements à renouveler</AlertTitle>
                        <AlertDescription className="ml-6 text-xs space-y-1 text-yellow-700 dark:text-yellow-300">
                            {expiringSubscriptions.map(p => (
                                <div key={p.id} className="flex justify-between items-center">
                                    <span>{p.prénom} {p.nom}</span>
                                    <span className="font-medium">
                                        Expire le {format(parseISO(p.subscriptionEndDate!), 'd MMM yyyy', { locale: fr })} (J-{differenceInDays(parseISO(p.subscriptionEndDate!), new Date())})
                                    </span>
                                    <Button variant="link" size="xs" className="h-5 p-0 text-xs text-primary" onClick={() => handlePatientSelect(p.id)}>Voir</Button>
                                </div>
                            ))}
                        </AlertDescription>
                    </Alert>
                </div>
            )}
        </div>

       {/* Collapsible Notification Area */}
        <Accordion type="single" collapsible value={isNotificationsOpen ? "notifications" : ""} onValueChange={(value) => setIsNotificationsOpen(value === "notifications")}>
            <AccordionItem value="notifications" className="border-none">
                {/* Custom Trigger */}
                <AccordionTrigger
                    className={`flex items-center justify-between w-full px-4 py-3 text-lg font-semibold rounded-t-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                        isNotificationsOpen ? 'bg-muted rounded-b-none border-x border-t' : 'bg-card rounded-b-lg border'
                     } ${totalNotifications > 0 ? 'text-orange-700 dark:text-orange-300' : 'text-foreground'}`}
                     aria-label={isNotificationsOpen ? "Masquer les notifications" : "Afficher les notifications"}
                 >
                     <div className="flex items-center gap-2">
                        <BellRing className="w-5 h-5"/>
                        Notifications
                        {totalNotifications > 0 && (
                           <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                             {totalNotifications}
                           </span>
                        )}
                     </div>
                    {isNotificationsOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </AccordionTrigger>
                <AccordionContent className="border-x border-b rounded-b-lg p-0 bg-card">
                    {totalNotifications > 0 ? (
                        <NotificationArea
                            feedbackAlerts={notifications.feedbackAlerts}
                            messages={notifications.messages}
                            patients={patients}
                            onSelectPatient={handlePatientSelect}
                            onMarkMessageAsRead={handleMarkMessageAsRead}
                        />
                    ) : (
                        <div className="p-6 text-center text-muted-foreground">
                            Aucune nouvelle notification.
                        </div>
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>


      {/* Main Dashboard */}
      <Tabs defaultValue="patients" className="w-full">
        {/* Updated grid columns and added KinéHub tab */}
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-7 mb-6">
            <TabsTrigger value="patients"><UserCheck className="w-4 h-4 mr-2"/>Gestion Patients</TabsTrigger>
            <TabsTrigger value="chatbot"><Bot className="w-4 h-4 mr-2"/>Chatbot Mak</TabsTrigger>
            <TabsTrigger value="collaboration"><Users className="w-4 h-4 mr-2"/>KinéHub Collab</TabsTrigger> {/* New KinéHub Tab */}
            <TabsTrigger value="reputation"><BarChart3 className="w-4 h-4 mr-2"/>KinéHub Réputation</TabsTrigger> {/* New Reputation Tab */}
            <TabsTrigger value="marketplace"><Store className="w-4 h-4 mr-2"/>Marketplace</TabsTrigger>
            <TabsTrigger value="blog"><BookOpen className="w-4 h-4 mr-2"/>Blog Pro</TabsTrigger>
            <TabsTrigger value="certifications"><Award className="w-4 h-4 mr-2"/>Badges Pro</TabsTrigger>
        </TabsList>

        {/* Patient Management Tab */}
        <TabsContent value="patients" className="space-y-8">
             <Card className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <div>
                     <CardTitle>Gestion des Patients</CardTitle>
                     <CardDescription>Sélectionnez un patient pour voir ses détails ou ajoutez-en un nouveau.</CardDescription>
                  </div>
                   <Button onClick={() => setIsAddPatientModalOpen(true)} variant="outline">
                      <PlusCircle className="mr-2 h-4 w-4" /> Ajouter Patient
                   </Button>
                </CardHeader>
                <CardContent>
                   {kineData && (
                       <p className="mb-4 text-muted-foreground">
                           Bienvenue, Dr. {kineData.nom}. Spécialité : {kineData.spécialité}. Ville: {kineData.ville || 'Non spécifiée'}
                       </p>
                   )}
                  <PatientSelector
                    patients={patients}
                    onSelectPatient={handlePatientSelect}
                    selectedPatientId={selectedPatientId}
                  />
                </CardContent>
             </Card>

              {/* Selected Patient Details Area */}
              {selectedPatientId && selectedPatient ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Accordion for Patient Info and Assessment */}
                    <Accordion type="single" collapsible className="w-full lg:col-span-2" defaultValue="patient-info">
                      <AccordionItem value="patient-info">
                        <AccordionTrigger className="text-lg font-semibold px-6 py-4 bg-card rounded-t-lg border data-[state=closed]:rounded-b-lg data-[state=closed]:border-b data-[state=open]:border-b-0 hover:no-underline hover:bg-muted/50">
                            <div className="flex items-center gap-2">
                                <UserCheck className="w-5 h-5 text-primary" />
                                Informations & Bilan - {selectedPatientName}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="border border-t-0 rounded-b-lg bg-card p-0">
                          <PatientInfoForm patient={selectedPatient} onSave={handleSavePatientInfo} />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                   <div className="lg:col-span-2">
                        <PatientFeedbackDisplay patientId={selectedPatientId} />
                   </div>
                   {/* TODO: Add Progress Test Results display for Kine */}
                   {/* <div className="lg:col-span-2"> ...ProgressTestResultsDisplay... </div> */}
                </div>
              ) : (
                <Card className="shadow-md">
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">
                           {patients.length > 0 ? "Sélectionnez un patient pour voir ses informations." : "Aucun patient. Cliquez sur 'Ajouter Patient'."}
                        </p>
                    </CardContent>
                </Card>
              )}
        </TabsContent>

         {/* Kine Chatbot Tab */}
         <TabsContent value="chatbot">
             {kineData ? (
                 <KineChatbot kine={kineData} />
             ) : (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                        Chargement des informations du kiné...
                    </CardContent>
                 </Card>
             )}
         </TabsContent>

        {/* KinéHub Collaboration Tab */}
        <TabsContent value="collaboration">
             {kineData && selectedPatient ? (
                 <KineCollaborationHub
                    currentKineId={kineData.id}
                    selectedPatient={selectedPatient}
                    otherKines={mockOtherKines} // Pass mock or fetched list of other kines
                    onTransferPatient={handleTransferPatient}
                    onSharePatient={handleSharePatient}
                />
             ) : (
                 <Card>
                     <CardContent className="p-6 text-center text-muted-foreground">
                         Sélectionnez un patient pour voir les options de collaboration.
                     </CardContent>
                 </Card>
             )}
        </TabsContent>

         {/* KinéHub Reputation Tab */}
         <TabsContent value="reputation">
             {kineData ? (
                <KineReputationDisplay
                    kine={kineData}
                    rankings={mockKineRankings} // Pass mock rankings
                 />
             ) : (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                        Chargement des informations de réputation...
                    </CardContent>
                 </Card>
             )}

         </TabsContent>


        {/* Marketplace Tab */}
        <TabsContent value="marketplace">
            <MarketplaceManager
                kineId={kineData?.id || ''}
                existingPrograms={shopPrograms}
                onSave={handleSaveShopProgram}
                onDelete={handleDeleteShopProgram}
            />
        </TabsContent>

        {/* Blog Pro Tab (using shared BlogDisplay) */}
        <TabsContent value="blog">
             <BlogDisplay
                posts={kineBlogPosts}
                title="Blog Professionnel - Articles & Synthèses"
                description="Consultez des résumés d'articles scientifiques et des synthèses pour votre pratique."
                showAuthor={true} // Show author for kine blog
                showSearch={true} // Enable search for kine blog
            />
        </TabsContent>


         {/* Certifications Tab */}
        <TabsContent value="certifications">
            <KineCertificationManager
                certifications={certifications}
                title="Mes Badges Professionnels"
                description="Visualisez vos badges de compétence et de formation. Ils sont visibles par vos patients."
                showPoints={true} // Show points required for badges in this view
            />
        </TabsContent>

      </Tabs>


       {/* Add Patient Modal */}
       <AddPatientModal
           isOpen={isAddPatientModalOpen}
           onClose={() => setIsAddPatientModalOpen(false)}
           onPatientAdded={handleAddPatient}
       />

    </div>
  );
}
