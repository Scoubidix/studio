'use client';

import { useState } from 'react';
import type { RehabProtocol } from '@/interfaces';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Layers, Eye, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface TemplateBrowserProps {
  protocols: RehabProtocol[];
}

export default function TemplateBrowser({ protocols }: TemplateBrowserProps) {
  const [selectedProtocol, setSelectedProtocol] = useState<RehabProtocol | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const openModal = (protocol: RehabProtocol) => {
    setSelectedProtocol(protocol);
    setIsModalOpen(true);
  };

  const handleCopyProtocol = (protocol: RehabProtocol) => {
    // Simulate copying the protocol structure to be used elsewhere (e.g., program generation)
    navigator.clipboard.writeText(JSON.stringify(protocol, null, 2)); // Copy JSON representation
    toast({
      title: "Protocole Copié",
      description: `Le protocole "${protocol.name}" a été copié dans le presse-papiers (format JSON).`,
    });
    // In a real app, this might trigger navigation to a program creation screen with pre-filled data.
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" /> Protocoles de Rééducation Types
        </CardTitle>
        <CardDescription>
          Consultez des modèles de protocoles basés sur des données récentes. Vous pourrez les personnaliser lors de la création de programmes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {protocols.length > 0 ? (
          <div className="space-y-4">
            {protocols.map((protocol) => (
              <Card key={protocol.id} className="p-4 flex justify-between items-center border">
                 <div className="flex-grow mr-4">
                    <h4 className="font-semibold">{protocol.name}</h4>
                    <p className="text-sm text-muted-foreground">Condition: {protocol.condition}</p>
                    <p className="text-xs text-muted-foreground mt-1">Source: {protocol.source || 'Non spécifiée'} | MàJ: {format(new Date(protocol.lastUpdated), "d MMM yyyy", { locale: fr })}</p>
                 </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="outline" size="sm" onClick={() => openModal(protocol)} className="h-7 px-2">
                    <Eye className="w-3.5 h-3.5 mr-1" /> Voir
                  </Button>
                   {/* Add a button to copy/use the template */}
                   <Button variant="default" size="sm" onClick={() => handleCopyProtocol(protocol)} className="h-7 px-2 bg-accent hover:bg-accent/90 text-accent-foreground">
                     <Copy className="w-3.5 h-3.5 mr-1" /> Utiliser
                   </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Aucun protocole type disponible pour le moment.</p>
        )}
      </CardContent>

      {/* Protocol Details Modal */}
       <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          {selectedProtocol && (
            <>
              <DialogHeader className="p-6 pb-4 border-b">
                <DialogTitle className="text-xl">{selectedProtocol.name}</DialogTitle>
                <DialogDescription>
                  Condition: {selectedProtocol.condition} | Source: {selectedProtocol.source || 'N/A'} | MàJ: {format(new Date(selectedProtocol.lastUpdated), "d MMM yyyy", { locale: fr })}
                </DialogDescription>
              </DialogHeader>

              <ScrollArea className="flex-grow overflow-y-auto px-6 pt-4 pb-6">
                 <p className="text-sm mb-4">{selectedProtocol.description}</p>

                  {selectedProtocol.phases && selectedProtocol.phases.length > 0 ? (
                     <div className="space-y-6">
                        {selectedProtocol.phases.map((phase, phaseIndex) => (
                            <div key={phaseIndex} className="p-4 border rounded-md bg-muted/30">
                                <h4 className="font-semibold text-md mb-2">Phase {phaseIndex + 1}: {phase.name} ({phase.duration})</h4>
                                <div className="mb-3">
                                    <h5 className="text-sm font-medium mb-1">Objectifs :</h5>
                                    <ul className="list-disc pl-5 text-xs space-y-0.5">
                                        {phase.goals.map((goal, i) => <li key={i}>{goal}</li>)}
                                    </ul>
                                </div>
                                 <div className="mb-3">
                                    <h5 className="text-sm font-medium mb-1">Exercices Types :</h5>
                                     {phase.exercises.length > 0 ? (
                                        <ul className="list-none text-xs space-y-0.5">
                                            {phase.exercises.map((ex, i) => (
                                                <li key={i}>{ex.exercice_id} ({ex.séries}x{ex.répétitions})</li>
                                                // TODO: Fetch and display exercise names instead of IDs
                                            ))}
                                        </ul>
                                     ) : <p className="text-xs italic text-muted-foreground">Aucun exercice spécifique listé pour cette phase.</p>}
                                </div>
                                <div>
                                    <h5 className="text-sm font-medium mb-1">Critères de Progression :</h5>
                                     <ul className="list-disc pl-5 text-xs space-y-0.5">
                                        {phase.criteriaToProgress.map((crit, i) => <li key={i}>{crit}</li>)}
                                    </ul>
                                </div>
                            </div>
                        ))}
                     </div>
                  ) : (
                     <p className="text-sm text-muted-foreground italic">Aucune phase détaillée disponible pour ce protocole.</p>
                  )}

              </ScrollArea>

              <DialogFooter className="p-4 border-t bg-muted/30">
                 <Button type="button" variant="default" onClick={() => handleCopyProtocol(selectedProtocol)}>
                     <Copy className="w-4 h-4 mr-2" /> Utiliser ce Protocole
                 </Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Fermer
                  </Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
