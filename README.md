# Calculadora de Cuotas IMSS

<!-- BADGES-DONATIONS-START -->
[![Ko-fi](https://img.shields.io/badge/Ko--fi-Donate-orange?logo=ko-fi)](https://ko-fi.com/gerardolucero)
[![BuyMeACoffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Support-yellow?logo=buy-me-a-coffee)](https://buymeacoffee.com/lucerorios0)
<!-- BADGES-DONATIONS-END -->

[![npm version](https://badge.fury.io/js/calculadora-imss.svg)](https://badge.fury.io/js/calculadora-imss)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js CI](https://github.com/GerardoLucero/calculadora-imss/workflows/Publish%20to%20NPM/badge.svg)](https://github.com/GerardoLucero/calculadora-imss/actions)

Librería moderna para calcular **cuotas obrero-patronales del IMSS** (Instituto Mexicano del Seguro Social) con tarifas actualizadas 2024, siguiendo la Ley del Seguro Social.

## 🚀 Características

- ✅ **Tarifas IMSS 2024** - UMA y porcentajes actualizados
- ✅ **6 ramos completos** - Enfermedad, Invalidez, Retiro, Cesantía, Guarderías, Riesgos
- ✅ **Cuotas obrera y patronal** - Cálculo separado y total
- ✅ **5 clases de riesgo** - Desde mínima hasta máxima
- ✅ **Salario neto** - Calcula descuentos y neto
- ✅ **Múltiples trabajadores** - Procesa lotes de nómina
- ✅ **TypeScript ready** - Incluye definiciones de tipos
- ✅ **Zero dependencies** - Solo dayjs
- ✅ **Totalmente probado** - Cobertura > 85%

## 📦 Instalación

```bash
npm install calculadora-imss
```

```bash
yarn add calculadora-imss
```

```bash
pnpm add calculadora-imss
```

## 🔧 Uso

### Importación

```javascript
// ES6 Modules
import { calcularCuotasIMSS } from 'calculadora-imss';

// CommonJS
const { calcularCuotasIMSS } = require('calculadora-imss');
```

### Ejemplo básico

```javascript
import { calcularCuotasIMSS } from 'calculadora-imss';

// Calcular cuotas para salario de $500 diarios
const cuotas = calcularCuotasIMSS(500);

console.log(cuotas);
/*
{
  salarioBase: {
    salarioDiario: 500,
    sbc: 500,
    aplicaTope: false
  },
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
  totalesDiarios: {
    obrera: 11.33,
    patronal: 110.54,
    total: 121.87
  },
  totalesPeriodo: {
    obrera: 339.90,
    patronal: 3316.20,
    total: 3656.10
  },
  salarioNeto: {
    diario: 488.67,
    periodo: 14660.10
  }
}
*/
```

### Calcular solo cuota obrera

```javascript
import { calcularCuotaObrera } from 'calculadora-imss';

const cuotaObrera = calcularCuotaObrera(500);
console.log(cuotaObrera);
/*
{
  salarioDiario: 500,
  diasPeriodo: 30,
  cuotaDiaria: 11.33,
  cuotaPeriodo: 339.90,
  desglose: [
    { ramo: 'Enfermedad y Maternidad', cuota: 2.57 },
    { ramo: 'Invalidez y Vida', cuota: 3.13 },
    { ramo: 'Cesantía en Edad Avanzada y Vejez', cuota: 5.63 }
  ]
}
*/
```

### Calcular solo cuota patronal

```javascript
import { calcularCuotaPatronal } from 'calculadora-imss';

const cuotaPatronal = calcularCuotaPatronal(500, { claseRiesgo: 2 });
console.log(cuotaPatronal);
/*
{
  salarioDiario: 500,
  diasPeriodo: 30,
  cuotaDiaria: 112.19,
  cuotaPeriodo: 3365.70,
  desglose: [
    { ramo: 'Enfermedad y Maternidad', cuota: 68.32 },
    { ramo: 'Invalidez y Vida', cuota: 8.75 },
    { ramo: 'Retiro', cuota: 10.00 },
    { ramo: 'Cesantía en Edad Avanzada y Vejez', cuota: 15.75 },
    { ramo: 'Guarderías y Prestaciones Sociales', cuota: 5.00 },
    { ramo: 'Riesgos de Trabajo', cuota: 5.65 }
  ]
}
*/
```

### Calcular salario neto

```javascript
import { calcularSalarioNeto } from 'calculadora-imss';

const salarioNeto = calcularSalarioNeto(500, { diasPeriodo: 15 });
console.log(salarioNeto);
/*
{
  salarioBruto: 7500,
  descuentosIMSS: 169.95,
  salarioNeto: 7330.05,
  porcentajeDescuento: 2.27,
  diasPeriodo: 15
}
*/
```

### Clase de riesgo

```javascript
import { calcularCuotasIMSS } from 'calculadora-imss';

// Clase I (mínima) - Oficinas, comercio
const clase1 = calcularCuotasIMSS(500, { claseRiesgo: 1 });

// Clase III (media) - Construcción
const clase3 = calcularCuotasIMSS(500, { claseRiesgo: 3 });

// Clase V (máxima) - Minería, explosivos
const clase5 = calcularCuotasIMSS(500, { claseRiesgo: 5 });

console.log('Riesgo mínimo:', clase1.totalesDiarios.patronal);
console.log('Riesgo medio:', clase3.totalesDiarios.patronal);
console.log('Riesgo máximo:', clase5.totalesDiarios.patronal);
```

### Nómina de múltiples trabajadores

```javascript
import { calcularCuotasMultiples } from 'calculadora-imss';

const trabajadores = [
  { salarioDiario: 300, claseRiesgo: 1 },
  { salarioDiario: 500, claseRiesgo: 2 },
  { salarioDiario: 800, claseRiesgo: 1 },
  { salarioDiario: 1200, claseRiesgo: 3 }
];

const resultados = calcularCuotasMultiples(trabajadores);

resultados.forEach((resultado, i) => {
  console.log(`Trabajador ${i + 1}:`);
  console.log(`  Cuota obrera: $${resultado.totalesPeriodo.obrera}`);
  console.log(`  Cuota patronal: $${resultado.totalesPeriodo.patronal}`);
  console.log(`  Total IMSS: $${resultado.totalesPeriodo.total}`);
});
```

## 📋 API Completa

### `calcularCuotasIMSS(salarioDiario, opciones)`

Calcula todas las cuotas IMSS (obrera y patronal) para un trabajador.

#### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `salarioDiario` | `number` | ✅ Sí | Salario diario integrado del trabajador |
| `opciones.claseRiesgo` | `number` | ⚠️ Opcional | Clase de riesgo de trabajo (1-5), default: 1 |
| `opciones.diasPeriodo` | `number` | ⚠️ Opcional | Días del periodo de pago, default: 30 |

#### Retorna

Objeto con:
- `salarioBase` - SBC y topes aplicados
- `diasPeriodo` - Días del periodo
- `claseRiesgo` - Clase de riesgo aplicada
- `desglosePorRamo` - Array con cuotas de cada ramo
- `totalesDiarios` - Totales por día (obrera, patronal, total)
- `totalesPeriodo` - Totales por periodo
- `salarioNeto` - Salario después de descuentos

### `calcularCuotaObrera(salarioDiario, opciones)`

Calcula solo la cuota del trabajador.

### `calcularCuotaPatronal(salarioDiario, opciones)`

Calcula solo la cuota del patrón.

### `calcularSalarioNeto(salarioDiario, opciones)`

Calcula el salario neto después de descuentos IMSS.

### `calcularCuotasMultiples(trabajadores)`

Calcula cuotas para múltiples trabajadores.

#### Parámetros

```javascript
trabajadores: [
  {
    salarioDiario: number,
    claseRiesgo?: number,
    diasPeriodo?: number
  }
]
```

### `obtenerUMA()`

Retorna los valores de UMA 2024.

### `obtenerPorcentajesIMSS()`

Retorna las tablas de porcentajes IMSS 2024.

## 🏥 Ramos del IMSS

La calculadora incluye los 6 ramos del IMSS:

### 1. Enfermedad y Maternidad
- **Obrera**: 0.40% sobre excedente de 3 UMAs + 0.375% prestaciones en dinero
- **Patronal**: 20.40% sobre 3 UMAs + 1.10% sobre excedente + 0.70% dinero + 1.05% pensionados

### 2. Invalidez y Vida
- **Obrera**: 0.625%
- **Patronal**: 1.75%

### 3. Retiro
- **Patronal**: 2.00% (solo patronal)

### 4. Cesantía en Edad Avanzada y Vejez
- **Obrera**: 1.125%
- **Patronal**: 3.150%

### 5. Guarderías y Prestaciones Sociales
- **Patronal**: 1.00% (solo patronal)

### 6. Riesgos de Trabajo
Variable según clase:
- **Clase I** (Mínima): 0.54355%
- **Clase II** (Baja): 1.13065%
- **Clase III** (Media): 2.59840%
- **Clase IV** (Alta): 4.65325%
- **Clase V** (Máxima): 7.58875%

## 📊 Clases de Riesgo

| Clase | Tipo | Ejemplos de Actividades |
|-------|------|------------------------|
| I | Mínima | Oficinas, comercio al por menor |
| II | Baja | Industria ligera, servicios |
| III | Media | Construcción, manufactura |
| IV | Alta | Química, transporte de carga |
| V | Máxima | Minería, explosivos, trabajos subterráneos |

## 💰 Valores de Referencia 2024

- **UMA Diaria**: $108.57
- **UMA Mensual**: $3,297.57
- **UMA Anual**: $39,570.84
- **Salario Mínimo**: $248.93 (diario)
- **Tope de Cotización**: $2,714.25 (25 UMAs diarias)

## 🎯 Casos de Uso

### Sistema de Nómina

```javascript
import { calcularCuotasIMSS, calcularSalarioNeto } from 'calculadora-imss';

function procesarNomina(empleados) {
  return empleados.map(empleado => {
    const cuotas = calcularCuotasIMSS(empleado.salarioDiario, {
      claseRiesgo: empleado.claseRiesgo,
      diasPeriodo: 15 // Quincenal
    });
    
    return {
      nombre: empleado.nombre,
      salarioBruto: empleado.salarioDiario * 15,
      cuotaObrera: cuotas.totalesPeriodo.obrera,
      cuotaPatronal: cuotas.totalesPeriodo.patronal,
      salarioNeto: cuotas.salarioNeto.periodo
    };
  });
}
```

### Calculadora de Costos Laborales

```javascript
import { calcularCuotaPatronal } from 'calculadora-imss';

function calcularCostoTotal(salarioDiario, claseRiesgo) {
  const cuotaPatronal = calcularCuotaPatronal(salarioDiario, {
    claseRiesgo,
    diasPeriodo: 30
  });
  
  const salarioMensual = salarioDiario * 30;
  const imssPatronal = cuotaPatronal.cuotaPeriodo;
  
  // Otros costos (estimados)
  const infonavit = salarioMensual * 0.05; // 5%
  const aguinaldo = (salarioMensual * 15) / 365 * 30; // 15 días
  const vacaciones = (salarioMensual * 6) / 365 * 30; // 6 días
  const primaVacacional = vacaciones * 0.25;
  
  const costoTotal = salarioMensual + imssPatronal + infonavit + 
                     aguinaldo + vacaciones + primaVacacional;
  
  return {
    salarioMensual,
    imssPatronal,
    infonavit,
    prestaciones: aguinaldo + vacaciones + primaVacacional,
    costoTotal,
    factorMultiplicador: parseFloat((costoTotal / salarioMensual).toFixed(2))
  };
}
```

### Reporte de Nómina

```javascript
import { calcularCuotasIMSS } from 'calculadora-imss';

function generarReporteNomina(salarioDiario) {
  const cuotas = calcularCuotasIMSS(salarioDiario, {
    claseRiesgo: 2,
    diasPeriodo: 30
  });
  
  console.log('\n═══════════════════════════════════════════');
  console.log('        REPORTE DE CUOTAS IMSS 2024        ');
  console.log('═══════════════════════════════════════════');
  console.log(`Salario Diario: $${cuotas.salarioBase.salarioDiario}`);
  console.log(`SBC: $${cuotas.salarioBase.sbc}`);
  console.log(`Periodo: ${cuotas.diasPeriodo} días`);
  console.log(`Clase de Riesgo: ${cuotas.claseRiesgo}`);
  console.log('───────────────────────────────────────────');
  
  cuotas.desglosePorRamo.forEach(ramo => {
    console.log(`\n${ramo.ramo}:`);
    if (ramo.obrera > 0) console.log(`  Obrera:   $${ramo.obrera.toFixed(2)}`);
    console.log(`  Patronal: $${ramo.patronal.toFixed(2)}`);
  });
  
  console.log('\n═══════════════════════════════════════════');
  console.log('TOTALES DEL PERIODO:');
  console.log(`  Cuota Obrera:   $${cuotas.totalesPeriodo.obrera}`);
  console.log(`  Cuota Patronal: $${cuotas.totalesPeriodo.patronal}`);
  console.log(`  TOTAL IMSS:     $${cuotas.totalesPeriodo.total}`);
  console.log('───────────────────────────────────────────');
  console.log(`  Salario Bruto:  $${(salarioDiario * cuotas.diasPeriodo).toFixed(2)}`);
  console.log(`  Descuentos:     $${cuotas.totalesPeriodo.obrera}`);
  console.log(`  Salario Neto:   $${cuotas.salarioNeto.periodo}`);
  console.log('═══════════════════════════════════════════\n');
}
```

## 🧮 Ejemplos de Cálculo

### Salario Mínimo ($248.93/día)

```javascript
const resultado = calcularCuotasIMSS(248.93, { diasPeriodo: 30 });
// Cuota obrera mensual: ~$168
// Cuota patronal mensual: ~$1,645
```

### Salario Medio ($10,000/mes)

```javascript
const resultado = calcularCuotasIMSS(333.33, { diasPeriodo: 30 });
// Cuota obrera mensual: ~$226
// Cuota patronal mensual: ~$2,210
```

### Salario Alto ($30,000/mes)

```javascript
const resultado = calcularCuotasIMSS(1000, { diasPeriodo: 30 });
// Cuota obrera mensual: ~$680
// Cuota patronal mensual: ~$6,630
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests con cobertura
npm run test:coverage

# Ejecutar tests en modo watch
npm run test:watch
```

## 🛠️ Desarrollo

```bash
# Clonar el repositorio
git clone https://github.com/GerardoLucero/calculadora-imss.git
cd calculadora-imss

# Instalar dependencias
npm install

# Ejecutar tests
npm test

# Ejecutar linter
npm run lint

# Compilar para producción
npm run build:prod
```

## 📊 Compatibilidad

- **Node.js**: >= 18.0.0
- **Navegadores**: Todos los navegadores modernos
- **TypeScript**: Incluye definiciones de tipos

## ⚠️ Notas Importantes

- Los cálculos están basados en la **Ley del Seguro Social vigente en 2024**
- Se utilizan los valores de **UMA 2024**
- Las cuotas pueden variar si hay actualizaciones en la ley
- **No incluye**: INFONAVIT (5%), impuestos locales sobre nómina
- **Solo IMSS**: Esta librería calcula únicamente cuotas del IMSS

## 📚 Referencias

- [Ley del Seguro Social](http://www.imss.gob.mx/conoce-al-imss/ley-del-seguro-social)
- [UMA 2024 - INEGI](https://www.inegi.org.mx/temas/uma/)
- [Tabla de Riesgos de Trabajo](http://www.imss.gob.mx/empresas/riesgos-trabajo)
- [Calculadora Oficial IMSS](http://www.imss.gob.mx/tramites/imss02001)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes:

1. Abre un issue para discutir el cambio
2. Haz fork del proyecto
3. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
4. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
5. Push a la rama (`git push origin feature/AmazingFeature`)
6. Abre un Pull Request

Asegúrate de que los tests pasen:

```bash
npm test
npm run lint
```

## 📝 Changelog

### v1.0.0 (2025)
- 🎉 Lanzamiento inicial
- ✨ Cálculo completo de 6 ramos IMSS
- ✨ Cuotas obrera y patronal
- ✨ 5 clases de riesgo
- ✨ UMA y tarifas 2024
- 🧪 Suite de tests completa
- 📚 Documentación completa

## 📄 Licencia

MIT © [Gerardo Lucero](https://github.com/GerardoLucero)

---

## 🆘 Soporte

Si encuentras algún problema o tienes preguntas:

- 🐛 [Reportar un bug](https://github.com/GerardoLucero/calculadora-imss/issues)
- 💡 [Solicitar una feature](https://github.com/GerardoLucero/calculadora-imss/issues)
- 📧 [Contacto directo](mailto:tu-email@ejemplo.com)

---

**¿Te gusta este proyecto?** ⭐ ¡Dale una estrella en GitHub!

**¿Necesitas otras calculadoras?** 👀 Revisa el ecosistema completo:

- [calculadora-isr](https://www.npmjs.com/package/calculadora-isr) - Cálculo de ISR
- [calculadora-nomina-mx](https://www.npmjs.com/package/calculadora-nomina-mx) - Cálculo de nómina completo
- [calcula-rfc](https://www.npmjs.com/package/calcula-rfc) - Cálculo de RFC
- [calcula-curp](https://www.npmjs.com/package/calcula-curp) - Cálculo de CURP
- [generador-datos-mx](https://www.npmjs.com/package/generador-datos-mx) - Generador de datos de prueba

<!-- DONATIONS-START -->
## 💖 Apoya el Ecosistema Mexicano OSS

Si estos paquetes te ayudan en tus proyectos de nómina y RH, considera invitarme un café:

- [Ko-fi](https://ko-fi.com/gerardolucero)
- [Buy Me a Coffee](https://buymeacoffee.com/lucerorios0)

> Gracias por tu apoyo 🙌. Priorizaré issues/PRs relacionados con nómina, IMSS e INFONAVIT.
<!-- DONATIONS-END -->
