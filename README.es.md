[Español](README.md) | [English](README.MD)

# Ruleta Normal

## ¿Qué es?

Ruleta anormal es una ruleta interactiva de nombres diseñada para clases, amigos y grupos. Comenzó como una ruleta sencilla, pero incluye animaciones poco habituales e humorísticas inspiradas en el tiempo cómico, las sorpresas y las bromas visuales.

El proyecto fue creado con ayuda de inteligencia artificial y está pensado principalmente para divertirse con estudiantes, profesores y amigos. Funciona como una página web estática, por lo que no necesita servidor ni backend.

## Demostración

https://Allphred.github.io/Alfred-Ruleta/

## Tecnologías

- HTML5
- CSS3
- JavaScript puro
- Canvas API
- Web Audio API
- Local Storage
- GitHub Pages

No requiere frameworks, librerías externas, backend, archivos multimedia ni conexión a Internet.

## Características

- Ruleta interactiva creada con Canvas.
- Un participante por línea.
- Selección aleatoria de nombres.
- Efectos de sonido y música sintetizada.
- Temas claro y oscuro.
- Diseño adaptable a ordenador, tablet y móvil.
- Modo de pantalla completa.
- Controles táctiles, de ratón y teclado.
- Guardado automático de nombres, ajustes e historial con Local Storage.
- Duración, velocidad y aceleración configurables.
- Comportamiento configurable tras elegir a un participante:
  - Preguntar si conservarlo o quitarlo.
  - Quitarlo automáticamente.
  - Conservarlo automáticamente.
- Tarjeta de ganador junto a la ruleta.
- Historial de ganadores con opción para limpiarlo.
- Girar tocando o haciendo clic en la rueda.
- Girar con el botón principal o con la barra espaciadora.
- Parámetros de URL para pruebas y configuración rápida.
- Funciona directamente abriendo `index.html` en el navegador.

## Modos de giro

- **Normal:** Comienza con el giro clásico y desbloquea progresivamente grupos de animaciones sorpresa al quitar participantes. Este es el modo predeterminado.
- **Realmente normal:** Siempre utiliza el giro clásico, sin progresión ni sorpresas.
- **Random:** Utiliza un mazo barajado con todas las animaciones sin repetir una hasta agotar el mazo.
- **Elegir animación:** Obliga a usar una animación concreta para pruebas o presentaciones.

Conservar a un participante no aumenta la progresión sorpresa. Quitarlo hace avanzar al siguiente grupo.

## Animaciones

La ruleta incluye 19 animaciones, entre ellas:

- Giro clásico
- Parada falsa
- Rebote elástico
- Flecha giratoria
- Chasquido estilo Infinity
- Desintegración en polvo
- Probabilidad aumentada
- Ruleta de casino
- Motor dañado
- Frenos averiados
- Abanico averiado accionado a mano
- Giro turbo con segmentos voladores
- Selectores múltiples
- Juego de vasos
- Desmontaje de la rueda
- Diana y dardo
- Broma estilo SaaS premium
- Parada brusca
- Avería acelerada


## Controles

- Toca o haz clic en la rueda para girarla.
- Utiliza el botón **Girar**.
- Pulsa **Espacio** para girar o conservar el nombre seleccionado.
- Pulsa **Esc** para conservar el nombre seleccionado.
- Usa el panel de opciones para cambiar los ajustes.
- Usa el botón de luna o sol para cambiar el tema.
- Activa o desactiva el sonido desde las opciones.
- Usa el modo de pantalla completa para presentar o proyectar.

## Estructura del proyecto

```text
index.html
styles.css
js/
  config.js
  sound.js
  animations.js
  motor.js
  ui.js
```

### Archivos

- `index.html`: Estructura de la página e interfaz.
- `styles.css`: Diseño, temas, estilos adaptables y efectos visuales.
- `js/config.js`: Ajustes predeterminados, paleta, tiempos y configuración visual.
- `js/sound.js`: Efectos de sonido sintetizados y música de casino.
- `js/animations.js`: Las 19 animaciones y su coreografía.
- `js/motor.js`: Renderizado Canvas, física de la rueda e interacciones.
- `js/ui.js`: Interfaz, estado, ajustes, Local Storage y flujo de la aplicación.

## Ejecutar localmente

No hay proceso de compilación ni instalación.

1. Descarga o clona el repositorio.
2. Abre `index.html` directamente en un navegador moderno.

Para usar un servidor local:

```bash
python3 -m http.server 8000
```

Después abre:

```text
http://localhost:8000/
```

## Publicar con GitHub Pages

1. Crea un repositorio público en GitHub.
2. Sube `index.html`, `styles.css` y la carpeta `js/` completa a la raíz del repositorio.
3. Abre **Settings** → **Pages**.
4. En **Build and deployment**, selecciona **Deploy from a branch**.
5. Selecciona la rama `main` y la carpeta `/ (root)`.
6. Guarda los ajustes.

## Parámetros de prueba

Forzar una animación concreta:

```text
?anim=11
```

Los valores admitidos van del `1` al `19`.

Acelerar todas las animaciones:

```text
?rapido=1
```

Cargar nombres directamente:

```text
?nombres=A|B|C
```

Los parámetros se pueden combinar:

```text
?anim=19&rapido=1&nombres=A|B|C
```

## Identificadores útiles

- `9` — Ruleta de casino
- `11` — Motor dañado
- `12` — Broma premium
- `15` — Juego de vasos
- `16` — Desmontaje de la ruleta
- `17` — Diana y dardo
- `18` — Frenos dañados
- `19` — Abanico averiado accionado a mano

## Personalización

- Edita `js/config.js` para cambiar colores, duración predeterminada, volumen, velocidad, tamaño de la flecha, partículas y comportamiento.
- Edita `js/animations.js` para cambiar el tiempo y la coreografía de cada animación.
- Edita `styles.css` para cambiar el diseño y la apariencia de ambos temas.
- Edita `index.html` para cambiar las etiquetas y la estructura de la interfaz.

## Compatibilidad

Funciona en navegadores modernos compatibles con:

- HTML Canvas
- Web Audio API
- Local Storage
- Pointer Events
- ResizeObserver
- Propiedades CSS personalizadas

## Privacidad

La aplicación no envía los nombres de los participantes ni los ajustes a ningún servidor. La información se guarda localmente en el navegador mediante Local Storage.

## Créditos

Creado por IA y Alfred P.J.
