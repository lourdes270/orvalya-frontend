export const COPY = {
  paso0: {
    titulo: '¿Cómo vas a usar Orvalya?',
    subtitulo: 'Elegí tu perfil. Podés cambiarlo después.',
    prestador: {
      titulo: 'Ofrezco servicios',
      descripcion: 'Trabajo de forma independiente o tengo mi propio negocio.'
    },
    contratante: {
      titulo: 'Necesito contratar servicios',
      descripcion: 'Soy empresa y quiero gestionar contratistas con respaldo legal.'
    }
  },
  paso1: {
    titulo: '¿Qué servicios ofrecés?',
    subtitulo: 'Elegí uno o varios. Si hacés muchas cosas, marcalas todas.',
    errorSinSeleccion: 'Elegí al menos un servicio para continuar.'
  },
  paso2: {
    titulo: '¿Cómo te encontramos?',
    subtitulo: 'Esta info aparece en tu perfil. Podés cambiarla después.',
    campos: {
      nombre: {
        label: 'Nombre',
        placeholder: 'Ej: María',
        error: 'El nombre es obligatorio.',
      },
      apellido: {
        label: 'Apellido',
        placeholder: 'Ej: García',
        error: 'El apellido es obligatorio.',
      },
      zona: {
        label: '¿En qué zona podés trabajar?',
        placeholder: 'Ej: Montevideo, Canelones, todo el país',
        ayuda: 'No importa si todavía no estás trabajando — poné dónde podrías hacerlo.',
        error: 'Indicá en qué zona podés trabajar.'
      },
      whatsapp: {
        label: 'WhatsApp (para recibir avisos de trabajo)',
        placeholder: 'Ej: 099123456',
        errorRequerido: 'El WhatsApp es obligatorio.',
        errorFormato: 'Ingresá entre 8 y 15 dígitos, solo números.',
      },
      rangoEdad: {
        label: 'Rango de edad (opcional)',
        ayuda: 'Solo se muestra de forma discreta en tu perfil.',
      }
    }
  },
  paso3: {
    titulo: '¿Cuál es tu situación?',
    subtitulo: 'Todos son bienvenidos. Esto nos ayuda a mostrarte las oportunidades que te corresponden.',
    nota: '✓ Podés aparecer en búsquedas desde hoy. Te acompañamos en el camino a la formalización.'
  },
  errores: {
    guardado: 'No pudimos guardar tu perfil. Revisá tu conexión e intentá de nuevo.'
  },
  botones: {
    siguiente: 'Siguiente',
    comenzar: 'Comenzar',
    volver: '←'
  }
}
