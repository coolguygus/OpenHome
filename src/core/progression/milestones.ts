import { DexProgress } from './dexProgress'
import { ProgressionCounters, ProgressionUnlocks } from './progressionState'

export type VaultStats = {
  totalStored: number
  uniqueSpecies: number
  shinyCount: number
}

export type Reward =
  | { kind: 'badge'; value: string }
  | { kind: 'title'; value: string }
  | { kind: 'pokemon'; value: string }
  | { kind: 'unlock'; value: { area: 'pokedex' | 'vault'; key: string } }

export type MilestoneCategory = 'region' | 'national' | 'vault' | 'type'

export type Milestone = {
  id: string
  category: MilestoneCategory
  title: string
  description: string
  isUnlocked: (
    dex: DexProgress,
    vault: VaultStats,
    types: Record<string, number>,
    counters: ProgressionCounters
  ) => boolean
  reward: Reward
}

function typeCount(types: Record<string, number>, typeName: string) {
  return types[typeName] ?? 0
}

function makeTypeMilestone(
  typeName: string,
  threshold: number,
  rewardPokemon: string
): Milestone {
  const id = `type_${typeName}_${threshold}`
  const prettyType = typeName.charAt(0).toUpperCase() + typeName.slice(1)

  return {
    id,
    category: 'type',
    title: `${prettyType} Mastery ${threshold}`,
    description: `Store ${threshold} ${prettyType} type Pokémon.`,
    isUnlocked: (_dex, _vault, types) => typeCount(types, typeName) >= threshold,
    reward: { kind: 'pokemon', value: rewardPokemon },
  }
}

export const milestones: Milestone[] = [
  {
    id: 'kanto_50',
    title: 'Kanto Collector',
    description: 'Catch 50 Pokémon in the Kanto dex range.',
    isUnlocked: (dex) => {
      const kanto = dex.regions.find((r) => r.id === 'kanto')
      return (kanto?.caught ?? 0) >= 50
    },
    reward: { kind: 'badge', value: 'Kanto Collector' },
    category: 'region',
  },
  {
    id: 'kanto_151',
    title: 'Kanto Complete',
    description: 'Complete the Kanto dex range.',
    isUnlocked: (dex) => {
      const kanto = dex.regions.find((r) => r.id === 'kanto')
      return (kanto?.caught ?? 0) >= 151
    },
    reward: { kind: 'title', value: 'Kanto Champion' },
    category: 'region',
  },
  {
    id: 'national_151',
    title: 'First Generation',
    description: 'Catch 151 Pokémon in the National dex.',
    isUnlocked: (dex) => dex.nationalCaught >= 151,
    reward: { kind: 'badge', value: 'Gen 1 Complete' },
    category: 'national',
  },
  {
    id: 'national_500',
    title: 'Collector 500',
    description: 'Catch 500 Pokémon in the National dex.',
    isUnlocked: (dex) => dex.nationalCaught >= 500,
    reward: { kind: 'title', value: 'Master Collector' },
    category: 'national',
  },
  {
    id: 'first_shiny',
    title: 'First Shiny',
    description: 'Store at least one shiny Pokémon in your vault.',
    isUnlocked: (_dex, vault) => vault.shinyCount >= 1,
    reward: { kind: 'badge', value: 'Shiny Hunter' },
    category: 'vault',
  },
  {
    id: 'stored_100',
    title: 'Vault Builder',
    description: 'Store 100 Pokémon in your vault.',
    isUnlocked: (_dex, vault) => vault.totalStored >= 100,
    reward: { kind: 'badge', value: 'Vault Builder' },
    category: 'vault',
  },

  {
    id: 'type_bug_50',
    title: 'Bug Mastery 50',
    description: 'Store 50 Bug type Pokémon.',
    isUnlocked: (_dex, _vault, types) => (types?.bug ?? 0) >= 50,
    reward: { kind: 'pokemon', value: 'Shiny Heracross' },
    category: 'type',
  },
  {
    id: 'type_bug_100',
    title: 'Bug Mastery 100',
    description: 'Store 100 Bug type Pokémon.',
    isUnlocked: (_dex, _vault, types) => (types?.bug ?? 0) >= 100,
    reward: { kind: 'pokemon', value: 'Shiny Scizor' },
    category: 'type',
  },
  {
    id: 'type_bug_200',
    title: 'Bug Mastery 200',
    description: 'Store 200 Bug type Pokémon.',
    isUnlocked: (_dex, _vault, types) => (types?.bug ?? 0) >= 200,
    reward: { kind: 'pokemon', value: 'Genesect' },
    category: 'type',
  },

  {
    id: 'type_electric_50',
    title: 'Electric Mastery 50',
    description: 'Store 50 Electric type Pokémon.',
    isUnlocked: (_dex, _vault, types) => (types?.electric ?? 0) >= 50,
    reward: { kind: 'pokemon', value: 'Shiny Jolteon' },
    category: 'type',
  },
  {
    id: 'type_electric_100',
    title: 'Electric Mastery 100',
    description: 'Store 100 Electric type Pokémon.',
    isUnlocked: (_dex, _vault, types) => (types?.electric ?? 0) >= 100,
    reward: { kind: 'pokemon', value: 'Shiny Luxray' },
    category: 'type',
  },
  {
    id: 'type_electric_200',
    title: 'Electric Mastery 200',
    description: 'Store 200 Electric type Pokémon.',
    isUnlocked: (_dex, _vault, types) => (types?.electric ?? 0) >= 200,
    reward: { kind: 'pokemon', value: 'Zeraora' },
    category: 'type',
  },

  {
    id: 'type_water_50',
    title: 'Water Mastery 50',
    description: 'Store 50 Water type Pokémon.',
    isUnlocked: (_dex, _vault, types) => (types?.water ?? 0) >= 50,
    reward: { kind: 'pokemon', value: 'Shiny Gyarados' },
    category: 'type',
  },
  {
    id: 'type_water_100',
    title: 'Water Mastery 100',
    description: 'Store 100 Water type Pokémon.',
    isUnlocked: (_dex, _vault, types) => (types?.water ?? 0) >= 100,
    reward: { kind: 'pokemon', value: 'Shiny Greninja' },
    category: 'type',
  },
  {
    id: 'type_water_200',
    title: 'Water Mastery 200',
    description: 'Store 200 Water type Pokémon.',
    isUnlocked: (_dex, _vault, types) => (types?.water ?? 0) >= 200,
    reward: { kind: 'pokemon', value: 'Manaphy' },
    category: 'type',
  },
  {
    id: 'type_water_300',
    title: 'Water Mastery 300',
    description: 'Store 300 Water type Pokémon.',
    isUnlocked: (_dex, _vault, types) => (types?.water ?? 0) >= 300,
    reward: { kind: 'pokemon', value: 'Phione' },
    category: 'type',
  },

  {
    id: 'type_grass_50',
    title: 'Grass Mastery 50',
    description: 'Store 50 Grass type Pokémon.',
    isUnlocked: (_dex, _vault, types) => (types?.grass ?? 0) >= 50,
    reward: { kind: 'pokemon', value: 'Shiny Roserade' },
    category: 'type',
  },
  {
    id: 'type_grass_100',
    title: 'Grass Mastery 100',
    description: 'Store 100 Grass type Pokémon.',
    isUnlocked: (_dex, _vault, types) => (types?.grass ?? 0) >= 100,
    reward: { kind: 'pokemon', value: 'Shiny Sceptile' },
    category: 'type',
  },
  {
    id: 'type_grass_200',
    title: 'Grass Mastery 200',
    description: 'Store 200 Grass type Pokémon.',
    isUnlocked: (_dex, _vault, types) => (types?.grass ?? 0) >= 200,
    reward: { kind: 'pokemon', value: 'Shaymin' },
    category: 'type',
  },

  {
    id: 'type_psychic_50',
    title: 'Psychic Mastery 50',
    description: 'Store 50 Psychic type Pokémon.',
    isUnlocked: (_dex, _vault, types) => (types?.psychic ?? 0) >= 50,
    reward: { kind: 'pokemon', value: 'Shiny Espeon' },
    category: 'type',
  },
  {
    id: 'type_psychic_100',
    title: 'Psychic Mastery 100',
    description: 'Store 100 Psychic type Pokémon.',
    isUnlocked: (_dex, _vault, types) => (types?.psychic ?? 0) >= 100,
    reward: { kind: 'pokemon', value: 'Shiny Gardevoir' },
    category: 'type',
  },
  {
    id: 'type_psychic_250',
    title: 'Psychic Mastery 250',
    description: 'Store 250 Psychic type Pokémon.',
    isUnlocked: (_dex, _vault, types) => (types?.psychic ?? 0) >= 250,
    reward: { kind: 'pokemon', value: 'Mew' },
    category: 'type',
  },

  {
    id: 'type_steel_50',
    title: 'Steel Mastery 50',
    description: 'Store 50 Steel type Pokémon.',
    isUnlocked: (_dex, _vault, types) => (types?.steel ?? 0) >= 50,
    reward: { kind: 'pokemon', value: 'Shiny Metagross' },
    category: 'type',
  },
  {
    id: 'type_steel_100',
    title: 'Steel Mastery 100',
    description: 'Store 100 Steel type Pokémon.',
    isUnlocked: (_dex, _vault, types) => (types?.steel ?? 0) >= 100,
    reward: { kind: 'pokemon', value: 'Shiny Aegislash' },
    category: 'type',
  },
  {
    id: 'type_steel_200',
    title: 'Steel Mastery 200',
    description: 'Store 200 Steel type Pokémon.',
    isUnlocked: (_dex, _vault, types) => (types?.steel ?? 0) >= 200,
    reward: { kind: 'pokemon', value: 'Magearna' },
    category: 'type',
  },

  {
    id: 'type_fire_50',
    title: 'Fire Mastery 50',
    description: 'Store 50 Fire type Pokémon.',
    isUnlocked: (_dex, _vault, types) => (types?.fire ?? 0) >= 50,
    reward: { kind: 'pokemon', value: 'Shiny Arcanine' },
    category: 'type',
  },
  {
    id: 'type_fire_100',
    title: 'Fire Mastery 100',
    description: 'Store 100 Fire type Pokémon.',
    isUnlocked: (_dex, _vault, types) => (types?.fire ?? 0) >= 100,
    reward: { kind: 'pokemon', value: 'Shiny Blaziken' },
    category: 'type',
  },
  {
    id: 'type_fire_200',
    title: 'Fire Mastery 200',
    description: 'Store 200 Fire type Pokémon.',
    isUnlocked: (_dex, _vault, types) => (types?.fire ?? 0) >= 200,
    reward: { kind: 'pokemon', value: 'Volcanion' },
    category: 'type',
  },

  {
    id: 'type_dark_50',
    title: 'Dark Mastery 50',
    description: 'Store 50 Dark type Pokémon.',
    isUnlocked: (_dex, _vault, types) => (types?.dark ?? 0) >= 50,
    reward: { kind: 'pokemon', value: 'Shiny Umbreon' },
    category: 'type',
  },
  {
    id: 'type_dark_100',
    title: 'Dark Mastery 100',
    description: 'Store 100 Dark type Pokémon.',
    isUnlocked: (_dex, _vault, types) => (types?.dark ?? 0) >= 100,
    reward: { kind: 'pokemon', value: 'Shiny Zoroark' },
    category: 'type',
  },
  {
    id: 'type_dark_200',
    title: 'Dark Mastery 200',
    description: 'Store 200 Dark type Pokémon.',
    isUnlocked: (_dex, _vault, types) => (types?.dark ?? 0) >= 200,
    reward: { kind: 'pokemon', value: 'Darkrai' },
    category: 'type',
  },

  {
    id: 'type_fighting_50',
    title: 'Fighting Mastery 50',
    description: 'Store 50 Fighting type Pokémon.',
    isUnlocked: (_dex, _vault, types) => (types?.fighting ?? 0) >= 50,
    reward: { kind: 'pokemon', value: 'Shiny Lucario' },
    category: 'type',
  },
  {
    id: 'type_fighting_100',
    title: 'Fighting Mastery 100',
    description: 'Store 100 Fighting type Pokémon.',
    isUnlocked: (_dex, _vault, types) => (types?.fighting ?? 0) >= 100,
    reward: { kind: 'pokemon', value: 'Shiny Gallade' },
    category: 'type',
  },
  {
    id: 'type_fighting_200',
    title: 'Fighting Mastery 200',
    description: 'Store 200 Fighting type Pokémon.',
    isUnlocked: (_dex, _vault, types) => (types?.fighting ?? 0) >= 200,
    reward: { kind: 'pokemon', value: 'Keldeo' },
    category: 'type',
  },

  {
    id: 'type_fairy_50',
    title: 'Fairy Mastery 50',
    description: 'Store 50 Fairy type Pokémon.',
    isUnlocked: (_dex, _vault, types) => (types?.fairy ?? 0) >= 50,
    reward: { kind: 'pokemon', value: 'Shiny Sylveon' },
    category: 'type',
  },
  {
    id: 'type_fairy_100',
    title: 'Fairy Mastery 100',
    description: 'Store 100 Fairy type Pokémon.',
    isUnlocked: (_dex, _vault, types) => (types?.fairy ?? 0) >= 100,
    reward: { kind: 'pokemon', value: 'Shiny Togekiss' },
    category: 'type',
  },
  {
    id: 'type_fairy_200',
    title: 'Fairy Mastery 200',
    description: 'Store 200 Fairy type Pokémon.',
    isUnlocked: (_dex, _vault, types) => (types?.fairy ?? 0) >= 200,
    reward: { kind: 'pokemon', value: 'Diancie' },
    category: 'type',
  },

  {
    id: 'type_normal_50',
    title: 'Normal Mastery 50',
    description: 'Store 50 Normal type Pokémon.',
    isUnlocked: (_dex, _vault, types) => (types?.normal ?? 0) >= 50,
    reward: { kind: 'pokemon', value: 'Shiny Snorlax' },
    category: 'type',
  },
  {
    id: 'type_normal_100',
    title: 'Normal Mastery 100',
    description: 'Store 100 Normal type Pokémon.',
    isUnlocked: (_dex, _vault, types) => (types?.normal ?? 0) >= 100,
    reward: { kind: 'pokemon', value: 'Shiny Porygon Z' },
    category: 'type',
  },
  {
    id: 'type_normal_200',
    title: 'Normal Mastery 200',
    description: 'Store 200 Normal type Pokémon.',
    isUnlocked: (_dex, _vault, types) => (types?.normal ?? 0) >= 200,
    reward: { kind: 'pokemon', value: 'Meloetta' },
    category: 'type',
  },

  {
    id: 'region_kanto_100',
    title: 'Kanto Completed',
    description: 'Complete the Kanto dex range.',
    isUnlocked: (dex) => {
      const r = dex.regions.find((x) => x.id === 'kanto')
      return (r?.caught ?? 0) >= (r?.total ?? 0) && (r?.total ?? 0) > 0
    },
    reward: { kind: 'pokemon', value: 'Meltan' },
    category: 'region',
  },
  {
    id: 'region_johto_100',
    title: 'Johto Completed',
    description: 'Complete the Johto dex range.',
    isUnlocked: (dex) => {
      const r = dex.regions.find((x) => x.id === 'johto')
      return (r?.caught ?? 0) >= (r?.total ?? 0) && (r?.total ?? 0) > 0
    },
    reward: { kind: 'pokemon', value: 'Celebi' },
    category: 'region',
  },
  {
    id: 'region_hoenn_100',
    title: 'Hoenn Completed',
    description: 'Complete the Hoenn dex range.',
    isUnlocked: (dex) => {
      const r = dex.regions.find((x) => x.id === 'hoenn')
      return (r?.caught ?? 0) >= (r?.total ?? 0) && (r?.total ?? 0) > 0
    },
    reward: { kind: 'pokemon', value: 'Jirachi' },
    category: 'region',
  },
  {
    id: 'region_sinnoh_100',
    title: 'Sinnoh Completed',
    description: 'Complete the Sinnoh dex range.',
    isUnlocked: (dex) => {
      const r = dex.regions.find((x) => x.id === 'sinnoh')
      return (r?.caught ?? 0) >= (r?.total ?? 0) && (r?.total ?? 0) > 0
    },
    reward: { kind: 'pokemon', value: 'Arceus' },
    category: 'region',
  },
  {
    id: 'region_unova_100',
    title: 'Unova Completed',
    description: 'Complete the Unova dex range.',
    isUnlocked: (dex) => {
      const r = dex.regions.find((x) => x.id === 'unova')
      return (r?.caught ?? 0) >= (r?.total ?? 0) && (r?.total ?? 0) > 0
    },
    reward: { kind: 'pokemon', value: 'Victini' },
    category: 'region',
  },
  {
    id: 'region_kalos_100',
    title: 'Kalos Completed',
    description: 'Complete the Kalos dex range.',
    isUnlocked: (dex) => {
      const r = dex.regions.find((x) => x.id === 'kalos')
      return (r?.caught ?? 0) >= (r?.total ?? 0) && (r?.total ?? 0) > 0
    },
    reward: { kind: 'pokemon', value: 'Hoopa' },
    category: 'region',
  },
  {
    id: 'region_alola_100',
    title: 'Alola Completed',
    description: 'Complete the Alola dex range.',
    isUnlocked: (dex) => {
      const r = dex.regions.find((x) => x.id === 'alola')
      return (r?.caught ?? 0) >= (r?.total ?? 0) && (r?.total ?? 0) > 0
    },
    reward: { kind: 'pokemon', value: 'Marshadow' },
    category: 'region',
  },
  {
    id: 'region_galar_100',
    title: 'Galar Completed',
    description: 'Complete the Galar dex range.',
    isUnlocked: (dex) => {
      const r = dex.regions.find((x) => x.id === 'galar')
      return (r?.caught ?? 0) >= (r?.total ?? 0) && (r?.total ?? 0) > 0
    },
    reward: { kind: 'pokemon', value: 'Zarude' },
    category: 'region',
  },

  {
    id: 'dup_25',
    title: 'Duplicate Transfer 25',
    description: 'Transfer 25 duplicate Pokémon.',
    isUnlocked: (_dex, _vault, _types, counters) => (counters?.duplicatesTransferred ?? 0) >= 25,
    reward: { kind: 'pokemon', value: 'Shiny Eevee' },
    category: 'vault',
  },
  {
    id: 'dup_75',
    title: 'Duplicate Transfer 75',
    description: 'Transfer 75 duplicate Pokémon.',
    isUnlocked: (_dex, _vault, _types, counters) => (counters?.duplicatesTransferred ?? 0) >= 75,
    reward: { kind: 'pokemon', value: 'Shiny Riolu' },
    category: 'vault',
  },
  {
    id: 'dup_150',
    title: 'Duplicate Transfer 150',
    description: 'Transfer 150 duplicate Pokémon.',
    isUnlocked: (_dex, _vault, _types, counters) => (counters?.duplicatesTransferred ?? 0) >= 150,
    reward: { kind: 'pokemon', value: 'Shiny Gible' },
    category: 'vault',
  },
  {
    id: 'dup_300',
    title: 'Duplicate Transfer 300',
    description: 'Transfer 300 duplicate Pokémon.',
    isUnlocked: (_dex, _vault, _types, counters) => (counters?.duplicatesTransferred ?? 0) >= 300,
    reward: { kind: 'pokemon', value: 'Melmetal' },
    category: 'vault',
  },

  {
    id: 'national_100',
    title: 'National 100 Percent',
    description: 'Reach 100 percent completion of the National Pokédex and maintain a living dex in your vault.',
    isUnlocked: (dex, vault) => {
      const complete = dex.nationalCaught >= dex.nationalTotal && dex.nationalTotal > 0
      const living = vault.uniqueSpecies >= dex.nationalTotal
      return complete && living
    },
    reward: { kind: 'pokemon', value: 'Shiny Mew' },
    category: 'national',
  },
]