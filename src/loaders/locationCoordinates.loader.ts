import { getAll } from 'nigeria-lga-data';
import { prisma } from '../configs/database.config.js';

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z]/g, '');

/**
 * The seeded location data has no coordinates, which the status map needs.
 * Fill missing LGA coordinates from nigeria-lga-data, then give cities their
 * LGA's point and states the average of their LGAs. Only empty values are
 * written, so this is cheap after the first run and never overwrites edits.
 */
export async function backfillLocationCoordinates(): Promise<void> {
  const missing = await prisma.lGA.findMany({
    where: { latitude: null },
    select: { id: true, name: true, state: { select: { name: true } } },
  });

  if (missing.length > 0) {
    const reference = new Map(
      getAll().map((lga) => [`${normalize(lga.state)}|${normalize(lga.name)}`, lga.coordinates]),
    );
    const updates = missing.flatMap((lga) => {
      const point = reference.get(`${normalize(lga.state.name)}|${normalize(lga.name)}`);
      return point
        ? [prisma.lGA.update({ where: { id: lga.id }, data: { latitude: point.lat, longitude: point.lng } })]
        : [];
    });
    for (let i = 0; i < updates.length; i += 200) {
      await prisma.$transaction(updates.slice(i, i + 200));
    }
    if (updates.length > 0) console.log(`Filled coordinates for ${updates.length} LGAs.`);
  }

  const cities = await prisma.city.findMany({
    where: { latitude: null, lga: { latitude: { not: null } } },
    select: { id: true, lga: { select: { latitude: true, longitude: true } } },
  });
  const cityUpdates = cities.map((city) =>
    prisma.city.update({
      where: { id: city.id },
      data: { latitude: city.lga.latitude, longitude: city.lga.longitude },
    }),
  );
  for (let i = 0; i < cityUpdates.length; i += 200) {
    await prisma.$transaction(cityUpdates.slice(i, i + 200));
  }

  const states = await prisma.state.findMany({
    where: { latitude: null },
    select: { id: true, lgAs: { where: { latitude: { not: null } }, select: { latitude: true, longitude: true } } },
  });
  const stateUpdates = states
    .filter((state) => state.lgAs.length > 0)
    .map((state) => {
      const lat = state.lgAs.reduce((sum, l) => sum + (l.latitude ?? 0), 0) / state.lgAs.length;
      const lng = state.lgAs.reduce((sum, l) => sum + (l.longitude ?? 0), 0) / state.lgAs.length;
      return prisma.state.update({ where: { id: state.id }, data: { latitude: lat, longitude: lng } });
    });
  if (stateUpdates.length > 0) await prisma.$transaction(stateUpdates);
}
