import type { Objection } from "@/types/objection";

/**
 * Contenido de demostración (DEMO), centralizado y editable.
 * Ver README.md → "Dónde editar las objeciones".
 */
export const objections: Objection[] = [
  {
    id: "obj-caro",
    slug: "es-muy-caro",
    title: "Es muy caro",
    category: "Precio",
    commonPhrase: "\"Es muy caro\" / \"Está por encima de lo que pensaba\"",
    active: true,
    keywords: ["caro", "precio", "costo", "presupuesto alto"],
    whatItMayExpress: [
      "No percibe todavía el valor completo de la propuesta.",
      "Lo está comparando con una opción de menor precio.",
      "El monto total le genera impacto, aunque el valor por unidad de tiempo sea razonable.",
      "Puede ser una forma cortés de decir que no es prioridad ahora.",
    ],
    whatNotToAssume: [
      "No asumas que no tiene el dinero: puede tratarse de percepción de valor, no de capacidad de pago.",
      "No asumas que hay que bajar el precio de inmediato.",
      "No asumas que está comparando con un competidor directo: puede estar comparando con no hacer nada.",
    ],
    questionsToExplore: [
      "¿Con qué lo estás comparando?",
      "¿Qué parte de la propuesta te genera más dudas en relación con el valor?",
      "Si el precio no fuera un tema, ¿avanzarías con la propuesta tal como está?",
    ],
    whatToAvoid: [
      "Bajar el precio de forma automática, sin entender el motivo real.",
      "Justificar el precio con una lista extensa de argumentos.",
      "Compararte de forma negativa con la competencia.",
    ],
    nextGoal: "Entender si el freno es de percepción de valor, de prioridad o de presupuesto real, y ajustar la propuesta o la comunicación en consecuencia.",
    empathetic: {
      template:
        "Hola {{nombre}}, entiendo perfectamente que el monto te genere dudas. Me gustaría entender mejor: ¿con qué lo estás comparando? Así puedo mostrarte {{recurso}} para que tengas más elementos antes de decidir sobre {{propuesta}}.",
      example:
        "Hola Martina, entiendo perfectamente que el monto te genere dudas. Me gustaría entender mejor: ¿con qué lo estás comparando? Así puedo mostrarte cómo se distribuye la inversión en el proceso para que tengas más elementos antes de decidir sobre la propuesta.",
    },
    neutral: {
      template:
        "Hola {{nombre}}, gracias por la sinceridad respecto al {{propuesta}}. Para entender mejor tu situación: ¿el tema es el monto total o la forma de pago? Cualquiera de las dos cosas la podemos revisar.",
      example:
        "Hola Martina, gracias por la sinceridad respecto a la propuesta. Para entender mejor tu situación: ¿el tema es el monto total o la forma de pago? Cualquiera de las dos cosas la podemos revisar.",
    },
    direct: {
      template:
        "Hola {{nombre}}, te propongo algo simple: contame en una línea qué parte del precio te genera más dudas, y vemos juntos si hay una forma de ajustar {{propuesta}} a tu situación.",
      example:
        "Hola Martina, te propongo algo simple: contame en una línea qué parte del precio te genera más dudas, y vemos juntos si hay una forma de ajustar la propuesta a tu situación.",
    },
    mistakeToAvoid:
      "Ofrecer un descuento antes de entender si el problema es realmente el precio.",
    relatedLessonIds: ["m5-l2", "m5-l6"],
  },
  {
    id: "obj-sin-presupuesto",
    slug: "no-tengo-presupuesto",
    title: "No tengo presupuesto",
    category: "Precio",
    commonPhrase: "\"No tengo presupuesto para esto ahora\"",
    active: true,
    keywords: ["presupuesto", "dinero", "no puedo pagar"],
    whatItMayExpress: [
      "Puede haber una restricción real de presupuesto en este momento.",
      "Puede ser una forma de decir que no es prioridad, sin dar más detalle.",
      "Puede indicar que el presupuesto está asignado a otra necesidad.",
    ],
    whatNotToAssume: [
      "No asumas que jamás va a tener presupuesto.",
      "No asumas que es una excusa: puede ser una limitación concreta y temporal.",
    ],
    questionsToExplore: [
      "¿Es un tema de presupuesto para este momento puntual, o para el proyecto en general?",
      "¿Hay una fecha en la que el presupuesto podría liberarse?",
      "¿Sería de ayuda pensar una versión más acotada para empezar?",
    ],
    whatToAvoid: [
      "Insistir con el mismo monto sin ofrecer alternativas.",
      "Dar por cerrada la oportunidad sin preguntar por plazos.",
    ],
    nextGoal: "Definir si corresponde ajustar el alcance, esperar una fecha de presupuesto o pasar a nurturing.",
    empathetic: {
      template:
        "Hola {{nombre}}, entiendo la situación con el presupuesto. Para no perder de vista esto: ¿hay un momento del año en el que se libere presupuesto para {{necesidad}}? Me gustaría poder acompañarte cuando sea el momento.",
      example:
        "Hola Diego, entiendo la situación con el presupuesto. Para no perder de vista esto: ¿hay un momento del año en el que se libere presupuesto para este tipo de proyectos? Me gustaría poder acompañarte cuando sea el momento.",
    },
    neutral: {
      template:
        "Hola {{nombre}}, gracias por contarme. ¿Te sirve que pensemos una versión más acotada de {{propuesta}} que se ajuste al presupuesto actual, o preferís que retomemos más adelante?",
      example:
        "Hola Diego, gracias por contarme. ¿Te sirve que pensemos una versión más acotada de la propuesta que se ajuste al presupuesto actual, o preferís que retomemos más adelante?",
    },
    direct: {
      template:
        "Hola {{nombre}}, sin problema. ¿Charlamos brevemente para ver si hay una forma de adaptar {{propuesta}} al presupuesto disponible, o preferís que te contacte en {{fecha}}?",
      example:
        "Hola Diego, sin problema. ¿Charlamos brevemente para ver si hay una forma de adaptar la propuesta al presupuesto disponible, o preferís que te contacte en dos meses?",
    },
    mistakeToAvoid: "Cerrar la conversación sin preguntar si el presupuesto podría liberarse más adelante.",
    relatedLessonIds: ["m5-l6", "m4-l10"],
  },
  {
    id: "obj-pensarlo",
    slug: "necesito-pensarlo",
    title: "Necesito pensarlo",
    category: "Confianza / decisión",
    commonPhrase: "\"Necesito pensarlo\" / \"Déjame evaluarlo\"",
    active: true,
    keywords: ["pensarlo", "evaluar", "decisión"],
    whatItMayExpress: [
      "Puede haber una duda puntual que no se animó a mencionar.",
      "Puede necesitar tiempo real para procesar la información.",
      "Puede ser una forma cortés de cerrar la conversación sin decir que no.",
    ],
    whatNotToAssume: [
      "No asumas que 'pensarlo' significa que no va a avanzar.",
      "No asumas que sabés qué es lo que necesita pensar sin preguntar.",
    ],
    questionsToExplore: [
      "¿Hay algo puntual que te gustaría pensar con más detalle?",
      "¿Qué información te ayudaría a decidir con más tranquilidad?",
      "¿Para cuándo te gustaría retomar la conversación?",
    ],
    whatToAvoid: [
      "Presionar para obtener una respuesta inmediata.",
      "Dejar la conversación sin fecha de retorno.",
    ],
    nextGoal: "Acordar una fecha concreta para retomar y, si es posible, identificar la duda específica que motiva la pausa.",
    empathetic: {
      template:
        "Hola {{nombre}}, tiene todo el sentido tomarte el tiempo necesario. Si te sirve, contame qué es lo que más te gustaría pensar sobre {{propuesta}}: puedo ayudarte a tener más claridad antes de que decidas.",
      example:
        "Hola Sofía, tiene todo el sentido tomarte el tiempo necesario. Si te sirve, contame qué es lo que más te gustaría pensar sobre la propuesta: puedo ayudarte a tener más claridad antes de que decidas.",
    },
    neutral: {
      template:
        "Hola {{nombre}}, perfecto. Para organizarnos: ¿te parece que retomemos el {{fecha}}? Así lo tenemos presente los dos.",
      example:
        "Hola Sofía, perfecto. Para organizarnos: ¿te parece que retomemos el próximo lunes? Así lo tenemos presente los dos.",
    },
    direct: {
      template:
        "Hola {{nombre}}, sin problema. ¿Me confirmás una fecha aproximada para retomar {{propuesta}} y así te contacto en ese momento?",
      example:
        "Hola Sofía, sin problema. ¿Me confirmás una fecha aproximada para retomar la propuesta y así te contacto en ese momento?",
    },
    mistakeToAvoid: "No preguntar por una fecha concreta y dejar la conversación completamente abierta.",
    relatedLessonIds: ["m5-l6", "m2-l3"],
  },
  {
    id: "obj-no-prioridad",
    slug: "ahora-no-es-prioridad",
    title: "Ahora no es prioridad",
    category: "Prioridad",
    commonPhrase: "\"Ahora no es prioridad\" / \"Tengo otras cosas encima\"",
    active: true,
    keywords: ["prioridad", "no es momento", "urgencia"],
    whatItMayExpress: [
      "Puede haber temas más urgentes ocupando su atención en este momento.",
      "Puede no tener claro el impacto de postergar esta decisión.",
      "Puede ser una forma de decir que el valor percibido todavía no supera el esfuerzo de ocuparse ahora.",
    ],
    whatNotToAssume: [
      "No asumas que nunca va a ser prioridad.",
      "No asumas que insistir con urgencia va a cambiar su percepción.",
    ],
    questionsToExplore: [
      "¿Qué tendría que pasar para que esto se vuelva prioridad?",
      "¿Hay una fecha en la que esto empiece a pesar más en tu agenda?",
      "¿Te sirve que te comparta información mientras tanto, sin presionarte a decidir ahora?",
    ],
    whatToAvoid: [
      "Cuestionar sus prioridades o minimizarlas.",
      "Insistir con la misma frecuencia como si fuera una oportunidad activa.",
    ],
    nextGoal: "Comprender el horizonte de tiempo real y pasar a un seguimiento espaciado si corresponde.",
    empathetic: {
      template:
        "Hola {{nombre}}, entiendo que hoy tengas otras cosas encima. Me gustaría acompañarte igual: ¿te sirve que te escriba más adelante, o preferís que te comparta algo de valor mientras tanto sobre {{necesidad}}?",
      example:
        "Hola Julián, entiendo que hoy tengas otras cosas encima. Me gustaría acompañarte igual: ¿te sirve que te escriba más adelante, o preferís que te comparta algo de valor mientras tanto sobre la organización del equipo comercial?",
    },
    neutral: {
      template:
        "Hola {{nombre}}, gracias por contarme. Para no interrumpirte sin sentido: ¿te parece que retomemos en {{fecha}}?",
      example:
        "Hola Julián, gracias por contarme. Para no interrumpirte sin sentido: ¿te parece que retomemos en un mes?",
    },
    direct: {
      template:
        "Hola {{nombre}}, entendido. ¿Te escribo en {{fecha}} para retomar, o preferís avisarme vos cuando sea buen momento?",
      example:
        "Hola Julián, entendido. ¿Te escribo en un mes para retomar, o preferís avisarme vos cuando sea buen momento?",
    },
    mistakeToAvoid: "Seguir escribiendo con la misma frecuencia que si la oportunidad estuviera activa.",
    relatedLessonIds: ["m4-l10", "m2-l4"],
  },
  {
    id: "obj-hablarlo-otra-persona",
    slug: "tengo-que-hablarlo-con-otra-persona",
    title: "Tengo que hablarlo con otra persona",
    category: "Autoridad / decisión",
    commonPhrase: "\"Lo tengo que hablar con mi socio / mi pareja / mi equipo\"",
    active: true,
    keywords: ["tercero", "socio", "decisión compartida", "autoridad"],
    whatItMayExpress: [
      "La decisión efectivamente involucra a otra persona.",
      "Puede necesitar más argumentos para poder trasladar la propuesta.",
      "Puede ser una forma de tomarse tiempo sin comprometerse.",
    ],
    whatNotToAssume: [
      "No asumas que es una excusa: en muchos procesos la decisión es genuinamente compartida.",
      "No asumas que la otra persona conoce el mismo nivel de detalle que tu interlocutor.",
    ],
    questionsToExplore: [
      "¿Qué información le sería útil a esa persona para evaluarlo?",
      "¿Tendría sentido armar un resumen breve para compartir?",
      "¿Sería posible coordinar una conversación breve los tres, si eso ayuda a resolver dudas más rápido?",
    ],
    whatToAvoid: [
      "Presionar para que decida sin consultar a esa persona.",
      "Asumir que esa persona va a tener una objeción negativa sin evidencia.",
    ],
    nextGoal: "Facilitar la conversación con el tercero, aportando material claro y proponiendo un próximo paso con fecha.",
    empathetic: {
      template:
        "Hola {{nombre}}, tiene todo el sentido que lo converses con {{tercero}}. Para ayudarte, te armo un resumen breve de {{propuesta}} que puedas compartir fácilmente. ¿Te sirve?",
      example:
        "Hola Camila, tiene todo el sentido que lo converses con tu socio. Para ayudarte, te armo un resumen breve de la propuesta que puedas compartir fácilmente. ¿Te sirve?",
    },
    neutral: {
      template:
        "Hola {{nombre}}, entendido. ¿Te ayudaría un resumen de una página con los puntos clave de {{propuesta}} para compartir con {{tercero}}?",
      example:
        "Hola Camila, entendido. ¿Te ayudaría un resumen de una página con los puntos clave de la propuesta para compartir con tu socio?",
    },
    direct: {
      template:
        "Hola {{nombre}}, perfecto. Te paso un resumen breve para {{tercero}} y coordinamos una fecha para conversarlo juntos, ¿te sirve el {{fecha}}?",
      example:
        "Hola Camila, perfecto. Te paso un resumen breve para tu socio y coordinamos una fecha para conversarlo juntos, ¿te sirve el jueves?",
    },
    mistakeToAvoid: "No ofrecer material de apoyo y dejar que la persona explique la propuesta de memoria.",
    relatedLessonIds: ["m5-l2"],
  },
  {
    id: "obj-mas-informacion",
    slug: "mandame-mas-informacion",
    title: "Mandame más información",
    category: "Información",
    commonPhrase: "\"Mandame más información\" / \"Pasame material para revisar\"",
    active: true,
    keywords: ["información", "material", "brochure"],
    whatItMayExpress: [
      "Puede necesitar más detalles concretos antes de decidir.",
      "Puede ser una forma cortés de posponer sin comprometerse a nada.",
      "Puede querer compartir la información con otra persona.",
    ],
    whatNotToAssume: [
      "No asumas que un envío genérico de información resuelve la situación.",
      "No asumas que pedir información significa interés firme: conviene calificarlo.",
    ],
    questionsToExplore: [
      "¿Hay algo puntual sobre lo que te gustaría tener más detalle?",
      "¿La información es para vos o para compartir con alguien más?",
      "Después de revisarla, ¿te sirve que coordinemos una fecha para conversar dudas?",
    ],
    whatToAvoid: [
      "Enviar información genérica sin acordar un próximo paso posterior.",
      "No preguntar qué información específica es útil.",
    ],
    nextGoal: "Enviar información relevante y acordar de antemano una fecha para retomar la conversación.",
    empathetic: {
      template:
        "Hola {{nombre}}, con gusto. Te comparto {{recurso}} pensando en {{necesidad}}. Para que no quede sin cierre: ¿coordinamos una charla breve el {{fecha}} para resolver dudas después de que lo revises?",
      example:
        "Hola Nicolás, con gusto. Te comparto el material con casos similares al tuyo pensando en la necesidad de ordenar el equipo comercial. Para que no quede sin cierre: ¿coordinamos una charla breve el viernes para resolver dudas después de que lo revises?",
    },
    neutral: {
      template:
        "Hola {{nombre}}, te comparto {{recurso}} sobre {{propuesta}}. Quedo atento a tus comentarios y, si te sirve, coordinamos una breve llamada el {{fecha}} para conversarlo.",
      example:
        "Hola Nicolás, te comparto el brochure sobre la propuesta. Quedo atento a tus comentarios y, si te sirve, coordinamos una breve llamada el lunes para conversarlo.",
    },
    direct: {
      template:
        "Hola {{nombre}}, te dejo {{recurso}}. ¿Coordinamos ya una fecha para revisarlo juntos, el {{fecha}} por ejemplo?",
      example:
        "Hola Nicolás, te dejo el material. ¿Coordinamos ya una fecha para revisarlo juntos, el jueves por ejemplo?",
    },
    mistakeToAvoid: "Enviar la información y no proponer ningún próximo paso, dejando la conversación abierta.",
    relatedLessonIds: ["m4-l6", "m2-l3"],
  },
  {
    id: "obj-otro-proveedor",
    slug: "ya-trabajo-con-otro-proveedor",
    title: "Ya trabajo con otro proveedor",
    category: "Competencia",
    commonPhrase: "\"Ya trabajo con otro proveedor / otra persona para esto\"",
    active: true,
    keywords: ["competencia", "proveedor", "ya tengo"],
    whatItMayExpress: [
      "Puede estar conforme con la relación actual.",
      "Puede haber una necesidad puntual que el proveedor actual no cubre del todo.",
      "Puede ser una forma de cerrar la conversación sin dar más detalle.",
    ],
    whatNotToAssume: [
      "No asumas que está eligiendo a la competencia por sobre vos.",
      "No asumas que no vale la pena seguir la conversación.",
    ],
    questionsToExplore: [
      "¿Qué es lo que más valorás de esa relación actual?",
      "¿Hay algo que te gustaría que funcionara distinto?",
      "¿Tendría sentido que quedemos en contacto para el futuro, por si la situación cambia?",
    ],
    whatToAvoid: [
      "Hablar mal del proveedor actual.",
      "Insistir para que cambie de proveedor sin entender su situación.",
    ],
    nextGoal: "Dejar una puerta abierta clara para el futuro, sin presionar por un cambio inmediato.",
    empathetic: {
      template:
        "Hola {{nombre}}, me alegra que tengas una solución que te funciona. Si en algún momento surge algo puntual donde pueda sumar valor con {{servicio}}, quedo a disposición. ¿Te parece que sigamos en contacto?",
      example:
        "Hola Rocío, me alegra que tengas una solución que te funciona. Si en algún momento surge algo puntual donde pueda sumar valor con la propuesta de comunicación, quedo a disposición. ¿Te parece que sigamos en contacto?",
    },
    neutral: {
      template:
        "Hola {{nombre}}, entendido, gracias por contarme. ¿Te parece si quedamos en contacto para el futuro, por si en algún momento necesitás una segunda opción para {{necesidad}}?",
      example:
        "Hola Rocío, entendido, gracias por contarme. ¿Te parece si quedamos en contacto para el futuro, por si en algún momento necesitás una segunda opción para este tipo de proyectos?",
    },
    direct: {
      template:
        "Hola {{nombre}}, gracias por la claridad. Te dejo mi contacto por si en el futuro necesitás algo puntual relacionado con {{servicio}}.",
      example:
        "Hola Rocío, gracias por la claridad. Te dejo mi contacto por si en el futuro necesitás algo puntual relacionado con este servicio.",
    },
    mistakeToAvoid: "Comparar negativamente al proveedor actual para intentar generar duda.",
    relatedLessonIds: ["m4-l10"],
  },
  {
    id: "obj-no-tiempo",
    slug: "no-tengo-tiempo",
    title: "No tengo tiempo",
    category: "Prioridad",
    commonPhrase: "\"No tengo tiempo para esto ahora\"",
    active: true,
    keywords: ["tiempo", "agenda", "ocupado"],
    whatItMayExpress: [
      "Puede haber una carga de trabajo real que impide ocuparse ahora.",
      "Puede no percibir el tiempo que realmente demandaría avanzar.",
      "Puede ser una forma de decir que todavía no es prioridad.",
    ],
    whatNotToAssume: [
      "No asumas que nunca va a tener tiempo.",
      "No asumas que avanzar requiere más tiempo del que realmente implica.",
    ],
    questionsToExplore: [
      "¿Cuánto tiempo estimás que necesitarías para poder evaluarlo con tranquilidad?",
      "¿Hay un momento del mes en el que tengas más disponibilidad?",
      "¿Te sirve si simplifico la propuesta para que requiera menos tiempo de tu parte?",
    ],
    whatToAvoid: [
      "Restarle importancia a su falta de tiempo.",
      "Proponer reuniones largas cuando lo que falta es justamente tiempo.",
    ],
    nextGoal: "Reducir el esfuerzo requerido para avanzar y acordar una fecha realista.",
    empathetic: {
      template:
        "Hola {{nombre}}, entiendo, el tiempo es un recurso escaso. ¿Te sirve si lo resolvemos en una llamada breve de 10 minutos, o preferís que te contacte en {{fecha}}?",
      example:
        "Hola Tomás, entiendo, el tiempo es un recurso escaso. ¿Te sirve si lo resolvemos en una llamada breve de 10 minutos, o preferís que te contacte la semana que viene?",
    },
    neutral: {
      template:
        "Hola {{nombre}}, entendido. ¿Preferís que avancemos con algo breve por escrito o coordinamos una fecha en la que tengas más disponibilidad?",
      example:
        "Hola Tomás, entendido. ¿Preferís que avancemos con algo breve por escrito o coordinamos una fecha en la que tengas más disponibilidad?",
    },
    direct: {
      template:
        "Hola {{nombre}}, sin problema. ¿Me decís qué día de {{fecha}} te queda mejor y lo resolvemos rápido?",
      example:
        "Hola Tomás, sin problema. ¿Me decís qué día de la próxima semana te queda mejor y lo resolvemos rápido?",
    },
    mistakeToAvoid: "Proponer una reunión larga cuando el problema declarado es, justamente, la falta de tiempo.",
    relatedLessonIds: ["m2-l3"],
  },
  {
    id: "obj-mas-adelante",
    slug: "hablemos-mas-adelante",
    title: "Hablemos más adelante",
    category: "Prioridad / tiempos",
    commonPhrase: "\"Hablemos más adelante\" / \"Te escribo yo cuando sea el momento\"",
    active: true,
    keywords: ["más adelante", "después", "nurturing"],
    whatItMayExpress: [
      "Puede haber un motivo concreto por el que el momento actual no es el indicado.",
      "Puede ser una forma amable de cerrar la conversación por ahora.",
    ],
    whatNotToAssume: [
      "No asumas una fecha: preguntala explícitamente.",
      "No asumas que 'más adelante' significa que no hay interés.",
    ],
    questionsToExplore: [
      "¿Hay un momento aproximado en el que te gustaría retomar?",
      "¿Qué tendría que cambiar para que sea un buen momento?",
    ],
    whatToAvoid: [
      "Dejar pasar el tema sin acordar ninguna fecha de referencia.",
      "Escribir antes del plazo que la persona mencionó.",
    ],
    nextGoal: "Acordar una fecha aproximada de recontacto y pasar a nurturing si no hay fecha concreta.",
    empathetic: {
      template:
        "Hola {{nombre}}, por supuesto. Para tenerlo presente sin molestarte antes de tiempo: ¿te sirve que retomemos en {{fecha}}?",
      example:
        "Hola Valentina, por supuesto. Para tenerlo presente sin molestarte antes de tiempo: ¿te sirve que retomemos en dos meses?",
    },
    neutral: {
      template:
        "Hola {{nombre}}, entendido. Quedo en contacto para {{fecha}}, salvo que prefieras escribirme vos cuando sea el momento.",
      example:
        "Hola Valentina, entendido. Quedo en contacto para fin de año, salvo que prefieras escribirme vos cuando sea el momento.",
    },
    direct: {
      template:
        "Hola {{nombre}}, perfecto. Te contacto en {{fecha}}. Si antes surge algo, quedo disponible.",
      example:
        "Hola Valentina, perfecto. Te contacto en marzo. Si antes surge algo, quedo disponible.",
    },
    mistakeToAvoid: "Volver a escribir antes de la fecha acordada, sin un motivo nuevo y relevante.",
    relatedLessonIds: ["m4-l10", "m4-l9"],
  },
  {
    id: "obj-no-es-para-mi",
    slug: "no-estoy-seguro-de-que-sea-para-mi",
    title: "No estoy seguro de que sea para mí",
    category: "Confianza / encaje",
    commonPhrase: "\"No sé si esto es realmente para mí\"",
    active: true,
    keywords: ["encaje", "confianza", "dudas"],
    whatItMayExpress: [
      "Puede tener dudas genuinas sobre si el servicio se ajusta a su situación particular.",
      "Puede no haber entendido completamente el alcance de la propuesta.",
      "Puede estar comparando con su propia idea de lo que necesita.",
    ],
    whatNotToAssume: [
      "No asumas que no encaja: preguntá qué le genera la duda puntualmente.",
      "No asumas que necesita el mismo servicio que otros clientes.",
    ],
    questionsToExplore: [
      "¿Qué parte específica te genera esa duda?",
      "¿Cómo te imaginás que debería ser la solución ideal para tu situación?",
      "¿Te sirve que revisemos juntos si el alcance actual se ajusta a lo que necesitás?",
    ],
    whatToAvoid: [
      "Insistir en que sí encaja sin entender la duda concreta.",
      "Minimizar su preocupación.",
    ],
    nextGoal: "Aclarar el encaje real y ajustar la propuesta si corresponde, o reconocer honestamente si no es el mejor fit.",
    empathetic: {
      template:
        "Hola {{nombre}}, gracias por decírmelo con honestidad. Contame un poco más: ¿qué es lo que te genera esa duda sobre {{propuesta}}? Así vemos juntos si realmente se ajusta a {{necesidad}}.",
      example:
        "Hola Agustina, gracias por decírmelo con honestidad. Contame un poco más: ¿qué es lo que te genera esa duda sobre la propuesta? Así vemos juntos si realmente se ajusta a lo que estás buscando.",
    },
    neutral: {
      template:
        "Hola {{nombre}}, entiendo la duda. ¿Te parece si repasamos juntos los puntos de {{propuesta}} para confirmar si se ajusta bien a {{necesidad}}?",
      example:
        "Hola Agustina, entiendo la duda. ¿Te parece si repasamos juntos los puntos de la propuesta para confirmar si se ajusta bien a lo que estás buscando?",
    },
    direct: {
      template:
        "Hola {{nombre}}, te propongo algo concreto: contame qué parte te genera dudas y te digo con sinceridad si es o no un buen fit.",
      example:
        "Hola Agustina, te propongo algo concreto: contame qué parte te genera dudas y te digo con sinceridad si es o no un buen fit.",
    },
    mistakeToAvoid: "Convencer a toda costa en lugar de evaluar honestamente si hay un buen encaje.",
    relatedLessonIds: ["m5-l6"],
  },
  {
    id: "obj-no-se-ajusta",
    slug: "la-propuesta-no-se-ajusta",
    title: "La propuesta no se ajusta a lo que necesito",
    category: "Encaje / alcance",
    commonPhrase: "\"Esto no es exactamente lo que estaba buscando\"",
    active: true,
    keywords: ["ajuste", "alcance", "propuesta"],
    whatItMayExpress: [
      "Puede haber un desajuste real entre el alcance propuesto y la necesidad.",
      "Puede haber un malentendido sobre lo que incluye la propuesta.",
      "Puede estar comparando con una expectativa que no se comunicó antes.",
    ],
    whatNotToAssume: [
      "No asumas que sabés en qué falla la propuesta sin preguntar.",
      "No asumas que hay que rehacer todo desde cero.",
    ],
    questionsToExplore: [
      "¿Qué parte específica sentís que no se ajusta?",
      "¿Cómo te imaginabas la solución antes de recibir la propuesta?",
      "¿Qué tendría que cambiar para que se ajuste mejor?",
    ],
    whatToAvoid: [
      "Ponerse a la defensiva sobre el trabajo ya realizado.",
      "Ignorar el comentario y reenviar la misma propuesta.",
    ],
    nextGoal: "Identificar el punto exacto de desajuste y ofrecer una versión ajustada o una aclaración específica.",
    empathetic: {
      template:
        "Hola {{nombre}}, gracias por decírmelo. Quiero entender bien: ¿qué parte de {{propuesta}} sentís que no se ajusta a {{necesidad}}? Así la ajustamos juntos.",
      example:
        "Hola Ezequiel, gracias por decírmelo. Quiero entender bien: ¿qué parte de la propuesta sentís que no se ajusta a lo que necesitás? Así la ajustamos juntos.",
    },
    neutral: {
      template:
        "Hola {{nombre}}, entendido. ¿Podés contarme puntualmente qué parte no encaja, para revisar {{propuesta}} y ajustarla?",
      example:
        "Hola Ezequiel, entendido. ¿Podés contarme puntualmente qué parte no encaja, para revisar la propuesta y ajustarla?",
    },
    direct: {
      template:
        "Hola {{nombre}}, decime concretamente qué cambiarías de {{propuesta}} y te mando una versión ajustada.",
      example:
        "Hola Ezequiel, decime concretamente qué cambiarías de la propuesta y te mando una versión ajustada.",
    },
    mistakeToAvoid: "Reenviar la misma propuesta sin cambios, esperando una respuesta distinta.",
    relatedLessonIds: ["m2-l3", "m5-l6"],
  },
  {
    id: "obj-otra",
    slug: "otra-objecion",
    title: "Otra objeción",
    category: "General",
    commonPhrase: "Una objeción que no aparece en la lista.",
    active: true,
    isOpenEnded: true,
    keywords: ["otra", "general", "no listada"],
    whatItMayExpress: [
      "Puede tratarse de precio, prioridad, confianza, tiempo, autoridad o necesidad, aunque no se haya dicho explícitamente.",
    ],
    whatNotToAssume: [
      "No asumas de qué se trata sin que la persona amplíe la idea.",
    ],
    questionsToExplore: [
      "¿Podés contarme un poco más sobre lo que te genera dudas?",
      "¿Qué aspecto puntual te preocupa más?",
      "¿Se relaciona más con el precio, el momento, la confianza o la necesidad?",
    ],
    whatToAvoid: [
      "Responder antes de comprender la objeción real.",
      "Dar una respuesta genérica sin haber indagado.",
    ],
    nextGoal: "Comprender la categoría real de la objeción (precio, prioridad, confianza, tiempo, autoridad o necesidad) antes de responder.",
    empathetic: {
      template:
        "Hola {{nombre}}, quiero entender bien tu situación antes de responder. ¿Podés contarme un poco más sobre lo que te genera dudas respecto a {{propuesta}}?",
      example:
        "Hola, quiero entender bien tu situación antes de responder. ¿Podés contarme un poco más sobre lo que te genera dudas respecto a la propuesta?",
    },
    neutral: {
      template:
        "Hola {{nombre}}, para poder ayudarte mejor: ¿qué aspecto puntual te preocupa más en este momento?",
      example:
        "Hola, para poder ayudarte mejor: ¿qué aspecto puntual te preocupa más en este momento?",
    },
    direct: {
      template:
        "Hola {{nombre}}, contame en pocas palabras qué te frena y vemos juntos cómo resolverlo.",
      example:
        "Hola, contame en pocas palabras qué te frena y vemos juntos cómo resolverlo.",
    },
    mistakeToAvoid: "Interpretar libremente la objeción sin haber preguntado.",
    relatedLessonIds: ["m5-l1", "m5-l4"],
  },
];
