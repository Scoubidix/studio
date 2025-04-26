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
  exerciseDetails?: Exercise; // Optional: populated when fetching full program details
}

export interface Program {
  id: string;
  patient_id: string;
  liste_exercices: ProgramExercise[];
  statut: 'actif' | 'terminé' | 'suspendu';
  date_creation: string;
}

export interface Feedback {
    id?: string;
    programme_id: string;
    patient_id: string;
    date: string;
    douleur_moyenne: number;
    difficulté: number;
    commentaire_libre?: string;
}

export interface Patient {
  id: string;
  nom: string;
  prénom: string;
  email: string;
  date_naissance: string;
  pathologies: string[];
  remarques: string;
  kine_id: string;
  objectifs: string[];
  subscriptionEndDate?: string;
  subscriptionStatus?: 'active' | 'expiring' | 'expired';
  purchasedProgramIds?: string[]; // IDs of programs bought from the shop
  progressTestResults?: ProgressTestResult[]; // Track test results
}

export interface MessageToKine {
    id?: string;
    patient_id: string;
    timestamp: string;
    original_question: string;
    chatbot_response?: string;
    message: string;
    status: 'unread' | 'read' | 'archived';
}

export interface Kine {
    id: string;
    nom: string;
    prénom: string;
    email: string;
    spécialité: string;
    certifications?: CertificationBadge[]; // Kine certifications/badges
}

export interface BlogPost {
    id: string;
    title: string;
    summary: string;
    contentUrl?: string; // Link to full article or content
    publishDate: string; // ISO date string
    tags?: string[]; // e.g., 'lombalgie', 'genou', 'sport'
    author?: string; // Optional author name
    imageUrl?: string;
}

// For pre-made programs sold in the shop/marketplace
export interface ShopProgram {
    id: string;
    kine_id: string; // Creator Kine ID
    title: string;
    description: string;
    durationWeeks?: number;
    targetAudience: string; // e.g., "Skiers", "Runners", "Office workers"
    price: number; // Consider using a dedicated money library in a real app
    currency: string; // e.g., "EUR"
    exerciseList: ProgramExercise[]; // The actual exercises
    imageUrl?: string;
    tags?: string[];
}

// For rehabilitation protocol templates
export interface RehabProtocol {
    id: string;
    name: string;
    description: string;
    condition: string; // e.g., "ACL Reconstruction", "Rotator Cuff Repair"
    phases: {
        name: string;
        duration: string; // e.g., "Weeks 1-4"
        goals: string[];
        exercises: ProgramExercise[];
        criteriaToProgress: string[];
    }[];
    source?: string; // Where the protocol comes from (e.g., "Internal Guideline", "Journal XYZ")
    lastUpdated: string; // ISO date string
}

// For Kine certifications/badges
export interface CertificationBadge {
    id: string;
    name: string;
    description: string;
    icon?: string; // Icon name (e.g., from lucide-react) or URL
    dateAwarded: string; // ISO date string
}

// For patient progress tests
export interface ProgressTest {
    id: string;
    name: string;
    description: string;
    instructions: string[];
    metrics: { name: string; unit: string }[]; // e.g., { name: "Knee Flexion", unit: "degrees" }
    frequency?: string; // e.g., "Every 2 weeks"
    videoUrl?: string;
    imageUrl?: string;
}

// To store patient results for progress tests
export interface ProgressTestResult {
    testId: string;
    date: string; // ISO date string
    results: { metricName: string; value: number | string }[];
    notes?: string;
}
