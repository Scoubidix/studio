// @refresh reset - Prevent error during compilation
import type { Feedback } from '@/interfaces';

// Moved mockFeedbacks here to be shared
export const mockFeedbacks: Feedback[] = [
  {
    id: 'fb1',
    programme_id: 'prog123',
    patient_id: 'patientTest', // Feedback for Jean Dupont
    date: new Date(Date.now() - 86400000 * 1).toISOString(), // Yesterday
    douleur_moyenne: 7, // Increased pain for testing notification
    difficulté: 6,
    commentaire_libre: "L'étirement des ischios était très douloureux aujourd'hui.",
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
      douleur_moyenne: 6, // Increased pain for testing notification
      difficulté: 5,
      commentaire_libre: "J'ai ressenti une gêne au genou droit pendant les squats.",
  },
];
