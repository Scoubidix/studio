// @refresh reset - Prevent error during compilation
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PatientSelector from '@/components/kine/patient-selector';
import PatientInfoForm from '@/components/kine/patient-info-form';
import PatientFeedbackDisplay from '@/components/kine/patient-feedback-display';
import NotificationArea from '@/components/kine/notification-area'; // Import NotificationArea
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"; // Import Accordion components
import type { Patient, Kine, Feedback, MessageToKine } from '@/interfaces'; // Import necessary interfaces

// --- Mock Data (Replace with actual data fetching later) ---
const mockKine: Kine = {
    id: 'kineTest1',
    nom: 'Leroy',
    prénom: 'Sophie',
    email: 'sophie.leroy@kine.fr',
    spécialité: 'Sport',
};

const mockPatients: Patient[] = [
    {
        id: 'patientTest',
        nom: 'Dupont',
        prénom: 'Jean',
        date_naissance: '1985-03-15',
        pathologies: ['Lombalgie chronique', 'Tendinopathie épaule droite'],
        remarques: 'Motivé mais craint la douleur.',
        kine_id: 'kineTest1',
        objectifs: ['Amélioration de la mobilité lombaire', 'Reprise progressive de la course à pied'],
    },
    {
        id: 'patientTest2',
        nom: 'Martin',
        prénom: 'Claire',
        date_naissance: '1992-07-22',
        pathologies: ['Entorse cheville gauche (récente)'],
        remarques: 'Sportive (Volley), veut reprendre rapidement.',
        kine_id: 'kineTest1',
        objectifs: ['Récupération complète mobilité cheville', 'Renforcement musculaire préventif'],
    },
     {
        id: 'patientTest3',
        nom: 'Petit',
        prénom: 'Lucas',
        date_naissance: '2005-11-10',
        pathologies: ['Syndrome rotulien genou droit'],
        remarques: 'Jeune footballeur, en pleine croissance.',
        kine_id: 'kineTest1',
        objectifs: ['Diminution douleur pendant effort', 'Correction posture/gestuelle'],
    },
];

// Use mockFeedbacks from PatientFeedbackDisplay for notifications
const mockFeedbacks: Feedback[] = [
  {
    id: 'fb1',
    programme_id: 'prog123',
    patient_id: 'patientTest',
    date: new Date(Date.now() - 86400000 * 1).toISOString(),
    douleur_moyenne: 7, // Increased pain for testing notification
    difficulté: 6,
    commentaire_libre: "L'étirement des ischios était très douloureux aujourd'hui.",
  },
  {
    id: 'fb2',
    programme_id: 'prog123',
    patient_id: 'patientTest',
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
    douleur_moyenne: 4,
    difficulté: 5,
    commentaire_libre: "Séance ok, RAS.",
  },
  {
      id: 'fb3',
      programme_id: 'progXYZ',
      patient_id: 'patientTest2',
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      douleur_moyenne: 3,
      difficulté: 7,
      commentaire_libre: "Les exercices de renforcement de la cheville sont difficiles mais je sens que ça progresse. Pas de douleur particulière.",
  },
   {
      id: 'fb5',
      programme_id: 'progABC',
      patient_id: 'patientTest3',
      date: new Date(Date.now() - 86400000 * 1).toISOString(),
      douleur_moyenne: 6, // Increased pain for testing notification
      difficulté: 5,
      commentaire_libre: "J'ai ressenti une gêne au genou droit pendant les squats.",
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
  const [kineData] = useState<Kine | null>(mockKine); // Using useState to simulate data loading
  const [notifications, setNotifications] = useState<{ feedbackAlerts: Feedback[], messages: MessageToKine[] }>({ feedbackAlerts: [], messages: [] });

  // TODO: Fetch actual kine data based on authentication
  // TODO: Fetch actual patients list assigned to this kine
  // TODO: Fetch actual notifications (high pain feedback and unread messages)

  useEffect(() => {
      // Simulate fetching notifications for ALL kine's patients
      const kinePatientIds = mockPatients.map(p => p.id);

      // Filter recent feedback with high pain for this kine's patients
      const highPainFeedback = mockFeedbacks.filter(fb =>
          kinePatientIds.includes(fb.patient_id) && fb.douleur_moyenne > 5
      );

      // Filter unread messages for this kine's patients
      const unreadMessages = mockMessages.filter(msg =>
          kinePatientIds.includes(msg.patient_id) && msg.status === 'unread'
      );

      // Sort notifications by date (most recent first)
      highPainFeedback.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      unreadMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());


      setNotifications({ feedbackAlerts: highPainFeedback, messages: unreadMessages });
  }, [kineData]); // Re-run if kineData changes

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId);
  };

   const handleMarkMessageAsRead = (messageId: string) => {
        // TODO: Implement actual Firestore update to mark message as read
        console.log(`Marking message ${messageId} as read (simulated)`);
        setNotifications(prev => ({
            ...prev,
            messages: prev.messages.map(msg =>
                msg.id === messageId ? { ...msg, status: 'read' } : msg
            ).filter(msg => msg.status !== 'read') // Optimistically remove from display
        }));
    };

  const selectedPatient = mockPatients.find(p => p.id === selectedPatientId);
  const selectedPatientName = selectedPatient ? `${selectedPatient.prénom} ${selectedPatient.nom}` : 'le patient sélectionné';

  return (
    <div className="space-y-8">
       {/* Notification Area */}
       <NotificationArea
           feedbackAlerts={notifications.feedbackAlerts}
           messages={notifications.messages}
           patients={mockPatients} // Pass patients for name lookup
           onSelectPatient={handlePatientSelect} // Allow clicking notification to select patient
           onMarkMessageAsRead={handleMarkMessageAsRead} // Allow marking message as read
       />

      {/* Main Dashboard Header and Patient Selector */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Tableau de Bord Kinésithérapeute</CardTitle>
          <CardDescription>Gérez vos patients et suivez leurs progrès.</CardDescription>
        </CardHeader>
        <CardContent>
           {kineData && (
               <p className="mb-4 text-muted-foreground">
                   Bienvenue, Dr. {kineData.nom}. Spécialité : {kineData.spécialité}
               </p>
           )}
          <PatientSelector
            patients={mockPatients}
            onSelectPatient={handlePatientSelect}
            selectedPatientId={selectedPatientId}
          />
        </CardContent>
      </Card>

      {/* Selected Patient Details Area */}
      {selectedPatientId && selectedPatient ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Patient Information & Goals (Collapsible) */}
            <Accordion type="single" collapsible className="w-full lg:col-span-2">
              <AccordionItem value="patient-info">
                <AccordionTrigger className="text-lg font-semibold px-6 py-4 bg-card rounded-t-lg border data-[state=closed]:rounded-b-lg data-[state=closed]:border-b data-[state=open]:border-b-0 hover:no-underline hover:bg-muted/50">
                    Informations & Bilan Initial - {selectedPatientName}
                </AccordionTrigger>
                <AccordionContent className="border border-t-0 rounded-b-lg bg-card p-0">
                  {/* PatientInfoForm is now inside the AccordionContent */}
                  {/* The Card inside PatientInfoForm might be redundant now, adjust PatientInfoForm if needed */}
                  <PatientInfoForm patient={selectedPatient} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

           {/* Patient Feedback Display */}
           <div className="lg:col-span-2"> {/* Make feedback display full width below accordion */}
                <PatientFeedbackDisplay patientId={selectedPatientId} />
           </div>

        </div>
      ) : (
        <Card className="shadow-md">
            <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                    Veuillez sélectionner un patient pour voir ses informations et feedbacks.
                </p>
            </CardContent>
        </Card>
      )}

       {/* TODO: Add other Kine features later (e.g., Program Generation, Kine Chatbot) */}
    </div>
  );
}
