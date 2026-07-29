import { supabase } from "./supabaseClient";

/**
 * Everything the roster app needs to persist (team members, conditions,
 * monthly overrides, the adhoc/audit log) is stored as JSON blobs in a
 * single `kv_store` table: { key text primary key, value jsonb, updated_at }.
 *
 * This keeps the backend dead simple (one table, no migrations as the app
 * evolves) while still giving every team member a shared, synced view of
 * the roster from any device/browser.
 *
 * If Supabase isn't configured (no .env values), all functions silently
 * no-op / return null so the app keeps working with local-only state.
 */

const TEAM_MEMBERS_KEY = "team_members";
const CONDITIONS_KEY = "conditions";
const monthKey = (year, month, suffix) => `${suffix}_${year}_${String(month).padStart(2, "0")}`;

export const isBackendConfigured = () => !!supabase;

async function kvGet(key) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("kv_store")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error) {
    console.error(`[store] failed to load "${key}"`, error);
    return null;
  }
  return data ? data.value : null;
}

async function kvSet(key, value) {
  if (!supabase) return;
  const { error } = await supabase
    .from("kv_store")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) console.error(`[store] failed to save "${key}"`, error);
}

// ---- Team members ----
export const loadTeamMembers = () => kvGet(TEAM_MEMBERS_KEY);
export const saveTeamMembers = (members) => kvSet(TEAM_MEMBERS_KEY, members);

// ---- Conditions (scheduling rules) ----
export const loadConditions = () => kvGet(CONDITIONS_KEY);
export const saveConditions = (conditions) => kvSet(CONDITIONS_KEY, conditions);

// ---- Per-month manual overrides + adhoc log ----
export async function loadMonthData(year, month) {
  const [overrides, adhocList] = await Promise.all([
    kvGet(monthKey(year, month, "overrides")),
    kvGet(monthKey(year, month, "adhoc")),
  ]);
  return {
    overrides: overrides || {},
    adhocList: adhocList || [],
  };
}

export const saveMonthOverrides = (year, month, overrides) =>
  kvSet(monthKey(year, month, "overrides"), overrides);

export const saveMonthAdhocList = (year, month, adhocList) =>
  kvSet(monthKey(year, month, "adhoc"), adhocList);

// ---- Full generated roster schedule persistence ----
// Stored in a dedicated table so finalized monthly rosters are not only regenerated in memory.
// Required table: roster_months(year int, month int, roster jsonb, source text, updated_by text, updated_at timestamptz).
export async function loadRosterMonth(year, month) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("roster_months")
    .select("roster, source, updated_by, updated_at")
    .eq("year", year)
    .eq("month", month)
    .maybeSingle();

  if (error) {
    console.error(`[store] failed to load roster_months ${year}-${month}`, error);
    return null;
  }

  return data?.roster || null;
}

export async function saveRosterMonth(year, month, roster, source = "generated", updatedBy = null) {
  if (!supabase) return;

  const { error } = await supabase
    .from("roster_months")
    .upsert({
      year,
      month,
      roster: roster || {},
      source,
      updated_by: updatedBy,
      updated_at: new Date().toISOString(),
    }, { onConflict: "year,month" });

  if (error) {
    console.error(`[store] failed to save roster_months ${year}-${month}`, error);
    throw error;
  }
}

export async function deleteRosterMonth(year, month) {
  if (!supabase) return;

  const { error } = await supabase
    .from("roster_months")
    .delete()
    .eq("year", year)
    .eq("month", month);

  if (error) {
    console.error(`[store] failed to delete roster_months ${year}-${month}`, error);
    throw error;
  }
}

// ---- Audit log of PIN changes / logins (optional, append-only) ----
export async function logAuditEvent(event) {
  if (!supabase) return;
  const { error } = await supabase.from("audit_log").insert({
    event_type: event.type,
    member_name: event.memberName || null,
    detail: event.detail || null,
  });
  if (error) console.error("[store] failed to write audit_log", error);
}
