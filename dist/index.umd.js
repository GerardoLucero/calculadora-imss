(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.calculadoraImss = {}));
})(this, (function (exports) {
  /**
   * Calculadora de Cuotas IMSS 2026
   * Calcula cuotas obrero-patronales del Instituto Mexicano del Seguro Social
   * Basado en la Ley del Seguro Social (arts. 25, 106, 107, 147, 168 y Segundo transitorio
   * del decreto DOF 16-12-2020), UMA 2026 y salarios mínimos 2026.
   * 
   * @author Gerardo Lucero
   * @version 2.0.0
   */

  // UMA 2026 (INEGI, DOF 09-ene-2026; vigente del 1 de febrero de 2026 al 31 de enero de 2027).
  // Enero de 2026 todavia se rige por la UMA 2025 (diaria 113.14).
  const UMA_2026 = {
    diaria: 117.31,
    mensual: 3566.22,
    anual: 42794.64
  };

  // Salario mínimo diario 2026 (CONASAMI, vigente desde el 1 de enero de 2026)
  const SALARIO_MINIMO_2026 = {
    general: 315.04,
    zonaLibreFronteraNorte: 440.87
  };
  const LIMITE_SUPERIOR_COTIZACION = UMA_2026.diaria * 25; // 25 UMAs

  // Porcentajes de cuotas por ramo
  const PORCENTAJES_IMSS = {
    // Enfermedad y Maternidad (arts. 25, 106 y 107 LSS)
    enfermedadMaternidad: {
      obrera: {
        excedente: 0.40 / 100,
        // 0.40% sobre el excedente de 3 UMAs (art. 106 II)
        dinero: 0.25 / 100,
        // 0.25% prestaciones en dinero (art. 107)
        pensionados: 0.375 / 100 // 0.375% gastos médicos de pensionados (art. 25)
      },
      patronal: {
        cuotaFija: 20.40 / 100,
        // 20.40% de UNA UMA diaria por trabajador (art. 106 I)
        excedente: 1.10 / 100,
        // 1.10% sobre el excedente de 3 UMAs (art. 106 II)
        dinero: 0.70 / 100,
        // 0.70% prestaciones en dinero (art. 107)
        pensionados: 1.05 / 100 // 1.05% gastos médicos de pensionados (art. 25)
      }
    },
    // Invalidez y Vida (art. 147)
    invalidezVida: {
      obrera: 0.625 / 100,
      patronal: 1.75 / 100
    },
    // Retiro, Cesantía y Vejez
    retiro: {
      patronal: 2.00 / 100 // 2% solo patronal
    },
    cesantiaVejez: {
      obrera: 1.125 / 100 // 1.125% (art. 168 II b)
      // La cuota patronal depende del salario base de cotización: ver CESANTIA_VEJEZ_PATRONAL_2026
    },
    // Guarderías y Prestaciones Sociales
    guarderias: {
      patronal: 1.00 / 100 // 1% solo patronal
    },
    // Riesgos de Trabajo (prima media por clase; la real depende de la siniestralidad de cada patrón)
    riesgosTrabajo: {
      claseI: 0.54355 / 100,
      // Mínima
      claseII: 1.13065 / 100,
      // Baja
      claseIII: 2.59840 / 100,
      // Media
      claseIV: 4.65325 / 100,
      // Alta
      claseV: 7.58875 / 100 // Máxima
    }
  };

  // Cuota patronal de Cesantía en edad avanzada y Vejez aplicable en 2026.
  // La reforma de pensiones (DOF 16-12-2020, art. 168 II a y Segundo transitorio) la sube cada año
  // de 2023 a 2030 hasta la tabla final del art. 168 (3.150% a 11.875%). Los topes son multiplos de la UMA
  // diaria, salvo el primer renglon (1.00 SM).
  const CESANTIA_VEJEZ_PATRONAL_2026 = [{
    descripcion: '1.00 SM',
    hastaUMA: null,
    tasa: 3.150 / 100
  }, {
    descripcion: '1.01 SM a 1.50 UMA',
    hastaUMA: 1.5,
    tasa: 3.676 / 100
  }, {
    descripcion: '1.51 a 2.00 UMA',
    hastaUMA: 2.0,
    tasa: 4.851 / 100
  }, {
    descripcion: '2.01 a 2.50 UMA',
    hastaUMA: 2.5,
    tasa: 5.556 / 100
  }, {
    descripcion: '2.51 a 3.00 UMA',
    hastaUMA: 3.0,
    tasa: 6.026 / 100
  }, {
    descripcion: '3.01 a 3.50 UMA',
    hastaUMA: 3.5,
    tasa: 6.361 / 100
  }, {
    descripcion: '3.51 a 4.00 UMA',
    hastaUMA: 4.0,
    tasa: 6.613 / 100
  }, {
    descripcion: '4.01 UMA en adelante',
    hastaUMA: Infinity,
    tasa: 7.513 / 100
  }];

  /**
   * Tasa patronal de cesantía y vejez para un salario base de cotización.
   * Con un SBC igual al salario mínimo aplica el primer renglon; arriba de eso se ubica por multiplos de UMA.
   */
  function tasaCesantiaPatronal(sbc, salarioMinimo) {
    if (sbc <= salarioMinimo) return CESANTIA_VEJEZ_PATRONAL_2026[0];
    const veces = sbc / UMA_2026.diaria;
    return CESANTIA_VEJEZ_PATRONAL_2026.slice(1).find(r => veces <= r.hastaUMA);
  }

  /**
   * Calcula el salario base de cotización
   * @param {number} salarioDiario - Salario diario del trabajador
   * @returns {Object} Salario base y topes
   */
  function calcularSalarioBase(salarioDiario, zonaFronteriza = false) {
    // El SBC no puede ser menor al salario mínimo ni mayor a 25 UMAs
    const sbcMinimo = zonaFronteriza ? SALARIO_MINIMO_2026.zonaLibreFronteraNorte : SALARIO_MINIMO_2026.general;
    const sbcMaximo = LIMITE_SUPERIOR_COTIZACION;
    const sbc = Math.max(sbcMinimo, Math.min(salarioDiario, sbcMaximo));
    const treUMAs = UMA_2026.diaria * 3;
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
    const {
      sbc,
      excedente
    } = salarioBase;
    const p = PORCENTAJES_IMSS.enfermedadMaternidad;

    // Cuota Obrera
    const obreraExcedente = excedente * p.obrera.excedente;
    const obreraDinero = sbc * p.obrera.dinero;
    const obreraPensionados = sbc * p.obrera.pensionados;
    const cuotaObrera = obreraExcedente + obreraDinero + obreraPensionados;

    // Cuota Patronal: la cuota fija es un porcentaje de UNA UMA, no del salario
    const patronalCuotaFija = UMA_2026.diaria * p.patronal.cuotaFija;
    const patronalExcedente = excedente * p.patronal.excedente;
    const patronalDinero = sbc * p.patronal.dinero;
    const patronalPensionados = sbc * p.patronal.pensionados;
    const cuotaPatronal = patronalCuotaFija + patronalExcedente + patronalDinero + patronalPensionados;
    return {
      ramo: 'Enfermedad y Maternidad',
      obrera: parseFloat(cuotaObrera.toFixed(2)),
      patronal: parseFloat(cuotaPatronal.toFixed(2)),
      total: parseFloat((cuotaObrera + cuotaPatronal).toFixed(2)),
      desglose: {
        obrera: {
          excedente: parseFloat(obreraExcedente.toFixed(2)),
          dinero: parseFloat(obreraDinero.toFixed(2)),
          pensionados: parseFloat(obreraPensionados.toFixed(2))
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
    const {
      sbc
    } = salarioBase;
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
    const {
      sbc
    } = salarioBase;
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
    const {
      sbc,
      sbcMinimo
    } = salarioBase;
    const renglon = tasaCesantiaPatronal(sbc, sbcMinimo);
    const cuotaObrera = sbc * PORCENTAJES_IMSS.cesantiaVejez.obrera;
    const cuotaPatronal = sbc * renglon.tasa;
    return {
      ramo: 'Cesantía en Edad Avanzada y Vejez',
      obrera: parseFloat(cuotaObrera.toFixed(2)),
      patronal: parseFloat(cuotaPatronal.toFixed(2)),
      total: parseFloat((cuotaObrera + cuotaPatronal).toFixed(2)),
      tasaPatronal: parseFloat((renglon.tasa * 100).toFixed(3)),
      rangoPatronal: renglon.descripcion
    };
  }

  /**
   * Calcula cuota de Guarderías y Prestaciones Sociales
   * @param {Object} salarioBase - Datos del salario base
   * @returns {Object} Desglose de cuotas
   */
  function calcularGuarderias(salarioBase) {
    const {
      sbc
    } = salarioBase;
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
    const {
      sbc
    } = salarioBase;
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
  function calcularCuotasIMSS(salarioDiario, opciones = {}) {
    if (!salarioDiario || salarioDiario <= 0) {
      throw new Error('El salario diario debe ser un número positivo');
    }
    const {
      claseRiesgo = 1,
      diasPeriodo = 30,
      zonaFronteriza = false
    } = opciones;
    if (claseRiesgo < 1 || claseRiesgo > 5) {
      throw new Error('La clase de riesgo debe estar entre 1 y 5');
    }

    // Calcular salario base de cotización
    const salarioBase = calcularSalarioBase(salarioDiario, zonaFronteriza);

    // Calcular cada ramo
    const enfermedadMat = calcularEnfermedadMaternidad(salarioBase);
    const invalidezVida = calcularInvalidezVida(salarioBase);
    const retiro = calcularRetiro(salarioBase);
    const cesantiaVejez = calcularCesantiaVejez(salarioBase);
    const guarderias = calcularGuarderias(salarioBase);
    const riesgosTrabajo = calcularRiesgosTrabajo(salarioBase, claseRiesgo);

    // Totales diarios
    const totalObrerosDiario = enfermedadMat.obrera + invalidezVida.obrera + retiro.obrera + cesantiaVejez.obrera + guarderias.obrera + riesgosTrabajo.obrera;
    const totalPatronalDiario = enfermedadMat.patronal + invalidezVida.patronal + retiro.patronal + cesantiaVejez.patronal + guarderias.patronal + riesgosTrabajo.patronal;
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
      desglosePorRamo: [enfermedadMat, invalidezVida, retiro, cesantiaVejez, guarderias, riesgosTrabajo],
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
  function calcularCuotaObrera(salarioDiario, opciones = {}) {
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
  function calcularCuotaPatronal(salarioDiario, opciones = {}) {
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
  function calcularSalarioNeto(salarioDiario, opciones = {}) {
    const {
      diasPeriodo = 30
    } = opciones;
    const calculo = calcularCuotasIMSS(salarioDiario, opciones);
    const salarioBruto = salarioDiario * diasPeriodo;
    const descuentos = calculo.totalesPeriodo.obrera;
    const salarioNeto = salarioBruto - descuentos;
    return {
      salarioBruto,
      descuentosIMSS: descuentos,
      salarioNeto,
      porcentajeDescuento: parseFloat((descuentos / salarioBruto * 100).toFixed(2)),
      diasPeriodo
    };
  }

  /**
   * Obtiene información de UMA 2026
   * @returns {Object} Valores de UMA
   */
  function obtenerUMA() {
    return {
      año: 2026,
      ...UMA_2026,
      limitesSalario: {
        minimo: SALARIO_MINIMO_2026.general,
        minimoZonaFronteriza: SALARIO_MINIMO_2026.zonaLibreFronteraNorte,
        maximoCotizacion: LIMITE_SUPERIOR_COTIZACION
      }
    };
  }

  /**
   * Obtiene las tablas de porcentajes IMSS
   * @returns {Object} Porcentajes por ramo
   */
  function obtenerPorcentajesIMSS() {
    return {
      año: 2026,
      ...PORCENTAJES_IMSS,
      cesantiaVejezPatronal: CESANTIA_VEJEZ_PATRONAL_2026
    };
  }

  /**
   * Calcula cuotas para múltiples trabajadores
   * @param {Array} trabajadores - Array de objetos con salarioDiario y opciones
   * @returns {Array} Resultados de cálculo para cada trabajador
   */
  function calcularCuotasMultiples(trabajadores) {
    if (!Array.isArray(trabajadores)) {
      throw new Error('Se requiere un array de trabajadores');
    }
    return trabajadores.map((trabajador, index) => {
      try {
        const {
          salarioDiario,
          ...opciones
        } = trabajador;
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
  var index = {
    calcularCuotasIMSS,
    calcularCuotaObrera,
    calcularCuotaPatronal,
    calcularSalarioNeto,
    obtenerUMA,
    obtenerPorcentajesIMSS,
    calcularCuotasMultiples
  };

  exports.calcularCuotaObrera = calcularCuotaObrera;
  exports.calcularCuotaPatronal = calcularCuotaPatronal;
  exports.calcularCuotasIMSS = calcularCuotasIMSS;
  exports.calcularCuotasMultiples = calcularCuotasMultiples;
  exports.calcularSalarioNeto = calcularSalarioNeto;
  exports["default"] = index;
  exports.obtenerPorcentajesIMSS = obtenerPorcentajesIMSS;
  exports.obtenerUMA = obtenerUMA;

}));
//# sourceMappingURL=index.umd.js.map
