/**
 * AI Flashcard Generator Service
 * Generates high-quality NCLEX study flashcards using AI
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { getProvider } from './ai/providers';
import { AIProvider } from './ai/types';
import { FlashcardDeck, Flashcard } from '../models/Flashcard';

// NCLEX Categories for flashcards
const NCLEX_CATEGORIES = [
  'management_of_care',
  'safety_and_infection_control',
  'health_promotion',
  'psychosocial_integrity',
  'basic_care_and_comfort',
  'pharmacology',
  'risk_reduction',
  'physiological_adaptation'
] as const;

type NCLEXCategory = typeof NCLEX_CATEGORIES[number];

// Flashcard types
type FlashcardType = 'definition' | 'concept' | 'clinical_scenario' | 'medication' | 'lab_values' | 'procedure' | 'nursing_intervention';

interface GeneratedFlashcard {
  front: string;
  back: string;
  notes?: string;
  tags: string[];
  category: NCLEXCategory;
  type: FlashcardType;
}

interface BatchFlashcardRequest {
  totalCards: number;
  categories: NCLEXCategory[];
  cardTypes: FlashcardType[];
  topics?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  deckTitle?: string;
  deckDescription?: string;
}

interface FlashcardGenerationJob {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  request: BatchFlashcardRequest;
  progress: number;
  totalBatches: number;
  completedBatches: number;
  generatedCards: number;
  savedCards: number;
  deckId?: string;
  errors: string[];
  warnings: string[];
  createdAt: Date;
  completedAt?: Date;
}

// Job storage
const flashcardJobs: Map<string, FlashcardGenerationJob> = new Map();

// Event emitter for real-time updates
export const flashcardGenerationEvents = new EventEmitter();

// Constants for flashcard generation
const BATCH_SIZE = 10; // Cards per API call
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

// High-yield flashcard generation prompt
const FLASHCARD_GENERATOR_PROMPT = `You are an expert NCLEX educator creating high-yield flashcards for nursing students.

## Flashcard Quality Standards
1. **Front (Question/Term)**: Clear, concise, and focused on ONE concept
2. **Back (Answer)**: Complete but concise explanation with key points
3. **Clinical Relevance**: Include nursing implications and patient safety
4. **Memory Aids**: Use mnemonics, associations, or patterns when helpful

## Flashcard Types
- **definition**: Key nursing terms and concepts
- **concept**: Nursing principles and theories
- **clinical_scenario**: Brief patient situations with nursing actions
- **medication**: Drug names, classes, side effects, nursing considerations
- **lab_values**: Normal ranges, critical values, nursing implications
- **procedure**: Step-by-step nursing procedures and rationales
- **nursing_intervention**: Priority actions and therapeutic responses

## Content Requirements
- Use evidence-based nursing practice
- Include safety considerations (NEVER guess on medication doses)
- Highlight priority nursing actions
- Include relevant lab values when applicable
- Use standardized nursing terminology

## Output Format
Return a JSON array of flashcard objects with this structure:
{
  "front": "Clear question or term",
  "back": "Complete answer with key points",
  "notes": "Optional memory aid or mnemonic",
  "tags": ["tag1", "tag2"],
  "category": "nclex_category",
  "type": "flashcard_type"
}`;

class FlashcardGeneratorService {
  private defaultProvider: AIProvider;

  constructor() {
    this.defaultProvider = (process.env.AI_PROVIDER as AIProvider) || 'openai';
  }

  /**
   * Start a batch flashcard generation job
   */
  async startGeneration(userId: string, request: BatchFlashcardRequest): Promise<string> {
    const jobId = uuidv4();
    const totalBatches = Math.ceil(request.totalCards / BATCH_SIZE);

    const job: FlashcardGenerationJob = {
      id: jobId,
      userId,
      status: 'pending',
      request,
      progress: 0,
      totalBatches,
      completedBatches: 0,
      generatedCards: 0,
      savedCards: 0,
      errors: [],
      warnings: [],
      createdAt: new Date()
    };

    flashcardJobs.set(jobId, job);
    flashcardGenerationEvents.emit('jobCreated', job);

    // Start generation in background
    this.runGenerationJob(jobId).catch(error => {
      console.error(`Flashcard generation job ${jobId} failed:`, error);
      const job = flashcardJobs.get(jobId);
      if (job) {
        job.status = 'failed';
        job.errors.push(error.message);
        flashcardGenerationEvents.emit('jobUpdate', job);
      }
    });

    return jobId;
  }

  /**
   * Run the generation job
   */
  private async runGenerationJob(jobId: string): Promise<void> {
    const job = flashcardJobs.get(jobId);
    if (!job) return;

    job.status = 'processing';
    flashcardGenerationEvents.emit('jobUpdate', job);

    const { request } = job;
    let remainingCards = request.totalCards;

    // Create deck first
    try {
      const deck = await FlashcardDeck.create({
        title: request.deckTitle || `AI Generated - ${new Date().toLocaleDateString()}`,
        description: request.deckDescription || `AI-generated NCLEX flashcards covering ${request.categories.join(', ')}`,
        category: request.categories[0] || 'general',
        tags: request.topics || [],
        isPublic: true,
        isActive: true,
        cardCount: 0,
        createdBy: job.userId
      });
      job.deckId = deck.id;
    } catch (error: any) {
      job.status = 'failed';
      job.errors.push(`Failed to create deck: ${error.message}`);
      flashcardGenerationEvents.emit('jobUpdate', job);
      return;
    }

    try {
      for (let batchIndex = 0; batchIndex < job.totalBatches; batchIndex++) {
        // Re-check job status
        const currentJob = flashcardJobs.get(jobId);
        if (!currentJob || currentJob.status === 'cancelled') break;

        const batchSize = Math.min(BATCH_SIZE, remainingCards);

        // Generate batch with retries
        let cards: GeneratedFlashcard[] = [];
        let retries = 0;

        while (retries < MAX_RETRIES) {
          try {
            cards = await this.generateBatch(batchSize, request);
            break;
          } catch (error: any) {
            retries++;
            if (retries >= MAX_RETRIES) {
              job.errors.push(`Batch ${batchIndex + 1} failed after ${MAX_RETRIES} retries: ${error.message}`);
            } else {
              await this.delay(RETRY_DELAY * retries);
            }
          }
        }

        // Save valid cards
        const validCards = cards.filter(card => this.validateCard(card));
        if (validCards.length > 0) {
          const savedCount = await this.saveCards(validCards, job.deckId!, batchIndex * BATCH_SIZE);
          job.savedCards += savedCount;
        }

        job.generatedCards += cards.length;
        job.completedBatches++;
        job.progress = Math.round((job.completedBatches / job.totalBatches) * 100);
        remainingCards -= batchSize;

        flashcardGenerationEvents.emit('jobUpdate', job);
      }

      // Update deck card count
      if (job.deckId) {
        await FlashcardDeck.update(
          { cardCount: job.savedCards },
          { where: { id: job.deckId } }
        );
      }

      job.status = job.savedCards > 0 ? 'completed' : 'failed';
      job.completedAt = new Date();
      flashcardGenerationEvents.emit('jobUpdate', job);

    } catch (error: any) {
      job.status = 'failed';
      job.errors.push(error.message);
      flashcardGenerationEvents.emit('jobUpdate', job);
    }
  }

  /**
   * Generate a batch of flashcards
   */
  private async generateBatch(batchSize: number, request: BatchFlashcardRequest): Promise<GeneratedFlashcard[]> {
    const ai = getProvider(this.defaultProvider);

    const prompt = this.buildGenerationPrompt(batchSize, request);

    console.log(`Generating ${batchSize} flashcards...`);

    const result = await ai.chat([
      { role: 'system', content: FLASHCARD_GENERATOR_PROMPT },
      { role: 'user', content: prompt }
    ], {
      temperature: 0.8,
      maxTokens: 4000
    });

    return this.parseGeneratedCards(result.content);
  }

  /**
   * Build generation prompt
   */
  private buildGenerationPrompt(count: number, request: BatchFlashcardRequest): string {
    const categoryList = request.categories.map(c => `- ${c.replace(/_/g, ' ')}`).join('\n');
    const typeList = request.cardTypes.map(t => `- ${t.replace(/_/g, ' ')}`).join('\n');
    const topicsSection = request.topics?.length 
      ? `\n## Focus Topics\n${request.topics.map(t => `- ${t}`).join('\n')}`
      : '';

    return `Generate exactly ${count} high-yield NCLEX flashcards.

## NCLEX Categories to Cover
${categoryList}

## Card Types to Include
${typeList}

## Difficulty Level
${request.difficulty}
${topicsSection}

## Requirements
1. Each flashcard must be UNIQUE with different content
2. Front should be concise and clear
3. Back should be comprehensive but memorable
4. Include relevant nursing interventions
5. Add helpful mnemonics or memory aids in notes when possible

Return ONLY a valid JSON array containing ${count} flashcard objects.
Do NOT include any markdown formatting, code blocks, or additional text.
Start directly with [ and end with ]`;
  }

  /**
   * Parse generated flashcards from AI response
   */
  private parseGeneratedCards(content: string): GeneratedFlashcard[] {
    try {
      console.log('=== FLASHCARD AI RESPONSE START ===');
      console.log(content.substring(0, 1000));
      console.log('=== FLASHCARD AI RESPONSE END ===');

      let jsonStr = content.trim();

      // Remove markdown code blocks if present
      if (jsonStr.includes('```')) {
        jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim();
      }

      // Find JSON array
      let arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
      if (!arrayMatch) {
        const objMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (objMatch) {
          arrayMatch = [`[${objMatch[0]}]`] as RegExpMatchArray;
        } else {
          throw new Error('No JSON array found in response');
        }
      }

      const cards = JSON.parse(arrayMatch[0]);
      const cardsArray = Array.isArray(cards) ? cards : [cards];

      console.log(`Parsed ${cardsArray.length} raw flashcards`);

      return cardsArray.map((c: any) => this.normalizeCard(c));
    } catch (error: any) {
      console.error('Failed to parse flashcards:', error);
      console.error('Raw content:', content.substring(0, 500));
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }

  /**
   * Normalize a flashcard
   */
  private normalizeCard(c: any): GeneratedFlashcard {
    const front = c.front || c.question || c.term || '';
    const back = c.back || c.answer || c.definition || '';
    
    console.log(`Normalized card: ${front.substring(0, 40)}...`);

    return {
      front,
      back,
      notes: c.notes || c.hint || c.mnemonic || undefined,
      tags: Array.isArray(c.tags) ? c.tags : [],
      category: c.category || 'management_of_care',
      type: c.type || 'concept'
    };
  }

  /**
   * Validate a flashcard
   */
  private validateCard(card: GeneratedFlashcard): boolean {
    if (!card.front || card.front.length < 5) {
      console.log('Invalid card: front too short');
      return false;
    }
    if (!card.back || card.back.length < 10) {
      console.log('Invalid card: back too short');
      return false;
    }
    return true;
  }

  /**
   * Save flashcards to database
   */
  private async saveCards(cards: GeneratedFlashcard[], deckId: string, startPosition: number): Promise<number> {
    let savedCount = 0;

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      try {
        await Flashcard.create({
          deckId,
          front: card.front,
          back: card.back,
          notes: card.notes,
          tags: card.tags,
          isActive: true,
          position: startPosition + i
        });
        savedCount++;
      } catch (error: any) {
        console.error(`Failed to save flashcard: ${error.message}`);
      }
    }

    return savedCount;
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): FlashcardGenerationJob | null {
    return flashcardJobs.get(jobId) || null;
  }

  /**
   * Cancel a job
   */
  cancelJob(jobId: string): boolean {
    const job = flashcardJobs.get(jobId);
    if (job && job.status === 'processing') {
      job.status = 'cancelled';
      flashcardGenerationEvents.emit('jobUpdate', job);
      return true;
    }
    return false;
  }

  /**
   * Get user's jobs
   */
  getUserJobs(userId: string): FlashcardGenerationJob[] {
    return Array.from(flashcardJobs.values())
      .filter(job => job.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const flashcardGeneratorService = new FlashcardGeneratorService();
