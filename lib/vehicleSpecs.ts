import { VEHICLE_SPECS_CATALOG, type VehicleModelSpecs } from '@/constants/vehicleSpecs';
import { normalizeMake, normalizeModel } from '@/lib/vehicleCatalog';

function matchesYear(entry: VehicleModelSpecs, year: number): boolean {
  if (entry.yearFrom != null && year < entry.yearFrom) return false;
  if (entry.yearTo != null && year > entry.yearTo) return false;
  return true;
}

export function findCatalogSpecs(
  make: string,
  model: string,
  year?: number,
): VehicleModelSpecs | null {
  const normalizedMake = normalizeMake(make);
  const normalizedModel = normalizeModel(model, normalizedMake);

  const matches = VEHICLE_SPECS_CATALOG.filter(
    (e) =>
      e.make.toLowerCase() === normalizedMake.toLowerCase() &&
      e.model.toLowerCase() === normalizedModel.toLowerCase(),
  );

  if (!matches.length) return null;
  if (year != null) {
    const byYear = matches.find((e) => matchesYear(e, year));
    if (byYear) return byYear;
  }
  return matches[0];
}
