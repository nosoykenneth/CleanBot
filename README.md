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

### Objetos móviles y ruta dinámica

Abre **Mover objetos durante la simulación**, activa **Movimiento de objetos**, elige una camilla, gabinete, máquina u otro obstáculo en la lista (o haciendo clic sobre él) y toca suelo libre para colocar su centro. Puedes hacerlo durante el recorrido. Los giros de cámara con arrastre no colocan objetos. Cerrar el panel desactiva este modo.

Se rechazan posiciones fuera del mapa o superpuestas con otros objetos, el robot y las muestras. Al mover un obstáculo se actualiza la geometría y se recalcula la cobertura desde la posición actual, conservando las celdas limpiadas y zonas excluidas. Una misión pausada permanece pausada; un paro o decisión pendiente no se levanta. Sin ruta accesible, el robot se detiene para revisar el mapa. Las posiciones modificadas duran durante esta sesión y no se guardan en SQLite ni en el navegador. Las muestras conocidas y desconocidas no se mueven con estos controles.

### Comparación de fotografías reales

Abre **Auditar fotografías reales · comparación visual**. Carga tres fotos JPG, PNG o WebP: el piso limpio de referencia, el piso antes de limpiar y el piso después. Las fotos deben mantener el mismo encuadre, proporción y luz; esta versión no alinea automáticamente imágenes ni corrige perspectiva. Marca la región de suciedad arrastrando sobre la foto anterior (o usa la región central). Deja al menos 10% del encuadre fuera de esa región, con suelo sin cambios, para controlar variaciones del fondo. Confirma las condiciones y pulsa **Comparar fotografías**.

El módulo compara distancias RGB de cada píxel contra la referencia limpia y muestra máscaras en rojo. La reducción es `(área diferente antes − área diferente después) / área diferente antes`; puede ser negativa si aumenta el área distinta. No mide composición, intensidad física, suciedad invisible ni desinfección, y no controla tratamientos. El operador revisa el resultado. Se rechazan imágenes transparentes, una diferencia inicial insuficiente o cambios excesivos fuera de la región. Esto es una comprobación básica, no una garantía de alineación: sombras o reflejos dentro de la región pueden causar errores sin activar el rechazo.

El umbral se puede ajustar entre 5 y 100; ese ajuste cambia el resultado y se incluye en la descarga. Se procesan imágenes de hasta 12 MB y 40 megapíxeles, reducidas a 512 píxeles en el lado mayor. El análisis se ejecuta localmente en el navegador, sin enviar las fotos al servidor. **Descargar resultado y evidencias** exporta JSON con parámetros, motivos de rechazo y copias reducidas de las tres fotografías. No se guarda automáticamente en SQLite ni se conserva tras recargar la página. El análisis de fotos y la auditoría del simulador se mantienen separados.

Pruebas: `node --test tests/photo-analysis.test.mjs tests/visual-audit.test.cjs`. Comprobación opcional con Edge en Windows: `node tests/photo-browser-smoke.cjs` (Node 22+, inicia un servidor local temporal y un perfil aislado de Edge).

### Auditoría visual simulada

En **Configurar residuos del escenario**, pulsa **Preparar demo de auditoría · bodega** y luego inicia el recorrido. La configuración del escenario de bodega se sustituye por polvo fácil, una mancha persistente y un charco desconocido; **Restaurar ejemplos** recupera los puntos originales. También puedes colocar residuos eligiendo aspecto y dificultad.

Los tratamientos conocidos reducen gradualmente las partículas visibles y generan capturas de la escena 3D antes/después desde la misma vista. Una regla demo permite como máximo dos pasadas: una mancha fácil alcanza un residual simulado del 2%; una persistente, 32% y luego 4%; una difícil conserva 40% después de dos pasadas y exige revisión humana, sin liberar su zona. El umbral demo es 8%. Estos valores son parámetros de simulación, no mediciones de imagen ni eficacia de limpieza real. La aplicación es localizada y conceptual, no una simulación física de contacto del cepillo con el suelo.

El historial de auditoría se conserva durante la misión y su resumen se incluye al guardar el reporte en SQLite. Las capturas se muestran en el navegador durante la misión; no se guardan como evidencias persistentes en el servidor. Reiniciar borra la auditoría de la misión. No hay modelo de IA, análisis de fotografías reales ni validación microbiológica. Los desconocidos mantienen la cámara automática y la autorización humana antes de una toma.

Pruebas de la lógica: `node --test tests/visual-audit.test.cjs`.

Es una **simulación conceptual**. La navegación, los sensores y la dosificación son datos representativos; deberán validarse con hardware y protocolos apropiados antes de una aplicación en entornos reales.
# ExpoClean
