
'use client';

import { useState } from 'react';
import type { ShopProgram, ProgramExercise, Exercise, Kine } from '@/interfaces';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // For exercise selection
import { Checkbox } from '@/components/ui/checkbox'; // For multi-select and certification
import { PlusCircle, Edit, Trash2, Store, Loader2, BadgeDollarSign, Tag, Info, Brain, Calendar, Clock, ListChecks, ShieldAlert, Check, Users, Target as TargetIcon } from 'lucide-react'; // Added more icons
import { useFieldArray, useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'; // Import Form components

// --- Mock Data & Options ---
const mockAvailableExercises: Exercise[] = [
  { id: 'ex1', nom: 'Squat', description: '...', niveau: 'débutant', catégorie: 'renforcement', goals:['Renfo Quads'] },
  { id: 'ex2', nom: 'Étirement Ischio', description: '...', niveau: 'intermédiaire', catégorie: 'étirement', goals:['Souplesse'] },
  { id: 'ex3', nom: 'Rotation Tronc', description: '...', niveau: 'débutant', catégorie: 'mobilité', goals:['Mobilité Tronc'] },
  { id: 'ex4', nom: 'Pont Fessier', description: '...', niveau: 'débutant', catégorie: 'renforcement', goals:['Renfo Fessiers'] },
  { id: 'ex5', nom: 'Fente Avant', description: '...', niveau: 'intermédiaire', catégorie: 'renforcement', goals:['Renfo Jambes'] },
  { id: 'ex6', nom: 'Étirement Pectoraux', description: '...', niveau: 'débutant', catégorie: 'étirement', goals:['Souplesse Pecs'] },
];

const targetAudienceOptions = [
    { id: 'debutants', label: 'Débutants' },
    { id: 'sportifs', label: 'Sportifs confirmés' },
    { id: 'seniors', label: 'Personnes âgées' },
    { id: 'adolescents', label: 'Adolescents' },
];

const therapeuticGoalOptions = [
    { id: 'renforcement', label: 'Renforcement musculaire' },
    { id: 'amplitude', label: 'Gain d’amplitude articulaire' },
    { id: 'proprioception', label: 'Proprioception / équilibre' },
    { id: 'endurance', label: 'Endurance / cardio' },
    { id: 'douleur', label: 'Diminution douleur / inflammation' },
    { id: 'retour_sport', label: 'Retour au sport' },
];

const programDurationOptions = [4, 8, 12];
const frequencyOptions = [1, 2, 3, 4, 5, 6, 7];
const sessionDurationOptions = [15, 30, 45];
const priceRange = { min: 19, max: 59 };
// --- End Mock Data & Options ---


// Zod Schema for Shop Program Form (Detailed Version)
const programExerciseSchema = z.object({
  exercice_id: z.string().min(1, "Exercice requis"),
  objectif: z.string().min(3, "Objectif requis").optional(), // Specific goal for this exercise in the program
  materielRequis: z.string().optional(), // Material needed for this exercise
  séries: z.coerce.number().min(1, "Min 1").max(10),
  répétitions: z.coerce.number().min(1, "Min 1").max(100), // Allow higher reps/seconds
});

const shopProgramSchema = z.object({
  id: z.string().optional(), // Optional for new programs
  kine_id: z.string(), // Automatically set
  // Informations générales
  title: z.string().min(5, "Titre requis (min 5 caractères)").max(100),
  summary: z.string().min(20, "Résumé requis (min 20 caractères)").max(250),
  targetAudience: z.array(z.string()).refine((value) => value.length > 0, {
    message: "Sélectionnez au moins un public cible.",
  }),
  specificPathologies: z.string().optional(), // Keywords or text
  // Objectifs thérapeutiques
  therapeuticGoals: z.array(z.string()).min(1, "Sélectionnez au moins un objectif.").max(3, "Maximum 3 objectifs."),
  // Détail des séances
  programDuration: z.coerce.number({ required_error: "Durée requise" }).refine(val => programDurationOptions.includes(val), "Sélectionnez une durée valide."),
  recommendedFrequency: z.coerce.number({ required_error: "Fréquence requise" }).refine(val => frequencyOptions.includes(val), "Sélectionnez une fréquence valide."),
  averageSessionDuration: z.coerce.number({ required_error: "Durée séance requise" }).refine(val => sessionDurationOptions.includes(val), "Sélectionnez une durée valide."),
  // Exercices inclus
  exerciseList: z.array(programExerciseSchema).min(1, "Ajoutez au moins un exercice."),
  // Sécurité & contre-indications
  majorContraindications: z.string().min(10, "Précisez les contre-indications majeures (min 10 caractères)."),
  // Détail de la vente
  price: z.coerce.number().min(priceRange.min, `Minimum ${priceRange.min}€`).max(priceRange.max, `Maximum ${priceRange.max}€`),
  currency: z.string().default('EUR'),
  // Engagement qualité
  qualityCertification: z.boolean().refine(val => val === true, {
    message: "Vous devez certifier la qualité du programme.",
  }),
  imageUrl: z.string().url("URL d'image invalide").optional().or(z.literal('')),
  tags: z.string().optional().transform(val => val ? val.split(',').map(tag => tag.trim()).filter(Boolean) : []), // Comma-separated tags
  status: z.enum(['draft', 'pending_validation', 'validated', 'rejected']).default('draft'), // Default to draft
});


type ShopProgramFormData = z.infer<typeof shopProgramSchema>;

interface MarketplaceManagerProps {
  kineId: string;
  existingPrograms: ShopProgram[];
  onSave: (program: ShopProgram) => void; // Should handle saving draft or submitting for validation
  onDelete: (programId: string) => void;
}

export default function MarketplaceManager({ kineId, existingPrograms, onSave, onDelete }: MarketplaceManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ShopProgram | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ShopProgramFormData>({
    resolver: zodResolver(shopProgramSchema),
    // Provide default values matching the detailed schema
    defaultValues: {
        kine_id: kineId,
        title: '',
        summary: '',
        targetAudience: [],
        specificPathologies: '',
        therapeuticGoals: [],
        programDuration: undefined,
        recommendedFrequency: undefined,
        averageSessionDuration: undefined,
        exerciseList: [],
        majorContraindications: '',
        price: priceRange.min, // Start at min price
        currency: 'EUR',
        qualityCertification: false,
        imageUrl: '',
        tags: '',
        status: 'draft',
    },
  });

   const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "exerciseList"
   });

  const openModal = (program: ShopProgram | null = null) => {
    setEditingProgram(program);
    if (program) {
        // Ensure default values are handled correctly if optional fields are missing
        form.reset({
            ...program,
            targetAudience: program.targetAudience || [],
            therapeuticGoals: program.therapeuticGoals || [],
            tags: program.tags?.join(', ') || '',
            price: program.price ?? priceRange.min,
            qualityCertification: program.qualityCertification ?? false,
            status: program.status ?? 'draft',
            exerciseList: program.exerciseList || [],
            // Ensure numeric fields have defaults if potentially missing
            programDuration: program.programDuration,
            recommendedFrequency: program.recommendedFrequency,
            averageSessionDuration: program.averageSessionDuration,
        });
    } else {
        // Reset to default for new program, including an initial empty exercise
        form.reset({
            kine_id: kineId, title: '', summary: '', targetAudience: [], specificPathologies: '',
            therapeuticGoals: [], programDuration: undefined, recommendedFrequency: undefined,
            averageSessionDuration: undefined, exerciseList: [{ exercice_id: '', séries: 3, répétitions: 10, objectif: '', materielRequis: '' }],
            majorContraindications: '', price: priceRange.min, currency: 'EUR',
            qualityCertification: false, imageUrl: '', tags: '', status: 'draft',
        });
    }
    setIsModalOpen(true);
  };

   // Determine if the form is valid (used to enable submit button)
   const isValid = form.formState.isValid;

  const handleFormSubmit = async (data: ShopProgramFormData) => {
     setIsSubmitting(true);
     const programDataToSave: ShopProgram = {
         ...data,
         status: 'pending_validation', // Set status to pending when submitting
         tags: typeof data.tags === 'string' ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
         id: editingProgram?.id || `new_${Date.now()}`
     };
     try {
        console.log("Submitting program for validation:", programDataToSave);
        await onSave(programDataToSave); // Call parent save function
        setIsModalOpen(false);
     } catch(error) {
         console.error("Error submitting program", error);
     } finally {
        setIsSubmitting(false);
     }
  };

    const handleSaveDraft = async () => {
        // You might want less stringent validation for drafts, or use form.getValues()
        const data = form.getValues(); // Get current form values without triggering full validation
        setIsSubmitting(true);
         const programDataToSave: ShopProgram = {
            ...data,
            status: 'draft', // Explicitly set status to draft
            tags: typeof data.tags === 'string' ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
            id: editingProgram?.id || `new_${Date.now()}`
         };
        try {
            console.log("Saving program as draft:", programDataToSave);
            await onSave(programDataToSave); // Call parent save function
            setIsModalOpen(false);
        } catch(error) {
            console.error("Error saving draft", error);
        } finally {
            setIsSubmitting(false);
        }
    };

  const handleDeleteClick = (programId: string) => {
      if (window.confirm("Êtes-vous sûr de vouloir supprimer ce programme ?")) {
          onDelete(programId);
      }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" /> Gestion Marketplace
            </CardTitle>
            <CardDescription>Créez et gérez les programmes que vous proposez à la vente.</CardDescription>
        </div>
        <Button onClick={() => openModal()}>
            <PlusCircle className="mr-2 h-4 w-4" /> Créer un Programme
        </Button>
      </CardHeader>
      <CardContent>
        {existingPrograms.length > 0 ? (
          <div className="space-y-4">
            {existingPrograms.map((program) => (
              <Card key={program.id} className="p-4 flex flex-col md:flex-row justify-between md:items-center border gap-2">
                 <div className="flex-grow">
                    <div className="flex items-center gap-2">
                         <Badge variant={program.status === 'validated' ? 'default' : program.status === 'pending_validation' ? 'secondary' : 'outline'} className="text-xs">
                             {program.status === 'validated' ? 'Validé' : program.status === 'pending_validation' ? 'En attente' : 'Brouillon'}
                         </Badge>
                         <h4 className="font-semibold">{program.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        {/* Ensure targetAudience is an array before joining */}
                        {Array.isArray(program.targetAudience) ? program.targetAudience.join(', ') : program.targetAudience} - {program.price?.toFixed(2)} {program.currency}
                    </p>
                     {program.tags && program.tags.length > 0 && (
                         <div className="flex flex-wrap gap-1 mt-1">
                            {program.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                            ))}
                        </div>
                     )}
                </div>
                <div className="flex gap-2 flex-shrink-0 self-end md:self-center">
                  <Button variant="outline" size="sm" onClick={() => openModal(program)}>
                    <Edit className="w-4 h-4 mr-1 md:mr-0" /> <span className="md:hidden">Modifier</span>
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(program.id)}>
                    <Trash2 className="w-4 h-4 mr-1 md:mr-0" /> <span className="md:hidden">Supprimer</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Vous n'avez créé aucun programme pour la marketplace.</p>
        )}
      </CardContent>

      {/* Add/Edit Program Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingProgram ? 'Modifier le Programme' : 'Créer un Nouveau Programme'}</DialogTitle>
            <DialogDescription>
              Remplissez tous les champs requis. Les programmes sont soumis à validation avant publication.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}> {/* Wrap with Form provider */}
              <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex-grow overflow-hidden flex flex-col">
               <ScrollArea className="flex-grow overflow-y-auto pr-6 pl-1 py-4 -mr-6">
                  <div className="space-y-6">
                    {/* --- Section: Informations Générales --- */}
                    <fieldset className="space-y-4 border p-4 rounded-md">
                        <legend className="text-lg font-semibold flex items-center gap-2 px-1"><Info className="w-5 h-5 text-primary"/>Informations Générales</legend>
                         <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Titre du Programme <span className="text-red-500">*</span></FormLabel>
                                <FormControl><Input placeholder="ex: Rééducation LCA - Niveau Débutant" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                         <FormField control={form.control} name="summary" render={({ field }) => (
                             <FormItem>
                                 <FormLabel>Résumé du Programme <span className="text-red-500">*</span> (max 250 caractères)</FormLabel>
                                 <FormControl><Textarea placeholder="Programme progressif pour retrouver force et mobilité..." {...field} rows={3} maxLength={250} /></FormControl>
                                 <FormMessage />
                             </FormItem>
                         )}/>
                          <FormField control={form.control} name="targetAudience" render={() => (
                            <FormItem>
                                <FormLabel>Public Cible <span className="text-red-500">*</span> (choix multiple)</FormLabel>
                                <div className="grid grid-cols-2 gap-2">
                                    {targetAudienceOptions.map((item) => (
                                        <FormField key={item.id} control={form.control} name="targetAudience" render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(item.id)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                            ? field.onChange([...(field.value ?? []), item.id])
                                                            : field.onChange((field.value ?? []).filter(value => value !== item.id));
                                                        }}/>
                                                </FormControl>
                                                <FormLabel className="font-normal">{item.label}</FormLabel>
                                            </FormItem>
                                        )}/>
                                    ))}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="specificPathologies" render={({ field }) => (
                             <FormItem>
                                 <FormLabel>Pathologies Spécifiques (optionnel)</FormLabel>
                                 <FormControl><Input placeholder="ex: LCA, coiffe des rotateurs, arthrose genou..." {...field} /></FormControl>
                                 <FormDescription className="text-xs">Mots-clés pour aider les patients à trouver votre programme.</FormDescription>
                             </FormItem>
                         )}/>
                         <FormField control={form.control} name="tags" render={({ field }) => (
                             <FormItem>
                                <FormLabel>Tags (séparés par virgule, optionnel)</FormLabel>
                                <FormControl><Input placeholder="ex: genou, ski, renforcement" {...field} /></FormControl>
                             </FormItem>
                         )}/>
                         <FormField control={form.control} name="imageUrl" render={({ field }) => (
                             <FormItem>
                                 <FormLabel>URL de l'image (Optionnel)</FormLabel>
                                 <FormControl><Input type="url" placeholder="https://..." {...field} /></FormControl>
                                 <FormMessage />
                             </FormItem>
                         )}/>
                    </fieldset>

                     {/* --- Section: Objectifs Thérapeutiques --- */}
                     <fieldset className="space-y-4 border p-4 rounded-md">
                        <legend className="text-lg font-semibold flex items-center gap-2 px-1"><TargetIcon className="w-5 h-5 text-primary"/>Objectifs Thérapeutiques</legend>
                         <FormField control={form.control} name="therapeuticGoals" render={() => (
                            <FormItem>
                                <FormLabel>Objectifs Principaux <span className="text-red-500">*</span> (max 3 choix)</FormLabel>
                                <div className="grid grid-cols-2 gap-2">
                                    {therapeuticGoalOptions.map((item) => (
                                        <FormField key={item.id} control={form.control} name="therapeuticGoals" render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(item.id)}
                                                        disabled={!field.value?.includes(item.id) && field.value?.length >= 3} // Disable if 3 already checked
                                                        onCheckedChange={(checked) => {
                                                            const currentSelection = field.value ?? [];
                                                            if (checked) {
                                                                if (currentSelection.length < 3) {
                                                                    field.onChange([...currentSelection, item.id]);
                                                                }
                                                            } else {
                                                                field.onChange(currentSelection.filter(value => value !== item.id));
                                                            }
                                                        }}/>
                                                </FormControl>
                                                <FormLabel className="font-normal">{item.label}</FormLabel>
                                            </FormItem>
                                        )}/>
                                    ))}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </fieldset>

                     {/* --- Section: Détail des Séances --- */}
                    <fieldset className="space-y-4 border p-4 rounded-md">
                         <legend className="text-lg font-semibold flex items-center gap-2 px-1"><Calendar className="w-5 h-5 text-primary"/>Détail des Séances</legend>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField control={form.control} name="programDuration" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Durée Programme <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {programDurationOptions.map(opt => <SelectItem key={opt} value={opt.toString()}>{opt} semaines</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                             <FormField control={form.control} name="recommendedFrequency" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fréquence / Semaine <span className="text-red-500">*</span></FormLabel>
                                     <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {frequencyOptions.map(opt => <SelectItem key={opt} value={opt.toString()}>{opt} séance{opt > 1 ? 's' : ''}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                             <FormField control={form.control} name="averageSessionDuration" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Durée Séance Moy. <span className="text-red-500">*</span></FormLabel>
                                     <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {sessionDurationOptions.map(opt => <SelectItem key={opt} value={opt.toString()}>{opt} min</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </div>
                    </fieldset>

                     {/* --- Section: Exercices Inclus --- */}
                    <fieldset className="space-y-4 border p-4 rounded-md">
                        <legend className="text-lg font-semibold flex items-center gap-2 px-1"><ListChecks className="w-5 h-5 text-primary"/>Exercices Inclus</legend>
                         <div className="space-y-3">
                             {fields.map((item, index) => (
                                <div key={item.id} className="flex items-start gap-2 p-3 border rounded-md bg-muted/30 relative">
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-x-3 gap-y-2 flex-grow">
                                         <FormField control={form.control} name={`exerciseList.${index}.exercice_id`} render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel className="text-xs">Exercice <span className="text-red-500">*</span></FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Choisir..." /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {mockAvailableExercises.map(ex => <SelectItem key={ex.id} value={ex.id} className="text-xs">{ex.nom} ({ex.catégorie})</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-xs"/>
                                            </FormItem>
                                        )}/>
                                         <FormField control={form.control} name={`exerciseList.${index}.objectif`} render={({ field }) => (
                                            <FormItem className="md:col-span-3">
                                                <FormLabel className="text-xs">Objectif Spécifique</FormLabel>
                                                <FormControl><Input className="h-8 text-xs" placeholder="ex: Renforcer Vaste Interne" {...field} /></FormControl>
                                                <FormMessage className="text-xs"/>
                                            </FormItem>
                                        )}/>
                                         <FormField control={form.control} name={`exerciseList.${index}.materielRequis`} render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel className="text-xs">Matériel Requis</FormLabel>
                                                <FormControl><Input className="h-8 text-xs" placeholder="ex: Élastique rouge, poids 2kg" {...field} /></FormControl>
                                                <FormMessage className="text-xs"/>
                                            </FormItem>
                                        )}/>
                                         <FormField control={form.control} name={`exerciseList.${index}.séries`} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Séries <span className="text-red-500">*</span></FormLabel>
                                                <FormControl><Input type="number" min="1" className="h-8 text-xs" {...field} /></FormControl>
                                                <FormMessage className="text-xs"/>
                                            </FormItem>
                                        )}/>
                                         <FormField control={form.control} name={`exerciseList.${index}.répétitions`} render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Rép/Sec <span className="text-red-500">*</span></FormLabel>
                                                <FormControl><Input type="number" min="1" className="h-8 text-xs" {...field} /></FormControl>
                                                <FormMessage className="text-xs"/>
                                            </FormItem>
                                        )}/>
                                    </div>
                                     <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:bg-destructive/10 w-8 h-8 absolute top-1 right-1" aria-label="Supprimer exercice">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => append({ exercice_id: '', séries: 3, répétitions: 10, objectif: '', materielRequis: '' })}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un Exercice
                            </Button>
                            <FormMessage>{form.formState.errors.exerciseList && !Array.isArray(form.formState.errors.exerciseList) ? form.formState.errors.exerciseList.message : null}</FormMessage> {/* Display root message */}
                         </div>
                    </fieldset>

                     {/* --- Section: Sécurité & Contre-indications --- */}
                     <fieldset className="space-y-4 border p-4 rounded-md">
                         <legend className="text-lg font-semibold flex items-center gap-2 px-1"><ShieldAlert className="w-5 h-5 text-primary"/>Sécurité & Contre-indications</legend>
                         <FormField control={form.control} name="majorContraindications" render={({ field }) => (
                             <FormItem>
                                 <FormLabel>Contre-indications Majeures <span className="text-red-500">*</span></FormLabel>
                                 <FormControl><Textarea placeholder="Pour qui ce programme est-il déconseillé ? Soyez précis." {...field} rows={3} /></FormControl>
                                 <FormDescription className="text-xs">Ex: "Personnes avec douleur aiguë non diagnostiquée", "Instabilité ligamentaire sévère non opérée"</FormDescription>
                                 <FormMessage />
                             </FormItem>
                         )}/>
                    </fieldset>

                     {/* --- Section: Détail de la Vente --- */}
                     <fieldset className="space-y-4 border p-4 rounded-md">
                         <legend className="text-lg font-semibold flex items-center gap-2 px-1"><BadgeDollarSign className="w-5 h-5 text-primary"/>Détail de la Vente</legend>
                         <FormField control={form.control} name="price" render={({ field }) => (
                             <FormItem>
                                 <FormLabel>Prix Souhaité (TTC en {form.watch('currency')}) <span className="text-red-500">*</span></FormLabel>
                                 <FormControl><Input type="number" step="0.01" min={priceRange.min} max={priceRange.max} {...field} /></FormControl>
                                 <FormDescription className="text-xs">Prix autorisé entre {priceRange.min}€ et {priceRange.max}€.</FormDescription>
                                 <FormMessage />
                             </FormItem>
                         )}/>
                     </fieldset>

                      {/* --- Section: Engagement Qualité --- */}
                     <fieldset className="space-y-4 border p-4 rounded-md">
                         <legend className="text-lg font-semibold flex items-center gap-2 px-1"><Check className="w-5 h-5 text-primary"/>Engagement Qualité</legend>
                          <FormField control={form.control} name="qualityCertification" render={({ field }) => (
                             <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow bg-background">
                                 <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                 <div className="space-y-1 leading-none">
                                    <FormLabel className="text-sm">Certification sur l'Honneur <span className="text-red-500">*</span></FormLabel>
                                    <FormDescription className="text-xs">
                                        Je certifie que ce programme respecte les bonnes pratiques professionnelles, est destiné à un usage éducatif et de rééducation, et que je suis diplômé(e) d’État en kinésithérapie.
                                    </FormDescription>
                                     <FormMessage /> {/* Display error message here */}
                                 </div>
                             </FormItem>
                         )}/>
                     </fieldset>
                 </div>
              </ScrollArea>
               {/* Keep buttons outside scroll area */}
                <DialogFooter className="pt-4 border-t mt-4 flex-shrink-0">
                    <Button type="button" variant="outline" onClick={handleSaveDraft} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Enregistrer Brouillon
                    </Button>
                    <Button type="submit" disabled={isSubmitting || !isValid} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {editingProgram?.status === 'validated' ? 'Soumettre Modifications' : 'Envoyer pour Validation'}
                    </Button>
                </DialogFooter>
            </form>
           </Form> {/* Close Form provider */}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
