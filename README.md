# CleanBot · Simulación 3D

Prueba de concepto para presentar un futuro robot móvil inteligente y modular de limpieza y desinfección en zonas de riesgo. La escena 3D muestra una operación conceptual; no representa hardware construido ni validación clínica.

## Qué demuestra

- Escenarios 3D de hospital, industria y bodega.
- Navegación automática con rutas A* o Dijkstra, y destinos seleccionados en la escena.
- Control manual por WASD o flechas, detección simulada de obstáculos y pulverización.
- Sensores simulados, cobertura, distancia, batería y nivel del tanque.
- Perfiles de administrador, operador y observador.
- Reportes persistidos en SQLite, historial y exportación CSV.
- Gestión de usuarios desde el perfil administrador.

## Cómo ejecutar

1. Instala las dependencias JavaScript desde la carpeta del proyecto con `npm install`.
2. Ejecuta el servidor desde `CleanBot_Simulacion_Avanzada` con `run.bat` en Windows o `run.sh` en macOS/Linux.
3. Abre `http://127.0.0.1:8000` e inicia sesión con una cuenta demo.

El backend de Python usa solo su biblioteca estándar. La librería Three.js se sirve localmente desde `node_modules`.

## Archivos

- `index.html`: interfaz principal y panel avanzado.
- `styles.css`: diseño visual de la demo 3D.
- `dashboard-3d.js`: escena, navegación, sensores y conexión con la API avanzada.
- `package.json`: dependencia Three.js.
- `CleanBot_Simulacion_Avanzada/server.py`: autenticación, SQLite y reportes.

## Usuarios demo

- Administrador: `admin` / `admin123`
- Operador: `operador` / `demo123`
- Observador: `observador` / `view123`

En modo automático, inicia una ruta de cobertura o haz clic sobre una celda libre para navegar a un destino. En modo manual, usa WASD o las flechas; con pulverización `AUTO`, mantén Espacio para simular la aplicación.

## Residuos y decisiones del operador

- Con protocolo conocido: tratamiento local al detectar, sin regreso al final; luego sigue la cobertura pendiente.
- Residuo desconocido: alerta y parada sin tomar muestra ni pulverizar. El operador puede activar la vista 3D simulada y autorizar o rechazar la toma.
- Solo una toma autorizada crea custodia para laboratorio. Rechazar deja la zona excluida sin crear una muestra.
- Ambas decisiones recalculan desde la posición actual conservando las celdas limpiadas. El plan favorece seguir recto y busca cobertura pendiente; puede cruzar zonas limpias para conectar sectores. AUTO no pulveriza una huella completamente limpia.
- La cobertura mide el área no excluida. Las zonas desconocidas siguen pendientes de revisión.
- El catálogo del administrador permite reconocer firmas en futuras misiones. Todo el flujo es simulado; la cámara no determina corrosividad ni identifica sustancias.

## Configurar residuos y protocolos

Abre **Configurar residuos del escenario**, encima del mapa. Selecciona **Colocar residuo**, elige el tipo y haz clic en suelo libre. Para una firma personalizada, elige **Desconocido / firma personalizada** y escribe, por ejemplo, `SIM-RESIDUO-01`. Si esa firma tiene protocolo en el catálogo, el robot la reconocerá. Puedes usar la misma firma en varios puntos.

Para quitar residuos usa **Quitar residuo** y haz clic cerca de uno, o el botón **Quitar** de su fila. **Quitar todos** vacía el escenario; **Restaurar ejemplos** recupera los puntos originales. La configuración se conserva en este navegador, por escenario, y Reiniciar conserva tus residuos. Para editar después de iniciar una misión, primero pulsa **Reiniciar**. Vuelve a **Navegar** para seleccionar destinos con clics.

Para agregar un protocolo inicia sesión como administrador (`admin` / `admin123` en la demo). Pulsa **Registrar protocolo** en la fila del residuo personalizado, o busca el formulario del catálogo en el panel de administración. Completa firma, clasificación, código de protocolo, código de producto, ID del perfil y cartucho; pulsa **Guardar o actualizar protocolo**. Ejemplo de identificadores de simulación: `SIM-RESIDUO-01`, `Residuo demo`, `PR-SIM-01`, `P-SIM-01`, `DP-SIM-01`, cartucho A. Usa exactamente la misma firma en el residuo y el catálogo. La correspondencia se aplica a futuras detecciones; no cambia decisiones ya ejecutadas. Los códigos representan referencias simuladas, no recetas ni cantidades.

## Alcance

Es una **simulación conceptual**. La navegación, los sensores y la dosificación son datos representativos; deberán validarse con hardware y protocolos apropiados antes de una aplicación en entornos reales.
# ExpoClean
