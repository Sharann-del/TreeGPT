import OpenAI from 'openai';
import { PromptContext } from '../types';

export class OpenAIService {
  private client: OpenAI | null = null;

  /**
   * Initialize OpenAI client with user's API key
   * SECURITY: API keys are provided by users at runtime (BYOK model)
   * NEVER hardcode API keys here or commit them to version control
   */
  initialize(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true // Required for browser usage with BYOK
    });
  }

  isInitialized(): boolean {
    return this.client !== null;
  }

  async solveRootProblem(problem: string): Promise<string> {
    if (!this.client) throw new Error('OpenAI client not initialized');

    const prompt = `Solve the following problem. Provide a clear, detailed solution.

Problem:
${problem}

Solution:`;

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful problem-solving assistant. Provide clear, detailed solutions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    return response.choices[0]?.message?.content || '';
  }

  async solveSubProblem(
    subProblem: string,
    context: PromptContext
  ): Promise<string> {
    if (!this.client) throw new Error('OpenAI client not initialized');

    const prompt = `You are solving a sub-problem within a larger solution.

Parent problem summary:
${context.parentProblem || 'N/A'}

Current step that is unclear:
${context.currentStep || 'N/A'}

Context from ancestor problems:
${context.ancestorSummary || 'None'}

Sub-problem to solve:
${subProblem}

Provide a clear, detailed solution to this sub-problem.

Solution:`;

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are solving a specific sub-problem. Provide clear, detailed solutions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    return response.choices[0]?.message?.content || '';
  }

  async updateParentSolution(
    parentSolution: string,
    subProblemSolution: string,
    context: PromptContext
  ): Promise<string> {
    if (!this.client) throw new Error('OpenAI client not initialized');

    const prompt = `You are updating a parent solution based on a detailed sub-problem solution.

Original parent problem:
${context.parentProblem || 'N/A'}

Original parent solution:
${parentSolution}

Sub-problem that was solved:
${context.currentStep || 'N/A'}

Sub-problem solution:
${subProblemSolution}

Carefully analyze the sub-problem solution and determine if there are any changes, improvements, or additional details that should be incorporated into the parent solution.

IMPORTANT: Only update the parent solution if the sub-problem solution provides:
- More detailed or accurate information
- Important clarifications or corrections
- Additional steps or considerations that enhance the parent solution

If the sub-problem solution doesn't add meaningful value or changes to the parent solution, you may keep the original parent solution mostly unchanged, but still review it for any minor improvements.

When updating:
- Integrate the sub-problem solution intelligently into the parent solution
- Maintain clarity and coherence
- Ensure the updated solution is complete and comprehensive
- Only make changes where the sub-problem solution provides clear improvements

Updated solution:`;

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are updating a solution based on detailed sub-problem analysis. Provide a clear, complete solution.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 2000
    });

    return response.choices[0]?.message?.content || parentSolution;
  }
}

export const openAIService = new OpenAIService();

