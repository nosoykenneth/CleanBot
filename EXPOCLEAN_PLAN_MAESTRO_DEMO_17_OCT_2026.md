# EXPOCLEAN / CLEANBOT — PLAN MAESTRO DE PRESENTACIÓN, DEMOSTRACIÓN Y ARQUITECTURA TÉCNICA

> **Actualización local del prototipo:** ya hay editor de residuos, tratamiento inmediato de conocidos, cámara simulada automática ante desconocidos, memoria de custodia y auditoría de la escena con capturas y hasta dos pasadas. Se agregó además comparación de **fotografías reales** contra una referencia de piso limpio, con ROI manual, máscaras RGB, comprobación básica de cambios del fondo y exportación de evidencias. Este procesamiento no usa un modelo entrenado, no identifica sustancias, no autoriza productos y no está conectado al control del robot. Las descripciones del commit revisado en las secciones siguientes son una referencia histórica; no representan todas estas ampliaciones locales. El aprendizaje profundo, Edge AI y la auditoría automática con cámara física siguen propuestos.

> **Hackathon Expo Clean Ecuador 2026 · Sábado 17 de octubre de 2026**  
> **Documento de coordinación, diseño conceptual y guion de demostración digital.**  
> **Versión:** 1.0 · preparado el viernes 16 de octubre de 2026.  
> **Repositorio de referencia:** https://github.com/nosoykenneth/ExpoClean  
> **Commit revisado de `main`:** [`fd2f2b7`](https://github.com/nosoykenneth/ExpoClean/commit/fd2f2b7ab89589e92796d96a5c42a40aaf9f3da7), «Mejora flujo de muestras y limpieza».  
> **Importante:** esto especifica tanto funciones existentes como funciones **propuestas**. No constituye un diseño eléctrico certificado, una validación sanitaria, ni una demostración de desinfección real.

---

## 0. La decisión estratégica: qué mostraremos mañana y qué NO diremos

### Objetivo de la entrega

Mostrar a ExpoClean como **una propuesta técnicamente realizable de limpieza robótica con prevención de riesgos y auditoría de calidad**, respaldada por un **gemelo digital interactivo de concepto**. El objetivo es que el jurado entienda **el problema, la innovación, la lógica de seguridad, la arquitectura de ingeniería, el valor económico y la ruta de construcción**.

**Mensaje central:** «ExpoClean no busca que una IA adivine qué químico usar. Detecta suciedad visible, reconoce cuándo no tiene suficiente información, consulta protocolos aprobados y documenta qué hizo y qué resultado visible obtuvo».

### Tres niveles de madurez que nunca deben mezclarse

| Etiqueta | Significado | Ejemplos |
|---|---|---|
| **EXISTENTE / DEMOSTRABLE** | Está escrito en el repositorio; debe verificarse manualmente en el equipo de presentación antes de afirmarlo en vivo. | Escena Three.js; A*/Dijkstra en cuadrícula; modos manual/automático; muestras preconfiguradas; bloqueo digital; login; informes SQLite/CSV. |
| **PROPUESTA DE MVP / SIGUIENTE DESARROLLO** | Arquitectura y especificación detalladas; **no implementadas hoy en el repo revisado**. | Carga y comparación de fotografías con OpenCV, motor EcoProtocol documental persistente, configuración de mapas propios, controles táctiles, auditoría visual. |
| **VISIÓN DE PRODUCTO FÍSICO / I+D** | Requiere compra, fabricación, electrónica, instrumentación y validación. | Robot 24 V con cepillo, aspiración de agua, batería, LiDAR, cámara y control de motores; Edge AI; instrumentación analítica especializada. |

**No prometer:** identificación de chocolate frente a heces mediante fotografía; detección de bacterias con cámara RGB; análisis químico real; dosificación física; esterilización/desinfección validada; cumplimiento ARCSA o certificaciones obtenidas; autonomía real de hardware; ahorro hídrico medido; seguridad industrial certificada; captura real de muestras peligrosas. **Sí decir:** funciones diseñadas, riesgos detectados, mecanismos digitales representados y pruebas que realizaríamos.

### Alcance recomendado del primer caso de uso

Priorizar una **bodega o corredor industrial interior, sobre piso duro no poroso, sin procesos alimentarios ni pacientes**, con residuos de ensayo seguros. Los escenarios hospitalarios e industriales de la simulación muestran **posibilidades futuras** y no prueban aptitud clínica. Evitar superficies explosivas, materiales biológicos, químicos desconocidos y ambientes con personas expuestas a aerosolización durante el piloto.

---

## 1. Agenda confirmada y entregables de mañana

La hoja de agenda compartida por el equipo (`areas-menotres.xlsx`, abierta desde Google Drive) indica para **sábado 17/10/2026**:

| Hora | Actividad | Implicación para ExpoClean |
|---|---|---|
| 08:30–09:00 | Reingreso | Comprobar portátil, Wi-Fi, cargadores, carpetas y demo. |
| 09:00–10:00 | Desarrollo final | Corregir fallos, preparar imágenes y evidencias, **no reescribir toda la app**. |
| 10:00–10:30 | Conferencia «Pitch que convence» | Ajustar historia y tiempos a recomendaciones oficiales. |
| 11:30–13:15 | Validación integral | Mostrar avance a mentores; pedir críticas técnicas, comerciales y de riesgo. |
| 14:00–15:00 | Ajustes finales | Congelar cambios, validar demo y diapositivas. |
| **16:00–16:15** | **Entrega de hitos** | Llevar archivos definitivos listos antes del inicio de la franja. |
| **16:15–18:15** | **Presentaciones finales ante jurado** | Es una **franja colectiva**, no significa que ExpoClean dispone de dos horas; confirmar turno y duración exacta. |

La agenda revisada **no determina la duración individual** de cada pitch. En este documento se propone un **guion adaptable de cinco minutos** más un recorrido breve de la simulación; si la organización concede otro tiempo, se ajusta.

### Entregables mínimos que el equipo debe llevar

1. **Diapositivas PDF/PPTX** terminadas, con concepto, problema, solución, arquitectura, diferenciación, viabilidad y próximos hitos.
2. **Simulación 3D** funcionando localmente y comprobada en el navegador del equipo principal.
3. **Video de respaldo** de 60–120 segundos grabado previamente mostrando exactamente el flujo de la demo, sin depender de internet.
4. **Capturas** de la escena, módulos internos, detección conceptual de muestra, alerta por desconocido, registro y reporte.
5. **Documento técnico** (este archivo `.md`) accesible en portátil y teléfono.
6. **Repositorio y versión** identificables; no hacer `git pull` sin prueba justo antes de presentar.
7. **Evidencia de alcance:** una diapositiva «Ya existe / Propuesto / Futuro».
8. **Preguntas y respuestas** preparadas sobre costos, IA, químicos, seguridad, mercado y regulación.

---

## 2. Problema, usuario, propuesta de valor y diferenciación

### Problema

La limpieza en instalaciones amplias o sensibles puede implicar exposición humana a residuos, uso de productos no compatibles con ciertas superficies, falta de visibilidad del proceso y dificultades para demostrar qué se hizo. La automatización comercial ya cubre recorridos, obstáculos y, en determinados robots, detección visual de suciedad; **el reto del proyecto es conectar percepción, autorización segura y verificación auditable**.

### Usuario / comprador objetivo

- **Operador de limpieza:** recibe tareas, detiene el sistema, confirma intervenciones, informa incidentes.
- **Supervisor de servicios:** asigna zonas, comprueba cobertura y reportes, investiga alertas.
- **Responsable de seguridad y salud:** define áreas restringidas, evaluación de riesgo e intervención humana obligatoria.
- **Responsable de productos / calidad:** mantiene fichas, compatibilidades, permisos y revisiones documentales.
- **Comprador B2B:** bodegas, centros logísticos e instalaciones con pisos industriales regulares; interesados en trazabilidad y previsibilidad operativa.

### Propuesta de valor

**ExpoClean = robot limpiador autónomo futuro + percepción de suciedad visible + decisiones guiadas por protocolos autorizados + registro y auditoría visual.**

**Diferenciación defendible:** no afirmar que nadie más detecta manchas o que nadie más realiza reportes; existen competidores que lo hacen. El aporte buscado es la **combinación transparente de riesgo, EcoProtocol, autorización, ejecución y evidencia visual** con adaptación documental al contexto ecuatoriano.

### Beneficios esperados (hipótesis, no resultados medidos)

- Menos exposición de personal a tareas repetitivas o de riesgo *si el sistema demuestra seguridad en un piloto*.
- Mejor trazabilidad de intervenciones y zonas pendientes.
- Menos intervenciones químicas improvisadas por bloqueo de casos inciertos.
- Potencial de optimización de recorridos, agua y productos, por medir contra operación convencional.
- Mayor capacidad de detectar incidencias visibles y documentar resultados.

---

## 3. Qué hay exactamente hoy en GitHub

### Archivos relevantes

```text
ExpoClean/
├── README.md                     # Explicación actual
├── index.html                    # Aplicación web 3D principal
├── styles.css                    # Interfaz principal
├── dashboard-3d.js               # Three.js + lógica de navegación/protocolo
├── package.json                  # three: 0.160.0
├── app.js                        # Otra aplicación 3D/archivo legado
├── server.py                     # Archivo raíz; NO confundir con servidor avanzado
├── CleanBot_Simulacion_Avanzada/
│   ├── server.py                 # SERVIDOR a ejecutar para demo principal
│   ├── static/
│   │   ├── index.html            # Panel alternativo 2D
│   │   ├── styles.css
│   │   └── app.js
│   ├── run.bat / run.sh
│   └── webots/                   # Mundo/controlador independientes
└── webots/                      # Material adicional de simulación
```

### Funciones verificadas en el código, no necesariamente comprobadas en ejecución

- **Renderizado 3D:** Three.js `0.160.0`, escena y robot con módulo interior/cutaway, escenarios `hospital`, `industry`, `warehouse`.
- **Mapa:** rejilla lógica de **37 columnas x 22 filas**; obstáculos establecidos por escenario.
- **Planificación:** A* y Dijkstra, con heurística Manhattan para A* y coste unitario en cuadrícula; cobertura mediante puntos espaciados y rutas entre ellos.
- **Control:** modo automático, manual WASD/flechas; velocidad configurable; pulverización representada gráficamente.
- **Telemetría:** batería, tanque, distancia, cobertura, sensores frontales/laterales, temperatura, humedad y VOC **simulados**.
- **Muestras:** definidas en `SCENARIOS.*.samples` con posición, ID y tipo (`organic`, `biological`, `unknown`); la detección ocurre por cercanía a coordenadas **preestablecidas**, no por análisis óptico.
- **Catálogo demo:** `DEMO_SAMPLES` enlaza tipos con códigos `PR-DEMO-01/02`, `P-01/02` y perfiles simbólicos de dosificación; no prescribe cantidades ni utiliza fichas de fabricantes verificadas.
- **Estado de muestra:** la lógica puede excluir una región, guardar un caso desconocido, continuar la cobertura en zonas permitidas, y requerir confirmación para regresar a una muestra conocida.
- **Paro digital:** botón de paro y estados de interbloqueo. No es un circuito de parada de emergencia de hardware.
- **Persistencia:** backend Python con `sqlite3`, sesiones y usuarios `admin/operator/observer`, reportes y tabla `retained_samples`; exportación CSV.
- **Webots:** simulación robótica **independiente** de la escena 3D web; no afirmar que los dos entornos sincronizan posiciones.

### Lo que el software NO tiene hoy (según revisión de los archivos de `main`)

- Inferencia visual real con cámara, OpenCV o un modelo YOLO entrenado.
- Determinación de la composición de muestras o un espectrómetro.
- Validación documental real ARCSA/SDS/producto-superficie mediante un motor EcoProtocol integrado.
- Evidencia real de imagen antes/después y métrica de limpieza visible.
- Control desde otro teléfono ya desplegado: el servidor actual escucha en `127.0.0.1` y los controles manuales usan teclado.
- Importación de planos de edificios como mapa navegable en la interfaz 3D principal.
- Una conexión demostrada con ESP32, LiDAR, encoders, bomba o cepillo físicos.

### Observaciones técnicas para el equipo

1. La medida **`coverage_percent` es cobertura geométrica simulada**, no porcentaje real de superficie higienizada ni reducción microbiana.
2. El registro específico de muestras desconocidas está en SQLite; los estados de muestras conocidas pertenecen mayormente al flujo del navegador. La trazabilidad de producción necesitará un historial completo en backend.
3. `buildCoverageRoute()` selecciona puntos espaciados; no es una garantía matemática de cobertura total de una superficie real con huella de limpieza determinada.
4. El código representa una **recogida y custodia conceptual** de muestras; no hay mecanismo de muestreo físico ni cadena de custodia pericial validada.
5. La autenticación de demostración con contraseñas publicadas no sirve para una operación real. La app deberá pasar a HTTPS, gestión de credenciales, permisos y auditoría de acceso.
6. No se ha ejecutado esta versión en navegador durante esta revisión. **Probarla en el equipo de presentación** y corregir cualquier diferencia con el código revisado.

---

## 4. Demostración principal: secuencia que debe ver el jurado

**Objetivo visual:** que una persona sin conocimientos técnicos entienda que el robot **recorre, encuentra una incidencia, se comporta de manera segura, solicita autorización y deja registros**.

### Escena 1 — Problema y solución (20–30 segundos)

Mostrar una imagen del entorno y explicar: «La limpieza autónoma reduce tareas repetitivas, pero puede enfrentar manchas ambiguas. ExpoClean añade criterios de decisión y trazabilidad». Seleccionar el escenario de **bodega**, porque es el más coherente con el primer piloto.

### Escena 2 — Recorrido autónomo (30–45 segundos)

1. Acceder a la web con un usuario `operador` de **demostración**.
2. Seleccionar **Bodega**, **Automático**, **A*** y velocidad adecuada.
3. Pulsar **Iniciar recorrido**.
4. Señalar en pantalla la ruta naranja, los obstáculos y la región marcada como atendida.
5. Explicar: «El algoritmo decide por dónde desplazarse dentro del plano digital».

**No decir:** «El robot real mapea solo con IA». **Decir:** «La simulación conoce los obstáculos y calcula rutas; para la versión física integraríamos LiDAR, odometría y localización».

### Escena 3 — Detección de una muestra conceptual (40–60 segundos)

La bodega incluye puntos de muestra preprogramados `B-01` (`organic`) y `B-02` (`unknown`). Cuando el robot se aproxima, la simulación cambia el estado de la misión.

Explicar: «Este sensor es conceptual y la etiqueta proviene del escenario; en el producto sustituiremos esa etiqueta por inspección visual y reglas de seguridad». Señalar en la interfaz el código de muestra, el estado de exclusión y la cola de protocolo.

### Escena 4 — Respuesta segura (40–60 segundos)

Mostrar la diferencia entre **muestra conocida de la demo** y **muestra desconocida**:

- **Conocida en el catálogo demo:** el sistema dispone de un código de protocolo ficticio y reserva la atención; no debe confundirse con identificación química real.
- **Desconocida:** excluye la zona, no le aplica producto, registra un código de muestra e indica revisión externa. El recorrido continúa solamente en otras áreas cuando la simulación lo permite.
- Al completar cobertura, las conocidas pueden requerir **confirmación de regreso** y **confirmación de tratamiento**; las desconocidas permanecen pendientes.

**Frase clave:** «Cuando el sistema no sabe qué hay en el piso, no improvisa una reacción química».

### Escena 5 — Visualización del robot y de sus módulos (20–30 segundos)

Pulsar **Ver módulos internos** y explicar **qué representa**, no qué existe físicamente: cámara/sensor propuestos, cartuchos cerrados, compartimentos separados, circuito de tratamiento y compartimento conceptual de muestras.

### Escena 6 — Registros y final (20–30 segundos)

Mostrar panel de muestras retenidas, eventos y botón de reportes. Guardar reporte *solo si la app está probada*. Explicar que SQLite ya almacena reportes y muestras desconocidas simuladas. Señalar **qué información adicional** registrará la fase futura: evidencia visual, reglas aplicadas, autorización, producto real, lote y resultado.

### Escena 7 — Visión futura (diapositiva; 20 segundos)

Presentar un **diagrama separado**, rotulado como propuesta:

```text
Fotografía del suelo
    ↓
Detección visual y localización de mancha (modelo CV)
    ↓
Evaluación contextual y gestión de incertidumbre
    ↓
¿Intervención autorizable?
    ├─ NO / NO SABEMOS → excluir zona + alertar operador
    └─ SÍ → protocolo aprobado + EcoProtocol
                    ↓
             ruta y ejecución
                    ↓
           fotografía posterior
                    ↓
              auditoría visual
```

### Respaldo de la demo

- **Plan A:** demo interactiva local.
- **Plan B:** video MP4 grabado del mismo flujo; sin edición que oculte fallos significativos.
- **Plan C:** capturas ordenadas en diapositivas; permiten explicar todo si falla Three.js.
- Ensayar el flujo con un cronómetro; si tarda demasiado en alcanzar las muestras, usar capturas o video, no improvisar cambios peligrosos de último minuto.

---

## 5. Arquitectura objetivo de software y datos (propuesta)

### Diagrama de componentes

```text
┌──────────────────────────────────────────────────────────────────────┐
│ UI WEB / CENTRO DE CONTROL                                           │
│ Three.js | 2D/3D | mapas | cámara | alarmas | informes | usuarios     │
└───────────────────────┬──────────────────────────────────────────────┘
                        │ HTTPS / REST + eventos (futuro)
┌───────────────────────▼──────────────────────────────────────────────┐
│ BACKEND PYTHON                                                       │
│ API y auth ─ registro ─ orquestador de misiones ─ almacenamiento     │
│    │          │                   │                                  │
│    ▼          ▼                   ▼                                  │
│ VISION AI   RISK ENGINE        PROTOCOL ENGINE                       │
│ OpenCV/NN   reglas/alertas     catálogo técnico aprobado             │
│    │          │                   │                                  │
│    └──────────┴─────────► ECOProtocol                                │
│                            autorizaciones y compatibilidad         │
│                                     │                                │
│                               MISSION CONTROLLER                     │
│                                     │                                │
│                              AUDIT / REPORTS                          │
│                                     │                                │
│                            SQLite + imágenes + eventos               │
└─────────────────────────────────────┬─────────────────────────────────┘
                                      │ control seguro autorizado
                            ┌─────────▼─────────┐
                            │ SIMULADOR ACTUAL  │
                            │ Three.js          │
                            └───────────────────┘
                                      │ etapa futura independiente
                            ┌─────────▼─────────┐
                            │ ROBOT ROS 2       │
                            │ Nav2 + Edge AI    │
                            │ MCU + actuadores  │
                            └───────────────────┘
```

### Tecnologías por fase

| Subsistema | Para la demostración actual | Desarrollo digital propuesto | Robot físico futuro |
|---|---|---|---|
| Frontend | HTML, CSS, JavaScript, Three.js | Componentes para subir fotos, mapa y auditoría | Panel web con HTTPS y credenciales |
| API | Python `ThreadingHTTPServer` | Endpoints de inspección, protocolos y auditoría; considerar FastAPI si crece | Gateway robot y manejo de misiones |
| Datos | SQLite | Historial de decisiones, catálogos y evidencias | SQLite local + posible servidor central |
| Visión | Categorías ficticias por posición | Python + OpenCV/NumPy, después modelo segmentador | Modelo optimizado con aceleración Edge AI |
| Navegación | A*/Dijkstra en cuadrícula | Zonas excluidas y metas derivadas de inspección | ROS 2, Nav2, SLAM Toolbox, fusión de sensores |
| Protocolo | `DEMO_SAMPLES` en JS | Reglas versionadas + fichas reales verificadas | Configuración autorizada por sitio, controles de actuador |
| Supervisión | Login, eventos y CSV | Alarmas, incidencias, vistas «antes/después» | Comunicación segura y registro de fallos |

### Responsabilidades y límites

- **Modelo visual:** observa características detectables; **no formula productos ni garantiza seguridad**.
- **Motor de riesgo:** clasifica la operación como `PERMITIR`, `REVISAR` o `BLOQUEAR` usando reglas y contexto.
- **Motor de protocolos:** propone una **receta operativa previamente aprobada** de limpieza, sin improvisar combinaciones químicas.
- **EcoProtocol:** aplica restricciones sobre producto, superficie, documentación, zona, autorización y registro ambiental.
- **Planificador:** determina trayectoria sobre un mapa y mantiene zonas prohibidas.
- **Ejecutor:** representa o ejecuta una operación **únicamente después** del permiso vigente y comprobación de interbloqueos.
- **Auditor:** compara evidencias visuales e indica incertidumbre, residuos persistentes y acciones siguientes.

### Organización futura de carpetas (NO confundir con estructura existente)

```text
ExpoClean/
├── dashboard-3d.js                   # Conservado: simulación web actual
├── index.html / styles.css
├── CleanBot_Simulacion_Avanzada/
│   ├── server.py                     # API actual; adaptar gradualmente
│   ├── static/
│   └── webots/
├── services/                         # NUEVO, cuando se implemente
│   ├── vision_service.py
│   ├── image_registration.py
│   ├── risk_engine.py
│   ├── protocol_engine.py
│   ├── ecoprotocol.py
│   ├── mission_orchestrator.py
│   └── audit_service.py
├── schemas/                          # contratos JSON/Pydantic futuros
├── data/
│   ├── product_documents/
│   ├── reference_images/
│   └── audit_images/
├── models/                            # modelos entrenados versionados
├── tests/
├── docs/
└── requirements-vision.txt
```

---

## 6. ExpoClean Vision — diseño técnico de visión computacional

### 6.1 Qué problema puede resolver realmente una cámara RGB

Una cámara orientada al suelo puede reconocer **regiones visuales** anómalas y propiedades observables: forma, tamaño, textura, brillo, bordes, color relativo y posición. **No proporciona directamente composición química, patógenos ni origen biológico**. Chocolate y heces pueden tener apariencias similares: la IA puede equivocarse aunque entregue un porcentaje de confianza alto. Todo caso ambiguo debe quedar sin limpieza química automática.

**Categorías de trabajo propuestas**, no diagnósticos químicos:

1. `solid_debris`: residuo sólido visible (polvo/gránulos/migas).
2. `adhered_stain`: mancha adherida visual.
3. `possible_liquid`: posible líquido/área húmeda (con mucha cautela por reflejos).
4. `visually_clear`: superficie sin anomalías detectadas dentro del límite de observación.
5. `unknown_or_ambiguous`: fuera de distribución, evidencia insuficiente o entorno riesgoso.

**No usar etiquetas de IA como** `heces`, `sangre`, `ácido`, `cloro`, `virus` o `bacteria` para seleccionar químicos sin identificación y validación externas.

### 6.2 Pipeline de procesamiento propuesto

**Entrada:** JPEG/PNG, ID de cámara, zona, hora, orientación, configuración de luz y referencia de suelo limpio si existe.

1. **Captura controlada:** cámara colocada a altura conocida, iluminación difusa, balance de blancos y exposición estabilizados, sin sombras intencionales.
2. **Calibración:** obtener intrínsecos (matriz de cámara y distorsión) y relación cámara–suelo; registrar intrínsecos por dispositivo.
3. **Rectificación:** corregir perspectiva de la superficie plana mediante homografía cuando existan puntos de referencia.
4. **Normalización:** corregir exposición con límites, reducir ruido, separar sombras y reflejos en la medida posible; no transformar indiscriminadamente la evidencia original.
5. **Segmentación:** (MVP) OpenCV + comparación con una referencia calibrada; (fase ML) modelo segmentador entrenado para producir máscaras por píxel.
6. **Extracción:** cálculo de máscara, área estimada, caja delimitadora, contorno, características y calidad de imagen.
7. **Evaluación de incertidumbre:** umbrales calibrados, indicador de mala iluminación y clases desconocidas; si no hay datos suficientes, devolver `unknown_or_ambiguous`.
8. **Ubicación:** proyectar centroide/borde a coordenadas de suelo y de mapa solamente si la cámara está calibrada y el robot localizado.
9. **Respuesta:** `detections[]`, imágenes de evidencia, geometría y razón de «revisión requerida».

**MVP sin red neuronal:** `cv2.absdiff` respecto a imagen limpia comparable; cambio de espacio de color (por ejemplo Lab), filtrado/umbral adaptado con datos de validación, operaciones morfológicas, componentes conectados y regiones mínimas. Esto detecta **diferencias**; no debe presentarse como clasificación semántica de sustancias. Es sensible a sombras, reflejos, elementos móviles y variación de luz.

**MVP con aprendizaje profundo:** partir de un segmentador preentrenado (por ejemplo una variante de YOLO-seg) y ajustarlo con dataset específico. Verificar la **licencia de uso** de la implementación elegida antes de comercializar. No es necesario entrenarlo para el pitch de mañana.

### 6.3 Dataset y entrenamiento, después del evento

- **Origen:** fotografías de pisos reales autorizados y manchas **seguras y conocidas** (tierra, polvo, migas, residuos inocuos, manchas artificiales), más pisos limpios; no recolectar muestras peligrosas para entrenar.
- **Diversidad:** cerámica, concreto sellado, vinilo; iluminación cálida/fría/natural; ángulos, cámaras, materiales y tonos diferentes.
- **Anotación:** herramienta tipo CVAT o Label Studio; máscaras poligonales, clase visual, procedencia de imagen, condición de iluminación y riesgo conocido **verificado por datos externos**.
- **Calidad:** doble revisión de una parte de etiquetas, control de duplicados y prevención de fuga entre entrenamiento y prueba.
- **Separación:** no poner fotografías casi iguales del mismo derrame en entrenamiento y prueba; separar por sesión, sitio y fecha.
- **Métricas:** IoU y mAP de segmentación, precisión/recall por clase, tasa de falsos negativos, tasa de casos inciertos rechazados y latencia por imagen.
- **Criterio de seguridad:** medir específicamente la tasa de **autorizaciones indebidas**; el motor de protocolos debe bloquear aunque el modelo emita una clase aparentemente segura si falta evidencia contextual.
- **Calibración:** ajustar probabilidades/umbrales sobre validación independiente; **0,9 de confianza de un modelo no significa 90 % de seguridad química**.
- **Versionado:** `model_version`, `dataset_version`, fecha, condiciones de validación y registro de cambio.

### 6.4 Posicionamiento de la mancha sobre el mapa

No basta con conocer el píxel `u,v`. Se necesita calibración del plano. Sobre un suelo aproximadamente plano:

\[
\begin{bmatrix}x'\\y'\\w'\end{bmatrix}
= H\begin{bmatrix}u\\v\\1\end{bmatrix},\qquad
(x,y)=\left(\frac{x'}{w'},\frac{y'}{w'}\right).
\]

Donde `H` es la homografía estimada a partir de correspondencias cámara-suelo; luego se transforma del sistema de coordenadas del robot al mapa mediante la pose estimada. Es necesario conservar la incertidumbre de calibración. Un enfoque inicial mucho más viable es que el operador **marque manualmente sobre el mapa la zona fotografiada**.

### 6.5 Sensores opcionales de análisis material — I+D, no MVP

La espectroscopía NIR o Raman y las cámaras hiperespectrales pueden aportar información adicional, pero necesitan calibraciones, referencias y condiciones de medición específicas; una mezcla desconocida puede seguir siendo ambigua. **No incluir un «sensor que reconoce químicos» genérico en el presupuesto principal**, ni prometer que identifica patógenos. La decisión más segura para sustancias sospechosas es **aislar/no intervenir y escalar a personal competente**.

---

## 7. Motor de riesgo: la capa que evita una mala aplicación

### Entradas

- Región y categoría visual; incertidumbre/calidad de imagen.
- Tipo de zona y restricciones (bodega normal, zona de sustancias, pasillo público, etc.).
- Material del piso, porosidad y recubrimientos.
- Reporte de incidentes del operador: qué se derramó, cuándo, documentación del material, fiabilidad de información.
- Presencia de personas, señalización, condiciones de ventilación y actividad.
- Existencia de procedimientos autorizados y disponibilidad de consumibles compatibles.

### Decisiones operativas

| Decisión | Condición típica | Comportamiento del sistema |
|---|---|---|
| `ALLOW_WITH_CHECKS` | Material y contexto suficientemente identificados **por fuente autorizada**, procedimiento aplicable disponible, evaluación de riesgo favorable, checks vigentes | Preparar propuesta y pedir autorizaciones correspondientes. |
| `REVIEW_REQUIRED` | Mancha visual ambigua, información incompleta, zona sensible, ausencia de ficha adecuada | Marcar área, no aplicar producto, pedir decisión de personal responsable. |
| `BLOCK` | Producto vencido/no autorizado, incompatibilidad, paro activo, posible derrame químico/biológico sin identificación o falla de seguridad | Bloquear aplicación y navegación hacia zona peligrosa; alertar y registrar. |

**Regla prioritaria:** la IA **nunca** puede reemplazar un `BLOCK` de un interbloqueo o regla de seguridad. Si falla una conexión, faltan datos críticos o se desconoce la sustancia, operar en **estado seguro**.

### Ejemplo clave para preguntas del jurado

Dos manchas marrones con igual apariencia, una chocolate y otra material biológico: la cámara puede clasificar **«mancha sólida/adherida marrón»**, pero no confirmar su origen. Si no hay registro fiable del material o procedimiento aprobado, la respuesta será **«revisión requerida»**. El sistema no asperja un producto solo porque el modelo parece seguro.

---

## 8. Motor de protocolos y EcoProtocol: separación técnica precisa

### Definiciones

**Protocolo de limpieza:** procedimiento que la organización aprobó **antes de ejecutar** para una combinación conocida de zona, superficie, tipo de suciedad, riesgo y equipos. Incluye identificación, pasos, límites operativos, persona autorizante, condiciones de paro y criterio de revisión.

**EcoProtocol:** validador que garantiza que el procedimiento y el producto seleccionados satisfagan **reglas de compatibilidad, documentación, estado de lote, condiciones de uso y política ambiental de la organización**. No es una IA que «inventa» detergentes ni un laboratorio que autentica la biodegradabilidad.

### Ejemplo de datos de un protocolo (ficticio, no una receta química)

```json
{
  "protocol_id": "PR-DEMO-01",
  "version": "1.0",
  "status": "demo_only",
  "surface_types": ["ceramica_no_porosa"],
  "visual_categories": ["adhered_stain"],
  "requires_identification": true,
  "allowed_product_ids": ["P-01-DEMO"],
  "requires_operator_approval": true,
  "max_passes": 2,
  "mechanical_action": "configured_brushing_only",
  "dosage_profile_ref": "DOC-APPROVED-ONLY",
  "unknown_material_policy": "BLOCK",
  "human_escalation_on_failure": true
}
```

**Los IDs son demostrativos**. Los parámetros de producto, dilución, tiempo de contacto, compatibilidad y uso real deben proceder **únicamente de instrucciones autorizadas y verificadas** por los responsables competentes; no generarlos mediante LLM. En entornos reales separar **limpieza** de **desinfección** y evitar afirmar eficacia microbiológica sin pruebas validadas.

### Validaciones obligatorias en EcoProtocol

1. La zona permite esa operación y el estado operativo es seguro.
2. La superficie admite el producto y la acción mecánica.
3. El tipo de intervención está permitido por procedimiento vigente.
4. Existe ficha técnica / SDS pertinente y versión registrada.
5. Se ha verificado el requisito sanitario ecuatoriano **aplicable al producto y uso concretos**, cuando corresponda; no declarar «certificado por ARCSA» sin documento auténtico.
6. Se conocen las restricciones y advertencias de uso, conservación, incompatibilidades y personal autorizado.
7. La información ambiental se apoya en **evidencia documental comprobable**, no solo en una etiqueta comercial de «eco».
8. El cartucho/lote físico coincide con el producto autorizado y no está vencido; el circuito de dispensación corresponde a ese producto y está íntegro.
9. El operador posee el perfil adecuado y aprueba si el procedimiento lo exige.
10. El robot no está en paro, no detecta fugas, tiene agua/energía suficiente y las condiciones del entorno siguen dentro de las permitidas.

### Pseudocódigo de decisión

```python
# ARQUITECTURA PROPUESTA, no código actual del repositorio.
def decidir_intervencion(observacion, contexto, robot):
    if robot.emergency_stop or not robot.safety_chain_ok:
        return bloqueado("Interbloqueo de seguridad")
    if observacion.uncertain or contexto.material_desconocido:
        return revision("No identificado: evitar aplicación química")
    riesgo = evaluar_riesgo(observacion, contexto)
    if riesgo.status != "ALLOW_WITH_CHECKS":
        return escalar(riesgo)
    protocolo = buscar_protocolo_aprobado(contexto, observacion)
    if protocolo is None:
        return revision("No existe protocolo compatible")
    ecocheck = validar_ecoprotocol(protocolo, contexto, robot)
    if not ecocheck.aprobado:
        return bloqueado(ecocheck.motivos)
    return pendiente_autorizacion(protocolo)
```

### Auditoría de la decisión

Guardar por cada propuesta: `inspection_id`, detección visual, contexto, versión del modelo/reglas/protocolo, `product_id`, `lot_id`, aprobación o rechazo, motivos, usuario responsable, fecha, operador, robot, geolocalización **interna del plano**, fotografías y resultado. La edición o eliminación de fichas debe quedar versionada; no modificar retrospectivamente un reporte ya emitido.

---

## 9. Navegación, planificación y ejecución

### Funciones presentes en el simulador

- Cuadrícula con obstáculos predefinidos, planificación A*/Dijkstra, ruta automática, puntos objetivo manuales y zonas excluidas por muestras.
- La distancia, velocidad y batería son variables simuladas, no datos de encoders físicos.

### Para el MVP digital ampliado

1. Importación o dibujo de un plano y definición de una escala conocida.
2. Editor de zonas: transitables, prohibidas, con suciedad, restringidas, de carga y de servicio.
3. Conversión de detecciones visuales a objetivos del mapa (inicialmente con confirmación manual).
4. Plan global con A*; costo adicional por cercanía a obstáculos, estrechez y condiciones de operación.
5. Plan de cobertura que considere **ancho del cepillo y solapamiento**, no solo celdas muestreadas.
6. Verificación de rutas imposibles y replanteamiento cuando aparece un obstáculo o cambia un protocolo.
7. Pausa, cancelación, paro latcheado, zonas en revisión e intervención humana.

### Robot físico futuro

- **Odometría:** encoders de ruedas, diámetro calibrado, separación efectiva entre ruedas y cinemática diferencial.
- **Estimación de orientación:** IMU y sensores de ruedas, con fusión de estimaciones y evaluación de deriva.
- **Localización/mapeo:** LiDAR 2D + SLAM Toolbox o mapa previo con localización compatible; obstáculos dinámicos con sensores redundantes.
- **Planificación y control:** ROS 2 + Nav2; costmaps, zonas prohibidas, velocidades restringidas, seguimiento de trayectorias; control de bajo nivel separado.
- **Seguridad física:** no depender únicamente del mapa SLAM, un modelo visual o ROS para impedir colisiones con personas.
- **Cobertura:** patrones tipo boustrophedon para superficies abiertas, bordes, zonas restringidas y pasada de recuperación; parámetros establecidos según geometría real del dispositivo.

Documentación de referencia para la fase futura: https://docs.nav2.org/rolling/tutorials/general_tutorials/navigation2_with_slam/navigation2_with_slam/ .

---

## 10. Auditoría visual de calidad — la función diferenciadora futura

### Secuencia

1. Capturar `before.jpg` y guardar metadatos de iluminación, cámara y posición.
2. Detectar la máscara inicial `M_before` y documentar límites de validez.
3. Ejecutar la misión autorizada, registrando ruta, tiempos, velocidad y acción.
4. Capturar `after.jpg` desde una vista comparable; alinear y rectificar imágenes.
5. Detectar `M_after` en **la misma región de interés**; corregir área si cambia la escala.
6. Calcular residuo visible y cambio relativo; informar intervalo/incertidumbre cuando corresponda.
7. Si quedan residuos: **solo repetir** si el protocolo permite otra pasada y los límites de seguridad siguen vigentes. En otro caso, escalar a operador.

### Indicadores

- **Reducción del área visual detectada (estimación):**  
  `reduccion_visual_pct = 100 × (A_antes − A_despues) / A_antes`, si `A_antes > 0` y ambas máscaras son comparables.
- **Cobertura geométrica:** región alcanzada por la huella de limpieza / superficie transitable planificada; no equivale a limpieza lograda.
- **Zonas pendientes:** áreas aisladas o sin evidencia suficiente.
- **Intervenciones completadas, reintentadas o escaladas.**
- **Tiempo, longitud de ruta, consumo de agua/producto (solo medido en hardware), incidencias y autorizaciones.**

**Advertencia:** una reducción visual del 90 % NO es reducción microbiológica del 90 %; reflejos, iluminación, sombra, desplazamiento de cámara o una mancha transparente pueden invalidar la comparación.

### Datos de un informe futuro

```json
{
  "audit_id": "AUD-001",
  "mission_id": "M-001",
  "inspection_before_id": "IMG-001",
  "inspection_after_id": "IMG-002",
  "surface": "ceramica_no_porosa",
  "registration_valid": true,
  "visible_area_before_px": 4200,
  "visible_area_after_px": 800,
  "visual_reduction_percent": 80.95,
  "protocol_id": "PR-DEMO-01",
  "protocol_version": "1.0",
  "model_version": "not_applicable_demo",
  "decision": "REVIEW_REQUIRED",
  "note": "Ejemplo de esquema; no corresponde a una medición realizada"
}
```

---

## 11. Diseño electromecánico FUTURO: alcance, estructura y accionamientos

> **No se construirá ni certificará mañana.** Se incluye para responder con precisión «¿cómo lo fabricarían?». Las magnitudes a continuación son **hipótesis de ingeniería que deberán dimensionarse**, no componentes ya adquiridos o montados.

### 11.1 Dos prototipos físicos distintos

**A) Maqueta electromecánica de laboratorio (siguiente etapa):** chasis pequeño con 2 ruedas motrices, rueda loca, motores con encoder, batería de baja tensión, MCU, interruptor de paro, cámara y sensor frontal; **sin químicos y sin función desinfectante**. Sirve para probar odometría, control, comunicaciones y trayectorias.

**B) Piloto funcional supervisado para piso de bodega:** plataforma diferencial sobre piso duro con cepillo, circuito hidráulico aislado, recogida de agua sucia, sensores de navegación, computador Edge, MCU y cadena de seguridad diseñada y comprobada profesionalmente. **Solo agua o soluciones aprobadas para ensayos autorizados**, según fase.

### 11.2 Mecánica y locomoción

| Elemento | Concepto seleccionado | Criterio de dimensionamiento |
|---|---|---|
| Chasis | Estructura rígida, superficies lavables y compartimentos separados | Carga máxima, centro de gravedad, mantenimiento, protección ante fugas |
| Tracción | **Diferencial**, dos ruedas motrices independientes con reductores y encoders | Masa, pendiente máxima declarada, aceleración, rozamiento y torque de arranque |
| Apoyo | Rueda(s) loca(s) o rodillo(s) con estabilidad adecuada | No vuelco, paso de juntas y compatibilidad con suelo |
| Limpieza | Cabezal de cepillo o fregado sustituible | Ancho, presión, velocidad, abrasividad y superficie |
| Líquidos | Tanque limpio y tanque de recuperación físicamente separados | Volumen, nivel, accesibilidad, hermeticidad |
| Recuperación | Boquilla/squeegee y aspiración apropiada para ensayo | Evitar dejar piso mojado/resbaladizo |
| Carcasa | Material compatible con humedad y limpiables | Grado de protección a verificar, no prometer IP certificado |
| Interfaces | Puertos protegidos, mantenimiento, panel y señalización luminosa | Acceso al E-stop y estado de la máquina |

**Evitar en la primera etapa:** UV-C junto a personas, nebulización automática de sustancias peligrosas, mezcla de químicos dentro del robot, recogida física de sustancias sospechosas, entornos explosivos o clínicos sin validación específica.

### 11.3 Componentes electrónicos de referencia — BOM del piloto futuro

Los ejemplos no significan elección comercial definitiva. Sustituir tras calcular cargas, compatibilidades y disponibilidad.

| Subsistema | Cantidad de referencia | Componente / tipo | Función e interfaz |
|---|---:|---|---|
| Computadora de alto nivel | 1 | Raspberry Pi 5 (prototipo) **o** NVIDIA Jetson Orin Nano Super (Edge AI más exigente) | Procesar imágenes, ROS 2, comunicaciones; USB/Ethernet/MIPI según elección |
| Controlador bajo nivel | 1 | ESP32-S3 u otro MCU con PWM, encoder y watchdog | Comandos de tracción, lecturas y supervisión local |
| Sensado del suelo | 1–2 | Cámara RGB con óptica fija y luz controlada, USB/MIPI | Capturas antes/después, inspección próxima al piso |
| Navegación | 1 | LiDAR 2D compatible con Linux/ROS 2 | Datos de obstáculos y SLAM, normalmente USB/UART |
| Proximidad | 2–4 | ToF/ultrasónico **solo complementarios** | Borde bajo / proximidad; interfaces I²C/UART/GPIO según modelo |
| Odometría | 2 | Encoders en ruedas/motores | Pulsos de desplazamiento y velocidad |
| Orientación | 1 | IMU 6/9 ejes | Giro/aceleración, I²C/SPI |
| Contacto | 2+ | Parachoques con interruptores apropiados | Detección física de contacto; seguridad según análisis |
| Tracción | 2 | Motores DC 24 V con reductores y encoders, potencia por dimensionar | Ruedas izquierda y derecha |
| Drivers | 2 canales | Controladores de motor 24 V dimensionados para corriente de arranque y frenado | Comandos PWM/dirección o bus industrial; protección |
| Cepillo | 1 | Motor + cabezal adecuados al piso | Acción mecánica supervisada |
| Dispensación | 1 | Bomba/válvula **compatible con líquido aprobado** y circuito separado | Aplicación controlada, sin mezclas improvisadas |
| Recuperación | 1 | Motor de aspiración apto para el líquido del ensayo | Retiro de agua sucia; requiere ensayos adicionales |
| Nivel/flujo | 2–4 | Sensores de nivel, flujo y detección de fugas | Impedir trabajo en vacío, registrar consumo real |
| Alimentación | 1 | Batería LiFePO₄ nominal 24/25,6 V **con BMS adecuado** | Energía de tracción y auxiliares |
| Distribución | 1 conjunto | Fusibles/interruptores, contactor o mecanismo seguro, DC-DC 24→12 V y 24→5 V | Separar potencias, limitar fallas y alimentar lógica |
| Paro de emergencia | 1+ | Pulsador(es) apropiados + circuito de parada de seguridad diseñado según riesgo | Cortar energía peligrosa a actuadores independientemente de software |
| Comunicaciones | 1 conjunto | Wi-Fi/Ethernet; CAN si se justifica | Intercambio SBC–MCU y tablero |
| Estado | 1 conjunto | Indicadores LED/buzzer, interruptor principal, medidores | Señalización de operación/alarma |
| Protección | 1 conjunto | Estructura, cajas, conectores, cableado y separadores | Estabilidad mecánica, humedad y mantenimiento seguro |

**Sobre los computadores:** Jetson Orin Nano Super se anuncia con hasta **67 TOPS INT8** y rango de consumo de referencia de **7–25 W**, sujeto a configuración; Raspberry Pi 5 tiene CPU Arm y opciones de cámara/USB. La capacidad de inferencia efectiva depende del modelo, resolución, conversión y pruebas reales, no de la cifra comercial de TOPS. Fuentes: NVIDIA https://www.nvidia.com/es-es/autonomous-machines/embedded-systems/jetson-orin/nano-super-developer-kit/ y Raspberry Pi https://www.raspberrypi.com/products/raspberry-pi-5/ .

### 11.4 Distribución de energía propuesta (bloques, no plano de cableado final)

```text
           BATERÍA LiFePO4 (24/25.6 V nominal)
                      │
                 BMS + fusible
                      │
               INTERRUPTOR GENERAL
                      │
                 DISTRIBUCIÓN DC
            ┌─────────┴──────────────────┐
            │                            │
      RAMA DE POTENCIA              RAMA DE LÓGICA
      ┌─────▼─────────┐           ┌──────▼────────┐
      │ CONTACTOR /   │           │ DC-DC 24→12 V │→ auxiliares permitidos
      │ SISTEMA DE    │           │ DC-DC 24→5 V  │→ SBC/MCU/sensores
      │ PARADA SEGURA │           └───────────────┘
      └─────┬─────────┘
            │
    ┌───────┼──────────────┐
    │       │              │
 Driver   Cepillo       Bomba / recuperación
 motores  y motor       (circuitos según riesgo)
    │
 Ruedas con encoder
```

- El **E-stop físico** no dependerá de una orden JS, la red Wi-Fi, ROS o una API.
- El diseño debe definir **categoría de paro**, control de energía peligrosa y estado tras recuperar alimentación con análisis profesional de riesgos.
- El computador puede continuar registrando el incidente aunque la rama de accionamientos quede sin energía; la separación debe diseñarse para no introducir una nueva situación peligrosa.
- Seleccionar fusibles, calibre de cable, conectores, drivers y mecanismos de aislamiento según corrientes continuas y de arranque **medidas o sustentadas**, no copiando un tutorial.
- Proteger contra inversión de polaridad, sobrecorriente, sobretemperatura, humedad, cortocircuitos, fuga de líquido y falla del BMS. No cargar baterías mientras se realiza intervención sin validación del fabricante.
- Los motores y bombas generan ruido eléctrico: diseñar masa, retornos, filtrado, rutas separadas y protección de señales. El conductor de protección, si aplica, se diseña según normas eléctricas del equipo.

### 11.5 Conexiones lógicas / cableado de referencia (NO asignación de pines definitiva)

| Origen | Destino | Señal | Precaución |
|---|---|---|---|
| Cámara UVC/MIPI | SBC | USB 3 / CSI según modelo | Potencia y longitud admisibles; lente protegida contra salpicaduras |
| LiDAR | SBC | USB o UART apropiado | Velocidad de datos, ubicación y altura del sensor |
| SBC | MCU | UART/CAN/USB con protocolo definido | Watchdog, mensajes con timeout, identificador de secuencia y CRC donde aplique |
| MCU | Drivers de tracción | PWM/dirección/habilitación según fabricante | No conectar motores directamente a GPIO; limitar velocidad y corriente |
| Encoders | MCU | Pulsos A/B con niveles acondicionados | Compatibilidad 3,3 V/5 V; interrupciones y protección |
| IMU | SBC o MCU | I²C/SPI | Niveles y tierra adecuados, calibración |
| Sensores de nivel/flujo | MCU | ADC/digital/contador | Acondicionamiento y verificación de fallos de cable |
| Detección de fuga | MCU y, si aplica, función protectora independiente | Discreto/analógico | Reacción definida y segura ante sensor en falla |
| Estado de paro | Sistema de seguridad + monitoreo MCU | Entradas adecuadas | Circuito de paro separado de control normal; no usar GPIO como única protección |
| MCU | Control de cepillo/bomba | Driver/contactores apropiados | Interbloqueos físicos y realimentación, no solo variable booleana |

**Lógica local mínima:** si no llega una orden válida dentro de un tiempo establecido por análisis de riesgos, el MCU pasa a **estado definido de parada segura**; no continúa la última velocidad. Los tiempos exactos se determinan después de medir velocidad, distancia de frenado y peligro.

### 11.6 Dimensionamiento energético ilustrativo, NO autonomía garantizada

Una batería nominal de **25,6 V × 20 Ah = 512 Wh** de energía teórica. Si se planificase un uso conservador ilustrativo de **70 %** de esa energía y una carga media *hipotética* de **300 W**, el cálculo daría `512 × 0,70 / 300 ≈ 1,2 horas`. **No es una estimación validada de autonomía del robot**: motores, suelo, cepillo, aspiración, paradas y pérdidas cambian el resultado. La batería final y BMS se eligen midiendo perfiles reales de consumo y margen térmico.

---

## 12. Firmware, comunicaciones y control de bajo nivel

### Reparto de responsabilidades

**SBC (Raspberry/Jetson):** API local, lectura de cámara, ROS 2, SLAM/Nav2, gestión de tareas, visualización y almacenamiento.

**MCU (ESP32-S3 o equivalente):** lectura de encoders, control cerrado de velocidad de motor, señales de estado, telemetría y gestión de fallos de comunicación. El MCU **no reemplaza** la función independiente de paro seguro.

### Estados sugeridos para controlador de misión

```text
OFF → BOOT → SELF_TEST → IDLE → MAP_READY → INSPECT
                                     │
                                     ▼
                               RISK_EVALUATION
                         ┌─────────┴──────────┐
                         │                    │
                    REVIEW/BLOCK         APPROVAL_PENDING
                         │                    │
                    SAFE_HOLD                ▼
                                          NAVIGATE
                                             ▼
                                         EXECUTE
                                             ▼
                                          VERIFY
                                       ┌─────┴──────┐
                                    PASS        RESIDUAL
                                     │               │
                                   REPORT     REPEAT_IF_ALLOWED
                                                   │
                                            REPORT/ESCALATE

En TODOS los estados: E_STOP / FATAL_FAULT → SAFE_STOP + registro
```

**Reglas:** no reanudar automáticamente después de una emergencia; autorizar de nuevo según procedimiento. Diferenciar **PAUSE** (pausa reversible operativa) de **E_STOP** (paro de seguridad) y **BLOCK** (denegación de protocolo). El simulador tiene representaciones parciales de estos estados, no las garantías físicas.

### Contrato mínimo de comunicación propuesto

- Mensajes SBC→MCU: `sequence`, `timestamp`, `command_type`, `target_velocity_left/right`, `enable_request`, `mission_id`.
- Respuestas MCU→SBC: `sequence_ack`, `measured_velocity`, `encoder_count`, `battery_voltage`, `motor_current`, `faults`, `safety_chain_status`, `sensor_health`.
- Rechazar comandos fuera de rango, caducados, repetidos o incoherentes; validar unidades y signos.
- La lógica de accionamiento no deberá confiar en señales de red no autenticadas.
- Registrar estado y errores con reloj consistente y trazabilidad de versión firmware.

---

## 13. API y modelo de base de datos futuros

### Endpoints actuales del servidor avanzado

Según el código: `/api/health`, `/api/login`, `/api/logout`, `/api/me`, `/api/reports`, `/api/reports.csv`, `/api/samples`, `/api/users`. Su contenido y permisos se definen en `CleanBot_Simulacion_Avanzada/server.py`.

### Nuevos endpoints propuestos — NO EXISTEN TODAVÍA

| Método | Ruta | Entrada → salida |
|---|---|---|
| `POST` | `/api/vision/inspect` | Foto + `zone_id` → detecciones y revisión |
| `POST` | `/api/vision/audit` | `before_id`, `after_id`, `mission_id` → comparación |
| `GET` | `/api/zones` | Zonas y superficies autorizadas |
| `POST` | `/api/risk/evaluate` | Detección + contexto → decisión y motivos |
| `GET` | `/api/protocols` | Listado de protocolos vigentes / versiones |
| `POST` | `/api/ecoprotocol/evaluate` | Protocolo + zona + producto + equipo → permiso o bloqueo |
| `POST` | `/api/missions` | Misión propuesta → ID + estado inicial |
| `POST` | `/api/missions/{id}/approve` | Autorización autenticada → transición de estado |
| `GET` | `/api/missions/{id}/events` | Timeline íntegro de decisiones |
| `GET` | `/api/audits/{id}` | Informe con enlaces a imágenes y criterios |

### Entidades persistentes

```text
users(id, role, credential_hash, ...)
facilities(id, name, ...)
zones(id, facility_id, surface_type, risk_level, polygon, ...)
products(id, manufacturer, technical_doc_ref, sds_ref, expiry, ...)
product_documents(id, product_id, type, version, verified_by, ...)
protocols(id, version, status, zone_rules, pass_limits, ...)
protocol_product_rules(protocol_id, product_id, compatibility, ...)
inspections(id, zone_id, image_path, camera_meta, timestamp, ...)
detections(id, inspection_id, class, score, mask_path, uncertainty, ...)
risk_decisions(id, detection_id, status, reason_codes, engine_version, ...)
missions(id, zone_id, status, robot_id, assigned_operator_id, ...)
authorizations(id, mission_id, user_id, action, timestamp, ...)
mission_events(id, mission_id, event_type, payload_json, timestamp, ...)
audits(id, mission_id, before_id, after_id, result, limitations, ...)
```

**Principios:** claves y relaciones coherentes, restricciones de integridad, timestamps en UTC, IDs no predecibles para evidencias, índices de búsqueda, migraciones versionadas, copias de seguridad y política de retención. Guardar imágenes fuera de SQLite y referencias/huellas de integridad en registros. Acceso basado en roles y ubicación; la información de instalaciones y fotos puede ser sensible.

### Ejemplo de respuesta de detección (solo contrato)

```json
{
  "inspection_id": "INSP-20261017-001",
  "mode": "future_proposal",
  "image_quality": "acceptable",
  "detections": [
    {
      "id": "DET-01",
      "visual_class": "adhered_stain",
      "bbox_px": [138, 92, 74, 61],
      "confidence_calibrated": null,
      "requires_human_review": true,
      "reason_codes": ["MATERIAL_NOT_IDENTIFIED"]
    }
  ],
  "chemical_identity": null,
  "chemical_action_authorized": false
}
```

---

## 14. Pruebas, métricas y criterios de aceptación

### 14.1 Verificación digital que sí pueden hacer antes de mañana

| ID | Prueba | Resultado esperado | Evidencia |
|---|---|---|---|
| T01 | Iniciar demo desde el servidor correcto | Web 3D carga sin errores críticos | Captura + consola |
| T02 | Login `operador` de demo | Acceso al panel y restricciones coherentes | Captura |
| T03 | Cambiar escenario | Obstáculos/ruta se restablecen | Video corto |
| T04 | A* | Ruta a celda válida, sin atravesar obstáculos | Captura de recorrido |
| T05 | Dijkstra | Ruta alternativa válida | Captura |
| T06 | Muestra `organic` preconfigurada | Se indica protocolo `PR-DEMO-01` y flujo de confirmación | Captura |
| T07 | Muestra `unknown` | **No** aplicar producto en esa región; dejar alerta | Captura + registro |
| T08 | Código de custodia | Registro desconocido recuperable tras recargar la web | Consulta a tabla |
| T09 | Paro seguro simulado | La lógica visual detiene aplicación y requiere reinicio | Video |
| T10 | Reporte SQLite | El registro persiste tras refrescar sesión | Tabla + CSV |
| T11 | Perfil observador | No puede guardar/operar según permisos esperados | Captura |
| T12 | Desconexión o error deliberado | La demo no finge éxito al fallar el guardado de muestra | Registro de error |
| T13 | Modo sin internet tras `npm install` | Recursos Three.js se sirven localmente | Ensayo sin Wi-Fi |
| T14 | Video respaldo | Reproduce completo y audio se entiende | Archivo local |

**Meta técnica para el pitch:** sin fallas críticas durante un ensayo completo del flujo, clasificación correctamente descrita como ficticia, bloqueo del escenario desconocido comprobado y respaldo multimedia funcional. Documentar cualquier anomalía observada antes de presentar.

### 14.2 Plan de validación digital futura

- **CV:** segmentación sobre set de prueba independiente, calibración, falsos positivos por sombra/agua limpia/reflejos y detección de escenas fuera de distribución.
- **EcoProtocol:** pruebas de combinaciones permitidas/denegadas, productos vencidos, SDS ausente, piso incompatible, rol insuficiente y autorización caducada.
- **Integración:** una detección no debe saltarse riesgo ni EcoProtocol al crear misión.
- **Auditoría:** registrar imágenes, repetir comparación con condiciones controladas; validar que sombras/reflejos invalidan medición si procede.
- **Ciberseguridad:** autenticación, control por roles, tamaño máximo de archivos, validación de MIME y contenido real, prevención de path traversal, limites de tasa, gestión de secretos.
- **Resiliencia:** desconexión de servidor, pérdida de cámara, duplicación de comandos, reporte no guardado y recuperación después de paro.

### 14.3 Plan de ensayos físicos futuros

1. Banco sin líquidos: ruedas elevadas, encoders, drivers, watchdog y paro.
2. Pruebas de tracción a baja velocidad en zona cercada y sin personas cerca.
3. Distancia real de frenado, latencias de sensores y reacción ante obstáculos.
4. Eficacia de cobertura sobre cuadrícula física con marcadores no contaminantes.
5. Circuito solo con agua, estanqueidad, retorno de agua sucia y suelos resbaladizos.
6. Función visual sobre residuos seguros, antes/después y condiciones cambiantes.
7. Pruebas de humedad, vibración, batería, caída de tensión y fallas simuladas.
8. Solo después, revisión profesional de sustancias autorizadas y conformidad de equipo.

**No hacer ensayos con agentes patógenos, fluidos biológicos reales o derrames peligrosos en el hackathon.**

---

## 15. Seguridad, estándares y contexto regulatorio

### Referencias técnicas internacionales para estudio de ingeniería

- **IEC 63327:2021**, requisitos particulares de seguridad para máquinas automáticas comerciales de tratamiento de pisos. Incluye equipos automáticos interiores; se aplica junto a requisitos pertinentes de IEC 60335-2-72. Fuente IEC: https://webstore.iec.ch/en/publication/62787 .
- **IEC 60335-2-72:2021**, requisitos de seguridad para máquinas comerciales de tratamiento de pisos con o sin tracción. Fuente IEC: https://webstore.iec.ch/en/publication/64778 .
- **ISO 12100**, metodología general de evaluación/reducción de riesgos de máquinas; comprobar edición y alcance aplicable antes de ingeniería de conformidad.
- **ISO 13849-1 / IEC 62061**, referencias de seguridad funcional para controles relacionados con seguridad; el Performance Level/SIL se determina mediante análisis, no por declararlo en el pitch.
- **Fichas de datos de seguridad (SDS) y etiquetado del producto**, así como instrucciones de fabricante, uso permitido y seguridad laboral aplicable.
- **ARCSA / INEN / normativa ecuatoriana pertinente:** realizar análisis regulatorio por categoría exacta del producto, finalidad declarada y entorno de uso. No convertir requisitos genéricos en una falsa afirmación de aprobación.

### Riesgos prioritarios y contramedidas de diseño

| Riesgo | Medida conceptual |
|---|---|
| Confundir material peligroso con alimento | Abstención del modelo + reglas de contexto + bloqueo + escalamiento. |
| Aplicar producto incompatible | Catálogo versionado, documentos verificados, autorización y bloqueo independiente. |
| Colisión con persona | Gestión de áreas, sensores, reducción de velocidad, análisis de parada, evaluación de seguridad física. |
| Fuga de líquido / suelo resbaloso | Detección de fuga, tanque de recuperación, paro, señalización y procedimiento. |
| Arranque inesperado tras paro | Estado seguro enclavado y rearme según evaluación de seguridad. |
| Batería sobrecorriente/sobrecalentamiento | BMS, protecciones, dimensionamiento y pruebas de instalación. |
| Robo de credenciales | Autenticación robusta, TLS, permisos y no usar contraseñas demo en producción. |
| Imagen ambigua o cámara sucia | Métrica de calidad, rechazo, limpieza del lente y revisión humana. |
| Documento de producto desactualizado | Vigencia, revisión documental, control de versiones y auditoría. |
| Confusión «limpio» vs «desinfectado» | Informes de reducción **visual** y lenguaje técnicamente limitado. |
| Toma de muestras biológicas | **No diseñar muestreo autónomo** sin proceso especializado de bioseguridad y cadena de custodia real. |

---

## 16. Presupuesto preliminar y viabilidad económica (USD)

**No es una cotización ni un precio de mercado confirmado en Ecuador.** Son bandas **ilustrativas para discusión de viabilidad** del piloto completo: pueden variar ampliamente por importación, proveedor, capacidad, seguridad, infraestructura y ensayos; **no incluyen salarios, IVA/importación, certificación, herramientas, laboratorio ni mantenimiento**.

| Subsistema de piloto físico | Supuesto de planificación (USD) |
|---|---:|
| Computador SBC / Edge AI | 90–450 |
| LiDAR / localización | 120–600 |
| Cámara, lente y luz | 40–180 |
| Dos motores con reductores y encoder | 120–400 |
| Drivers | 80–250 |
| MCU y buses | 10–35 |
| IMU, proximidad, niveles, flujo, sensores auxiliares | 70–300 |
| Batería y gestión energética | 180–450 |
| Distribución, protecciones y seguridad eléctrica inicial | 180–650 |
| Cepillo, bomba, recuperación y componentes fluidos | 300–1200 |
| Chasis, ruedas, carcasa y fabricación | 200–600 |
| **Total ilustrativo de componentes** | **1.390–5.115 USD** |

**Importante:** el costo final de un producto comercial seguro será mayor al de estos componentes. La diferencia incluye desarrollo, ingeniería, pruebas, documentos, logística, cumplimiento, integraciones y soporte. Este rango **no** es garantía de fabricar un robot seguro por ese monto.

### Diseño digital para el Hackathon

- Coste marginal de software local: muy bajo si el equipo ya tiene portátil y programas instalados.
- Three.js tiene licencia MIT; otras dependencias/modelos deben revisarse individualmente para explotación comercial.
- El equipo puede priorizar simulación, documentación y arquitectura sin adquirir hardware para la defensa de ideas.

### Modelo de negocio a validar

1. Cliente inicial: operador de instalaciones industriales medianas/grandes o empresa de limpieza B2B.
2. Venta o alquiler del robot (solo tras validación física).
3. Suscripción por gestión de flota, reportes, EcoProtocol y mantenimiento documental, si los usuarios consideran valioso el servicio.
4. Servicio de despliegue: mapeo, capacitación, actualización de protocolos y soporte.
5. Métricas comerciales del piloto: horas humanas liberadas sin desplazar indebidamente funciones de seguridad, agua por m², producto por m², tiempos, incidencias y costo operativo total. **Comparar con línea de base**, no inventar porcentajes.

---

## 17. Plan de trabajo de aquí a la presentación

### Viernes 16/10 — cierre de la jornada

- Congelar propuesta central: visión + seguridad de decisiones + EcoProtocol + trazabilidad.
- Ensayar la aplicación 3D en un portátil y registrar errores **antes de darla por lista**.
- Seleccionar escenario **bodega** para el relato principal.
- Guardar video del flujo y cinco capturas de alta calidad.
- Acordar roles, tiempos y archivo final de presentación.
- Corregir el lenguaje: todo lo no implementado debe aparecer como **«propuesto»**.
- Recoger preguntas de mentores; documentar objeciones y respuestas.

### Sábado 17/10 — mañana y tarde

| Momento | Responsabilidad | Entregable |
|---|---|---|
| 08:30–09:00 | Equipo técnico | Validación de PC, cargador, presentación y vídeo. |
| 09:00–10:00 | Técnico + comunicación | Últimas correcciones de bajo riesgo, capturas y texto final. |
| 10:00–10:30 | Expositor | Tomar notas de conferencia y ajustar estructura. |
| 11:30–13:15 | Todos | Obtener validación, registrar críticas, comprobar viabilidad. |
| 14:00–15:00 | Coordinación | Congelar código, presentar prueba completa de la demo y backup. |
| **Antes de 16:00** | Coordinación | Entregar materiales según indicación de organización. |
| **16:15–18:15** | Expositor + operador demo | Pitch en el turno asignado, sin depender de cambios de código. |

### Roles sugeridos — adaptar al número real de integrantes

- **Vocería:** presenta problema, diferenciación, límites y futuro.
- **Operador demo:** controla la web en un portátil y ejecuta flujo conocido.
- **Software/robótica:** contesta A*, mapa, física futura, estados y API.
- **IA y seguridad:** contesta visión, ambigüedad, sensores y EcoProtocol.
- **Negocio/documentación:** mercado, riesgos, validación, presupuesto y materiales de respaldo.

No hace falta que cada papel sea una persona distinta.

---

## 18. Diapositivas exactas sugeridas

**8 diapositivas**, con **poco texto y gran peso visual**. Si hay límite menor, combinar 3+4 y 6+7.

| # | Título | Elemento visual | Idea oral central |
|---:|---|---|---|
| 1 | «ExpoClean: de recorrer a decidir» | Render 3D del robot y una frase | Qué propone el equipo. |
| 2 | «El problema de la limpieza de riesgo» | Tres iconos: exposición, sustancias, evidencia | No basta con automatizar movimientos. |
| 3 | «Así opera ExpoClean» | Flujo observar→riesgo→autorizar→actuar→verificar | Ciclo de decisiones. |
| 4 | «Ejemplo: chocolate o material biológico» | Dos manchas visualmente similares | La cámara no siempre identifica composición; se detiene. |
| 5 | «EcoProtocol: seguridad antes que químicos» | Ficha/checklist y semáforo | Reglas independientes del modelo. |
| 6 | «Nuestra simulación 3D» | Capturas reales del repositorio | Qué está construido digitalmente. |
| 7 | «Arquitectura y viabilidad» | Diagrama SBC–MCU, cámara, LiDAR, API | Ruta técnica de implementación. |
| 8 | «Impacto y plan de validación» | Roadmap, KPI, cierre | Cómo demostrarán beneficios y seguridad. |

### Distribución propuesta de un pitch de cinco minutos (adaptable, NO duración oficial)

| Tramo | Contenido | Quién |
|---|---|---|
| 0:00–0:35 | Gancho: una mancha ambigua y riesgo de intervenir a ciegas | Vocería |
| 0:35–1:05 | Problema real en instalaciones | Vocería |
| 1:05–1:50 | Solución y tres módulos | Vocería / IA |
| 1:50–2:45 | Recorrido por escenas y decisión sobre muestra desconocida | Operador demo |
| 2:45–3:25 | Cómo funciona realmente; qué es simulado y qué será físico | Técnico |
| 3:25–4:10 | Diferenciación, seguridad, EcoProtocol | IA / vocería |
| 4:10–4:45 | Clientes, validación, costos orientativos y fases | Negocio |
| 4:45–5:00 | Cierre memorable | Vocería |

### Guion oral base listo para adaptar

> «¿Qué debería hacer un robot cuando encuentra una mancha que parece chocolate, pero podría ser material biológico? Una fotografía por sí sola no permite conocer siempre su composición. Por eso ExpoClean no propone una IA que adivine químicos. Proponemos un sistema que combine detección de suciedad visible, evaluación de riesgos y protocolos previamente aprobados. Si el material no está identificado, bloquea la intervención química y notifica al responsable. Cuando sí existe un procedimiento autorizado, el sistema planifica la ruta, documenta la operación y, en su versión avanzada, compara imágenes antes y después para evaluar cambios visibles. Hoy hemos desarrollado una simulación 3D que representa navegación, incidentes, bloqueos, confirmaciones y registros; la detección por cámara y el robot físico forman parte del plan de desarrollo y validación. Nuestra meta es que la automatización no solo avance por un piso: que también sepa cuándo no debe intervenir».

### Palabras que conviene usar / evitar

| Decir | Evitar |
|---|---|
| «proponemos», «simulamos», «validaríamos», «resultado visual» | «ya identifica químicamente», «detecta bacterias», «100 % seguro» |
| «riesgo contextual», «interbloqueo» y «autorización humana» | «elige cualquier químico en automático» |
| «protocolo preaprobado» | «la IA formula productos» |
| «referencias técnicas y regulatorias a estudiar» | «certificado por ARCSA/IEC» sin prueba |
| «modelo de negocio e hipótesis» | «ahorramos 70 %» sin piloto |

---

## 19. Preguntas difíciles del jurado y respuesta defendible

**P. ¿Qué tiene de diferente de un Gausium u otros robots?**  
R. Algunos robots comerciales ya navegan, detectan suciedad y generan reportes. Nuestra propuesta busca **unir inspección visual con un motor de riesgos, validación independiente de protocolos y evidencia de resultados**; es una hipótesis de diferenciación que validaríamos con clientes y análisis competitivo.

**P. ¿Una foto puede diferenciar chocolate y heces?**  
R. No necesariamente. Color y textura no garantizan composición. Cuando la evidencia es ambigua, el sistema bloquea la aplicación química y solicita revisión humana.

**P. ¿Y un sensor VOC detecta qué químico es?**  
R. No de forma fiable. Un sensor ambiental VOC genérico puede informar una variación de aire, pero no identificar inequívocamente una sustancia del piso. Identificación de materiales específicos exigiría instrumentación y validación adicionales.

**P. ¿Cómo entrenarán la IA?**  
R. Recopilaremos imágenes de materiales seguros, anotaremos máscaras y usaremos transferencia de aprendizaje con un segmentador. Evaluaremos errores sobre sedes e iluminaciones no vistas y diseñaremos una opción de «desconocido».

**P. ¿Cómo saben que un producto es biodegradable?**  
R. No lo sabe la cámara. EcoProtocol exigiría documentación verificable según el producto, criterio ambiental definido y evaluación competente; no aceptaría una afirmación de marketing sin respaldo.

**P. ¿Qué hay construido?**  
R. Hay una simulación web 3D interactiva y un backend que almacena datos de operación; los protocolos se representan por catálogo ficticio. No hay robot físico, visión entrenada ni análisis químico integrado.

**P. ¿Qué hacen con una muestra desconocida?**  
R. No se aplica producto automáticamente en esa zona; se registra el incidente y se escala. El muestreo físico o análisis de laboratorio requeriría personal y equipo especializado.

**P. ¿Qué garantiza que no choque contra personas?**  
R. Nada en la simulación constituye una garantía física. El producto requerirá sensores, cadena de parada independiente, ingeniería de riesgos, ensayos y conformidad normativa antes de circular entre personas.

**P. ¿Puede entrar a hospitales?**  
R. El hospital actual es un escenario conceptual. El primer piloto recomendado es una bodega controlada. Para uso sanitario se necesita validación de limpieza/desinfección, compatibilidades, seguridad y autorizaciones específicas.

**P. ¿Qué hace con la contaminación que no se ve?**  
R. La cámara mide solo indicadores visuales. No certifica limpieza microbiológica. Cualquier afirmación de desinfección exige protocolos de aplicación y evaluación adecuada independiente.

**P. ¿Y si se va el internet?**  
R. La demostración se sirve localmente; el robot físico futuro debe conservar parada y controles seguros autónomamente. Los procesos de autorización y sincronización deben diseñarse con política clara para pérdida de conectividad.

**P. ¿Cuál es el costo?**  
R. Una estimación preliminar de componentes de piloto sería del orden de **USD 1.390–5.115**, con grandes incertidumbres; faltan ingeniería, mano de obra, pruebas, impuestos, mantenimiento y certificación. Antes de vender se hacen cotizaciones y análisis de costo total.

**P. ¿Por qué no hacerlo solo con un operador y una cámara?**  
R. El sistema no busca reemplazar decisiones especializadas; busca estandarizar procedimientos, automatizar rutas repetitivas y dejar evidencia uniforme. Debemos demostrar en pilotos que el valor supera costos y riesgos.

---

## 20. Roadmap después del hackathon

### Fase 0 — Ahora: concepto y gemelo digital

- Escena 3D, rutas, sensores y muestras programadas, protocolos ficticios, logs.
- Demostración y recogida de retroalimentación de mentores/usuarios.

**Criterio de salida:** explicar sin contradicciones qué es simulado y qué se ha implementado; demo estable.

### Fase 1 — 1 a 3 semanas (orientativo): MVP de percepción documental

- Fotografías de prueba con materiales seguros, endpoint de imagen, OpenCV y segmentación inicial.
- Editor básico de zonas; motor de reglas separado del frontend.
- Catálogo de documentos y protocolos de demo con bloqueo y decisiones persistentes.
- Comparación inicial antes/después con imágenes controladas.

**Salida:** una demo de procesamiento **real** de imagen, aunque no clasifique composición.

### Fase 2 — 1 a 2 meses (orientativo): visión y robustez

- Dataset, etiquetado, entrenamiento inicial, validación de incertidumbre y pruebas ciegas.
- Monitoreo de falsas detecciones, evidencias y perfiles de uso.
- Prueba con distintos suelos y luz; aceptación de producto condicionado a resultados.

### Fase 3 — 2 a 4 meses (orientativo): plataforma móvil seca

- Chasis experimental sin químicos, motores, encoders, MCU, SBC, LiDAR y parar seguro apropiado.
- Integración ROS 2, localización, pruebas de trayectorias y validación de detención física.

### Fase 4 — 4 a 8+ meses (orientativo): limpieza acuosa controlada

- Cabezal y recuperación, medición real de agua, pruebas de fugas y ensayos con superficies autorizadas.
- Revisión de estándares, riesgos y operación supervisada en sitio piloto.

### Fase 5 — luego de validar: preparación de producto

- Estudios de ergonomía/mantenimiento, certificaciones según alcance, calidad de datos, ciberseguridad, trazabilidad documental, costos totales, manuales y soporte.

**Los plazos son escenarios de planificación, no promesas de entrega; dependen de recursos y alcance.**

---

## 21. Checklist final para presentar sin contratiempos

### Software y equipo

- [ ] Confirmar la versión congelada (`git rev-parse HEAD`) y anotar SHA.
- [ ] Desde raíz del repo, ejecutar `npm install` **antes del evento**.
- [ ] Abrir `CleanBot_Simulacion_Avanzada/server.py` mediante `run.bat`/`run.sh` o comando correcto.
- [ ] Cargar `http://127.0.0.1:8000` con internet desconectado después de preparar dependencias.
- [ ] Probar login, escenario de bodega, A*, modo de muestras, desconocido, reportes y CSV.
- [ ] Verificar que no se ejecuten simultáneamente dos servidores sobre el puerto 8000.
- [ ] No usar cuenta/admin de demo fuera de la red local o una demo controlada.
- [ ] Tener grabación MP4, cinco capturas y diapositivas offline.
- [ ] Conectar cargador, desactivar suspensión y notificaciones, probar proyector.

### Rigor de la presentación

- [ ] Unificar nombre: **ExpoClean** = plataforma/proyecto; **CleanBot** = robot propuesto.
- [ ] Separar funciones actuales / diseño futuro en la diapositiva 6.
- [ ] Decir en voz alta: «No identificamos composición química por foto».
- [ ] Diferenciar «cubierto» de «visiblemente más limpio» y de «desinfectado».
- [ ] Tener argumento de por qué empezar en bodega, no hospital.
- [ ] Saber cuál producto de demo es ficticio y por qué no hay cantidad química.
- [ ] Confirmar duración y orden oficiales del equipo en la franja 16:15–18:15.
- [ ] Repartir preguntas según rol y ensayar al menos dos veces.

### Materiales visuales

- [ ] Screenshot de bodega con robot y ruta.
- [ ] Screenshot de «Ver módulos internos».
- [ ] Screenshot de resultado de muestra conocida de catálogo.
- [ ] Screenshot de muestra desconocida aislada.
- [ ] Screenshot de historial/SQLite reportes.
- [ ] Diagrama de arquitectura futuro **etiquetado como propuesta**.

---

## 22. Fuentes, evidencias y enlaces relevantes

### Repositorio y archivos examinados

- [ExpoClean — GitHub](https://github.com/nosoykenneth/ExpoClean)
- [Último commit revisado: `fd2f2b7`](https://github.com/nosoykenneth/ExpoClean/commit/fd2f2b7ab89589e92796d96a5c42a40aaf9f3da7)
- [README del proyecto](https://github.com/nosoykenneth/ExpoClean/blob/main/README.md)
- [Código de simulación 3D](https://github.com/nosoykenneth/ExpoClean/blob/main/dashboard-3d.js)
- [Servidor avanzado / SQLite](https://github.com/nosoykenneth/ExpoClean/blob/main/CleanBot_Simulacion_Avanzada/server.py)
- [README del servidor avanzado y Webots](https://github.com/nosoykenneth/ExpoClean/blob/main/CleanBot_Simulacion_Avanzada/README.md)

### Agenda del evento facilitada por el equipo

- [Agenda y matriz de mentorías Expo Clean Ecuador 2026](https://docs.google.com/spreadsheets/d/13Uy7Gx5HdKQNt-RRnFtVapcdOL_4jfeQ/edit?gid=827351800#gid=827351800) — archivo Office en Drive (`areas-menotres.xlsx`), leído a través del conector. Verificar cambios oficiales del organizador el día del evento.

### Documentación de ingeniería y seguridad

- [IEC 63327:2021 — resumen oficial IEC](https://webstore.iec.ch/en/publication/62787).
- [IEC 60335-2-72:2021 — resumen oficial IEC](https://webstore.iec.ch/en/publication/64778).
- [ROS 2 Nav2 + SLAM Toolbox — documentación oficial](https://docs.nav2.org/rolling/tutorials/general_tutorials/navigation2_with_slam/navigation2_with_slam/).
- [Raspberry Pi 5 — información técnica oficial](https://www.raspberrypi.com/products/raspberry-pi-5/).
- [NVIDIA Jetson Orin Nano Super — ficha oficial](https://www.nvidia.com/es-es/autonomous-machines/embedded-systems/jetson-orin/nano-super-developer-kit/).

**Nota sobre fuentes y auditoría:** la mayoría del documento es una **especificación propuesta por el equipo asistido**, no un estándar publicado. Los enlaces externos respaldan descripción de herramientas o alcance de estándares, **no validan automáticamente este diseño, sus costos ni su conformidad**.

---

## 23. Resumen ejecutivo de una página, para repartir al equipo

**Nombre:** ExpoClean, plataforma conceptual de limpieza robótica inteligente. **Robot propuesto:** CleanBot.

**Problema:** automatizar recorridos no basta cuando el robot podría tratar una sustancia desconocida y cuando el supervisor no puede evaluar adecuadamente el resultado.

**Nuestra propuesta:** visión computacional para detectar **suciedad visible**, un motor de riesgo que pueda abstenerse, EcoProtocol para verificar procedimientos y productos autorizados, navegación autónoma y auditoría visual antes/después.

**Estado real al 16 de octubre:** simulación 3D web con Three.js, rutas A*/Dijkstra, sensores y muestras *predefinidos*, protocolos simbólicos, exclusión de zonas desconocidas, registros SQLite y reportes CSV. **No tenemos robot físico, detector químico, modelo de visión entrenado ni auditoría óptica automatizada**.

**Mañana:** presentar la simulación actual, explicar un incidente conocido versus uno desconocido, mostrar la lógica de protección y explicar el plan técnico de cámaras, Edge AI, ROS 2, electrónica y validación. Llevar video de respaldo y material offline.

**Primer piloto real propuesto:** bodega controlada con piso duro, residuos seguros y funcionamiento supervisado.

**Principio clave:** una fotografía no permite identificar con certeza el contenido de una mancha; si no se conoce el riesgo, no hay aplicación química autónoma.

**Cierre sugerido:** **«No queremos un robot que solo limpie. Queremos un sistema que sepa cuándo intervenir, cuándo detenerse y cómo documentar el resultado»**.

---

### Fin del plan maestro

**Siguiente paso práctico del equipo:** decidir qué persona presentará cada bloque y grabar *hoy* el video de respaldo de la simulación antes de intentar incorporar funciones nuevas.
