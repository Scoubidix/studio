'use server';

/**
 * @fileOverview Automatically generates a draft exercise program for a patient based on their condition, goals, and limitations.
 *
 * - generateExerciseProgram - A function that handles the generation of the exercise program.
 * - GenerateExerciseProgramInput - The input type for the generateExerciseProgram function.
 * - GenerateExerciseProgramOutput - The return type for the generateExerciseProgram function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

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
  specialty: z.string().describe('The specialty of the physiotherapist.'),
});

export type GenerateExerciseProgramInput = z.infer<
  typeof GenerateExerciseProgramInputSchema
>;

const GenerateExerciseProgramOutputSchema = z.object({
  exerciseProgram: z.string().describe('The generated exercise program.'),
});

export type GenerateExerciseProgramOutput = z.infer<
  typeof GenerateExerciseProgramOutputSchema
>;

export async function generateExerciseProgram(
  input: GenerateExerciseProgramInput
): Promise<GenerateExerciseProgramOutput> {
  return generateExerciseProgramFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateExerciseProgramPrompt',
  input: {
    schema: z.object({
      patientCondition: z
        .string()
        .describe('The patient’s medical condition, including any diagnoses.'),
      patientGoals: z
        .string()
        .describe('The patient’s goals for the exercise program.'),
      patientLimitations: z
        .string()
        .describe('Any limitations the patient has, such as pain or mobility issues.'),
      specialty: z.string().describe('The specialty of the physiotherapist.'),
    }),
  },
  output: {
    schema: z.object({
      exerciseProgram: z.string().describe('The generated exercise program.'),
    }),
  },
  prompt: `You are an expert physiotherapist specializing in {{{specialty}}}. Based on the patient's condition, goals, and limitations, generate a draft exercise program.

Patient Condition: {{{patientCondition}}}
Patient Goals: {{{patientGoals}}}
Patient Limitations: {{{patientLimitations}}}

Exercise Program:`,
});

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
    return output!;
  }
);
