export type DexRegion = {
  id: string;
  name: string;
  startDexNum: number;
  endDexNum: number;
};

export const dexRegions: DexRegion[] = [
  { id: "kanto", name: "Kanto", startDexNum: 1, endDexNum: 151 },
  { id: "johto", name: "Johto", startDexNum: 152, endDexNum: 251 },
  { id: "hoenn", name: "Hoenn", startDexNum: 252, endDexNum: 386 },
  { id: "sinnoh", name: "Sinnoh", startDexNum: 387, endDexNum: 493 },
  { id: "unova", name: "Unova", startDexNum: 494, endDexNum: 649 },
  { id: "kalos", name: "Kalos", startDexNum: 650, endDexNum: 721 },
  { id: "alola", name: "Alola", startDexNum: 722, endDexNum: 809 },
  { id: "galar", name: "Galar", startDexNum: 810, endDexNum: 898 },
  { id: "paldea", name: "Paldea", startDexNum: 899, endDexNum: 1025 },
];

export const nationalDex = { startDexNum: 1, endDexNum: 1025 };