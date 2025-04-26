'use client';

import type { Feedback } from '@/interfaces';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

// --- Schema Definition ---
const feedbackFormSchema = z.object({
  douleur_moyenne: z.number().min(0).max(10).default(0),
  difficulté: z.number().min(0).max(10).default(0),
  // fatigue removed
  // adherence removed
  commentaire_libre: z.string().max(500, "Le commentaire ne doit pas dépasser 500 caractères.").optional(),
});

type FeedbackFormData = z.infer<typeof feedbackFormSchema>;

interface FeedbackFormProps {
  programId: string;
  patientId: string;
  onFeedbackSubmitted?: () => void; // Callback for gamification trigger
  // onSubmit: (feedback: Feedback) => Promise<void>; // Add actual submit handler later
}

export default function FeedbackForm({ programId, patientId, onFeedbackSubmitted }: FeedbackFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      douleur_moyenne: 0,
      difficulté: 0,
      commentaire_libre: '',
    },
  });

  // --- Mock Submit Handler (Replace with actual API call) ---
  async function onSubmit(values: FeedbackFormData) {
     setIsSubmitting(true);
    console.log('Submitting feedback:', values);

    // Construct feedback data based on the updated schema
    const feedbackData: Omit<Feedback, 'id'> = { // Use Omit because ID is generated on save
        programme_id: programId,
        patient_id: patientId,
        date: new Date().toISOString(),
        douleur_moyenne: values.douleur_moyenne,
        difficulté: values.difficulté,
        // fatigue and adherence are no longer included
        ...(values.commentaire_libre && { commentaire_libre: values.commentaire_libre }), // Only include if provided
    };

     // Simulate API call delay
     await new Promise(resolve => setTimeout(resolve, 1500));

     // --- Replace with actual API call to save feedback ---
     // try {
     //   await saveFeedbackToFirestore(feedbackData); // Example function
         toast({
           title: "Feedback envoyé !",
           description: "Merci pour votre retour.",
           variant: "default", // Use accent color via theme
         });
         form.reset(); // Reset form after successful submission
         onFeedbackSubmitted?.(); // Trigger gamification update
     // } catch (error) {
     //   console.error("Error submitting feedback:", error);
     //   toast({
     //     title: "Erreur",
     //     description: "Impossible d'envoyer le feedback. Veuillez réessayer.",
     //     variant: "destructive",
     //   });
     // } finally {
        setIsSubmitting(false);
     // }
     // --- End Replace ---

  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Donner mon Feedback</CardTitle>
        <CardDescription>Partagez votre ressenti sur la séance d'aujourd'hui.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Pain Level */}
            <FormField
              control={form.control}
              name="douleur_moyenne"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Niveau de douleur moyen (0 = aucune, 10 = maximale)</FormLabel>
                   <FormControl>
                      <div className="flex items-center gap-4">
                        <Slider
                          min={0}
                          max={10}
                          step={1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="w-full"
                          aria-label="Niveau de douleur moyen"
                         />
                         <span className="font-semibold w-8 text-center">{field.value}</span>
                      </div>
                   </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Difficulty Level */}
             <FormField
              control={form.control}
              name="difficulté"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Niveau de difficulté perçu (0 = très facile, 10 = très difficile)</FormLabel>
                   <FormControl>
                      <div className="flex items-center gap-4">
                        <Slider
                          min={0}
                          max={10}
                          step={1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="w-full"
                          aria-label="Niveau de difficulté perçu"
                         />
                          <span className="font-semibold w-8 text-center">{field.value}</span>
                      </div>
                   </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

             {/* Fatigue Level - REMOVED */}

            {/* Adherence Level - REMOVED */}

            {/* Free Comment */}
            <FormField
              control={form.control}
              name="commentaire_libre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commentaire (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Partagez des détails supplémentaires sur votre séance..."
                      className="resize-none"
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                   <FormDescription>Des informations sur un exercice spécifique ? Une gêne particulière ?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                 {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                 {isSubmitting ? 'Envoi en cours...' : 'Envoyer mon Feedback'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
