export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

export const ALLOWED_UPLOAD_MIMES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

export type AllowedUploadMime = (typeof ALLOWED_UPLOAD_MIMES)[number]

const MIME_LABELS: Record<AllowedUploadMime, string> = {
  'application/pdf': 'PDF',
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WEBP',
}

export const UPLOAD_REJECTION_MESSAGE =
  'El archivo debe ser PDF, JPG, PNG o WEBP y no superar los 5 MB.'

type FileValidationResult =
  | { ok: true; mime: AllowedUploadMime }
  | { ok: false; message: string }

function matchesMagicBytes(buffer: Uint8Array): AllowedUploadMime | null {
  if (
    buffer.length >= 4
    && buffer[0] === 0x25
    && buffer[1] === 0x50
    && buffer[2] === 0x44
    && buffer[3] === 0x46
  ) {
    return 'application/pdf'
  }

  if (
    buffer.length >= 3
    && buffer[0] === 0xff
    && buffer[1] === 0xd8
    && buffer[2] === 0xff
  ) {
    return 'image/jpeg'
  }

  if (
    buffer.length >= 8
    && buffer[0] === 0x89
    && buffer[1] === 0x50
    && buffer[2] === 0x4e
    && buffer[3] === 0x47
    && buffer[4] === 0x0d
    && buffer[5] === 0x0a
    && buffer[6] === 0x1a
    && buffer[7] === 0x0a
  ) {
    return 'image/png'
  }

  if (
    buffer.length >= 12
    && buffer[0] === 0x52
    && buffer[1] === 0x49
    && buffer[2] === 0x46
    && buffer[3] === 0x46
    && buffer[8] === 0x57
    && buffer[9] === 0x45
    && buffer[10] === 0x42
    && buffer[11] === 0x50
  ) {
    return 'image/webp'
  }

  return null
}

async function readFileHeader(file: Blob, bytes = 16): Promise<Uint8Array> {
  const slice = file.slice(0, bytes)
  const buffer = await slice.arrayBuffer()
  return new Uint8Array(buffer)
}

export async function validateUploadFile(file: File): Promise<FileValidationResult> {
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, message: UPLOAD_REJECTION_MESSAGE }
  }

  const header = await readFileHeader(file)
  const mime = matchesMagicBytes(header)
  if (!mime) {
    return { ok: false, message: UPLOAD_REJECTION_MESSAGE }
  }

  return { ok: true, mime }
}

export async function validateImageUpload(file: File): Promise<FileValidationResult> {
  const result = await validateUploadFile(file)
  if (!result.ok) return result
  if (result.mime === 'application/pdf') {
    return { ok: false, message: UPLOAD_REJECTION_MESSAGE }
  }
  return result
}

export function mimeLabel(mime: AllowedUploadMime): string {
  return MIME_LABELS[mime]
}
