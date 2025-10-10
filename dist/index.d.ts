/**
 * Calcula todas las cuotas IMSS para un trabajador
 * @param {number} salarioDiario - Salario diario integrado del trabajador
 * @param {Object} opciones - Opciones de cálculo
 * @returns {Object} Desglose completo de cuotas
 */
export function calcularCuotasIMSS(salarioDiario: number, opciones?: any): any;
/**
 * Calcula solo la cuota obrera
 * @param {number} salarioDiario - Salario diario integrado
 * @param {Object} opciones - Opciones de cálculo
 * @returns {Object} Cuota obrera desglosada
 */
export function calcularCuotaObrera(salarioDiario: number, opciones?: any): any;
/**
 * Calcula solo la cuota patronal
 * @param {number} salarioDiario - Salario diario integrado
 * @param {Object} opciones - Opciones de cálculo
 * @returns {Object} Cuota patronal desglosada
 */
export function calcularCuotaPatronal(salarioDiario: number, opciones?: any): any;
/**
 * Calcula el salario neto después de cuotas
 * @param {number} salarioDiario - Salario diario integrado
 * @param {Object} opciones - Opciones de cálculo
 * @returns {Object} Salario neto y descuentos
 */
export function calcularSalarioNeto(salarioDiario: number, opciones?: any): any;
/**
 * Obtiene información de UMA 2024
 * @returns {Object} Valores de UMA
 */
export function obtenerUMA(): any;
/**
 * Obtiene las tablas de porcentajes IMSS
 * @returns {Object} Porcentajes por ramo
 */
export function obtenerPorcentajesIMSS(): any;
/**
 * Calcula cuotas para múltiples trabajadores
 * @param {Array} trabajadores - Array de objetos con salarioDiario y opciones
 * @returns {Array} Resultados de cálculo para cada trabajador
 */
export function calcularCuotasMultiples(trabajadores: any[]): any[];
declare namespace _default {
    export { calcularCuotasIMSS };
    export { calcularCuotaObrera };
    export { calcularCuotaPatronal };
    export { calcularSalarioNeto };
    export { obtenerUMA };
    export { obtenerPorcentajesIMSS };
    export { calcularCuotasMultiples };
}
export default _default;
