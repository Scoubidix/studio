'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { personalizedPatientChatbot } from '@/ai/flows/patient-chatbot'; // Import the updated Genkit flow
import type { PersonalizedPatientChatbotInput, PersonalizedPatientChatbotOutput } from '@/ai/flows/patient-chatbot';
import type { Patient, MessageToKine } from '@/interfaces'; // Import Patient interface
import { Loader2, User, Bot, MessageSquarePlus, Send, CornerDownLeft, AlertTriangle } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system'; // Added system for escalation prompts
  text: string;
  requiresEscalation?: boolean; // Flag if bot suggests escalation
  escalationReason?: string; // Reason from the bot
}

// --- Mock Data (Replace with actual data fetching logic) ---
const mockPatientData: Patient = {
  id: 'patientTest',
  nom: 'Dupont',
  prénom: 'Jean',
  date_naissance: '1985-03-15',
  pathologies: ['Lombalgie chronique', 'Tendinopathie épaule droite'],
  remarques: 'Motivé mais craint la douleur.',
  kine_id: 'kineTest1',
  objectifs: ['Amélioration de la mobilité lombaire', 'Reprise progressive de la course à pied'], // Objectives for mock patient
};

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

export default function PatientChatbotPopup() {
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
      // Focus input when opening and scroll down
      inputRef.current?.focus();
      scrollToBottom();
    } else {
        // Reset chat state when closing
        // setMessages([]); // Option: clear history on close, or keep it
        setIsLoading(false);
        setIsEscalating(false);
        setInputValue('');
        setEscalationMessage('');
    }
  }, [isOpen, scrollToBottom]);

   useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages, scrollToBottom]);


  const handleSendMessage = async () => {
    const userMessage = inputValue.trim();
    if (!userMessage || isLoading || isEscalating) return;

    const newUserMessage: ChatMessage = { id: Date.now().toString(), sender: 'user', text: userMessage };
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare input for the personalized chatbot flow
      const input: PersonalizedPatientChatbotInput = {
        question: userMessage,
        patientContext: {
          id: mockPatientData.id,
          name: mockPatientData.prénom,
          condition: mockPatientData.pathologies.join(', '),
          goals: mockPatientData.objectifs.join(', '), // Use patient objectives
          currentProgramSummary: "Programme axé renforcement dos/abdos et mobilité épaule.", // Example summary
          // recentFeedbackSummary: "Douleur modérée (5/10) rapportée hier.", // Example feedback summary
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
      setIsEscalating(true);
      setLastUserQuestion(originalQuestion);
      // Pre-fill escalation message slightly
      setEscalationMessage(`Bonjour, j'ai demandé au chatbot : "${originalQuestion}". ${botReason ? `Il a répondu : "${botReason}". ` : ''} Pourriez-vous m'aider ?\n\n[Ajoutez vos détails ici]\n\nMerci,\n${mockPatientData.prénom}`);
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
        if (!escalationMessage.trim() || isLoading) return;
        setIsLoading(true);

        const messageData: MessageToKine = {
            patient_id: mockPatientData.id,
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
       {/* Button to open the chatbot popup */}
       <Button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 rounded-full p-4 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
            aria-label="Ouvrir l'assistance patient"
       >
           <MessageSquarePlus className="w-6 h-6" />
       </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 flex flex-col max-h-[80vh]">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Assistance Patient</DialogTitle>
            <DialogDescription>
              Posez vos questions ici. Si je ne peux pas répondre, je vous proposerai de contacter votre kiné.
            </DialogDescription>
          </DialogHeader>

           <ScrollArea className="flex-grow overflow-y-auto p-4 bg-muted/20" ref={scrollAreaRef}>
             <div className="space-y-4 ">
               {messages.length === 0 && !isEscalating && (
                  <p className="text-center text-muted-foreground text-sm py-10">Posez une question pour commencer...</p>
               )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.sender === 'user' ? 'justify-end' : ''
                  } ${message.sender === 'system' ? 'justify-center' : ''}`}
                >
                  {message.sender === 'bot' && (
                     <Avatar className="w-8 h-8 border bg-primary text-primary-foreground flex-shrink-0">
                      <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback>
                    </Avatar>
                  )}
                   {message.sender === 'system' && !message.requiresEscalation && (
                      <div className="text-xs text-center text-muted-foreground italic px-4 py-1 my-2 max-w-[90%]">
                        {message.text}
                      </div>
                   )}
                   {message.sender !== 'system' || message.requiresEscalation ? (
                     <div
                        className={`rounded-lg p-3 max-w-[80%] text-sm shadow-sm ${
                        message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : message.sender === 'bot'
                            ? 'bg-background border' // Changed bot background
                            : 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-100 dark:border-amber-700' // System escalation message style
                        }`}
                     >
                      {message.sender === 'system' && message.requiresEscalation && (
                          <div className="flex items-center gap-2 mb-2 font-medium text-xs">
                              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                              <span>Action requise</span>
                          </div>
                      )}
                      {message.text}
                       {message.sender === 'system' && message.requiresEscalation && (
                           <div className="mt-3 pt-2 border-t border-amber-300 dark:border-amber-700/50">
                               <Button
                                   size="sm"
                                   variant="outline"
                                   className="text-xs h-7 border-amber-400 hover:bg-amber-200 dark:border-amber-600 dark:hover:bg-amber-800"
                                   onClick={() => handleStartEscalation(lastUserQuestion, message.escalationReason)}
                               >
                                   <Send className="w-3 h-3 mr-1.5"/> Envoyer au Kiné
                               </Button>
                           </div>
                       )}
                    </div>
                   ) : null}
                   {message.sender === 'user' && (
                      <Avatar className="w-8 h-8 border flex-shrink-0">
                       <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                     </Avatar>
                   )}
                </div>
              ))}
              {isLoading && !isEscalating && ( // Show bot typing indicator only when not escalating
                <div className="flex items-start gap-3">
                   <Avatar className="w-8 h-8 border bg-primary text-primary-foreground flex-shrink-0">
                       <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback>
                   </Avatar>
                   <div className="rounded-lg p-3 bg-background border shadow-sm">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                   </div>
                </div>
              )}
             </div>
           </ScrollArea>


          {isEscalating ? (
              <div className="p-4 border-t">
                  <p className="text-sm font-medium mb-2 text-foreground">Envoyer un message à votre kiné :</p>
                  <Textarea
                      placeholder="Votre message..."
                      value={escalationMessage}
                      onChange={(e) => setEscalationMessage(e.target.value)}
                      rows={5}
                      className="mb-2 text-sm"
                      disabled={isLoading}
                  />
                  <div className="flex justify-end gap-2">
                       <Button variant="outline" size="sm" onClick={handleCancelEscalation} disabled={isLoading}>
                           Annuler
                       </Button>
                       <Button size="sm" onClick={handleSendEscalationMessage} disabled={isLoading || !escalationMessage.trim()}>
                           {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                           Envoyer
                       </Button>
                  </div>
              </div>
          ) : (
              <DialogFooter className="p-4 border-t ">
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
                    className="flex-grow"
                  />
                  <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim() || isEscalating} size="icon" aria-label="Envoyer le message">
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
