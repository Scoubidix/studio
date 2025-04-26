export interface Exercise {
  id: string;
  nom: string;
  description: string;
  detailed_steps?: string[]; // Added for detailed view
  image_url?: string;
  video_url?: string;
  niveau: 'débutant' | 'intermédiaire' | 'avancé';
  catégorie: 'renforcement' | 'mobilité' | 'étirement';
  contre_indications?: string[];
}

export interface ProgramExercise {
  exercice_id: string;
  séries: number;
  répétitions: number;
  // fréquence removed
  exerciseDetails?: Exercise; // Optional: populated when fetching full program details
}

export interface Program {
  id: string;
  patient_id: string; // Assuming we'll have patient ID later
  liste_exercices: ProgramExercise[];
  statut: 'actif' | 'terminé' | 'suspendu';
  date_creation: string; // Consider using Date object or Firestore Timestamp
}

export interface Feedback {
    id?: string; // Optional for new feedback
    programme_id: string;
    patient_id: string;
    date: string; // Consider Date or Timestamp
    douleur_moyenne: number;
    difficulté: number;
    // fatigue removed
    // adherence removed
    commentaire_libre?: string; // Made optional as per original schema usage
}

export interface Patient {
  id: string;
  nom: string;
  prénom: string;
  date_naissance: string; // Consider Date or Timestamp
  pathologies: string[];
  remarques: string;
  kine_id: string; // Reference to Kine
  objectifs: string[]; // Added patient goals
}

// Represents a message that can be sent to the Kiné
export interface MessageToKine {
    id?: string;
    patient_id: string;
    timestamp: string; // ISO date string
    original_question: string;
    chatbot_response?: string; // Optional: what the chatbot said
    message: string; // The actual message forwarded
    status: 'unread' | 'read' | 'archived';
}

export interface Kine {
    id: string;
    nom: string;
    prénom: string;
    email: string;
    spécialité: string;
    // patient_ids?: string[]; // Optional: If storing assigned patient IDs directly on the kine document
}
