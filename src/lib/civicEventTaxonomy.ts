export type CivicOutcome = "activation" | "commitment" | "sharing" | "mobilization" | "return" | "diagnostic";

const OUTCOME_BY_EVENT: Readonly<Record<string, CivicOutcome>> = {
  state_agenda_selected: "activation",
  mission_selected: "activation",
  mission_selected_from_world: "activation",
  participation_path_selected: "commitment",
  mission_journey_completed: "commitment",
  world_journey_completed: "commitment",
  mission_card_saved: "sharing",
  mission_card_shared: "sharing",
  mission_card_share_fallback: "sharing",
  game_share_click: "sharing",
  mission_cta_clicked: "mobilization",
  mission_cta_clicked_from_world: "mobilization",
  mission_cta_clicked_from_world_hud: "mobilization",
  civic_journey_next_step_clicked: "mobilization",
  game_app_cta_click: "mobilization",
  participation_external_channel_opened: "mobilization",
  participation_internal_step_opened: "mobilization",
  external_channel_returned: "return",
  external_step_self_reported: "commitment",
  world_returned_to_landing: "return",
  civic_journey_opened: "return",
};

export function classifyCivicEvent(eventName: string): CivicOutcome {
  return OUTCOME_BY_EVENT[eventName] ?? "diagnostic";
}

export const CIVIC_OUTCOME_EVENT = "missao:civic-outcome";
