import type { Reward } from './milestones'


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

export function applyReward(state: ProgressionState, reward: Reward): ProgressionState {
  if (!reward) return state

  if (reward.kind !== 'unlock') return state

  const area = reward.value?.area
  const key = reward.value?.key
  if (!area || !key) return state

  if (area === 'pokedex') {
    if (!(key in state.unlocks.pokedex)) return state
    return {
      ...state,
      unlocks: {
        ...state.unlocks,
        pokedex: {
          ...state.unlocks.pokedex,
          [key]: true,
        } as any,
      },
    }
  }

  if (area === 'vault') {
    if (!(key in state.unlocks.vault)) return state
    return {
      ...state,
      unlocks: {
        ...state.unlocks,
        vault: {
          ...state.unlocks.vault,
          [key]: true,
        } as any,
      },
    }
  }

  return state
}

export function addDuplicatesTransferred(state: ProgressionState, amount: number): ProgressionState {
  if (!Number.isFinite(amount) || amount <= 0) return state
  return {
    ...state,
    counters: {
      ...state.counters,
      duplicatesTransferred: (state.counters.duplicatesTransferred ?? 0) + Math.floor(amount),
    },
  }
}