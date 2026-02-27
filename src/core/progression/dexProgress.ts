import { dexRegions, nationalDex } from '@openhome-ui/pages/pokedex/regionDex'

export type RegionProgress = {
  id: string
  name: string
  caught: number
  seen: number
  total: number
  caughtPct: number
}

export type DexProgress = {
  nationalCaught: number
  nationalSeen: number
  nationalTotal: number
  nationalCaughtPct: number
  regions: RegionProgress[]
}

function countInRange(set: Set<number>, start: number, end: number) {
  let count = 0
  for (let i = start; i <= end; i++) {
    if (set.has(i)) count++
  }
  return count
}

export function computeDexProgress(
  caughtDexNums: Set<number>,
  seenDexNums: Set<number>
): DexProgress {
  const nationalCaught = countInRange(
    caughtDexNums,
    nationalDex.startDexNum,
    nationalDex.endDexNum
  )

  const nationalSeen = countInRange(
    seenDexNums,
    nationalDex.startDexNum,
    nationalDex.endDexNum
  )

  const nationalTotal =
    nationalDex.endDexNum - nationalDex.startDexNum + 1

  const regions: RegionProgress[] = dexRegions.map((r) => {
    const caught = countInRange(
      caughtDexNums,
      r.startDexNum,
      r.endDexNum
    )

    const seen = countInRange(
      seenDexNums,
      r.startDexNum,
      r.endDexNum
    )

    const total = r.endDexNum - r.startDexNum + 1

    return {
      id: r.id,
      name: r.name,
      caught,
      seen,
      total,
      caughtPct: total === 0 ? 0 : Math.round((caught / total) * 100),
    }
  })

  return {
    nationalCaught,
    nationalSeen,
    nationalTotal,
    nationalCaughtPct:
      nationalTotal === 0
        ? 0
        : Math.round((nationalCaught / nationalTotal) * 100),
    regions,
  }
}