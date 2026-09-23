/**
 * Logica centralizada de conversion bandejas/unidades. Esto es, a
 * proposito, la UNICA funcion en todo el sistema que hace este calculo
 * (a diferencia de WordPress, donde llegamos a tener dos sistemas
 * paralelos que se desincronizaban). Se usa tanto para el resumen en
 * vivo del catalogo como, sobre todo, en el calculo final del pedido en
 * el servidor: el servidor NUNCA confia en el total que mande el
 * cliente, siempre lo recalcula aqui.
 */
export interface TrayResult {
  trays: number;
  looseUnits: number;
  totalUnits: number;
}

export function normalizeTrayUnits(
  rawUnits: number,
  rawTrays: number,
  unitsPerTray: number,
): TrayResult {
  const unitsPerTraySafe = unitsPerTray > 0 ? unitsPerTray : 1;
  const totalUnits = Math.max(0, Math.floor(rawUnits)) + Math.max(0, Math.floor(rawTrays)) * unitsPerTraySafe;
  const trays = Math.floor(totalUnits / unitsPerTraySafe);
  const looseUnits = totalUnits % unitsPerTraySafe;
  return { trays, looseUnits, totalUnits };
}
