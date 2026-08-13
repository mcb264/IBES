import { DomainState, TaskItem } from "@/lib/storage";

/**
 * Compatibility boundary for IBES actions.
 *
 * Historical versions stored project actions under `briefing.tasks`.
 * The UI and planning engine should use these helpers instead of depending on
 * that legacy storage shape. This lets us migrate persistence later without
 * touching every feature again.
 */
export function actionsOf(state: DomainState): TaskItem[] {
  return state.briefing.tasks ?? [];
}

export function replaceActions(state: DomainState, actions: TaskItem[]): DomainState {
  return {
    ...state,
    briefing: {
      ...state.briefing,
      tasks: actions,
    },
  };
}

export function updateActions(state: DomainState, updater: (actions: TaskItem[]) => TaskItem[]): DomainState {
  return replaceActions(state, updater(actionsOf(state)));
}
