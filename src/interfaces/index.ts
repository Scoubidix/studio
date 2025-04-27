

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
    douleur_moyenne: number; // Patient rating of pain (ressenti programme)
    difficulté: number; // Patient rating of difficulty (ressenti programme)
    commentaire_libre?: string;
}

// Interface for badges earned by patients
export interface PatientBadge {
    id: string;
    name: string; // e.g., "Patient Champion", "Sérieux Confirmé"
    description: string; // e.g., "Plus de 90% d'adhérence sur le dernier mois", "10 séances complétées d'affilée"
    icon?: string; // Icon name
    dateAwarded: string; // ISO date string
}

export interface Patient {
  id: string;
  nom: string;
  prénom: string;
  email: string;
  date_naissance: string;
  pathologies: string[];
  remarques: string; // Kine's initial assessment notes
  kine_id: string;
  objectifs: string[];
  subscriptionEndDate?: string;
  subscriptionStatus?: 'active' | 'expiring' | 'expired';
  purchasedProgramIds?: string[]; // IDs of programs bought from the shop
  progressTestResults?: ProgressTestResult[]; // Track test results
  progressPoints?: number; // For patient gamification
  pseudo?: string; // Anonymous name for leaderboards
  adherenceRatingByKine?: number; // 0-100%, rated by Kine (new)
  badges?: PatientBadge[]; // Badges earned by the patient (new)
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

// For Kine certifications/badges
export interface CertificationBadge {
    id: string;
    name: string;
    description: string;
    icon?: string; // Icon name (e.g., from lucide-react) or URL
    dateAwarded: string; // ISO date string
    pointsRequired?: number; // Points needed to achieve this badge (optional)
    isSuperKineBadge?: boolean; // Flag for special status like Superhost (new)
}

export interface Kine {
    id: string;
    nom: string;
    prénom: string;
    email: string;
    spécialité: string;
    ville?: string; // Added for local ranking example
    certifications?: CertificationBadge[]; // Kine certifications/badges
    progressPoints?: number; // For kine gamification (e.g., based on activity)
    // isSuperKine?: boolean; // Could be derived from badges or a separate flag
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
    kine_name?: string; // Added: Creator Kine Name (optional, could be populated server-side)
    kine_badges?: CertificationBadge[]; // Added: Creator badges (optional, could be populated server-side)
    title: string;
    description: string;
    durationWeeks?: number;
    targetAudience: string; // e.g., "Skiers", "Runners", "Office workers"
    price: number; // Consider using a dedicated money library in a real app
    currency: string; // e.g., "EUR"
    exerciseList: ProgramExercise[]; // The actual exercises
    imageUrl?: string;
    tags?: string[];
    rating?: number; // Added: Average rating (0-5)
    reviews?: ShopProgramReview[]; // Added: User reviews
}

// Added interface for Shop Program Reviews
export interface ShopProgramReview {
    id: string;
    reviewerName: string; // Or reviewerId if linked to user accounts
    rating: number; // 0-5 stars
    comment: string;
    date: string; // ISO date string
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
    keywords?: string[]; // Keywords for searching
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

    