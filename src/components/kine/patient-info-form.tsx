// @refresh reset - Prevent error during compilation
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider'; // Import Slider
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from 'react';
import type { Patient } from '@/interfaces';
import { Loader2, PlusCircle, Trash2, CalendarIcon } from 'lucide-react'; // Added CalendarIcon back
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Define Zod schema for the form based on the Patient interface
const patientInfoSchema = z.object({
  prénom: z.string().min(1, "Le prénom est requis."),
  nom: z.string().min(1, "Le nom est requis."),
  date_naissance: z.date({ required_error: "La date de naissance est requise."}),
  pathologies: z.array(z.object({ value: z.string().min(1, "La pathologie ne peut pas être vide.") })).min(1, "Au moins une pathologie est requise."),
  objectifs: z.array(z.object({ value: z.string().min(1, "L'objectif ne peut pas être vide.") })).min(1, "Au moins un objectif est requis."),
  remarques: z.string().max(1000, "Les remarques ne doivent pas dépasser 1000 caractères.").optional(),
  adherenceRatingByKine: z.number().min(0).max(100).optional(), // Add adherence rating
});

type PatientFormData = z.infer<typeof patientInfoSchema>;

interface PatientInfoFormProps {
  patient: Patient; // Pass the full patient object
  onSave: (updatedPatientData: Patient) => void; // Updated callback type
}

export default function PatientInfoForm({ patient, onSave }: PatientInfoFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientInfoSchema),
    defaultValues: {
        prénom: '',
        nom: '',
        date_naissance: undefined, // Initialize as undefined
        pathologies: [],
        objectifs: [],
        remarques: '',
        adherenceRatingByKine: 50, // Default adherence rating
    },
  });

  // Use field arrays for pathologies and objectifs
  const { fields: pathologyFields, append: appendPathology, remove: removePathology } = useFieldArray({
    control: form.control,
    name: "pathologies"
  });
  const { fields: objectiveFields, append: appendObjective, remove: removeObjective } = useFieldArray({
    control: form.control,
    name: "objectifs"
  });


  // Reset form when patient changes
  useEffect(() => {
    if (patient) {
      form.reset({
        prénom: patient.prénom,
        nom: patient.nom,
        date_naissance: patient.date_naissance ? new Date(patient.date_naissance) : undefined,
        pathologies: patient.pathologies.map(p => ({ value: p })),
        objectifs: patient.objectifs.map(o => ({ value: o })),
        remarques: patient.remarques || '',
        adherenceRatingByKine: patient.adherenceRatingByKine ?? 50, // Use existing or default
      });
    }
  }, [patient, form]);

  // --- Mock Submit Handler (Replace with actual API call) ---
  async function onSubmit(values: PatientFormData) {
    setIsSubmitting(true);
    console.log('Updating patient info:', values);

    // Prepare data for saving (convert back to string arrays and format date)
    const updatedPatientData: Patient = {
        ...patient, // Keep existing fields like id, kine_id, badges, etc.
        prénom: values.prénom,
        nom: values.nom,
        date_naissance: format(values.date_naissance, 'yyyy-MM-dd'), // Format date back to string
        pathologies: values.pathologies.map(p => p.value),
        objectifs: values.objectifs.map(o => o.value),
        remarques: values.remarques || '',
        adherenceRatingByKine: values.adherenceRatingByKine,
    };

    console.log('Data to save:', updatedPatientData);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // --- Replace with actual API call to update patient in Firestore ---
    try {
       onSave(updatedPatientData); // Call parent save function with the complete updated patient object
       // Toast is handled in the parent
    } catch (error) {
      console.error("Error updating patient:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les informations du patient.",
        variant: "destructive",
      });
    } finally {
       setIsSubmitting(false);
    }
    // --- End Replace ---
  }

  return (
      <div className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="prénom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl><Input placeholder="Jean" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl><Input placeholder="Dupont" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

             <FormField
                control={form.control}
                name="date_naissance"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Date de naissance</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                            {field.value ? format(field.value, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single" selected={field.value} onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus locale={fr} captionLayout="dropdown-buttons"
                            fromYear={1900} toYear={new Date().getFullYear()}
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
             />

            <div className="space-y-3">
              <FormLabel>Pathologies / Diagnostic</FormLabel>
              {pathologyFields.map((field, index) => (
                <FormField
                  key={field.id} control={form.control} name={`pathologies.${index}.value`}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl><Input placeholder={`Pathologie ${index + 1}`} {...field} className="flex-grow" /></FormControl>
                       <Button type="button" variant="ghost" size="icon" onClick={() => removePathology(index)} className="text-destructive hover:bg-destructive/10 flex-shrink-0" aria-label="Supprimer pathologie">
                          <Trash2 className="h-4 w-4" />
                       </Button>
                      <FormMessage className="w-full col-span-2" />
                    </FormItem>
                  )}
                />
              ))}
               <Button type="button" variant="outline" size="sm" onClick={() => appendPathology({ value: '' })} className="mt-1 text-xs">
                  <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une pathologie
               </Button>
               <FormMessage>{form.formState.errors.pathologies?.root?.message || form.formState.errors.pathologies?.message}</FormMessage>
            </div>

            <div className="space-y-3">
              <FormLabel>Objectifs du patient</FormLabel>
              {objectiveFields.map((field, index) => (
                 <FormField
                  key={field.id} control={form.control} name={`objectifs.${index}.value`}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl><Input placeholder={`Objectif ${index + 1}`} {...field} className="flex-grow"/></FormControl>
                       <Button type="button" variant="ghost" size="icon" onClick={() => removeObjective(index)} className="text-destructive hover:bg-destructive/10 flex-shrink-0" aria-label="Supprimer objectif">
                          <Trash2 className="h-4 w-4" />
                       </Button>
                      <FormMessage className="w-full col-span-2" />
                    </FormItem>
                  )}
                />
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => appendObjective({ value: '' })} className="mt-1 text-xs">
                  <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un objectif
               </Button>
               <FormMessage>{form.formState.errors.objectifs?.root?.message || form.formState.errors.objectifs?.message}</FormMessage>
            </div>

            <FormField
              control={form.control} name="remarques"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarques / Bilan initial</FormLabel>
                  <FormControl><Textarea placeholder="Ajoutez des détails importants sur le patient..." className="resize-none" {...field} rows={5} /></FormControl>
                  <FormDescription>Ces notes seront utiles pour le suivi et la génération du programme.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

             {/* Adherence Rating */}
             <FormField
                control={form.control}
                name="adherenceRatingByKine"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Évaluation de l'Adhérence du Patient (%)</FormLabel>
                    <FormControl>
                        <div className="flex items-center gap-4">
                        <Slider
                            min={0} max={100} step={5}
                            value={[field.value ?? 50]} // Use default if undefined
                            onValueChange={(value) => field.onChange(value[0])}
                            className="w-full"
                            aria-label="Évaluation de l'adhérence du patient"
                        />
                        <span className="font-semibold w-12 text-center">{field.value ?? 50}%</span>
                        </div>
                    </FormControl>
                    <FormDescription>Notez l'adhérence globale du patient au programme.</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
            />


            <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </form>
        </Form>
      </div>
  );
}
