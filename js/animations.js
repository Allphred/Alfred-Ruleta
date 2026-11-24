/* ════════════════════════════════════════════════════════════════════
   LAS VEINTITRÉS ANIMACIONES DE LA RULETA
   ──────────────────────────────────────────────────────────────────────
   Cada animación es un objeto con esta ficha:

     id         → número (1–23), el que se usa con ?anim=N en la URL
     clave      → nombre interno para el código
     nombre     → nombre que se muestra al usuario
     peso       → probabilidad RELATIVA en el sorteo antiguo (hoy lo
                  usan los modos por peso — el grupo y el mazo sortean
                  uniforme; se conserva por compatibilidad)
     habilitada → false = no participa en el sorteo de los modos
     minNombres → nº MÍNIMO de nombres para que pueda salir sorteada
                  (la DIANA Y EL DARDO pide 4: con 2-3 nombres queda
                  fea — solo se fuerza con "Elegir animación")
     cuentaClics→ true = el botón GIRAR sigue vivo durante esta
                  animación y sus pulsaciones cuentan como clics (la
                  regla de los TRES clics de la 22)
     sinGanador → true = esta animación NO saca tarjeta: nadie fue
                  elegido y el tiro se repite (la 23: la flecha cae
                  entre dos nombres)
     descripcion→ texto de ayuda del desplegable
     frase      → la línea con la que se presenta al ganador (hoy no
                  se muestra: la tarjeta salió LIMPIA, tal como se
                  pidió — sin nombre de animación ni comentario)
     preparar() → (opcional) prepara la lista y el sorteo ANTES de girar;
                  solo la animación 7 y la 20 la usan (rueda ampliada)
     girar()    → la coreografía: una secuencia de fases "await" que
                  describe el movimiento de la rueda

   HERRAMIENTAS DEL CONTEXTO (ctx) que reciben las coreografías:

     ctx.segs(f)   → segundos: f × duración base (la del deslizador)
     ctx.dormir(s) → espera s segundos sin mover nada
     ctx.guia(ms)  → LOS MILISEGUNDOS DE LA GUÍA (la de la otra IA, que
                    el profesor nos pasó): con la duración por defecto
                    (12 s) son EXACTOS — 6000 son 6000 ms de verdad—;
                    si mueves el deslizador de Duración se escalan
                    (todo el “feeling” de la guía está en esos números)
     ctx.vel        → multiplicador de VELOCIDAD del deslizador de
                      Opciones (×1.5 de serie: más vueltas por giro)
     ctx.rampa      → fracción del giro que dura el arranque, según el
                      deslizador de Aceleración (para que las curvas
                      hechas a medida también lo respeten)
     ctx.girarHasta({ vueltas, sentido, duracion, suavizado, u, arranque })
                    → gira y frena EXACTAMENTE sobre el ganador
                       sentido: 1 = horario, -1 = antihorario
                       vueltas: nº APROXIMADO de vueltas (admite decimales;
                       el destino exacto nunca se desvía)
                       u: punto dentro del segmento destino (0–1).
                       arranque: true → la rueda coge fuerza al principio
                       (según el deslizador de Aceleración)
     ctx.girarHastaIndice({...}) → igual, pero apuntando a un índice
                    concreto (lo usan las animaciones que "mienten")
     ctx.girarAngulo({ delta, duracion, suavizado }) → giro "crudo":
                    gira exactamente delta radianes y aterriza donde sea
                    (acepta delta NEGATIVO: retrocesos y rebotes)
     ctx.girarAnguloAbsoluto({ hasta, ... }) → gira hasta un ángulo
                    ABSOLUTO, con vueltas aproximadas (rebote con tope)
     ctx.girarFlechaHasta({...}) → en vez de mover la rueda, mueve la
                    FLECHA alrededor de ella (animación 4)
     ctx.flexionar({ hasta, duracion, vibracion }) → INCLINA la flecha
                    hasta "hasta" radianes; "vibracion" = temblor nervioso
                    (la flecha apoyada en la clavija, animación 3)
     ctx.soltarFlecha() → la flecha se desprende de la clavija con un
                    latigazo elástico y vuelve a su sitio
     ctx.contactoClavija() → radianes: cuánto tiene que avanzar la rueda
                    para que una clavija que está BAJO la flecha llegue a
                    rozar su FLANCO. Los empujones de la animación 3 se
                    miden con esto: la clavija nunca llega a pasarla.
     ctx.caerFlecha() → la flecha se desprende y CAE con física de verdad
                    (gravedad, volteretas, rebotes contra el borde de la
                    rueda) hasta salir del cuadro (animación 8)
     ctx.jugarCasino({ duracion, vel }) → ANIMACIÓN 9: la rueda se
                    TRANSFORMA en una ruleta de casino de verdad (bol,
                    pista, deflectores, bolsillos…) y la BOLITA gira al
                    revés hasta caer en el bolsillo del ganador. La
                    promesa se cumple con la bola acomodada (la rueda
                    sigue girando despacito hasta finCasino(), que llama
                    js/ui.js al cerrar la tarjeta del ganador).
     ctx.volarSegmento(i) → ANIMACIÓN 10: el segmento i se desprende y
                    sale VOLANDO con física (centrífuga, volteretas,
                    gravedad), arrastrando su nombre consigo.

   HERRAMIENTAS NUEVAS (animaciones 11-18, con intervenciones de usuario):
     ctx.girarRoto(fn) → ANIMACIONES 11 y 18: giro SIN FIN (el motor
                    dañado y los frenos dañados): la rueda gira con la
                    velocidad fn(t) (rad/s) hasta que la animación llame
                    a roto.detener(). Sirve para "gira y no para" — sin
                    ninguna alerta de navegador: la pista de arriba manda.
     ctx.pedirClic()  → promete el próximo CLIC sobre el lienzo (en
                    coordenadas del canvas). Mientras lo esperan, la
                    UI no arranca giros: el clic es de la animación
                    (parar la rueda, elegir un vaso…). Admite opciones:
                    { soloBolita: true } → SOLO el clic en la BOLITA
                    NEGRA del buje (el MOTOR DAÑADO de la 11: "haz clic
                    en el motor para apagarlo" — la bolita luce su
                    anillo dorado latiendo); { soloFlecha: true } → SOLO
                    el clic en EL TRIÁNGULO selector (los FRENOS
                    DAÑADOS de la 18: "presiona la flecha" — y la flecha
                    LATE suavecita llamando al profesor).
     ctx.setPista(t) → cambia (o borra con null) el texto de la pista
                    sobre la rueda ("Toca la rueda para girar"), para
                    guiar las intervenciones.
     ctx.paywallBroma() → ANIMACIÓN 12: el modal SaaS con los planes
                    + la ALERTA DEL NAVEGADOR de la broma + el botón
                    "gratis" (todo vive en js/ui.js).
     ctx.frenarEnSeco() → ANIMACIÓN 13: de toda velocidad a CERO: sin
                    estelas, golpe seco y vibración de impacto.
     ctx.multiplicarSelectores() / ctx.caerSelector(k) /
     ctx.latidoFlecha() → ANIMACIÓN 14: N selectores (uno por nombre)
                    alrededor de la rueda; los clones se caen con
                    física de uno en uno… y el superviviente LATE.
     ctx.jugarShell() → ANIMACIÓN 15: el juego de los VASOS entero
                    (bolitas CON SU COLOR, la mesa de madera, el
                    barajar a ras de mesa —sin levantarse—, la elección
                    y la revelación — con la intervención del usuario).
     ctx.caerSegmento(i) → ANIMACIÓN 16: el segmento i se desprende
                    y se CAE a plomo (la rueda ni se mueve).
     ctx.jugarDiana() → ANIMACIÓN 17: la DIANA y el DARDO (la rueda a
                    plano sagital, el dardo agarrable y lanzable con el
                    gesto, el clavado y la vuelta a plano frontal —
                    con la intervención del usuario; SIN alertas).
     ctx.sectorBajoFlecha() → qué sector está pasando AHORA MISMO por
                    la flecha (lo usan el motor dañado y los frenos
                    dañados: la rueda para "donde iba" en el instante
                    de apagar el motor o pisar la flecha).
     ctx.colocarGanador(u) → COLOCA la rueda AL INSTANTE, sin girar ni
                    un grado, con la flecha sobre el ganador (lo usa
                    "Sin girar", la 6: como si la animación no cargó).
     ctx.sectorBajoPunto(x, y) → qué sector está bajo ese punto del
                    lienzo EN ESE INSTANTE (lo usa el desarme, para
                    empezar a caer por donde se pulsó).
     ctx.derraparHasta({ indice, u, velocidad }) → el patinazo frenético
                    de auto con los neumáticos trabados (animaciones 11
                    y 18: el frenazo dramático de siempre).
     ctx.clicGiro → las coordenadas {x, y} del CLIC que arrancó este
                    giro (null si empezó con el botón o la barra
                    espaciadora): la usa el desarme (16) para empezar
                    a desarmarse por el segmento pulsado.
     ctx.indiceBajoFlecha() → el índice que está ahora mismo bajo la
                    flecha (fallback del desarme sin clic).
     ctx.esperarClicOGirar() → ANIMACIÓN 22 ("A la tercera se
                    desarma"): espera una acción del usuario que puede
                    ser un CLIC EN LA RUEDA *o* una pulsación del BOTÓN
                    GIRAR (también vale la barra espaciadora) — la regla
                    de los TRES clics cuenta cualquiera de ellas.
                    Devuelve {x, y} si fue clic de rueda, o null si fue
                    el botón/la barra.
     ctx.definirGanador(i) → para las animaciones donde decide el
                    PROFESOR (los vasos: la bolita del vaso elegido; la
                    diana: donde cayó el dardo; el motor dañado y los
                    frenos dañados: donde iba al frenarla): el ganador
                    pasa a ser ese índice y la tarjeta anuncia al
                    correcto.
     ctx.humoIniciar() / ctx.humoParar() → el humo y las chispas de
                    la avería (animación 11: se VE que el motor
                    se quemó).

     EL ABANICO AVERIADO (animación 19 — "ayúdala a girar"):
     ctx.arranqueManual({ velocidad, umbral }) → la rueda penando MUY
                    lento y AGARRABLE: el profesor la GIRA A MANO con
                    el puntero y al soltarla con fuerza la promesa se
                    cumple con { velocidad, sentido } (si la suelta
                    floja, vuelve a su marchita: reintenta).
     ctx.sonido.cortoCircuito() → el chispazo eléctrico que abre
                    la animación (zumbido trabado + crepitaciones).
     ctx.sonido.abanicoDanadoIniciar() / abanicoAjustar(v) /
                    abanicoTransicionNormal(s) / abanicoParar() → el
                    sonido del ABANICO DAÑADO (máquina de recortarse)
                    que sigue la velocidad real de la rueda y se CURA
                    a abanico sano cuando el motor agarra. (Ajustar lo
                    llama solo el bucle maestro.)

     ctx.otroIndice()  → un índice al azar distinto del ganador
     ctx.girosNormal() → vueltas de un giro clásico (ya multiplicadas
                    por el deslizador de Velocidad)
     ctx.resaltar(i, s) → hace destellar el segmento i durante s segundos
     ctx.temblor(s)     → vibración de frenazo (amortiguada)
     ctx.sonido         → el objeto Sonido (tic clásico, crujido,
                    victoria, reverso, suspenseo…)

     LOS GRUPOS (para el modo "Realmente normal" — la tabla vive en
     CONFIG.gruposAnimaciones, en js/config.js — AHÍ SE CAMBIA EL
     ORDEN): 1.ª tirada SIEMPRE normal; cada persona QUITADA con
     "Quitar de la ruleta" avanza al siguiente grupo (los vacíos se
     saltan solos); conservar y re-girar va a la SIGUIENTE animación
     de la lista del grupo actual, sin repetir hasta agotarlo. El
     último grupo ("El resto") baraja cualquier animación no vista.

   SUAVIZADOS disponibles (definen cómo cambia la velocidad):
     SUAV.lineal               velocidad constante
     SUAV.salidaCubica         frenada suave
     SUAV.salidaCuartica       frenada más larga (más suspenso)
     SUAV.salidaRuleta         frenada de ruleta de feria: el final se
                               arrastra muchísimo (exponente 4.5 — súbelo
                               para un final aún más lento)
     SUAV.salidaQuintica       frenada larguísima (arrastre final)
     SUAV.entradaSalidaCubica  arranca parado, acelera y frena
     SUAV.elastica             rebote elástico (latigazo de la flecha)

   ARRANQUE (la aceleración de Opciones): cualquier fase acepta
   arranque: true. Entonces los primeros instantes del giro la rueda
   coge velocidad desde parada — como si alguien la empujara — y luego
   sigue con la curva pedida. Cuánto dura ese arranque lo decide el
   deslizador de Aceleración (×3 casi instantáneo, ×0.5 muy suave).
   ════════════════════════════════════════════════════════════════════ */

// Curvas de suavizado (t va de 0 a 1; devuelven el avance de 0 a 1)
const SUAV = {
  lineal:               t => t,
  salidaCubica:         t => 1 - Math.pow(1 - t, 3),
  salidaCuartica:       t => 1 - Math.pow(1 - t, 4),
  // La curva "de feria": los últimos grados cuestan una eternidad.
  // El 4.5 controla lo lento del final: 4 = suave, 5 = glacial.
  salidaRuleta:         t => 1 - Math.pow(1 - t, 4.5),
  salidaQuintica:      t => 1 - Math.pow(1 - t, 5),
  entradaSalidaCubica:  t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  // ARRANQUE SUAVE + ARRASTRE FINAL (el "easeStartEnd" de la guía:
  // el segundo tramo de la parada falsa). Sale despacio —sin tirón—,
  // coge fuerza… y el final se arrastra larguísimo.
  arranqueYArrastre:   t => (1 - Math.pow(1 - t, 5))
                            * (1 - Math.pow(1 - Math.min(1, t / 0.35), 2)),
  // Rebote elástico amortiguado (vuelve sobresaltándose y oscila)
  elastica:             t => 1 - Math.exp(-4.5 * t) * Math.cos(13 * t),
};

// ── Fábricas de curvas con el exponente a la carta ────────────────
// (así usamos EXACTAS las de la guía: easeOut(4) = salidaCuartica, pero
//  easeOut(1.7) o easeOut(2) no estaban en la caja de siempre).
// · salidaPotencia(p): potencia BAJA = llega CON VELOCIDAD (el choque
//   del rebote con tope); potencia alta = frena más y se arrastra.
// · entradaPotencia(p): aceleración continua (el turbo de la voladora
//   acelera cada vez más: t^2.2, como en la guía).
const salidaPotencia = p => t => 1 - Math.pow(1 - t, p);
const entradaPotencia = p => t => Math.pow(t, p);

// ── ARRANQUE: composición de una curva con un "coge-velocidad" inicial ──
// Toma la curva pedida y devuelve otra equivalente que, durante la
// primera fracción "rampa", acelera desde parada: la velocidad real es
// (velocidad de la curva) × (t/rampa), limitada a 1. El recorrido se
// renormaliza para que el destino final siga siendo EXACTAMENTE el
// mismo (el aterrizaje no se desvía ni un grado).
// Se precalcula una tablita numérica: en cada frame es un simple muestreo.
function conArranque(curva, rampa) {
  if (!(rampa > 0.02)) return curva;
  rampa = Math.min(0.6, rampa);
  const N = 512, pos = new Float64Array(N + 1);
  const dt = 1 / N;
  let acumulado = 0;
  for (let i = 0; i < N; i++) {
    const t = (i + 0.5) / N;
    // velocidad de la curva base en t (derivada numérica)…
    let vel = (curva(Math.min(1, t + dt / 2)) - curva(Math.max(0, t - dt / 2))) / dt;
    if (vel < 0) vel = 0;
    // …multiplicada por el factor de arranque (0 → 1 linealmente)
    acumulado += vel * Math.min(1, t / rampa) * dt;
    pos[i + 1] = acumulado;
  }
  if (acumulado <= 0) return curva;
  for (let i = 0; i <= N; i++) pos[i] /= acumulado;
  return t => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    const x = t * N;
    const i = Math.floor(x);
    if (i >= N) return pos[N];
    const f = x - i;
    return pos[i] * (1 - f) + pos[i + 1] * f;
  };
}

// ── PERFIL DE VELOCIDAD → curva de posición ───────────────────────────
// Herramienta libre para coreografías que se describen mejor por CUÁNTO
// corre la rueda en cada instante que por una curva de posición (las
// versiones antiguas de la parada falsa y la voladora la usaban; hoy
// siguen los tiempos de la guía, pero queda disponible).
// perfil(u) devuelve la velocidad angular NORMALIZADA (≈1 = velocidad
// de crucero) en el instante u (0..1) del giro. Se integra numéricamente
// y se normaliza para que la posición acabe exactamente en 1: el
// aterrizaje sobre el ganador no se desvía ni un grado.
// La ventaja: la velocidad NUNCA tiene por qué llegar a cero — la rueda
// puede frenar muchísimo (sin pararse) y volver a correr.
function curvaDeVelocidad(perfil) {
  const N = 600;
  const pos = new Float64Array(N + 1);
  const du = 1 / N;
  let acumulado = 0;
  for (let i = 0; i < N; i++) {
    const u = (i + 0.5) / N;
    acumulado += Math.max(0, perfil(u)) * du;
    pos[i + 1] = acumulado;
  }
  if (acumulado <= 0) return SUAV.lineal;
  for (let i = 0; i <= N; i++) pos[i] /= acumulado;
  return t => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    const x = t * N;
    const i = Math.floor(x);
    if (i >= N) return 1;
    const f = x - i;
    return pos[i] * (1 - f) + pos[i + 1] * f;
  };
}

// ── LA CURVA DEL ABANICO QUE ARRANCA (animación 19) ─────────────────
// El aterrizaje del abanico curado, contado por su VELOCIDAD: arranca
// EXACTO a la velocidad con la que la mano lo soltó (se itera el
// arranque "a" para que r(0) calce — ni un salto de un frame), SUBE
// PROGRESIVAMENTE mientras el motor agarra… y luego una caída
// larguísima de abanico apagándose (la cola de siempre, estirada).
// v0 = velocidad de la mano (rad/s) · vmaxRel = la de crucero,
// RELATIVA a la media del giro · delta/T = lo que recorre y cuánto.
function curvaAbanico(v0, vmaxRel, delta, T) {
  // velocidad inicial RELATIVA a la media del giro (limitada: ni glacial
  // ni disparatada — la mano suelta entre 0.3 y 2.6 por debajo/arriba)
  const k = Math.max(0.3, Math.min(2.6, (v0 * T) / Math.abs(delta)));
  const t1 = 0.34, t2 = 0.52;   // sube hasta el 34 %, crucero hasta el 52 %
  let a = k;                     // r(0) (se afina abajo hasta clavar k)
  let perfil = u => 1;
  for (let it = 0; it < 3; it++) {   // dos-tres pasadas bastan
    perfil = u => {
      const pico = Math.max(a * 1.05, vmaxRel);   // nunca por debajo del arranque
      if (u < t1) return a + (pico - a) * (u / t1); // PROGRESIVA: el motor agarra
      if (u < t2) return pico;                      // crucero de abanico sano
      const x = (u - t2) / (1 - t2);
      return pico * Math.pow(1 - x, 2.6) + 0.09;     // la cola: se apaga despacito
    };
    // R = ∫ perfil (numérico): para que r(0)/R = k → a = k·R
    let R = 0;
    const N = 240, du = 1 / N;
    for (let i = 0; i < N; i++) R += perfil((i + 0.5) * du) * du;
    if (R > 0) a = k * R;
  }
  return curvaDeVelocidad(perfil);   // re-normaliza (el cociente r(0)/R queda)
}


// ── CONFIG.clasica con su cinturón (lo usan la 1 y la 23) ────────
// (así el ajuste fino de la clásica vive en config.js y nunca revienta)
const CLASICA_CFG = () => ({ fraccion: 1, suspenso: 4.5, ...(CONFIG.clasica || {}) });

const ANIMACIONES = [

  /* ═══ 1 · CLÁSICA ═════════════════════════════════════════════ */
  {
    id: 1,
    clave: 'clasica',
    nombre: 'Clásica',
    peso: 3,
    habilitada: true,
    descripcion: 'Giro normal con frenada de feria: el final se arrastra para que la elección se saboree. (El ajuste fino de sus tiempos —duración y cuánto se arrastra el final— vive en CONFIG.clasica, en js/config.js.)',
    frase: 'Con toda la tensión del final…',

    async girar(ctx) {
      // Vueltas normales (5–8, ya multiplicadas por el deslizador de
      // Velocidad) y frenada "de feria": los últimos grados cuestan
      // una eternidad, con un TIC… tic… tic… lento.
      // EL AJUSTE FINO DE LOS TIEMPOS (se pidió ajustarla con MUCHA
      // precisión) vive en CONFIG.clasica (js/config.js):
      //   · fraccion → cuánto dura (1 = lo que diga el deslizador).
      //   · suspenso  → exponente del final (4.5 = el de siempre;
      //                  6 = aún más lento; 3 = más corto).
      const CL = CLASICA_CFG();
      await ctx.girarHasta({
        vueltas: ctx.girosNormal(),
        sentido: 1,
        duracion: ctx.segs(CL.fraccion),
        suavizado: salidaPotencia(CL.suspenso),   // la "salidaRuleta" de siempre
        arranque: true,   // la rueda coge fuerza al empezar (Aceleración)
      });
    },
  },


  /* ═══ 2 · PARADA FALSA (la versión buena, con los tiempos de la ═════
     guía): frena de verdad, se PARA, calla… y sigue en el mismo sentido */
  {
    id: 2,
    clave: 'parada-falsa',
    nombre: 'Parada falsa… y sigue',
    peso: 1.4,
    habilitada: true,
    descripcion: 'Frena de VERDAD hasta velocidad cero y se PARA del todo sobre un nombre señuelo, centrado. Un silencio de 450 ms: todo el mundo la da por terminada… y entonces arranca otra vez, suave, en el MISMO sentido, hasta el ganador con un final que se arrastra.',
    frase: 'Se paró de verdad… ¡y sin embargo, siguió!',

    async girar(ctx) {
      // LA VERSIÓN BUENA, con los números EXACTOS de la guía (los
      // tiempos son su alma: 6000 / 450 / 6000 ms). El truco de la
      // parada falsa no es ralentizar a medias: es PARARSE de verdad
      // sobre un SEÑUELO y quedarse quieto un instante.
      //   · Tramo 1 — 6000 ms, easeOut(4), 4 vueltas: frena de verdad
      //     hasta velocidad CERO, centrado (u = 0.5) sobre un nombre
      //     AL AZAR (el señuelo; si coincide con el ganador, no pasa
      //     nada — la guía lo permite).
      //   · Pausa — 450 ms totalmente quieto: el público cree que ya
      //     terminó. El silencio engaña más que la lentitud.
      //   · Tramo 2 — 6000 ms, easeStartEnd (arranqueYArrastre), 2
      //     vueltas MÁS en el MISMO sentido (nunca inverso): sale
      //     despacio, sin tirón… y el final se arrastra larguísimo.
      const senuelo = enteroAleatorio(ctx.n);
      await ctx.girarHastaIndice({
        indice: senuelo,
        u: 0.5,                     // centrado: parece LA elección
        vueltas: 4 * ctx.vel,
        sentido: 1,
        duracion: ctx.guia(6000),   // 6000 ms exactos con 12 s de duración
        suavizado: SUAV.salidaCuartica,   // easeOut(4): termina en vel. 0
      });
      await ctx.dormir(0.45);      // 450 ms quietos: la clase ya celebró
      await ctx.girarHasta({
        vueltas: 2 * ctx.vel,
        sentido: 1,                 // mismo sentido, como si tal cosa
        duracion: ctx.guia(6000),
        suavizado: SUAV.arranqueYArrastre,  // arranque suave + arrastre
      });
    },
  },


  /* ═══ 3 · TAMBALEO (antes "Tensión decisiva" — rebote con tope, ═════
     replicada EXACTA como en la guía: la flecha actúa de TOPE y la
     rueda choca y rebota. La NUEVA "Tensión decisiva" es la 21.) */
  {
    id: 3,
    clave: 'tambaleo',
    nombre: 'Tambaleo',
    peso: 1.6, // un pelín más probable que las demás: es la favorita
    habilitada: true,
    minNombres: 2,
    descripcion: 'La flecha actúa de TOPE: la rueda llega con velocidad y se PASA del ganador… y CHOCA. Rebota hacia atrás —pasando nombres por la flecha, cada vez más cerca—, vuelve a chocar, rebota más corto… y se asienta exactamente sobre el elegido.',
    frase: '¡Chocó con el tope… y rebota hasta el ganador!',

    async girar(ctx) {
      // Con un solo nombre no hay juego: se degrada a giro clásico.
      if (ctx.n < 2) {
        await ctx.girarHasta({
          vueltas: ctx.girosNormal(), sentido: 1,
          duracion: ctx.segs(1), suavizado: SUAV.salidaRuleta, arranque: true,
        });
        return;
      }

      // El ángulo T que deja al GANADOR bajo la flecha (a una altura al
      // azar dentro de su sector, como el stopAt de la guía: u ∈ .15–.85).
      const u = 0.15 + Math.random() * 0.7;
      const T = ANGULO_FLECHA_TOPE - (ctx.ganador + u) * ctx.s;
      const s = ctx.s;

      // ── El choque: 3600 ms con easeOut(1.7) — potencia BAJA a
      // propósito: llega TODAVÍA CON VELOCIDAD, no frenando. Se pasa
      // 1.3 segmentos del ganador… y ahí está el tope. (Son 5 vueltas
      // aprox., como el stopAt(w, 5, 1) de la guía.)
      await ctx.girarAnguloAbsoluto({
        hasta: T + s * 1.3,
        vueltas: 5 * ctx.vel,
        sentido: 1,
        duracion: ctx.guia(3600),
        suavizado: salidaPotencia(1.7),
      });
      ctx.sonido.golpe(0.85);   // ¡el choque contra el tope!

      // ── Los rebotes: offsets de la guía (en segmentos, alrededor de
      // T): −0.9, +0.55, −0.3, +0.14 y 0 — alternando lados y cada vez
      // más cortos. Cada uno dura 420 ms con easeOut(2): empieza brusco
      // (el rebote del golpe) y MUERE en velocidad cero, como un golpe.
      // El último offset es 0: queda EXACTAMENTE en el ganador.
      // Los deltas entre extremos consecutivos son exactamente la
      // distancia del salto (1.3 → −0.9 → 0.55 → −0.3 → 0.14 → 0):
      const rebotes = [
        { delta: -2.20 * s, fuerza: 0.65 },   // rebota hacia atrás, lejos
        { delta:  1.45 * s, fuerza: 0.50 },   // vuelve a pasarse un poco
        { delta: -0.85 * s, fuerza: 0.38 },   // cada rebote, más corto…
        { delta:  0.44 * s, fuerza: 0.28 },
        { delta: -0.14 * s, fuerza: 0.20 },   // …hasta asentarse: 0
      ];
      for (const r of rebotes) {
        await ctx.girarAngulo({
          delta: r.delta,
          duracion: ctx.guia(420),        // 420 ms cada rebote (la guía)
          suavizado: salidaPotencia(2),   // easeOut(2): muere en el golpe
        });
        ctx.sonido.golpe(r.fuerza);      // "tok": rebotó contra el tope
      }
      // Durante los rebotes pasan nombres intermedios por la flecha
      // (los tics suenan solos): eso es lo que da la tensión.
    },
  },


  /* ═══ 4 · EL QUE GIRA ES LA FLECHA ════════════════════════════════ */
  {
    id: 4,
    clave: 'flecha-giratoria',
    nombre: 'El que gira es la flecha',
    peso: 1,
    habilitada: true,
    descripcion: 'La rueda no se mueve: la flecha da vueltas alrededor de ella y decide.',
    frase: 'Hoy quien gira es la flecha.',

    async girar(ctx) {
      // La rueda está quieta; la flecha orbita y frena encima del
      // ganador. Los tics suenan igual (cada clavija que cruza).
      // (Pide 6–8 vueltas —y el deslizador de Velocidad la acelera aún
      // más— en menos tiempo: así ya no se hace eterna.)
      await ctx.girarFlechaHasta({
        vueltas: ctx.aleatorio(6, 8) * ctx.vel,
        sentido: 1,
        duracion: ctx.segs(0.8),
        suavizado: SUAV.salidaCuartica,
        arranque: true,
      });

      // Un momento de silencio antes del anuncio.
      await ctx.dormir(0.4);
      // (Tras la decisión Conservar/Quitar, la flecha regresa arriba sola.)
    },
  },


  /* ═══ 5 · RETROCEDE Y ELIGE AL ANTERIOR (los tiempos de la ═══════
     guía: cae sobre un nombre, pausa… y retrocede UN segmento) */
  {
    id: 5,
    clave: 'retrocede-anterior',
    nombre: 'Retrocede y elige al anterior',
    peso: 1.2,
    habilitada: true,
    descripcion: 'Frena claramente sobre un nombre —una pausa cruel de 350 ms: parece la elección final… y entonces RETROCEDE exactamente un segmento: el elegido es el que acababa de pasar por la flecha.',
    frase: 'Parecía decidido… pero retrocede: ¡el anterior!',

    async girar(ctx) {
      if (ctx.n < 2) {
        await ctx.girarHasta({
          vueltas: ctx.girosNormal(), sentido: 1,
          duracion: ctx.segs(1), suavizado: SUAV.salidaRuleta, arranque: true,
        });
        return;
      }

      // El "aparente": sobre quién parece que va a caer la flecha. La
      // rueda luego RETROCEDE un segmento (al retroceder, el índice
      // bajo la flecha SUBE en uno), así que el aparente debe ser el
      // nombre ANTERIOR al ganador en el orden de la rueda.
      const aparente = (ctx.ganador - 1 + ctx.n) % ctx.n;

      // Giro normal de la guía (8500 ms, easeOut(5), 6 vueltas) que cae
      // CLARAMENTE sobre el aparente, en pleno centro (u = 0.5):
      // todos lo vieron "ganar".
      await ctx.girarHastaIndice({
        indice: aparente,
        u: 0.5,
        vueltas: 6 * ctx.vel,
        sentido: 1,
        duracion: ctx.guia(8500),
        suavizado: SUAV.salidaQuintica,   // easeOut(5): el final se arrastra
        arranque: true,
      });

      // Pausa cruel de 350 ms (la MITAD de los 700 de la guía, tal
      // como se pidió): parece la selección final.
      await ctx.dormir(0.35);

      // …y RETROCEDE exactamente UN segmento en 700 ms, con easeInOut
      // (como en la guía): el que acababa de pasar queda elegido.
      // (Como cae en pleno centro del aparente, un sector exacto atrás
      // es el pleno centro del ganador — jamás en una frontera.)
      await ctx.girarAngulo({
        delta: -ctx.s,
        duracion: ctx.guia(700),
        suavizado: SUAV.entradaSalidaCubica,   // easeInOut
      });
    },
  },


  /* ═══ 6 · SIN GIRAR ═══════════════════════════════════════════════ */
  {
    id: 6,
    clave: 'sin-girar',
    nombre: 'Sin girar',
    peso: 0.9,
    habilitada: true,
    descripcion: 'Le das a Girar… y NADA: tres segundos de silencio absoluto, la rueda ni se mueve — como si la animación del giro no hubiera cargado. Y de pronto YA ESTÁ: sin haber girado ni un grado, la rueda amanece parada con la flecha señalando al ganador. Se puso y ya.',
    frase: 'Parece que no cargó… pero ya estaba decidido.',

    async girar(ctx) {
      // Tres segundos de NADA: le diste al botón de girar y la rueda
      // ni se inmuta — ni un tic, ni un grado, ni un destello. (El
      // silencio ES el chiste: parece que la animación no cargó.)
      await ctx.dormir(3);

      // …y de pronto YA ESTÁ: la rueda se COLOCA al instante — sin
      // girar, sin animación, en un solo frame — con la flecha encima
      // del ganador. No es que el selector se mueva: es que la rueda
      // amanece puesta ahí, como si el giro nunca cargó y alguien
      // pusiera el resultado sin más. Se puso y ya. (La tarjeta del
      // ganador llega sola, como siempre.)
      ctx.colocarGanador(0.5);
    },
  },


  /* ═══ 7 · PROBABILIDAD AUMENTADA (como en la guía: el favorecido ═══
     duplicado y REPARTIDO por toda la rueda, siempre con SU color) */
  {
    id: 7,
    clave: 'probabilidad',
    nombre: 'Probabilidad multiplicada',
    peso: 1,
    habilitada: true,
    descripcion: 'Un nombre al azar pasa a ocupar muchísimas porciones DEL MISMO COLOR, REPARTIDAS por toda la rueda (tantas copias como nombres haya, mínimo 3 — nunca pegadas). El giro es totalmente normal.',
    frase: 'Su probabilidad estaba multiplicada.',

    // preparar() se ejecuta ANTES del giro: decide a quién se favorece
    // y construye la rueda ampliada (la receta es la de la guía).
    preparar(base) {
      const lista = base.lista;
      // CUÁNTAS copias EXTRA del favorecido: como en la guía, tantas
      // como nombres haya (mínimo 3). (CONFIG.copiasExtraProb permite
      // fijarlo a mano; 0 = automático.)
      const k = CONFIG.copiasExtraProb > 0
        ? CONFIG.copiasExtraProb
        : Math.max(3, lista.length);

      // A quién se le multiplica la suerte: UN nombre al azar.
      const favorecido = enteroAleatorio(lista.length);

      // El color de cada participante es el de SU posición en la lista
      // original. Las copias HEREDAN ese color: nunca aparecen de otro
      // color — se ve de un vistazo que es la misma persona dispersa
      // por toda la rueda.
      const p = CONFIG.paleta.length;
      const coloresBase = lista.map((_, j) => CONFIG.paleta[j % p]);

      if (!CONFIG.mostrarRefuerzo) {
        // ── Modo sigiloso ──────────────────────────────────────────
        // La rueda se ve completamente normal, pero el sorteo está
        // ponderado: el favorecido tiene 1 + k boletos y los demás uno.
        const ganador = Math.random() < (k + 1) / (lista.length + k)
          ? favorecido
          : indiceDistinto(lista.length, favorecido);
        return {
          visual: lista,                    // la rueda de siempre
          colores: coloresBase,              // y sus colores de siempre
          ganador,                           // índice en esa rueda
          originalIdx: ganador,
          nota: `Nadie lo vio venir: su probabilidad estaba multiplicada x${k + 1}.`,
        };
      }

      // ── Modo visible (por defecto) ────────────────────────────
      // El favorecido se DUPLICA k veces y sus copias se van insertando
      // en posiciones AL AZAR (como el splice de la guía): quedan
      // REPARTIDAS por toda la rueda, nunca pegadas. TODAS con su mismo
      // color. El sorteo se hace DESPUÉS de ampliar la lista — uniforme
      // sobre las porciones, que es exactamente lo mismo que ponderar.
      const visual = lista.slice();
      const colores = coloresBase.slice();
      const mapa = lista.map((_, i) => i);
      for (let c = 0; c < k; c++) {
        // Posición al azar… con un pequeño arreglo: si el azar la pone
        // PEGADA a otra copia, se re-sortea (la guía quiere las copias
        // "dispersas, no pegadas": así lo garantizamos casi siempre).
        let pos = enteroAleatorio(visual.length + 1);
        for (let intento = 0; intento < 12; intento++) {
          const izq = pos > 0 && visual[pos - 1] === lista[favorecido];
          const der = pos < visual.length && visual[pos] === lista[favorecido];
          if (!izq && !der) break;
          pos = enteroAleatorio(visual.length + 1);
        }
        visual.splice(pos, 0, lista[favorecido]);
        colores.splice(pos, 0, coloresBase[favorecido]);
        mapa.splice(pos, 0, favorecido);
      }
      const porcion = enteroAleatorio(visual.length);  // sorteo uniforme
      return {
        visual,                     // la rueda ampliada y dispersa
        colores,                    // cada porción con el color de su dueño
        ganador: porcion,           // índice en la rueda ampliada
        originalIdx: mapa[porcion], // índice en la lista original
        nota: `Su probabilidad estaba multiplicada x${k + 1}.`,
      };
    },

    async girar(ctx) {
      // El giro es totalmente normal (el de la guía: 8500 ms con
      // easeOut(5)): la gracia está en la rueda, no en el giro.
      await ctx.girarHasta({
        vueltas: 6 * ctx.vel,
        sentido: 1,
        duracion: ctx.guia(8500),
        suavizado: SUAV.salidaQuintica,
        arranque: true,
      });
    },
  },


  /* ═══ 8 · EL CHASQUIDO (modo Infinity) ═══════════════════════════ */
  {
    id: 8,
    clave: 'chasquido',
    nombre: 'El chasquido (Infinity)',
    peso: 0.9,
    habilitada: true,
    descripcion: 'La flecha SE CAE de verdad (con física: gravedad, volteretas y rebotes contra la rueda), el giro es mudo… y tras unos segundos TODA LA RUEDA se deshace en polvo, salvo el nombre elegido.',
    frase: 'Un chasquido… y solo quedó uno.',

    async girar(ctx) {
      // 1) La flecha SE DESPRENDE Y CAE — de verdad: se tambalea hacia
      //    un lado, cae acelerando por la gravedad, da volteretas y
      //    bota contra el borde de la rueda hasta salir del cuadro.
      //    Nada de desvanecerse en el aire ni de caída recta de mentira:
      //    la trayectoria sale sola de la física (Motor.caerFlecha).
      await ctx.dormir(0.22);   // un instante de calma antes del drama
      await ctx.caerFlecha();

      // 2) Giro totalmente normal… pero mudo (sin flecha no hay quien
      //    cruce nada) y por supuesto frena sobre el ganador.
      await ctx.girarHasta({
        vueltas: ctx.girosNormal(),
        sentido: 1,
        duracion: ctx.segs(0.97),
        suavizado: SUAV.salidaRuleta,
        sinTics: true,
        arranque: true,
      });

      // 3) La pausa incómoda: la rueda está parada y no pasa nada…
      //    (con zoom lento cinematográfico). CONFIG.retardoChasquido
      //    controla cuántos segundos de silencio.
      ctx.zoomLento();
      await ctx.dormir(CONFIG.retardoChasquido);

      // 4) ¡CHASQUIDO! Destello + sonido… y cada segmento perdedor se
      //    deshace en POLVO de verdad, grano a grano, del borde al
      //    centro, con partículas que llevan el color real de cada
      //    píxel (los nombres incluidos). El segmento del elegido es
      //    el único que sobrevive. (La promesa se resuelve cuando ya
      //    no queda ni polvo.)
      await ctx.chasquido();

      // 5) Un silencio solemne… el gong y la tarjeta del ganador llegan
      //    solos justo después (los dispara js/ui.js).
      await ctx.dormir(0.45);
    },
  },


  /* ═══ 9 · LA RULETA DE CASINO (el reto) ════════════════════════════ */
  {
    id: 9,
    clave: 'casino',
    nombre: 'Ruleta de casino',
    peso: 1.3, // la joya de la corona: un pelín más probable
    habilitada: true,
    descripcion: 'La rueda se TRANSFORMA en una ruleta de casino de verdad: bol de madera, pista con filetes, 8 deflectores dorados y bolsillos rojo y negro. La BOLITA gira al revés que la rueda, se cae de la pista, bota en un deflector… y cae en el bolsillo del elegido. Con sonido de casino.',
    frase: 'Como en Las Vegas: la bolita ha hablado.',

    async girar(ctx) {
      // La coreografía entera vive en js/motor.js (jugarCasino):
      // la transformación, el wheelhead, la bola, los deflectores, el
      // bolsillo… La promesa se cumple con la bola ACOMODADA en el
      // bolsillo del ganador; la rueda sigue girando despacito (como
      // las de verdad) mientras el profesor decide Conservar/Quitar,
      // y al decidir, js/ui.js → restaurar() la transforma de vuelta.
      await ctx.jugarCasino({
        duracion: ctx.segs(1),
        vel: ctx.vel,
      });

      // Un respiro para saborear la bola en el bolsillo antes del anuncio.
      await ctx.dormir(0.35);
    },
  },


  /* ═══ 10 · A TODA VELOCIDAD (la voladora, con los tiempos de la ═════
     guía: aceleración continua t²·², piezas volando entre el 1.5 y el
     5 s… y el final un 40 % MÁS CORTO, como pidió el profesor) */
  {
    id: 10,
    clave: 'voladora',
    nombre: 'A toda velocidad',
    peso: 1.1,
    habilitada: true,
    descripcion: 'La rueda gira tan ridículamente rápido que se desenfoca… y los segmentos salen VOLANDO de uno en uno —cada uno con su nombre— empujados por la centrífuga. Al final, en la rueda, SOLO queda el segmento del ganador… y frena en seco, sin eternidades.',
    frase: 'Tan rápido que los demás salieron volando.',

    async girar(ctx) {
      // Dos tramos, como la guía:
      //   · Tramo 1 — 6500 ms acelerando SIN PARAR (t^2.2: cada vez más
      //     rápido —arranca casi normal y acaba enloquecida). Mientras,
      //     los segmentos van saliendo volando uno a uno entre el
      //     segundo 1.5 y el 5 (retrasos repartidos 0→0.7 de la línea
      //     de tiempo, como en la guía).
      //   · Tramo 2 — la frenada con SOLO el ganador en la rueda: la
      //     guía ponía 6000 ms; el profesor pidió un 40 % MENOS de
      //     "solo queda uno girando" → 3600 ms, easeOut(5). El final
      //     ya no se hace eterno.
      const dur1 = ctx.guia(6500);   // tramo turbo
      const dur2 = ctx.guia(3600);   // tramo de frenada (−40 % que 6000)

      // El SONIDO DE ALTA VELOCIDAD nuevo (más presente y un poco más
      // alto): el turbo sigue la velocidad REAL de la rueda, frame a
      //     frame — aire aullando + motor rugiendo — y se apaga solo
      //     al frenar. El whir del arranque lo remata.
      ctx.sonido.turboIniciar();
      ctx.sonido.subida(ctx.segs(0.14));

      // …y en paralelo, uno a uno, los segmentos van SALIENDO VOLANDO.
      // El orden es al azar, pero el GANADOR NUNCA VUELA: es el único
      // que se queda en la rueda (y el que frena bajo la flecha).
      // (esperar crudo: los tiempos ya vienen escalados por ctx.guia,
      //  y no queremos que ctx.dormir los escale OTRA vez.)
      const esperar = seg => new Promise(r => setTimeout(r, seg * 1000));
      const elims = (async () => {
        await esperar(ctx.guia(1500));   // un momento a plena marcha (1.5 s)
        // Repartidos entre el 1.5 y el segundo 5 (el 70 % de la línea
        // de tiempo de la guía): pase lo que pase, TODOS vuelan antes
        // de que empiece la frenada.
        const paso = Math.max(0.055, ctx.guia(3500) / Math.max(1, ctx.n - 1));
        const orden = [];
        for (let i = 0; i < ctx.n; i++) if (i !== ctx.ganador) orden.push(i);
        for (let i = orden.length - 1; i > 0; i--) {   // barajado Fisher-Yates
          const j = enteroAleatorio(i + 1);
          const tmp = orden[i]; orden[i] = orden[j]; orden[j] = tmp;
        }
        for (const i of orden) {
          ctx.volarSegmento(i);              // ¡fuera! (con su nombre)
          ctx.sonido.whoosh();
          await esperar(paso);
        }
      })();

      // El tramo turbo: ~14 vueltas × el deslizador de Velocidad,
      // acelerando TODO el rato (t^2.2 — la curva de la guía). El
      // desenfoque de movimiento y la desaparición de los nombres los
      // pone render() solo, según la velocidad angular real.
      await ctx.girarHasta({
        vueltas: CONFIG.voladora.vueltas * ctx.vel,
        sentido: 1,
        duracion: dur1,
        suavizado: entradaPotencia(2.2),   // acelera cada vez más, sin parar
      });
      await elims;   // cuando acaban, en la rueda SOLO queda el ganador

      // La frenada: ya solo queda el ganador (una última pasada a toda
      // velocidad por la flecha — de miedo) y frena despacito… pero sin
      // eternidad: 3600 ms con easeOut(5).
      await ctx.girarHasta({
        vueltas: 2,
        sentido: 1,
        duracion: dur2,
        suavizado: SUAV.salidaQuintica,
      });

      ctx.sonido.turboParar();   // el turbo muere con la rueda

      // frenazo brusco: vibra un instante… y a la tarjeta.
      await ctx.temblor(0.35);
    },
  },


  /* ═══ 11 · EL MOTOR DAÑADO (gira y no para — con aceleración ═══
     PROGRESIVA, SIN alerta de navegador)
     El giro empieza pareciendo normal: la rueda frena como la de
     siempre… pero nunca acaba de pararse — y de ahí el motor dañado
     la va acelerando poco a poco (nada de un acelerón de repente:
     la velocidad sube PROGRESIVAMENTE, marcha a marcha) hasta la
     velocidad de locura. La pista de arriba (no hay alerta ninguna)
     lo confiesa: "Error: Se ha dañado el motor de la ruleta. Haz
     clic en el motor para apagarlo." — el motor es LA BOLITA NEGRA
     del buje, que luce su anillo dorado latiendo. El profesor la
     toca… y EL MOTOR SE APAGA DE VERDAD (se pidió quitar el frenazo
     de auto): se le oye BAJANDO LA MARCHA, la rueda se va muriendo
     sola — despacito, con su tic-tac espaciándose — hasta parar
     JUSTO donde iba pasando por la flecha en ese instante. */
  {
    id: 11,
    clave: 'motor-dañado',
    nombre: 'El motor dañado',
    peso: 1,
    habilitada: true,
    descripcion: 'El giro dura más de lo esperado: la rueda parece frenar como siempre… pero el motor dañado la acelera poco a poco (aceleración PROGRESIVA, nada de un acelerón de repente) hasta una velocidad de LOCURA (imposible ver sobre quién caerá), con su sonido de motor con cambios de marcha, HUMO y CHISPAS por el buje. La pista de arriba lo confiesa (sin alerta ninguna): "Error: Se ha dañado el motor de la ruleta. Haz clic en el motor para apagarlo. Disculpe los inconvenientes." Toca LA BOLITA NEGRA del centro (el motor, con su anillo dorado latiendo)… y el motor SE APAGA DE VERDAD (ya sin derrape de auto): se oye BAJANDO LA MARCHA y la rueda se va muriendo sola hasta parar sobre quien pasaba por la flecha.',
    frase: 'El motor llegó dañado… ¡lo apagó a mano!',

    async girar(ctx) {
      // 1) Arranque engañoso: parece un giro normal que va frenando…
      //    pero se queda a media frenada (llega con velocidad de sobra).
      await ctx.girarHasta({
        vueltas: 4.5 * ctx.vel,
        sentido: 1,
        duracion: ctx.segs(0.42),
        suavizado: salidaPotencia(1.25),   // potencia BAJA: no frena del todo
        arranque: true,
      });

      // 2) EL MOTOR DAÑADO: la velocidad sube PROGRESIVAMENTE (se pidió
      //    así: nada de "de repente") — de la velocidad casi nula con
      //    la que acaba el arranque engañoso, marcha a marcha, hasta la
      //    velocidad de locura (CONFIG.freno.vueltasPorSegundo ≈ 3.4
      //    vueltas/s: la MÁXIMA de "Acelera en vez de frenar") — y ahí
      //    se queda, con desenfoque de movimiento: IMPOSIBLE ver sobre
      //    quién caerá. Con el SONIDO DE ACELERACIÓN (motor con sus
      //    cambios de marcha) y el turbo de aire+motor siguiendo la
      //    velocidad REAL de la rueda.
      const V = CONFIG.freno.vueltasPorSegundo || 3.4;
      ctx.sonido.motorAcelerado(3.2);     // ¡el motor averiado, revolucionándose poco a poco!
      ctx.sonido.turboIniciar();          // aire aullando + motor rugiendo
      const roto = ctx.girarRoto(t => {
        const sube = 1 - Math.exp(-t / 2.1);          // PROGRESIVA: sin tirón
        return TAU * V * sube * (1 + 0.05 * Math.sin(t * 5.3));
      });
      //    …Y HUMO: del buje (y del roce con la flecha) salen VOLUTAS y
      //    CHISPAS — se VE de un vistazo que hubo una avería (se pidió).
      //    (Se apaga con CONFIG.freno.humo = false.)
      if (CONFIG.freno.humo !== false) ctx.humoIniciar();

      // 3) La clase se pregunta qué está pasando… (CONFIG.freno.angustia)
      await ctx.dormir(CONFIG.freno.angustia);

      // 4) LA CONFESIÓN — en la PISTA DE ARRIBA (sin window.alert,
      //    tal como se pidió: el texto de arriba basta):
      ctx.setPista('Error: Se ha dañado el motor de la ruleta. Haz clic en el motor para apagarlo. Disculpe los inconvenientes.');

      // 5) Ahora sí: el profesor APAGA EL MOTOR. El motor es LA BOLITA
      //    NEGRA del buje (no la rueda entera): solo ese clic vale —
      //    mientras se espera, la bolita luce su ANILLO DORADO latiendo
      //    (se ve dónde tocar); un clic en otra parte suena bajito y
      //    no cuenta. La pista se queda arriba todo el rato.
      const clic = await ctx.pedirClic({ soloBolita: true });
      ctx.setPista(null);
      ctx.humoParar();   // la avería deja de echar humo (la cola se apaga sola)
      await roto.detener();

      // La rueda para DONDE IBA: el sector que estaba pasando por la
      // FLECHA en el instante de apagar el motor es el que queda
      // elegido (la tarjeta anunciará a quien toque de verdad: a esa
      // velocidad era imposible apuntar).
      const bajo = ctx.sectorBajoFlecha();
      const indice = bajo ? bajo.indice : ctx.ganador;
      const u = bajo ? bajo.u : 0.5;
      ctx.definirGanador(indice);

      // EL APAGADO DE VERDAD (se pidió: ya NO hay derrape de auto con
      // chirrido — el motor se APAGA, literalmente): suena un MOTOR
      // BAJANDO LA MARCHA (marcha a marcha, "clac… clac…", hasta
      // quedarse quieto) y la rueda se va muriendo SOLA — la curva
      // arranca CLAVADA a la velocidad que traía (ni un salto) y se
      // desangra despacito hasta detenerse exacto sobre ese sector,
      // con su tic-tac espaciándose como el de un giro que se acaba.
      const s = ctx.s;
      const hasta = ANGULO_FLECHA_TOPE - (indice + u) * s;
      let delta = norm(hasta - Motor.estado.anguloRueda);
      if (delta < 0.02) delta += TAU;
      // la física del apagado: T sale para que la velocidad INICIAL
      // de la curva calce con la REAL (V) — la rueda no "frena" de
      // golpe: se muere. (∫ del perfil de abajo = 1/2.8 + 0.05)
      const INTEGRAL = 1 / 2.8 + 0.05;
      const T = Math.max(0.3, Math.min(2.4, delta * 1.05 / (INTEGRAL * V)));
      ctx.sonido.turboParar();            // el turbo muere con el motor
      ctx.sonido.motorBajaMarcha(T);       // ¡el motor apagándose!
      await ctx.girarAngulo({
        delta,
        duracion: T,
        suavizado: curvaDeVelocidad(v => Math.pow(1 - v, 1.8) + 0.05),
      });
      ctx.sonido.golpe(0.22);   // el último toc del motor ya quieto
      await ctx.temblor(0.16);
    },
  },


  /* ═══ 12 · LA VERSIÓN PREMIUM (la broma SaaS + ALERTA DE NAVEGADOR) ═
     El giro empieza como siempre… pero A MEDIA CARRERA —antes de que
     la rueda pare y se vea CUALQUIER resultado (se pidió así)— la
     pantalla se TAPA con el CLÁSICO anuncio: para ver el resultado y
     seguir jugando hay que pagar la versión premium, con sus planes de
     pago presentados como toda SaaS. Segundos después (cuando ya se
     reaccionó), una ALERTA DEL NAVEGADOR confiesa la broma: es y
     siempre será gratis — haz click en el botón. El botón se vuelve
     "gratis"… y al pulsarlo el anuncio se aparta y llega por fin el
     GIRO FINAL, visible, hasta el ganador. */
  {
    id: 12,
    clave: 'premium',
    nombre: 'La versión Premium (broma)',
    peso: 0.9,
    habilitada: true,
    descripcion: 'El giro empieza como siempre… pero A MEDIA CARRERA —antes de verse cualquier resultado— la pantalla se TAPA con el CLÁSICO anuncio de pagar, con sus tres planes y su letra pequeña (como toda SaaS): "Has alcanzado tu prueba gratuita de la ruleta". Segundos después, una ALERTA DEL NAVEGADOR confiesa la broma: es y siempre será gratis. Haz click en el botón… y AHORA sí: el giro final hasta el ganador.',
    frase: '¿Que había que pagar? Es y siempre será gratis.',

    async girar(ctx) {
      // 1) El giro de siempre (8500 ms de la guía)… pero NO termina en
      //    el ganador: acaba en un punto AL AZAR (se pidió así: el
      //    anuncio debe salir ANTES de verse ningún resultado).
      const falso = enteroAleatorio(ctx.n);
      const giro = ctx.girarHastaIndice({
        indice: falso,
        u: 0.5,                            // centrado: da igual, está tapado
        vueltas: 6 * ctx.vel,
        sentido: 1,
        duracion: ctx.guia(8500),
        suavizado: SUAV.salidaQuintica,
        arranque: true,
      });

      // 2) A los 3 s de haberle dado al botón —con la rueda TODAVÍA
      //    girando— el anuncio Premium TAPA la pantalla: nadie ve
      //    pararse la rueda ni qué nombre quedaba bajo la flecha.
      //    (Debajo del anuncio la rueda acaba parando en su punto al
      //    azar… pero nadie la ve.) [Los 3 s son FIJOS: no escalan
      //    con el deslizador de Duración — así, con la duración corta,
      //    el anuncio ya no sale "justo al dar al botón". ESCALA solo
      //    afecta al modo de pruebas ?rapido=1.]
      let abrirPW;
      const pw = new Promise(r => { abrirPW = r; });
      setTimeout(() => {
        Promise.resolve(ctx.paywallBroma()).then(abrirPW, abrirPW);
      }, 3000 * ESCALA);

      await giro;   // la rueda paró… tapada por el anuncio
      await pw;     // el anuncio se cierra al pulsar "Ver el resultado"

      // 3) AHORA sí, ya visible: el giro final, corto y sabroso, hasta
      //    el ganador de verdad (se pidió: el panel sale ANTES del
      //    resultado… y este solo aparece al cerrarlo).
      await ctx.girarHasta({
        vueltas: 1.6 * ctx.vel,
        sentido: 1,
        duracion: ctx.guia(2300),
        suavizado: SUAV.salidaQuintica,
      });
    },
  },


  /* ═══ 13 · SE ACELERA EN VEZ DE FRENAR ═══════════════════════════
     Cada segundo gira más rápido — parece que va a salir volando de
     verdad (aire aullando, motor rugiendo, nombres desdibujados por el
     desenfoque)… y se detiene EN SECO: de toda velocidad a cero, de
     golpe, con golpe seco y vibración de impacto. Sobre el ganador. */
  {
    id: 13,
    clave: 'acelera',
    nombre: 'Acelera en vez de frenar',
    peso: 1,
    habilitada: true,
    descripcion: 'Cada segundo gira más rápido — parece que va a salir volando (con el aire aullando y los nombres desdibujados)… y se detiene EN SECO, de golpe, sobre el ganador.',
    frase: 'Cada vez más rápido… y paró en seco.',

    async girar(ctx) {
      // El sonido de alta velocidad sigue la velocidad REAL de la rueda:
      // a más vueltas, más aire y más motor (frame a frame).
      ctx.sonido.turboIniciar();
      ctx.sonido.subida(ctx.segs(0.68));

      // Aceleración CONTINUA (t^2.6): arranca casi normal y acaba
      // enloquecida. La curva NUNCA frena: el final de la curva ES el
      // muro — llega al ganador a toda velocidad y clava ahí mismo.
      await ctx.girarHasta({
        vueltas: 7 * ctx.vel,
        sentido: 1,
        duracion: ctx.segs(0.68),
        suavizado: entradaPotencia(2.6),
        arranque: true,
      });

      // El muro: sin estelas, golpe seco y vibración de impacto.
      ctx.sonido.turboParar();
      await ctx.frenarEnSeco(0.55);
    },
  },


  /* ═══ 14 · LA SELECCIÓN MÚLTIPLE (un selector por nombre) ═════════
     El selector se MULTIPLICA: uno por cada nombre — y se les VE
     ENTRAR (nacen del buje uno a uno, con su pop)— repartidos por todo
     el borde de la rueda. El giro es normal… y durante la frenada los
     demás SE CAEN de uno en uno — con física de verdad: gravedad,
     volteretas y rebotes contra el borde. Al final SOLO queda UNO…
     sorteado AL AZAR entre TODOS (el de arriba ya no tiene garantías:
     hoy también puede caer) — y LATE de alegría sobre el ganador. */
  {
    id: 14,
    clave: 'selectores-multiples',
    nombre: 'La selección múltiple',
    peso: 1,
    habilitada: true,
    descripcion: 'El selector se MULTIPLICA —nacen del buje uno a uno, se les VE entrar—: uno por cada nombre, alrededor de la rueda. Gira normal… y los selectores sobrantes se CAEN de uno en uno (con física: gravedad, volteretas y rebotes) hasta que SOLO queda UNO, SORTEADO AL AZAR —el de arriba no tiene garantías: hoy también puede caer—, latiendo sobre el ganador.',
    frase: 'Tantos selectores… y quedó uno al azar.',

    async girar(ctx) {
      // 1) N selectores: el de arriba (el de siempre) + un clon por cada
      //    uno de los demás nombres. NACEN del buje uno a uno (se les VE
      //    ENTRAR, con su pop: ya no "estaban ahí" de golpe).
      const total = ctx.multiplicarSelectores();
      if (!total) {
        // un solo nombre: no hay con qué multiplicar — giro clásico
        await ctx.girarHasta({
          vueltas: ctx.girosNormal(), sentido: 1,
          duracion: ctx.segs(1), suavizado: SUAV.salidaRuleta, arranque: true,
        });
        return;
      }

      // 2) El SUPERVIVIENTE se sortea YA, al azar, entre TODOS los n
      //    selectores (0 = el de arriba; 1..n-1 = los clones). Puede ser
      //    CUALQUIERA — el de arriba ya no tiene garantías (se pidió:
      //    era predecible). La rueda aterrizará al ganador BAJO ÉL.
      const superviviente = enteroAleatorio(total);
      const angObjetivo = ctx.anguloSelector(superviviente);

      // 3) Giro normal de la guía (8500 ms, easeOut(5))… aterrizando
      //    bajo el SUPERVIVIENTE (no bajo el de arriba).
      const u = 0.25 + Math.random() * 0.5;
      const giro = ctx.girarAnguloAbsoluto({
        hasta: angObjetivo - (ctx.ganador + u) * ctx.s,
        vueltas: 6 * ctx.vel,
        sentido: 1,
        duracion: ctx.guia(8500),
        suavizado: SUAV.salidaQuintica,
        arranque: true,
      });

      // 4) En paralelo: mientras el final se arrastra, TODOS menos el
      //    superviviente SE CAEN uno a uno (del segundo 4.2 al 8.1; el
      //    último cae justo antes de la parada). Si el superviviente
      //    es un clon, TAMBIÉN CAE el selector de arriba (con la misma
      //    física de la animación 8). El orden es al azar.
      const esperar = seg => new Promise(r => setTimeout(r, seg * 1000));
      const caida = (async () => {
        await esperar(ctx.guia(4200));
        const orden = [];
        for (let k = 0; k < ctx.n; k++) if (k !== superviviente) orden.push(k);
        for (let i = orden.length - 1; i > 0; i--) {   // Fisher-Yates
          const j = enteroAleatorio(i + 1);
          const tmp = orden[i]; orden[i] = orden[j]; orden[j] = tmp;
        }
        const paso = ctx.guia(3900) / Math.max(1, orden.length);
        for (const k of orden) {
          if (k === 0) ctx.caerFlecha();      // ¡hoy hasta el de siempre se cae!
          else ctx.caerSelector(k - 1);       // los clones se numeran desde 1
          ctx.sonido.pop();
          ctx.sonido.whoosh();
          await esperar(paso);
        }
      })();

      await giro;
      await caida;

      // 5) El superviviente LATE (dos latidos de alegría) sobre el ganador.
      await ctx.latidoFlecha();
    },
  },


  /* ═══ 15 · EL JUEGO DE LOS VASOS (shell game — NUEVO RETO) ════════
     Categoría: INTERVENCIONES DE USUARIO. Los segmentos se convierten
     en BOLITAS —CON SU COLOR— que caen sobre una MESA de madera; los
     VASOS bajan y las tapan boca abajo; se BARAJAN a ras de mesa,
     cruzándose por delante y por detrás SIN levantarse jamás… y SIN
     alerta (es evidente qué hacer). El vaso elegido se abre (se
     levanta y se cae con física) revelando SU BOLITA DE COLOR — y su
     color dice el NOMBRE. La coreografía entera vive en js/motor.js
     (jugarShell): aquí solo la invocamos. */
  {
    id: 15,
    clave: 'vasos',
    nombre: 'El juego de los vasos',
    peso: 1.1,
    habilitada: true,
    descripcion: 'Antes de nada, la pista de arriba da el repaso de memoria: "MEMORICEN QUE COLOR ES CADA UNO" — 5 segundos para memorizarlos. Luego los segmentos se convierten en BOLITAS —cada una CON SU COLOR, conservado— que caen sobre una MESA de madera común y corriente; los VASOS las tapan boca abajo y se BARAJAN a ras de mesa, cruzándose por delante y por detrás SIN levantarse jamás (la bolita nunca se ve). Elige un vaso: se abre, revela su bolita… y su COLOR dice el nombre. ¡Intervención del usuario!',
    frase: 'Bolitas, vasos y barajar: tú elegiste.',

    async girar(ctx) {
      // ANTES de que la rueda se vuelva bolitas, la pista de arriba
      // avisa a la clase durante 5 s enteros: MEMORICEN QUE COLOR ES
      // CADA UNO — sin ese repaso de memoria no se sabría luego de
      // quién era cada bolita. (Tal como se pidió: el texto dura 5
      // segundos… y luego, la animación de siempre.)
      ctx.setPista('MEMORICEN QUE COLOR ES CADA UNO');
      await ctx.dormir(5);
      ctx.setPista(null);

      // …y entonces, la transformación de siempre.
      await ctx.jugarShell();
    },
  },


  /* ═══ 16 · LA RUEDA SE DESARMA (gira un poco… se avería… y se cae) ═
     Ahora la rueda NO se desarma en seco: le das al giro y ARRACA
     como cualquier giro… pero a los pocos segundos se AVERÍA — se va
     frenando sola, como si le faltara la fuerza, con su CLAC de
     avería y un silencio raro — y ahí, parada, es cuando hace su
     buena animación de desarme: los segmentos perdedores se
     desprenden en cascada y se CAEN con física (gravedad,
     volteretas… hasta EL SUELO, donde suenan y se posan) SIN que la
     rueda se mueva ni un grado más. Cada pedazo cae CON SU PROPIO
     SONIDO. Solo queda el ganador, clavado en su sitio… y la flecha
     RECORRE el borde hasta señalarlo. */
  {
    id: 16,
    clave: 'desarme',
    nombre: 'La rueda se desarma',
    peso: 1,
    habilitada: true,
    descripcion: 'Arranca como un giro cualquiera… pero a los pocos segundos SE AVERÍA: se va frenando sola —como si le faltara la fuerza— y se queda quieta con un CLAC. Y ahí sí: se DESARMA entera, pedazo a pedazo, cada uno con SU PROPIO SONIDO al caerse — hasta EL SUELO, donde suenan y se posan—. Solo queda el ganador, clavado en su sitio… y la flecha recorre el borde hasta señalarlo.',
    frase: 'Se averió a media vuelta… y se desarmó en pedazos: el ganador quedó.',

    async girar(ctx) {
      // 1) LA RUEDA ARRACA como en cualquier giro (su arranque de
      //    siempre, con sus tics)… y a los pocos segundos SE AVERÍA:
      //    se va frenando sola — como si el motor le faltara — y se
      //    queda PARADA del todo, sin haber llegado a ningún ganador.
      //    (El CLAC de la avería y el silencio vienen justo después.)
      await ctx.girarAngulo({
        delta: TAU * (2 + ctx.aleatorio(0, 1)),   // un par de vueltas y pico
        duracion: ctx.segs(0.2),
        suavizado: SUAV.salidaCuartica,   // se va muriendo: velocidad a cero
        arranque: true,
      });
      ctx.sonido.golpe(0.45);   // el CLAC: ahí la dejó la avería
      await ctx.dormir(0.55);   // …un instante de silencio incómodo

      // 2) El desarme EMPIEZA por el segmento bajo el punto que se
      //    PULSÓ para girar (la cascada arranca justo ahí y recorre
      //    el borde a partir de ese punto, pedazo a pedazo). El
      //    ganador NUNCA se cae (si fue justo el pulsado, la cascada
      //    arranca al lado). Sin clic (botón Girar / barra
      //    espaciadora): arranca por donde esté la flecha.
      const clic = ctx.clicGiro || null;
      const bajo = clic ? ctx.sectorBajoPunto(clic.x, clic.y) : null;
      const inicio = bajo
        ? bajo.indice
        : Math.max(0, ctx.indiceBajoFlecha());
      const orden = [];
      for (let k = 0; k < ctx.n; k++) {
        const i = (inicio + k) % ctx.n;
        if (i !== ctx.ganador) orden.push(i);
      }

      // 3) La cascada, con su sonido por CADA pedazo que cae — cada uno
      //    suena distinto (la carraca sube: se OYE el pedazo número 3,
      //    el 4, el 5… cayendo de uno en uno).
      const paso = Math.min(0.11, Math.max(0.045, 0.8 / Math.max(1, orden.length)));
      let k = 0;
      for (const i of orden) {
        ctx.caerSegmento(i);
        ctx.sonido.pieza(k++);      // ¡crac! — este pedazo, su sonido
        await ctx.dormir(paso);
      }

      // 4) La flecha RECORRE el borde hasta el ganador (la rueda ni se
      //    movió: quien decide hoy es ella, rodeando los pedazos caídos).
      ctx.sonido.suspenseo(ctx.segs(0.16));
      await ctx.girarFlechaHasta({
        vueltas: 1,
        sentido: 1,
        duracion: ctx.segs(0.16),
        suavizado: SUAV.salidaCuartica,
        arranque: true,
      });

      // 5) Un respiro solemne… y la tarjeta.
      await ctx.dormir(0.35);
    },
  },


  /* ═══ 17 · DIANA Y DARDO (la nueva intervención de usuario) ═══════
     La rueda se TUMBAAA a plano SAGITAL (casi de canto) y se
     convierte en una DIANA de dardos; el selector se convierte en el
     DARDO. La PISTA de arriba dice "agarra el dardo y lánzalo" (SIN
     alertas de navegador: no se piden). El profesor LO AGARRA (ratón
     o dedo), lo arrastra y LO LANZA: vuela siguiendo SU gesto, se
     CLAVA en la diana… y esta VUELVE a plano frontal CON EL DARDO
     PUESTO: donde cayó queda elegido el ganador. */
  {
    id: 17,
    clave: 'dardos',
    nombre: 'Diana y dardo',
    peso: 1.15,   // flamante intervención de usuario: un pelín más probable
    habilitada: true,
    minNombres: 4,   // SE PIDIÓ: con 2-3 nombres la diana queda fea —
                     // solo sale en Random y Realmente normal si hay
                     // 4 o más (con "Elegir animación" se puede forzar)
    descripcion: 'La rueda se TUMBAAA a plano sagital y se convierte en una DIANA; el selector se convierte en DARDO. La pista de arriba te lo dice: agarra el dardo y lánzalo (sin alertas). Vuela con TU gesto, se CLAVA… y la diana vuelve a ponerse de frente con el dardo puesto: DONDE CAYÓ queda elegido el ganador. ¡Intervención del usuario!',
    frase: 'Tú lo lanzaste: donde cayó el dardo.',

    async girar(ctx) {
      // La coreografía entera vive en js/motor.js (jugarDiana): la
      // transformación, el dardo agarrable y lanzable, el clavado y la
      // vuelta a plano frontal. El ganador lo decide DONDE CAYÓ EL
      // DARDO (sorteo justo dentro de la diana).
      await ctx.jugarDiana();
    },
  },


  /* ═══ 18 · FRENOS DAÑADOS (la ruleta que no sabe frenar) ════════
     LA PRIMERA ESCENA es un giro NORMAL… que nunca acaba de frenar:
     la rueda coge velocidad… y ahí SE QUEDA: velocidad constante —
     sin frenar — durante siete largos segundos (a una marcha ya
     AMABLE: se bajó un 30 % porque antes los nombres no se leían).
     Entonces la pista de arriba lo confiesa (ADVERTENCIA, no error
     — tal como se pidió): "Advertencia: Si se le van los frenos a
     la ruleta, puede pararla manualmente haciendo click en la
     flecha selectora". Y ahí se queda girando HASTA QUE EL
     PROFESOR pise el freno: al tocar EL TRIÁNGULO SELECTOR (que
     late llamándole), la rueda frena EN DRAMÁTICO — el MISMO
     derrape de auto con su chirrido de la animación 11 (el motor
     dañado) — justo sobre quien estaba pasando por la flecha en ese
     instante. */
  {
    id: 18,
    clave: 'frenos-dañados',
    nombre: 'Frenos dañados',
    peso: 1.15,   // flamante intervención de usuario: un pelín más probable
    habilitada: true,
    descripcion: 'Arranca como un giro normal… y al coger velocidad NO frena: se queda girando a esa marcha CONSTANTE (2 vueltas por segundo — ya se LEEN los nombres, que era lo que importaba), siete largos segundos. Entonces la pista lo confiesa: "Advertencia: Si se le van los frenos a la ruleta, puede pararla manualmente haciendo click en la flecha selectora". Y sigue girando… hasta que TÚ tocas EL TRIÁNGULO (que late llamándote): frenazo dramático de auto, con su chirrido — el mismo de "El motor dañado"—, justo sobre quien pasaba por la flecha. ¡Intervención del usuario!',
    frase: 'Se le fueron los frenos… ¡y la frenaste con la flecha!',

    async girar(ctx) {
      // 1) EL GIRO NORMAL QUE NO FRENARÁ: acelera como cualquier giro
      //    (su arranque de siempre)… y a la marcha de los FRENOS
      //    DAÑADOS (2.03 vueltas/s — se bajó un 30 %: ya se LEEN los
      //    nombres a simple vista) ahí SE QUEDA: velocidad constante,
      //    sin frenar. La rueda hoy no sabe parar.
      //    El tic-tac sigue sonando SIEMPRE ("siempre"): a esa marcha,
      //    la ruleta suena a lo que es — una ruleta que no acaba.
      //    Sin tironcitos: nada está roto — solo no hay frenos.
      const V = TAU * (CONFIG.frenos.vueltasPorSegundo || 2.03);
      const rampa = CONFIG.frenos.rampa || 2.4;
      const roto = ctx.girarRoto(
        t => V * Math.min(1, t / rampa),
        { tics: 'siempre', tironcitos: false }
      );

      // 2) SIETE segundos girando a velocidad constante…
      await ctx.dormir(rampa + (CONFIG.frenos.constancia || 7));

      // 3) …y la CONFESIÓN, en la pista de arriba (sin alertas). Es una
      //    ADVERTENCIA, no un error (se pidió el texto exacto): sale en
      //    ÁMBAR, no en rojo — js/ui.js la colorea sola por la palabra.
      ctx.setPista('Advertencia: Si se le van los frenos a la ruleta, puede pararla manualmente haciendo click en la flecha selectora.');

      // 4) Gira y gira — SOLO EL TRIÁNGULO la frena (intervención de
      //    usuario). Mientras se espera, la FLECHA LATE suavecita
      //    llamando al profesor — se ve dónde pisar el freno; un clic
      //    en otra parte suena bajito y no cuenta.
      await ctx.pedirClic({ soloFlecha: true });
      ctx.setPista(null);
      await roto.detener();

      // 5) EL FRENAZO DRAMÁTICO — el MISMO de la animación 11 (el
      //    motor dañado): patinazo de auto con su chirrido y su CLONK
      //    final… parando JUSTO donde iba: sobre quien pasaba por la
      //    FLECHA en el instante de pisar el freno (a esa velocidad
      //    era imposible apuntar).
      const bajo = ctx.sectorBajoFlecha();
      const indice = bajo ? bajo.indice : ctx.ganador;
      const u = bajo ? bajo.u : 0.5;
      ctx.definirGanador(indice);
      await ctx.derraparHasta({ indice, u, velocidad: V });
      ctx.sonido.golpe(1);       // ¡el CLONK del auto ya frenado!
      await ctx.temblor(0.45);
    },
  },


  /* ═══ 19 · EL MOTOR DAÑADO: ¡AYÚDALA A GIRAR! (el abanico ═════════
     averiado de la casa — como se hace en el país cuando el abanico
     se daña y hay que ayudarle a girar)

     Primero suena un CORTO ELÉCTRICO de verdad (el zumbido que se
     traba, las crepitaciones de chispazos y el ¡clac! del térmico).
     Entonces la ruleta se mueve MUY LENTO — penando, con el sonido
     EXACTO de un ABANICO DAÑADO (una máquina de recortarse: sierras
     graves trabadas, el vaivén irregular del eje, un soplo rasposo).
     A los 5 segundos, la pista de arriba lo confiesa (sin alerta
     ninguna): "Error: Está un poco averiado el motor de la ruleta.
     Ayúdalo a que arranque girándole las aspas."

     Y ahora la ruleta es AGARRABLE: el profesor la AGARRA con el
     ratón o el dedo y la GIRA A MANO (la rueda sigue al gesto, al
     grado). Al soltarla con fuerza, el motor AGARRA: la ruleta
     continúa su movimiento PROGRESIVAMENTE (cada vez mejor, como un
     abanico que por fin coge su marcha)… y el sonido del abanico
     dañado hace su TRANSICIÓN: se cura y queda sonando como un
     ABANICO SANO — aire limpio y zumbido suave — mientras la ruleta
     frena despacito, con su cola de siempre, sobre el ganador. */
  {
    id: 19,
    clave: 'motor-ayudado',
    nombre: 'El motor dañado: ¡ayúdala a girar!',
    peso: 1.05,   // la segunda variante del motor dañado (la 11 es la otra)
    habilitada: true,
    descripcion: 'Suena un CORTO ELÉCTRICO de verdad… y la ruleta apenas se mueve: MUY lento, penando, con el sonido de un ABANICO DAÑADO (una máquina de recortarse). A los 5 segundos, la pista de arriba confiesa (sin alerta ninguna): "Error: Está un poco averiado el motor de la ruleta. Ayúdalo a que arranque girándole las aspas." AGARRA la rueda con el ratón o el dedo y GÍRALA TÚ A MANO (sigue a tu gesto, al grado); suéltala con fuerza… y el motor AGARRA: la ruleta sigue girando sola, progresivamente, mientras el abanico dañado SE CURA y pasa a sonar como un abanico sano. ¡Intervención del usuario total!',
    frase: 'El motor estaba dañado… ¡arrancó con tu mano!',

    async girar(ctx) {
      const AB = CONFIG.abanico || {};

      // 1) EL CORTO ELÉCTRICO: el zumbido se traba, crepita… y el ¡clac!
      //    del térmico. La ruleta todavía ni se mueve (el abanico truena
      //    ANTES de penar, tal como se pidió).
      ctx.sonido.cortoCircuito();
      await ctx.dormir(0.9);

      // 2) LA MARCHITA: el abanico dañado empieza a sonar y la ruleta se
      //    mueve MUY LENTO (0.085 vueltas/s: apenas avanza — con el
      //    vaivén del eje trabado). Queda AGARRABLE desde ya: si alguien
      //    de la clase la quiere girar antes del aviso, que la gire.
      ctx.sonido.abanicoDanadoIniciar();
      const arranque = ctx.arranqueManual({
        velocidad: TAU * (AB.vueltasCrawl != null ? AB.vueltasCrawl : 0.085),
        umbral: AB.umbralArranque != null ? AB.umbralArranque : 2.1,
      });

      // 3) A los CINCO SEGUNDOS (contando desde que empezó a penar), la
      //    confesión en la pista de arriba — el texto EXACTO pedido.
      //    OJO: si alguna mano veloz ya la había arrancado ANTES del
      //    aviso, este ya no hace falta (la avería se está curando) —
      //    no sale y nadie se entera de lo que pudo ser.
      await ctx.dormir(AB.aviso != null ? AB.aviso : 5);
      let res = null;
      if (Motor.estado.arranque) {
        // todavía penando: la pista confiesa la avería…
        ctx.setPista('Error: Está un poco averiado el motor de la ruleta. Ayúdalo a que arranque girándole las aspas.');
        // 4) LA MANO: se espera a que el profesor la gire (aquí se queda
        //    hasta que la suelte con fuerza; si la suelta floja, la rueda
        //    vuelve a penar y puede reintentarse — el toque de "no agarró"
        //    ya lo suena el motor).
        res = await arranque;
        ctx.setPista(null);
      } else {
        // ya la habían arrancado antes del aviso: directo a lo que sigue
        res = await arranque;
      }
      if (!res) return;   // desmontaje de emergencia: ya no hay quién gire

      // 5) LA CURACIÓN: el motor AGARRÓ — el abanico dañado pasa a sonar
      //    como un ABANICO SANO en la transición (se le OYE curarse).
      ctx.sonido.abanicoTransicionNormal(AB.transicion != null ? AB.transicion : 1.7);

      // 6) LA RULETA SIGUE SOLA: continúa el movimiento PROGRESIVAMENTE
      //    (con la VELOCIDAD con la que la soltaron, ni un salto: la
      //    curva arranca clavada a la de la mano) — sube poco a poco a
      //    su crucero de abanico sano… y se va apagando despacito, con
      //    la cola de siempre, hasta caer EXACTO sobre el ganador.
      const u = 0.28 + Math.random() * 0.44;   // altura del ganador en su sector
      const hasta = ANGULO_FLECHA_TOPE - (ctx.ganador + u) * ctx.s;
      const desde = Motor.estado.anguloRueda;
      let base = norm(hasta - desde);
      if (base < 0.02) base += TAU;
      const dir = res.sentido >= 1 ? 1 : -1;   // sigue el SENTIDO de la mano
      const extra = 3 + enteroAleatorio(3);    // 3-5 vueltas enteras de sobra
      const delta = dir >= 1
        ? base + TAU * extra
        : (base - TAU) - TAU * extra;
      const T = ctx.segs(0.62);                // ≈ 7.4 s con la duración de serie
      const v0 = Math.min(TAU * 1.15, Math.max(TAU * 0.22, res.velocidad));
      // la velocidad de crucero del abanico sano (relativa a la media):
      const vmaxRel = (TAU * (AB.vueltasCuradas || 1.5)) * T / Math.abs(delta);
      const curva = curvaAbanico(v0, vmaxRel, delta, T);
      await ctx.girarAngulo({
        delta, duracion: T, suavizado: curva,
      });

      // 7) El abanico se apaga con la ruleta (su aire muere despacito)
      //    y el motor se aquieta con su toc de asentado. La tarjeta,
      //    sola.
      ctx.sonido.abanicoParar();
      ctx.sonido.golpe(0.30);
      await ctx.dormir(0.30);
    },
  },


  /* ═══ 20 · PROBABILIDAD MULTIPLICADA N.º 2 (el SEGMENTO ═════════
     GIGANTE) — como la 7, pero al revés de las 6-8 réplicas
     REPARTIDAS por toda la rueda, aquí hay UN SOLO nombre del
     favorecido… con su segmento 6-8 VECES MÁS GRANDE que los
     demás. La rueda se ve normal — nombres normales, un gajo
     ENORME del favorecido con SU color y SU nombre escrito UNA
     sola vez en el centro —, el giro es el de la guía… y la
     probabilidad cae sola en el gajo gordo.

     CÓMO SE LOGRA: preparar() inserta el favorecido "mult" veces
     SEGUIDAS en la lista (todas con su mismo color) y js/motor.js
     FUSIONA en el dibujo las ranuras contiguas iguales — se dibuja
     un SOLO segmento, sin fronteras internas, y los TICS solo
     suenan en las fronteras de verdad (dentro del gajo gigante no
     hay clavija que cruce). */
  {
    id: 20,
    clave: 'probabilidad-2',
    nombre: 'Probabilidad multiplicada N.º 2',
    peso: 1,
    habilitada: true,
    minNombres: 2,
    descripcion: 'Como la de la probabilidad multiplicada… pero al revés: en vez de las 6-8 réplicas repartidas por la rueda, aquí hay UN SOLO nombre de él — con ese segmento 6-8 VECES MÁS GRANDE que los demás. Una rueda normal con un gajo ENORME: la probabilidad cae sola donde el gajo gordo. El giro es totalmente normal.',
    frase: 'Su segmento era más grande: casualidad.',

    preparar(base) {
      const lista = base.lista;
      // cuántas veces más grande queda el gajo del favorecido
      // (CONFIG.prob2.min-max, 6-8 tal como se pidió)
      const P2 = CONFIG.prob2 || {};
      const min = P2.min != null ? P2.min : 6;
      const max = P2.max != null ? P2.max : 8;
      const mult = Math.round(Math.max(min, Math.min(max, min + Math.random() * (max - min))));

      // a quién se le multiplica la suerte: UN nombre al azar
      const favorecido = enteroAleatorio(lista.length);

      // el color de cada participante es el de SU posición en la lista
      // original — las copias HEREDAN ese color (motor.js funde las
      // ranuras contiguas iguales en UN solo segmento gigante).
      const p = CONFIG.paleta.length;
      const coloresBase = lista.map((_, j) => CONFIG.paleta[j % p]);

      // la rueda ampliada: el favorecido ocupa "mult" porciones
      // SEGUIDAS (el gajo gigante); los demás, una cada uno.
      const visual = [];
      const colores = [];
      const mapa = [];
      for (let i = 0; i < lista.length; i++) {
        const veces = (i === favorecido) ? mult : 1;
        for (let k = 0; k < veces; k++) {
          visual.push(lista[i]);
          colores.push(coloresBase[i]);
          mapa.push(i);
        }
      }
      const porcion = enteroAleatorio(visual.length);   // sorteo uniforme
      return {
        visual,                     // la rueda con su gajo gigante
        colores,                    // cada porción con el color de su dueño
        ganador: porcion,           // índice en la rueda ampliada
        originalIdx: mapa[porcion], // índice en la lista original
        nota: `Su segmento era ${mult} veces más grande que los demás.`,
      };
    },

    async girar(ctx) {
      // Giro totalmente normal (el de la guía: 8500 ms, easeOut(5)):
      // la gracia está en la rueda, no en el giro.
      await ctx.girarHasta({
        vueltas: 6 * ctx.vel,
        sentido: 1,
        duracion: ctx.guia(8500),
        suavizado: SUAV.salidaQuintica,
        arranque: true,
      });
    },
  },


  /* ═══ 21 · TENSIÓN DECISIVA (la nueva "realmente decisiva") ═══════
     Se desempeña como la clásica… solo que el final del recorrido es
     LENTÍSIMO (da tensión en cuál de los DOS caerá): la flecha acaba
     clavada EXACTAMENTE en la frontera entre los dos nombres — sin
     decidirse por ninguno, PARECIENDO QUE SE SEGUIRÁ MOVIENDO… y
     entonces REBOTA HACIA ATRÁS y elige AL OTRO.

     TODO EL TIMING VIVE EN CONFIG.tension (js/config.js), tal como
     se pidió: la duración total (fraccion), cuánto se arrastra el
     final (lentitud), la pausa en la frontera (pausa), los
     micro-temblores (temblores) y el rebote (rebote). */
  {
    id: 21,
    clave: 'tension-decisiva',
    nombre: 'Tensión decisiva',
    peso: 1.6,   // la favorita de la clase: la que más tensión genera
    habilitada: true,
    minNombres: 2,
    descripcion: 'La clásica de verdad… pero el final se arrastra LENTÍSIMO hasta dejar la flecha clavada EXACTA en la frontera entre DOS nombres — sin decidirse, pareciendo que seguirá rodando en cualquier momento… y entonces REBOTA hacia atrás y elige al otro. (Todos sus tiempos —cuánto se arrastra, la pausa, el rebote— viven en CONFIG.tension, en js/config.js.)',
    frase: 'Se quedó entre dos… ¡y rebatió hacia el otro!',

    async girar(ctx) {
      // con un solo nombre no hay "los dos": se degrada a clásica
      if (ctx.n < 2) {
        const CL = CLASICA_CFG();
        await ctx.girarHasta({
          vueltas: ctx.girosNormal(), sentido: 1,
          duracion: ctx.segs(CL.fraccion), suavizado: salidaPotencia(CL.suspenso),
          arranque: true,
        });
        return;
      }

      const TN = CONFIG.tension || {};
      const s = ctx.s;

      // 1) EL GIRO CASI-CLÁSICO con el final LENTÍSIMO (la gracia):
      //    cae EXACTO sobre la FRONTERA entre el ganador y el nombre
      //    anterior — la flecha ni un pelo a un lado ni al otro.
      //    (lentitud: el exponente de la frenada — CONFIG.tension)
      const frontera = ANGULO_FLECHA_TOPE - ctx.ganador * s;
      await ctx.girarAnguloAbsoluto({
        hasta: frontera,
        vueltas: 6 * ctx.vel,
        sentido: 1,
        duracion: ctx.segs(TN.fraccion != null ? TN.fraccion : 1),
        suavizado: salidaPotencia(TN.lentitud != null ? TN.lentitud : 8.5),
        arranque: true,
      });

      // 2) LA PAUSA DE LA TORTURA: parada en la frontera… y unos
      //    MICRO-EMPUNJONCITOS cada vez más chiquitos y más espaciados:
      //    parece que en cualquier momento se va a decidir por uno de
      //    los dos y seguir rodando. (El dron de suspense crece solo.)
      const esperar = seg => new Promise(r => setTimeout(r, seg * 1000));
      const temblores = Math.max(0, TN.temblores != null ? TN.temblores : 3);
      const Tpausa = Math.max(0.3, (TN.pausa != null ? TN.pausa : 1.15) * ESCALA);
      ctx.sonido.suspenseo(Tpausa);
      for (let k = 0; k < temblores; k++) {
        await esperar(Tpausa / (temblores + 1));
        await ctx.girarAngulo({
          // cada empujoncito, más chiquitito (va perdiendo fuerzas…)
          delta: s * 0.014 * (1 - k / (temblores + 1)),
          duracion: 0.09,
          suavizado: SUAV.salidaCubica,
        });
      }

      // 3) …y REBOTA HACIA ATRÁS: medio segmento de un brinco, hasta
      //    quedar CLAVADA en el centro del OTRO nombre de los dos (el
      //    elegido de verdad — la rueda "decidió" yendo pa'atrás).
      ctx.sonido.golpe(0.32);
      await ctx.girarAngulo({
        delta: -s * 0.5,
        duracion: TN.rebote != null ? TN.rebote : 0.5,
        suavizado: SUAV.entradaSalidaCubica,
      });
    },
  },


  /* ═══ 22 · A LA TERCERA SE DESARMA (sin girar NI UN GRADO) ═══════
     El usuario hace clic en la rueda para que gire (o pulsa Girar)…
     y NADA: la rueda no se mueve — solo un TOQUE SECO, a feedback.
     La preciona una segunda vez… tampoco (otro toque seco). Y A LA
     TERCERA: el sonido de motor dañado ROMPIÉNDOSE — y la rueda SE
     DESARMA en pedazos como la 16, PERO SIN HABER GIRADO NI UN
     GRADO. Solo queda el ganador… y la flecha recorre el borde
     hasta señalarlo.

     LA REGLA DE LOS TRES CLICS cuenta CUALQUIERA de estas tres:
     clic en la rueda, pulsación del botón GIRAR o barra
     espaciadora (el botón sigue VIVO durante esta animación:
     cuentaClics — js/ui.js lo deja habilitado y le pasa sus
     pulsaciones a la animación). */
  {
    id: 22,
    clave: 'tercera-desarme',
    nombre: 'A la tercera se desarma',
    peso: 1,
    habilitada: true,
    minNombres: 2,
    cuentaClics: true,   // js/ui.js: el botón Girar sigue vivo y cuenta
    descripcion: 'Le das a girar… y NADA: la rueda ni se mueve — solo un toque seco, a feedback. Un segundo clic… tampoco. Y A LA TERCERA: la avería la desarma en pedazos — con su sonido de motor dañado — SIN haber girado ni un grado; la flecha recorre el borde y señala al ganador. (La regla de los tres clics cuenta rueda, botón Girar y barra espaciadora por igual.)',
    frase: 'Ni quiso girar: a la tercera se desarmó.',

    async girar(ctx) {
      // 1) El PRIMER clic ya se dio — el que arrancó este giro: su
      //    feedback es este TOQUE SECO. La rueda ni se inmuta.
      ctx.sonido.clicSeco();

      // 2) El SEGUNDO clic (rueda, botón Girar o barra: cualquiera
      //    vale): otro toque seco. La rueda sigue sin moverse NI UN grado.
      await ctx.esperarClicOGirar();
      ctx.sonido.clicSeco();

      // 3) Y A LA TERCERA: LA AVERÍA — el motor se rompe de verdad
      //    (su sonido de motor dañado, de golpe) — y la rueda SE
      //    DESARMA entera SIN GIRAR: pedazo a pedazo, cada uno con su
      //    sonido. (El desarme empieza por el segmento del ÚLTIMO
      //    clic — como en la 16; si fue con el botón, por la flecha.)
      const c3 = await ctx.esperarClicOGirar();
      ctx.sonido.motorRoto();

      const clic = c3 || ctx.clicGiro || null;
      const bajo = clic ? ctx.sectorBajoPunto(clic.x, clic.y) : null;
      const inicio = bajo
        ? bajo.indice
        : Math.max(0, ctx.indiceBajoFlecha());
      const orden = [];
      for (let k = 0; k < ctx.n; k++) {
        const i = (inicio + k) % ctx.n;
        if (i !== ctx.ganador) orden.push(i);
      }
      const paso = Math.min(0.11, Math.max(0.045, 0.8 / Math.max(1, orden.length)));
      let k = 0;
      for (const i of orden) {
        ctx.caerSegmento(i);
        ctx.sonido.pieza(k++);      // ¡crac! — este pedazo, su sonido
        await ctx.dormir(paso);
      }

      // 4) La flecha RECORRE el borde hasta el ganador (la rueda ni
      //    se movió: hoy quien decide es ella, rodeando los pedazos).
      ctx.sonido.suspenseo(ctx.segs(0.16));
      await ctx.girarFlechaHasta({
        vueltas: 1,
        sentido: 1,
        duracion: ctx.segs(0.16),
        suavizado: SUAV.salidaCuartica,
        arranque: true,
      });

      // 5) Un respiro solemne… y la tarjeta.
      await ctx.dormir(0.35);
    },
  },


  /* ═══ 23 · NADIE FUE ELEGIDO (la flecha cae ENTRE dos nombres) ══
     La ruleta se mueve NORMAL, clásica de verdad… pero al final
     queda con el selector EN LA FRONTERA EXACTA entre DOS
     segmentos — la flecha clavada en la mitad de los dos, sin
     seleccionar a nadie. La pista de arriba (una ADVERTENCIA, en
     ámbar) manda: realice el tiro de nuevo, que no se seleccionó a
     nadie. SIN tarjeta de ganador y SIN historial: el próximo clic
     de la rueda vuelve a girar, como si el tiro no hubiera contado. */
  {
    id: 23,
    clave: 'nadie-elegido',
    nombre: 'Nadie fue elegido (repite el tiro)',
    peso: 1,
    habilitada: true,
    minNombres: 2,
    sinGanador: true,   // js/ui.js: sin tarjeta — el tiro se repite
    descripcion: 'El giro es la clásica de verdad… pero al final la flecha queda clavada JUSTA en la franja entre dos nombres: no se seleccionó a nadie. La pista de arriba manda (en ámbar): "Advertencia: La flecha quedó entre dos nombres: no se seleccionó a nadie. Realice el tiro de nuevo." Sin tarjeta y sin historial: el tiro se repite.',
    frase: 'Quedó entre dos nombres: nadie fue elegido.',

    async girar(ctx) {
      // 1) EL GIRO CLÁSICO de verdad (mismos tiempos de CONFIG.clasica)…
      //    pero el destino no es el centro de nadie: es la FRONTERA
      //    EXACTA entre dos segmentos al azar.
      const CL = CLASICA_CFG();
      const frontera = ANGULO_FLECHA_TOPE - enteroAleatorio(ctx.n) * ctx.s;
      await ctx.girarAnguloAbsoluto({
        hasta: frontera,
        vueltas: ctx.girosNormal(),
        sentido: 1,
        duracion: ctx.segs(CL.fraccion),
        suavizado: salidaPotencia(CL.suspenso),
        arranque: true,
      });

      // 2) Un instante de incertidumbre — toda la clase mirando la
      //    flecha clavada en la mitad de los dos, sin decidirse…
      await ctx.dormir(0.9);

      // 3) …y la confesión (ADVERTENCIA, en ámbar): no se seleccionó a
      //    nadie, hay que repetir el tiro. La pista se queda hasta que
      //    alguien vuelva a girar (js/ui.js no la borra en esta anim).
      ctx.setPista('Advertencia: La flecha quedó entre dos nombres: no se seleccionó a nadie. Realice el tiro de nuevo.');
    },
  },
];


/* ════════════════════════════════════════════════════════════════════
   LOS GRUPOS DE ANIMACIONES (para el modo "Realmente normal")
   ────────────────────────────────────────────────────────────────────
   ⚠ LA TABLA YA NO VIVE AQUÍ: se mudó a js/config.js
   (CONFIG.gruposAnimaciones) para que cambiar el ORDEN y los miembros
   de cada grupo sea cosa de un solo archivo, sin tocar código. Allí
   está la leyenda número → animación y las reglas completas.

   La progresión (la implementa js/ui.js → elegirAnimacion):
     · La PRIMERA TIRADA es SIEMPRE la animación NORMAL (la 1).
     · Cada persona QUITADA con "Quitar de la ruleta" avanza al
       SIGUIENTE grupo NO VACÍO de la tabla (los vacíos se saltan).
     · Conservar y volver a girar → la SIGUIENTE animación de la
       lista del grupo actual, SIN REPETIR hasta agotar el grupo.
     · El último grupo (resto: true, "El resto") → cualquier
       animación NO VISTA; vistas todas → todas, para siempre.
   El mazo del modo RANDOM baraja TODAS sin orden y sin repetir
   hasta agotarse (excluye las que no cumplen su mínimo de nombres,
   como la diana con menos de 4). */
const GRUPOS_ANIM = CONFIG.gruposAnimaciones;
