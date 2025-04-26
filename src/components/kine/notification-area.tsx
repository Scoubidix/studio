// @refresh reset - Prevent error during compilation
'use client';

import type { Feedback, MessageToKine, Patient } from '@/interfaces';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, MailWarning, CheckCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NotificationAreaProps {
  feedbackAlerts: Feedback[];
  messages: MessageToKine[];
  patients: Patient[];
  onSelectPatient: (patientId: string) => void;
  onMarkMessageAsRead: (messageId: string) => void;
}

export default function NotificationArea({
  feedbackAlerts,
  messages,
  patients,
  onSelectPatient,
  onMarkMessageAsRead,
}: NotificationAreaProps) {
  const getPatientName = (patientId: string): string => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.prénom} ${patient.nom}` : 'Patient inconnu';
  };

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
      <CardContent className="pt-0 space-y-3">
        {allNotifications.map((notification) => (
          <Alert
            key={`${notification.type}-${notification.id}`}
            variant={notification.type === 'feedback' ? 'destructive' : 'default'}
            className={`border-l-4 ${
              notification.type === 'feedback'
                ? 'border-red-500 bg-red-50 dark:bg-red-900/30'
                : 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
            }`}
          >
            {notification.type === 'feedback' ? (
              <AlertTriangle className={`h-4 w-4 ${notification.type === 'feedback' ? 'text-red-600' : 'text-blue-600'} !left-3 !top-3.5`} />
            ) : (
              <MailWarning className={`h-4 w-4 ${notification.type === 'feedback' ? 'text-red-600' : 'text-blue-600'} !left-3 !top-3.5`} />
            )}
            <AlertTitle className="ml-6 text-sm font-semibold">
              {notification.type === 'feedback'
                ? `Alerte Douleur: ${getPatientName(notification.patient_id)}`
                : `Message Patient: ${getPatientName(notification.patient_id)}`}
            </AlertTitle>
            <AlertDescription className="ml-6 text-xs">
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
              <div className="flex justify-between items-center mt-2">
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
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}
