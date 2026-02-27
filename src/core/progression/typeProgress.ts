import { OHPKM } from '@openhome-core/pkm/OHPKM'
import { PkmType } from '@pkm-rs/pkg'

export type TypeProgress = Record<string, number>

function inc(map: TypeProgress, key: string) {
  map[key] = (map[key] ?? 0) + 1
}

function normalize(t: string) {
  return t.trim().toLowerCase()
}

function typeIndexToName(idx: unknown): string | undefined {
  if (typeof idx !== 'number') return undefined
  const name = (PkmType as any)[idx]
  if (typeof name !== 'string') return undefined
  return normalize(name)
}

export function getMonTypes(mon: OHPKM): string[] {
  const anyMon = mon as any

  const meta = anyMon.formeMetadata ?? anyMon.forme_metadata ?? anyMon.formeMeta

  if (meta) {
    const t1 = typeIndexToName(meta.type1Index)
    const t2 = typeIndexToName(meta.type2Index)

    if (t1 && t2 && t1 !== t2) return [t1, t2]
    if (t1) return [t1]
  }

  return []
}

export function computeTypeProgress(stored: OHPKM[]): TypeProgress {
  const progress: TypeProgress = {}

  for (const mon of stored) {
    const types = getMonTypes(mon)
    for (const t of types) {
      if (t) inc(progress, t)
    }
  }

  return progress
}