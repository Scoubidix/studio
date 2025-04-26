'use client';

import { useState } from 'react';
import type { BlogPost } from '@/interfaces';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Edit, Trash2, BookOpen, Loader2, Tag, Link as LinkIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

// Zod Schema for Blog Post Form
const blogPostSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(5, "Titre requis (min 5 caractères)"),
  summary: z.string().min(20, "Résumé requis (min 20 caractères)").max(300, "Max 300 caractères"),
  contentUrl: z.string().url("URL invalide").optional().or(z.literal('')),
  imageUrl: z.string().url("URL d'image invalide").optional().or(z.literal('')),
  tags: z.string().optional().transform(val => val ? val.split(',').map(tag => tag.trim()).filter(Boolean) : []),
  // publishDate and author are set automatically
});

type BlogPostFormData = z.infer<typeof blogPostSchema>;

interface BlogManagerProps {
  kineId: string; // Used potentially for authoring or permissions
  kineName: string; // To display as author
  existingPosts: BlogPost[];
  onSave: (post: BlogPost) => void;
  onDelete: (postId: string) => void;
}

export default function BlogManager({ kineId, kineName, existingPosts, onSave, onDelete }: BlogManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: '',
      summary: '',
      contentUrl: '',
      imageUrl: '',
      tags: '',
    },
  });

  const openModal = (post: BlogPost | null = null) => {
    setEditingPost(post);
    if (post) {
        form.reset({
            ...post,
            tags: post.tags?.join(', ') || '', // Convert array to string
        });
    } else {
        form.reset({ // Reset to default for new post
            title: '', summary: '', contentUrl: '', imageUrl: '', tags: '',
        });
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: BlogPostFormData) => {
     setIsSubmitting(true);
     const postDataToSave: BlogPost = {
         ...data,
         tags: typeof data.tags === 'string' ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
         id: editingPost?.id || `kblog_${Date.now()}`, // Use existing ID or generate temporary one
         publishDate: editingPost?.publishDate || new Date().toISOString(), // Keep original or set new
         author: kineName, // Set current kine as author
     };

     try {
        await onSave(postDataToSave);
        setIsModalOpen(false);
     } catch(error) {
         console.error("Error saving blog post", error);
     } finally {
        setIsSubmitting(false);
     }
  };

   const handleDeleteClick = (postId: string) => {
      if (window.confirm("Êtes-vous sûr de vouloir supprimer cet article de blog ?")) {
          onDelete(postId);
      }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" /> Gestion du Blog Professionnel
            </CardTitle>
            <CardDescription>Partagez votre expertise et des informations pertinentes avec vos patients et collègues.</CardDescription>
        </div>
        <Button onClick={() => openModal()}>
            <PlusCircle className="mr-2 h-4 w-4" /> Nouvel Article
        </Button>
      </CardHeader>
      <CardContent>
        {existingPosts.length > 0 ? (
          <div className="space-y-4">
            {existingPosts.map((post) => (
              <Card key={post.id} className="p-4 flex justify-between items-start border">
                <div className="flex-grow mr-4">
                    <h4 className="font-semibold">{post.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.summary}</p>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                         <span>Publié le {format(new Date(post.publishDate), "d MMM yyyy", { locale: fr })}</span>
                         {post.tags && post.tags.length > 0 && (
                             <div className="flex flex-wrap gap-1 items-center"> | <Tag className="w-3 h-3 ml-1"/>
                                {post.tags.map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                                ))}
                             </div>
                         )}
                    </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Button variant="outline" size="sm" onClick={() => openModal(post)} className="h-7 px-2">
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(post.id)} className="h-7 px-2">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Vous n'avez publié aucun article de blog.</p>
        )}
      </CardContent>

      {/* Add/Edit Blog Post Modal */}
       <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingPost ? 'Modifier l\'Article' : 'Créer un Nouvel Article'}</DialogTitle>
            <DialogDescription>
              Rédigez ou modifiez votre article de blog.
            </DialogDescription>
          </DialogHeader>
           <ScrollArea className="flex-grow overflow-y-auto pr-6 pl-1 py-4 -mr-6">
               <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Titre</Label>
                        <Input id="title" {...form.register("title")} disabled={isSubmitting}/>
                        {form.formState.errors.title && <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>}
                    </div>

                     <div className="space-y-2">
                        <Label htmlFor="summary">Résumé (max 300 caractères)</Label>
                        <Textarea id="summary" rows={3} {...form.register("summary")} disabled={isSubmitting}/>
                         {form.formState.errors.summary && <p className="text-xs text-destructive">{form.formState.errors.summary.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="contentUrl">Lien vers contenu complet (Optionnel)</Label>
                            <div className='relative'>
                                <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input id="contentUrl" type="url" placeholder="https://..." className="pl-8" {...form.register("contentUrl")} disabled={isSubmitting}/>
                            </div>
                            {form.formState.errors.contentUrl && <p className="text-xs text-destructive">{form.formState.errors.contentUrl.message}</p>}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="imageUrl">URL de l'image (Optionnel)</Label>
                             <div className='relative'>
                                <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input id="imageUrl" type="url" placeholder="https://..." className="pl-8" {...form.register("imageUrl")} disabled={isSubmitting}/>
                             </div>
                            {form.formState.errors.imageUrl && <p className="text-xs text-destructive">{form.formState.errors.imageUrl.message}</p>}
                        </div>
                    </div>

                     <div className="space-y-2">
                        <Label htmlFor="tags">Tags (séparés par virgule)</Label>
                         <div className='relative'>
                             <Tag className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                             <Input id="tags" placeholder="ex: genou, prévention, sport" className="pl-8" {...form.register("tags")} disabled={isSubmitting}/>
                         </div>
                        {form.formState.errors.tags && <p className="text-xs text-destructive">{form.formState.errors.tags.message}</p>}
                    </div>

                    {/* Add rich text editor here in a real application */}
                    {/* <div className="space-y-2">
                        <Label>Contenu de l'article</Label>
                        <Textarea rows={10} placeholder="Écrivez votre article ici..." disabled={isSubmitting}/>
                    </div> */}

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
                    {isSubmitting ? 'Sauvegarde...' : (editingPost ? 'Sauvegarder Modifications' : 'Publier Article')}
                 </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
