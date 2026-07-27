import Link from 'next/link'
import { POR_QUE_ORVALYA } from '../../src/vistas/landing/landingContent'

/** Sección oscura de cierre, igual en portada, quiénes somos y cómo funciona. */
export function CierreCta({ conVolver = false }: { conVolver?: boolean }) {
  return (
    <section className="lp-cierre">
      <div className="lp-cierre-inner">
        <h2>¿Tercerizás? Sacate el papeleo de encima.</h2>

        <Link className="lp-btn lp-btn--teal" href="/contacto/contratante">
          Quiero el servicio
        </Link>

        <p>
          <Link href="/auth">
            ¿Sos prestador? Creá tu perfil bonificado en esta etapa de lanzamiento
          </Link>
        </p>

        <p style={{ color: 'rgba(255,255,255,0.75)' }}>
          Respondemos en el día · Sin permanencia
        </p>

        {conVolver && (
          <p style={{ marginTop: 28, fontSize: 15 }}>
            <Link href="/">← Volver al inicio</Link>
          </p>
        )}
      </div>
    </section>
  )
}

export function PorQueOrvalya() {
  return (
    <ul className="lp-tarjetas">
      {POR_QUE_ORVALYA.map(item => (
        <li className="lp-tarjeta" key={item.title}>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </li>
      ))}
    </ul>
  )
}

export function Pasos({ pasos }: { pasos: readonly { title: string; text?: string }[] }) {
  return (
    <ol className="lp-pasos">
      {pasos.map((paso, i) => (
        <li className="lp-paso" key={paso.title}>
          <span className="lp-paso-num" aria-hidden>
            {i + 1}
          </span>
          <div style={{ flex: 1 }}>
            <p className="lp-paso-titulo">{paso.title}</p>
            {paso.text && <p className="lp-paso-texto">{paso.text}</p>}
          </div>
        </li>
      ))}
    </ol>
  )
}
