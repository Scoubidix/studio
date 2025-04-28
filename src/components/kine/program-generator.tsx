
'use client';

import React, { useState, useEffect } from 'react'; // Import React and useEffect
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox'; // Import Checkbox
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'; // Import FormDescription
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Cog } from 'lucide-react';
import type { Patient, Kine, ProgramGenerationInput, GenerateExerciseProgramOutput } from '@/interfaces'; // Import interfaces including output type
import { generateExerciseProgram } from '@/ai/flows/exercise-program-generation'; // Import Genkit flow
import ReactMarkdown from 'react-markdown'; // Import react-markdown
import { ScrollArea } from '@/components/ui/scroll-area'; // Import ScrollArea

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
  onProgramGenerated: (programDetails: GenerateExerciseProgramOutput) => void; // Update type to match Genkit output
}

export default function ProgramGenerator({ patient, kine, onProgramGenerated }: ProgramGeneratorProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProgramOutput, setGeneratedProgramOutput] = useState<GenerateExerciseProgramOutput | null>(null); // Store the full output object

  const form = useForm<ProgramGenerationFormData>({
    resolver: zodResolver(programGenerationSchema),
    defaultValues: {
      programGoals: patient.objectifs?.join(', ') || '', // Pre-fill with patient objectives
      availableEquipment: [],
      workoutDays: [],
      specificRemarks: '',
    },
  });

   // Update default goals when patient changes
   React.useEffect(() => {
      form.setValue('programGoals', patient.objectifs?.join(', ') || '');
   }, [patient, form]);


  const handleGenerateProgram = async (values: ProgramGenerationFormData) => {
    setIsGenerating(true);
    setGeneratedProgramOutput(null); // Reset previous output

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
        // Call the actual Genkit flow
        const result: GenerateExerciseProgramOutput = await generateExerciseProgram(input);
        console.log("AI Generated Program Output:", result);
        setGeneratedProgramOutput(result); // Store the output object
        onProgramGenerated(result); // Pass full output object to parent

        toast({
            title: "Programme Généré !",
            description: "L'IA a créé une proposition de programme d'un mois. Vérifiez et ajustez si besoin.",
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
    // Removed Card wrapper, assuming it's within an AccordionContent that provides padding
    // Use space-y for vertical spacing within the form area
    <div className="space-y-6">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleGenerateProgram)} className="space-y-6">
                {/* Program Goals */}
                <FormField
                control={form.control} name="programGoals"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Objectifs Spécifiques du Programme <span className="text-red-500">*</span></FormLabel>
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
                    <div className="mb-2"> {/* Reduced bottom margin */}
                        <FormLabel className="text-base">Matériel Disponible <span className="text-red-500">*</span></FormLabel>
                        <FormDescription className="text-xs">Cochez tout le matériel à disposition.</FormDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2"> {/* Adjusted gap */}
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
                    <div className="mb-2"> {/* Reduced bottom margin */}
                        <FormLabel className="text-base">Jours d'Entraînement <span className="text-red-500">*</span></FormLabel>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2"> {/* Adjusted gap */}
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

        {/* Display Generated Program */}
        {generatedProgramOutput?.exerciseProgram && !isGenerating && (
            <div className='mt-6 pt-6 border-t'>
                 <h4 className="font-semibold mb-2 text-lg">Programme Généré (Proposition IA - 1 Mois) :</h4>
                  {/* Use ScrollArea for potentially long content */}
                  <ScrollArea className="h-[500px] border rounded-md p-4 bg-muted/30">
                      {/* Render Markdown content */}
                      <ReactMarkdown
                         className="prose prose-sm dark:prose-invert max-w-none" // Basic prose styling
                         components={{ // Customize rendering if needed
                           h2: ({node, ...props}) => <h2 className="text-base font-semibold mt-4 mb-1" {...props} />, // Adjusted sizes
                           h3: ({node, ...props}) => <h3 className="text-sm font-semibold mt-3 mb-1" {...props} />, // Adjusted sizes
                           ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-0.5" {...props} />, // Adjusted spacing
                           li: ({node, ...props}) => <li className="text-xs" {...props} />,
                           p: ({node, ...props}) => <p className="text-xs mb-1" {...props} />, // Adjusted spacing
                           strong: ({node, ...props}) => <strong className="font-medium text-foreground" {...props} />,
                         }}
                       >
                          {generatedProgramOutput.exerciseProgram}
                      </ReactMarkdown>
                  </ScrollArea>
                 <p className="text-xs text-muted-foreground mt-2">
                     Vérifiez attentivement cette proposition avant de l'assigner au patient. Vous pourrez la modifier.
                 </p>
                 {/* TODO: Add button to "Assign Program" or "Edit Program" */}
                 {/* Example: <Button variant="outline" size="sm" className="mt-2">Assigner ce Programme</Button> */}
            </div>
        )}
    </div>
  );
}
