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
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit } from 'lucide-react';
import type { BlogPostFormData } from '@/interfaces';

// Schema for the blog post submission form
const addBlogPostSchema = z.object({
  title: z.string().min(5, "Titre requis (min 5 caractères).").max(150),
  summary: z.string().min(20, "Résumé requis (min 20 caractères).").max(500),
  contentUrl: z.string().url("URL invalide (ex: https://...)").optional().or(z.literal('')),
  tags: z.string().optional(), // Comma-separated string
  imageUrl: z.string().url("URL d'image invalide").optional().or(z.literal('')),
});

type AddBlogPostFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BlogPostFormData) => void;
};

export default function AddBlogPostForm({ isOpen, onClose, onSubmit }: AddBlogPostFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BlogPostFormData>({
    resolver: zodResolver(addBlogPostSchema),
    defaultValues: {
      title: '',
      summary: '',
      contentUrl: '',
      tags: '',
      imageUrl: '',
    },
  });

  const handleFormSubmit = async (values: BlogPostFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values); // Pass data to parent submit handler
      form.reset(); // Reset form on success
      // Toast is handled in the parent component
    } catch (error) {
      console.error("Error submitting blog post:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la soumission de l'article.",
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" /> Proposer un Article pour le Blog Pro
          </DialogTitle>
          <DialogDescription>
            Partagez vos connaissances avec vos confrères. Les articles soumis seront examinés avant publication.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre de l'article <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Nouvelles approches pour la tendinopathie d'Achille" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Résumé / Points Clés <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Textarea placeholder="Synthétisez les informations principales de l'article ou de la bonne pratique..." {...field} disabled={isSubmitting} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="contentUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lien vers l'article complet (Optionnel)</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://pubmed.ncbi.nlm.nih.gov/..." {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormDescription>Si vous résumez un article existant.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL d'une image d'illustration (Optionnel)</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://source.unsplash.com/..." {...field} disabled={isSubmitting} />
                  </FormControl>
                   <FormDescription>Utilisez une image libre de droits.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (séparés par virgule, optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: cheville, EBP, exercice, évaluation" {...field} disabled={isSubmitting} />
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
              <Button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? 'Soumission...' : 'Soumettre l\'Article'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
