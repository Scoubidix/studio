// @refresh reset - Prevent error during compilation
'use client';

import { useState } from 'react'; // Import useState
import type { Feedback, MessageToKine, Patient } from '@/interfaces';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import { AlertTriangle, MailWarning, CheckCircle, Send, Loader2 } from 'lucide-react'; // Import Send and Loader2
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast'; // Import useToast for reply confirmation

interface NotificationAreaProps {
  feedbackAlerts: Feedback[];
  messages: MessageToKine[];
  patients: Patient[];
  onSelectPatient: (patientId: string) => void;
  onMarkMessageAsRead: (messageId: string) => void;
  // Add onReplySent prop if handling logic needs to be outside this component
  // onReplySent: (messageId: string, replyText: string) => Promise<void>;
}

export default function NotificationArea({
  feedbackAlerts,
  messages,
  patients,
  onSelectPatient,
  onMarkMessageAsRead,
}: NotificationAreaProps) {
  const [replyTexts, setReplyTexts] = useState<{ [messageId: string]: string }>({});
  const [isSendingReply, setIsSendingReply] = useState<{ [messageId: string]: boolean }>({});
  const { toast } = useToast();

  const getPatientName = (patientId: string): string => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.prénom} ${patient.nom}` : 'Patient inconnu';
  };

  const handleReplyTextChange = (messageId: string, text: string) => {
    setReplyTexts(prev => ({ ...prev, [messageId]: text }));
  };

  // --- Mock Reply Handler ---
  const handleSendReply = async (messageId: string, patientId: string) => {
    const replyText = replyTexts[messageId]?.trim();
    if (!replyText || !messageId || isSendingReply[messageId]) return;

    setIsSendingReply(prev => ({ ...prev, [messageId]: true }));

    console.log(`Simulating reply to message ${messageId} for patient ${patientId}: ${replyText}`);
    // TODO: Replace with actual API call to send reply and update message status if needed
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    toast({
      title: "Réponse envoyée (Simulation)",
      description: `Votre réponse à ${getPatientName(patientId)} a été envoyée.`,
    });

    // Clear the textarea and sending state for this message
    setReplyTexts(prev => ({ ...prev, [messageId]: '' }));
    setIsSendingReply(prev => ({ ...prev, [messageId]: false }));
    // Optionally mark the original message as read/replied
    // onMarkMessageAsRead(messageId);
  };
  // --- End Mock Reply Handler ---


  const allNotifications = [
    ...feedbackAlerts.map(fb => ({ ...fb, type: 'feedback', date: new Date(fb.date) })),
    ...messages.map(msg => ({ ...msg, type: 'message', date: new Date(msg.timestamp) }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort combined notifications by date

  if (allNotifications.length === 0) {
    return null; // Don't render the card if there are no notifications
  }

  return (
    <Card className="shadow-md border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-900/20 mb-8">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-orange-700 dark:text-orange-300">
          <AlertTriangle className="w-5 h-5" />
          Notifications Importantes
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4"> {/* Increased spacing */}
        {allNotifications.map((notification) => (
          <Alert
            key={`${notification.type}-${notification.id}`}
            variant={notification.type === 'feedback' ? 'destructive' : 'default'}
            className={`border-l-4 ${
              notification.type === 'feedback'
                ? 'border-red-500 bg-red-50 dark:bg-red-900/30'
                : 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
            } p-4 flex flex-col`} // Added flex-col
          >
             <div className="flex-grow"> {/* Wrap existing content */}
                {notification.type === 'feedback' ? (
                <AlertTriangle className={`h-4 w-4 ${notification.type === 'feedback' ? 'text-red-600' : 'text-blue-600'} !left-3 !top-3.5 absolute`} />
                ) : (
                <MailWarning className={`h-4 w-4 ${notification.type === 'feedback' ? 'text-red-600' : 'text-blue-600'} !left-3 !top-3.5 absolute`} />
                )}
                <AlertTitle className="ml-6 text-sm font-semibold">
                {notification.type === 'feedback'
                    ? `Alerte Douleur: ${getPatientName(notification.patient_id)}`
                    : `Message Patient: ${getPatientName(notification.patient_id)}`}
                </AlertTitle>
                <AlertDescription className="ml-6 text-xs space-y-1"> {/* Added space-y-1 */}
                {notification.type === 'feedback' ? (
                    <>
                    Douleur: <span className="font-medium text-red-700 dark:text-red-400">{notification.douleur_moyenne}/10</span>,
                    Difficulté: {notification.difficulté}/10.
                    {notification.commentaire_libre && <span className="italic block mt-1">"{notification.commentaire_libre}"</span>}
                    </>
                ) : (
                    <>
                    <span className="italic block mt-1">"{notification.message}"</span>
                    {notification.original_question && <span className="text-muted-foreground text-[11px] block mt-0.5">Question initiale: "{notification.original_question}"</span>}
                    </>

                )}
                <div className="flex justify-between items-center pt-2"> {/* Added pt-2 */}
                    <span className="text-muted-foreground">
                        {formatDistanceToNow(notification.date, { addSuffix: true, locale: fr })}
                    </span>
                    <div className="flex gap-2">
                        {notification.type === 'message' && (
                            <Button
                            variant="outline"
                            size="xs" // Custom smaller size if needed, or use 'sm'
                            className="h-6 px-2 text-xs border-green-500 text-green-700 hover:bg-green-100 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-900/50"
                            onClick={() => notification.id && onMarkMessageAsRead(notification.id)}
                            >
                            <CheckCircle className="w-3 h-3 mr-1" /> Marquer comme lu
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="xs" // Custom smaller size if needed, or use 'sm'
                            className="h-6 px-2 text-xs"
                            onClick={() => onSelectPatient(notification.patient_id)}
                        >
                            Voir Patient
                        </Button>
                    </div>
                </div>
                </AlertDescription>
             </div>

             {/* Reply Area - Only for messages */}
             {notification.type === 'message' && notification.id && (
                 <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800/50 ml-6"> {/* Added margin-left */}
                    <Textarea
                        placeholder={`Répondre à ${getPatientName(notification.patient_id)}...`}
                        value={replyTexts[notification.id] || ''}
                        onChange={(e) => handleReplyTextChange(notification.id!, e.target.value)}
                        rows={2}
                        className="text-xs bg-white dark:bg-background/50"
                        disabled={isSendingReply[notification.id]}
                    />
                    <div className="flex justify-end mt-2">
                        <Button
                            size="sm"
                            className="h-7 px-3 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                            onClick={() => handleSendReply(notification.id!, notification.patient_id)}
                            disabled={!replyTexts[notification.id]?.trim() || isSendingReply[notification.id]}
                        >
                            {isSendingReply[notification.id] ? (
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                                <Send className="w-3 h-3 mr-1" />
                            )}
                            {isSendingReply[notification.id] ? 'Envoi...' : 'Envoyer'}
                        </Button>
                    </div>
                 </div>
             )}

          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}
