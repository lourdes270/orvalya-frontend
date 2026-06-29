import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link } from 'react-router-dom'
import { legalMarkdownComponents, legalPageLayout } from './legalPageStyles'

interface LegalPageProps {
  markdownContent: string
  versionLabel: string
  preContent?: React.ReactNode
}

export default function LegalPage({ markdownContent, versionLabel, preContent }: LegalPageProps) {
  return (
    <div style={legalPageLayout.page}>
      <header style={legalPageLayout.stickyHeader}>
        <Link to="/" style={legalPageLayout.backLink}>← Volver</Link>
      </header>
      <article style={legalPageLayout.article}>
        <div style={legalPageLayout.markdown}>
          {preContent}
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
