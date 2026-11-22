// Texto editorial que los contratos no incluyen: cuándo usar un componente y qué usar en su lugar.
// Indexado por slug. `docs:check` no cubre este archivo; si falta una entrada, la sección se oculta.

export interface Editorial {
  /** Una frase: el trabajo que hace el componente. */
  use: string;
  /** Cuándo otro componente es mejor opción: `[slug, motivo]`. */
  instead?: [string, string][];
  /** Reglas de contenido y de uso, cortas para poder escanearlas. */
  rules?: string[];
}

export const editorial: Record<string, Editorial> = {
  accordion: {
    use: 'Apila secciones de contenido relacionado para que cada persona despliegue solo lo que necesita.',
    instead: [['tabs', 'las secciones son pares y una debe estar siempre visible.']],
    rules: ['Mantén las etiquetas del disparador cortas y distintas.', 'No ocultes contenido que haya que comparar.'],
  },
  alert: {
    use: 'Muestra un mensaje que permanece en el flujo de la página y está ligado a su entorno.',
    instead: [['toast', 'el mensaje es temporal y no depende de un lugar de la página.']],
    rules: ['Di qué ocurrió y qué hacer a continuación.', 'Usa el tono que corresponde a la gravedad, no al gusto cromático.'],
  },
  'alert-dialog': {
    use: 'Interrumpe para confirmar una acción destructiva o irreversible.',
    instead: [['dialog', 'no hay una decisión arriesgada que confirmar.']],
    rules: ['Nombra la acción en el botón de confirmar («Eliminar», no «Aceptar»).', 'Pon la opción segura como primer foco.'],
  },
  'aspect-ratio': {
    use: 'Reserva una caja con proporción fija para medios o vistas previas.',
    rules: ['Úsalo para evitar saltos de layout mientras cargan las imágenes.'],
  },
  avatar: {
    use: 'Representa a una persona o entidad con una imagen, o con iniciales como alternativa.',
    rules: ['Indica siempre un nombre para que las iniciales y el nombre accesible sean correctos.'],
  },
  badge: {
    use: 'Etiqueta un estado o un recuento junto a otro contenido.',
    instead: [['button', 'el elemento es interactivo.']],
    rules: ['Una o dos palabras. No dependas solo del color para transmitir significado.'],
  },
  breadcrumbs: {
    use: 'Muestra dónde está la página actual dentro de una jerarquía y permite subir de nivel.',
    instead: [['tabs', 'cambias de vista dentro del mismo nivel.']],
    rules: ['Marca el último elemento como actual. No repitas el título de la página como enlace.'],
  },
  button: {
    use: 'Dispara una acción en el contexto actual.',
    instead: [
      ['link', 'la acción navega a otra página.'],
      ['icon-button', 'el control es un icono sin etiqueta visible.'],
    ],
    rules: ['Empieza con un verbo. Un solo botón primario por vista.', 'Usa `loading` en lugar de cambiar la etiqueta.'],
  },
  'button-group': {
    use: 'Agrupa botones relacionados para que se lean y dimensionen como un solo control.',
    rules: ['Dale un nombre accesible al grupo cuando sus botones sean interruptores.'],
  },
  card: {
    use: 'Contiene una pieza autónoma de contenido relacionado y sus acciones.',
    rules: ['No anides tarjetas. Una acción principal por tarjeta.'],
  },
  checkbox: {
    use: 'Permite activar o desactivar una o varias opciones, o aceptar algo.',
    instead: [
      ['switch', 'el cambio surte efecto de inmediato.'],
      ['radio-group', 'solo se puede elegir exactamente una opción.'],
    ],
    rules: ['La etiqueta enuncia la opción en positivo. Usa el estado indeterminado solo en selecciones padre.'],
  },
  combobox: {
    use: 'Elige de una lista larga mientras se escribe para filtrarla.',
    instead: [['select', 'la lista es corta y no hace falta filtrar.']],
    rules: ['Define siempre una etiqueta. Muestra un estado vacío claro cuando nada coincide.'],
  },
  container: {
    use: 'Limita el ancho del contenido y añade márgenes de página.',
    rules: ['Usa el tamaño más estrecho que mantenga las líneas legibles.'],
  },
  dialog: {
    use: 'Centra la atención en una tarea o contenido que necesita su propio espacio.',
    instead: [
      ['popover', 'el contenido es pequeño y depende de su disparador.'],
      ['alert-dialog', 'la persona debe confirmar una acción arriesgada.'],
    ],
    rules: ['Incluye siempre un título. Ofrece una forma visible de cerrar.'],
  },
  divider: {
    use: 'Separa grupos de contenido de forma visual y semántica.',
    rules: ['Prefiere primero el espaciado; añade un divisor solo cuando la agrupación no sea clara.'],
  },
  'dropdown-menu': {
    use: 'Ofrece una lista de acciones desde un único disparador.',
    instead: [['select', 'la elección fija un valor en un formulario.']],
    rules: ['Los elementos son acciones, no navegación. Pon los destructivos al final.'],
  },
  'empty-state': {
    use: 'Explica por qué no hay nada que mostrar y qué hacer al respecto.',
    rules: ['Di qué falta y ofrece el siguiente paso.'],
  },
  field: {
    use: 'Conecta una etiqueta, una descripción y un error con un control de formulario.',
    rules: ['Todo control necesita etiqueta. Redacta los errores como cómo corregirlos, no solo qué falló.'],
  },
  grid: {
    use: 'Distribuye elementos en columnas iguales.',
    instead: [['stack', 'los elementos fluyen en una sola fila o columna.']],
  },
  'icon-button': {
    use: 'Dispara una acción con un icono cuando falta espacio.',
    instead: [['button', 'una etiqueta de texto cabe y aclara la acción.']],
    rules: ['`label` es obligatorio: es el nombre accesible.'],
  },
  input: {
    use: 'Recoge una línea de texto libre.',
    instead: [['textarea', 'la respuesta necesita varias líneas.']],
    rules: ['Combínalo con un Field. Un placeholder no es una etiqueta.'],
  },
  link: {
    use: 'Navega a otra página o lugar.',
    instead: [['button', 'la acción cambia algo en el mismo sitio.']],
    rules: ['Haz que el texto describa el destino. Marca los enlaces externos.'],
  },
  list: {
    use: 'Presenta una serie de elementos relacionados.',
    instead: [['table', 'cada elemento tiene varios atributos que comparar.']],
  },
  'native-select': {
    use: 'Elige una opción con el control de la plataforma.',
    instead: [['select', 'necesitas un renderizado de opciones personalizado o búsqueda.']],
    rules: ['Ideal en dispositivos táctiles y para listas cortas y sencillas.'],
  },
  pagination: {
    use: 'Recorre por páginas un conjunto grande de resultados.',
    rules: ['Dale un nombre accesible. Mantén predecible el tamaño de página.'],
  },
  popover: {
    use: 'Muestra contenido no modal anclado a su disparador.',
    instead: [
      ['tooltip', 'el contenido es una pista corta y no interactiva.'],
      ['dialog', 'la tarea requiere todo el foco de la pantalla.'],
    ],
  },
  progress: {
    use: 'Muestra cuánto ha avanzado una operación de duración conocida o desconocida.',
    instead: [['spinner', 'solo necesitas indicar que algo está cargando.']],
    rules: ['Define siempre una etiqueta accesible de lo que avanza.'],
  },
  'radio-group': {
    use: 'Elige exactamente una opción de una lista corta.',
    instead: [
      ['select', 'hay más de unas seis opciones.'],
      ['checkbox', 'se pueden elegir varias opciones.'],
    ],
  },
  select: {
    use: 'Elige un valor de una lista de opciones.',
    instead: [
      ['radio-group', 'hay pocas opciones y conviene verlas todas.'],
      ['combobox', 'la lista es larga y se debe poder buscar.'],
    ],
  },
  skeleton: {
    use: 'Mantiene la forma del contenido que todavía está cargando.',
    rules: ['Iguala el tamaño del contenido real para evitar saltos de layout.'],
  },
  slider: {
    use: 'Elige un número dentro de un rango arrastrando.',
    rules: ['Muestra el valor actual. Ofrece un campo cuando importe la precisión.'],
  },
  spinner: {
    use: 'Indica que algo breve está cargando.',
    instead: [['progress', 'se conoce la duración o la cantidad.']],
  },
  stack: {
    use: 'Espacia elementos de forma uniforme en una sola fila o columna.',
    instead: [['grid', 'necesitas una estructura de columnas.']],
  },
  switch: {
    use: 'Activa o desactiva un ajuste con efecto inmediato.',
    instead: [['checkbox', 'el cambio se aplica después, al enviar.']],
    rules: ['La etiqueta nombra el ajuste, no el estado.'],
  },
  table: {
    use: 'Compara datos estructurados entre filas y columnas.',
    instead: [['list', 'los elementos tienen un único atributo.']],
    rules: ['Añade siempre un título (caption). Alinea los números a la derecha.'],
  },
  tabs: {
    use: 'Cambia entre vistas pares del mismo contexto.',
    instead: [['accordion', 'puede interesar tener varias secciones abiertas a la vez.']],
    rules: ['Etiquetas de una o dos palabras. No anides pestañas.'],
  },
  textarea: {
    use: 'Recoge texto libre de varias líneas.',
    instead: [['input', 'basta con una sola línea.']],
  },
  toast: {
    use: 'Confirma un resultado brevemente sin interrumpir.',
    instead: [['alert', 'el mensaje debe permanecer hasta que se actúe.']],
    rules: ['No pongas en un toast la única copia de información importante.'],
  },
  'toggle-button': {
    use: 'Activa o desactiva un estado desde un botón, como negrita o silenciar.',
    instead: [['switch', 'es un ajuste de un formulario.']],
  },
  tooltip: {
    use: 'Nombra o describe brevemente un control al pasar el cursor o enfocarlo.',
    instead: [['popover', 'el contenido es interactivo o más largo.']],
    rules: ['Nunca escondas información esencial en un tooltip.'],
  },
  'visually-hidden': {
    use: 'Aporta texto para tecnologías de apoyo sin mostrarlo.',
    rules: ['Úsalo para nombrar controles solo con icono y dar contexto a enlaces repetidos.'],
  },
};
