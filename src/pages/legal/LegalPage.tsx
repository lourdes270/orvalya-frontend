import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link } from 'react-router-dom'
import { legalMarkdownComponents, legalPageLayout } from './legalPageStyles'

interface LegalPageProps {
  markdownContent: string
  versionLabel: string
}

export default function LegalPage({ markdownContent, versionLabel }: LegalPageProps) {
  return (
    <div style={legalPageLayout.page}>
      <header style={legalPageLayout.stickyHeader}>
        <Link to="/" style={legalPageLayout.backLink}>← Volver</Link>
      </header>
      <article style={legalPageLayout.article}>
        <div style={legalPageLayout.markdown}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={legalMarkdownComponents}>
            {markdownContent}
          </ReactMarkdown>
        </div>
        <p style={legalPageLayout.versionFooter}>
          Versión vigente: {versionLabel}
        </p>
      </article>
    </div>
  )
}
