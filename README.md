# Panel de Gestión Estratégica - IDETDF

Un dashboard dinámico e interactivo diseñado para el monitoreo de indicadores de formación, asistencia técnica geoespacial, adhesiones institucionales y comunicación de la Infraestructura de Datos Espaciales de Tierra del Fuego (IDETDF).

## 🚀 Características Principales

El panel procesa y visualiza datos en tiempo real divididos en cuatro ejes analíticos principales:

- **Capacitaciones:** Seguimiento de inscriptos, certificados, modalidades, eficacia de formación y fuentes de financiamiento.
- **Asistencias Técnicas:** Monitoreo de organismos solicitantes, temáticas abordadas (gráfico de radar), modalidades y evolución de estados.
- **Red de Adhesiones:** Evolución de organismos adheridos a la IDE y distribución de sus representantes.
- **Comunicación y Divulgación:** Análisis de impacto por canal de difusión, temáticas frecuentes, concentración por tipo de acción (gráfico de burbujas flotantes) y distribución anual.
- **Diccionarios:** Catálogos dinámicos que definen roles, tipos de asistencia y conceptos de comunicación web.

## 🛠️ Tecnologías Utilizadas

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla).
- **Visualización de Datos:** [Chart.js](https://www.chartjs.org/) (Gráficos de Barras, Líneas, Radar, Dona, Área Polar y Burbujas).
- **Procesamiento de Datos:** [PapaParse](https://www.papaparse.com/) para la lectura asíncrona de archivos CSV.
- **Iconografía:** FontAwesome 6.

## 📊 Arquitectura de Datos

El panel opera sin un backend tradicional. Funciona consumiendo datos directamente desde documentos de **Google Sheets** publicados en formato `.csv`. Esto permite a los administradores actualizar la información desde la planilla de cálculo y ver reflejados los cambios automáticamente en el dashboard recargando la página.
