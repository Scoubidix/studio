
'use client';

import { useState } from 'react';
import type { Patient, Kine } from '@/interfaces';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Users, Send, Share2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface KineCollaborationHubProps {
  currentKineId: string;
  selectedPatient: Patient;
  otherKines: Kine[]; // List of potential collaborators
  onTransferPatient: (patientId: string, targetKineId: string) => Promise<void> | void;
  onSharePatient: (patientId: string, collaboratingKineId: string) => Promise<void> | void;
}

export default function KineCollaborationHub({
    currentKineId,
    selectedPatient,
    otherKines,
    onTransferPatient,
    onSharePatient
}: KineCollaborationHubProps) {
  const [targetKineIdTransfer, setTargetKineIdTransfer] = useState<string>('');
  const [targetKineIdShare, setTargetKineIdShare] = useState<string>('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  // Filter out the current kine from the list of potential collaborators
  const collaborators = otherKines.filter(k => k.id !== currentKineId);

  const handleTransfer = async () => {
    if (!targetKineIdTransfer || !selectedPatient) return;
    setIsTransferring(true);
    try {
      await onTransferPatient(selectedPatient.id, targetKineIdTransfer);
      // Toast is handled in parent component after successful simulation/action
    } catch (error) {
      console.error("Error transferring patient:", error);
      toast({ title: "Erreur", description: "Le transfert du patient a échoué.", variant: "destructive" });
    } finally {
      setIsTransferring(false);
      setTargetKineIdTransfer(''); // Reset selection
    }
  };

  const handleShare = async () => {
    if (!targetKineIdShare || !selectedPatient) return;
    setIsSharing(true);
    try {
      await onSharePatient(selectedPatient.id, targetKineIdShare);
      // Toast handled in parent
    } catch (error) {
      console.error("Error sharing patient:", error);
      toast({ title: "Erreur", description: "Le partage du dossier patient a échoué.", variant: "destructive" });
    } finally {
      setIsSharing(false);
      setTargetKineIdShare(''); // Reset selection
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" /> KinéHub - Collaboration
        </CardTitle>
        <CardDescription>
          Transférez temporairement un patient ou partagez son dossier avec un autre kiné de la plateforme.
          Patient sélectionné : <span className="font-semibold">{selectedPatient.prénom} {selectedPatient.nom}</span>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Transfer Patient Section */}
        <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
          <h4 className="font-semibold">Transférer un Patient (ex: Vacances)</h4>
          <div className="flex flex-col sm:flex-row sm:items-end gap-2">
            <div className="flex-grow space-y-1">
              <Label htmlFor="transfer-kine-select">Choisir un Kiné</Label>
              <Select
                value={targetKineIdTransfer}
                onValueChange={setTargetKineIdTransfer}
                disabled={isTransferring || collaborators.length === 0}
              >
                <SelectTrigger id="transfer-kine-select">
                  <SelectValue placeholder={collaborators.length > 0 ? "Sélectionner un confrère..." : "Aucun autre kiné disponible"} />
                </SelectTrigger>
                <SelectContent>
                  {collaborators.map((kine) => (
                    <SelectItem key={kine.id} value={kine.id}>
                      {kine.prénom} {kine.nom} ({kine.ville || 'Ville inconnue'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleTransfer}
              disabled={!targetKineIdTransfer || isTransferring}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isTransferring ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              {isTransferring ? 'Transfert...' : 'Transférer'}
            </Button>
          </div>
           <p className="text-xs text-muted-foreground">Le patient sera temporairement géré par le kiné sélectionné.</p>
        </div>

        {/* Share Patient Section */}
        <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
          <h4 className="font-semibold">Partager un Dossier Patient (ex: Collaboration Cabinet)</h4>
          <div className="flex flex-col sm:flex-row sm:items-end gap-2">
            <div className="flex-grow space-y-1">
              <Label htmlFor="share-kine-select">Choisir un Kiné</Label>
               <Select
                value={targetKineIdShare}
                onValueChange={setTargetKineIdShare}
                disabled={isSharing || collaborators.length === 0}
               >
                <SelectTrigger id="share-kine-select">
                  <SelectValue placeholder={collaborators.length > 0 ? "Sélectionner un confrère..." : "Aucun autre kiné disponible"} />
                </SelectTrigger>
                <SelectContent>
                  {collaborators.map((kine) => (
                    <SelectItem key={kine.id} value={kine.id}>
                       {kine.prénom} {kine.nom} ({kine.ville || 'Ville inconnue'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleShare}
              disabled={!targetKineIdShare || isSharing}
            >
              {isSharing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
              {isSharing ? 'Partage...' : 'Partager Accès'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Le kiné sélectionné pourra consulter le dossier du patient.</p>
        </div>
      </CardContent>
    </Card>
  );
}
