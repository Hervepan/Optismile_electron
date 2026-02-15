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

export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from("Category")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data || [];
};

export const saveCategory = async (name: string, targetTime: number | null) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
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

export const saveSession = async (
  duration: number,
  categoryId: string,
  comment?: string,
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
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
    .select(
      `
        *,
        Category (
            name,
            target_time
        )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

export const deleteSession = async (id: string) => {
  const { error } = await supabase.from("Sessions").delete().eq("id", id);
  if (error) throw error;
};
