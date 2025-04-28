'use server';

/**
 * @fileOverview Automatically generates a draft 1-month progressive exercise program for a patient based on their condition, goals, limitations, equipment, and preferred workout days.
 *
 * - generateExerciseProgram - A function that handles the generation of the exercise program.
 * - GenerateExerciseProgramInput - The input type for the generateExerciseProgram function.
 * - GenerateExerciseProgramOutput - The return type for the generateExerciseProgram function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import type { ProgramGenerationInput } from '@/interfaces'; // Use the detailed input type


// Input schema now matches ProgramGenerationInput interface
const GenerateExerciseProgramInputSchema = z.object({
  patientCondition: z
    .string()
    .describe('The patient’s medical condition, including any diagnoses.'),
  patientGoals: z
    .string()
    .describe('The patient’s goals for the exercise program.'),
  patientLimitations: z
    .string()
    .describe('Any limitations the patient has, such as pain or mobility issues.'),
  kineSpecialty: z.string().describe('The specialty of the physiotherapist.'),
  availableEquipment: z.array(z.string()).describe('List of equipment available to the patient.'),
  workoutDays: z.array(z.string()).describe('Preferred workout days of the week for the patient.'),
  specificRemarks: z.string().optional().describe('Any specific remarks or instructions from the kine for the AI.'),
});

// Make sure the exported type matches the schema
export type GenerateExerciseProgramInput = z.infer<typeof GenerateExerciseProgramInputSchema>;

// Output schema requesting a detailed monthly plan description
const GenerateExerciseProgramOutputSchema = z.object({
  exerciseProgram: z.string().describe('A detailed, progressive 1-month exercise plan including weekly breakdowns, exercises, posology (sets, reps, frequency), and how parameters evolve over the month. The plan should be structured clearly (e.g., using Markdown for weeks/days/exercises).'),
});

export type GenerateExerciseProgramOutput = z.infer<
  typeof GenerateExerciseProgramOutputSchema
>;

export async function generateExerciseProgram(
  input: GenerateExerciseProgramInput // Use the detailed input type
): Promise<GenerateExerciseProgramOutput> {
  return generateExerciseProgramFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateExerciseProgramPrompt',
  input: {
    schema: GenerateExerciseProgramInputSchema // Use the updated input schema
  },
  output: {
    schema: GenerateExerciseProgramOutputSchema // Use the updated output schema
  },
  // Updated prompt to request a detailed 1-month progressive plan
  prompt: `You are an expert physiotherapist specializing in {{{kineSpecialty}}}.
Based on the patient's details below, generate a detailed, progressive 1-month exercise program.
The program should clearly outline the progression over the four weeks, specifying exercises, sets, repetitions, frequency (based on preferred days), rest periods, and how these parameters evolve week by week.
Use Markdown format for clarity (e.g., ## Week 1, ### Day: {{{workoutDays.[0]}}}, - Exercise Name: Sets x Reps).

**Patient Details:**
- Condition: {{{patientCondition}}}
- Goals: {{{patientGoals}}}
- Limitations/Pain Points: {{{patientLimitations}}}
- Available Equipment: {{#each availableEquipment}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Preferred Workout Days: {{#each workoutDays}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{#if specificRemarks}}- Specific Instructions from Kiné: {{{specificRemarks}}}{{/if}}

**Generate the 1-Month Progressive Exercise Program:**
`,
});

// Ensure the flow uses the correct input and output schemas
const generateExerciseProgramFlow = ai.defineFlow<
  typeof GenerateExerciseProgramInputSchema,
  typeof GenerateExerciseProgramOutputSchema
>(
  {
    name: 'generateExerciseProgramFlow',
    inputSchema: GenerateExerciseProgramInputSchema,
    outputSchema: GenerateExerciseProgramOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("AI failed to generate program output.");
    }
    // The output should already match GenerateExerciseProgramOutputSchema thanks to definePrompt
    return output;
  }
);
