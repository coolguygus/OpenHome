import React, { useMemo, useState, useEffect, useContext } from 'react'
import { useOhpkmStore } from '@openhome-ui/state/ohpkm'
import { usePokedex } from '@openhome-ui/state/pokedex'
import { computeDexProgress } from '@openhome-core/progression/dexProgress'
import { milestones } from '@openhome-core/progression/milestones'
import {
  ProgressionState,
  defaultProgressionState,
  isClaimed,
  claimMilestone,
} from '@openhome-core/progression/progressionState'
import { BackendContext } from '@openhome-ui/backend/backendContext'
import useDisplayError from '@openhome-ui/hooks/displayError'
import * as E from 'fp-ts/lib/Either'
import { Tabs, Box } from '@radix-ui/themes'
import { computeTypeProgress } from '@openhome-core/progression/typeProgress'
import { applyReward } from '@openhome-core/progression/progressionState'

type ProfileData = {
  name: string
  title: string
}

const defaultProfile: ProfileData = {
  name: 'Local Trainer',
  title: 'Rookie Archivist',
}

export default function Profile() {
  const backend = useContext(BackendContext)
  const displayError = useDisplayError()

  const ohpkmStore = useOhpkmStore()
  const stored = ohpkmStore.getAllStored()

  const pokedexState = usePokedex()
  const byDexNumber = pokedexState.pokedex?.byDexNumber ?? {}

  const [profile, setProfile] = useState<ProfileData>(defaultProfile)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [saveState, setSaveState] = useState('')

  const [progression, setProgression] = useState<ProgressionState>(defaultProgressionState)
  const [progressionLoaded, setProgressionLoaded] = useState(false)
  const typeProgress = useMemo(() => {
  return computeTypeProgress(stored)
}, [stored])

  useEffect(() => {
  backend
    .getProgression()
    .then(
      E.match(
        async (err) => {
          const msg = String((err as any)?.message ?? err).toLowerCase()
          if (msg.includes('does not exist') || msg.includes('not found')) {
            setProgression(defaultProgressionState)
            setProgressionLoaded(true)
            return
          }
          displayError('Error loading progression', err)
        },
        async (data) => {
          const anyData = data as any

          const claimedMilestones = Array.isArray(anyData?.claimedMilestones)
            ? anyData.claimedMilestones.filter((x: any) => typeof x === 'string')
            : []

          const unlocks =
            anyData?.unlocks && typeof anyData.unlocks === 'object'
              ? {
                  ...defaultProgressionState.unlocks,
                  ...anyData.unlocks,
                  pokedex: {
                    ...defaultProgressionState.unlocks.pokedex,
                    ...(anyData.unlocks?.pokedex ?? {}),
                  },
                  vault: {
                    ...defaultProgressionState.unlocks.vault,
                    ...(anyData.unlocks?.vault ?? {}),
                  },
                }
              : defaultProgressionState.unlocks

          const counters =
            anyData?.counters && typeof anyData.counters === 'object'
              ? {
                  ...defaultProgressionState.counters,
                  ...anyData.counters,
                }
              : defaultProgressionState.counters

          setProgression({
            claimedMilestones,
            unlocks,
            counters,
          })

          setProgressionLoaded(true)
        }
      )
    )
    .catch((err) => displayError('Error loading progression', err))
}, [backend, displayError])
useEffect(() => {
  backend
    .getProfile()
    .then(
      E.match(
        (err) => {
          const msg = String((err as any)?.message ?? err).toLowerCase()
          if (msg.includes('does not exist') || msg.includes('not found')) {
            setProfile(defaultProfile)
            setProfileLoaded(true)
            return
          }
          displayError('Error loading profile', err)
        },
        (data) => {
          const anyData = data as any
          setProfile({
            name: typeof anyData?.name === 'string' ? anyData.name : defaultProfile.name,
            title: typeof anyData?.title === 'string' ? anyData.title : defaultProfile.title,
          })
          setProfileLoaded(true)
        }
      )
    )
    .catch((err) => displayError('Error loading profile', err))
}, [backend, displayError])

  const saveProfile = () => {
    if (!profileLoaded) return
    setSaveState('Saving')
    backend
      .updateProfile({ name: profile.name, title: profile.title } as any)
      .then(
        E.match(
          (err) => {
            setSaveState('')
            displayError('Error saving profile', err)
          },
          () => {
            setSaveState('Saved')
            setTimeout(() => setSaveState(''), 1500)
          }
        )
      )
      .catch((err) => {
        setSaveState('')
        displayError('Error saving profile', err)
      })
  }

  const handleClaim = (milestoneId: string) => {
  if (!progressionLoaded) return

  const milestone = milestones.find((m) => m.id === milestoneId)
  const claimed = claimMilestone(progression, milestoneId)
  const next = milestone ? applyReward(claimed, milestone.reward) : claimed

  setProgression(next)

  backend
    .updateProgression(next as any)
    .then(E.match((err) => displayError('Error saving progression', err), () => null))
    .catch((err) => displayError('Error saving progression', err))
}

  const vaultStats = useMemo(() => {
    const totalStored = stored.length
    const uniqueSpecies = new Set(stored.map((m) => m.dexNum)).size
    const shinyCount = stored.filter((m) => m.isShiny()).length
    return {
      totalStored,
      uniqueSpecies,
      shinyCount,
      lastDeposit: totalStored > 0 ? 'Recently updated' : 'None yet',
    }
  }, [stored])

  const caughtDexNums = useMemo(() => {
    return new Set<number>(
      Object.entries(byDexNumber)
        .filter(([, entry]) =>
          Object.values((entry as any).formes ?? {}).some((status) => String(status).endsWith('Caught'))
        )
        .map(([dexNum]) => Number(dexNum))
    )
  }, [byDexNumber])

  const seenDexNums = useMemo(() => {
    return new Set<number>(Object.keys(byDexNumber).map((dexNum) => Number(dexNum)))
  }, [byDexNumber])

  const dexProgress = useMemo(() => {
    return computeDexProgress(caughtDexNums, seenDexNums)
  }, [caughtDexNums, seenDexNums])

  const topRegions = useMemo(() => {
    return dexProgress.regions
      .slice()
      .sort((a, b) => b.caughtPct - a.caughtPct)
      .slice(0, 3)
  }, [dexProgress.regions])

  const mostCaught = useMemo(() => {
    if (stored.length === 0) return undefined

    const counts = new Map<number, number>()
    for (const mon of stored) {
      counts.set(mon.dexNum, (counts.get(mon.dexNum) ?? 0) + 1)
    }

    let bestDexNum = stored[0].dexNum
    let bestCount = 0

    for (const [dexNum, count] of counts.entries()) {
      if (count > bestCount) {
        bestDexNum = dexNum
        bestCount = count
      }
    }

    return { dexNum: bestDexNum, count: bestCount }
  }, [stored])

  const claimableMilestones = useMemo(() => {
    return milestones.filter((m) => {
      const unlocked = m.isUnlocked(dexProgress, {
        totalStored: vaultStats.totalStored,
        uniqueSpecies: vaultStats.uniqueSpecies,
        shinyCount: vaultStats.shinyCount,
      }, typeProgress, progression.counters)
      const claimed = isClaimed(progression, m.id)
      return unlocked && !claimed
    })
  }, [
  dexProgress,
  progression,
  progression.counters,
  typeProgress,
  vaultStats.totalStored,
  vaultStats.uniqueSpecies,
  vaultStats.shinyCount,
])

  const renderReward = (reward: any) => {
  if (!reward) return ''

  if (reward.kind === 'unlock') {
    const area = reward.value?.area ?? ''
    const key = reward.value?.key ?? ''
    return `unlock ${area} ${key}`
  }

  return `${reward.kind} ${reward.value ?? ''}`
}

  return (
    <div style={{ padding: 16, display: 'grid', gap: 16 }}>
      <h2>Trainer Profile</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <section style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)' }}>
          <h3>Trainer Card</h3>

          <div style={{ display: 'grid', gap: 8 }}>
            <div>
              Name:
              <input
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                style={{ marginLeft: 8 }}
              />
            </div>

            <div>
              Title:
              <input
                value={profile.title}
                onChange={(e) => setProfile((p) => ({ ...p, title: e.target.value }))}
                style={{ marginLeft: 8 }}
              />
            </div>

            <div>
              <button onClick={saveProfile} disabled={!profileLoaded}>
                Save
              </button>
              {saveState ? <span style={{ marginLeft: 8 }}>{saveState}</span> : null}
            </div>

            <div>Badges: 0</div>
          </div>
        </section>

        <section style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)' }}>
  <h3>Milestones</h3>

  <Tabs.Root defaultValue="claimable">
    <Tabs.List>
      <Tabs.Trigger value="claimable">Claimable</Tabs.Trigger>
      <Tabs.Trigger value="region">Region milestones</Tabs.Trigger>
      <Tabs.Trigger value="national">National milestones</Tabs.Trigger>
    </Tabs.List>

    <Box style={{ marginTop: 10 }}>
      <Tabs.Content value="claimable">
        <div style={{ display: 'grid', gap: 10 }}>
          {claimableMilestones.length === 0 ? (
            <div style={{ fontSize: 12 }}>No claimable milestones right now.</div>
          ) : (
            claimableMilestones.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'grid',
                  gap: 6,
                  padding: 10,
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <div>{m.title}</div>
                <div style={{ fontSize: 12 }}>{m.description}</div>
                <button onClick={() => handleClaim(m.id)} disabled={!progressionLoaded}>
  Claim
</button>
              </div>
            ))
          )}
        </div>
      </Tabs.Content>

      <Tabs.Content value="region">
        <div style={{ display: 'grid', gap: 10 }}>
          {milestones
            .filter((m) => m.category === 'region')
            .map((m) => {
              const unlocked = m.isUnlocked(dexProgress, {
                totalStored: vaultStats.totalStored,
                uniqueSpecies: vaultStats.uniqueSpecies,
                shinyCount: vaultStats.shinyCount,
              }, typeProgress, progression.counters)

              const claimed = isClaimed(progression, m.id)

              return (
                <div
                  key={m.id}
                  style={{
                    display: 'grid',
                    gap: 4,
                    padding: 10,
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.12)',
                    opacity: claimed ? 0.7 : unlocked ? 1 : 0.6,
                  }}
                >
                  <div>
                    {m.title} {claimed ? '(Claimed)' : unlocked ? '(Unlocked)' : '(Locked)'}
                  </div>
                  <div style={{ fontSize: 12 }}>{m.description}</div>
                  <div style={{ fontSize: 12 }}>
                  Reward: {renderReward(m.reward)}
                </div>
                </div>
              )
            })}
        </div>
      </Tabs.Content>

      <Tabs.Content value="national">
        <div style={{ display: 'grid', gap: 10 }}>
          {milestones
            .filter((m) => m.category === 'national')
            .map((m) => {
              const unlocked = m.isUnlocked(
  dexProgress,
  {
    totalStored: vaultStats.totalStored,
    uniqueSpecies: vaultStats.uniqueSpecies,
    shinyCount: vaultStats.shinyCount,
  },
  typeProgress, progression.counters
)

              const claimed = isClaimed(progression, m.id)

              return (
                <div
                  key={m.id}
                  style={{
                    display: 'grid',
                    gap: 4,
                    padding: 10,
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.12)',
                    opacity: claimed ? 0.7 : unlocked ? 1 : 0.6,
                  }}
                >
                  <div>
                    {m.title} {claimed ? '(Claimed)' : unlocked ? '(Unlocked)' : '(Locked)'}
                  </div>
                  <div style={{ fontSize: 12 }}>{m.description}</div>
                  <div style={{ fontSize: 12 }}>
  Reward: {renderReward(m.reward)}
</div>
                </div>
              )
            })}
        </div>
      </Tabs.Content>
    </Box>
  </Tabs.Root>
</section>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <section style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)' }}>
          <h3>Vault Stats</h3>
          <div>Total stored: {vaultStats.totalStored}</div>
          <div>Unique species: {vaultStats.uniqueSpecies}</div>
          <div>Shiny count: {vaultStats.shinyCount}</div>
          <div>Last deposit: {vaultStats.lastDeposit}</div>
        </section>

        <section style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)' }}>
          <h3>Highlights</h3>

          <div>National completion: {dexProgress.nationalCaughtPct}%</div>

          <div style={{ marginTop: 10 }}>
            Top regions:
            <div style={{ marginTop: 6, display: 'grid', gap: 4 }}>
              {topRegions.map((r) => (
                <div key={r.id}>
                  {r.name}: {r.caughtPct}% (Seen {r.seen} of {r.total})
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            Most stored species:
            {mostCaught ? (
              <div style={{ marginTop: 6 }}>
                Dex {mostCaught.dexNum} with {mostCaught.count} stored
              </div>
            ) : (
              <div style={{ marginTop: 6 }}>None yet</div>
            )}
          </div>
        </section>
      </div>

      <section style={{ padding: 12, borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)' }}>
        <h3>Dex Progress</h3>
        <div>
          National: {dexProgress.nationalCaught} of {dexProgress.nationalTotal} ({dexProgress.nationalCaughtPct}%)
        </div>
        <div style={{ marginTop: 8 }}>
          Seen: {dexProgress.nationalSeen} of {dexProgress.nationalTotal}
        </div>
      </section>
    </div>
  )
}