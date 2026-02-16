import { supabase } from "./client";

export interface Category {
  id: string;
  name: string;
  target_time: number | null;
  user_id: string;
  created_at: string;
}

export interface Session {
  id: string;
  duration: number;
  category_id: string;
  user_id: string;
  comment: string | null;
  created_at: string;
  Category?: {
    name: string;
    target_time: number | null;
  };
}

// --- Time Utilities (Ported from extension) ---

export function parseHumanToSeconds(input: string): number | null {
    const trimmed = input.toLowerCase().trim();
    if (!trimmed) return null;

    // Match patterns like "25m", "1h", "90s", "1h 30m"
    const hourMatch = trimmed.match(/(\d+)\s*h/);
    const minMatch = trimmed.match(/(\d+)\s*m/);
    const secMatch = trimmed.match(/(\d+)\s*s/);

    let totalSeconds = 0;
    if (hourMatch) totalSeconds += parseInt(hourMatch[1]) * 3600;
    if (minMatch) totalSeconds += parseInt(minMatch[1]) * 60;
    if (secMatch) totalSeconds += parseInt(secMatch[1]);

    // Fallback: If it's just a number, assume minutes
    if (totalSeconds === 0 && /^\d+$/.test(trimmed)) {
        return parseInt(trimmed) * 60;
    }

    return totalSeconds > 0 ? totalSeconds : null;
}

export function formatSecondsToHuman(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    return parts.join(" ");
}

// --- Database Operations ---

export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from("Category")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data || [];
};

export const saveCategory = async (name: string, targetTime: number | null) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("Category")
    .insert({
      name,
      target_time: targetTime,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateCategory = async (id: string, name: string, targetTime: number | null) => {
  const { data, error } = await supabase
    .from("Category")
    .update({ name, target_time: targetTime })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteCategory = async (id: string) => {
  const { error } = await supabase.from("Category").delete().eq("id", id);
  if (error) throw error;
};

export const saveSession = async (
  duration: number,
  categoryId: string,
  comment?: string,
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("Sessions")
    .insert({
      duration,
      category_id: categoryId,
      user_id: user.id,
      comment: comment || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getSessions = async (): Promise<Session[]> => {
  const { data, error } = await supabase
    .from("Sessions")
    .select(`
        *,
        Category (
            name,
            target_time
        )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};
