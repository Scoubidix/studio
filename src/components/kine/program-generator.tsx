
'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox'; // Import Checkbox
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Cog } from 'lucide-react';
import type { Patient, Kine, ProgramGenerationInput } from '@/interfaces';
import { generateExerciseProgram } from '@/ai/flows/exercise-program-generation'; // Import Genkit flow

// --- Available Equipment Options ---
const equipmentOptions = [
  { id: 'elastiques', label: 'Élastiques' },
  { id: 'halteres', label: 'Haltères / Poids Libres' },
  { id: 'tapis', label: 'Tapis de Sol' },
  { id: 'ballon', label: 'Ballon de Gym (Swiss Ball)' },
  { id: 'aucun', label: 'Aucun Matériel Spécifique' },
];

// --- Workout Days Options ---
const workoutDaysOptions = [
  { id: 'lundi', label: 'Lundi' },
  { id: 'mardi', label: 'Mardi' },
  { id: 'mercredi', label: 'Mercredi' },
  { id: 'jeudi', label: 'Jeudi' },
  { id: 'vendredi', label: 'Vendredi' },
  { id: 'samedi', label: 'Samedi' },
  { id: 'dimanche', label: 'Dimanche' },
];


// --- Zod Schema for Program Generation Form ---
const programGenerationSchema = z.object({
  programGoals: z.string().min(10, "Objectifs requis (min 10 caractères)."),
  availableEquipment: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "Sélectionnez au moins une option de matériel.",
  }),
  workoutDays: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "Sélectionnez au moins un jour d'entraînement.",
  }),
  specificRemarks: z.string().max(500).optional(),
});

type ProgramGenerationFormData = z.infer<typeof programGenerationSchema>;

interface ProgramGeneratorProps {
  patient: Patient;
  kine: Kine;
  onProgramGenerated: (programDetails: any) => void; // Define more specific type later
}

export default function ProgramGenerator({ patient, kine, onProgramGenerated }: ProgramGeneratorProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProgram, setGeneratedProgram] = useState<string | null>(null);

  const form = useForm<ProgramGenerationFormData>({
    resolver: zodResolver(programGenerationSchema),
    defaultValues: {
      programGoals: '',
      availableEquipment: [],
      workoutDays: [],
      specificRemarks: '',
    },
  });

  const handleGenerateProgram = async (values: ProgramGenerationFormData) => {
    setIsGenerating(true);
    setGeneratedProgram(null);

    const input: ProgramGenerationInput = {
        patientCondition: patient.pathologies.join(', ') || 'Non spécifié',
        patientGoals: values.programGoals,
        patientLimitations: patient.remarques || 'Aucune remarque spécifique', // Use patient 'remarques' as limitations for now
        kineSpecialty: kine.spécialité,
        availableEquipment: values.availableEquipment,
        workoutDays: values.workoutDays,
        specificRemarks: values.specificRemarks,
    };

    console.log("Sending data to AI for program generation:", input);

    try {
        const result = await generateExerciseProgram(input); // Call Genkit flow
        console.log("AI Generated Program (Raw):", result.exerciseProgram);
        setGeneratedProgram(result.exerciseProgram); // Display the raw program for now
        onProgramGenerated(result.exerciseProgram); // Pass raw data to parent

        toast({
            title: "Programme Généré !",
            description: "L'IA a créé une proposition de programme. Vérifiez et ajustez si besoin.",
        });

    } catch (error) {
        console.error("Error generating program:", error);
        toast({
            title: "Erreur de Génération",
            description: "Impossible de générer le programme via l'IA. Veuillez réessayer.",
            variant: "destructive",
        });
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cog className="w-5 h-5 text-primary" /> Générateur de Programme IA
        </CardTitle>
        <CardDescription>
          Configurez les paramètres pour que l'IA génère un programme personnalisé pour <span className="font-semibold">{patient.prénom} {patient.nom}</span>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleGenerateProgram)} className="space-y-6">
            {/* Program Goals */}
            <FormField
              control={form.control} name="programGoals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objectifs Spécifiques du Programme</FormLabel>
                  <FormControl><Textarea placeholder="ex: Réduire la douleur lombaire de 50% en 4 semaines, reprendre la course 10min sans douleur..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

             {/* Available Equipment */}
            <FormField
              control={form.control} name="availableEquipment"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Matériel Disponible chez le Patient</FormLabel>
                    <FormDescription>Cochez tout le matériel à disposition.</FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {equipmentOptions.map((item) => (
                      <FormField
                        key={item.id} control={form.control} name="availableEquipment"
                        render={({ field }) => {
                          return (
                            <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value ?? []), item.id])
                                      : field.onChange(
                                          (field.value ?? []).filter(
                                            (value) => value !== item.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">{item.label}</FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                   </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Workout Days */}
            <FormField
              control={form.control} name="workoutDays"
              render={() => (
                <FormItem>
                   <div className="mb-4">
                    <FormLabel className="text-base">Jours d'Entraînement Souhaités</FormLabel>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {workoutDaysOptions.map((item) => (
                      <FormField
                        key={item.id} control={form.control} name="workoutDays"
                        render={({ field }) => {
                          return (
                            <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value ?? []), item.id])
                                      : field.onChange(
                                          (field.value ?? []).filter(
                                            (value) => value !== item.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">{item.label}</FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                   </div>
                  <FormMessage />
                </FormItem>
              )}
            />


             {/* Specific Remarks */}
            <FormField
              control={form.control} name="specificRemarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarques Particulières pour l'IA (optionnel)</FormLabel>
                  <FormControl><Textarea placeholder="ex: Insister sur les étirements, éviter les exercices en charge axiale..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button type="submit" disabled={isGenerating} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {isGenerating ? 'Génération en cours...' : 'Générer le Programme via IA'}
            </Button>
          </form>
        </Form>

        {/* Display Generated Program (Raw Text for now) */}
        {generatedProgram && !isGenerating && (
            <div className='mt-6 pt-6 border-t'>
                 <h4 className="font-semibold mb-2">Programme Généré (Proposition IA) :</h4>
                 <Textarea readOnly value={generatedProgram} rows={15} className='text-xs bg-muted/30' />
                 <p className="text-xs text-muted-foreground mt-2">
                     Vérifiez attentivement cette proposition avant de l'assigner au patient. Vous pourrez la modifier.
                 </p>
                 {/* TODO: Add button to "Assign Program" or "Edit Program" */}
            </div>
        )}

      </CardContent>
    </Card>
  );
}
