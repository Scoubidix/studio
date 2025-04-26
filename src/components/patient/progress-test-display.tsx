'use client';

import { useState } from 'react';
import type { ProgressTest, ProgressTestResult } from '@/interfaces';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { CheckSquare, PlayCircle, Activity, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProgressTestDisplayProps {
  tests: ProgressTest[];
  patientId: string;
  onSubmit: (testId: string, results: ProgressTestResult['results'], notes?: string) => void; // Callback with results
}

export default function ProgressTestDisplay({ tests, patientId, onSubmit }: ProgressTestDisplayProps) {
  const [selectedTest, setSelectedTest] = useState<ProgressTest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [results, setResults] = useState<{ [metricName: string]: string | number }>({});
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openModal = (test: ProgressTest) => {
    setSelectedTest(test);
    setResults({}); // Reset results when opening modal
    setNotes('');
    setIsModalOpen(true);
  };

  const handleResultChange = (metricName: string, value: string) => {
    setResults(prev => ({ ...prev, [metricName]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedTest) return;
    setIsSubmitting(true);

    // Prepare results in the correct format
    const formattedResults: ProgressTestResult['results'] = selectedTest.metrics.map(metric => ({
      metricName: metric.name,
      value: results[metric.name] ?? '' // Use empty string if not entered
    }));

    try {
       await onSubmit(selectedTest.id, formattedResults, notes);
       setIsModalOpen(false); // Close modal on success
       // Toast is handled in the parent component
    } catch (error) {
        console.error("Error submitting test results:", error);
        // Optionally show an error message within the modal
    } finally {
       setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" /> Tests de Progression
        </CardTitle>
        <CardDescription>
          Réalisez ces tests régulièrement pour suivre votre évolution. {tests.length > 0 ? tests[0].frequency && `Fréquence suggérée : ${tests[0].frequency}.` : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tests.map((test) => (
              <Card key={test.id} className="flex flex-col overflow-hidden">
                 {test.imageUrl && (
                    <div className="relative w-full h-40">
                      <Image src={test.imageUrl} alt={test.name} fill style={{ objectFit: 'cover' }} unoptimized/>
                    </div>
                 )}
                 <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{test.name}</CardTitle>
                 </CardHeader>
                 <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">{test.description}</p>
                 </CardContent>
                 <CardFooter className="border-t pt-4">
                    <Button size="sm" onClick={() => openModal(test)}>
                       <CheckSquare className="mr-2 h-4 w-4" /> Réaliser le Test
                    </Button>
                 </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Aucun test de progression assigné pour le moment.</p>
        )}
      </CardContent>

      {/* Test Details and Submission Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg p-0 flex flex-col max-h-[90vh]">
          {selectedTest && (
            <>
              <DialogHeader className="p-6 pb-4 border-b">
                <DialogTitle className="text-xl">{selectedTest.name}</DialogTitle>
                <DialogDescription>{selectedTest.description}</DialogDescription>
              </DialogHeader>

              <ScrollArea className="flex-grow overflow-y-auto px-6 pt-4 pb-6">
                {selectedTest.videoUrl && (
                  <div className="mb-4 rounded-lg overflow-hidden border aspect-video">
                     {/* Basic video placeholder - replace with actual video player if needed */}
                    <div className="bg-muted h-full flex items-center justify-center text-muted-foreground">
                        <PlayCircle className="w-12 h-12 opacity-50"/>
                        {/* In real app: <video controls src={selectedTest.videoUrl} className="w-full h-full"></video> */}
                        <p className="absolute bottom-2 text-xs">(Lecteur vidéo à intégrer)</p>
                    </div>
                  </div>
                )}

                <div className="space-y-3 mb-6">
                    <h4 className="font-semibold text-md mb-2">Instructions :</h4>
                    <ul className="list-decimal space-y-1 pl-5 text-sm text-foreground">
                        {selectedTest.instructions.map((step, index) => (
                            <li key={index}>{step}</li>
                        ))}
                    </ul>
                </div>

                 <div className="space-y-4">
                    <h4 className="font-semibold text-md mb-2">Entrez vos résultats :</h4>
                    {selectedTest.metrics.map(metric => (
                        <div key={metric.name} className="grid grid-cols-3 items-center gap-4">
                            <Label htmlFor={`metric-${metric.name}`} className="text-right text-sm col-span-1">
                                {metric.name} ({metric.unit})
                            </Label>
                            <Input
                                id={`metric-${metric.name}`}
                                type="text" // Use text to allow degrees symbol, etc. Handle parsing later.
                                value={results[metric.name] ?? ''}
                                onChange={(e) => handleResultChange(metric.name, e.target.value)}
                                className="col-span-2 h-8 text-sm"
                                disabled={isSubmitting}
                            />
                        </div>
                    ))}
                     <div>
                        <Label htmlFor="test-notes" className="text-sm font-medium">Notes (optionnel)</Label>
                        <Textarea
                            id="test-notes"
                            placeholder="Ajoutez des remarques sur votre ressenti pendant le test..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="mt-1 text-sm"
                            disabled={isSubmitting}
                        />
                     </div>
                 </div>

              </ScrollArea>

              <DialogFooter className="p-4 border-t bg-muted/30">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isSubmitting}>
                    Annuler
                  </Button>
                </DialogClose>
                <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                   {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                   {isSubmitting ? 'Enregistrement...' : 'Enregistrer les Résultats'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
