'use client';

import type { Exercise } from '@/interfaces';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle } from 'lucide-react';

interface ExerciseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: Exercise;
}

export default function ExerciseDetailModal({ isOpen, onClose, exercise }: ExerciseDetailModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 flex flex-col max-h-[90vh]">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-xl">{exercise.nom}</DialogTitle>
          <DialogDescription>
            {exercise.description}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-grow overflow-y-auto px-6 pt-4 pb-6">
            {exercise.image_url && (
                <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden border">
                    <Image
                        src={exercise.image_url}
                        alt={`Illustration pour ${exercise.nom}`}
                        fill
                        style={{ objectFit: 'cover' }}
                        unoptimized // for picsum
                    />
                </div>
            )}

            {exercise.detailed_steps && exercise.detailed_steps.length > 0 && (
                <div className="space-y-3">
                    <h4 className="font-semibold text-md mb-2">Étapes détaillées :</h4>
                    <ul className="list-none space-y-2 pl-2">
                        {exercise.detailed_steps.map((step, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                <span className="text-sm text-foreground">{step}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {exercise.contre_indications && exercise.contre_indications.length > 0 && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-md">
                    <h4 className="font-semibold text-destructive text-sm mb-1">Contre-indications :</h4>
                    <p className="text-xs text-destructive">{exercise.contre_indications.join(', ')}</p>
                </div>
            )}

             <div className="mt-4 flex justify-between text-xs text-muted-foreground">
                 <span className="capitalize">Niveau: <span className="font-medium text-foreground">{exercise.niveau}</span></span>
                 <span className="capitalize">Catégorie: <span className="font-medium text-foreground">{exercise.catégorie}</span></span>
             </div>

        </ScrollArea>

        <DialogFooter className="p-4 border-t bg-muted/30">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Fermer
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
