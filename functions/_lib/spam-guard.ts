// ═══════════════════════════════════════════════════════════════
// Anti-Spam Guard — Rate limiting & spam detection for GWET AAG
// ═══════════════════════════════════════════════════════════════

import { DAILY_EDGE_LIMIT } from './scoring';

/**
 * Check if a user is allowed to create more edges today.
 * Auto-resets the counter if it's a new day.
 * 
 * @returns {allowed: boolean, remaining: number}
 */
export async function checkAndIncrementEdgeCount(
  db: D1Database,
  userId: string
): Promise<{ allowed: boolean; remaining: number }> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Get current user's edge count and last reset date
  const user = await db.prepare(
    'SELECT daily_edge_count, last_edge_reset FROM profiles WHERE id = ?'
  ).bind(userId).first() as any;

  if (!user) return { allowed: false, remaining: 0 };

  let currentCount = user.daily_edge_count || 0;

  // Reset if new day
  if (user.last_edge_reset !== today) {
    await db.prepare(
      'UPDATE profiles SET daily_edge_count = 0, last_edge_reset = ? WHERE id = ?'
    ).bind(today, userId).run();
    currentCount = 0;
  }

  // Check limit
  if (currentCount >= DAILY_EDGE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  // Increment 
  await db.prepare(
    'UPDATE profiles SET daily_edge_count = daily_edge_count + 1 WHERE id = ?'
  ).bind(userId).run();

  return { allowed: true, remaining: DAILY_EDGE_LIMIT - currentCount - 1 };
}

/**
 * Check if an entity has a highly negative score (spam/reported content).
 * Returns true if the entity should be hidden from feeds.
 */
export async function isSpamEntity(
  db: D1Database,
  entityId: string
): Promise<boolean> {
  const result = await db.prepare(
    'SELECT COALESCE(SUM(weight), 0) as total_score FROM edges WHERE to_entity = ?'
  ).bind(entityId).first() as any;

  return (result?.total_score ?? 0) < -10;
}

/**
 * Check if a new account's influence is below the threshold
 * for reduced visibility in feeds.
 */
export function isLowInfluenceAccount(influenceScore: number): boolean {
  return influenceScore < 5;
}
