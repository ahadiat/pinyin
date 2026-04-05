// src/lib/deckService.ts
import { supabase } from "./supabase";

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getDecks(userId: string) {
  return supabase
    .from("decks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

export async function createDeckRecord(
  userId: string,
  name: string,
  gsheetId: string
) {
  const result = await supabase.from("decks").insert({
    user_id: userId,
    name,
    gsheet_id: gsheetId,
    type: "word",
  });

  console.log("CREATE DECK RESULT", result);

  return result;
}

export async function renameDeck(deckId: string, newName: string) {
  return supabase
    .from("decks")
    .update({ name: newName })
    .eq("id", deckId);
}


export async function getDeckById(deckId: string) {
  return supabase
    .from("decks")
    .select("*")
    .eq("id", deckId)
    .single();
}

export async function getDecksByType(userId: string, type: string) {
  return supabase
    .from("decks")
    .select("*")
    .eq("user_id", userId)
    .eq("type", type)
    .order("created_at", { ascending: false });
}



export async function testSupabase() {
    const { data, error } = await supabase
      .from("decks")
      .select("*")
      .limit(1);
  
    console.log("SUPABASE TEST", data, error);
  }