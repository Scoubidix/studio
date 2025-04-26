'use server';
/**
 * @fileOverview Personalized patient chatbot flow. Uses patient context and physiotherapy knowledge.
 *               Includes an escalation mechanism to send messages to the physiotherapist (Kiné)
 *               if the chatbot cannot provide a satisfactory answer.
 *
 * - personalizedPatientChatbot - A function that handles the personalized patient chatbot interactions.
 * - PersonalizedPatientChatbotInput - The input type for the personalizedPatientChatbot function.
 * - PersonalizedPatientChatbotOutput - The return type for the personalizedPatientChatbot function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

// --- Mock Data Structures (Replace with actual data fetching/types) ---
// These Zod schemas represent the *kind* of data we want to pass.
// In a real app, you'd fetch this data based on the patientId.

const PatientContextSchema = z.object({
  id: z.string().describe('The unique identifier of the patient.'),
  name: z.string().describe('The first name of the patient.'),
  condition: z.string().describe('The primary medical condition being treated.'),
  goals: z.string().describe('The patient\'s stated goals for physiotherapy.'),
  currentProgramSummary: z.string().describe('A brief summary of the current exercise program.'),
  recentFeedbackSummary: z.string().optional().describe('A summary of the patient\'s recent feedback (pain, difficulty).'),
}).describe('Contextual information about the specific patient.');

const PhysiotherapyKnowledgeSchema = z.object({
  commonExercises: z.array(z.string()).describe('List of common exercises relevant to the patient\'s condition or typical physiotherapy practice.'),
  painManagementTips: z.array(z.string()).describe('General tips for managing pain related to physiotherapy.'),
  commonMistakes: z.array(z.string()).describe('Common mistakes patients make during exercises.'),
}).describe('General knowledge base for physiotherapy relevant to the chatbot\'s function.');
// --- End Mock Data Structures ---


export const PersonalizedPatientChatbotInputSchema = z.object({
  question: z.string().describe('The question asked by the patient.'),
  patientContext: PatientContextSchema.describe('Information specific to the patient asking the question.'),
  physiotherapyKnowledge: PhysiotherapyKnowledgeSchema.describe('General physiotherapy knowledge base.'),
});
export type PersonalizedPatientChatbotInput = z.infer<typeof PersonalizedPatientChatbotInputSchema>;

export const PersonalizedPatientChatbotOutputSchema = z.object({
  canAnswer: z.boolean().describe('Indicates if the chatbot can provide a direct answer based on its knowledge and the patient context.'),
  answer: z.string().optional().describe('The chatbot\'s answer to the patient\'s question. Provided only if canAnswer is true.'),
  escalationReason: z.string().optional().describe('The reason why the chatbot cannot answer and escalation is suggested. Provided only if canAnswer is false.'),
});
export type PersonalizedPatientChatbotOutput = z.infer<typeof PersonalizedPatientChatbotOutputSchema>;

// Exported wrapper function
export async function personalizedPatientChatbot(input: PersonalizedPatientChatbotInput): Promise<PersonalizedPatientChatbotOutput> {
  return personalizedPatientChatbotFlow(input);
}

const personalizedPatientChatbotPrompt = ai.definePrompt({
  name: 'personalizedPatientChatbotPrompt',
  input: { schema: PersonalizedPatientChatbotInputSchema },
  output: { schema: PersonalizedPatientChatbotOutputSchema },
  prompt: `You are a helpful and personalized physiotherapy assistant chatbot for {{patientContext.name}}.
Your goal is to answer patient questions using the provided context and general physiotherapy knowledge.
You MUST NOT provide specific medical diagnoses or alter the prescribed exercise program.
Focus on clarifying exercises, offering general pain management advice based on provided tips, explaining common mistakes, and encouraging the patient.
Refer to the patient by their name, {{patientContext.name}}, where appropriate and maintain a friendly, supportive tone.

**Patient Context:**
- Condition: {{patientContext.condition}}
- Goals: {{patientContext.goals}}
- Current Program Summary: {{patientContext.currentProgramSummary}}
{{#if patientContext.recentFeedbackSummary}}- Recent Feedback Summary: {{patientContext.recentFeedbackSummary}}{{/if}}

**General Physiotherapy Knowledge:**
- Common Exercises: {{#each physiotherapyKnowledge.commonExercises}} - {{this}} {{/each}}
- Pain Management Tips: {{#each physiotherapyKnowledge.painManagementTips}} - {{this}} {{/each}}
- Common Mistakes: {{#each physiotherapyKnowledge.commonMistakes}} - {{this}} {{/each}}

**Patient's Question:** {{{question}}}

**Your Task:**
1.  Analyze the patient's question: "{{{question}}}".
2.  Determine if you can provide a helpful, safe, and general answer based *only* on the Patient Context and General Physiotherapy Knowledge provided above.
3.  If you **can** answer directly:
    - Set 'canAnswer' to true.
    - Formulate a clear, concise, and supportive answer. Personalize it using the patient's name and context if relevant. Ensure the answer aligns with the provided knowledge and does *not* constitute specific medical advice or program modification.
    - Set 'answer' to your formulated response.
    - Leave 'escalationReason' empty.
4.  If you **cannot** answer directly (e.g., the question asks for a diagnosis, requires modifying the program, is too specific, or falls outside your knowledge):
    - Set 'canAnswer' to false.
    - Leave 'answer' empty.
    - Set 'escalationReason' to a brief explanation of why you cannot answer and suggesting the patient send the message to their kine (e.g., "This question requires specific medical advice.", "I cannot modify your program.", "This question is outside my scope.").

**Example Scenario 1 (Can Answer):**
Question: "How many reps should I do for the squat?"
Answer (if squats are in program summary): "Hi {{patientContext.name}}, based on your program summary, you should be doing X reps for the squats. Remember to focus on your form!"
canAnswer: true

**Example Scenario 2 (Cannot Answer - Medical Advice):**
Question: "My knee feels sharp pain when I do exercise X, what's wrong?"
escalationReason: "I cannot diagnose pain. Please describe this to your kine so they can assess it."
canAnswer: false

**Example Scenario 3 (Cannot Answer - Program Modification):**
Question: "Can I add another exercise Y to my routine?"
escalationReason: "I cannot modify your prescribed program. Please discuss adding new exercises with your kine."
canAnswer: false

**Example Scenario 4 (Cannot Answer - Outside Scope):**
Question: "What are the best running shoes?"
escalationReason: "Shoe recommendations are outside my scope. Your kine might have suggestions based on your specific needs."
canAnswer: false

Provide your response in the structured output format.
`,
});

const personalizedPatientChatbotFlow = ai.defineFlow<
  typeof PersonalizedPatientChatbotInputSchema,
  typeof PersonalizedPatientChatbotOutputSchema
>({
  name: 'personalizedPatientChatbotFlow',
  inputSchema: PersonalizedPatientChatbotInputSchema,
  outputSchema: PersonalizedPatientChatbotOutputSchema,
},
async (input) => {
  // In a real application, you might fetch physiotherapyKnowledge from a database here
  // or have it predefined. PatientContext would be fetched based on an authenticated user ID.

  const { output } = await personalizedPatientChatbotPrompt(input);

  if (!output) {
    // Handle cases where the prompt fails unexpectedly
    console.error("Personalized chatbot prompt failed to return output.");
    return {
      canAnswer: false,
      escalationReason: "An internal error occurred while processing your request.",
    };
  }

  return output;
});
