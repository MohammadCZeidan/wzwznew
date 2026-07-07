import { supabase } from '../client';
import { assertUserTextAllowed, normalizePlainText } from '@/lib/inputSecurity';

export interface InviteWaitlistRequestInput {
  contact: string;
  note?: string;
  source?: string;
}

export async function submitInviteWaitlistRequest(input: InviteWaitlistRequestInput): Promise<void> {
  const contact = assertUserTextAllowed(normalizePlainText(input.contact)).trim();
  const note = input.note?.trim() ? assertUserTextAllowed(normalizePlainText(input.note)).trim() : "";
  const source = normalizePlainText(input.source ?? "signup_modal").trim() || "signup_modal";

  if (!contact) {
    throw new Error("Add Instagram, WhatsApp, email, or any contact we can use.");
  }

  const { error } = await supabase
    .from('invite_waitlist_requests')
    .insert({ contact, note, source });

  if (error) throw error;
}
