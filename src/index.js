/**
 * Calculadora de Cuotas IMSS 2024
 * Calcula cuotas obrero-patronales del Instituto Mexicano del Seguro Social
 * Basado en la Ley del Seguro Social y UMA 2024
 * 
 * @author Gerardo Lucero
 * @version 1.0.0
 */

// UMA 2024 (Unidad de Medida y Actualización)
const UMA_2024 = {
  diaria: 108.57,
  mensual: 3297.57,
  anual: 39570.84
};

// Límites de salario
const SALARIO_MINIMO_2024 = 248.93; // Diario
const LIMITE_SUPERIOR_COTIZACION = UMA_2024.diaria * 25; // 25 UMAs

// Porcentajes de cuotas por ramo (2024)
const PORCENTAJES_IMSS = {
  // Enfermedad y Maternidad
  enfermedadMaternidad: {
    obrera: {
      excedente: 0.40 / 100, // 0.40% sobre excedente de 3 UMAs
      dinero: 0.375 / 100 // 0.375% prestaciones en dinero
    },
    patronal: {
      cuotaFija: 20.40 / 100, // 20.40% sobre 3 UMAs
      excedente: 1.10 / 100, // 1.10% sobre excedente de 3 UMAs
      dinero: 0.70 / 100, // 0.70% prestaciones en dinero
      pensionados: 1.05 / 100 // 1.05% gastos médicos pensionados
    }
  },
  
  // Invalidez y Vida
  invalidezVida: {
    obrera: 0.625 / 100, // 0.625%
    patronal: 1.75 / 100 // 1.75%
  },
  
  // Retiro, Cesantía y Vejez
  retiro: {
    patronal: 2.00 / 100 // 2% solo patronal
  },
  cesantiaVejez: {
    obrera: 1.125 / 100, // 1.125%
    patronal: 3.150 / 100 // 3.150%
  },
  
  // Guarderías y Prestaciones Sociales
  guarderias: {
    patronal: 1.00 / 100 // 1% solo patronal
  },
  
  // Riesgos de Trabajo (varía por clase)
  riesgosTrabajo: {
    claseI: 0.54355 / 100,    // Mínima
    claseII: 1.13065 / 100,   // Baja
    claseIII: 2.59840 / 100,  // Media
    claseIV: 4.65325 / 100,   // Alta
    claseV: 7.58875 / 100     // Máxima
  }
};

/**
 * Calcula el salario base de cotización
 * @param {number} salarioDiario - Salario diario del trabajador
 * @returns {Object} Salario base y topes
 */
function calcularSalarioBase(salarioDiario) {
  // El SBC no puede ser menor al salario mínimo ni mayor a 25 UMAs
  const sbcMinimo = SALARIO_MINIMO_2024;
  const sbcMaximo = LIMITE_SUPERIOR_COTIZACION;
  
  const sbc = Math.max(sbcMinimo, Math.min(salarioDiario, sbcMaximo));
  const treUMAs = UMA_2024.diaria * 3;
  const excedente = Math.max(0, sbc - treUMAs);
  
  return {
    salarioDiario,
    sbcMinimo,
    sbcMaximo,
    sbc,
    treUMAs,
    excedente,
    aplicaTope: salarioDiario > sbcMaximo
  };
}

/**
 * Calcula cuota de Enfermedad y Maternidad
 * @param {Object} salarioBase - Datos del salario base
 * @returns {Object} Desglose de cuotas
 */
function calcularEnfermedadMaternidad(salarioBase) {
  const { sbc, treUMAs, excedente } = salarioBase;
  
  // Cuota Obrera
  const obreraExcedente = excedente * PORCENTAJES_IMSS.enfermedadMaternidad.obrera.excedente;
  const obreraDinero = sbc * PORCENTAJES_IMSS.enfermedadMaternidad.obrera.dinero;
  const cuotaObrera = obreraExcedente + obreraDinero;
  
  // Cuota Patronal
  const patronalCuotaFija = treUMAs * PORCENTAJES_IMSS.enfermedadMaternidad.patronal.cuotaFija;
  const patronalExcedente = excedente * PORCENTAJES_IMSS.enfermedadMaternidad.patronal.excedente;
  const patronalDinero = sbc * PORCENTAJES_IMSS.enfermedadMaternidad.patronal.dinero;
  const patronalPensionados = sbc * PORCENTAJES_IMSS.enfermedadMaternidad.patronal.pensionados;
  const cuotaPatronal = patronalCuotaFija + patronalExcedente + patronalDinero + patronalPensionados;
  
  return {
    ramo: 'Enfermedad y Maternidad',
    obrera: parseFloat(cuotaObrera.toFixed(2)),
    patronal: parseFloat(cuotaPatronal.toFixed(2)),
    total: parseFloat((cuotaObrera + cuotaPatronal).toFixed(2)),
    desglose: {
      obrera: {
        excedente: parseFloat(obreraExcedente.toFixed(2)),
        dinero: parseFloat(obreraDinero.toFixed(2))
      },
      patronal: {
        cuotaFija: parseFloat(patronalCuotaFija.toFixed(2)),
        excedente: parseFloat(patronalExcedente.toFixed(2)),
        dinero: parseFloat(patronalDinero.toFixed(2)),
        pensionados: parseFloat(patronalPensionados.toFixed(2))
      }
    }
  };
}

/**
 * Calcula cuota de Invalidez y Vida
 * @param {Object} salarioBase - Datos del salario base
 * @returns {Object} Desglose de cuotas
 */
function calcularInvalidezVida(salarioBase) {
  const { sbc } = salarioBase;
  
  const cuotaObrera = sbc * PORCENTAJES_IMSS.invalidezVida.obrera;
  const cuotaPatronal = sbc * PORCENTAJES_IMSS.invalidezVida.patronal;
  
  return {
    ramo: 'Invalidez y Vida',
    obrera: parseFloat(cuotaObrera.toFixed(2)),
    patronal: parseFloat(cuotaPatronal.toFixed(2)),
    total: parseFloat((cuotaObrera + cuotaPatronal).toFixed(2))
  };
}

/**
 * Calcula cuota de Retiro
 * @param {Object} salarioBase - Datos del salario base
 * @returns {Object} Desglose de cuotas
 */
function calcularRetiro(salarioBase) {
  const { sbc } = salarioBase;
  
  const cuotaPatronal = sbc * PORCENTAJES_IMSS.retiro.patronal;
  
  return {
    ramo: 'Retiro',
    obrera: 0,
    patronal: parseFloat(cuotaPatronal.toFixed(2)),
    total: parseFloat(cuotaPatronal.toFixed(2))
  };
}

/**
 * Calcula cuota de Cesantía y Vejez
 * @param {Object} salarioBase - Datos del salario base
 * @returns {Object} Desglose de cuotas
 */
function calcularCesantiaVejez(salarioBase) {
  const { sbc } = salarioBase;
  
  const cuotaObrera = sbc * PORCENTAJES_IMSS.cesantiaVejez.obrera;
  const cuotaPatronal = sbc * PORCENTAJES_IMSS.cesantiaVejez.patronal;
  
  return {
    ramo: 'Cesantía en Edad Avanzada y Vejez',
    obrera: parseFloat(cuotaObrera.toFixed(2)),
    patronal: parseFloat(cuotaPatronal.toFixed(2)),
    total: parseFloat((cuotaObrera + cuotaPatronal).toFixed(2))
  };
}

/**
 * Calcula cuota de Guarderías y Prestaciones Sociales
 * @param {Object} salarioBase - Datos del salario base
 * @returns {Object} Desglose de cuotas
 */
function calcularGuarderias(salarioBase) {
  const { sbc } = salarioBase;
  
  const cuotaPatronal = sbc * PORCENTAJES_IMSS.guarderias.patronal;
  
  return {
    ramo: 'Guarderías y Prestaciones Sociales',
    obrera: 0,
    patronal: parseFloat(cuotaPatronal.toFixed(2)),
    total: parseFloat(cuotaPatronal.toFixed(2))
  };
}

/**
 * Calcula cuota de Riesgos de Trabajo
 * @param {Object} salarioBase - Datos del salario base
 * @param {number} clase - Clase de riesgo (1-5)
 * @returns {Object} Desglose de cuotas
 */
function calcularRiesgosTrabajo(salarioBase, clase = 1) {
  const { sbc } = salarioBase;
  
  const porcentajes = {
    1: PORCENTAJES_IMSS.riesgosTrabajo.claseI,
    2: PORCENTAJES_IMSS.riesgosTrabajo.claseII,
    3: PORCENTAJES_IMSS.riesgosTrabajo.claseIII,
    4: PORCENTAJES_IMSS.riesgosTrabajo.claseIV,
    5: PORCENTAJES_IMSS.riesgosTrabajo.claseV
  };
  
  const porcentaje = porcentajes[clase] || porcentajes[1];
  const cuotaPatronal = sbc * porcentaje;
  
  return {
    ramo: 'Riesgos de Trabajo',
    clase,
    obrera: 0,
    patronal: parseFloat(cuotaPatronal.toFixed(2)),
    total: parseFloat(cuotaPatronal.toFixed(2))
  };
}

/**
 * Calcula todas las cuotas IMSS para un trabajador
 * @param {number} salarioDiario - Salario diario integrado del trabajador
 * @param {Object} opciones - Opciones de cálculo
 * @returns {Object} Desglose completo de cuotas
 */
export function calcularCuotasIMSS(salarioDiario, opciones = {}) {
  if (!salarioDiario || salarioDiario <= 0) {
    throw new Error('El salario diario debe ser un número positivo');
  }
  
  const { claseRiesgo = 1, diasPeriodo = 30 } = opciones;
  
  if (claseRiesgo < 1 || claseRiesgo > 5) {
    throw new Error('La clase de riesgo debe estar entre 1 y 5');
  }
  
  // Calcular salario base de cotización
  const salarioBase = calcularSalarioBase(salarioDiario);
  
  // Calcular cada ramo
  const enfermedadMat = calcularEnfermedadMaternidad(salarioBase);
  const invalidezVida = calcularInvalidezVida(salarioBase);
  const retiro = calcularRetiro(salarioBase);
  const cesantiaVejez = calcularCesantiaVejez(salarioBase);
  const guarderias = calcularGuarderias(salarioBase);
  const riesgosTrabajo = calcularRiesgosTrabajo(salarioBase, claseRiesgo);
  
  // Totales diarios
  const totalObrerosDiario = 
    enfermedadMat.obrera +
    invalidezVida.obrera +
    retiro.obrera +
    cesantiaVejez.obrera +
    guarderias.obrera +
    riesgosTrabajo.obrera;
  
  const totalPatronalDiario =
    enfermedadMat.patronal +
    invalidezVida.patronal +
    retiro.patronal +
    cesantiaVejez.patronal +
    guarderias.patronal +
    riesgosTrabajo.patronal;
  
  const totalDiario = totalObrerosDiario + totalPatronalDiario;
  
  // Totales por periodo
  const totalObrerosPeriodo = totalObrerosDiario * diasPeriodo;
  const totalPatronalPeriodo = totalPatronalDiario * diasPeriodo;
  const totalPeriodo = totalDiario * diasPeriodo;
  
  return {
    salarioBase: {
      salarioDiario: parseFloat(salarioDiario.toFixed(2)),
      sbc: salarioBase.sbc,
      aplicaTope: salarioBase.aplicaTope
    },
    diasPeriodo,
    claseRiesgo,
    desglosePorRamo: [
      enfermedadMat,
      invalidezVida,
      retiro,
      cesantiaVejez,
      guarderias,
      riesgosTrabajo
    ],
    totalesDiarios: {
      obrera: parseFloat(totalObrerosDiario.toFixed(2)),
      patronal: parseFloat(totalPatronalDiario.toFixed(2)),
      total: parseFloat(totalDiario.toFixed(2))
    },
    totalesPeriodo: {
      obrera: parseFloat(totalObrerosPeriodo.toFixed(2)),
      patronal: parseFloat(totalPatronalPeriodo.toFixed(2)),
      total: parseFloat(totalPeriodo.toFixed(2))
    },
    salarioNeto: {
      diario: parseFloat((salarioDiario - totalObrerosDiario).toFixed(2)),
      periodo: parseFloat((salarioDiario * diasPeriodo - totalObrerosPeriodo).toFixed(2))
    }
  };
}

/**
 * Calcula solo la cuota obrera
 * @param {number} salarioDiario - Salario diario integrado
 * @param {Object} opciones - Opciones de cálculo
 * @returns {Object} Cuota obrera desglosada
 */
export function calcularCuotaObrera(salarioDiario, opciones = {}) {
  const calculo = calcularCuotasIMSS(salarioDiario, opciones);
  
  return {
    salarioDiario: calculo.salarioBase.salarioDiario,
    diasPeriodo: calculo.diasPeriodo,
    cuotaDiaria: calculo.totalesDiarios.obrera,
    cuotaPeriodo: calculo.totalesPeriodo.obrera,
    desglose: calculo.desglosePorRamo.map(ramo => ({
      ramo: ramo.ramo,
      cuota: ramo.obrera
    })).filter(r => r.cuota > 0)
  };
}

/**
 * Calcula solo la cuota patronal
 * @param {number} salarioDiario - Salario diario integrado
 * @param {Object} opciones - Opciones de cálculo
 * @returns {Object} Cuota patronal desglosada
 */
export function calcularCuotaPatronal(salarioDiario, opciones = {}) {
  const calculo = calcularCuotasIMSS(salarioDiario, opciones);
  
  return {
    salarioDiario: calculo.salarioBase.salarioDiario,
    diasPeriodo: calculo.diasPeriodo,
    cuotaDiaria: calculo.totalesDiarios.patronal,
    cuotaPeriodo: calculo.totalesPeriodo.patronal,
    desglose: calculo.desglosePorRamo.map(ramo => ({
      ramo: ramo.ramo,
      cuota: ramo.patronal
    }))
  };
}

/**
 * Calcula el salario neto después de cuotas
 * @param {number} salarioDiario - Salario diario integrado
 * @param {Object} opciones - Opciones de cálculo
 * @returns {Object} Salario neto y descuentos
 */
export function calcularSalarioNeto(salarioDiario, opciones = {}) {
  const { diasPeriodo = 30 } = opciones;
  const calculo = calcularCuotasIMSS(salarioDiario, opciones);
  
  const salarioBruto = salarioDiario * diasPeriodo;
  const descuentos = calculo.totalesPeriodo.obrera;
  const salarioNeto = salarioBruto - descuentos;
  
  return {
    salarioBruto,
    descuentosIMSS: descuentos,
    salarioNeto,
    porcentajeDescuento: parseFloat(((descuentos / salarioBruto) * 100).toFixed(2)),
    diasPeriodo
  };
}

/**
 * Obtiene información de UMA 2024
 * @returns {Object} Valores de UMA
 */
export function obtenerUMA() {
  return {
    año: 2024,
    ...UMA_2024,
    limitesSalario: {
      minimo: SALARIO_MINIMO_2024,
      maximoCotizacion: LIMITE_SUPERIOR_COTIZACION
    }
  };
}

/**
 * Obtiene las tablas de porcentajes IMSS
 * @returns {Object} Porcentajes por ramo
 */
export function obtenerPorcentajesIMSS() {
  return {
    año: 2024,
    ...PORCENTAJES_IMSS
  };
}

/**
 * Calcula cuotas para múltiples trabajadores
 * @param {Array} trabajadores - Array de objetos con salarioDiario y opciones
 * @returns {Array} Resultados de cálculo para cada trabajador
 */
export function calcularCuotasMultiples(trabajadores) {
  if (!Array.isArray(trabajadores)) {
    throw new Error('Se requiere un array de trabajadores');
  }
  
  return trabajadores.map((trabajador, index) => {
    try {
      const { salarioDiario, ...opciones } = trabajador;
      return {
        index,
        ...calcularCuotasIMSS(salarioDiario, opciones)
      };
    } catch (error) {
      return {
        index,
        error: error.message
      };
    }
  });
}

export default {
  calcularCuotasIMSS,
  calcularCuotaObrera,
  calcularCuotaPatronal,
  calcularSalarioNeto,
  obtenerUMA,
  obtenerPorcentajesIMSS,
  calcularCuotasMultiples
};
