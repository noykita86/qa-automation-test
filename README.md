# QA Automation Technical Test — SauceDemo + Restful-Booker

Repositorio con la solución a la prueba técnica de automatización: **E2E en SauceDemo**,
**CRUD de API en Restful-Booker**, **prueba de carga con JMeter** y **pipeline CI/CD con GitHub Actions**.

- **Autora:** Noyka (QA Engineer, +5 años)
- **Stack:** Playwright + TypeScript · JMeter · Dotenv · GitHub Actions
- **Duración de la prueba:** 3 horas (ver sección *Gestión del tiempo*)
- **Estado del pipeline:** ✅ verde en `main`

---

## 1. Qué contiene el repositorio

| Área | Ubicación | Cobertura |
|---|---|---|
| E2E UI (SauceDemo) | `tests/saucedemo.spec.ts` + `pages/` | Login, carrito, checkout |
| API (Restful-Booker) | `tests/api.spec.ts` | CRUD + token + test negativo 404 |
| Prueba de carga | `load_test.jmx` + `report_html/` | 10 usuarios · 1 min |
| CI/CD | `.github/workflows/playwright.yml` | Matriz Chromium + Firefox |
| Config | `playwright.config.ts` | POM, env vars, matriz de navegadores |

---

## 2. Cómo ejecutarlo

```bash
npm ci
npx playwright install --with-deps
npx playwright test                     # suite completa
npx playwright test tests/api.spec.ts   # solo API
npx playwright show-report              # ver informe HTML
```

Variables de entorno (`.env` en la raíz, ver `.env.example`):

```
SAUCE_USER=standard_user
SAUCE_PASSWORD=secret_sauce
API_USERNAME=admin
API_PASSWORD=password123
```

> En CI las credenciales se inyectan vía **GitHub Secrets**, nunca se commitean.

---

## 3. Decisiones técnicas (y por qué)

### 3.1 Page Object Model + `getByRole`
- **Decisión:** encapsular SauceDemo en `pages/` usando `getByRole` en lugar de CSS/XPath.
- **Por qué:** los selectores accesibles (role + name) son más resilientes a cambios de DOM y
  reflejan cómo un usuario real interactúa con la página. Reduce el *flakiness* y mejora la
  legibilidad del test (`page.getByRole('button', { name: 'Login' })` se lee solo).

### 3.2 Matriz de dos navegadores solo para UI
- **Decisión:** correr la matriz Chromium + Firefox únicamente en `saucedemo.spec.ts`;
  las pruebas de API hacen `test.skip` en Firefox.
- **Por qué:** el valor de la matriz está en validar el comportamiento del navegador (render,
  eventos, accesibilidad), no en HTTP. Ejecutar API dos veces duplica tiempo de CI sin aportar
  cobertura. Esto **redujo ~40% el tiempo del pipeline**.

### 3.3 Pruebas de API seriales
- **Decisión:** `test.describe.serial` en `api.spec.ts`.
- **Por qué:** Restful-Booker no aísla datos entre ejecuciones; el flujo es *create → get →
  update → delete*. Serializar garantiza orden determinista y un `bookingId` válido en cada paso.

### 3.4 Test negativo 404
- **Decisión:** incluir un caso que consulta un `bookingId` inexistente y valida `404`.
- **Por qué:** cubrir el *happy path* no demuestra criterio de QA. El caso negativo valida el
  contrato de error de la API y protege contra regresiones en el manejo de errores.

### 3.5 JMeter con `JSONPostProcessor` nativo
- **Decisión:** refactorizar `load_test.jmx` para usar el componente **nativo** `JSONPostProcessor`
  en lugar del plugin externo `JSONPathExtractor`.
- **Por qué:** el plugin rompía la portabilidad del script (fallaba en entornos sin el plugin).
  El componente nativo viene con JMeter, elimina una dependencia y hace el `.jmx` reproducible
  en cualquier máquina o runner. **Lección aprendida:** menos dependencias = más reproducible.

### 3.6 Gestión de secretos
- **Decisión:** `.env` en la raíz (no en `tests/`), fallback en código para desarrollo local,
  y **GitHub Secrets** en el pipeline.
- **Por qué:** `dotenv` resuelve `.env` relativo al `cwd`; tenerlo en `tests/` lo hacía invisible.
  El fallback da resiliencia en local; los Secrets garantizan que **ninguna credencial real
  viaja en el repo**. El `.env` está en `.gitignore`.

---

## 4. Uso de la IA (transparencia)

Usé IA como **copiloto**, no como sustituto. 

| Dónde usé IA | Para qué | Qué validé/rechacé |
|---|---|---|
| Scaffolding del POM | Generar la estructura inicial de `pages/` | Ajusté selectores a `getByRole`; la IA proponía CSS frágiles |
| Config de la matriz Playwright | Borrador de `playwright.config.ts` | Añadí el `test.skip` de API en Firefox por criterio propio |
| Debug de JMeter | Diagnóstico del fallo del `JSONPathExtractor` | La IA sugirió el plugin; **yo decidí migrar al componente nativo** por portabilidad |
| Redacción del README | Estructura de secciones | Contenido técnico y decisiones son míos; la IA ayudó a ordenar |

**Criterio de uso:** la IA acelera el *boilerplate* y la documentación; las **decisiones de
arquitectura, los casos de prueba y los criterios de aceptación los defino yo**. Todo el código
generado fue revisado, ejecutado y validado contra la suite antes de commitear.

---

## 5. Gestión del tiempo (3 h)

| Fase | Tiempo | Notas |
|---|---|---|
| Lectura del enunciado + setup (repo, `npm init`, Playwright) | ~20 min | Priorizar: primero UI, luego API, luego load, luego CI |
| E2E SauceDemo (POM + tests) | ~50 min | Reutilizar patrones de mi proyecto `banca-playwright` |
| API Restful-Booker (CRUD + token + 404) | ~40 min | Serial por dependencia de datos |
| JMeter + reporte HTML | ~30 min | Incluye el debug del plugin (→ JSONPostProcessor) |
| GitHub Actions + Secrets | ~20 min | Matriz + cache de dependencias |
| README y revisión final | ~15 min | **Subestimado: lo que más pesó en la evaluación** |
| Buffer / imprevistos | ~5 min | |

**Retrospectiva honesta:** dediqué poco tiempo al README y fue exactamente lo que más
penalizó la evaluación. El código pasaba, pero la **entrega escrita no comunicaba el criterio**.
Para la próxima: reservar mínimo **20–25 min** al README y escribirlo **en paralelo** al
desarrollo, no al final.

---

## 6. Qué haría con más tiempo

- **Fixtures personalizados** para autenticación (Arrange via API, Act via UI), como en mi
  proyecto `banca-playwright`.
- **Network mocking** (`page.route`) para simular flujos MFA/OTP sin depender del backend.
- **Pipeline con `--shard`** para paralelizar la suite y reducir aún más el tiempo de CI.
- **Thresholds de performance** en JMeter que hagan fallar el build si la latencia p95 excede
  un umbral.

---

## 7. Autora

**Noyka** — QA Engineer con +5 años de experiencia en automatización.
- Proyecto autodidacta: [`banca-playwright`](https://github.com/noykita86/banca-playwright) —
  fixtures, network mocking (MFA/OTP) y patrón *Arrange via API, Act via UI*.