import { useEffect } from 'react'

type PageMetaProps = {
  title: string
  description: string
}

export function PageMeta({ title, description }: PageMetaProps) {
  useEffect(() => {
    document.title = title

    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = description

    return () => {
      document.title = 'Orvalya'
      if (meta) meta.content = ''
    }
  }, [title, description])

  return null
}
