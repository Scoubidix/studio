
'use client';

import { useState } from 'react'; // Import useState
import type { ShopProgram, Kine, ShopProgramReview, CertificationBadge } from '@/interfaces'; // Import Kine and review types
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ShoppingCart, CheckCircle, Star, MessageSquare, Award } from 'lucide-react'; // Import Star and MessageSquare
import { Badge } from '@/components/ui/badge';
import KineCertificationDisplay from './kine-certification-display'; // Use the Kine certification display
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from '../ui/scroll-area';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ShopDisplayProps {
  programs: ShopProgram[];
  allKines: Kine[]; // Add all Kines to find creator details
  onPurchase: (program: ShopProgram) => void;
  purchasedProgramIds: string[];
}

// Helper function to render stars
const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      ))}
      {halfStar && <Star key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }} />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="w-4 h-4 text-muted-foreground" />
      ))}
    </div>
  );
};

export default function ShopDisplay({ programs, allKines, onPurchase, purchasedProgramIds }: ShopDisplayProps) {
    const [selectedProgramReviews, setSelectedProgramReviews] = useState<ShopProgramReview[] | null>(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    const getKineDetails = (kineId: string): Kine | undefined => {
        return allKines.find(k => k.id === kineId);
    };

    const openReviewModal = (reviews: ShopProgramReview[] | undefined) => {
        setSelectedProgramReviews(reviews || []);
        setIsReviewModalOpen(true);
    };

  return (
    <>
        <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" /> Boutique de Programmes
            </CardTitle>
            <CardDescription>
            Découvrez des programmes conçus par des kinésithérapeutes pour des objectifs spécifiques.
            </CardDescription>
        </CardHeader>
        <CardContent>
            {programs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programs.map((program) => {
                const isPurchased = purchasedProgramIds.includes(program.id);
                const kine = getKineDetails(program.kine_id); // Get creator details
                const averageRating = program.rating ?? 0; // Default to 0 if no rating
                const reviewCount = program.reviews?.length ?? 0;

                return (
                    <Card key={program.id} className="flex flex-col overflow-hidden h-full border">
                    {program.imageUrl && (
                        <div className="relative w-full h-40">
                        <Image
                            src={program.imageUrl}
                            alt={program.title}
                            fill
                            style={{ objectFit: 'cover' }}
                            unoptimized // For picsum
                        />
                        </div>
                    )}
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{program.title}</CardTitle>
                         {/* Creator Info */}
                        {kine && (
                             <div className="text-xs text-muted-foreground mt-1">
                                Par <span className="font-medium text-foreground">{kine.prénom} {kine.nom}</span>
                                {kine.certifications && kine.certifications.length > 0 && (
                                    <div className="inline-flex gap-1 ml-2">
                                        {kine.certifications.slice(0, 2).map(cert => ( // Show max 2 badges inline
                                            <Badge key={cert.id} variant="outline" className="border-green-500 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-900/30 px-1 py-0 text-[10px]">
                                                <Award className="w-2.5 h-2.5 mr-0.5"/>{cert.name}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                             </div>
                        )}
                        <CardDescription className="text-xs text-muted-foreground">
                             {program.durationWeeks ? `${program.durationWeeks} semaines | ` : ''} Cible: {program.targetAudience}
                        </CardDescription>
                         {/* Rating */}
                         <div className="flex items-center gap-2 mt-1">
                            <StarRating rating={averageRating} />
                            <span className="text-xs text-muted-foreground">({averageRating.toFixed(1)})</span>
                            {reviewCount > 0 && (
                                <Button
                                    variant="link"
                                    className="text-xs h-auto p-0 text-muted-foreground hover:text-primary"
                                    onClick={() => openReviewModal(program.reviews)}
                                >
                                    {reviewCount} avis
                                </Button>
                            )}
                         </div>
                    </CardHeader>
                    <CardContent className="flex-grow pt-0"> {/* Reduced padding top */}
                        <p className="text-sm text-muted-foreground mb-3">{program.description}</p>
                        {program.tags && program.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                                {program.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                                ))}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-between items-center pt-4 border-t bg-muted/30">
                        <span className="text-lg font-semibold text-primary">
                        {program.price.toFixed(2)} {program.currency}
                        </span>
                        <Button
                        size="sm"
                        onClick={() => onPurchase(program)}
                        disabled={isPurchased}
                        variant={isPurchased ? "outline" : "default"}
                        className={isPurchased ? "cursor-not-allowed" : "bg-accent hover:bg-accent/90 text-accent-foreground"}
                        >
                        {isPurchased ? (
                            <>
                            <CheckCircle className="mr-2 h-4 w-4" /> Acheté
                            </>
                        ) : (
                            <>
                            <ShoppingCart className="mr-2 h-4 w-4" /> Acheter
                            </>
                        )}
                        </Button>
                    </CardFooter>
                    </Card>
                );
                })}
            </div>
            ) : (
            <p className="text-center text-muted-foreground">Aucun programme disponible dans la boutique pour le moment.</p>
            )}
        </CardContent>
        </Card>

        {/* Review Modal */}
        <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
            <DialogContent className="sm:max-w-lg p-0 flex flex-col max-h-[80vh]">
                <DialogHeader className="p-6 pb-4 border-b">
                    <DialogTitle className="text-xl flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-primary" /> Avis sur le Programme
                    </DialogTitle>
                    {/* Optionally show program title here */}
                </DialogHeader>
                 <ScrollArea className="flex-grow overflow-y-auto px-6 py-4">
                    {selectedProgramReviews && selectedProgramReviews.length > 0 ? (
                        <div className="space-y-4">
                            {selectedProgramReviews.map(review => (
                                <div key={review.id} className="border-b pb-3 last:border-b-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold text-sm">{review.reviewerName}</span>
                                        <StarRating rating={review.rating} />
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-2">
                                        {format(new Date(review.date), "d MMMM yyyy", { locale: fr })}
                                    </p>
                                    <p className="text-sm">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-4">Aucun avis pour ce programme.</p>
                    )}
                 </ScrollArea>
                 <DialogFooter className="p-4 border-t bg-muted/30">
                    {/* Optionally add a button to write a review if the user purchased the program */}
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Fermer
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  );
}
