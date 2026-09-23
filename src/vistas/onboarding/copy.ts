export const COPY = {
  paso0: {
    titulo: '¿Cómo vas a usar Orvalya?',
    subtitulo: 'Elegí tu perfil. Podés cambiarlo después.',
    prestador: {
      titulo: 'Soy independiente / mono / unipersonal',
      descripcion: 'Trabajo por mi cuenta: monotributista, unipersonal, freelancer o pyme chica.',
      badge: 'Lo más común',
    },
    contratante: {
      titulo: 'Necesito contratar servicios',
      descripcion: 'Soy empresa o pyme y quiero gestionar prestadores con papeles al día.',
    },
  },
  paso1: {
    titulo: '¿Qué servicios ofrecés?',
    subtitulo: 'Empezá por los más buscados. Marcá uno o varios; el resto es opcional.',
    destacados: 'Más buscados',
    otros: 'Otros servicios',
    errorSinSeleccion: 'Elegí al menos un servicio para continuar.',
  },
  paso2: {
    titulo: '¿Cómo te encontramos?',
    subtitulo: 'Solo lo esencial. Lo demás lo completás después en tu perfil.',
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
        error: 'Indicá en qué zona podés trabajar.',
      },
      telefono: {
        label: 'Teléfono / celular',
        placeholder: '099123456',
      },
      whatsapp: {
        label: 'WhatsApp (para avisos de trabajo)',
        placeholder: 'Ej: 099123456',
        igualTelefono: 'WhatsApp es el mismo número',
        errorRequerido: 'El WhatsApp es obligatorio.',
        errorFormato: 'Ingresá entre 8 y 15 dígitos, solo números.',
      },
      nacimiento: {
        label: 'Fecha de nacimiento (opcional)',
        ayuda: 'Solo usamos el rango de edad en tu perfil público.',
      },
      formacion: {
        label: 'Formación (opcional)',
        ayuda: 'Elegí de la lista. Podés ampliar después.',
      },
      rangoEdad: {
        label: 'Rango de edad (opcional)',
        ayuda: 'Solo se muestra de forma discreta en tu perfil.',
      },
    },
  },
  paso3: {
    titulo: '¿Cuál es tu situación?',
    subtitulo: 'Todos son bienvenidos. Esto nos ayuda a mostrarte las oportunidades que te corresponden.',
    nota: '✓ Podés aparecer en búsquedas desde hoy. Te acompañamos en el camino a la formalización.',
  },
  errores: {
    guardado: 'No pudimos guardar tu perfil. Revisá tu conexión e intentá de nuevo.',
  },
  botones: {
    siguiente: 'Siguiente',
    comenzar: 'Comenzar',
    volver: '← Atrás',
    revisarPasos: '← Revisar pasos anteriores',
  },
}
