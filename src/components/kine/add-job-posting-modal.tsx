
'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Briefcase, PlusCircle } from 'lucide-react';
import type { JobPosting } from '@/interfaces';

// Zod Schema for the Job Posting Form
const addJobPostingSchema = z.object({
  title: z.string().min(5, "Titre requis (min 5 caractères).").max(100),
  description: z.string().min(20, "Description requise (min 20 caractères).").max(1000),
  location: z.string().min(3, "Lieu requis."),
  type: z.enum(['remplacement', 'assistanat', 'collaboration'], { required_error: "Type de poste requis." }),
  startDate: z.string().optional(), // Optional for non-replacements
  endDate: z.string().optional(), // Optional for non-replacements
  contactEmail: z.string().email("Adresse e-mail de contact invalide."),
}).refine(data => {
    // If type is 'remplacement', require startDate and endDate
    if (data.type === 'remplacement') {
        return !!data.startDate && !!data.endDate;
    }
    return true;
}, {
    message: "Les dates de début et de fin sont requises pour un remplacement.",
    path: ['startDate'], // Can also point to endDate or be general
});


type AddJobPostingFormData = z.infer<typeof addJobPostingSchema>;

interface AddJobPostingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<JobPosting, 'id' | 'kineId' | 'kineName' | 'publishDate' | 'status'>) => void;
}

export default function AddJobPostingModal({ isOpen, onClose, onSubmit }: AddJobPostingModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddJobPostingFormData>({
    resolver: zodResolver(addJobPostingSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      type: undefined,
      startDate: '',
      endDate: '',
      contactEmail: '',
    },
  });

  const handleFormSubmit = async (values: AddJobPostingFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values); // Pass data to parent submit handler
      form.reset(); // Reset form on success
      // Toast is handled in the parent component
    } catch (error) {
      console.error("Error submitting job posting:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la publication de l'annonce.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      // Keep modal open on error, onClose handled by parent on success
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      onClose();
    }
  };

  const watchType = form.watch('type'); // Watch the type field for conditional rendering

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" /> Publier une Nouvelle Annonce
          </DialogTitle>
          <DialogDescription>
            Partagez une opportunité professionnelle avec la communauté des kinésithérapeutes.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control} name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre de l'annonce <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input placeholder="Ex: Recherche Remplaçant(e) Urgent" {...field} disabled={isSubmitting} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control} name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description du poste <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Textarea placeholder="Décrivez le poste, le cabinet, la patientèle..." {...field} disabled={isSubmitting} rows={5} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control} name="location"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Lieu (Ville / Quartier) <span className="text-red-500">*</span></FormLabel>
                        <FormControl><Input placeholder="Paris 15e" {...field} disabled={isSubmitting} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control} name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Type de poste <span className="text-red-500">*</span></FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Choisir le type..." /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="remplacement">Remplacement</SelectItem>
                                    <SelectItem value="assistanat">Assistanat</SelectItem>
                                    <SelectItem value="collaboration">Collaboration</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

             {/* Conditional Date Fields for Remplacement */}
             {watchType === 'remplacement' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 border rounded-md bg-muted/30">
                     <FormField
                         control={form.control} name="startDate"
                         render={({ field }) => (
                             <FormItem>
                                 <FormLabel>Date de début <span className="text-red-500">*</span></FormLabel>
                                 <FormControl><Input type="date" {...field} disabled={isSubmitting} /></FormControl>
                                 <FormMessage />
                             </FormItem>
                         )}
                     />
                     <FormField
                         control={form.control} name="endDate"
                         render={({ field }) => (
                             <FormItem>
                                 <FormLabel>Date de fin <span className="text-red-500">*</span></FormLabel>
                                 <FormControl><Input type="date" {...field} disabled={isSubmitting} /></FormControl>
                                 <FormMessage />
                             </FormItem>
                         )}
                     />
                 </div>
             )}

            <FormField
              control={form.control} name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email de contact <span className="text-red-500">*</span></FormLabel>
                  <FormControl><Input type="email" placeholder="votre.email@example.com" {...field} disabled={isSubmitting} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Annuler
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                {isSubmitting ? 'Publication...' : 'Publier l\'Annonce'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
