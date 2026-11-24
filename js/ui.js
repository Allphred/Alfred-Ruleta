/* ════════════════════════════════════════════════════════════════════
   INTERFAZ Y ORQUESTACIÓN (js/ui.js)
   ────────────────────────────────────────────────────────────────────
   Este archivo conecta todo: la caja de nombres, el panel de opciones,
   el botón GIRAR (que vive en el panel, junto a los nombres), la
   TARJETA DEL GANADOR (que aparece AL LADO de la ruleta, sin tapar
   nada), el BOTÓN DE TEMA (luna/sol) de la cabecera, el historial con
   el tiempo entre giros y el guardado automático en el navegador
   (localStorage).

   FLUJO DE UN GIRO:
     1. elegirAnimacion()  → según el modo ("Normal" / Realmente
                            normal — con su progresión de grupos— /
                            Random — el mazo sin repetir— / Elegir
                            animación)
     2. anim.preparar()    → la animación 7 amplía la rueda si toca
                            (réplicas del favorecido con SU color)
     3. anim.girar(ctx)    → la coreografía mueve la rueda (js/animations.js)
     4. anunciarGanador()  → tarjeta al lado de la ruleta con
                             "Conservar" o "Quitar de la ruleta"
                             (quitar = un GRUPO de animaciones más)
     5. restaurar()        → todo vuelve a la normalidad (el casino se
                             transforma de vuelta, los segmentos
                             volados regresan…)

   PARÁMETROS DE PRUEBA EN LA URL (no hacen falta para el uso normal):
     ?anim=9       → fuerza la animación 9 en concreto (1–19)
     ?rapido=1     → todo dura una fracción (para probar rápido)
     ?nombres=A|B|C→ rellena la lista de una vez
   ════════════════════════════════════════════════════════════════════ */

/* ── Estado general de la aplicación ─────────────────────────────────── */
const Estado = {
  nombres: [],        // la lista viva
  ajustes: {         // lo que se guarda entre sesiones
    modo: CONFIG.modoPorDefecto,     // 'clasico' | 'sorpresa' | 'aleatorio' | 'fija'
                                      // ("Normal" | Realmente normal | Random |
                                      //  Elegir animación, en la etiqueta)
    animFija: 1,                     // animación del modo 'fija'
    duracion: CONFIG.duracionBase,   // duración base del giro (s)
    velocidad: CONFIG.velocidadPorDefecto,     // × vueltas por giro
    aceleracion: CONFIG.aceleracionPorDefecto, // × brusquedad del arranque
    sonido: CONFIG.sonidoPorDefecto,
    alElegir: CONFIG.alElegir,       // 'preguntar' | 'quitar' | 'conservar'
    tema: CONFIG.temaPorDefecto,     // 'claro' | 'oscuro'
  },
  historial: [],
  girando: false,
  ultimaAnim: null,   // para no repetir la misma animación dos giros seguidos

  // ── LA PROGRESIÓN POR GRUPOS (modo "Realmente normal") ────────
  // Cuántas personas se han QUITADO con el botón "Quitar de la ruleta"
  // (así, y solo así, se avanza de grupo — conservar no cuenta)… qué
  // animaciones ya sonaron en la progresión actual… y QUÉ ANIMACIÓN
  // del grupo actual toca ya: dentro de un grupo se va EN ORDEN (la
  // "siguiente de la lista"), sin repetir hasta agotarlo. Se guarda
  // entre sesiones (los nombres también se guardan: la clase de ayer
  // no empieza de cero tras un cierre accidental).
  eliminadas: 0,
  vistas: [],
  grupoActual: null,   // el nombre del grupo que suena ahora…
  punteroGrupo: 0,     // …y qué animación de SU lista toca ya

  // ── EL MAZO del modo "Random" ───────────────────────────────
  // Ids de las animaciones que faltan por salir: se baraja entero y se
  // va agotando SIN REPETIR; al vaciarse, se vuelve a barajar (y la
  // nueva mano nunca empieza por la que acababa de sonar).
  mazo: [],
};

/* ── El clic que arranca cada giro ────────────────────────────────────
   Las animaciones que QUIEREN saber dónde se pulsó (el desarme: se
   empieza a caer por el segmento clicado) reciben estas coordenadas a
   través del contexto (ctx.clicGiro). Con el botón Girar o la barra
   espaciadora no hay clic: vale null (el desarme arranca por donde
   esté la flecha). */
let clicGiro = null;

/* ── "A LA TERCERA SE DESARMA" (animación 22): clics que cuentan ──
   Mientras esa animación espera sus tres clics, VALEN COMO CLIC tanto
   un clic sobre la RUEDA como una pulsación del botón GIRAR (o la
   barra espaciadora). Este resolver vive pendiente mientras se espera
   una de ellas — lo llena ctx.esperarClicOGirar (crearContexto). */
let clicGirarPendiente = null;

/* ── Parámetros de la URL ───────────────────────────────────────────── */
const PARAMS = new URLSearchParams(location.search);
const ESCALA = PARAMS.has('rapido') ? 0.25 : 1; // acelera las pruebas

/* ── Referencias al DOM ──────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const contenedorLienzo = $('contenedorLienzo');
const lienzo = $('lienzo');
const lienzoPolvo = $('lienzoPolvo');
const btnGirar = $('btnGirar');
const mensajeEstado = $('mensajeEstado');
const pistaRueda = $('pistaRueda');   // "Toca la rueda para girar" (arriba)
const entradaNombres = $('entradaNombres');
const btnActualizar = $('btnActualizar');
const contadorNombres = $('contadorNombres');
const btnPantallaCompleta = $('btnPantallaCompleta');
const filaAnimFija = $('filaAnimFija');
const seleccionAnimacion = $('seleccionAnimacion');
const rangoDuracion = $('rangoDuracion');
const valorDuracion = $('valorDuracion');
const rangoVelocidad = $('rangoVelocidad');
const valorVelocidad = $('valorVelocidad');
const rangoAceleracion = $('rangoAceleracion');
const valorAceleracion = $('valorAceleracion');
const checkSonido = $('checkSonido');
const btnTema = $('btnTema');   // el botón LUNA/SOL de la cabecera
const seleccionAlElegir = $('seleccionAlElegir');
const historial = $('historial');
const btnLimpiarHistorial = $('btnLimpiarHistorial');

// La tarjeta del ganador (vive en el panel lateral, junto a la rueda)
const tarjetaGanador = $('tarjetaGanador');
const etiquetaAnim = $('etiquetaAnim');
const nombreGanador = $('nombreGanador');
const fraseAnim = $('fraseAnim');
const notaAnim = $('notaAnim');
const botonesGanador = $('botonesGanador');

const capaParticulas = $('capaParticulas');
const destelloEl = $('destello');

/* ── Guardado automático (localStorage) ──────────────────────────────── */
const CLAVE_ALMACEN = 'ruletaProfesor.v1';

function cargarGuardado() {
  try { return JSON.parse(localStorage.getItem(CLAVE_ALMACEN)) || {}; }
  catch (e) { return {}; }
}

function guardar() {
  try {
    localStorage.setItem(CLAVE_ALMACEN, JSON.stringify({
      nombres: Estado.nombres,
      ajustes: Estado.ajustes,
      historial: Estado.historial,
      eliminadas: Estado.eliminadas,      // la progresión de grupos (modos)
      vistas: Estado.vistas,
      grupoActual: Estado.grupoActual,    // …y qué animación toca ya
      punteroGrupo: Estado.punteroGrupo,
      mazo: Estado.mazo,                  // el mazo del modo Random
    }));
  } catch (e) { /* sin almacenamiento disponible: la app funciona igual */ }
}

/* ═════════════════════════════════════════════════════════════
   TEMA CLARO / OSCURO
   El claro es el de serie; el oscuro se cambia con EL BOTÓN DE LA
   LUNA (o del sol) de la cabecera, junto a "Opciones": en modo
   claro se ve la LUNA (pulsar → oscuro); en oscuro, el SOL (pulsar
   → claro). También cambia los colores del canvas (Motor.setTema).
   ═════════════════════════════════════════════════════════════ */

function aplicarTema() {
  const oscuro = Estado.ajustes.tema === 'oscuro';
  document.documentElement.dataset.theme = oscuro ? 'dark' : 'light';
  if (btnTema) {
    btnTema.setAttribute('aria-pressed', oscuro ? 'true' : 'false');
    btnTema.title = oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
    btnTema.setAttribute('aria-label', btnTema.title);
  }
  Motor.setTema(Estado.ajustes.tema);
}

/* ═════════════════════════════════════════════════════════════════
   LA PISTA SOBRE LA RUEDA
   "Toca la rueda para girar": el aviso que vive ARRIBA de la rueda
   cuando está en reposo (se pidió así: pulsar CUALQUIER parte de la
   rueda la hace girar). Las animaciones con INTERVENCIÓN DE USUARIO
   lo REUTILIZAN para guiar al profesor ("haz click para pararla",
   "elige un vaso…"). setPista(null) lo esconde.
   ═══════════════════════════════════════════════════════════════ */
function setPista(texto) {
  if (!pistaRueda) return;
  if (!texto) { pistaRueda.classList.add('oculto'); return; }
  pistaRueda.textContent = texto;
  // LOS COLORES DE PRUEBA (se pidió): los mensajes que empiezan con
  // "Error:" salen en ROJO y los que empiezan con "Advertencia:" en
  // ÁMBAR — se colorean solos por la primera palabra.
  pistaRueda.classList.remove('pista-error', 'pista-advertencia');
  if (/^\s*error/i.test(texto)) pistaRueda.classList.add('pista-error');
  else if (/^\s*advertencia/i.test(texto)) pistaRueda.classList.add('pista-advertencia');
  pistaRueda.classList.remove('oculto');
}

function setPistaPorDefecto() {
  setPista(Estado.nombres.length > 0 && !Estado.girando
    ? 'Toca la rueda para girar'
    : null);
}


/* ══════════════════════════════════════════════════════════════════
   NOMBRES: caja de texto → lista viva → rueda
   ══════════════════════════════════════════════════════════════════ */

// Un nombre por línea (se ignoran líneas vacías; los duplicados se
// aceptan: son dos participantes distintos).
function aplicarNombres() {
  if (Estado.girando) return; // durante un giro no se toca la lista
  const anteriores = Estado.nombres.slice();
  Estado.nombres = entradaNombres.value
    .split('\n').map(t => t.trim()).filter(t => t.length > 0);

  // ¿el profesor tocó la lista a mano? (eso NO cuenta como "Quitar de
  // la ruleta"). Si lo que queda es OTRA CLASE — la lista vacía, o
  // menos de la mitad de los nombres en común — la PROGRESIÓN de
  // grupos vuelve a empezar (la tirada 1, normal, otra vez). Arreglar
  // una errata o añadir a alguien nuevo NO la toca: sigue donde estaba.
  if (huboNuevaPartida(anteriores, Estado.nombres)) reiniciarProgresion();

  actualizarContador();
  Motor.construir(Estado.nombres.slice());
  btnGirar.disabled = Estado.nombres.length === 0;
  mensajeEstado.textContent = Estado.nombres.length === 0
    ? 'Escribe algunos nombres y pulsa Girar.' : '';
  setPistaPorDefecto();
  guardar();
}

// ¿es esta una clase NUEVA? (para reiniciar la progresión de grupos):
// la lista quedó VACÍA… o cambia a una con menos de la MITAD de los
// nombres de antes (una clase distinta). Añadir gente o corregir una
// errata no cuenta: el juego sigue donde estaba.
function huboNuevaPartida(anteriores, nuevas) {
  if (anteriores.length === 0) return false;   // aún no había juego
  if (nuevas.length === 0) return true;         // se la llevó vaciada entera
  const comunes = anteriores.filter(n => nuevas.includes(n)).length;
  return comunes < Math.max(1, Math.ceil(anteriores.length / 2));
}

function actualizarContador() {
  const n = Estado.nombres.length;
  contadorNombres.textContent = n === 0
    ? 'sin participantes'
    : `${n} participante${n === 1 ? '' : 's'}`;
}


/* ══════════════════════════════════════════════════════════════════
   ELECCIÓN DE LA ANIMACIÓN SEGÚN EL MODO
   ─────────────────────────────────────────────────────────────────
   · "Normal"            → la clásica de siempre, sin sorpresas.
   · "Realmente normal"  → LA PROGRESIÓN POR GRUPOS (la tabla vive en
     CONFIG.gruposAnimaciones, js/config.js — AHÍ SE CAMBIA EL ORDEN):
     la 1.ª tirada es SIEMPRE la normal; cada persona QUITADA avanza
     al siguiente grupo NO VACÍO; conservar y volver a girar suena la
     SIGUIENTE animación de la lista del grupo actual, EN ORDEN y sin
     repetir hasta agotar el grupo; el último grupo ("El resto")
     baraja cualquier animación no vista… y vistas todas, todas.
   · "Random"            → literalmente random: un mazo barajado con
     TODAS, sin orden y SIN REPETIR hasta agotarse.
   · "Elegir animación"  → siempre la del desplegable. */

// ¿Esta animación puede salir HOY? (la DIANA Y EL DARDO —la 17— pide
// 4 o más nombres: con 2-3 queda fea, tal como se pidió)
function animDisponible(a) {
  return Estado.nombres.length >= (a.minNombres || 1);
}

// Todas las animaciones que HOY pueden salir (habilitadas y con su
// mínimo de nombres cumplido) — lo usan el mazo Random y "El resto".
function todasLasAnims() {
  return ANIMACIONES.filter(a => a.habilitada !== false && animDisponible(a));
}

function elegirAnimacion() {
  const modo = Estado.ajustes.modo;

  if (modo === 'clasico') return ANIMACIONES[0];

  if (modo === 'fija') {
    const i = Math.max(0, Math.min(ANIMACIONES.length - 1, Estado.ajustes.animFija - 1));
    return ANIMACIONES[i];
  }

  if (modo === 'aleatorio') {
    // EL MODO RANDOM: un MAZO barajado con todas (la clásica incluida),
    // sin orden y sin repetir hasta agotarse; luego se rebaraja solo —
    // y la mano nueva nunca EMPIEZA por la que acababa de sonar.
    if (!Array.isArray(Estado.mazo)) Estado.mazo = [];
    // Las que HOY no pueden salir (la diana con menos de 4 nombres) se
    // sacan del mazo: no sonarán esta mano (la diana sin 4+ queda fea).
    Estado.mazo = Estado.mazo.filter(id => {
      const a = ANIMACIONES.find(x => x.id === id);
      return a && a.habilitada !== false && animDisponible(a);
    });
    if (Estado.mazo.length === 0) {
      Estado.mazo = todasLasAnims().map(a => a.id);
      for (let i = Estado.mazo.length - 1; i > 0; i--) {   // Fisher-Yates
        const j = enteroAleatorio(i + 1);
        const tmp = Estado.mazo[i]; Estado.mazo[i] = Estado.mazo[j]; Estado.mazo[j] = tmp;
      }
      if (Estado.mazo.length > 1 && Estado.ultimaAnim &&
          Estado.mazo[Estado.mazo.length - 1] === Estado.ultimaAnim.id) {
        // la que va a salir no puede ser la última que sonó:
        // se cambia por la primera del mazo (el resto, intacto)
        const tmp = Estado.mazo[0];
        Estado.mazo[0] = Estado.mazo[Estado.mazo.length - 1];
        Estado.mazo[Estado.mazo.length - 1] = tmp;
      }
      guardar();
    }
    const id = Estado.mazo.pop();
    const elegida = ANIMACIONES.find(a => a.id === id) || ANIMACIONES[0];
    Estado.ultimaAnim = elegida;
    guardar();
    return elegida;
  }

  // ── Modo 'sorpresa' ("Realmente normal"): LA PROGRESIÓN POR GRUPOS ──
  // Sin ninguna eliminación, la tirada es COMPLETAMENTE normal — siempre.
  const GRUPOS = CONFIG.gruposAnimaciones;
  const eli = Estado.eliminadas || 0;
  if (eli <= 0) {
    Estado.ultimaAnim = ANIMACIONES[0];
    return ANIMACIONES[0];
  }

  // La CADENA de grupos jugables: los de la tabla SIN el primero (el
  // "Normal" — ese es el arranque de toda partida) ni los VACÍOS (el
  // "Bromista" de hoy está vacío a propósito: se salta solo) ni el
  // "resto" (que va aparte, de último).
  const cadena = GRUPOS.filter(g => g.ids.length > 0 && !g.resto && g !== GRUPOS[0]);
  const grupoResto = GRUPOS.find(g => g.resto) ||
    { nombre: 'El resto', ids: [], resto: true };
  const grupo = (eli <= cadena.length) ? cadena[eli - 1] : grupoResto;

  if (grupo.resto) {
    // EL RESTO: cualquier animación NO VISTA de cualquier grupo (menos
    // las del grupo vacío, que no existen). ¿Ya se vieron TODAS? Pues
    // todas — aquí se queda para siempre, disfrutándolas todas.
    let pool = todasLasAnims().filter(a => !Estado.vistas.includes(a.id));
    if (pool.length === 0) pool = todasLasAnims();
    if (pool.length > 1 && Estado.ultimaAnim) {
      const sinRepetir = pool.filter(a => a !== Estado.ultimaAnim);
      if (sinRepetir.length) pool = sinRepetir;
    }
    const elegida = pool[enteroAleatorio(pool.length)] || ANIMACIONES[0];
    Estado.grupoActual = grupo.nombre;
    Estado.ultimaAnim = elegida;
    guardar();
    return elegida;
  }

  // El grupo de siempre: la SIGUIENTE animación de su lista, EN ORDEN,
  // sin repetir hasta agotar el grupo (y entonces vuelve a empezar por
  // la primera — el puntero da la vuelta solo).
  if (Estado.grupoActual !== grupo.nombre) {
    Estado.grupoActual = grupo.nombre;   // grupo nuevo: por la primera
    Estado.punteroGrupo = 0;
  }
  let pool = grupo.ids
    .map(id => ANIMACIONES.find(a => a.id === id))
    .filter(a => a && a.habilitada !== false && animDisponible(a));
  if (pool.length === 0) pool = [ANIMACIONES[0]];   // cinturón de seguridad
  const pos = Math.min(Estado.punteroGrupo || 0, pool.length - 1);
  const elegida = pool[pos];
  Estado.punteroGrupo = (pos + 1) % pool.length;   // la SIGUIENTE, para luego
  Estado.ultimaAnim = elegida;
  guardar();
  return elegida;
}

// (Herramienta libre: el antiguo sorteo ponderado por "peso". Hoy los
// modos sortean uniforme — grupos y mazo —, pero queda por si se pide.)
function sortearPonderado(pool) {
  const total = pool.reduce((suma, a) => suma + a.peso, 0);
  let r = Math.random() * total;
  for (const a of pool) {
    r -= a.peso;
    if (r <= 0) return a;
  }
  return pool[pool.length - 1];
}


/* ══════════════════════════════════════════════════════════════════
   CONTEXTO QUE SE LE ENTREGA A CADA COREOGRAFÍA
   ══════════════════════════════════════════════════════════════════ */

function crearContexto(anim, prep) {
  const n = prep.visual.length;
  const durBase = Estado.ajustes.duracion;
  const vel = Estado.ajustes.velocidad;   // × vueltas (deslizador de Velocidad)
  // Fracción del giro que dura el "coge-velocidad" inicial: el
  // deslizador de Aceleración la encoge o la agranda (×3 casi
  // instantáneo, ×0.5 muy suave).
  const rampa = Math.max(0.03, Math.min(0.5,
    CONFIG.arranqueBase / Estado.ajustes.aceleracion));
  // Las animaciones piden "arranque: true"; aquí se convierte en la
  // fracción real, para que el Motor componga la curva con arranque.
  const conRampa = o => {
    if (o && o.arranque === true) o.arranque = rampa;
    return o;
  };
  const ctx = {
    anim,
    n,                                 // nº de segmentos de la rueda en pantalla
    s: TAU / Math.max(1, n),           // tamaño de un sector, en radianes
    ganador: prep.ganador,             // índice (en la rueda en pantalla)
    originalIdx: prep.originalIdx,    // índice en la lista original
    nota: prep.nota || null,           // línea extra para la tarjeta
    vel,                               // × velocidad (para vueltas sueltas)
    rampa,                             // fracción de arranque (Aceleración): la
                                       // usan las fases con arranque: true

    // Tiempos: las animaciones piden fracciones de la duración base,
    // así el deslizador de Opciones acelera o alarga todo a la vez.
    segs: fraccion => fraccion * durBase * ESCALA,
    dormir: seg => new Promise(r => setTimeout(r, seg * 1000 * ESCALA)),

    // LOS TIEMPOS DE LA GUÍA (los de la otra IA, que el profesor nos
    // pasó): milisegundos que, con la duración por defecto (12 s), son
    // EXACTOS — 6000 son 6000 ms de verdad. Si mueves el deslizador de
    // Duración se escalan en proporción (el "feeling" queda intacto).
    guia: ms => (ms / 1000) * (durBase / CONFIG.duracionBase) * ESCALA,

    // Azar
    aleatorio: azar,
    girosNormal: () => azar(CONFIG.girosMinimos, CONFIG.girosMaximos) * vel,
    vueltas: (a, b) => TAU * azar(a, b) * vel,
    otroIndice: () => indiceDistinto(n, prep.ganador),

    // Movimiento (js/motor.js)
    girarAngulo: o => Motor.girarAngulo(conRampa(o)),
    girarHasta: o => Motor.girarHasta(conRampa({ ganador: prep.ganador, ...o })),
    girarHastaIndice: o => Motor.girarHastaIndice(conRampa(o)),
    girarAnguloAbsoluto: o => Motor.girarAnguloAbsoluto(conRampa(o)),
    girarFlechaHasta: o => Motor.girarFlechaHasta(conRampa({ indice: prep.ganador, ...o })),
    flexionar: o => Motor.flexionar(o),   // inclinar la flecha (tensión)
    soltarFlecha: () => Motor.soltarFlecha(),
    temblor: s => Motor.temblor(s * ESCALA),
    resaltar: (i, d) => Motor.resaltar(i, (d || 1.1) * ESCALA),
    ocultarFlecha: () => Motor.ocultarFlecha(),
    caerFlecha: () => Motor.caerFlecha(), // la flecha cae con física (anim. 8)
    contactoClavija: () => Motor.contactoClavija(), // roce lateral del perno
    jugarCasino: o => Motor.jugarCasino({ ganador: prep.ganador, ...o }), // anim. 9
    volarSegmento: i => Motor.volarSegmento(i),   // anim. 10: ¡fuera!
    caerSegmento: i => Motor.caerSegmento(i),      // anim. 16: a plomo

    // ── Animaciones 11-23 (intervenciones de usuario incluidas) ──
    girarRoto: fn => Motor.girarRoto(fn),          // 11 y 18: gira SIN FIN
    pedirClic: opts => Motor.pedirClic(opts),       // el clic es de la animación
                                                    // (opts: {soloBolita} o
                                                    //  {soloFlecha} filtran
                                                    //  DÓNDE hay que tocar)
    // ANIMACIÓN 22 ("A la tercera se desarma"): espera una acción que
    // puede ser CLIC EN LA RUEDA o pulsación del BOTÓN GIRAR (la
    // barra espaciadora también vale) — la regla de los TRES clics
    // cuenta cualquiera de ellas. Devuelve {x, y} si fue clic de rueda
    // (para que el desarme arranque por ahí), o null si fue botón.
    esperarClicOGirar: () => new Promise(resolver => {
      const cerrar = () => { clicGirarPendiente = null; Motor.cancelarClic(); };
      clicGirarPendiente = () => { cerrar(); resolver(null); };   // botón/barra
      Motor.pedirClic().then(c => {
        if (clicGirarPendiente) { cerrar(); resolver(c); }        // rueda
      });
    }),
    arranqueManual: opts => Motor.arranqueManual(opts),  // 19: gírala a MANO
    setPista: t => setPista(t),                     // la pista de arriba
    paywallBroma: () => bromaPremium(),             // 12: el anuncio SaaS
    frenarEnSeco: s => Motor.frenarEnSeco(s),       // 13: el muro
    multiplicarSelectores: () => Motor.multiplicarSelectores(),  // 14
    caerSelector: k => Motor.caerSelector(k),       // 14: el clon se cae
    latidoFlecha: () => Motor.latidoFlecha(),       // 14: el superviviente late
    jugarShell: () => Motor.jugarShell({           // 15: el juego de los vasos
      ganador: prep.ganador,
      pedirEleccion: repetir => {
        // SIN ALERTA (se pidió quitarla: es OBVIO qué hacer — los vasos
        // latiendo y la pista de arriba lo dicen solos). La pista, siempre.
        setPista('Elige un vaso…');
        return Motor.pedirClic().then(c => { setPista(null); return c; });
      },
      definirGanador: idx => ctx.definirGanador(idx),
    }),
    jugarDiana: () => Motor.jugarDiana({          // 17: la diana y el dardo
      pedirLanzamiento: () => {
        // SIN ALERTA (se pidió: ninguna alerta si no se pide). La
        // PISTA de arriba guía sola — el dardo latiendo, también.
        setPista('Agarra el dardo y lánzalo a la diana');
      },
      alLanzarUI: () => setPista(null),            // el dardo ya vuela
      definirGanador: idx => ctx.definirGanador(idx),
    }),
    sectorBajoPunto: (x, y) => Motor.sectorBajoPunto(x, y),  // 16
    sectorBajoFlecha: () => Motor.sectorBajoFlecha(),  // 11 y 18: donde iba
    colocarGanador: (u = 0.5) => Motor.colocarRueda(prep.ganador, u),  // 6
    derraparHasta: o => Motor.derraparHasta(o),   // 11 y 18: el frenazo de auto
    indiceBajoFlecha: () => Motor.indiceBajoFlecha(),
    clicGiro: clicGiro || null,   // el clic que arrancó ESTE giro (anim. 16)

    // Efectos y sonido
    sonido: Sonido,
    chasquido: () => efectoChasquido(prep), // devuelve promesa (el polvo)
    zoomLento: () => contenedorLienzo.classList.add('zoom-lento'),

    // La AVERÍA visible (11: humo y chispas del freno dañado) y el ángulo
    // del selector k (14: aterrizar bajo el superviviente al azar).
    humoIniciar: () => Motor.humoIniciar(),
    humoParar: () => Motor.humoParar(),
    anguloSelector: k => Motor.anguloSelector(k),
  };

  // El ganador puede REDEFINIRSE a mitad de animación: las que decide el
  // PROFESOR (los vasos —la bolita del vaso elegido— y la diana —donde
  // cayó el dardo—). La coreografía lo llama y la tarjeta anuncia al
  // nombre correcto.
  ctx.definirGanador = idx => {
    prep.ganador = idx;
    prep.originalIdx = idx;
    ctx.ganador = idx;
    ctx.originalIdx = idx;
  };
  return ctx;
}


/* ══════════════════════════════════════════════════════════════════
   EL GIRO COMPLETO (de principio a fin)
   ══════════════════════════════════════════════════════════════════ */

async function girarRuleta() {
  // Si hay una decisión pendiente (Conservar/Quitar), primero se cierra
  // como CONSERVAR: nunca se borra a alguien por accidente.
  if (Estado.girando || Estado.nombres.length === 0) return;
  if (tarjetaAbierta) { resolverTarjeta('conservar'); return; }

  Estado.girando = true;
  document.body.classList.add('girando');
  mensajeEstado.textContent = '';
  setPista(null);   // durante el giro no hace falta pista (la ponen
                    // las animaciones si hay intervención de usuario)

  // 1) Qué animación toca
  const anim = elegirAnimacion();

  // LA REGLA DE LOS TRES CLICS (animación 22 — "A la tercera se
  // desarma"): esa animación NECESITA que el botón GIRAR siga vivo
  // (sus pulsaciones cuentan como clics), así que hoy no se congela
  // — y la clase del cuerpo reactiva la tarjeta de nombres en el CSS.
  btnGirar.disabled = !anim.cuentaClics;
  document.body.classList.toggle('cuenta-clics', !!anim.cuentaClics);

  // (La progresión de grupos apunta ya esta animación como VISTA — para
  //  "El resto": las no vistas.)
  if (Estado.ajustes.modo === 'sorpresa' && !Estado.vistas.includes(anim.id)) {
    Estado.vistas.push(anim.id);
    guardar();
  }

  // 2) Preparación: las animaciones 7 y 20 devuelven su rueda ampliada
  //    y su sorteo ponderado (con el color de cada porción); el resto usa
  //    la lista tal cual y azar justo.
  const base = { lista: Estado.nombres.slice() };
  const prep = anim.preparar
    ? anim.preparar(base)
    : { visual: base.lista, ganador: enteroAleatorio(base.lista.length) };
  if (prep.originalIdx == null) prep.originalIdx = prep.ganador;

  // prep.colores solo lo traen las animaciones 7 y 20 (réplicas con el
  // color de su dueño); el resto construye con la paleta de siempre.
  Motor.construir(prep.visual, prep.colores);
  const ctx = crearContexto(anim, prep);
  clicGiro = null;   // ya está capturado en ctx.clicGiro: al próximo giro, limpio

  // 3) La coreografía
  try {
    await anim.girar(ctx);
  } catch (err) {
    console.error('[Ruleta] Error durante la animación:', err);
  }
  Motor.cancelarClic();   // ningún clic huérfano: ya no hay quién lo espere

  // EL GANADOR puede haberlo REDEFINIDO la coreografía (las que decide
  // el PROFESOR: los vasos —la bolita del vaso elegido— y la diana
  // —donde cayó el dardo—): el nombre se lee AHORA, ya terminado el
  // giro, y la tarjeta anunciará a quien toque de verdad.
  const nombreElegido = Estado.nombres[prep.originalIdx];

  // (Verificación interna: el ángulo final debe dejar al ganador bajo
  //  la flecha. "Sin girar", "Casino", "Vasos" y "Diana" quedan exentas
  //  por diseño (la primera no gira; en la casino quien elige es la BOLA,
  //  en los vasos la rueda se disolvió en bolitas y en la diana… es el
  //  DARDO el que elige). La "Selección múltiple" también: hoy el
  //  ganador cae bajo el SUPERVIVIENTE al azar, no bajo el de arriba.
  //  Y "A la tercera se desarma" (22) igual: la rueda no giró ni un
  //  grado — la flecha la rodea. "Nadie fue elegido" (23) es TODO lo
  //  contrario: la gracia es que NO cae sobre nadie. Si este aviso
  //  aparece en la consola, algo se descuadró.)
  if (anim.clave !== 'sin-girar' && anim.clave !== 'casino' && anim.clave !== 'vasos' &&
      anim.clave !== 'dardos' && anim.clave !== 'selectores-multiples' &&
      anim.clave !== 'desarme' && anim.clave !== 'tercera-desarme' &&
      anim.clave !== 'nadie-elegido' &&
      Motor.indiceBajoFlecha() !== prep.ganador) {
    console.warn('[Ruleta] Desajuste de ángulo:', Motor.indiceBajoFlecha(), '≠', prep.ganador);
  }

  // 4) Anuncio y decisión Conservar/Quitar — SALVO en "Nadie fue
  //     elegido" (23): ahí nadie ganó (la flecha quedó ENTRE DOS nombres)
  //     y el tiro se REPITE: sin tarjeta, sin historial… y la pista de
  //     arriba queda pidiendo el tiro de nuevo hasta que alguien gire.
  // 5) Restauración: la flecha vuelve, la rueda se recompone y se
  //    reconstruye con la lista vigente (si se quitó a alguien, ya no está).
  // (Todo el resto va protegido: aunque algo falle a mitad de la
  //  restauración —el casino, los vuelos, lo que sea— la ruleta NUNCA
  //  se queda clavada en "girando": siempre se recupera sola.)
  let decision = 'conservar';
  try {
    if (!anim.sinGanador) {
      decision = await anunciarGanador(anim, ctx, prep, nombreElegido);
      if (decision === 'quitar') {
        quitarNombre(prep.originalIdx);
        avanzarGrupo();   // una persona ELIMINADA = un grupo de animaciones más
      }
    }
    await restaurar(anim);
  } catch (err) {
    console.error('[Ruleta] Error al restaurar (la ruleta se recupera sola):', err);
    // desmontaje de emergencia: nada queda a medias
    clicGirarPendiente = null;      // ninguna espera de los tres clics
    contenedorLienzo.classList.remove('zoom-lento');
    Motor.mostrarFlecha();
    Motor.limpiarPolvo();
    Motor.finVuelos();
    Motor.finSelectores();          // los clones, fuera
    Motor.cancelarClic();           // y ningún clic esperando
    try { Motor.arranqueCancelar(); } catch (e) { /* sin arranque activo */ }
    try { Motor.estado.shell = null; } catch (e) { /* sin juego activo */ }
    try { Motor.estado.diana = null; } catch (e) { /* sin diana activa */ }
    try { Motor.humoParar(); } catch (e) { /* sin humo activo */ }
    try { Sonido.turboParar(); } catch (e) { /* sin turbo activo */ }
    try { Sonido.abanicoParar(); } catch (e) { /* sin abanico activo */ }
    try { Sonido.casinoMusicaParar(); } catch (e) { /* sin música activa */ }
    tarjetaGanador.classList.remove('visible');
    tarjetaAbierta = false;
    try { Motor.finCasino(); } catch (e) { /* sin casino activo */ }
  }

  Motor.normalizarAngulo();
  Motor.construir(Estado.nombres.slice());

  if (!anim.sinGanador) registrarHistorial(nombreElegido, anim);

  Estado.girando = false;
  document.body.classList.remove('girando', 'cuenta-clics');
  btnGirar.disabled = Estado.nombres.length === 0;
  actualizarContador();
  // "Toca la rueda para girar" vuelve arriba… SALVO si la animación
  // dejó su propio aviso pidiendo otro tiro (la 23: "Realice el tiro
  // de nuevo" — ese se queda hasta el próximo giro).
  if (!anim.sinGanador) setPistaPorDefecto();
  guardar();
}


/* ══════════════════════════════════════════════════════════════════
   TARJETA DEL GANADOR (aparece AL LADO de la ruleta, sin taparla)
   ══════════════════════════════════════════════════════════════════ */

let resolverTarjeta = null; // la promesa de la decisión (la cierran los botones)
let tarjetaAbierta = false;

async function anunciarGanador(anim, ctx, prep, nombre) {
  // El segmento del ganador late en la rueda (protagonismo total para
  // la ruleta: nada de taparla ni difuminarla).
  Motor.fijarResaltado(prep.ganador);

  // Música (la animación "El chasquido" tiene su final solemne: gong;
  // el CASINO estrena su FANFARRIA DE VICTORIA de metales y platillos;
  // las demás: fanfarria + confeti).
  if (anim.clave === 'chasquido') Sonido.gong();
  else if (anim.clave === 'casino') { Sonido.victoriaCasino(); lanzarConfeti(); }
  else { Sonido.victoria(); lanzarConfeti(); }

  // Contenido de la tarjeta — LIMPIA, tal como se pidió: sin el
  // nombre de la animación ni el comentario sobre ella (solo el
  // ganador, su notita de outcomes —si la hay— y los botones).
  etiquetaAnim.textContent = `Animación No. ${String(anim.id).padStart(2, '0')}`;
  etiquetaAnim.classList.remove('oculto');
  nombreGanador.textContent = nombre;
  fraseAnim.textContent = '';
  fraseAnim.classList.add('oculto');
  notaAnim.textContent = ctx.nota || '';
  notaAnim.classList.toggle('oculto', !ctx.nota);
  prepararBotonesGanador(nombre);

  tarjetaGanador.classList.add('visible');
  tarjetaAbierta = true;

  // Esperamos la decisión del profesor.
  const decision = await new Promise(res => { resolverTarjeta = res; });

  tarjetaAbierta = false;
  resolverTarjeta = null;
  tarjetaGanador.classList.remove('visible');
  Motor.fijarResaltado(null);
  return decision;
}

// Los botones dependen del ajuste "Al elegir a alguien".
function prepararBotonesGanador(nombre) {
  botonesGanador.innerHTML = '';
  const crear = (texto, decision, clase) => {
    const b = document.createElement('button');
    b.textContent = texto;
    b.className = clase;
    b.addEventListener('click', () => resolverTarjeta && resolverTarjeta(decision));
    botonesGanador.appendChild(b);
  };

  if (Estado.ajustes.alElegir === 'quitar') {
    crear(`Quitar a ${nombre} de la ruleta`, 'quitar', 'boton peligro');
  } else if (Estado.ajustes.alElegir === 'conservar') {
    crear('Conservar y seguir', 'conservar', 'boton normal');
  } else {
    crear('Conservar', 'conservar', 'boton normal');
    crear('Quitar de la ruleta', 'quitar', 'boton peligro');
  }
}

// Quita al ganador de la lista y del cuadro de texto, sin tocar a
// nadie más (los duplicados se quitan de uno en uno). Se busca por
// NOMBRE, no por posición: así sigue siendo correcto aunque el cuadro
// de texto se haya editado mientras la tarjeta estaba abierta.
function quitarNombre(idx) {
  const nombre = Estado.nombres[idx];
  if (nombre == null) return;
  const pos = Estado.nombres.indexOf(nombre);
  if (pos !== -1) Estado.nombres.splice(pos, 1);
  entradaNombres.value = Estado.nombres.join('\n');
  actualizarContador();
}


/* ══════════════════════════════════════════════════════════════════
   LA PROGRESIÓN DE GRUPOS (modo "Realmente normal")
   ─────────────────────────────────────────────────────────────────
   Para avanzar entre grupos hay que haber ELIMINADO a una persona con
   el botón "Quitar de la ruleta" (conservar no cuenta). La 1.ª tirada
   —sin ninguna eliminación— es SIEMPRE la animación completamente
   normal. La etiqueta de Opciones cuenta por dónde va la progresión.
   ══════════════════════════════════════════════════════════════════ */

// Una eliminación más (la llama girarRuleta al decidir "quitar").
function avanzarGrupo() {
  Estado.eliminadas = (Estado.eliminadas || 0) + 1;   // cada una avanza
  Estado.grupoActual = null;   // al cambiar de grupo, se empieza por su
  Estado.punteroGrupo = 0;     // PRIMERA animación (el puntero se resetea)
  guardar();
}

// La progresión vuelve a empezar (otra clase: la 1.ª tirada, normal).
function reiniciarProgresion() {
  Estado.eliminadas = 0;
  Estado.vistas = [];
  Estado.ultimaAnim = null;
  Estado.grupoActual = null;
  Estado.punteroGrupo = 0;
}

/* ══════════════════════════════════════════════════════════════════
   RESTAURACIÓN TRAS CADA ANIMACIÓN
   ══════════════════════════════════════════════════════════════════ */

async function restaurar(anim) {
  if (anim.clave === 'chasquido') {
    // La rueda se recompone (el polvo se borra), la flecha reaparece.
    contenedorLienzo.classList.remove('zoom-lento');
    Motor.mostrarFlecha();
    Motor.limpiarPolvo();
    await new Promise(r => setTimeout(r, 450 * ESCALA)); // que se vea volver
  }
  if (anim.clave === 'flecha-giratoria') {
    await Motor.devolverFlecha(); // la flecha regresa arriba suavemente
  }
  if (anim.clave === 'casino') {
    // El casino se despide: la rueda se frena, la bola se funde, la
    // MÚSICA de salón se corta y la rueda se TRANSFORMA de vuelta en la
    // de nombres de siempre.
    await Motor.finCasino();
    Sonido.casinoMusicaParar();
    await new Promise(r => setTimeout(r, 250 * ESCALA));
  }
  if (anim.clave === 'voladora') {
    // Los segmentos vuelven a su sitio (la rueda entera se reconstruye
    // justo después, en girarRuleta()).
    Motor.finVuelos();
  }
  if (anim.clave === 'selectores-multiples') {
    // Los clones ya cayeron todos: fuera de la escena (y el
    // superviviente se aquieta del latido). Hoy el superviviente pudo
    // ser un CLON — y el selector de ARRIBA haberse caído con física:
    // la flecha de siempre reaparece aquí, lista para el próximo giro.
    Motor.mostrarFlecha();
    Motor.finSelectores();
  }
  if (anim.clave === 'vasos') {
    // El juego de los vasos se despide: la escena se desvanece y la
    // rueda vuelve a ser la de nombres de siempre.
    await Motor.finShell();
    await new Promise(r => setTimeout(r, 150 * ESCALA));
  }
  if (anim.clave === 'dardos') {
    // La diana se despide: la escena se desvanece y la rueda vuelve a
    // ser la de nombres de siempre (derecha y plana otra vez).
    await Motor.finDiana();
    await new Promise(r => setTimeout(r, 150 * ESCALA));
  }
  if (anim.clave === 'desarme') {
    // La flecha regresa arriba por el borde (suavecito)… y los pedazos
    // caídos, fuera: la rueda entera se reconstruye justo después.
    await Motor.devolverFlecha();
    Motor.finVuelos();
  }
  if (anim.clave === 'tercera-desarme') {
    // Lo mismo que el desarme: la flecha vuelve arriba por el borde… y
    // los pedazos caídos (que hoy cayeron SIN girar ni un grado), fuera.
    await Motor.devolverFlecha();
    Motor.finVuelos();
  }
}


/* ══════════════════════════════════════════════════════════════════
   EFECTOS ESPECIALES (polvo de la rueda, destello, confeti)
   ══════════════════════════════════════════════════════════════════ */

// EL CHASQUIDO: destello + sonido + TODA LA RUEDA se deshace en polvo
// de verdad (estilo Infinity War): cada segmento perdedor se convierte
// en granos que se borran del borde al centro mientras nacen partículas
// con el color REAL de cada píxel; solo queda el elegido.
// Devuelve la promesa del Motor.iniciarPolvo() (la espera la animación).
function efectoChasquido(prep) {
  destello();
  Sonido.chasquido();
  Motor.prepararPolvo(prep.ganador);
  return Motor.iniciarPolvo(CONFIG.duracionPolvo);
}

// Destello blanco de pantalla completa.
function destello() {
  destelloEl.classList.add('activo');
  setTimeout(() => destelloEl.classList.remove('activo'), 140);
}

// Lluvia de confeti para celebrar al ganador.
function lanzarConfeti() {
  for (let i = 0; i < 90; i++) {
    const c = document.createElement('span');
    c.className = 'confeti';
    c.style.left = (50 + (Math.random() * 44 - 22)).toFixed(1) + 'vw';
    c.style.background = CONFIG.paleta[enteroAleatorio(CONFIG.paleta.length)];
    c.style.setProperty('--dx', (Math.random() * 300 - 150).toFixed(0) + 'px');
    c.style.setProperty('--rot', (Math.random() * 720 - 360).toFixed(0) + 'deg');
    c.style.setProperty('--dur', (1.1 + Math.random() * 0.9).toFixed(2) + 's');
    c.addEventListener('animationend', () => c.remove());
    capaParticulas.appendChild(c);
  }
}


/* ══════════════════════════════════════════════════════════════════
   ANIMACIÓN 12 · LA BROMA PREMIUM (el anuncio SaaS + la alerta)
   ──────────────────────────────────────────────────────────────
   El CLÁSICO modal de "paga para ver tu resultado", con sus TRES
   planes de pago, su "El más popular", su caja registradora y su
   letra pequeña canallesca — exactamente como todas las SaaS.

   A los ~6 s (tiempo de que la clase reaccione), sale la ALERTA DEL
   NAVEGADOR confesando la broma: esto es y siempre será gratis, hazle
   click al botón. Entonces el anuncio se avergüenza (precios tachados,
   banner de "gratis para siempre") y el botón pasa a ser de verdad:
   "Ver el resultado (gratis)". Al pulsarlo se cierra… y el ganador
   aparece tras él, con su tarjeta y su confeti.
   Devuelve una promesa que se cumple al cerrar el anuncio.
 ═════════════════════════════════════════════════════════════════ */
function bromaPremium() {
  return new Promise(resolver => {
    Sonido.kaching();   // dinero de anuncio desde el primer segundo

    // — el escenario: capa oscura + tarjeta con los tres planes —
    const capa = document.createElement('div');
    capa.id = 'capaPremium';
    capa.innerHTML = `
      <div class="tarjeta-premium" role="dialog" aria-modal="true">
        <h3>Has alcanzado tu <em>prueba gratuita</em> de la ruleta</h3>
        <p class="premium-sub">Para ver el resultado de este giro y seguir
        jugando, actualiza tu plan:</p>
        <div class="planes">
          <div class="plan">
            <h4>Básico</h4>
            <p class="precio">$4.99<span>/mes</span></p>
            <ul><li>10 giros al día</li><li>Resultados ocultos</li><li>Anuncios</li></ul>
            <button type="button" class="plan-boton" disabled>Elegir</button>
          </div>
          <div class="plan destacado">
            <span class="cinta">El más popular</span>
            <h4>Premium</h4>
            <p class="precio">$9.99<span>/mes</span></p>
            <ul><li>Giros ilimitados</li><li>Ver los resultados</li><li>Soporte prioritario</li></ul>
            <button type="button" class="plan-boton cta-premium">Ver mi resultado</button>
            <p class="aviso-premium oculto">Requiere el plan Premium</p>
          </div>
          <div class="plan">
            <h4>PRO</h4>
            <p class="precio">$19.99<span>/mes</span></p>
            <ul><li>Todo lo de Premium</li><li>Animaciones exclusivas</li><li>Acceso anticipado</li></ul>
            <button type="button" class="plan-boton" disabled>Elegir</button>
          </div>
        </div>
        <p class="letra-pequena">Al hacer clic se te cobrará la primera cuota de
        inmediato. Cancela cuando quieras (con 3 meses de preaviso).</p>
      </div>`;
    document.body.appendChild(capa);

    const tarjeta = capa.querySelector('.tarjeta-premium');
    const cta = capa.querySelector('.cta-premium');
    const aviso = capa.querySelector('.aviso-premium');

    const cerrar = () => { capa.remove(); resolver(); };

    // Antes de la alerta, el botón SOLO tiembla y avisa (máximo cliché).
    cta.addEventListener('click', () => {
      if (cta.dataset.libre) { cerrar(); return; }   // ya es gratis: a ver
      tarjeta.classList.remove('tiembla');
      void tarjeta.offsetWidth;                       // reinicia la animación
      tarjeta.classList.add('tiembla');
      aviso.classList.remove('oculto');
    });

    // A los ~6 s (con ?rapido=1, en proporción): LA ALERTA DE NAVEGADOR.
    setTimeout(() => {
      window.alert('¡Es broma! Esta ruleta es y siempre será 100% gratis.\n\nHazle click al botón para ver el resultado (nunca habrá que pagar nada).');
      // La confesión: el anuncio se avergüenza — precios tachados,
      // banner de "gratis para siempre"… y el botón pasa a ser de verdad.
      capa.classList.add('broma-revelada');
      cta.dataset.libre = '1';
      cta.textContent = 'Ver el resultado (gratis)';
      aviso.classList.add('oculto');
      Sonido.pop();   // la burbuja del chiste, desinflada
    }, 5800 * ESCALA);
  });
}


/* ══════════════════════════════════════════════════════════════════
   HISTORIAL DE GANADORES (con el tiempo de un giro al siguiente)
   ══════════════════════════════════════════════════════════════════ */

function registrarHistorial(nombre, anim) {
  Estado.historial.unshift({
    nombre,
    anim: anim.nombre,
    hora: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
    ts: Date.now(), // para calcular cuánto pasó entre giro y giro
  });
  Estado.historial.length = Math.min(Estado.historial.length, CONFIG.historialMaximo);
  renderizarHistorial();
}

// "1m 23 s" o "45 s": formato corto para el tiempo entre giros.
function formatearDelta(ms) {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  const resto = s % 60;
  if (m < 60) return `${m} min ${resto} s`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}

function renderizarHistorial() {
  historial.innerHTML = '';
  if (Estado.historial.length === 0) {
    const li = document.createElement('li');
    li.className = 'vacio';
    li.textContent = 'Todavía no ha girado nadie.';
    historial.appendChild(li);
    return;
  }
  Estado.historial.forEach((h, i) => {
    const li = document.createElement('li');
    const fuerte = document.createElement('strong');
    fuerte.textContent = h.nombre;
    const meta = document.createElement('span');
    meta.className = 'meta';
    // El tiempo que pasó desde el giro ANTERIOR (el de más abajo).
    let tiempo = 'primer giro';
    const previo = Estado.historial[i + 1];
    if (previo && previo.ts && h.ts) tiempo = `⏱ ${formatearDelta(h.ts - previo.ts)} desde el anterior`;
    meta.textContent = `${h.anim} · ${h.hora} · ${tiempo}`;
    li.appendChild(fuerte);
    li.appendChild(meta);
    historial.appendChild(li);
  });
}


/* ══════════════════════════════════════════════════════════════════
   CABLEADO DE LA INTERFAZ
   ══════════════════════════════════════════════════════════════════ */

function cablearEventos() {

  // Girar (con el botón del panel, la barra espaciadora… o TOCANDO
  // LA RUEDA: se pidió así — cualquier parte de la rueda la gira).
  // Sin clic de rueda: las animaciones que miran ctx.clicGiro
  // (el desarme) lo verán null y arrancarán por donde esté la flecha.
  // OJO — LA REGLA DE LOS TRES CLICS (animación 22): si esa animación
  // está esperando sus clics, una pulsación del botón GIRAR CUENTA
  // como clic (igual que tocar la rueda o apretar la barra). El botón
  // no está congelado en esa animación — le llega el evento sanito.
  btnGirar.addEventListener('click', () => {
    if (clicGirarPendiente) { clicGirarPendiente(); return; }
    clicGiro = null;
    girarRuleta();
  });

  // TOCAR LA RUEDA TAMBIÉN GIRA. Si una animación con INTERVENCIÓN DE
  // USUARIO está esperando un clic (el motor dañado: "haz clic en el
  // motor"; los frenos dañados: "presiona la flecha"; el juego de los
  // vasos: "elige un vaso"), el clic LE PERTENECE a la animación y se
  // lo entregamos (si cae fuera de la zona esperada, suena bajito y
  // sigue esperando). Si no, y la rueda está en reposo… ¡a girar!
  // El clic que ARRAstra el giro se recuerda (clicGiro): el desarme
  // empieza a caer JUSTO POR el segmento que se pulsó (animación 16).
  lienzo.addEventListener('click', e => {
    const rect = lienzo.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (Motor.hayClicPendiente()) {
      Motor.entregarClic(x, y);   // es de la animación que lo espera
      return;
    }
    if (Estado.girando) return;  // giro en curso sin intervención
    const est = Motor.estado;
    if (Math.hypot(x - est.cx, y - est.cy) > est.r + 30) return;  // fuera
    clicGiro = { x, y };
    girarRuleta();
  });

  document.addEventListener('keydown', e => {
    if (e.code === 'Space' && !e.target.closest('textarea, input, select, button')) {
      e.preventDefault();
      // LA REGLA DE LOS TRES CLICS (22): la barra espaciadora también
      // cuenta como clic si la animación la está esperando.
      if (clicGirarPendiente) { clicGirarPendiente(); return; }
      if (!Estado.girando) {
        clicGiro = null;                       // con la barra: no hay clic
        if (tarjetaAbierta) resolverTarjeta('conservar'); // Espacio = conservar
        else girarRuleta();
      }
    }
    if (e.key === 'Escape' && tarjetaAbierta && resolverTarjeta) {
      resolverTarjeta('conservar'); // cerrar con Esc = conservar
    }
  });

  // La lista se actualiza sola mientras se escribe (con un pequeño
  // retardo para no reconstruir la rueda con cada tecla).
  let temporizador = null;
  entradaNombres.addEventListener('input', () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(aplicarNombres, 400);
  });
  btnActualizar.addEventListener('click', aplicarNombres);

  // Modo de giro
  document.querySelectorAll('input[name="modo"]').forEach(radio => {
    radio.addEventListener('change', () => {
      Estado.ajustes.modo = radio.value;
      filaAnimFija.classList.toggle('oculto', radio.value !== 'fija');
      guardar();
    });
  });

  // Animación fija (desplegable)
  seleccionAnimacion.addEventListener('change', () => {
    Estado.ajustes.animFija = Number(seleccionAnimacion.value);
    guardar();
  });

  // Duración del giro
  rangoDuracion.addEventListener('input', () => {
    Estado.ajustes.duracion = Number(rangoDuracion.value);
    valorDuracion.textContent = Estado.ajustes.duracion + ' s';
    guardar();
  });

  // Velocidad del giro (× vueltas por giro: ×1.5 de serie)
  rangoVelocidad.addEventListener('input', () => {
    Estado.ajustes.velocidad = Number(rangoVelocidad.value);
    valorVelocidad.textContent = '×' + Estado.ajustes.velocidad.toFixed(1);
    guardar();
  });

  // Aceleración (cuánto tarda la rueda en coger velocidad)
  rangoAceleracion.addEventListener('input', () => {
    Estado.ajustes.aceleracion = Number(rangoAceleracion.value);
    valorAceleracion.textContent = '×' + Estado.ajustes.aceleracion.toFixed(1);
    guardar();
  });

  // Sonido
  checkSonido.addEventListener('change', () => {
    Estado.ajustes.sonido = checkSonido.checked;
    guardar();
  });

  // (La MÚSICA DEL CASINO ya no tiene botón: el NOCTURNO DE SALÓN
  //  suena solo en la animación 9, sin selector alguno — el swing
  //  anterior se retiró cuando se rehízo el tema.)

  // ── TEMA CLARO / OSCURO: EL BOTÓN DE LA LUNA ────────────────────
  // Vive en la cabecera, junto a "Opciones" (se pidió así: fuera del
  // panel). En modo claro se ve la LUNA (pulsar → oscuro); en modo
  // oscuro, el SOL (pulsar → claro). El icono lo cambia el CSS según
  // data-theme; aquí solo se alterna y se guarda la elección.
  if (btnTema) {
    btnTema.addEventListener('click', () => {
      Estado.ajustes.tema = Estado.ajustes.tema === 'oscuro' ? 'claro' : 'oscuro';
      aplicarTema();
      guardar();
    });
  }

  // Comportamiento al elegir
  seleccionAlElegir.addEventListener('change', () => {
    Estado.ajustes.alElegir = seleccionAlElegir.value;
    guardar();
  });

  // Historial
  btnLimpiarHistorial.addEventListener('click', () => {
    Estado.historial = [];
    renderizarHistorial();
    guardar();
  });

  // Pantalla completa (ideal para proyectar en clase)
  btnPantallaCompleta.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => {});
  });
}

/* ══════════════════════════════════════════════════════════════════
   ARRANQUE
   ══════════════════════════════════════════════════════════════════ */

(function iniciar() {

  // 1) Lo guardado entre sesiones
  const guardado = cargarGuardado();
  Estado.nombres = Array.isArray(guardado.nombres) ? guardado.nombres : [];
  Object.assign(Estado.ajustes, guardado.ajustes || {});
  Estado.historial = Array.isArray(guardado.historial) ? guardado.historial : [];

  // La PROGRESIÓN DE GRUPOS y el MAZO del modo Random también se
  // guardan entre sesiones (la clase de ayer no empieza de cero tras
  // un cierre accidental). El mazo se filtra por si la lista de
  // animaciones cambió de tamaño alguna vez.
  Estado.eliminadas = Number.isFinite(guardado.eliminadas) ? Math.max(0, guardado.eliminadas|0) : 0;
  Estado.vistas = Array.isArray(guardado.vistas) ? guardado.vistas : [];
  Estado.grupoActual = (typeof guardado.grupoActual === 'string') ? guardado.grupoActual : null;
  Estado.punteroGrupo = Number.isFinite(guardado.punteroGrupo) ? Math.max(0, guardado.punteroGrupo|0) : 0;
  if (Array.isArray(guardado.mazo)) {
    const validas = ANIMACIONES.map(a => a.id);
    Estado.mazo = guardado.mazo.filter(id => validas.includes(id));
  }

  // 2) Parámetros de la URL (pruebas: ?anim=4, ?nombres=A|B|C)
  if (PARAMS.has('anim')) {
    const n = parseInt(PARAMS.get('anim'), 10);
    if (n >= 1 && n <= ANIMACIONES.length) {
      Estado.ajustes.modo = 'fija';
      Estado.ajustes.animFija = n;
    }
  }
  if (PARAMS.has('nombres')) {
    Estado.nombres = PARAMS.get('nombres').split('|').map(t => t.trim()).filter(Boolean);
  }

  // La animación fija guardada de otra sesión puede haber quedado fuera
  // de rango (la lista de animaciones cambió de tamaño): se ajusta al máximo.
  Estado.ajustes.animFija = Math.max(1,
    Math.min(ANIMACIONES.length, +Estado.ajustes.animFija || 1));

  // 3) Tema (claro por defecto) antes de dibujar nada
  aplicarTema();

  // 4) El desplegable solo muestra los números de animación.
  ANIMACIONES.forEach(a => {
    const op = document.createElement('option');
    op.value = a.id;
    op.textContent = `Animación No. ${String(a.id).padStart(2, '0')}`;
    seleccionAnimacion.appendChild(op);
  });

  document.title = CONFIG.titulo;
  document.querySelector('h1').textContent = CONFIG.titulo;

  document.querySelectorAll('input[name="modo"]').forEach(radio => {
    radio.checked = radio.value === Estado.ajustes.modo;
  });
  filaAnimFija.classList.toggle('oculto', Estado.ajustes.modo !== 'fija');
  seleccionAnimacion.value = String(Estado.ajustes.animFija);
  rangoDuracion.value = Estado.ajustes.duracion;
  valorDuracion.textContent = Estado.ajustes.duracion + ' s';
  rangoVelocidad.value = Estado.ajustes.velocidad;
  valorVelocidad.textContent = '×' + Number(Estado.ajustes.velocidad).toFixed(1);
  rangoAceleracion.value = Estado.ajustes.aceleracion;
  valorAceleracion.textContent = '×' + Number(Estado.ajustes.aceleracion).toFixed(1);
  checkSonido.checked = !!Estado.ajustes.sonido;
  seleccionAlElegir.value = Estado.ajustes.alElegir;

  // 5) Motor + lista inicial (el canvas de polvo va superpuesto al de la rueda)
  Motor.iniciar(lienzo, contenedorLienzo, lienzoPolvo);
  entradaNombres.value = Estado.nombres.join('\n');
  Motor.construir(Estado.nombres.slice());
  btnGirar.disabled = Estado.nombres.length === 0;
  mensajeEstado.textContent = Estado.nombres.length === 0
    ? 'Escribe algunos nombres y pulsa Girar.' : '';
  actualizarContador();
  setPistaPorDefecto();   // "Toca la rueda para girar", desde el inicio
  renderizarHistorial();
  cablearEventos();
})();
