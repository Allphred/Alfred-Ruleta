/* ════════════════════════════════════════════════════════════════════
   CONFIGURACIÓN GENERAL DE LA RULETA
   ────────────────────────────────────────────────────────────────────
   Este archivo es el panel de mandos. Cambia el valor que quieras y
   guarda: no hace falta tocar nada más.

   · Los TIEMPOS están en segundos.
   · Los ÁNGULOS, en radianes (una vuelta completa = 2π ≈ 6.283).
   · Los COLORES aceptan cualquier formato CSS (#hex, rgb…).

   Si quieres ajustar los tiempos y vueltas de CADA animación, mira
   js/animations.js (cada animación tiene sus parámetros comentados).
   ════════════════════════════════════════════════════════════════════ */

const CONFIG = {

  /* ── General ────────────────────────────────────────────────────── */
  // El texto de ARRIBA de la página y el nombre de la app: por ahora
  // ALFRED-RULETA (se pidió ese nombre).
  titulo: 'Ruleta Normal',

  // Tema al abrir la página: 'claro' (por defecto) o 'oscuro'.
  // El profesor lo cambia con el botón de la LUNA/EL SOL de la cabecera
  // (junto a "Opciones") y la elección se guarda en el navegador.
  temaPorDefecto: 'claro',

  // Modo al abrir la página (los nombres visibles son los de la
  // cabecera del panel: "Normal", "Realmente normal", "Random" y
  // "Elegir animación"):
  //   'clasico'   → siempre la animación clásica
  //   'sorpresa'  → modo NORMAL predeterminado: comienza siempre con
  //                 la animación clásica y desbloquea grupos al quitar
  //                 participantes; conservar no avanza la progresión
  //   'aleatorio' → EL MODO RANDOM: literalmente random — un MAZO
  //                 barajado con TODAS las animaciones, sin orden y SIN
  //                 REPETIR hasta agotarlo (luego se rebaraja solo)
  //   'fija'      → siempre la animación elegida en el desplegable
  modoPorDefecto: 'sorpresa',


  /* ═══ LOS GRUPOS DE ANIMACIONES (EL ORDEN SE CAMBIA AQUÍ) ════════
     ─────────────────────────────────────────────────────────────
     Esta tabla es EL ORDEN de la progresión del modo "Realmente
     normal"… y la que muestra el desplegable de "Elegir animación".

     QUÉ HACE LA APP CON ESTA TABLA:
       · El 1.er giro de una clase es SIEMPRE la animación del grupo
         1 ("Normal": la Clásica). Mientras nadie se elimine, ahí se
         queda (y en el modo "Normal" de siempre, esa es toda la vida).
       · Cada persona QUITADA con "Quitar de la ruleta" avanza AL
         SIGUIENTE grupo de la lista. Los grupos VACÍOS se saltan
         solos: el de "Bromista" está vacío a propósito (sus bromas
         aún no existen), así que del grupo 3 se pasa AL 5 sin
         detenerse ahí.
       · Si se CONSERVA a la persona y se vuelve a girar, suena la
         animación SIGUIENTE de la lista del grupo actual, en ORDEN y
         SIN REPETIR hasta agotar ese grupo (y entonces vuelve a
         empezar por la primera de la lista).
       · El último grupo (marcado resto: true) es "EL RESTO": al
         llegar ahí sale CUALQUIER animación todavía NO VISTA (de
         cualquier grupo, menos las del grupo vacío)… y una vez
         vistas todas, se queda ahí para siempre, disfrutándolas
         todas.

     CÓMO CAMBIAR EL ORDEN (para tus muchos cambios de grupo):
       · Mover una animación de grupo = BORRAR su número de la lista
         ids:[...] de un grupo y ESCRIBIRLO en la de otro grupo.
       · El orden DENTRO de cada lista es el orden en que se juegan
         (la primera es la que sale primero; sin repetir hasta
         agotarla).
       · Los números son los de la LEYENDA de abajo: los mismos que
         muestra el desplegable de "Elegir animación" y los de ?anim=N
         en la URL.
       · Un grupo con ids: [] queda VACÍO: la progresión lo salta
         solo (nadie se queda atascado en él).

     LEYENDA (número → animación):
        1  Clásica                             2  Parada falsa… y sigue
        3  Tambaleo (antes "Tensión decisiva") 4  El que gira es la flecha
        5  Retrocede y elige al anterior       6  Sin girar
        7  Probabilidad multiplicada           8  El chasquido (Infinity)
        9  Ruleta de casino                    10 A toda velocidad
       11  El motor dañado                     12 La versión Premium (broma)
       13  Acelera en vez de frenar            14 La selección múltiple
       15  El juego de los vasos               16 La rueda se desarma
       17  Diana y dardo                       18 Frenos dañados
       19  El motor dañado: ¡ayúdala a girar!  20 Probabilidad multiplicada N.º 2
       21  Tensión decisiva (la nueva)          22 A la tercera se desarma
       23  Nadie fue elegido (repite el tiro)

     OJO: la 17 (Diana y dardo) solo sale si hay 4 o más nombres —
     con 2-3 queda fea (se pidió). En "Elegir animación" se puede
     forzar igual, para probarla. ═══════════════════════════════ */
  gruposAnimaciones: [
    { nombre: 'Normal',                         ids: [1] },
    { nombre: 'Parece un error. Algo anda mal',  ids: [4, 2, 7, 20, 3, 22, 23] },
    { nombre: 'Definitivamente no es normal',  ids: [5, 11, 19, 16, 21, 14, 18] },
    { nombre: 'Bromista',                       ids: [] },
    { nombre: 'Esa no me la esperaba',          ids: [6, 8, 12, 15] },
    { nombre: 'Creativo',                       ids: [9, 10, 13, 17] },
    { nombre: 'El resto',                       ids: [], resto: true },
  ],


  /* ── Duración y fuerza del giro ─────────────────────────────────── */
  duracionBase: 12,  // duración (s) de un giro clásico. El deslizador de
                     // Opciones arranca aquí y admite de 3 a 20 s.
  girosMinimos: 5,   // vueltas mínimas de un giro normal
  girosMaximos: 8,   // vueltas máximas de un giro normal

  // VELOCIDAD y ACELERACIÓN (deslizadores de Opciones, en "×"):
  // · velocidad → multiplica las VUELTAS de cada giro (×1.5 = rueda
  //   más rápida: 7.5–12 vueltas en vez de 5–8). Rango del deslizador: 0.5–3.
  // · aceleracion → cómo de brusco es el ARRANQUE: la rueda ya no sale
  //   disparada a tope, sino que coge fuerza al principio (como si la
  //   empujaran). ×3 arranca casi al instante; ×0.5 tarda bastante.
  velocidadPorDefecto: 1.5,
  aceleracionPorDefecto: 1.5,
  arranqueBase: 0.16, // fracción del giro que dura el arranque con ×1
                     // (la fracción real = arranqueBase / aceleración)

  /* ── AJUSTE FINO DE LA ANIMACIÓN CLÁSICA (la 1) ────────────────────
     Para ajustar su tiempo CON MUCHA PRECISIÓN sin tocar código:
     · fraccion → cuánto dura, en TANTO POR UNO de la duración base
       (1 = exactamente lo que diga el deslizador de Duración;
        1.25 = un cuarto más largo; 0.8 = más corto).
     · suspenso → EL FINAL: exponente de la frenada. 4.5 = el de serie
       (la frenada de feria que se arrastra). SUBE para un final aún
       más lento (6 = glacial); BAJA para acabar antes (3 = decidido). */
  clasica: {
    fraccion: 1,
    suspenso: 4.5,
  },


  /* ── Sonido ─────────────────────────────────────────────────────── */
  volumen: 0.9,           // volumen general (0 = mudo, 1 = máximo)
  sonidoPorDefecto: true, // ¿suena al abrir la página? (luego se cambia en Opciones)


  /* ── Flecha / selector (triángulo invertido, ROJO) ─────────────── */
  tamanoFlecha: 1.15,  // multiplicador del tamaño del triángulo
                       // (1.15 = grande; súbelo a 1.3 si lo quieres aún mayor)
  anchoFlecha: 17,     // semi-ancho de la base del triángulo, en píxeles
  profundidadFlecha: 24, // cuánto entra la PUNTA dentro de la rueda (px)
  // El selector es ROJO (se pidió así). Contorno → transparente: se pinta
  // con el COLOR DEL FONDO (ver _bordeSegmentos de js/motor.js).
  coloresFlecha: ['#ff8f9a', '#ef476f', '#c9184a'], // claro → medio → oscuro
  patadaFlecha: 0,     // 0 = la flecha es FIJA: al cruzar una clavija SUENA
                       // (el tic) pero NO se mueve ni se inclina, tal como se
                       // pidió. (Pon 0.22 para recuperar el saltito antiguo.)
  flexionMaxFlecha: 0.34, // cuánto se INCLINA la flecha si una coreografía
                          // se lo pide (radianes ≈ 19°). Herramienta libre:
                          // la nueva animación 3 (rebote con tope) ya no la
                          // usa — mueve la RUEDA, no la flecha.


  /* ── Clavijas y aro (el contorno exterior) ─────────────────────── */
  mostrarClavijas: false,  // false = SIN pernos en el dibujo (se pidió
                           // eliminarlos), PERO el TIC al pasar sobre ellos
                           // se mantiene: el sonido cruza por cada frontera
                           // de segmento aunque no se vea el remache.
  grosorAro: 0,            // 0 = SIN contorno (rueda limpia, como ahora).
                           // Pon 11 para recuperar el aro de madera que
                           // rodeaba la rueda. Las clavijas se colocan
                           // solas donde toque: en el aro si existe,
                           // o junto al borde de los segmentos si no.
  colorAro: '#4a2f1b',     // madera oscura del aro exterior (si lo activas)
  colorAroBrillo: '#c99a4e', // filete dorado que bordea el aro
  colorClavija: '#e8eaf0', // cabeza metálica de cada clavija
  colorClavijaBorde: '#565d6b',
  maxClavijas: 60,         // con más segmentos que esto, las clavijas se omiten


  /* ── Aspecto de la rueda ─────────────────────────────────────────── */
  // Colores de los segmentos, en orden (se repiten en ciclo).
  paleta: [
    '#ef476f', '#f78c6b', '#ffd166', '#8ac926', '#06d6a0',
    '#17b3c6', '#4d96ff', '#5e548e', '#9b5de5', '#f15bb5',
  ],
  colorBordeSegmentos: null, // null = el contorno de la rueda y de SUS
                              // SEGMENTOS se pinta con el COLOR DEL FONDO
                              // (se pidió que se funda con la página).
                              // Pon un '#hex' para un contorno visible.
  // El color del fondo de la página, claro y oscuro (para pintar esos
  // contornos "negativos": tienen que seguir al tema).
  colorFondoClaro:  '#f6f3ec',
  colorFondoOscuro: '#0b1120',
  grosorBordeSegmentos: 1,        // grosor de esa separación, en píxeles
                                  // (REDUCIDO A LA MITAD: era 2, ahora 1,
                                  // tal como se pidió).
  colorTextoSegmentos: '#ffffff',
  maxNombresTexto: 60,            // con más nombres que esto, no se dibuja texto


  /* ── Comportamiento tras elegir a alguien ────────────────────────── */
  // 'preguntar'  → aparece la tarjeta con "Conservar" / "Quitar" (recomendado)
  // 'quitar'     → lo quita de la lista automáticamente
  // 'conservar'  → lo deja siempre en la lista
  alElegir: 'preguntar',


  /* ── Animación 7 (probabilidad aumentada) ──────────────────────── */
  // Copias EXTRA del favorecido (la guía): 0 = automático → tantas
  // copias como nombres haya (mínimo 3), repartidas por toda la rueda.
  // Ej.: 8 nombres → 8 copias extra → el favorecido ocupa 9 de 16
  // porciones (probabilidad x9) y se le VE disperso por la rueda,
  // siempre con SU color.
  copiasExtraProb: 0,
  mostrarRefuerzo: true, // true  → se VE el nombre repetido en la rueda
                         // false → la rueda se ve normal, pero el sorteo
                         //          sigue estando ponderado (modo sigiloso)


  /* ── Animación 8 (el chasquido / Infinity) ──────────────────────── */
  retardoChasquido: 2.2, // segundos de silencio tras la parada, antes del chasquido
  duracionPolvo: 2.4,    // cuánto tarda la rueda en deshacerse en polvo (s)
  polvoPaso: 4.5,        // "tamaño de grano" de la desintegración, en píxeles
                         // (más pequeño = polvo más fino pero más costoso)
  polvoParticulaCada: 3, // cada cuántos granos nace una partícula de polvo
                         // visible (3 = una de cada tres; súbelo si va lento
                         // en móviles: la rueda se deshace igual)


  /* ── Animación 9 (la ruleta de casino) ─────────────────────────── */
  casino: {
    // Colores del casino: madera del bol, pista, dorados… (los bolsillos
    // alternan rojo/negro, como los de verdad; los NOMBRES van dentro).
    colorMadera:    '#4a2f18',  // el bol de madera exterior
    colorPista:    '#241709',  // el canal pulido donde corre la bola
    colorApron:    '#6b4a26',  // la pendiente que baja de la pista a la rueda
    colorFilete:   '#d9b45a',  // filetes, frets, torreta y deflectores (latón)
    colorDeflector:'#c9a23f',
    colorRojo:     '#b3122e',  // bolsillos impares
    colorNegro:    '#17181d',  // bolsillos pares
    colorBase:     '#101116',  // disco central del wheelhead
    radioBola:     8.5,        // radio de la bola de marfil (px, rueda de 480)
    vueltasBola:   [5.5, 7],   // vueltas de la bola por la pista (mín, máx)
    deflectores:   8,          // diamantes del apron (los de verdad son 8)
    // MÚSICA de casino mientras dura la transformación. SE PIDIÓ
    // QUITARLA DEL TODO: false = SIN MÚSICA (solo quedan los sonidos
    // de la bola rodando y la fanfarria de victoria al caer).
    // Pon true si algún día quieres volver a oírla.
    musica: false,
  },

  /* ── Animación 10 (a toda velocidad, segmentos que vuelan) ─────── */
  voladora: {
    vueltas: 14,    // vueltas del tramo turbo (las de la guía), ANTES del
                    // deslizador de Velocidad
    gravedad: 900,  // px/s² que tiran de los segmentos que salen volando
  },

  /* ── Animación 21 (TENSIÓN DECISIVA — la nueva "realmente ═══
     decisiva"): TODO su timing vive aquí, para ajustarlo a mano. */
  tension: {
    fraccion: 1,    // duración total del giro, en fracción de la base
                    // (1 = lo que diga el deslizador de Duración).
    lentitud: 8.5,  // EL FINAL LENTÍSIMO: exponente de la frenada
                    // final. 8.5 = se arrastra muchísimo (MÁS que la
                    // clásica: es la gracia de esta animación).
                    // SUBE para aún más tortura (11 = eterno);
                    // BAJA para decidirse antes (5 = como la clásica).
    pausa: 1.15,    // SEGUNDOS parada con la flecha clavada EXACTA en
                    // la frontera entre los dos nombres (LA tensión).
    temblores: 3,   // micro-empujoncitos durante la pausa: parece que
                    // la rueda se va a seguir moviendo en cualquier
                    // momento y decidirse por el otro.
    rebote: 0.5,    // segundos del REBOTE hacia atrás (el que ELIGE
                    // al otro nombre de los dos).
  },

  /* ── Animación 20 (PROBABILIDAD MULTIPLICADA N.º 2: el segmento ═══
     gigante): en vez de réplicas repartidas por la rueda, UN SOLO
     segmento del favorecido — pero ENORME. */
  prob2: {
    // Cuántas veces más grande queda el segmento del favorecido
    // (entre 6 y 8, tal como se pidió). La probabilidad sale sola:
    // con 8, ese segmento ocupa 8 de las (n + 7) porciones.
    min: 6,
    max: 8,
  },

  /* ── Animación 11 (el motor dañado) ────────────────────────────── */
  freno: {
    // Cuánto dura la fase "gira y no para" (s) antes de que salga el
    // AVISO en la PISTA DE ARRIBA ("Error: Se ha dañado el motor…",
    // SIN alerta de navegador — la gente tiene tiempo de preguntarse
    // qué pasa). El texto lo pone js/animations.js.
    angustia: 4.2,
    // A cuántas VUELTAS POR SEGUNDO acaba girando la rueda averiada:
    // 3.4 ≈ la velocidad MÁXIMA de "Acelera en vez de frenar" (la
    // animación 13 acaba a ~3.3), tal como se pidió — imposible ver
    // sobre quién caerá. El ARRANQUE es PROGRESIVO (nada de un
    // acelerón de repente): sube poco a poco hasta aquí con el sonido
    // de aceleración (motor con cambios de marcha) y el turbo de aire
    // aullando. Al tocar EL MOTOR (la bolita negra del buje, que luce
    // su anillo dorado latiendo), DERRAPE frenético justo donde iba
    // pasando por la flecha.
    vueltasPorSegundo: 3.4,
    // HUMO Y CHISPAS de la avería: salen del buje mientras la rueda
    // no para — para que se VEA que hubo una avería. Pon false para
    // un motor dañado "silencioso".
    humo: true,
  },

  /* ── Animación 18 (Frenos dañados — frenar con la flecha) ─────── */
  frenos: {
    // A cuántas VUELTAS POR SEGUNDO se queda clavada la rueda. Se bajó
    // un 30 % (antes eran 2.9) porque a esa marcha los NOMBRES no se
    // alcanzaban a leer — ahora sí se leen a simple vista mientras la
    // rueda no sabe frenar. Ahí gira CONSTANTE, sin frenar, con su
    // tic-tac rápido sonando.
    vueltasPorSegundo: 2.03,
    // Segundos que dura el giro a velocidad constante ANTES de que
    // salga la pista ("Error: Se le fueron los frenos…").
    constancia: 7,
    // Cuánto tarda en LLEGAR a esa velocidad (progresivo: como un
    // giro normal que nunca acaba de frenar).
    rampa: 2.4,

    // EL APAGADO (animación 11 — clic en la bolita): ya NO hay
    // derrape de auto con chirrido (se pidió quitarlo: el motor se
    // APAGA, literalmente). Suena un motor BAJANDO LA MARCHA y la
    // rueda se va muriendo sola hasta detenerse sobre quien pasaba
    // por la flecha. Vueltas y segundos que dura el apagado:
    apagadoVueltas: 1.8,    // vueltas que corre mientras se muere
    apagadoDuracion: 1.4,   // segundos que tarda en apagarse del todo
  },

  /* ── Animación 19 (El motor dañado: ayúdala a girar — el ABANICO ═
     averiado de verdad: hay que empujarle las aspas a mano, como se
     hace en el país con los abanicos dañados) ─────────────────── */
  abanico: {
    // Cuánto tarda en salir el AVISO en la pista de arriba, contando
    // desde que la ruleta empieza a moverse muy lento (5 s, tal como
    // se pidió: primero el corto eléctrico; la ruleta penando; y a
    // los 5 segundos, la confesión).
    aviso: 5,
    // A cuántas VUELTAS POR SEGUNDO penan las aspas averiadas (muy
    // lento: apenas se mueve, con su sonido de abanico dañado — que
    // suena a máquina de recortarse, tal como se pidió).
    vueltasCrawl: 0.085,
    // La velocidad (rad/s) con la que hay que SOLTARLA para que el
    // motor "agarre": por debajo, la rueda se va muriendo otra vez a
    // su marchita y hay que volver a intentarlo (cualquier giro más
    // en serio la arranca).
    umbralArranque: 2.1,
    // Cuánto dura la CURACIÓN del sonido: el abanico dañado pasa a
    // sonar como un abanico sano en esta transición (s).
    transicion: 1.7,
    // Vueltas MÁXIMAS por segundo que coge la ruleta ya curada antes
    // de ir frenando: un abanico sano no es un turbo (esto ya son
    // aspas de ventilador, no las 3.4 del motor dañado de la 11).
    vueltasCuradas: 1.5,
  },

  /* ── Animación 15 (el juego de los vasos — shell game) ─────────── */
  shell: {
    // Colores del juego: el vaso (plástico rojo clásico) y la MESA de
    // madera común y corriente donde se juega. Las BOLITAS ya no son
    // de marfil: cada una CONSERVA EL COLOR DE SU SEGMENTO — al
    // levantar el vaso se ve de qué nombre era.
    colorVaso1:      '#ef6a77',   // cara clara del vaso
    colorVaso2:      '#b23a4a',   // cara oscura del vaso
    colorVasoLabio:  '#8f2c3a',   // labio de la boca (borde inferior)
    colorMesa1:      '#a0713f',   // madera clara del tablero
    colorMesa2:      '#7a4f2a',   // madera en sombra (hacia abajo)
    colorMesaCanto:  'rgba(255, 235, 200, 0.35)', // canto iluminado
    colorMesaVeta:   'rgba(60, 32, 8, 0.18)',     // vetas del tablero
    // cruzas del barajar (cuántas veces se intercambian vasos — SIN
    // levantarse jamás: solo se cruzan por delante y por detrás);
    // 0 = automático → 7 + nº de nombres, entre 10 y 18.
    cruzas: 0,
  },

  /* ── Animación 17 (diana y dardo — intervención de usuario) ────── */
  dardos: {
    // La DIANA de verdad, con sus colores CLÁSICOS (como la de la
    // foto): gajos NEGRO y CREMA alternos; anillos doble y triple ROJO
    // (sobre los gajos negros) y VERDE (sobre los cremas); toro VERDE
    // con su centro ROJO; banda de números negra con cifras crema;
    // araña de alambre plateada.
    colorGajoNegro:  '#191a20',
    colorGajoCrema:   '#efe6c8',
    colorAnilloRojo:  '#c1121f',
    colorAnilloVerde: '#0a7a3c',
    colorToro:        '#0a7a3c',
    colorToroCentro:  '#c1121f',
    colorBanda:       '#14151a',
    colorNumeros:     '#efe6c8',
    colorArania:      'rgba(228, 232, 240, 0.85)',
    // Dónde vive la diana (fracciones del lienzo): al LADO DERECHO,
    // como se pidió para probar (x del centro · y del centro · radio).
    lado:  0.60,
    altura: 0.44,
    radio: 0.36,
    // Cuánto gira la diana tras la transformación (vueltas/s): "girará
    // un poco" — lenta, como las de verdad. Al agarrar el dardo se
    // detiene sola (la puntería del profesor se respeta).
    vueltas: 0.22,
  },


  /* ── Historial ────────────────────────────────────────────────── */
  historialMaximo: 15, // cuántos giros recuerda
};
