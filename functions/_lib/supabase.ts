import { createClient } from '@supabase/supabase-js';

export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  LIVEKIT_API_KEY: string;
  LIVEKIT_API_SECRET: string;
  GWET_MAIL_KEY: string;
}

export function getSupabaseAdmin(env: Env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Validates a Supabase JWT and returns the user object.
 * This is used for protected routes.
 */
export async function getSupabaseUser(request: Request, env: Env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) return null;
  return user;
}
