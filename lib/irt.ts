/**
 * Item Response Theory (IRT) Engine for CAT Testing
 * Implements 3-Parameter Logistic (3PL) model
 */

// 3PL probability: P(θ) = c + (1-c) / (1 + exp(-a(θ-b)))
export function probability3PL(
  theta: number,    // ability estimate
  a: number,        // discrimination
  b: number,        // difficulty
  c: number = 0     // guessing parameter
): number {
  return c + (1 - c) / (1 + Math.exp(-a * (theta - b)));
}

// Fisher information for 3PL
export function fisherInformation(
  theta: number,
  a: number,
  b: number,
  c: number = 0
): number {
  const p = probability3PL(theta, a, b, c);
  const q = 1 - p;
  if (p <= c || q <= 0) return 0;
  const numerator = a * a * Math.pow(p - c, 2) * q;
  const denominator = Math.pow(1 - c, 2) * p;
  return denominator > 0 ? numerator / denominator : 0;
}

// Maximum Likelihood Estimation (MLE) of ability using Newton-Raphson
export function estimateAbilityMLE(
  responses: { a: number; b: number; c: number; correct: boolean }[],
  priorTheta: number = 0,
  maxIterations: number = 30,
  tolerance: number = 0.001
): number {
  if (responses.length === 0) return priorTheta;

  // Check for all-correct or all-incorrect (MLE doesn't converge)
  const allCorrect = responses.every(r => r.correct);
  const allIncorrect = responses.every(r => !r.correct);
  if (allCorrect) return Math.min(priorTheta + 1.5, 4);
  if (allIncorrect) return Math.max(priorTheta - 1.5, -4);

  let theta = priorTheta;

  for (let i = 0; i < maxIterations; i++) {
    let numerator = 0;
    let denominator = 0;

    for (const r of responses) {
      const p = probability3PL(theta, r.a, r.b, r.c);
      const q = 1 - p;
      const u = r.correct ? 1 : 0;
      const w = r.a * (p - r.c) / ((1 - r.c) * p);

      numerator += w * (u - p);
      denominator += w * w * p * q;
    }

    if (Math.abs(denominator) < 1e-10) break;

    const delta = numerator / denominator;
    theta += delta;
    theta = Math.max(-4, Math.min(4, theta)); // bound theta

    if (Math.abs(delta) < tolerance) break;
  }

  return theta;
}

// Expected A Posteriori (EAP) estimation with normal prior
export function estimateAbilityEAP(
  responses: { a: number; b: number; c: number; correct: boolean }[],
  priorMean: number = 0,
  priorSD: number = 1,
  numPoints: number = 41
): number {
  if (responses.length === 0) return priorMean;

  const lower = -4;
  const upper = 4;
  const step = (upper - lower) / (numPoints - 1);

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < numPoints; i++) {
    const theta = lower + i * step;

    // Likelihood
    let logLikelihood = 0;
    for (const r of responses) {
      const p = probability3PL(theta, r.a, r.b, r.c);
      logLikelihood += r.correct ? Math.log(p) : Math.log(1 - p);
    }

    // Prior (normal)
    const logPrior = -0.5 * Math.pow((theta - priorMean) / priorSD, 2);
    const posterior = Math.exp(logLikelihood + logPrior);

    numerator += theta * posterior;
    denominator += posterior;
  }

  return denominator > 0 ? numerator / denominator : priorMean;
}

// Standard error of ability estimate
export function standardError(
  theta: number,
  responses: { a: number; b: number; c: number }[]
): number {
  let info = 0;
  for (const r of responses) {
    info += fisherInformation(theta, r.a, r.b, r.c);
  }
  return info > 0 ? 1 / Math.sqrt(info) : 1;
}

// Select next question using Maximum Fisher Information
export function selectNextQuestion(
  theta: number,
  availableQuestions: {
    id: string;
    a: number;
    b: number;
    c: number;
    categoryId: number;
  }[],
  answeredIds: Set<string>,
  categoryPerformance?: Record<number, { correct: number; total: number }>,
  contentBalancing: boolean = true
): string | null {
  const candidates = availableQuestions.filter(q => !answeredIds.has(q.id));
  if (candidates.length === 0) return null;

  // Calculate information for each question
  const scored = candidates.map(q => ({
    id: q.id,
    categoryId: q.categoryId,
    information: fisherInformation(theta, q.a, q.b, q.c),
  }));

  if (contentBalancing && categoryPerformance) {
    // Prioritize under-represented categories
    const totalAnswered = Object.values(categoryPerformance).reduce(
      (sum, cp) => sum + cp.total, 0
    );
    if (totalAnswered > 0) {
      const categoryCount: Record<number, number> = {};
      for (const cp of Object.entries(categoryPerformance)) {
        categoryCount[Number(cp[0])] = cp[1].total;
      }

      for (const s of scored) {
        const catCount = categoryCount[s.categoryId] || 0;
        const catRatio = catCount / totalAnswered;
        // Boost information for under-represented categories
        const boost = Math.max(0.5, 1.5 - catRatio * 2);
        s.information *= boost;
      }
    }
  }

  // Sort by information (descending) and pick from top 5 randomly for exposure control
  scored.sort((a, b) => b.information - a.information);
  const topN = scored.slice(0, Math.min(5, scored.length));
  const pick = topN[Math.floor(Math.random() * topN.length)];
  return pick.id;
}

// CAT stopping rules
export interface CATStopResult {
  shouldStop: boolean;
  reason: string;
  result: 'pass' | 'fail' | 'undetermined';
}

export function checkStoppingRules(
  theta: number,
  se: number,
  questionsAnswered: number,
  minQuestions: number,
  maxQuestions: number,
  timeLimitSeconds: number,
  timeSpentSeconds: number,
  passingTheta: number = 0 // NCLEX passing standard
): CATStopResult {
  // Rule 1: Maximum questions reached
  if (questionsAnswered >= maxQuestions) {
    return {
      shouldStop: true,
      reason: 'maximum_questions',
      result: theta >= passingTheta ? 'pass' : 'fail',
    };
  }

  // Rule 2: Time limit reached
  if (timeSpentSeconds >= timeLimitSeconds) {
    return {
      shouldStop: true,
      reason: 'time_limit',
      result: theta >= passingTheta ? 'pass' : 'fail',
    };
  }

  // Rule 3: Minimum questions not met
  if (questionsAnswered < minQuestions) {
    return { shouldStop: false, reason: '', result: 'undetermined' };
  }

  // Rule 4: 95% confidence interval doesn't include passing standard
  const ci95Lower = theta - 1.96 * se;
  const ci95Upper = theta + 1.96 * se;

  if (ci95Lower > passingTheta) {
    return { shouldStop: true, reason: 'confidence_pass', result: 'pass' };
  }

  if (ci95Upper < passingTheta) {
    return { shouldStop: true, reason: 'confidence_fail', result: 'fail' };
  }

  // Rule 5: SE below threshold (high precision)
  if (se < 0.30) {
    return {
      shouldStop: true,
      reason: 'precision_reached',
      result: theta >= passingTheta ? 'pass' : 'fail',
    };
  }

  return { shouldStop: false, reason: '', result: 'undetermined' };
}

// Calculate passing probability
export function passingProbability(
  theta: number,
  se: number,
  passingTheta: number = 0
): number {
  // P(pass) = P(true ability > passingTheta) = 1 - Φ((passingTheta - theta) / se)
  const z = (passingTheta - theta) / se;
  return 1 - normalCDF(z);
}

// Standard normal CDF approximation
function normalCDF(z: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = z < 0 ? -1 : 1;
  z = Math.abs(z) / Math.sqrt(2);

  const t = 1 / (1 + p * z);
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);

  return 0.5 * (1 + sign * y);
}
