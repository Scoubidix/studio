'use client';

import { useState } from 'react';
import type { ShopProgram, ProgramExercise, Exercise } from '@/interfaces';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // For exercise selection
import { PlusCircle, Edit, Trash2, Store, Loader2, BadgeDollarSign, Tag } from 'lucide-react';
import { useFieldArray, useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

// Mock Exercises for selection (replace with actual data fetch)
const mockAvailableExercises: Exercise[] = [
  { id: 'ex1', nom: 'Squat', description: '...', niveau: 'débutant', catégorie: 'renforcement' },
  { id: 'ex2', nom: 'Étirement Ischio', description: '...', niveau: 'intermédiaire', catégorie: 'étirement' },
  { id: 'ex3', nom: 'Rotation Tronc', description: '...', niveau: 'débutant', catégorie: 'mobilité' },
  { id: 'ex4', nom: 'Pont Fessier', description: '...', niveau: 'débutant', catégorie: 'renforcement' },
  { id: 'ex5', nom: 'Fente Avant', description: '...', niveau: 'intermédiaire', catégorie: 'renforcement' },
  { id: 'ex6', nom: 'Étirement Pectoraux', description: '...', niveau: 'débutant', catégorie: 'étirement' },
];

// Zod Schema for Shop Program Form
const programExerciseSchema = z.object({
  exercice_id: z.string().min(1, "Exercice requis"),
  séries: z.coerce.number().min(1, "Minimum 1 série").max(10),
  répétitions: z.coerce.number().min(1, "Minimum 1 répétition").max(100), // Allow higher reps/seconds
});

const shopProgramSchema = z.object({
  id: z.string().optional(), // Optional for new programs
  kine_id: z.string(),
  title: z.string().min(3, "Titre requis (min 3 caractères)"),
  description: z.string().min(10, "Description requise (min 10 caractères)").max(500),
  durationWeeks: z.coerce.number().min(1).optional(),
  targetAudience: z.string().min(3, "Public cible requis"),
  price: z.coerce.number().min(0, "Prix positif requis"),
  currency: z.string().default('EUR'),
  imageUrl: z.string().url("URL d'image invalide").optional().or(z.literal('')),
  tags: z.string().optional().transform(val => val ? val.split(',').map(tag => tag.trim()).filter(Boolean) : []), // Comma-separated tags
  exerciseList: z.array(programExerciseSchema).min(1, "Au moins un exercice requis"),
});

type ShopProgramFormData = z.infer<typeof shopProgramSchema>;

interface MarketplaceManagerProps {
  kineId: string;
  existingPrograms: ShopProgram[];
  onSave: (program: ShopProgram) => void;
  onDelete: (programId: string) => void;
}

export default function MarketplaceManager({ kineId, existingPrograms, onSave, onDelete }: MarketplaceManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ShopProgram | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ShopProgramFormData>({
    resolver: zodResolver(shopProgramSchema),
    defaultValues: {
        kine_id: kineId,
        title: '',
        description: '',
        durationWeeks: 4,
        targetAudience: '',
        price: 9.99,
        currency: 'EUR',
        imageUrl: '',
        tags: '', // Store as comma-separated string in form
        exerciseList: [],
    },
  });

   const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "exerciseList"
   });

  const openModal = (program: ShopProgram | null = null) => {
    setEditingProgram(program);
    if (program) {
        form.reset({
            ...program,
            tags: program.tags?.join(', ') || '', // Convert array back to string for form
        });
    } else {
        form.reset({ // Reset to default for new program
            kine_id: kineId,
            title: '', description: '', durationWeeks: 4, targetAudience: '',
            price: 9.99, currency: 'EUR', imageUrl: '', tags: '',
            exerciseList: [{ exercice_id: '', séries: 3, répétitions: 10 }], // Start with one empty exercise
        });
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: ShopProgramFormData) => {
     setIsSubmitting(true);
     // Re-transform tags string into array before saving
     const programDataToSave: ShopProgram = {
         ...data,
         tags: typeof data.tags === 'string' ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
         id: editingProgram?.id || `new_${Date.now()}` // Use existing ID or generate temporary one
     };
     try {
        await onSave(programDataToSave); // Call parent save function
        setIsModalOpen(false);
     } catch(error) {
         console.error("Error saving program", error);
         // Show error toast in parent?
     } finally {
        setIsSubmitting(false);
     }
  };

  const handleDeleteClick = (programId: string) => {
      if (window.confirm("Êtes-vous sûr de vouloir supprimer ce programme de la marketplace ?")) {
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
              <Card key={program.id} className="p-4 flex justify-between items-center border">
                <div>
                    <h4 className="font-semibold">{program.title}</h4>
                    <p className="text-sm text-muted-foreground">{program.targetAudience} - {program.price.toFixed(2)} {program.currency}</p>
                     {program.tags && program.tags.length > 0 && (
                         <div className="flex flex-wrap gap-1 mt-1">
                            {program.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                            ))}
                        </div>
                     )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openModal(program)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(program.id)}>
                    <Trash2 className="w-4 h-4" />
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
        <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingProgram ? 'Modifier le Programme' : 'Créer un Nouveau Programme'}</DialogTitle>
            <DialogDescription>
              Remplissez les détails de votre programme. Il sera visible par les patients dans la boutique.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-grow overflow-y-auto pr-6 pl-1 py-4 -mr-6">
              <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 ">
                    <Input type="hidden" {...form.register("kine_id")} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Titre du Programme</Label>
                            <Input id="title" {...form.register("title")} disabled={isSubmitting}/>
                            {form.formState.errors.title && <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="targetAudience">Public Cible</Label>
                            <Input id="targetAudience" placeholder="ex: Coureurs, Skieurs, Lombalgiques..." {...form.register("targetAudience")} disabled={isSubmitting}/>
                             {form.formState.errors.targetAudience && <p className="text-xs text-destructive">{form.formState.errors.targetAudience.message}</p>}
                        </div>
                    </div>

                     <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" rows={4} {...form.register("description")} disabled={isSubmitting}/>
                         {form.formState.errors.description && <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>}
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="durationWeeks">Durée (semaines)</Label>
                            <Input id="durationWeeks" type="number" {...form.register("durationWeeks")} disabled={isSubmitting}/>
                            {form.formState.errors.durationWeeks && <p className="text-xs text-destructive">{form.formState.errors.durationWeeks.message}</p>}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="price">Prix ({form.watch('currency')})</Label>
                            <Input id="price" type="number" step="0.01" {...form.register("price")} disabled={isSubmitting}/>
                             {form.formState.errors.price && <p className="text-xs text-destructive">{form.formState.errors.price.message}</p>}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="imageUrl">URL de l'image (Optionnel)</Label>
                            <Input id="imageUrl" type="url" placeholder="https://..." {...form.register("imageUrl")} disabled={isSubmitting}/>
                            {form.formState.errors.imageUrl && <p className="text-xs text-destructive">{form.formState.errors.imageUrl.message}</p>}
                        </div>
                    </div>
                     <div className="space-y-2">
                            <Label htmlFor="tags">Tags (séparés par virgule)</Label>
                            <Input id="tags" placeholder="ex: genou, ski, renforcement" {...form.register("tags")} disabled={isSubmitting}/>
                            {form.formState.errors.tags && <p className="text-xs text-destructive">{form.formState.errors.tags.message}</p>}
                     </div>


                    <h4 className="font-semibold pt-4 border-t">Exercices du Programme</h4>
                    <div className="space-y-3">
                         {fields.map((item, index) => (
                            <div key={item.id} className="flex items-end gap-2 p-3 border rounded-md bg-muted/30">
                                <div className="grid grid-cols-3 gap-2 flex-grow">
                                     <Controller
                                        control={form.control}
                                        name={`exerciseList.${index}.exercice_id`}
                                        render={({ field }) => (
                                            <div className="space-y-1">
                                                <Label className="text-xs">Exercice</Label>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                                    <SelectTrigger className="h-8 text-xs">
                                                        <SelectValue placeholder="Choisir..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {mockAvailableExercises.map(ex => (
                                                            <SelectItem key={ex.id} value={ex.id} className="text-xs">
                                                                {ex.nom} ({ex.catégorie})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                 {form.formState.errors.exerciseList?.[index]?.exercice_id && <p className="text-xs text-destructive">{form.formState.errors.exerciseList?.[index]?.exercice_id?.message}</p>}
                                            </div>
                                        )}
                                    />
                                     <div className="space-y-1">
                                        <Label htmlFor={`series-${index}`} className="text-xs">Séries</Label>
                                        <Input id={`series-${index}`} type="number" className="h-8 text-xs" {...form.register(`exerciseList.${index}.séries`)} disabled={isSubmitting}/>
                                         {form.formState.errors.exerciseList?.[index]?.séries && <p className="text-xs text-destructive">{form.formState.errors.exerciseList?.[index]?.séries?.message}</p>}
                                     </div>
                                     <div className="space-y-1">
                                        <Label htmlFor={`reps-${index}`} className="text-xs">Rép/Sec</Label>
                                        <Input id={`reps-${index}`} type="number" className="h-8 text-xs" {...form.register(`exerciseList.${index}.répétitions`)} disabled={isSubmitting}/>
                                        {form.formState.errors.exerciseList?.[index]?.répétitions && <p className="text-xs text-destructive">{form.formState.errors.exerciseList?.[index]?.répétitions?.message}</p>}
                                     </div>
                                </div>
                                 <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:bg-destructive/10 w-8 h-8" aria-label="Supprimer exercice" disabled={isSubmitting}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => append({ exercice_id: '', séries: 3, répétitions: 10 })} disabled={isSubmitting}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un Exercice
                        </Button>
                         {form.formState.errors.exerciseList && !form.formState.errors.exerciseList.length && <p className="text-xs text-destructive">{form.formState.errors.exerciseList.message}</p>}
                    </div>
                </form>
            </ScrollArea>
            <DialogFooter className="pt-4 border-t">
                 <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={isSubmitting}>
                        Annuler
                    </Button>
                 </DialogClose>
                 <Button type="submit" onClick={form.handleSubmit(handleFormSubmit)} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isSubmitting ? 'Sauvegarde...' : (editingProgram ? 'Sauvegarder Modifications' : 'Créer Programme')}
                 </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
