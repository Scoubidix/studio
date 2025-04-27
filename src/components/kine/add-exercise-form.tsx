
'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2, Dumbbell, Upload } from 'lucide-react';
import type { Exercise, AddExerciseFormData } from '@/interfaces'; // Import interfaces

// Zod schema for the Add Exercise form
const addExerciseSchema = z.object({
  nom: z.string().min(3, "Nom requis (min 3 caractères)."),
  description: z.string().min(10, "Description requise (min 10 caractères).").max(500),
  detailed_steps: z.array(z.object({ value: z.string().min(5, "Étape requise (min 5 caractères).") })).min(1, "Au moins une étape détaillée est requise."),
  goals: z.array(z.object({ value: z.string().min(3, "Objectif requis (min 3 caractères).") })).min(1, "Au moins un objectif est requis."),
  niveau: z.enum(['débutant', 'intermédiaire', 'avancé'], { required_error: "Niveau requis." }),
  catégorie: z.enum(['renforcement', 'mobilité', 'étirement'], { required_error: "Catégorie requise." }),
  contre_indications: z.string().optional(), // Comma-separated string
  // videoFile: z.instanceof(File).optional().nullable(), // Allow optional file upload
  // imageFile: z.instanceof(File).optional().nullable(),
  defaultSéries: z.coerce.number().min(1).optional(),
  defaultRépétitions: z.coerce.number().min(1).optional(),
});


interface AddExerciseFormProps {
  onExerciseAdded: (exerciseData: Omit<Exercise, 'id' | 'image_url' | 'video_url'>) => void; // Callback after successful (simulated) add
}

export default function AddExerciseForm({ onExerciseAdded }: AddExerciseFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // File upload state (optional for now)
  // const [videoFileName, setVideoFileName] = useState<string | null>(null);
  // const [imageFileName, setImageFileName] = useState<string | null>(null);

  const form = useForm<AddExerciseFormData>({
    resolver: zodResolver(addExerciseSchema),
    defaultValues: {
      nom: '',
      description: '',
      detailed_steps: [{ value: '' }],
      goals: [{ value: '' }],
      niveau: undefined,
      catégorie: undefined,
      contre_indications: '',
      // videoFile: null,
      // imageFile: null,
      defaultSéries: 3,
      defaultRépétitions: 10,
    },
  });

  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
    control: form.control,
    name: "detailed_steps"
  });

  const { fields: goalFields, append: appendGoal, remove: removeGoal } = useFieldArray({
    control: form.control,
    name: "goals"
  });

  const handleFormSubmit = async (values: AddExerciseFormData) => {
    setIsSubmitting(true);

    // --- TODO: Handle file uploads (get URLs) ---
    // let videoUrl: string | undefined = undefined;
    // let imageUrl: string | undefined = undefined;
    // if (values.videoFile) {
    //   console.log("Simulating video upload for:", values.videoFile.name);
    //   videoUrl = 'https://example.com/simulated-video.mp4'; // Replace with actual upload logic and URL
    //   await new Promise(resolve => setTimeout(resolve, 500)); // Simulate upload time
    // }
    // if (values.imageFile) {
    //   console.log("Simulating image upload for:", values.imageFile.name);
    //   imageUrl = 'https://picsum.photos/seed/newexercise/300/200'; // Replace with actual upload logic and URL
    //   await new Promise(resolve => setTimeout(resolve, 300));
    // }
    // --- End File Upload ---

    const exerciseData: Omit<Exercise, 'id' | 'image_url' | 'video_url'> = {
      nom: values.nom,
      description: values.description,
      detailed_steps: values.detailed_steps.map(step => step.value),
      goals: values.goals.map(goal => goal.value),
      niveau: values.niveau,
      catégorie: values.catégorie,
      contre_indications: values.contre_indications?.split(',').map(tag => tag.trim()).filter(Boolean),
      defaultDosage: {
        séries: values.defaultSéries,
        répétitions: values.defaultRépétitions,
      },
      // image_url: imageUrl, // Add URL after upload
      // video_url: videoUrl, // Add URL after upload
    };

    console.log("Simulating adding exercise:", exerciseData);

    // Simulate API call delay & process
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
       onExerciseAdded(exerciseData); // Pass data to parent for actual addition logic
       form.reset(); // Reset form on success
       // Clear file names if file upload is implemented
       // setVideoFileName(null);
       // setImageFileName(null);
       // Toast is handled in the parent
    } catch (error) {
        console.error("Error in submission process:", error);
        toast({
            title: "Erreur",
            description: "Une erreur est survenue lors de l'ajout de l'exercice.",
            variant: "destructive",
        });
    } finally {
       setIsSubmitting(false);
    }
  };

  // Handle file changes (optional)
  // const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'image') => {
  //     const file = event.target.files?.[0];
  //     if (file) {
  //         if (type === 'video') {
  //             form.setValue('videoFile', file);
  //             setVideoFileName(file.name);
  //         } else {
  //             form.setValue('imageFile', file);
  //             setImageFileName(file.name);
  //         }
  //     }
  // };


  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-primary" /> Ajouter un Nouvel Exercice
        </CardTitle>
        <CardDescription>
          Complétez la base de données avec de nouveaux exercices. Cela vous rapportera des points !
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Basic Info */}
            <FormField
              control={form.control} name="nom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l'exercice</FormLabel>
                  <FormControl><Input placeholder="ex: Squat sur une jambe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control} name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description courte</FormLabel>
                  <FormControl><Textarea placeholder="Description brève de l'exercice..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Detailed Steps */}
            <div className="space-y-3">
              <FormLabel>Étapes Détaillées</FormLabel>
              {stepFields.map((field, index) => (
                <FormField
                  key={field.id} control={form.control} name={`detailed_steps.${index}.value`}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl><Textarea placeholder={`Étape ${index + 1}`} {...field} className="flex-grow resize-none" rows={2} /></FormControl>
                       <Button type="button" variant="ghost" size="icon" onClick={() => removeStep(index)} className="text-destructive hover:bg-destructive/10 flex-shrink-0" aria-label="Supprimer étape">
                          <Trash2 className="h-4 w-4" />
                       </Button>
                      <FormMessage className="w-full col-span-2" />
                    </FormItem>
                  )}
                />
              ))}
               <Button type="button" variant="outline" size="sm" onClick={() => appendStep({ value: '' })} className="mt-1 text-xs">
                  <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une étape
               </Button>
               <FormMessage>{form.formState.errors.detailed_steps?.root?.message || form.formState.errors.detailed_steps?.message}</FormMessage>
            </div>

            {/* Goals */}
            <div className="space-y-3">
              <FormLabel>Objectifs Principaux</FormLabel>
              {goalFields.map((field, index) => (
                 <FormField
                  key={field.id} control={form.control} name={`goals.${index}.value`}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl><Input placeholder={`Objectif ${index + 1} (ex: Renforcement quadriceps)`} {...field} className="flex-grow"/></FormControl>
                       <Button type="button" variant="ghost" size="icon" onClick={() => removeGoal(index)} className="text-destructive hover:bg-destructive/10 flex-shrink-0" aria-label="Supprimer objectif">
                          <Trash2 className="h-4 w-4" />
                       </Button>
                      <FormMessage className="w-full col-span-2" />
                    </FormItem>
                  )}
                />
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => appendGoal({ value: '' })} className="mt-1 text-xs">
                  <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un objectif
               </Button>
               <FormMessage>{form.formState.errors.goals?.root?.message || form.formState.errors.goals?.message}</FormMessage>
            </div>


            {/* Category and Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control} name="niveau"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Niveau</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Choisir le niveau..." /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="débutant">Débutant</SelectItem>
                                <SelectItem value="intermédiaire">Intermédiaire</SelectItem>
                                <SelectItem value="avancé">Avancé</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control} name="catégorie"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Catégorie</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Choisir la catégorie..." /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="renforcement">Renforcement</SelectItem>
                                <SelectItem value="mobilité">Mobilité</SelectItem>
                                <SelectItem value="étirement">Étirement</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* Contraindications */}
             <FormField
                control={form.control} name="contre_indications"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Contre-indications (optionnel, séparées par virgule)</FormLabel>
                        <FormControl><Input placeholder="ex: Hernie discale active, Instabilité cheville" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Default Dosage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                    control={form.control} name="defaultSéries"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Séries (par défaut)</FormLabel>
                        <FormControl><Input type="number" min="1" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control} name="defaultRépétitions"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Répétitions/Secondes (par défaut)</FormLabel>
                        <FormControl><Input type="number" min="1" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* File Uploads (Placeholder) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className='space-y-2'>
                     <FormLabel>Vidéo Démonstration (Optionnel)</FormLabel>
                      <Button type="button" variant="outline" className='w-full justify-start' disabled>
                        <Upload className="mr-2 h-4 w-4" /> Uploader Vidéo (Bientôt)
                      </Button>
                      {/* <Input id="videoFile" type="file" accept="video/*" className="hidden" onChange={(e) => handleFileChange(e, 'video')} />
                      <Button type="button" variant="outline" className='w-full justify-start' onClick={() => document.getElementById('videoFile')?.click()} disabled={isSubmitting}>
                           <Upload className="mr-2 h-4 w-4" /> {videoFileName ? `Fichier: ${videoFileName}` : 'Choisir une vidéo'}
                      </Button>
                      {form.formState.errors.videoFile && <p className="text-xs text-destructive">{form.formState.errors.videoFile.message}</p>} */}
                 </div>
                 <div className='space-y-2'>
                     <FormLabel>Image Illustration (Optionnel)</FormLabel>
                      <Button type="button" variant="outline" className='w-full justify-start' disabled>
                        <Upload className="mr-2 h-4 w-4" /> Uploader Image (Bientôt)
                      </Button>
                      {/* <Input id="imageFile" type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'image')} />
                      <Button type="button" variant="outline" className='w-full justify-start' onClick={() => document.getElementById('imageFile')?.click()} disabled={isSubmitting}>
                           <Upload className="mr-2 h-4 w-4" /> {imageFileName ? `Fichier: ${imageFileName}` : 'Choisir une image'}
                      </Button>
                      {form.formState.errors.imageFile && <p className="text-xs text-destructive">{form.formState.errors.imageFile.message}</p>} */}
                 </div>
            </div>


            {/* Submit Button */}
            <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? 'Ajout en cours...' : 'Ajouter l\'Exercice'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
