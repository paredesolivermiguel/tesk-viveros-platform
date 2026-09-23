// Misma logica que backend/src/common/trays.util.ts, para que el resumen
// en vivo de la app coincida siempre con lo que el servidor recalculara.
export function normalizeTrayUnits(rawUnits: number, rawTrays: number, unitsPerTray: number) {
  const safe = unitsPerTray > 0 ? unitsPerTray : 1;
  const totalUnits = Math.max(0, Math.floor(rawUnits || 0)) + Math.max(0, Math.floor(rawTrays || 0)) * safe;
  const trays = Math.floor(totalUnits / safe);
  const looseUnits = totalUnits % safe;
  return { trays, looseUnits, totalUnits };
}
