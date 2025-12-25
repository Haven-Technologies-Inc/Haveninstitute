import { logger } from '../utils/logger';

// Types
interface ParsedQuestion {
  text: string;
  options: { id: string; text: string }[];
  correctAnswers: string[];
  explanation: string;
  category?: string;
  difficulty?: string;
  questionType?: string;
  source?: string;
}

interface ParseResult {
  questions: ParsedQuestion[];
  totalFound: number;
  duplicatesRemoved: number;
  errors: string[];
}

class DocumentParserService {
  private maxQuestions = 1000;

  /**
   * Normalize question text for duplicate comparison
   * Removes extra whitespace, punctuation variations, and lowercases
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ')    // Normalize whitespace
      .trim();
  }

  /**
   * Generate a hash/fingerprint for a question to detect duplicates
   */
  private getQuestionFingerprint(question: ParsedQuestion): string {
    const normalizedText = this.normalizeText(question.text);
    // Include first 2 options to help identify similar questions
    const optionsText = question.options
      .slice(0, 2)
      .map(o => this.normalizeText(o.text))
      .join('|');
    return `${normalizedText}::${optionsText}`;
  }

  /**
   * Check similarity between two question texts (simple Jaccard similarity)
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(this.normalizeText(text1).split(' '));
    const words2 = new Set(this.normalizeText(text2).split(' '));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Remove duplicate questions from array
   */
  private removeDuplicates(questions: ParsedQuestion[]): { unique: ParsedQuestion[]; duplicatesRemoved: number } {
    const seen = new Map<string, number>(); // fingerprint -> index
    const unique: ParsedQuestion[] = [];
    let duplicatesRemoved = 0;

    for (const question of questions) {
      const fingerprint = this.getQuestionFingerprint(question);
      
      // Check exact fingerprint match
      if (seen.has(fingerprint)) {
        duplicatesRemoved++;
        continue;
      }

      // Check for high similarity with existing questions (>85% similar)
      let isDuplicate = false;
      for (const existingQ of unique) {
        const similarity = this.calculateSimilarity(question.text, existingQ.text);
        if (similarity > 0.85) {
          duplicatesRemoved++;
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        seen.set(fingerprint, unique.length);
        unique.push(question);
      }
    }

    return { unique, duplicatesRemoved };
  }

  /**
   * Parse uploaded document based on file type
   */
  async parseDocument(buffer: Buffer, filename: string, mimeType: string): Promise<ParseResult> {
    const extension = filename.toLowerCase().split('.').pop();
    
    logger.info(`Parsing document: ${filename} (${mimeType})`);

    try {
      switch (extension) {
        case 'pdf':
          return await this.parsePDF(buffer, filename);
        case 'docx':
        case 'doc':
          return await this.parseWord(buffer, filename);
        case 'xlsx':
        case 'xls':
          return await this.parseExcel(buffer, filename);
        case 'csv':
          return await this.parseCSV(buffer, filename);
        case 'txt':
          return await this.parseText(buffer, filename);
        default:
          throw new Error(`Unsupported file type: ${extension}`);
      }
    } catch (error) {
      logger.error(`Error parsing document ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Parse PDF document
   */
  private async parsePDF(buffer: Buffer, filename: string): Promise<ParseResult> {
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(buffer);
    const text = data.text;
    
    return this.parseTextContent(text, filename);
  }

  /**
   * Parse Word document (DOCX)
   */
  private async parseWord(buffer: Buffer, filename: string): Promise<ParseResult> {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;
    
    return this.parseTextContent(text, filename);
  }

  /**
   * Parse Excel document
   */
  private async parseExcel(buffer: Buffer, filename: string): Promise<ParseResult> {
    const XLSX = require('xlsx');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    
    const questions: ParsedQuestion[] = [];
    const errors: string[] = [];
    
    // Expected columns: Question, Option A, Option B, Option C, Option D, Correct Answer, Explanation
    // Or: Question, Options (pipe-separated), Correct Answer, Explanation
    
    const headers = rows[0]?.map((h: any) => String(h).toLowerCase().trim()) || [];
    
    // Find column indices
    const questionCol = headers.findIndex((h: string) => h.includes('question') || h === 'text');
    const optionACols = headers.map((h: string, i: number) => 
      (h.includes('option') || h === 'a' || h === 'b' || h === 'c' || h === 'd' || h === 'e') ? i : -1
    ).filter(i => i !== -1);
    const answerCol = headers.findIndex((h: string) => h.includes('answer') || h.includes('correct'));
    const explanationCol = headers.findIndex((h: string) => h.includes('explanation') || h.includes('rationale'));
    const categoryCol = headers.findIndex((h: string) => h.includes('category'));
    const difficultyCol = headers.findIndex((h: string) => h.includes('difficulty'));
    
    // Process each row (skip header)
    for (let i = 1; i < rows.length && questions.length < this.maxQuestions; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;
      
      try {
        const questionText = questionCol >= 0 ? String(row[questionCol] || '').trim() : '';
        if (!questionText) continue;
        
        // Parse options
        let options: { id: string; text: string }[] = [];
        
        if (optionACols.length >= 2) {
          // Individual option columns
          const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
          optionACols.forEach((col, idx) => {
            const text = String(row[col] || '').trim();
            if (text) {
              options.push({ id: optionLetters[idx], text });
            }
          });
        } else {
          // Try to find options column with pipe-separated values
          const optionsCol = headers.findIndex((h: string) => h === 'options');
          if (optionsCol >= 0) {
            const optionsStr = String(row[optionsCol] || '');
            const parts = optionsStr.split('|').map(p => p.trim()).filter(p => p);
            const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
            parts.forEach((text, idx) => {
              // Remove leading letter if present (e.g., "A: text" or "A) text")
              const cleanText = text.replace(/^[A-Fa-f][\:\)\.]?\s*/, '').trim();
              options.push({ id: optionLetters[idx], text: cleanText || text });
            });
          }
        }
        
        // If still no options, try to extract from question text
        if (options.length < 2) {
          const extractedOptions = this.extractOptionsFromText(questionText);
          if (extractedOptions.length >= 2) {
            options = extractedOptions;
          }
        }
        
        if (options.length < 2) {
          errors.push(`Row ${i + 1}: Could not find at least 2 options`);
          continue;
        }
        
        // Parse correct answer
        let correctAnswers: string[] = [];
        if (answerCol >= 0) {
          const answerValue = String(row[answerCol] || '').toUpperCase().trim();
          // Handle formats: "A", "1", "A,B", "1,2", etc.
          const answerParts = answerValue.split(/[,;\s]+/).filter(a => a);
          answerParts.forEach(part => {
            if (/^[A-F]$/.test(part)) {
              correctAnswers.push(part);
            } else if (/^\d+$/.test(part)) {
              const num = parseInt(part);
              if (num >= 1 && num <= options.length) {
                correctAnswers.push(String.fromCharCode(64 + num)); // 1->A, 2->B, etc.
              }
            }
          });
        }
        
        if (correctAnswers.length === 0) {
          errors.push(`Row ${i + 1}: Could not determine correct answer`);
          continue;
        }
        
        const explanation = explanationCol >= 0 ? String(row[explanationCol] || '').trim() : '';
        const category = categoryCol >= 0 ? String(row[categoryCol] || '').trim() : undefined;
        const difficulty = difficultyCol >= 0 ? String(row[difficultyCol] || '').trim() : undefined;
        
        questions.push({
          text: this.cleanQuestionText(questionText),
          options,
          correctAnswers,
          explanation,
          category: this.normalizeCategory(category),
          difficulty: this.normalizeDifficulty(difficulty),
          questionType: correctAnswers.length > 1 ? 'select_all' : 'multiple_choice',
          source: filename
        });
        
      } catch (err) {
        errors.push(`Row ${i + 1}: ${err instanceof Error ? err.message : 'Parse error'}`);
      }
    }
    
    logger.info(`Parsed ${questions.length} questions from Excel file ${filename}`);
    
    // Remove duplicates
    const { unique, duplicatesRemoved } = this.removeDuplicates(questions);
    
    if (duplicatesRemoved > 0) {
      logger.info(`Removed ${duplicatesRemoved} duplicate questions from Excel file`);
    }
    
    return {
      questions: unique,
      totalFound: unique.length,
      duplicatesRemoved,
      errors
    };
  }

  /**
   * Parse CSV content
   */
  private async parseCSV(buffer: Buffer, filename: string): Promise<ParseResult> {
    const content = buffer.toString('utf-8');
    const lines = content.split('\n').map(l => l.trim()).filter(l => l);
    
    if (lines.length < 2) {
      return { questions: [], totalFound: 0, duplicatesRemoved: 0, errors: ['CSV file is empty or has no data rows'] };
    }
    
    // Use same logic as Excel parser
    return this.parseExcel(buffer, filename);
  }

  /**
   * Parse plain text content
   */
  private async parseText(buffer: Buffer, filename: string): Promise<ParseResult> {
    const text = buffer.toString('utf-8');
    return this.parseTextContent(text, filename);
  }

  /**
   * Parse text content (from PDF, Word, or TXT)
   */
  private parseTextContent(text: string, filename: string): ParseResult {
    const questions: ParsedQuestion[] = [];
    const errors: string[] = [];
    
    // Split into question blocks - look for patterns like:
    // "1." or "Question 1" or "Q1:" or numbered patterns
    const questionPatterns = [
      /(?:^|\n)\s*(\d+)\.\s+/g,                    // "1. "
      /(?:^|\n)\s*Question\s*(\d+)[:\.]?\s*/gi,    // "Question 1:"
      /(?:^|\n)\s*Q(\d+)[:\.]?\s*/gi,              // "Q1:"
      /(?:^|\n)\s*\[(\d+)\]\s*/g,                  // "[1]"
    ];
    
    let blocks: string[] = [];
    
    // Try each pattern to split questions
    for (const pattern of questionPatterns) {
      const parts = text.split(pattern).filter(p => p.trim());
      if (parts.length > 3) { // At least a few questions found
        // Filter out just the numbers
        blocks = parts.filter(p => p.trim().length > 20);
        break;
      }
    }
    
    // If no pattern worked, try splitting by double newlines
    if (blocks.length < 2) {
      blocks = text.split(/\n\s*\n/).filter(b => b.trim().length > 50);
    }
    
    // Process each block as a potential question
    for (let i = 0; i < blocks.length && questions.length < this.maxQuestions; i++) {
      const block = blocks[i].trim();
      
      try {
        const parsed = this.parseQuestionBlock(block);
        if (parsed) {
          parsed.source = filename;
          questions.push(parsed);
        }
      } catch (err) {
        errors.push(`Block ${i + 1}: ${err instanceof Error ? err.message : 'Parse error'}`);
      }
    }
    
    logger.info(`Parsed ${questions.length} questions from text content of ${filename}`);
    
    // Remove duplicates
    const { unique, duplicatesRemoved } = this.removeDuplicates(questions);
    
    if (duplicatesRemoved > 0) {
      logger.info(`Removed ${duplicatesRemoved} duplicate questions from text content`);
    }
    
    return {
      questions: unique,
      totalFound: unique.length,
      duplicatesRemoved,
      errors
    };
  }

  /**
   * Parse a single question block from text
   */
  private parseQuestionBlock(block: string): ParsedQuestion | null {
    // Extract question text (everything before options)
    const optionStart = block.search(/\n\s*[A-Da-d][\.\)\:]|\n\s*1[\.\)\:]/);
    
    let questionText = '';
    let optionsText = '';
    
    if (optionStart > 0) {
      questionText = block.substring(0, optionStart).trim();
      optionsText = block.substring(optionStart).trim();
    } else {
      // Try to find options inline
      const inlineMatch = block.match(/(.+?)\s*([A-Da-d][\.\)\:].+)/s);
      if (inlineMatch) {
        questionText = inlineMatch[1].trim();
        optionsText = inlineMatch[2].trim();
      } else {
        return null;
      }
    }
    
    // Clean up question text
    questionText = this.cleanQuestionText(questionText);
    if (questionText.length < 10) return null;
    
    // Extract options
    const options = this.extractOptionsFromText(optionsText || block);
    if (options.length < 2) return null;
    
    // Extract correct answer
    const correctAnswers = this.extractCorrectAnswer(block);
    
    // Extract explanation
    const explanation = this.extractExplanation(block);
    
    return {
      text: questionText,
      options,
      correctAnswers: correctAnswers.length > 0 ? correctAnswers : ['A'], // Default to A if not found
      explanation,
      questionType: correctAnswers.length > 1 ? 'select_all' : 'multiple_choice'
    };
  }

  /**
   * Extract options from text
   */
  private extractOptionsFromText(text: string): { id: string; text: string }[] {
    const options: { id: string; text: string }[] = [];
    
    // Pattern for options: A. text, A) text, A: text, a. text, etc.
    const optionPatterns = [
      /([A-Fa-f])[\.\)\:]\s*([^\n]+?)(?=\s*[A-Fa-f][\.\)\:]|\s*Answer|\s*Explanation|\s*Correct|\s*$)/gs,
      /([A-Fa-f])[\.\)\:]\s*(.+?)(?=\n\s*[A-Fa-f][\.\)\:]|\n\s*Answer|\n\s*Explanation|\n\s*$)/gs,
    ];
    
    for (const pattern of optionPatterns) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length >= 2) {
        matches.forEach(match => {
          const id = match[1].toUpperCase();
          const optText = match[2].trim();
          if (optText && !options.find(o => o.id === id)) {
            options.push({ id, text: optText });
          }
        });
        if (options.length >= 2) break;
      }
    }
    
    // Sort by ID
    options.sort((a, b) => a.id.localeCompare(b.id));
    
    return options;
  }

  /**
   * Extract correct answer from text
   */
  private extractCorrectAnswer(text: string): string[] {
    const answers: string[] = [];
    
    // Look for answer patterns
    const patterns = [
      /Answer[:\s]+([A-Fa-f](?:\s*,\s*[A-Fa-f])*)/i,
      /Correct[:\s]+([A-Fa-f](?:\s*,\s*[A-Fa-f])*)/i,
      /Correct Answer[:\s]+([A-Fa-f](?:\s*,\s*[A-Fa-f])*)/i,
      /\*\*?([A-Fa-f])\*\*?/,  // Bold answer like **A**
      /\(([A-Fa-f])\)/,        // Answer in parentheses
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const answerStr = match[1].toUpperCase();
        answerStr.split(/[,\s]+/).forEach(a => {
          if (/^[A-F]$/.test(a) && !answers.includes(a)) {
            answers.push(a);
          }
        });
        if (answers.length > 0) break;
      }
    }
    
    return answers;
  }

  /**
   * Extract explanation from text
   */
  private extractExplanation(text: string): string {
    const patterns = [
      /Explanation[:\s]+(.+?)(?=\n\s*\d+\.|\n\s*Question|\n\s*$)/is,
      /Rationale[:\s]+(.+?)(?=\n\s*\d+\.|\n\s*Question|\n\s*$)/is,
      /Why[:\s]+(.+?)(?=\n\s*\d+\.|\n\s*Question|\n\s*$)/is,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim().substring(0, 1000); // Limit length
      }
    }
    
    return '';
  }

  /**
   * Clean question text
   */
  private cleanQuestionText(text: string): string {
    return text
      .replace(/^\d+[\.\)\:]\s*/, '')           // Remove leading number
      .replace(/^Question\s*\d*[\.\)\:]?\s*/i, '') // Remove "Question X:"
      .replace(/^Q\d*[\.\)\:]?\s*/i, '')        // Remove "QX:"
      .replace(/\s+/g, ' ')                      // Normalize whitespace
      .trim();
  }

  /**
   * Normalize category to match NCLEX categories
   */
  private normalizeCategory(category?: string): string {
    if (!category) return 'safe_effective_care';
    
    const normalized = category.toLowerCase().replace(/[^a-z]/g, '');
    
    const categoryMap: Record<string, string> = {
      'managementofcare': 'safe_effective_care',
      'safetyinfectioncontrol': 'safe_effective_care',
      'healthpromotion': 'health_promotion',
      'healthpromotionmaintenance': 'health_promotion',
      'psychosocial': 'psychosocial',
      'psychosocialintegrity': 'psychosocial',
      'basiccarecomfort': 'physiological_basic',
      'physiologicalbasic': 'physiological_basic',
      'pharmacological': 'physiological_complex',
      'pharmacologicaltherapies': 'physiological_complex',
      'riskreduction': 'physiological_complex',
      'physiologicaladaptation': 'physiological_complex',
      'physiologicalcomplex': 'physiological_complex',
    };
    
    return categoryMap[normalized] || 'safe_effective_care';
  }

  /**
   * Normalize difficulty level
   */
  private normalizeDifficulty(difficulty?: string): string {
    if (!difficulty) return 'medium';
    
    const normalized = difficulty.toLowerCase().trim();
    
    if (normalized.includes('easy') || normalized.includes('low') || normalized === '1') return 'easy';
    if (normalized.includes('hard') || normalized.includes('high') || normalized === '3') return 'hard';
    return 'medium';
  }
}

export const documentParserService = new DocumentParserService();
