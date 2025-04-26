// @refresh reset - Prevent error during compilation
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components
import { Button } from '@/components/ui/button'; // Import Button
import PatientSelector from '@/components/kine/patient-selector';
import PatientInfoForm from '@/components/kine/patient-info-form';
import PatientFeedbackDisplay from '@/components/kine/patient-feedback-display';
import NotificationArea from '@/components/kine/notification-area';
import AddPatientModal from '@/components/kine/add-patient-modal'; // Import AddPatientModal
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Patient, Kine, Feedback, MessageToKine } from '@/interfaces';
import { mockFeedbacks } from '@/components/kine/mock-data'; // Import shared mock feedbacks
import { useToast } from '@/hooks/use-toast'; // Import useToast for add patient confirmation
import { PlusCircle, CalendarDays, BellRing, UserCheck } from 'lucide-react'; // Import icons
import { format, differenceInDays, parseISO, isBefore } from 'date-fns'; // Import date-fns functions
import { fr } from 'date-fns/locale'; // Import French locale

// --- Mock Data (Initial Data - now managed by state) ---
const initialMockKine: Kine = {
    id: 'kineTest1',
    nom: 'Leroy',
    prénom: 'Sophie',
    email: 'sophie.leroy@kine.fr',
    spécialité: 'Sport',
};

// Add subscription info to mock patients
const initialMockPatients: Patient[] = [
    {
        id: 'patientTest',
        nom: 'Dupont',
        prénom: 'Jean',
        email: 'jean.dupont@email.com', // Added email
        date_naissance: '1985-03-15',
        pathologies: ['Lombalgie chronique', 'Tendinopathie épaule droite'],
        remarques: 'Motivé mais craint la douleur.',
        kine_id: 'kineTest1',
        objectifs: ['Amélioration de la mobilité lombaire', 'Reprise progressive de la course à pied'],
        subscriptionEndDate: new Date(Date.now() + 86400000 * 10).toISOString(), // Ends in 10 days
        subscriptionStatus: 'active',
    },
    {
        id: 'patientTest2',
        nom: 'Martin',
        prénom: 'Claire',
        email: 'claire.martin@email.com', // Added email
        date_naissance: '1992-07-22',
        pathologies: ['Entorse cheville gauche (récente)'],
        remarques: 'Sportive (Volley), veut reprendre rapidement.',
        kine_id: 'kineTest1',
        objectifs: ['Récupération complète mobilité cheville', 'Renforcement musculaire préventif'],
        subscriptionEndDate: new Date(Date.now() + 86400000 * 5).toISOString(), // Ends in 5 days
        subscriptionStatus: 'active',
    },
     {
        id: 'patientTest3',
        nom: 'Petit',
        prénom: 'Lucas',
        email: 'lucas.petit@email.com', // Added email
        date_naissance: '2005-11-10',
        pathologies: ['Syndrome rotulien genou droit'],
        remarques: 'Jeune footballeur, en pleine croissance.',
        kine_id: 'kineTest1',
        objectifs: ['Diminution douleur pendant effort', 'Correction posture/gestuelle'],
        subscriptionEndDate: new Date(Date.now() - 86400000 * 2).toISOString(), // Ended 2 days ago
        subscriptionStatus: 'expired',
    },
     {
        id: 'patientTest4', // New patient
        nom: 'Dubois',
        prénom: 'Marie',
        email: 'marie.dubois@email.com',
        date_naissance: '1978-12-01',
        pathologies: ['Arthrose cervicale'],
        remarques: 'Sédentaire, cherche à soulager les douleurs.',
        kine_id: 'kineTest1',
        objectifs: ['Augmenter la mobilité cervicale', 'Réduire les céphalées de tension'],
        subscriptionEndDate: new Date(Date.now() + 86400000 * 45).toISOString(), // Ends in 45 days
        subscriptionStatus: 'active',
    },
];

// Mock Messages to Kiné (escalated from chatbot)
const mockMessages: MessageToKine[] = [
    {
        id: 'msg1',
        patient_id: 'patientTest',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
        original_question: "Mon genou craque beaucoup pendant les squats, est-ce normal ?",
        message: "Bonjour, j'ai demandé au chatbot : \"Mon genou craque beaucoup pendant les squats, est-ce normal ?\". Il m'a été suggéré de vous contacter car: \"Je ne peux pas évaluer les bruits articulaires spécifiques.\". Pourriez-vous m'éclairer ? Merci, Jean",
        status: 'unread',
    },
    {
        id: 'msg2',
        patient_id: 'patientTest3',
        timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), // Yesterday
        original_question: "Puis-je remplacer l'exercice X par l'exercice Y ?",
        message: "Bonjour, j'ai demandé au chatbot si je pouvais remplacer un exercice. Il m'a dit de voir avec vous. Est-ce possible ? Merci, Lucas",
        status: 'unread',
    },
    {
        id: 'msg3', // Already read message
        patient_id: 'patientTest2',
        timestamp: new Date(Date.now() - 86400000 * 4).toISOString(), // 4 days ago
        original_question: "Où acheter un bon tapis de sol ?",
        message: "Bonjour, le chatbot ne savait pas où acheter un tapis. Avez-vous une recommandation? Merci, Claire",
        status: 'read',
    }
];
// --- End Mock Data ---


export default function KineDashboard() {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [kineData] = useState<Kine | null>(initialMockKine);
  const [patients, setPatients] = useState<Patient[]>(initialMockPatients); // Manage patients list with state
  const [notifications, setNotifications] = useState<{ feedbackAlerts: Feedback[], messages: MessageToKine[] }>({ feedbackAlerts: [], messages: [] });
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false); // State for Add Patient modal
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState('');
  const [expiringSubscriptions, setExpiringSubscriptions] = useState<Patient[]>([]);

  // Update current date and check for expiring subscriptions on mount and when patients change
  useEffect(() => {
    const today = new Date();
    setCurrentDate(format(today, "EEEE d MMMM yyyy", { locale: fr }));

    const upcomingExpiryLimit = 14; // Days before expiry to show reminder
    const expiring = patients.filter(p => {
        if (!p.subscriptionEndDate) return false;
        const endDate = parseISO(p.subscriptionEndDate);
        const daysLeft = differenceInDays(endDate, today);
        return daysLeft >= 0 && daysLeft <= upcomingExpiryLimit;
    }).sort((a, b) => differenceInDays(parseISO(a.subscriptionEndDate!), today) - differenceInDays(parseISO(b.subscriptionEndDate!), today)); // Sort by soonest expiry

    setExpiringSubscriptions(expiring);

  }, [patients]);


  // Update notifications based on current patients list
  useEffect(() => {
      const kinePatientIds = patients.map(p => p.id);

      const highPainFeedback = mockFeedbacks.filter(fb =>
          kinePatientIds.includes(fb.patient_id) && fb.douleur_moyenne > 5
      );

      const unreadMessages = mockMessages.filter(msg =>
          kinePatientIds.includes(msg.patient_id) && msg.status === 'unread'
      );

      highPainFeedback.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      unreadMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setNotifications({ feedbackAlerts: highPainFeedback, messages: unreadMessages });
  }, [kineData, patients]); // Re-run if kineData or patients list changes

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId);
  };

   const handleMarkMessageAsRead = (messageId: string) => {
        // TODO: Implement actual Firestore update to mark message as read
        console.log(`Marking message ${messageId} as read (simulated)`);
        setNotifications(prev => ({
            ...prev,
            messages: prev.messages.filter(msg => msg.id !== messageId) // Optimistically remove from display
        }));
        // Update mockMessages state (or refetch) if needed for persistence in demo
         const index = mockMessages.findIndex(m => m.id === messageId);
         if (index > -1) mockMessages[index].status = 'read';
    };

   const handleAddPatient = (newPatientData: Omit<Patient, 'id' | 'kine_id' | 'pathologies' | 'remarques' | 'objectifs'>) => {
      // Simulate adding patient to the database
      const newPatient: Patient = {
          ...newPatientData,
          id: `patientTest${patients.length + 1}`, // Generate a mock ID
          kine_id: kineData?.id || 'unknownKine',
          pathologies: [], // Initialize empty arrays
          remarques: '',
          objectifs: [],
          subscriptionEndDate: new Date(Date.now() + 86400000 * 30).toISOString(), // Default 30 days subscription
          subscriptionStatus: 'active',
      };

      console.log('Simulating adding patient:', newPatient);
      // TODO: Replace with actual API call to add patient and send email

      // Simulate sending credentials email
      console.log(`Simulating sending credentials to ${newPatient.email}`);
      toast({
          title: "Patient ajouté (Simulation)",
          description: `${newPatient.prénom} ${newPatient.nom} a été ajouté. Un email avec ses identifiants lui a été envoyé (simulé).`,
      });

      // Update the local patients list
      setPatients(prevPatients => [...prevPatients, newPatient]);
      setIsAddPatientModalOpen(false); // Close the modal
       // Optionally select the newly added patient
      setSelectedPatientId(newPatient.id);
   };


  const selectedPatient = patients.find(p => p.id === selectedPatientId); // Use state variable 'patients'
  const selectedPatientName = selectedPatient ? `${selectedPatient.prénom} ${selectedPatient.nom}` : 'le patient sélectionné';

  return (
    <div className="space-y-8">
       {/* Date and Subscription Reminders Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6 p-4 bg-card rounded-lg shadow-sm border">
            <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <CalendarDays className="w-5 h-5 text-primary"/>
                <span className="capitalize">{currentDate}</span>
            </div>
            {/* Subscription Reminders */}
            {expiringSubscriptions.length > 0 && (
                <div className="w-full md:w-auto md:max-w-md lg:max-w-lg">
                    <Alert variant="default" className="border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 dark:border-yellow-700">
                        <BellRing className="h-4 w-4 !text-yellow-600 dark:!text-yellow-400 !left-3 !top-3.5" />
                        <AlertTitle className="ml-6 text-sm font-semibold text-yellow-800 dark:text-yellow-200">Abonnements à renouveler</AlertTitle>
                        <AlertDescription className="ml-6 text-xs space-y-1 text-yellow-700 dark:text-yellow-300">
                            {expiringSubscriptions.map(p => (
                                <div key={p.id} className="flex justify-between items-center">
                                    <span>{p.prénom} {p.nom}</span>
                                    <span className="font-medium">
                                        Expire le {format(parseISO(p.subscriptionEndDate!), 'd MMM yyyy', { locale: fr })}
                                        {' '}(J-{differenceInDays(parseISO(p.subscriptionEndDate!), new Date())})
                                    </span>
                                    <Button variant="link" size="xs" className="h-5 p-0 text-xs text-primary" onClick={() => handlePatientSelect(p.id)}>
                                        Voir
                                    </Button>
                                </div>
                            ))}
                        </AlertDescription>
                    </Alert>
                </div>
            )}
        </div>

       {/* Notification Area */}
       <NotificationArea
           feedbackAlerts={notifications.feedbackAlerts}
           messages={notifications.messages}
           patients={patients} // Pass current patients list
           onSelectPatient={handlePatientSelect}
           onMarkMessageAsRead={handleMarkMessageAsRead}
       />

      {/* Main Dashboard Header and Patient Selector */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
             <CardTitle>Tableau de Bord Kinésithérapeute</CardTitle>
             <CardDescription>Gérez vos patients et suivez leurs progrès.</CardDescription>
          </div>
           <Button onClick={() => setIsAddPatientModalOpen(true)} variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter Patient
           </Button>
        </CardHeader>
        <CardContent>
           {kineData && (
               <p className="mb-4 text-muted-foreground">
                   Bienvenue, Dr. {kineData.nom}. Spécialité : {kineData.spécialité}
               </p>
           )}
          <PatientSelector
            patients={patients} // Use state variable 'patients'
            onSelectPatient={handlePatientSelect}
            selectedPatientId={selectedPatientId}
          />
        </CardContent>
      </Card>

      {/* Selected Patient Details Area */}
      {selectedPatientId && selectedPatient ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Patient Information & Goals (Collapsible, closed by default) */}
            <Accordion type="single" collapsible className="w-full lg:col-span-2">
              <AccordionItem value="patient-info">
                <AccordionTrigger className="text-lg font-semibold px-6 py-4 bg-card rounded-t-lg border data-[state=closed]:rounded-b-lg data-[state=closed]:border-b data-[state=open]:border-b-0 hover:no-underline hover:bg-muted/50">
                    <div className="flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-primary" /> {/* Icon for Patient Info */}
                        Informations & Bilan Initial - {selectedPatientName}
                    </div>
                </AccordionTrigger>
                <AccordionContent className="border border-t-0 rounded-b-lg bg-card p-0">
                  {/* Pass the selected patient data and a (mock) save handler */}
                  <PatientInfoForm patient={selectedPatient} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

           {/* Patient Feedback Display */}
           <div className="lg:col-span-2">
                <PatientFeedbackDisplay patientId={selectedPatientId} />
           </div>

        </div>
      ) : (
        <Card className="shadow-md">
            <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                   {patients.length > 0
                      ? "Veuillez sélectionner un patient pour voir ses informations et feedbacks."
                      : "Aucun patient n'est enregistré. Cliquez sur 'Ajouter Patient' pour commencer."}
                </p>
            </CardContent>
        </Card>
      )}

       {/* Add Patient Modal */}
       <AddPatientModal
           isOpen={isAddPatientModalOpen}
           onClose={() => setIsAddPatientModalOpen(false)}
           onPatientAdded={handleAddPatient}
       />

       {/* TODO: Add other Kine features later (e.g., Program Generation, Kine Chatbot) */}
    </div>
  );
}
