# calculadora-imss

Librería moderna para calcular cuotas obrero-patronales del IMSS (Instituto Mexicano del Seguro Social) con tarifas actualizadas 2024, siguiendo la Ley del Seguro Social.

[![Ko-fi](https://img.shields.io/badge/Ko--fi-FF5E5B?style=flat&logo=ko-fi&logoColor=white)](https://ko-fi.com/gerardolucero)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=flat&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/lucerorios0)
[![GitHub Stars](https://img.shields.io/github/stars/GerardoLucero/calculadora-imss?style=social)](https://github.com/GerardoLucero/calculadora-imss)
[![npm version](https://badge.fury.io/js/calculadora-imss.svg)](https://badge.fury.io/js/calculadora-imss)
[![npm downloads](https://img.shields.io/npm/dm/calculadora-imss.svg)](https://www.npmjs.com/package/calculadora-imss)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Tarifas IMSS 2024** — UMA y porcentajes actualizados
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
    { ramo: 'Enfermedad y Maternidad', obrera: 2.57, patronal: 68.32, total: 70.89 },
    { ramo: 'Invalidez y Vida', obrera: 3.13, patronal: 8.75, total: 11.88 },
    { ramo: 'Retiro', obrera: 0, patronal: 10.00, total: 10.00 },
    { ramo: 'Cesantía y Vejez', obrera: 5.63, patronal: 15.75, total: 21.38 },
    { ramo: 'Guarderías', obrera: 0, patronal: 5.00, total: 5.00 },
    { ramo: 'Riesgos de Trabajo', obrera: 0, patronal: 2.72, total: 2.72 }
  ],
  totalesPeriodo: { obrera: 339.90, patronal: 3316.20, total: 3656.10 },
  salarioNeto: { diario: 488.67, periodo: 14660.10 }
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
| `obtenerUMA()` | Retorna los valores de UMA 2024 |
| `obtenerPorcentajesIMSS()` | Retorna las tablas de porcentajes IMSS 2024 |

**Opciones comunes:**
- `claseRiesgo` (number, 1-5): clase de riesgo de trabajo. Default: 1
- `diasPeriodo` (number): días del periodo de pago. Default: 30

## Ramos del IMSS

| Ramo | Obrera | Patronal |
|------|--------|----------|
| Enfermedad y Maternidad | 0.40% + 0.375% | 20.40% sobre 3 UMAs + 1.10% excedente |
| Invalidez y Vida | 0.625% | 1.75% |
| Retiro | — | 2.00% |
| Cesantía y Vejez | 1.125% | 3.150% |
| Guarderías | — | 1.00% |
| Riesgos de Trabajo | — | Variable por clase |

## Clases de riesgo

| Clase | Tipo | Ejemplos |
|-------|------|----------|
| I | Mínima | Oficinas, comercio al por menor |
| II | Baja | Industria ligera, servicios |
| III | Media | Construcción, manufactura |
| IV | Alta | Química, transporte de carga |
| V | Máxima | Minería, explosivos, trabajos subterráneos |

## Valores de referencia 2024

- **UMA Diaria**: $108.57
- **UMA Mensual**: $3,297.57
- **Salario Mínimo**: $248.93 (diario)
- **Tope de Cotización**: $2,714.25 (25 UMAs diarias)

## Notas importantes

- Cálculos basados en la Ley del Seguro Social vigente en 2024
- No incluye INFONAVIT (5%) ni impuestos locales sobre nómina

## Referencias

- [Ley del Seguro Social](http://www.imss.gob.mx/conoce-al-imss/ley-del-seguro-social)
- [UMA 2024 — INEGI](https://www.inegi.org.mx/temas/uma/)

## Licencia

MIT © [Gerardo Lucero](https://github.com/GerardoLucero)
