/**
 * API for journal_entry_answers table.
 * 
 * Architecture Notes:
 * - Domain: Core data (answers to journal questions)
 * - RLS: Users can only access answers for their own entries
 * - Relationships: Many-to-one with entries, many-to-one with questions
 * - Operations: CRUD-heavy, often bulk operations (save all answers for an entry)
 */

import { getSupabaseClient } from "../services/supabaseClient";
import type {
  JournalEntryAnswer,
  JournalEntryAnswerInsert,
  JournalEntryAnswerUpdate,
} from "./types";
import { handleSupabaseError, NotFoundError } from "./errors";

/**
 * Get all answers for a specific journal entry.
 * 
 * Architecture Note: RLS ensures user can only access answers for their own entries.
 */
export async function getAnswersByEntryId(
  entryId: string
): Promise<JournalEntryAnswer[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("journal_entry_answers")
    .select("*")
    .eq("entry_id", entryId)
    .order("created_at", { ascending: true });

  if (error) {
    throw handleSupabaseError(error);
  }

  return data || [];
}

/**
 * Get answers with their questions (for display).
 * 
 * Architecture Note: Join query to avoid N+1 when displaying answer lists.
 */
export async function getAnswersWithQuestions(
  entryId: string
): Promise<Array<JournalEntryAnswer & { question: { prompt: string; help_text: string | null } }>> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("journal_entry_answers")
    .select(
      `
      *,
      journal_questions:question_id (
        prompt,
        help_text
      )
    `
    )
    .eq("entry_id", entryId)
    .order("created_at", { ascending: true });

  if (error) {
    throw handleSupabaseError(error);
  }

  return (
    data?.map((answer: any) => ({
      ...answer,
      question:
        answer.journal_questions && Array.isArray(answer.journal_questions)
          ? answer.journal_questions[0]
          : null,
    })) || []
  );
}

/**
 * Get a single answer by ID.
 */
export async function getAnswerById(id: string): Promise<JournalEntryAnswer> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("journal_entry_answers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw handleSupabaseError(error);
  }

  if (!data) {
    throw new NotFoundError("JournalEntryAnswer", id);
  }

  return data;
}

/**
 * Create a single answer.
 * 
 * Architecture Note: RLS ensures entry belongs to current user.
 */
export async function createAnswer(
  input: JournalEntryAnswerInsert
): Promise<JournalEntryAnswer> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("journal_entry_answers")
    .insert(input)
    .select()
    .single();

  if (error) {
    throw handleSupabaseError(error);
  }

  if (!data) {
    throw new Error("Failed to create answer");
  }

  return data;
}

/**
 * Bulk create answers (common pattern: save all answers for an entry at once).
 * 
 * Architecture Note: Single insert array for transaction-like behavior.
 */
export async function createAnswers(
  inputs: JournalEntryAnswerInsert[]
): Promise<JournalEntryAnswer[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("journal_entry_answers")
    .insert(inputs)
    .select();

  if (error) {
    throw handleSupabaseError(error);
  }

  return data || [];
}

/**
 * Update an existing answer.
 */
export async function updateAnswer(
  id: string,
  input: JournalEntryAnswerUpdate
): Promise<JournalEntryAnswer> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("journal_entry_answers")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw handleSupabaseError(error);
  }

  if (!data) {
    throw new NotFoundError("JournalEntryAnswer", id);
  }

  return data;
}

/**
 * Delete an answer.
 */
export async function deleteAnswer(id: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from("journal_entry_answers")
    .delete()
    .eq("id", id);

  if (error) {
    throw handleSupabaseError(error);
  }
}

/**
 * Delete all answers for an entry (useful when resetting entry).
 * 
 * Architecture Note: RLS ensures user can only delete answers for their own entries.
 */
export async function deleteAnswersByEntryId(entryId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from("journal_entry_answers")
    .delete()
    .eq("entry_id", entryId);

  if (error) {
    throw handleSupabaseError(error);
  }
}

/**
 * Upsert answer (create or update if exists).
 * Useful for "save answer" flows where question_id + entry_id is unique.
 * 
 * Architecture Note: Requires unique constraint on (entry_id, question_id) if not exists.
 */
export async function upsertAnswer(
  input: JournalEntryAnswerInsert
): Promise<JournalEntryAnswer> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("journal_entry_answers")
    .upsert(input, {
      onConflict: "entry_id,question_id", // Assumes unique constraint
    })
    .select()
    .single();

  if (error) {
    throw handleSupabaseError(error);
  }

  if (!data) {
    throw new Error("Failed to upsert answer");
  }

  return data;
}
