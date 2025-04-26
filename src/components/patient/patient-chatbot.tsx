
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'; // Removed DialogClose as it's handled by onOpenChange
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { personalizedPatientChatbot } from '@/ai/flows/patient-chatbot'; // Import the updated Genkit flow
import type { PersonalizedPatientChatbotInput, PersonalizedPatientChatbotOutput } from '@/ai/flows/patient-chatbot';
import type { Patient, MessageToKine } from '@/interfaces'; // Import Patient interface
import { Loader2, User, Bot, MessageSquarePlus, Send, CornerDownLeft, AlertTriangle, Sparkles } from 'lucide-react'; // Added Sparkles

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system'; // Added system for escalation prompts and welcome message
  text: string;
  requiresEscalation?: boolean; // Flag if bot suggests escalation
  escalationReason?: string; // Reason from the bot
}

interface PatientChatbotPopupProps {
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

export default function PatientChatbotPopup({ patient }: PatientChatbotPopupProps) { // Destructure patient prop
  const [isOpen, setIsOpen] = useState(false);
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
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        setTimeout(() => scrollViewport.scrollTo({ top: scrollViewport.scrollHeight, behavior: 'smooth' }), 100);
      }
    }
  }, []);

   useEffect(() => {
    if (isOpen) {
      // Add personalized welcome message when opening
      if (messages.length === 0 && patient) { // Check if patient data is available
           const welcomeMessage: ChatMessage = {
                id: 'welcome',
                sender: 'bot',
                text: `Bonjour ${patient.prénom}! Comment puis-je vous aider aujourd'hui ?` // Use patient's name
           };
           setMessages([welcomeMessage]);
      }
      // Focus input when opening and scroll down
      inputRef.current?.focus();
      scrollToBottom();
    } else {
        // Reset chat state when closing - optionally keep history
        setIsLoading(false);
        setIsEscalating(false);
        setInputValue('');
        setEscalationMessage('');
        // Keep messages on close: setMessages([]);
    }
    // Only re-run when isOpen changes or scrollToBottom changes
  }, [isOpen, scrollToBottom, patient, messages.length]); // Add patient and messages.length dependency

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
      const input: PersonalizedPatientChatbotInput = {
        question: userMessage,
        patientContext: {
          id: patient.id,
          name: patient.prénom,
          condition: patient.pathologies.join(', '),
          goals: patient.objectifs.join(', '),
          currentProgramSummary: "Programme axé renforcement dos/abdos et mobilité épaule.", // Example summary - Fetch this dynamically later
          // recentFeedbackSummary: "Douleur modérée (5/10) rapportée hier.", // Example feedback summary - Fetch this dynamically later
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
      setEscalationMessage(`Bonjour, j'ai demandé au chatbot : "${originalQuestion}". ${botReason ? `Il m'a été suggéré de vous contacter car: "${botReason}". ` : ''} Pourriez-vous m'éclairer ?\n\n[Ajoutez vos détails ici]\n\nMerci,\n${patient.prénom}`);
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
    <>
       {/* Updated Button to open the chatbot popup */}
       <Button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 rounded-full py-3 px-4 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 h-auto text-base" // Increased size and added flex properties
            aria-label="Ouvrir l'assistance patient"
       >
           <MessageSquarePlus className="w-5 h-5" /> {/* Slightly smaller icon */}
           <span>Une question ?</span> {/* Added text */}
       </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 flex flex-col max-h-[80vh] shadow-xl border">
          <DialogHeader className="p-4 border-b bg-muted/30 flex flex-row items-center gap-3">
             <Avatar className="w-10 h-10 border-2 border-primary bg-primary/20 text-primary flex-shrink-0">
                 <AvatarFallback><Sparkles className="w-5 h-5" /></AvatarFallback> {/* Kine-Bot Icon */}
             </Avatar>
             <div>
                <DialogTitle className="text-lg">Assistant Kiné Virtuel</DialogTitle>
                <DialogDescription className="text-sm">
                   Posez vos questions ici. Je vous aiderai si possible.
                </DialogDescription>
             </div>
          </DialogHeader>

           <ScrollArea className="flex-grow overflow-y-auto p-4 bg-muted/10" ref={scrollAreaRef}>
             <div className="space-y-4 ">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-end gap-2.5 ${ // Changed items-start to items-end, gap-3 to 2.5
                    message.sender === 'user' ? 'justify-end' : 'justify-start' // Simplified justification
                  } ${message.sender === 'system' ? '!justify-center' : ''}`} // Keep system messages centered
                >
                  {message.sender === 'bot' && (
                     <Avatar className="w-8 h-8 border bg-primary text-primary-foreground flex-shrink-0 mb-1"> {/* Added mb-1 */}
                      <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback> {/* Standard Bot icon */}
                    </Avatar>
                  )}
                   {message.sender === 'system' && !message.requiresEscalation && (
                      <div className="text-xs text-center text-muted-foreground italic px-4 py-1 my-2 max-w-[90%] rounded-md bg-background border border-dashed">
                        {message.text}
                      </div>
                   )}
                   {message.sender !== 'system' || message.requiresEscalation ? (
                     <div
                        className={`rounded-lg p-3 max-w-[80%] text-sm shadow-sm break-words ${ // Added break-words
                        message.sender === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-none' // User bubble styling
                            : message.sender === 'bot'
                            ? 'bg-background border rounded-bl-none' // Bot bubble styling
                            : 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-100 dark:border-amber-700 w-full text-center' // System escalation message style
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
                                   className="text-xs h-7 border-amber-400 hover:bg-amber-200 dark:border-amber-600 dark:hover:bg-amber-800/50 text-amber-900 dark:text-amber-100" // Adjusted colors
                                   onClick={() => handleStartEscalation(lastUserQuestion, message.escalationReason)}
                               >
                                   <Send className="w-3 h-3 mr-1.5"/> Envoyer au Kiné
                               </Button>
                           </div>
                       )}
                    </div>
                   ) : null}
                   {message.sender === 'user' && (
                      <Avatar className="w-8 h-8 border bg-muted flex-shrink-0 mb-1"> {/* Added mb-1 */}
                       <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                     </Avatar>
                   )}
                </div>
              ))}
              {isLoading && !isEscalating && ( // Show bot typing indicator only when not escalating
                <div className="flex items-end gap-2.5 justify-start">
                   <Avatar className="w-8 h-8 border bg-primary text-primary-foreground flex-shrink-0 mb-1">
                       <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback>
                   </Avatar>
                   <div className="rounded-lg p-3 bg-background border shadow-sm rounded-bl-none">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                   </div>
                </div>
              )}
             </div>
           </ScrollArea>


          {isEscalating ? (
              <div className="p-4 border-t bg-muted/30">
                  <p className="text-sm font-medium mb-2 text-foreground">Transférer à votre kiné :</p>
                  <Textarea
                      placeholder="Ajoutez des détails si nécessaire..."
                      value={escalationMessage}
                      onChange={(e) => setEscalationMessage(e.target.value)}
                      rows={5}
                      className="mb-2 text-sm bg-background" // Added bg-background
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
              <DialogFooter className="p-4 border-t bg-muted/30">
                 <div className="flex gap-2 w-full items-center">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Posez votre question..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading || isEscalating}
                    aria-label="Entrez votre question pour le chatbot"
                    className="flex-grow bg-background" // Added bg-background
                  />
                  <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim() || isEscalating} size="icon" aria-label="Envoyer le message" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CornerDownLeft className="h-4 w-4" />}
                  </Button>
                 </div>
              </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
      </>
  );
}
