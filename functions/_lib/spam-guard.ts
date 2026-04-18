// ═══════════════════════════════════════════════════════════════
// Anti-Spam Guard — Rate limiting & spam detection for GWET AAG
// ═══════════════════════════════════════════════════════════════

import { DAILY_EDGE_LIMIT } from './scoring';

/**
 * Check if a user is allowed to create more edges today.
 * Auto-resets the counter if it's a new day.
 */
export async function checkAndIncrementEdgeCount(
  sb: any,
  userId: string
): Promise<{ allowed: boolean; remaining: number }> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const { data: user } = await sb.from('profiles')
    .select('daily_edge_count, last_edge_reset')
    .eq('id', userId)
    .single();

  if (!user) return { allowed: false, remaining: 0 };

  let currentCount = user.daily_edge_count || 0;

  if (user.last_edge_reset !== today) {
    await sb.from('profiles')
      .update({ daily_edge_count: 0, last_edge_reset: today })
      .eq('id', userId);
    currentCount = 0;
  }

  if (currentCount >= DAILY_EDGE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  await sb.from('profiles')
    .update({ daily_edge_count: currentCount + 1 })
    .eq('id', userId);

  return { allowed: true, remaining: DAILY_EDGE_LIMIT - currentCount - 1 };
}

/**
 * Check if an entity has a highly negative score (spam/reported content).
 */
export async function isSpamEntity(
  sb: any,
  entityId: string
): Promise<boolean> {
  const { data: result } = await sb.from('edges')
    .select('weight')
    .eq('to_entity', entityId);

  const totalScore = (result || []).reduce((acc: number, e: any) => acc + (e.weight || 0), 0);
  return totalScore < -10;
}

export function isLowInfluenceAccount(influenceScore: number): boolean {
  return influenceScore < 5;
}
