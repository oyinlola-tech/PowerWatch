import { Prisma } from '@prisma/client';
import { prisma } from '../../../configs/database.config.js';
import { env } from '../../../configs/env.config.js';
import type { ReverseGeocodeResult } from '../../../interfaces/index.js';

interface NominatimAddress {
  state?: string;
  county?: string;
  city?: string;
  town?: string;
  village?: string;
  suburb?: string;
  neighbourhood?: string;
  hamlet?: string;
  road?: string;
  state_district?: string;
  country?: string;
  country_code?: string;
}

const STATE_SUFFIXES = [' State', ' state', 'Staat'];
const FIND_OR_CREATE_MAX_ATTEMPTS = 3;

type GeoPoint = { latitude: number; longitude: number };

const approximate = (coordinate: number) => Math.round(coordinate * 100) / 100;

type LocationTable = 'state' | 'lGA' | 'city' | 'town' | 'neighborhood';
type MaxIdDelegate = {
  aggregate: (args: { _max: { id: true } }) => Promise<{ _max: { id: number | null } }>;
};

// Nominatim's usage policy requires an identifying User-Agent; include a contact only if one is configured.
const NOMINATIM_USER_AGENT = env.nominatim.contactEmail
  ? `PowerWatch/1.0 (${env.nominatim.contactEmail})`
  : 'PowerWatch/1.0';

export class ReverseGeocodeQuery {
  async execute(latitude: number, longitude: number): Promise<ReverseGeocodeResult> {
    try {
      return await this.reverseWithNominatim(latitude, longitude);
    } catch {
      return this.reverseWithLgaPackage(latitude, longitude);
    }
  }

  /**
   * Find-or-create inside a serializable transaction: concurrent requests for the
   * same place serialize on the lookup, and the loser of any conflict (duplicate
   * id or write conflict/deadlock) retries and then finds the winner's row.
   */
  private async findOrCreate<T>(
    table: LocationTable,
    find: (tx: Prisma.TransactionClient) => Promise<T | null>,
    create: (tx: Prisma.TransactionClient, id: number) => Promise<T>,
  ): Promise<T> {
    for (let attempt = 1; ; attempt++) {
      try {
        return await prisma.$transaction(
          async (tx) => {
            const existing = await find(tx);
            if (existing) return existing;
            const result = await (tx[table] as unknown as MaxIdDelegate).aggregate({ _max: { id: true } });
            return create(tx, (result._max.id ?? 0) + 1);
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
      } catch (error) {
        const retryable =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          (error.code === 'P2002' || error.code === 'P2034');
        if (!retryable || attempt >= FIND_OR_CREATE_MAX_ATTEMPTS) throw error;
      }
    }
  }

  private async findOrCreateState(name: string, countryId: number) {
    return this.findOrCreate(
      'state',
      async (tx) => {
        const exact = await tx.state.findFirst({ where: { name } });
        if (exact) return exact;
        for (const suffix of STATE_SUFFIXES) {
          if (name.endsWith(suffix)) {
            const stripped = await tx.state.findFirst({ where: { name: name.slice(0, -suffix.length) } });
            if (stripped) return stripped;
          }
        }
        return null;
      },
      (tx, id) => tx.state.create({ data: { id, name, countryId } }),
    );
  }

  private async findOrCreateLGA(name: string, stateId: number) {
    return this.findOrCreate(
      'lGA',
      (tx) => tx.lGA.findFirst({ where: { name, stateId } }),
      (tx, id) => tx.lGA.create({ data: { id, name, stateId } }),
    );
  }

  private async findOrCreateCity(name: string, lgaId: number) {
    return this.findOrCreate(
      'city',
      (tx) => tx.city.findFirst({ where: { name, lgaId } }),
      (tx, id) => tx.city.create({ data: { id, name, lgaId } }),
    );
  }

  private async findOrCreateTown(name: string, cityId: number) {
    return this.findOrCreate(
      'town',
      (tx) => tx.town.findFirst({ where: { name, cityId } }),
      (tx, id) => tx.town.create({ data: { id, name, cityId } }),
    );
  }

  private async findOrCreateNeighborhood(name: string, townId: number, point?: GeoPoint) {
    return this.findOrCreate(
      'neighborhood',
      (tx) => tx.neighborhood.findFirst({ where: { name, townId } }),
      // A neighborhood first seen via GPS is placed on the status map near that point.
      // The point is someone's home or street, and neighborhood coordinates are public,
      // so only an approximate position (two decimals, about 1 km) is kept.
      (tx, id) =>
        tx.neighborhood.create({
          data: {
            id,
            name,
            townId,
            latitude: point ? approximate(point.latitude) : null,
            longitude: point ? approximate(point.longitude) : null,
          },
        }),
    );
  }

  private async reverseWithNominatim(
    latitude: number,
    longitude: number,
  ): Promise<ReverseGeocodeResult> {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': NOMINATIM_USER_AGENT,
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      throw new Error(`Nominatim returned ${res.status}`);
    }

    const data = (await res.json()) as { address?: NominatimAddress };
    const address = data?.address;

    if (!address?.state) {
      throw new Error('Nominatim did not return state');
    }

    const country = await prisma.country.findFirst({ where: { name: 'Nigeria' } });
    const countryId = country?.id ?? 1;

    const state = await this.findOrCreateState(address.state, countryId);

    const lgaCandidates = [
      address.county,
      address.state_district,
      address.city,
      address.town,
      address.village,
    ].filter(Boolean) as string[];

    let lgaName = lgaCandidates[0] ?? address.state;
    let lga = await prisma.lGA.findFirst({ where: { name: lgaName, stateId: state.id } });
    if (!lga) {
      for (const candidate of lgaCandidates) {
        lga = await prisma.lGA.findFirst({ where: { name: candidate, stateId: state.id } });
        if (lga) { lgaName = candidate; break; }
      }
    }
    if (!lga) {
      lga = await this.findOrCreateLGA(lgaName, state.id);
    }

    const cityName = address.city || address.town || address.village || address.suburb || lgaName;
    const townName = address.town || address.village || address.suburb || address.neighbourhood || cityName;
    const neighborhoodName = address.suburb || address.neighbourhood || address.hamlet || townName;

    return this.resolveHierarchy(
      countryId, state.name, state.id, lgaName, lga.id, cityName, townName, neighborhoodName, 0,
      { suburb: address.suburb ?? null, village: address.village ?? null, road: address.road ?? null },
      { latitude, longitude },
    );
  }

  private async reverseWithLgaPackage(
    latitude: number,
    longitude: number,
  ): Promise<ReverseGeocodeResult> {
    const { getByCoordinates } = await import('nigeria-lga-data');
    const result = getByCoordinates(latitude, longitude);

    if (!result || !result.lga) {
      throw new Error('No location found for the given coordinates.');
    }

    const lgaName = result.lga.name;
    const stateName = result.lga.state;
    const distanceKm = result.distanceKm;

    const country = await prisma.country.findFirst({ where: { name: 'Nigeria' } });
    const countryId = country?.id ?? 1;
    const state = await this.findOrCreateState(stateName, countryId);
    const lga = await this.findOrCreateLGA(lgaName, state.id);

    return this.resolveHierarchy(
      countryId, state.name, state.id, lga.name, lga.id, lgaName, lgaName, lgaName, distanceKm,
      { suburb: null, village: null, road: null },
    );
  }

  private async resolveHierarchy(
    countryId: number,
    stateName: string,
    stateId: number,
    lgaName: string,
    lgaId: number,
    cityName: string,
    townName: string,
    neighborhoodName: string,
    distanceKm: number = 0,
    osmAddress: { suburb: string | null; village: string | null; road: string | null } = { suburb: null, village: null, road: null },
    point?: GeoPoint,
  ): Promise<ReverseGeocodeResult> {
    const country = await prisma.country.findUnique({ where: { id: countryId } });
    const city = await this.findOrCreateCity(cityName, lgaId);
    const town = await this.findOrCreateTown(townName, city.id);
    const neighborhood = await this.findOrCreateNeighborhood(neighborhoodName, town.id, point);

    return {
      countryId,
      country: country?.name ?? 'Nigeria',
      stateId,
      state: stateName,
      lgaId,
      lga: lgaName,
      cityId: city.id,
      city: city.name,
      townId: town.id,
      town: town.name,
      neighborhoodId: neighborhood.id,
      neighborhood: neighborhood.name,
      distanceKm,
      suburb: osmAddress.suburb,
      village: osmAddress.village,
      road: osmAddress.road,
    };
  }
}
