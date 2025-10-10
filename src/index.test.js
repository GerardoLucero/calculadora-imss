/**
 * Tests para Calculadora de Cuotas IMSS
 */

import {
  calcularCuotasIMSS,
  calcularCuotaObrera,
  calcularCuotaPatronal,
  calcularSalarioNeto,
  obtenerUMA,
  obtenerPorcentajesIMSS,
  calcularCuotasMultiples
} from './index.js';

describe('Calculadora de Cuotas IMSS', () => {
  
  describe('calcularCuotasIMSS', () => {
    it('debe calcular cuotas correctamente para salario de $500 diarios', () => {
      const resultado = calcularCuotasIMSS(500);
      
      expect(resultado).toHaveProperty('salarioBase');
      expect(resultado).toHaveProperty('diasPeriodo');
      expect(resultado).toHaveProperty('claseRiesgo');
      expect(resultado).toHaveProperty('desglosePorRamo');
      expect(resultado).toHaveProperty('totalesDiarios');
      expect(resultado).toHaveProperty('totalesPeriodo');
      expect(resultado).toHaveProperty('salarioNeto');
      
      expect(resultado.salarioBase.salarioDiario).toBe(500);
      expect(resultado.diasPeriodo).toBe(30);
      expect(resultado.desglosePorRamo).toHaveLength(6);
    });
    
    it('debe validar que el salario sea positivo', () => {
      expect(() => calcularCuotasIMSS(0)).toThrow('El salario diario debe ser un número positivo');
      expect(() => calcularCuotasIMSS(-100)).toThrow('El salario diario debe ser un número positivo');
      expect(() => calcularCuotasIMSS(null)).toThrow('El salario diario debe ser un número positivo');
    });
    
    it('debe validar la clase de riesgo', () => {
      expect(() => calcularCuotasIMSS(500, { claseRiesgo: 0 })).toThrow('La clase de riesgo debe estar entre 1 y 5');
      expect(() => calcularCuotasIMSS(500, { claseRiesgo: 6 })).toThrow('La clase de riesgo debe estar entre 1 y 5');
    });
    
    it('debe aplicar tope de 25 UMAs', () => {
      const uma = 108.57;
      const salarioAlto = uma * 30; // 30 UMAs
      const resultado = calcularCuotasIMSS(salarioAlto);
      
      expect(resultado.salarioBase.aplicaTope).toBe(true);
      expect(resultado.salarioBase.sbc).toBe(uma * 25); // Tope a 25 UMAs
    });
    
    it('debe aplicar salario mínimo si es menor', () => {
      const resultado = calcularCuotasIMSS(100); // Menos del mínimo
      
      expect(resultado.salarioBase.sbc).toBeGreaterThanOrEqual(248.93);
    });
    
    it('debe calcular para diferentes clases de riesgo', () => {
      const salario = 500;
      
      const clase1 = calcularCuotasIMSS(salario, { claseRiesgo: 1 });
      const clase5 = calcularCuotasIMSS(salario, { claseRiesgo: 5 });
      
      // Clase 5 debe tener mayor cuota patronal por riesgos
      const riesgo1 = clase1.desglosePorRamo.find(r => r.ramo === 'Riesgos de Trabajo');
      const riesgo5 = clase5.desglosePorRamo.find(r => r.ramo === 'Riesgos de Trabajo');
      
      expect(riesgo5.patronal).toBeGreaterThan(riesgo1.patronal);
    });
    
    it('debe calcular para diferentes periodos', () => {
      const salario = 500;
      
      const periodo15 = calcularCuotasIMSS(salario, { diasPeriodo: 15 });
      const periodo30 = calcularCuotasIMSS(salario, { diasPeriodo: 30 });
      
      expect(periodo30.totalesPeriodo.total).toBe(periodo15.totalesPeriodo.total * 2);
    });
    
    it('debe incluir todos los 6 ramos', () => {
      const resultado = calcularCuotasIMSS(500);
      
      const ramosEsperados = [
        'Enfermedad y Maternidad',
        'Invalidez y Vida',
        'Retiro',
        'Cesantía en Edad Avanzada y Vejez',
        'Guarderías y Prestaciones Sociales',
        'Riesgos de Trabajo'
      ];
      
      const ramosCalculados = resultado.desglosePorRamo.map(r => r.ramo);
      
      ramosEsperados.forEach(ramo => {
        expect(ramosCalculados).toContain(ramo);
      });
    });
    
    it('los totales deben ser la suma de cuotas obreras y patronales', () => {
      const resultado = calcularCuotasIMSS(500);
      
      const sumaObreras = resultado.desglosePorRamo.reduce((sum, ramo) => sum + ramo.obrera, 0);
      const sumaPatronales = resultado.desglosePorRamo.reduce((sum, ramo) => sum + ramo.patronal, 0);
      
      expect(resultado.totalesDiarios.obrera).toBeCloseTo(sumaObreras, 2);
      expect(resultado.totalesDiarios.patronal).toBeCloseTo(sumaPatronales, 2);
      expect(resultado.totalesDiarios.total).toBeCloseTo(sumaObreras + sumaPatronales, 2);
    });
  });
  
  describe('calcularCuotaObrera', () => {
    it('debe calcular solo la cuota obrera', () => {
      const resultado = calcularCuotaObrera(500);
      
      expect(resultado).toHaveProperty('cuotaDiaria');
      expect(resultado).toHaveProperty('cuotaPeriodo');
      expect(resultado).toHaveProperty('desglose');
      
      expect(resultado.cuotaDiaria).toBeGreaterThan(0);
      expect(resultado.cuotaPeriodo).toBe(resultado.cuotaDiaria * 30);
    });
    
    it('debe incluir solo ramos con cuota obrera', () => {
      const resultado = calcularCuotaObrera(500);
      
      // Retiro y Guarderías no tienen cuota obrera
      const tieneRetiro = resultado.desglose.some(r => r.ramo === 'Retiro');
      const tieneGuarderias = resultado.desglose.some(r => r.ramo === 'Guarderías y Prestaciones Sociales');
      
      expect(tieneRetiro).toBe(false);
      expect(tieneGuarderias).toBe(false);
    });
    
    it('debe tener cuotas para Enfermedad, Invalidez y Cesantía', () => {
      const resultado = calcularCuotaObrera(500);
      
      const tieneEnfermedad = resultado.desglose.some(r => r.ramo.includes('Enfermedad'));
      const tieneInvalidez = resultado.desglose.some(r => r.ramo.includes('Invalidez'));
      const tieneCesantia = resultado.desglose.some(r => r.ramo.includes('Cesantía'));
      
      expect(tieneEnfermedad).toBe(true);
      expect(tieneInvalidez).toBe(true);
      expect(tieneCesantia).toBe(true);
    });
  });
  
  describe('calcularCuotaPatronal', () => {
    it('debe calcular solo la cuota patronal', () => {
      const resultado = calcularCuotaPatronal(500);
      
      expect(resultado).toHaveProperty('cuotaDiaria');
      expect(resultado).toHaveProperty('cuotaPeriodo');
      expect(resultado).toHaveProperty('desglose');
      
      expect(resultado.cuotaDiaria).toBeGreaterThan(0);
      expect(resultado.cuotaPeriodo).toBe(resultado.cuotaDiaria * 30);
    });
    
    it('debe incluir todos los 6 ramos', () => {
      const resultado = calcularCuotaPatronal(500);
      
      expect(resultado.desglose).toHaveLength(6);
      
      const ramosEsperados = [
        'Enfermedad y Maternidad',
        'Invalidez y Vida',
        'Retiro',
        'Cesantía en Edad Avanzada y Vejez',
        'Guarderías y Prestaciones Sociales',
        'Riesgos de Trabajo'
      ];
      
      const ramosCalculados = resultado.desglose.map(r => r.ramo);
      
      ramosEsperados.forEach(ramo => {
        expect(ramosCalculados).toContain(ramo);
      });
    });
    
    it('la cuota patronal debe ser mayor que la obrera', () => {
      const salario = 500;
      const obrera = calcularCuotaObrera(salario);
      const patronal = calcularCuotaPatronal(salario);
      
      expect(patronal.cuotaDiaria).toBeGreaterThan(obrera.cuotaDiaria);
    });
  });
  
  describe('calcularSalarioNeto', () => {
    it('debe calcular el salario neto correctamente', () => {
      const salarioDiario = 500;
      const diasPeriodo = 30;
      const resultado = calcularSalarioNeto(salarioDiario, { diasPeriodo });
      
      expect(resultado).toHaveProperty('salarioBruto');
      expect(resultado).toHaveProperty('descuentosIMSS');
      expect(resultado).toHaveProperty('salarioNeto');
      expect(resultado).toHaveProperty('porcentajeDescuento');
      
      expect(resultado.salarioBruto).toBe(salarioDiario * diasPeriodo);
      expect(resultado.salarioNeto).toBe(resultado.salarioBruto - resultado.descuentosIMSS);
      expect(resultado.salarioNeto).toBeLessThan(resultado.salarioBruto);
    });
    
    it('el porcentaje de descuento debe ser razonable (< 10%)', () => {
      const resultado = calcularSalarioNeto(500);
      
      expect(resultado.porcentajeDescuento).toBeGreaterThan(0);
      expect(resultado.porcentajeDescuento).toBeLessThan(10);
    });
    
    it('debe calcular para diferentes periodos', () => {
      const resultado15 = calcularSalarioNeto(500, { diasPeriodo: 15 });
      const resultado30 = calcularSalarioNeto(500, { diasPeriodo: 30 });
      
      expect(resultado30.salarioBruto).toBe(resultado15.salarioBruto * 2);
      expect(resultado30.descuentosIMSS).toBeCloseTo(resultado15.descuentosIMSS * 2, 1);
    });
  });
  
  describe('obtenerUMA', () => {
    it('debe retornar valores de UMA 2024', () => {
      const uma = obtenerUMA();
      
      expect(uma).toHaveProperty('año');
      expect(uma).toHaveProperty('diaria');
      expect(uma).toHaveProperty('mensual');
      expect(uma).toHaveProperty('anual');
      expect(uma).toHaveProperty('limitesSalario');
      
      expect(uma.año).toBe(2024);
      expect(uma.diaria).toBe(108.57);
      expect(uma.mensual).toBe(3297.57);
      expect(uma.anual).toBe(39570.84);
    });
    
    it('debe incluir límites de salario', () => {
      const uma = obtenerUMA();
      
      expect(uma.limitesSalario).toHaveProperty('minimo');
      expect(uma.limitesSalario).toHaveProperty('maximoCotizacion');
      expect(uma.limitesSalario.maximoCotizacion).toBe(uma.diaria * 25);
    });
  });

  describe('obtenerPorcentajesIMSS', () => {
    it('debe retornar todos los porcentajes', () => {
      const porcentajes = obtenerPorcentajesIMSS();
      
      expect(porcentajes).toHaveProperty('año');
      expect(porcentajes).toHaveProperty('enfermedadMaternidad');
      expect(porcentajes).toHaveProperty('invalidezVida');
      expect(porcentajes).toHaveProperty('retiro');
      expect(porcentajes).toHaveProperty('cesantiaVejez');
      expect(porcentajes).toHaveProperty('guarderias');
      expect(porcentajes).toHaveProperty('riesgosTrabajo');
      
      expect(porcentajes.año).toBe(2024);
    });
    
    it('debe incluir 5 clases de riesgo', () => {
      const porcentajes = obtenerPorcentajesIMSS();
      
      expect(porcentajes.riesgosTrabajo).toHaveProperty('claseI');
      expect(porcentajes.riesgosTrabajo).toHaveProperty('claseII');
      expect(porcentajes.riesgosTrabajo).toHaveProperty('claseIII');
      expect(porcentajes.riesgosTrabajo).toHaveProperty('claseIV');
      expect(porcentajes.riesgosTrabajo).toHaveProperty('claseV');
      
      // Clase V debe ser mayor que Clase I
      expect(porcentajes.riesgosTrabajo.claseV).toBeGreaterThan(porcentajes.riesgosTrabajo.claseI);
    });
  });

  describe('calcularCuotasMultiples', () => {
    it('debe calcular cuotas para múltiples trabajadores', () => {
      const trabajadores = [
        { salarioDiario: 300 },
        { salarioDiario: 500 },
        { salarioDiario: 1000 }
      ];
      
      const resultados = calcularCuotasMultiples(trabajadores);
      
      expect(Array.isArray(resultados)).toBe(true);
      expect(resultados).toHaveLength(3);
      
      resultados.forEach((resultado, index) => {
        expect(resultado).toHaveProperty('index');
        expect(resultado.index).toBe(index);
        expect(resultado).toHaveProperty('totalesDiarios');
      });
    });
    
    it('debe manejar errores en trabajadores individuales', () => {
      const trabajadores = [
        { salarioDiario: 500 },
        { salarioDiario: -100 }, // Inválido
        { salarioDiario: 800 }
      ];
      
      const resultados = calcularCuotasMultiples(trabajadores);
      
      expect(resultados[0]).not.toHaveProperty('error');
      expect(resultados[1]).toHaveProperty('error');
      expect(resultados[2]).not.toHaveProperty('error');
    });
    
    it('debe lanzar error si no es un array', () => {
      expect(() => calcularCuotasMultiples(500)).toThrow('Se requiere un array de trabajadores');
      expect(() => calcularCuotasMultiples(null)).toThrow('Se requiere un array de trabajadores');
    });
    
    it('debe aplicar opciones específicas a cada trabajador', () => {
      const trabajadores = [
        { salarioDiario: 500, claseRiesgo: 1 },
        { salarioDiario: 500, claseRiesgo: 5 }
      ];
      
      const resultados = calcularCuotasMultiples(trabajadores);
      
      expect(resultados[0].claseRiesgo).toBe(1);
      expect(resultados[1].claseRiesgo).toBe(5);
      
      // Las cuotas deben ser diferentes
      expect(resultados[1].totalesDiarios.patronal).toBeGreaterThan(resultados[0].totalesDiarios.patronal);
    });
  });
  
  describe('Validaciones de rangos', () => {
    it('las cuotas deben estar en rangos esperados para salario típico', () => {
      const resultado = calcularCuotasIMSS(500, { diasPeriodo: 30 });
      
      // La cuota obrera suele ser 2-4% del salario
      const porcentajeObrero = (resultado.totalesPeriodo.obrera / (500 * 30)) * 100;
      expect(porcentajeObrero).toBeGreaterThan(1);
      expect(porcentajeObrero).toBeLessThan(5);
      
      // La cuota patronal suele ser 20-30% del salario
      const porcentajePatronal = (resultado.totalesPeriodo.patronal / (500 * 30)) * 100;
      expect(porcentajePatronal).toBeGreaterThan(15);
      expect(porcentajePatronal).toBeLessThan(35);
    });
    
    it('todas las cuotas deben ser números positivos', () => {
      const resultado = calcularCuotasIMSS(500);
      
      expect(resultado.totalesDiarios.obrera).toBeGreaterThan(0);
      expect(resultado.totalesDiarios.patronal).toBeGreaterThan(0);
      expect(resultado.totalesDiarios.total).toBeGreaterThan(0);
      
      resultado.desglosePorRamo.forEach(ramo => {
        expect(ramo.obrera).toBeGreaterThanOrEqual(0);
        expect(ramo.patronal).toBeGreaterThan(0); // Al menos patronal siempre tiene cuota
        expect(ramo.total).toBeGreaterThan(0);
      });
    });
  });
  
  describe('Casos de uso reales', () => {
    it('debe calcular correctamente para salario mínimo', () => {
      const resultado = calcularCuotasIMSS(248.93, { diasPeriodo: 30 });
      
      expect(resultado.salarioBase.salarioDiario).toBe(248.93);
      expect(resultado.totalesPeriodo.obrera).toBeGreaterThan(0);
      expect(resultado.totalesPeriodo.patronal).toBeGreaterThan(0);
    });
    
    it('debe calcular correctamente para salario medio (10k mensual)', () => {
      const salarioDiario = 10000 / 30;
      const resultado = calcularCuotasIMSS(salarioDiario, { diasPeriodo: 30 });
      
      expect(resultado.totalesPeriodo.obrera).toBeGreaterThan(0);
      expect(resultado.totalesPeriodo.patronal).toBeGreaterThan(0);
      expect(resultado.salarioNeto.periodo).toBeLessThan(10000);
    });
    
    it('debe calcular correctamente para salario alto (30k mensual)', () => {
      const salarioDiario = 30000 / 30;
      const resultado = calcularCuotasIMSS(salarioDiario, { diasPeriodo: 30 });
      
      expect(resultado.totalesPeriodo.obrera).toBeGreaterThan(0);
      expect(resultado.totalesPeriodo.patronal).toBeGreaterThan(0);
    });
    
    it('debe calcular para quincena (15 días)', () => {
      const resultado = calcularCuotasIMSS(500, { diasPeriodo: 15 });
      
      expect(resultado.diasPeriodo).toBe(15);
      expect(resultado.totalesPeriodo.obrera).toBeGreaterThan(0);
      expect(resultado.totalesPeriodo.patronal).toBeGreaterThan(0);
    });
  });
  
  describe('Precisión de cálculos', () => {
    it('los valores deben tener máximo 2 decimales', () => {
      const resultado = calcularCuotasIMSS(500.55);
      
      const verificarDecimales = (valor) => {
        const decimales = valor.toString().split('.')[1];
        return !decimales || decimales.length <= 2;
      };
      
      expect(verificarDecimales(resultado.totalesDiarios.obrera)).toBe(true);
      expect(verificarDecimales(resultado.totalesDiarios.patronal)).toBe(true);
      expect(verificarDecimales(resultado.totalesDiarios.total)).toBe(true);
      
      resultado.desglosePorRamo.forEach(ramo => {
        expect(verificarDecimales(ramo.obrera)).toBe(true);
        expect(verificarDecimales(ramo.patronal)).toBe(true);
        expect(verificarDecimales(ramo.total)).toBe(true);
      });
    });
    
    it('debe ser consistente en múltiples cálculos', () => {
      const resultado1 = calcularCuotasIMSS(500);
      const resultado2 = calcularCuotasIMSS(500);
      
      expect(resultado1.totalesDiarios.obrera).toBe(resultado2.totalesDiarios.obrera);
      expect(resultado1.totalesDiarios.patronal).toBe(resultado2.totalesDiarios.patronal);
      expect(resultado1.totalesDiarios.total).toBe(resultado2.totalesDiarios.total);
    });
  });

  describe('Integración completa', () => {
    it('debe generar un reporte completo de nómina', () => {
      const salarioDiario = 600;
      const resultado = calcularCuotasIMSS(salarioDiario, {
        claseRiesgo: 2,
        diasPeriodo: 30
      });
      
      // Verificar estructura completa
      expect(resultado.salarioBase.salarioDiario).toBe(600);
      expect(resultado.claseRiesgo).toBe(2);
      expect(resultado.diasPeriodo).toBe(30);
      
      // Verificar que todos los totales sean coherentes
      const totalCalculado = resultado.totalesDiarios.obrera + resultado.totalesDiarios.patronal;
      expect(resultado.totalesDiarios.total).toBeCloseTo(totalCalculado, 2);
      
      // Verificar salario neto
      expect(resultado.salarioNeto.diario).toBe(salarioDiario - resultado.totalesDiarios.obrera);
      expect(resultado.salarioNeto.periodo).toBe(resultado.salarioNeto.diario * 30);
    });
  });
});
