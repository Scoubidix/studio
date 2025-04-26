'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PatientSelector from '@/components/kine/patient-selector';
import PatientInfoForm from '@/components/kine/patient-info-form';
import PatientFeedbackDisplay from '@/components/kine/patient-feedback-display';
import { Patient, Kine } from '@/interfaces'; // Assuming Kine interface exists or will be added

// --- Mock Data (Replace with actual data fetching later) ---
const mockKine: Kine = {
    id: 'kineTest1',
    nom: 'Leroy',
    prénom: 'Sophie',
    email: 'sophie.leroy@kine.fr',
    spécialité: 'Sport',
    // Add patient_ids if needed based on data structure
};

// Add another mock patient for the selector
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
// --- End Mock Data ---


export default function KineDashboard() {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  // const [kineData, setKineData] = useState<Kine | null>(mockKine); // Load actual Kine data later

  // TODO: Fetch actual kine data based on authentication
  // TODO: Fetch actual patients list assigned to this kine

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId);
  };

  const selectedPatient = mockPatients.find(p => p.id === selectedPatientId);

  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Tableau de Bord Kinésithérapeute</CardTitle>
          <CardDescription>Gérez vos patients et suivez leurs progrès.</CardDescription>
        </CardHeader>
        <CardContent>
           {/* TODO: Display Kine's name and specialty once data loading is implemented */}
           {/* <p>Bienvenue, Dr. {kineData?.nom || 'Kiné'}. Spécialité: {kineData?.spécialité || 'Non définie'}</p> */}
          <PatientSelector
            patients={mockPatients} // Pass the list of patients
            onSelectPatient={handlePatientSelect}
            selectedPatientId={selectedPatientId}
            // kineId={kineData?.id} // Pass kineId if needed for fetching patients
          />
        </CardContent>
      </Card>

      {selectedPatientId && selectedPatient ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Patient Information & Goals Form */}
           <PatientInfoForm patient={selectedPatient} />

           {/* Patient Feedback Display */}
           <PatientFeedbackDisplay patientId={selectedPatientId} />
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
