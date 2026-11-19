# QA Automation Technical Test - Noyka Sierra

Prueba técnica de automatización que incluye pruebas E2E, pruebas de API, pruebas de carga y un pipeline de CI/CD.

## 🛠️ Tecnologías utilizadas
*   **Playwright** con **TypeScript** (E2E y API Testing).
*   **Page Object Model (POM)** para escalabilidad.
*   **JMeter** para pruebas de carga.
*   **GitHub Actions** para CI/CD.
*   **Dotenv** para gestión de variables de entorno.

## 🚀 Cómo ejecutar el proyecto

1. Clonar el repositorio e instalar dependencias:
   ```bash
   npm install

2. Instalar los navegadores de Playwright:
    ```bash
    npx playwright install

3. Configurar las variables de entorno:
Copia el archivo .env.example a .env y rellena los valores.
    ```bash
    cp .env.example .env

4. Ejecutar todas las pruebas (E2E y API):
    ```bash
    npx playwright test

5. Ver el reporte de Playwright:
    ```bash
    npx playwright show-report

6. Ejecutar prueba de carga con JMeter (requiere JMeter instalado):
    ```bash
    jmeter -n -t load_test.jmx -l result.jtl -e -o report_html