
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { Kine } from '@/interfaces'; // Import Kine interface
import { Loader2, User, Bot, CornerDownLeft, Sparkles, DraftingCompass } from 'lucide-react'; // Example icons

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

interface KineChatbotProps {
    kine: Kine; // Accept Kine data as a prop
}

// --- Mock Data/Functions (Replace with actual flows/logic) ---
// TODO: Create Genkit flows for Kine-specific tasks (e.g., program generation, feedback analysis, article summarization)
const mockKineChatbotResponse = async (question: string, kineContext: Kine): Promise<string> => {
    console.log(`Simulating AI response for Kine ${kineContext.prénom} asking: ${question}`);
    await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate delay

    if (question.toLowerCase().includes("génère un programme")) {
        return `Ok, Dr. ${kineContext.nom}. Pour quel patient et quelles conditions souhaitez-vous générer un programme ? Veuillez fournir plus de détails.`;
    } else if (question.toLowerCase().includes("analyse le feedback")) {
        return `Bien sûr. Pour quel patient souhaitez-vous analyser les derniers feedbacks ? Je peux rechercher des tendances de douleur ou de difficulté.`;
    } else if (question.toLowerCase().includes("résume cet article")) {
        return `Veuillez fournir l'URL ou le texte de l'article que vous souhaitez résumer. Je peux essayer d'en extraire les points clés.`;
    } else {
        return `Bonjour Dr. ${kineContext.nom}. Je suis votre assistant IA. Je peux vous aider à générer des programmes, analyser des feedbacks, ou résumer des articles. Comment puis-je vous assister aujourd'hui ?`;
    }
};
// --- End Mock Data ---

export default function KineChatbot({ kine }: KineChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      if (messages.length === 0 && kine) {
           const welcomeMessage: ChatMessage = {
                id: 'welcome-kine',
                sender: 'bot',
                text: `Bonjour Dr. ${kine.nom}. Comment puis-je vous aider aujourd'hui ? (ex: "génère un programme", "analyse feedback patient X", "résume cet article...")`
           };
           setMessages([welcomeMessage]);
      }
      inputRef.current?.focus();
      scrollToBottom();
    } else {
        // Reset chat state when closing - optionally keep history
        setIsLoading(false);
        setInputValue('');
        // Keep messages on close: setMessages([]);
    }
  }, [isOpen, scrollToBottom, kine, messages.length]);

   useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);


  const handleSendMessage = async () => {
    const userMessage = inputValue.trim();
    if (!userMessage || isLoading || !kine) return;

    const newUserMessage: ChatMessage = { id: Date.now().toString(), sender: 'user', text: userMessage };
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // --- TODO: Replace with actual Genkit flow calls based on intent detection ---
      const responseText = await mockKineChatbotResponse(userMessage, kine);
      // --- End Replace ---

      const botMessage: ChatMessage = { id: Date.now().toString() + '-bot', sender: 'bot', text: responseText };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error calling Kine chatbot flow:', error);
       const errorMessage: ChatMessage = {
           id: Date.now().toString() + '-err',
           sender: 'bot',
           text: "Désolé, une erreur s'est produite. Veuillez réessayer."
       };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
       setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isLoading) {
      handleSendMessage();
    }
  };


  return (
    <>
       {/* Floating Action Button for Kine Chatbot */}
       <Button
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 rounded-full p-3 shadow-lg bg-accent hover:bg-accent/90 text-accent-foreground h-12 w-12" // Adjusted size and colors
            aria-label="Ouvrir l'assistant Kiné IA"
       >
           <Sparkles className="w-5 h-5" />
       </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 flex flex-col max-h-[80vh] shadow-xl border">
          <DialogHeader className="p-4 border-b bg-muted/30 flex flex-row items-center gap-3">
             {/* Kine-Specific Icon */}
             <Avatar className="w-10 h-10 border-2 border-accent bg-accent/20 text-accent flex-shrink-0">
                 <AvatarFallback><DraftingCompass className="w-5 h-5" /></AvatarFallback>
             </Avatar>
             <div>
                <DialogTitle className="text-lg">Assistant Kiné IA</DialogTitle>
                <DialogDescription className="text-sm">
                   Votre outil IA pour optimiser votre pratique.
                </DialogDescription>
             </div>
          </DialogHeader>

           <ScrollArea className="flex-grow overflow-y-auto p-4 bg-muted/10" ref={scrollAreaRef}>
             <div className="space-y-4 ">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-end gap-2.5 ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.sender === 'bot' && (
                     <Avatar className="w-8 h-8 border bg-accent text-accent-foreground flex-shrink-0 mb-1">
                      <AvatarFallback><DraftingCompass className="w-4 h-4" /></AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-lg p-3 max-w-[80%] text-sm shadow-sm break-words ${
                    message.sender === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-background border rounded-bl-none'
                    }`}
                  >
                      {message.text}
                    </div>
                   {message.sender === 'user' && (
                      <Avatar className="w-8 h-8 border bg-muted flex-shrink-0 mb-1">
                       <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                     </Avatar>
                   )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-end gap-2.5 justify-start">
                   <Avatar className="w-8 h-8 border bg-accent text-accent-foreground flex-shrink-0 mb-1">
                       <AvatarFallback><DraftingCompass className="w-4 h-4" /></AvatarFallback>
                   </Avatar>
                   <div className="rounded-lg p-3 bg-background border shadow-sm rounded-bl-none">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                   </div>
                </div>
              )}
             </div>
           </ScrollArea>

           <DialogFooter className="p-4 border-t bg-muted/30">
             <div className="flex gap-2 w-full items-center">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Votre demande..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                aria-label="Entrez votre demande pour l'assistant IA"
                className="flex-grow bg-background"
              />
              <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()} size="icon" aria-label="Envoyer la demande" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CornerDownLeft className="h-4 w-4" />}
              </Button>
             </div>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
