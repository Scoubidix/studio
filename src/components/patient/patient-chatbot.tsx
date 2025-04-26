'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { patientChatbot } from '@/ai/flows/patient-chatbot'; // Import the Genkit flow
import type { PatientChatbotInput, PatientChatbotOutput } from '@/ai/flows/patient-chatbot';
import { Loader2, User, Bot } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export default function PatientChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    const userMessage = inputValue.trim();
    if (!userMessage) return;

    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const input: PatientChatbotInput = { question: userMessage };
      const response: PatientChatbotOutput = await patientChatbot(input); // Call the Genkit flow

      setMessages(prev => [...prev, { sender: 'bot', text: response.answer }]);
    } catch (error) {
      console.error('Error calling patient chatbot:', error);
      setMessages(prev => [...prev, { sender: 'bot', text: "Désolé, une erreur s'est produite. Veuillez réessayer." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isLoading) {
      handleSendMessage();
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Assistance Patient</CardTitle>
        <CardDescription>Posez vos questions sur vos exercices ou la gestion de la douleur (conseils généraux uniquement).</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col h-[500px]">
        <ScrollArea className="flex-grow border rounded-md p-4 mb-4 bg-muted/20 h-full">
          <div className="space-y-4">
             {messages.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-10">Posez une question pour commencer...</p>
             )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  message.sender === 'user' ? 'justify-end' : ''
                }`}
              >
                {message.sender === 'bot' && (
                   <Avatar className="w-8 h-8 border bg-primary text-primary-foreground">
                    {/* <AvatarImage src="/path/to/bot-avatar.png" /> */}
                    <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback>
                  </Avatar>
                )}
                 <div
                    className={`rounded-lg p-3 max-w-[75%] text-sm ${
                    message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                 >
                  {message.text}
                </div>
                 {message.sender === 'user' && (
                    <Avatar className="w-8 h-8 border">
                     {/* <AvatarImage src="/path/to/user-avatar.png" /> */}
                     <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                   </Avatar>
                 )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                 <Avatar className="w-8 h-8 border bg-primary text-primary-foreground">
                     <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback>
                 </Avatar>
                 <div className="rounded-lg p-3 bg-secondary text-secondary-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                 </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Posez votre question ici..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            aria-label="Entrez votre question pour le chatbot"
          />
          <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Envoyer'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
