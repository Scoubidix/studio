'use client';

import type { ShopProgram } from '@/interfaces';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ShoppingCart, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ShopDisplayProps {
  programs: ShopProgram[];
  onPurchase: (program: ShopProgram) => void; // Callback when purchase button is clicked
  purchasedProgramIds: string[]; // IDs of programs already owned by the patient
}

export default function ShopDisplay({ programs, onPurchase, purchasedProgramIds }: ShopDisplayProps) {
  return (
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
              return (
                <Card key={program.id} className="flex flex-col overflow-hidden h-full">
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
                    <CardDescription className="text-xs text-muted-foreground">
                      Par Kiné ID: {program.kine_id} | {program.durationWeeks ? `${program.durationWeeks} semaines | ` : ''} Cible: {program.targetAudience}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
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
  );
}
