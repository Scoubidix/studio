

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { personalizedPatientChatbot } from '@/ai/flows/patient-chatbot'; // Import the updated Genkit flow
import type { PersonalizedPatientChatbotInput, PersonalizedPatientChatbotOutput } from '@/ai/flows/patient-chatbot';
import type { Patient, MessageToKine } from '@/interfaces'; // Import Patient interface
import { Loader2, User, Bot, Send, CornerDownLeft, AlertTriangle, Sparkles, Info } from 'lucide-react'; // Added Info icon

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system'; // Added system for escalation prompts and welcome message
  text: string;
  requiresEscalation?: boolean; // Flag if bot suggests escalation
  escalationReason?: string; // Reason from the bot
}

interface PatientChatbotProps {
    patient: Patient; // Accept patient data as a prop
}

// --- Mock Data (Physio Knowledge - Keep for now) ---
const mockPhysioKnowledge = {
  commonExercises: ['Squat', 'Pont fessier', 'Étirement ischio-jambiers', 'Rotation tronc', 'Rowing élastique'],
  painManagementTips: [
    'Appliquer de la glace pendant 15-20 minutes après la séance si douleur.',
    'Écouter son corps et ne pas forcer au-delà d\'une douleur modérée (4/10).',
    'Respirer profondément pendant les exercices.',
    'Échauffez-vous avant et étirez-vous doucement après.',
  ],
  commonMistakes: [
    'Arrondir le dos pendant les squats ou les ponts.',
    'Bloquer sa respiration.',
    'Aller trop vite dans les mouvements.',
    'Ne pas respecter les temps de repos indiqués.',
  ],
};

// Mock function to simulate sending a message to the Kiné
const sendMessageToKine = async (messageData: MessageToKine): Promise<void> => {
    console.log("Sending message to Kiné:", messageData);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In a real app, save this to Firestore in a 'messages' collection
    console.log("Message sent successfully (simulated).");
};
// --- End Mock Data ---

export default function PatientChatbot({ patient }: PatientChatbotProps) { // Destructure patient prop
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false); // State for escalation mode
  const [escalationMessage, setEscalationMessage] = useState('');
  const [lastUserQuestion, setLastUserQuestion] = useState(''); // Store the question that led to escalation
  const [lastBotResponse, setLastBotResponse] = useState<string | undefined>(undefined); // Store the bot response that led to escalation


  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

   const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector<HTMLDivElement>('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        setTimeout(() => scrollViewport.scrollTo({ top: scrollViewport.scrollHeight, behavior: 'smooth' }), 100);
      }
    }
  }, []);


   useEffect(() => {
      // Add personalized welcome message when component mounts and patient data is available
      if (messages.length === 0 && patient) {
           const welcomeMessage: ChatMessage = {
                id: 'welcome',
                sender: 'bot',
                 text: `Bonjour ${patient.prénom} ! Je suis prêt à vous aider. Posez-moi vos questions sur vos exercices, votre ressenti, ou demandez des conseils généraux. Si besoin, je vous proposerai de contacter votre kiné.` // Simplified welcome message
           };
           setMessages([welcomeMessage]);
      }
      // Auto-focus input
      inputRef.current?.focus();
  }, [patient]); // Depend on patient data

   useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages, scrollToBottom]);


  const handleSendMessage = async () => {
    const userMessage = inputValue.trim();
    if (!userMessage || isLoading || isEscalating || !patient) return; // Ensure patient data exists

    const newUserMessage: ChatMessage = { id: Date.now().toString(), sender: 'user', text: userMessage };
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare input for the personalized chatbot flow using patient prop
       // TODO: Fetch real program summary and feedback dynamically
      const input: PersonalizedPatientChatbotInput = {
        question: userMessage,
        patientContext: {
          id: patient.id,
          name: patient.prénom,
          condition: patient.pathologies.join(', '),
          goals: patient.objectifs.join(', '),
          currentProgramSummary: "Programme axé renforcement dos/abdos et mobilité épaule.", // Example summary - Fetch this dynamically later
          recentFeedbackSummary: undefined, // Fetch dynamically if needed
        },
        physiotherapyKnowledge: mockPhysioKnowledge,
      };

      const response: PersonalizedPatientChatbotOutput = await personalizedPatientChatbot(input);

      if (response.canAnswer && response.answer) {
        const botMessage: ChatMessage = { id: Date.now().toString() + '-bot', sender: 'bot', text: response.answer };
        setMessages(prev => [...prev, botMessage]);
      } else {
         // Cannot answer, suggest escalation
         const systemMessageText = response.escalationReason || "Je ne suis pas sûr de pouvoir répondre à cela. Voulez-vous envoyer votre question à votre kiné ?";
         const systemMessage: ChatMessage = {
             id: Date.now().toString() + '-sys',
             sender: 'system',
             text: systemMessageText,
             requiresEscalation: true,
             escalationReason: response.escalationReason
         };
         setMessages(prev => [...prev, systemMessage]);
         setLastUserQuestion(userMessage); // Store the question for escalation context
         setLastBotResponse(undefined); // No direct bot answer provided
      }

    } catch (error) {
      console.error('Error calling personalized patient chatbot:', error);
       const errorMessage: ChatMessage = {
           id: Date.now().toString() + '-err',
           sender: 'bot',
           text: "Désolé, une erreur s'est produite. Veuillez réessayer ou contacter votre kiné directement si le problème persiste."
       };
      setMessages(prev => [...prev, errorMessage]);
       toast({ title: "Erreur Chatbot", description: "Impossible de contacter l'assistant virtuel.", variant: "destructive"});
    } finally {
      setIsLoading(false);
       setTimeout(() => inputRef.current?.focus(), 0); // Refocus input
    }
  };

   const handleStartEscalation = (originalQuestion: string, botReason?: string) => {
      if (!patient) return; // Need patient info
      setIsEscalating(true);
      setLastUserQuestion(originalQuestion);
      // Pre-fill escalation message slightly
      setEscalationMessage(`Bonjour, j'ai demandé à l'assistant : "${originalQuestion}". ${botReason ? `Il m'a été suggéré de vous contacter car : "${botReason}". ` : ''} Pourriez-vous m'éclairer ?\n\n[Ajoutez vos détails ici]\n\nMerci,\n${patient.prénom}`);
   };

   const handleCancelEscalation = () => {
        setIsEscalating(false);
        setEscalationMessage('');
        setLastUserQuestion('');
        setLastBotResponse(undefined);
        // Add a message indicating cancellation
         const cancelMessage: ChatMessage = { id: Date.now().toString() + '-cancel', sender: 'system', text: "Envoi du message annulé." };
         setMessages(prev => [...prev, cancelMessage]);
   };

   const handleSendEscalationMessage = async () => {
        if (!escalationMessage.trim() || isLoading || !patient) return; // Need patient info
        setIsLoading(true);

        const messageData: MessageToKine = {
            patient_id: patient.id,
            timestamp: new Date().toISOString(),
            original_question: lastUserQuestion,
            chatbot_response: lastBotResponse, // Include if bot gave a reason/response
            message: escalationMessage.trim(),
            status: 'unread',
        };

        try {
            await sendMessageToKine(messageData);
             toast({
               title: "Message envoyé !",
               description: "Votre kiné a reçu votre message.",
               variant: "default",
             });
             const confirmationMessage: ChatMessage = { id: Date.now().toString() + '-sent', sender: 'system', text: "Votre message a été transmis à votre kiné." };
             setMessages(prev => [...prev, confirmationMessage]);
             // Reset escalation state
             handleCancelEscalation(); // Use cancel logic to reset
        } catch (error) {
             console.error("Error sending escalation message:", error);
             toast({
               title: "Erreur d'envoi",
               description: "Impossible d'envoyer le message. Veuillez réessayer.",
               variant: "destructive",
             });
        } finally {
            setIsLoading(false);
        }

   };


  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isLoading && !isEscalating) {
      handleSendMessage();
    }
  };


  return (
    <Card className="shadow-md h-[75vh] flex flex-col"> {/* Use Card and set height */}
        <CardHeader className="border-b p-4"> {/* Removed flex properties */}
             <div className="flex items-center gap-3"> {/* Wrap title and icon */}
                 <Avatar className="w-10 h-10 border-2 border-primary bg-primary/20 text-primary flex-shrink-0">
                     <AvatarFallback><Sparkles className="w-5 h-5" /></AvatarFallback>
                 </Avatar>
                 <div>
                    <CardTitle className="text-lg">Votre Assistant Kiné Personnalisé</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">L'assistant virtuel de votre kiné.</CardDescription>
                 </div>
             </div>
        </CardHeader>

         <CardContent className="flex-grow p-4 overflow-hidden flex flex-col gap-4"> {/* Added padding and flex */}
            {/* Enhanced Description in Alert */}
            <Alert variant="default" className="border-primary bg-primary/5 dark:bg-primary/20 flex-shrink-0">
                <Info className="h-4 w-4 !text-primary" />
                <AlertTitle className="ml-6 text-primary">Un assistant à votre service</AlertTitle>
                <AlertDescription className="ml-6 text-primary/90 text-xs">
                    Cet assistant est là pour vous guider ! Il connaît <span className='font-semibold'>votre programme spécifique</span>, vos <span className='font-semibold'>objectifs personnels</span> et est <span className='font-semibold'>personnalisé grâce aux conseils spécifiques de votre kiné</span>. Il agit comme l'assistant de votre thérapeute, connaissant ses recommandations pour vous. N'hésitez pas à lui poser des questions sur un exercice, une douleur ressentie (sans demander de diagnostic médical), ou si vous avez un doute. S'il ne peut pas répondre, il vous proposera de <span className='font-semibold'>contacter directement votre kiné</span>.
                </AlertDescription>
            </Alert>

            {/* Chat Area */}
           <ScrollArea className="h-full flex-grow" ref={scrollAreaRef}> {/* ScrollArea fills remaining space */}
             <div className="space-y-4 pb-4 pr-2"> {/* Add padding bottom and right */}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-end gap-2.5 ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  } ${message.sender === 'system' ? '!justify-center' : ''}`}
                >
                  {message.sender === 'bot' && (
                     <Avatar className="w-8 h-8 border bg-primary text-primary-foreground flex-shrink-0 mb-1">
                      <AvatarFallback><Sparkles className="w-4 h-4" /></AvatarFallback>
                    </Avatar>
                  )}
                   {message.sender === 'system' && !message.requiresEscalation && (
                      <div className="text-xs text-center text-muted-foreground italic px-4 py-1 my-2 max-w-[90%] rounded-md bg-background border border-dashed">
                        {message.text}
                      </div>
                   )}
                   {message.sender !== 'system' || message.requiresEscalation ? (
                     <div
                        className={`rounded-lg p-3 max-w-[80%] text-sm shadow-sm break-words ${
                        message.sender === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-none'
                            : message.sender === 'bot'
                            ? 'bg-background border rounded-bl-none'
                            : 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-100 dark:border-amber-700 w-full text-center'
                        }`}
                     >
                      {message.sender === 'system' && message.requiresEscalation && (
                          <div className="flex items-center justify-center gap-2 mb-2 font-medium text-xs">
                              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                              <span>Action requise</span>
                          </div>
                      )}
                      {message.text}
                       {message.sender === 'system' && message.requiresEscalation && (
                           <div className="mt-3 pt-2 border-t border-amber-300/50 dark:border-amber-700/50 flex justify-center">
                               <Button
                                   size="sm"
                                   variant="outline"
                                   className="text-xs h-7 border-amber-400 hover:bg-amber-200 dark:border-amber-600 dark:hover:bg-amber-800/50 text-amber-900 dark:text-amber-100"
                                   onClick={() => handleStartEscalation(lastUserQuestion, message.escalationReason)}
                               >
                                   <Send className="w-3 h-3 mr-1.5"/> Envoyer au Kiné
                               </Button>
                           </div>
                       )}
                    </div>
                   ) : null}
                   {message.sender === 'user' && (
                      <Avatar className="w-8 h-8 border bg-muted flex-shrink-0 mb-1">
                       <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                     </Avatar>
                   )}
                </div>
              ))}
              {isLoading && !isEscalating && (
                <div className="flex items-end gap-2.5 justify-start">
                   <Avatar className="w-8 h-8 border bg-primary text-primary-foreground flex-shrink-0 mb-1">
                       <AvatarFallback><Sparkles className="w-4 h-4" /></AvatarFallback>
                   </Avatar>
                   <div className="rounded-lg p-3 bg-background border shadow-sm rounded-bl-none">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                   </div>
                </div>
              )}
             </div>
           </ScrollArea>
          </CardContent>


          {isEscalating ? (
              // Escalation Input Area
               <div className="p-4 border-t bg-muted/30 flex-shrink-0">
                  <p className="text-sm font-medium mb-2 text-foreground">Transférer à votre kiné :</p>
                  <Textarea
                      placeholder="Ajoutez des détails si nécessaire..."
                      value={escalationMessage}
                      onChange={(e) => setEscalationMessage(e.target.value)}
                      rows={5}
                      className="mb-2 text-sm bg-background"
                      disabled={isLoading}
                      aria-label="Message à envoyer au kiné"
                  />
                  <div className="flex justify-end gap-2">
                       <Button variant="outline" size="sm" onClick={handleCancelEscalation} disabled={isLoading}>
                           Annuler
                       </Button>
                       <Button size="sm" onClick={handleSendEscalationMessage} disabled={isLoading || !escalationMessage.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                           {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                           Envoyer
                       </Button>
                  </div>
              </div>
          ) : (
               // Normal Chat Input Area
               <div className="p-4 border-t bg-muted/30 flex-shrink-0">
                 <div className="flex gap-2 w-full items-center">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Posez votre question..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading || isEscalating}
                    aria-label="Entrez votre question pour l'assistant virtuel"
                    className="flex-grow bg-background"
                  />
                  <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim() || isEscalating} size="icon" aria-label="Envoyer le message" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CornerDownLeft className="h-4 w-4" />}
                  </Button>
                 </div>
              </div>
          )}
    </Card>
  );
}
