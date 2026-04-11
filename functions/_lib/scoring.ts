// ═══════════════════════════════════════════════════════════════
// AAG Scoring Engine — Core algorithm for GWET
// Score = Σ (weight × influence × freshness)
// ═══════════════════════════════════════════════════════════════

/** Default edge weights by type */
export const EDGE_WEIGHTS: Record<string, number> = {
  create:     1.0,
  like:       1.0,
  reply:      2.0,
  share:      3.0,
  view:       0.1,
  follow:     2.0,
  unfollow:  -2.0,
  join:       1.5,
  leave:     -1.5,
  send:       0.5,
  report:    -5.0,
  block:    -10.0,
  mention:    1.5,
  clip_watch: 2.0,
};

/** Decay constant (λ) — controls how fast old content loses relevance */
const DECAY_LAMBDA = 0.05;

/** Daily edge limit per user (anti-spam) */
export const DAILY_EDGE_LIMIT = 200;

/**
 * Calculate freshness multiplier using exponential decay.
 * freshness = e^(-λ × hours_elapsed)
 * 
 * Examples:
 *   0 hours  → 1.0 (brand new)
 *   6 hours  → 0.74
 *   24 hours → 0.30
 *   48 hours → 0.09
 *   72 hours → 0.027
 */
export function calculateFreshness(createdAt: string): number {
  const createdTime = new Date(createdAt + 'Z').getTime();
  const now = Date.now();
  const hoursElapsed = (now - createdTime) / (1000 * 60 * 60);
  return Math.exp(-DECAY_LAMBDA * Math.max(0, hoursElapsed));
}

/**
 * Calculate the AAG score for an entity based on its edges.
 * Score = Σ (edge.weight × freshness(edge.created_at) × ownerInfluence)
 * 
 * @param edges - Array of edge records related to this entity
 * @param ownerInfluence - The influence_score of the entity's owner (0-∞)
 * @returns Computed score (higher = more relevant)
 */
export function calculateEntityScore(
  edges: Array<{ weight: number; created_at: string }>,
  ownerInfluence: number = 0
): number {
  // Normalize influence: minimum multiplier of 1.0 so new users aren't invisible
  const influenceMultiplier = 1.0 + (ownerInfluence / 100);

  let score = 0;
  for (const edge of edges) {
    const freshness = calculateFreshness(edge.created_at);
    score += edge.weight * freshness * influenceMultiplier;
  }
  return score;
}

/**
 * Get the default weight for an edge type.
 * Falls back to 1.0 for unknown types.
 */
export function getEdgeWeight(type: string): number {
  return EDGE_WEIGHTS[type] ?? 1.0;
}

/**
 * Calculate influence score for a user based on all incoming edges
 * to their content. influence = sum of (weight × freshness) for all
 * edges pointing to entities owned by this user.
 */
export function calculateInfluenceFromEdges(
  edges: Array<{ weight: number; created_at: string }>
): number {
  let influence = 0;
  for (const edge of edges) {
    const freshness = calculateFreshness(edge.created_at);
    influence += edge.weight * freshness;
  }
  return Math.max(0, Math.round(influence * 100) / 100);
}
