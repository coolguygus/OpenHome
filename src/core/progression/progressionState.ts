export type ProgressionUnlocks = {
  pokedex: {
    missingOnly: boolean
    caughtOnly: boolean
    regionFilter: boolean
  }
  vault: {
    bulkTrash: boolean
  }
}

export type ProgressionCounters = {
  duplicatesTransferred: number
}

export type ProgressionState = {
  claimedMilestones: string[]
  unlocks: ProgressionUnlocks
  counters: ProgressionCounters
}

export const defaultProgressionState: ProgressionState = {
  claimedMilestones: [],
  unlocks: {
    pokedex: {
      missingOnly: false,
      caughtOnly: false,
      regionFilter: false,
    },
    vault: {
      bulkTrash: false,
    },
  },
  counters: {
    duplicatesTransferred: 0,
  },
}

export function isClaimed(state: ProgressionState, milestoneId: string) {
  return state.claimedMilestones.includes(milestoneId)
}

export function claimMilestone(
  state: ProgressionState,
  milestoneId: string
): ProgressionState {
  if (isClaimed(state, milestoneId)) return state

  return {
    ...state,
    claimedMilestones: [...state.claimedMilestones, milestoneId],
  }
}