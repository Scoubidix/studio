# **App Name**: Mon Assistant Kiné

## Core Features:

- Patient Dashboard: Patient dashboard displaying personalized exercise programs and a button to submit feedback.
- Patient Chatbot: AI-powered tool to provide general advice on managing pain or what to do when experiencing discomfort during exercises, based on common questions. This will not provide medical diagnoses. This will be an AI tool.
- Feedback Form: A simple form to gather patient feedback on their program including pain level, difficulty, and freeform comments.

## Style Guidelines:

- Primary color: Light teal (#A0E7E5) for a calming and professional feel.
- Secondary color: Soft gray (#E5E5E5) for backgrounds and neutral elements.
- Accent: A muted green (#90EE90) to highlight key actions and information.
- Clean and spacious layout with a focus on readability and ease of navigation.
- Simple and clear icons to represent different exercises and feedback options.

## Original User Request:
Je veux créer une application complète en francais de suivi patient pour kinésithérapeutes appelée Mon Assistant Kiné, structurée comme suit :

🔥 Fonctions principales : Authentification

Utiliser Firebase Authentication

Deux types d'utilisateurs : kine et patient

Authentification par email/mot de passe

Base de données Firestore

Collection patients

id (auto)

nom

prénom

date_naissance

pathologies (array)

remarques (text)

kine_id (référence au kiné)

Collection kines

id (auto)

nom

prénom

email

spécialité

Collection exercises

id (auto)

nom

description

image_url

video_url

niveau (débutant/intermédiaire/avancé)

catégorie (renforcement/mobilité/étirement)

contre_indications (array)

Collection programmes

id (auto)

patient_id

liste_exercices (array of {exercice_id, séries, répétitions, fréquence})

statut (actif/terminé/suspendu)

date_creation

Collection feedbacks

id (auto)

programme_id

patient_id

date

douleur_moyenne (0–10)

difficulté (0–10)

fatigue (0–10)

adherence (0–100%)

commentaire_libre (text)

Pages / Composants :

Page d'inscription/login

Tableau de bord Kiné

Liste de ses patients

Détails patients (bilan initial)

Génération d'un programme d'exercices

Chatbot métier pour kiné :

Accessible depuis le dashboard kiné

Répond à des questions médicales ou sur les bonnes pratiques en kinésithérapie

Connecté à une base d'articles ou API GPT personnalisé avec prompt spécialisé "kinésithérapie"

Tableau de bord Patient

Programme personnalisé

Bouton "Remplir mon feedback"

Historique des séances

Chatbot patient :

Accessible dans le dashboard

Répond à des questions sur les exercices, la douleur, les erreurs fréquentes

Capable de donner des conseils de type "Que faire si je ressens une douleur ?" (non médical, conseil général)

Stockage Firebase Storage

Pour uploader vidéos et images d’exercices dans exercises

Fonctions Cloud

Fonction pour générer automatiquement un programme à partir des objectifs

Fonction pour ajuster le programme en fonction des feedbacks

Fonction pour alimenter les chatbots (API OpenAI ou modèle local)

Design

Utiliser TailwindCSS intégré

Interface sobre, claire, adaptée à un public de santé

Composants : cards, modals, chat interfaces

Notifications

Notifications Cloud Messaging optionnelles pour prévenir :

Le kiné en cas de feedback problématique

Le patient pour rappels d’exercices

🧠 Résultat attendu : Interface fluide Web + Mobile responsive

Navigation sécurisée selon le rôle utilisateur

Données Firestore sécurisées

Chatbot intelligent personnalisé selon l'utilisateur connecté (kine ou patient)

Architecture extensible pour futures évolutions IA ou statistiques

✨ Notes particulières : Le chatbot patient doit rester non médical (conseils d'usage, pas de diagnostic).

Le chatbot kiné doit pouvoir fournir des informations métiers précises (protocoles de rééducation, best practices, questions théoriques).

Utiliser Firebase Functions pour appeler une API IA externe si besoin.

Prévoir architecture Firestore scalable pour plusieurs milliers de patients et exercices.

Prévoir gestion RGPD : possibilité de suppression de compte et anonymisation.

🚀 Résumé rapide :

Module Fonction principale Auth Authentification email/mot de passe kiné + patient Firestore Stockage patients, programmes, exercices, feedbacks Storage Vidéos, images d'exercices Cloud Functions IA génération programme + IA ajustement + IA chatbot Frontend Dashboards, Chatbot patient, Chatbot kiné, Feedback patient Notifications Alertes kiné / rappels patient
  