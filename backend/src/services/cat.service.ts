/**
 * Computerized Adaptive Testing (CAT) Service
 * Implements Item Response Theory (IRT) for adaptive question selection
 */

export interface IRT Parameters {
  discrimination: number; // a parameter (0.5 - 2.5)
  difficulty: number; // b parameter (-3 to +3)
  guessing: number; // c parameter (0 - 0.35)
}

export interface CATResponse {
  questionId: string;
  correct: boolean;
  timeSpent: number;
}

export class CATService {
  private readonly MIN_QUESTIONS = 60;
  private readonly MAX_QUESTIONS = 145;
  private readonly STOPPING_CRITERION = 0.2; // Standard error threshold
  private readonly PASSING_THRESHOLD = 0.0; // Logit scale

  /**
   * Calculate probability of correct response using 3PL IRT model
   * P(θ) = c + (1 - c) / (1 + e^(-a(θ - b)))
   */
  calculateProbability(ability: number, params: IRTParameters): number {
    const { discrimination, difficulty, guessing } = params;
    const exponent = -discrimination * (ability - difficulty);
    return guessing + (1 - guessing) / (1 + Math.exp(exponent));
  }

  /**
   * Estimate ability using Maximum Likelihood Estimation (MLE)
   */
  estimateAbility(responses: CATResponse[], questionParams: IRTParameters[]): number {
    let ability = 0; // Start at average ability
    let iterations = 0;
    const maxIterations = 20;
    const tolerance = 0.001;

    while (iterations < maxIterations) {
      let sumFirstDerivative = 0;
      let sumSecondDerivative = 0;

      responses.forEach((response, index) => {
        const params = questionParams[index];
        const p = this.calculateProbability(ability, params);
        const q = 1 - p;
        const { discrimination, guessing } = params;

        // First derivative
        const firstDerivative = discrimination * (response.correct ? 1 : 0) - p) * (p - guessing) / (p * q * (1 - guessing));
        sumFirstDerivative += firstDerivative;

        // Second derivative
        const secondDerivative = -discrimination * discrimination * (p - guessing) * (p - guessing) / (p * q * (1 - guessing) * (1 - guessing));
        sumSecondDerivative += secondDerivative;
      });

      // Newton-Raphson update
      const delta = -sumFirstDerivative / sumSecondDerivative;
      ability += delta;

      if (Math.abs(delta) < tolerance) {
        break;
      }

      iterations++;
    }

    return ability;
  }

  /**
   * Calculate standard error of ability estimate
   */
  calculateStandardError(ability: number, questionParams: IRTParameters[]): number {
    let information = 0;

    questionParams.forEach(params => {
      const p = this.calculateProbability(ability, params);
      const q = 1 - p;
      const { discrimination, guessing } = params;

      // Fisher information
      const pMinusC = p - guessing;
      const itemInfo = (discrimination * discrimination * pMinusC * pMinusC) / (p * q * (1 - guessing) * (1 - guessing));
      information += itemInfo;
    });

    return information > 0 ? 1 / Math.sqrt(information) : 999;
  }

  /**
   * Calculate 95% confidence interval
   */
  calculateConfidenceInterval(ability: number, standardError: number): { lower: number; upper: number } {
    const z = 1.96; // 95% CI
    return {
      lower: ability - z * standardError,
      upper: ability + z * standardError
    };
  }

  /**
   * Calculate passing probability
   * Probability that true ability is above passing standard
   */
  calculatePassingProbability(ability: number, standardError: number): number {
    // Z-score for ability relative to passing threshold
    const z = (ability - this.PASSING_THRESHOLD) / standardError;

    // Convert to probability using standard normal distribution
    return this.normalCDF(z);
  }

  /**
   * Standard normal cumulative distribution function
   */
  private normalCDF(z: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    const probability = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));

    return z > 0 ? 1 - probability : probability;
  }

  /**
   * Determine if test should stop
   */
  shouldStopTest(
    questionCount: number,
    standardError: number,
    passingProbability: number
  ): boolean {
    // Minimum questions
    if (questionCount < this.MIN_QUESTIONS) {
      return false;
    }

    // Maximum questions
    if (questionCount >= this.MAX_QUESTIONS) {
      return true;
    }

    // 95% CI rule: Stop if we're 95% confident about pass/fail
    if (standardError <= this.STOPPING_CRITERION) {
      if (passingProbability >= 0.95 || passingProbability <= 0.05) {
        return true;
      }
    }

    return false;
  }

  /**
   * Select next question using Maximum Information criterion
   */
  selectNextQuestion(
    ability: number,
    availableQuestions: Array<{ id: string; params: IRTParameters }>
  ): string {
    let maxInformation = 0;
    let selectedQuestionId = availableQuestions[0].id;

    availableQuestions.forEach(({ id, params }) => {
      const p = this.calculateProbability(ability, params);
      const q = 1 - p;
      const { discrimination, guessing } = params;

      const pMinusC = p - guessing;
      const information = (discrimination * discrimination * pMinusC * pMinusC) / (p * q * (1 - guessing) * (1 - guessing));

      if (information > maxInformation) {
        maxInformation = information;
        selectedQuestionId = id;
      }
    });

    return selectedQuestionId;
  }

  /**
   * Determine pass/fail result
   */
  determineResult(ability: number, passingProbability: number): 'pass' | 'fail' | 'continue' {
    if (passingProbability >= 0.95) {
      return 'pass';
    } else if (passingProbability <= 0.05) {
      return 'fail';
    } else {
      return 'continue';
    }
  }
}

export default new CATService();
