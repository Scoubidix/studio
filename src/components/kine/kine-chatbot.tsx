
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Use Card for layout
// Removed Dialog imports
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
        return `Bonjour Dr. ${kineContext.nom}. Je suis votre assistant IA Mak. Je peux vous aider à générer des programmes, analyser des feedbacks, ou rechercher des informations scientifiques. Comment puis-je vous assister aujourd'hui ?`;
    }
};
// --- End Mock Data ---

export default function KineChatbot({ kine }: KineChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

   const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      // Access the viewport element within the ScrollArea
      const scrollViewport = scrollAreaRef.current.querySelector<HTMLDivElement>('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
         // Use setTimeout to ensure scrolling happens after the DOM update
        setTimeout(() => scrollViewport.scrollTo({ top: scrollViewport.scrollHeight, behavior: 'smooth' }), 100);
      }
    }
  }, []);

   useEffect(() => {
      // Initialize with welcome message if messages are empty
      if (messages.length === 0 && kine) {
           const welcomeMessage: ChatMessage = {
                id: 'welcome-kine',
                sender: 'bot',
                text: `Bonjour Dr. ${kine.nom}. Je suis Mak, votre assistant IA. Je suis là pour vous aider avec la recherche d'informations scientifiques, la génération de programmes et l'analyse de données patient. Comment puis-je vous assister aujourd'hui ? (ex: "Quelles sont les dernières recommandations pour LCA ?", "Génère un programme pour lombalgie", "Analyse feedback patient X")`
           };
           setMessages([welcomeMessage]);
      }
      // Auto-focus input when component mounts or kine data changes
      inputRef.current?.focus();
  }, [kine]); // Depend on kine data

   useEffect(() => {
    // Scroll down when messages update
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
      // This might involve a more complex flow that determines the intent (info search, program gen, etc.)
      // and calls the appropriate underlying Genkit flow or tool.
      const responseText = await mockKineChatbotResponse(userMessage, kine);
      // --- End Replace ---

      const botMessage: ChatMessage = { id: Date.now().toString() + '-bot', sender: 'bot', text: responseText };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error calling Kine chatbot flow:', error);
       const errorMessage: ChatMessage = {
           id: Date.now().toString() + '-err',
           sender: 'bot',
           text: "Désolé, une erreur s'est produite lors de la communication avec l'assistant. Veuillez réessayer."
       };
      setMessages(prev => [...prev, errorMessage]);
       toast({ title: "Erreur Chatbot", description: "Impossible de contacter l'assistant IA.", variant: "destructive"});
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
    <Card className="shadow-md h-[75vh] flex flex-col"> {/* Use Card and set height */}
        <CardHeader className="border-b flex flex-col p-4 space-y-2"> {/* Changed flex-row to flex-col and added space-y */}
            <div className="flex items-center gap-3"> {/* Wrap title and icon */}
                 <Avatar className="w-10 h-10 border-2 border-accent bg-accent/20 text-accent flex-shrink-0">
                     <AvatarFallback><DraftingCompass className="w-5 h-5" /></AvatarFallback>
                 </Avatar>
                 <div>
                    <CardTitle className="text-lg">Assistant Kiné IA "Mak"</CardTitle>
                 </div>
            </div>
             {/* Enhanced Description */}
            <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                 Mak est votre partenaire IA pour une pratique éclairée et efficace. Interrogez-le sur les dernières <span className='font-semibold text-foreground'>recommandations EBP</span>, demandez des <span className='font-semibold text-foreground'>synthèses d'articles</span>, obtenez de l'aide pour la <span className='font-semibold text-foreground'>génération de programmes</span> adaptés ou analysez rapidement les <span className='font-semibold text-foreground'>tendances des feedbacks patients</span>. Gagnez du temps et enrichissez votre expertise.
            </CardDescription>
        </CardHeader>

        <CardContent className="flex-grow p-0 overflow-hidden"> {/* Content takes remaining space, no padding */}
            <ScrollArea className="h-full p-4" ref={scrollAreaRef}> {/* ScrollArea fills CardContent */}
                 <div className="space-y-4 pb-4"> {/* Add padding bottom inside scroll area */}
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
        </CardContent>

        {/* Input area in Card Footer */}
         <div className="p-4 border-t bg-muted/30">
             <div className="flex gap-2 w-full items-center">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Votre demande..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                aria-label="Entrez votre demande pour l'assistant IA Mak"
                className="flex-grow bg-background"
              />
              <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()} size="icon" aria-label="Envoyer la demande" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CornerDownLeft className="h-4 w-4" />}
              </Button>
             </div>
           </div>
    </Card>
  );
}
