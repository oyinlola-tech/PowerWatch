import type { LocationTree } from "./types";

export interface LocationIndex {
  tree: LocationTree;
  stateName: Map<number, string>;
  lgaById: Map<number, { name: string; stateId: number }>;
  cityById: Map<number, { name: string; lgaId: number }>;
  townById: Map<number, { name: string; cityId: number }>;
  neighborhoodById: Map<number, { name: string; townId: number }>;
}

export const buildIndex = (tree: LocationTree): LocationIndex => ({
  tree,
  stateName: new Map(tree.states.map((s) => [s.id, s.name])),
  lgaById: new Map(tree.lgas.map((l) => [l.id, { name: l.name, stateId: l.stateId }])),
  cityById: new Map(tree.cities.map((c) => [c.id, { name: c.name, lgaId: c.lgaId }])),
  townById: new Map(tree.towns.map((t) => [t.id, { name: t.name, cityId: t.cityId }])),
  neighborhoodById: new Map(tree.neighborhoods.map((n) => [n.id, { name: n.name, townId: n.townId }])),
});

/** "Central, Badagry" for a neighborhood ID, or "Neighborhood #12" until names have loaded. */
export function neighborhoodLabel(index: LocationIndex | undefined, id: number) {
  const n = index?.neighborhoodById.get(id);
  if (!n) return `Neighborhood #${id}`;
  const town = index?.townById.get(n.townId);
  return town ? `${n.name}, ${town.name}` : n.name;
}

/** "Ikeja, Lagos": the LGA and state above a neighborhood. */
export function neighborhoodArea(index: LocationIndex | undefined, id: number) {
  const n = index?.neighborhoodById.get(id);
  const town = n ? index?.townById.get(n.townId) : undefined;
  const city = town ? index?.cityById.get(town.cityId) : undefined;
  const lga = city ? index?.lgaById.get(city.lgaId) : undefined;
  const state = lga ? index?.stateName.get(lga.stateId) : undefined;
  return [lga?.name, state].filter(Boolean).join(", ");
}
