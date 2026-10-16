# CleanBot Sim 2.0 — Simulación funcional avanzada

Este proyecto convierte la prueba de concepto inicial en una demostración más completa para el Hackathon. Incluye **simulación 2D interactiva**, navegación con **A* y Dijkstra**, escenarios, sensores, usuarios, perfiles y persistencia de reportes en **SQLite**, además de una base para llevar el concepto a **Webots 3D**.

## Funciones implementadas

1. **Escenarios**: Hospital, Industria y Bodega, cada uno con obstáculos y zonas distintas.
2. **Control manual**: WASD o flechas. Espacio activa pulverización cuando el modo está en AUTO.
3. **Navegación A* y Dijkstra**: el usuario puede generar una misión de cobertura o hacer clic en un punto del mapa para calcular una ruta hasta ese destino.
4. **Sensores simulados**: ultrasónico frontal/izquierdo/derecho, temperatura, humedad, VOC, batería y nivel de tanque.
5. **Base de datos SQLite**: reportes con cobertura, tiempo, distancia, obstáculos, pulverización y snapshot de sensores.
6. **Usuarios y perfiles**:
   - `admin`: simula, guarda reportes y crea usuarios.
   - `operator`: simula y guarda sus reportes.
   - `observer`: visualiza la simulación y reportes sin operar el robot.
7. **Webots 3D**: carpeta `webots/` con un mundo de demostración y un controlador Python para un robot diferencial con sensor frontal.

## Ejecutar en Windows

1. Descomprime el proyecto.
2. Haz doble clic en `run.bat`.
3. Si el navegador no se abre automáticamente, entra a `http://127.0.0.1:8000`.

No necesitas instalar librerías de Python: el servidor usa módulos de la biblioteca estándar.

También puedes ejecutar manualmente:

```bash
python server.py
```

## Usuarios de demostración

- Administrador: `admin` / `admin123`
- Operador: `operador` / `demo123`
- Observador: `observador` / `view123`

**Importante:** son credenciales de demostración para un Hackathon. Cámbialas antes de usar el proyecto fuera de un entorno de prueba.

## Uso de la simulación

### Modo automático

- Selecciona escenario y algoritmo.
- Pulsa **Iniciar misión** para generar una ruta de cobertura.
- También puedes hacer clic en una celda libre del mapa para ordenar al robot ir a ese destino usando A* o Dijkstra.

### Modo manual

- Selecciona **Manual por teclado**.
- Usa `WASD` o las flechas.
- Con pulverización en `AUTO`, mantén `Espacio` para simular la aplicación del líquido.
- También puedes cambiar pulverización a `ON` o `OFF` desde el botón.

### Reportes

Pulsa **Guardar reporte** para almacenar la ejecución en `cleanbot.db`. La tabla inferior muestra los reportes disponibles según el perfil. El botón `CSV` exporta el historial.

## Estructura

```text
CleanBot_Simulacion_Avanzada/
├── server.py
├── cleanbot.db              # se crea automáticamente al ejecutar
├── run.bat
├── run.sh
├── static/
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── webots/
    ├── worlds/
    │   └── cleanbot_demo.wbt
    └── controllers/
        └── cleanbot_controller/
            └── cleanbot_controller.py
```

## Webots 3D

1. Instala Webots.
2. Abre `webots/worlds/cleanbot_demo.wbt`.
3. Webots detectará el controlador `cleanbot_controller`.
4. Ejecuta la simulación.

El mundo 3D es una **base de evolución** independiente del panel web: demuestra un robot diferencial con sensor frontal y evasión simple. El siguiente paso técnico sería comunicar Webots con el backend del panel para sincronizar telemetría 3D, reportes y órdenes.

## Qué demuestra frente al jurado

El objetivo no es afirmar que ya existe un robot industrial certificado. El proyecto demuestra digitalmente la lógica de una futura solución física: navegación, selección de ruta, detección de obstáculos, cobertura, pulverización simulada, monitoreo, trazabilidad y administración de usuarios.
