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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus } from 'lucide-react';
import type { Patient } from '@/interfaces';

// Schema for the basic patient information needed for creation
const addPatientSchema = z.object({
  prénom: z.string().min(1, "Le prénom est requis."),
  nom: z.string().min(1, "Le nom est requis."),
  email: z.string().email("L'adresse e-mail n'est pas valide."),
  date_naissance: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide (YYYY-MM-DD).").optional(), // Keep as string for now, simplify input
});

type AddPatientFormData = z.infer<typeof addPatientSchema>;

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientAdded: (patientData: Omit<Patient, 'id' | 'kine_id' | 'pathologies' | 'remarques' | 'objectifs'>) => void; // Callback with essential data
}

export default function AddPatientModal({ isOpen, onClose, onPatientAdded }: AddPatientModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddPatientFormData>({
    resolver: zodResolver(addPatientSchema),
    defaultValues: {
      prénom: '',
      nom: '',
      email: '',
      date_naissance: '',
    },
  });

  const handleSubmit = async (values: AddPatientFormData) => {
    setIsSubmitting(true);

    // Prepare data (minimal for creation)
    const patientData = {
        prénom: values.prénom,
        nom: values.nom,
        email: values.email,
        date_naissance: values.date_naissance || new Date(0).toISOString().split('T')[0], // Use epoch if empty or handle differently
    };

    // Simulate API call delay & process
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
       onPatientAdded(patientData); // Pass data to parent for actual addition logic
       form.reset(); // Reset form on success
       // Toast is handled in the parent after actual simulated add/email
    } catch (error) {
        console.error("Error in submission process:", error);
        toast({
            title: "Erreur",
            description: "Une erreur est survenue lors de l'ajout du patient.",
            variant: "destructive",
        });
    } finally {
       setIsSubmitting(false);
       // onClose(); // Keep modal open on error, close handled by parent on success
    }
  };

  // Close modal and reset form state
  const handleClose = () => {
      if (!isSubmitting) {
        form.reset();
        onClose();
      }
  };


  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" /> Ajouter un Nouveau Patient
          </DialogTitle>
          <DialogDescription>
            Entrez les informations de base du patient. Un e-mail avec ses identifiants de connexion lui sera envoyé automatiquement (simulation).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="prénom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prénom</FormLabel>
                  <FormControl>
                    <Input placeholder="Jean" {...field} disabled={isSubmitting} />
                  </FormControl>
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
                  <FormControl>
                    <Input placeholder="Dupont" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="jean.dupont@email.com" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="date_naissance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de naissance (Optionnel)</FormLabel>
                  <FormControl>
                    <Input type="date" placeholder="YYYY-MM-DD" {...field} disabled={isSubmitting} max={new Date().toISOString().split('T')[0]}/>
                  </FormControl>
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
               <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isSubmitting ? 'Ajout en cours...' : 'Ajouter Patient'}
               </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
