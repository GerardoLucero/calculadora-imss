# calculadora-imss

Librería moderna para calcular cuotas obrero-patronales del IMSS (Instituto Mexicano del Seguro Social) con UMA, salarios mínimos y cuotas de 2026, siguiendo la Ley del Seguro Social.

[![npm version](https://badge.fury.io/js/calculadora-imss.svg)](https://badge.fury.io/js/calculadora-imss)
[![npm downloads](https://img.shields.io/npm/dm/calculadora-imss.svg)](https://www.npmjs.com/package/calculadora-imss)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CI](https://github.com/GerardoLucero/calculadora-imss/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/GerardoLucero/calculadora-imss/actions/workflows/ci-cd.yml)

## Features

- **Datos 2026** — UMA, salario mínimo y cuota patronal de cesantía y vejez por rango (reforma de pensiones)
- **6 ramos completos** — Enfermedad, Invalidez, Retiro, Cesantía, Guarderías, Riesgos
- **Cuotas obrera y patronal** — cálculo separado y total
- **5 clases de riesgo** — desde mínima hasta máxima
- **Salario neto** — calcula descuentos y neto
- **Múltiples trabajadores** — procesa lotes de nómina
- **TypeScript ready** — incluye definiciones de tipos
- **Zero dependencies** — solo dayjs
- **Cobertura de tests > 85%**

## Instalación

```bash
npm install calculadora-imss
```

## Uso

### Ejemplo básico

```javascript
import { calcularCuotasIMSS } from 'calculadora-imss';

// Calcular cuotas para salario de $500 diarios
const cuotas = calcularCuotasIMSS(500);

console.log(cuotas);
/*
{
  salarioBase: { salarioDiario: 500, sbc: 500, aplicaTope: false },
  diasPeriodo: 30,
  claseRiesgo: 1,
  desglosePorRamo: [
    { ramo: 'Enfermedad y Maternidad', obrera: 3.72, patronal: 34.31, total: 38.03 },
    { ramo: 'Invalidez y Vida', obrera: 3.13, patronal: 8.75, total: 11.88 },
    { ramo: 'Retiro', obrera: 0, patronal: 10.00, total: 10.00 },
    { ramo: 'Cesantía en Edad Avanzada y Vejez', obrera: 5.63, patronal: 37.56, total: 43.19, tasaPatronal: 7.513 },
    { ramo: 'Guarderías y Prestaciones Sociales', obrera: 0, patronal: 5.00, total: 5.00 },
    { ramo: 'Riesgos de Trabajo', obrera: 0, patronal: 2.72, total: 2.72 }
  ],
  totalesPeriodo: { obrera: 374.40, patronal: 2950.20, total: 3324.60 },
  salarioNeto: { diario: 487.52, periodo: 14625.60 }
}
*/
```

### Cuota obrera

```javascript
import { calcularCuotaObrera } from 'calculadora-imss';
const cuotaObrera = calcularCuotaObrera(500);
```

### Cuota patronal con clase de riesgo

```javascript
import { calcularCuotaPatronal } from 'calculadora-imss';
const cuotaPatronal = calcularCuotaPatronal(500, { claseRiesgo: 2 });
```

### Salario neto

```javascript
import { calcularSalarioNeto } from 'calculadora-imss';
const salarioNeto = calcularSalarioNeto(500, { diasPeriodo: 15 });
// { salarioBruto: 7500, descuentosIMSS: 169.95, salarioNeto: 7330.05, ... }
```

### Nómina de múltiples trabajadores

```javascript
import { calcularCuotasMultiples } from 'calculadora-imss';

const trabajadores = [
  { salarioDiario: 300, claseRiesgo: 1 },
  { salarioDiario: 500, claseRiesgo: 2 },
  { salarioDiario: 800, claseRiesgo: 1 }
];

const resultados = calcularCuotasMultiples(trabajadores);
```

## API

| Función | Descripción |
|---------|-------------|
| `calcularCuotasIMSS(salarioDiario, opciones)` | Calcula todas las cuotas IMSS (obrera + patronal) |
| `calcularCuotaObrera(salarioDiario, opciones)` | Calcula solo la cuota del trabajador |
| `calcularCuotaPatronal(salarioDiario, opciones)` | Calcula solo la cuota del patrón |
| `calcularSalarioNeto(salarioDiario, opciones)` | Calcula el salario neto después de descuentos |
| `calcularCuotasMultiples(trabajadores)` | Calcula cuotas para múltiples trabajadores |
| `obtenerUMA()` | Retorna los valores de UMA y salario mínimo 2026 |
| `obtenerPorcentajesIMSS()` | Retorna las tablas de porcentajes IMSS 2026 |

**Opciones comunes:**
- `claseRiesgo` (number, 1-5): clase de riesgo de trabajo. Default: 1
- `diasPeriodo` (number): días del periodo de pago. Default: 30

## Ramos del IMSS

| Ramo | Obrera | Patronal |
|------|--------|----------|
| Enfermedad y Maternidad, cuota fija | — | 20.40% de **una** UMA diaria por trabajador |
| Enfermedad y Maternidad, excedente de 3 UMA | 0.40% | 1.10% |
| Prestaciones en dinero | 0.25% | 0.70% |
| Gastos médicos de pensionados | 0.375% | 1.05% |
| Invalidez y Vida | 0.625% | 1.75% |
| Retiro | — | 2.00% |
| Cesantía y Vejez | 1.125% | Según rango de salario (ver abajo) |
| Guarderías | — | 1.00% |
| Riesgos de Trabajo | — | Variable por clase |

### Cesantía y vejez patronal en 2026

La reforma de pensiones (DOF 16-12-2020) sube cada año la cuota patronal hasta 2030. Para 2026:

| Salario base de cotización | Cuota patronal |
|---|---|
| 1.00 SM | 3.150% |
| 1.01 SM a 1.50 UMA | 3.676% |
| 1.51 a 2.00 UMA | 4.851% |
| 2.01 a 2.50 UMA | 5.556% |
| 2.51 a 3.00 UMA | 6.026% |
| 3.01 a 3.50 UMA | 6.361% |
| 3.51 a 4.00 UMA | 6.613% |
| 4.01 UMA en adelante | 7.513% |

Con el salario mínimo de 2026 ($315.04, más de 2.6 UMA), un SBC igual al mínimo paga 3.150% y uno apenas superior cae en el rango de su múltiplo de UMA.

## Clases de riesgo

| Clase | Tipo | Ejemplos |
|-------|------|----------|
| I | Mínima | Oficinas, comercio al por menor |
| II | Baja | Industria ligera, servicios |
| III | Media | Construcción, manufactura |
| IV | Alta | Química, transporte de carga |
| V | Máxima | Minería, explosivos, trabajos subterráneos |

## Valores de referencia 2026

- **UMA Diaria**: $117.31 (vigente desde el 1 de febrero de 2026; enero usa la UMA 2025)
- **UMA Mensual**: $3,566.22
- **Salario Mínimo**: $315.04 diario (zona libre de la frontera norte: $440.87, opción `zonaFronteriza: true`)
- **Tope de Cotización**: $2,932.75 (25 UMAs diarias)

## Notas importantes

- Cálculos basados en la Ley del Seguro Social y en los valores vigentes en 2026. Es una ayuda de cálculo: las primas de riesgo de trabajo reales dependen de la siniestralidad de cada patrón.
- No incluye INFONAVIT (5%) ni impuestos locales sobre nómina.
- La tabla de cesantía y vejez 2026 sigue la gradualidad del Segundo transitorio del decreto; el valor final de 2030 (tabla del art. 168) está en el DOF.

## Referencias

- [Ley del Seguro Social](http://www.imss.gob.mx/conoce-al-imss/ley-del-seguro-social)
- [UMA — INEGI](https://www.inegi.org.mx/temas/uma/)

## Apoyo

Proyecto de código abierto mantenido en mi tiempo libre. Si te fue útil y quieres agradecerlo:

[![Ko-fi](https://img.shields.io/badge/Ko--fi-FF5E5B?style=flat&logo=ko-fi&logoColor=white)](https://ko-fi.com/gerardolucero)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=flat&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/lucerorios0)

## Licencia

MIT © [Gerardo Lucero](https://github.com/GerardoLucero), ver [LICENSE](LICENSE).
