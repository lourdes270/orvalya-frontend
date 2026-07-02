import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const FIXTURES_DIR = path.join(__dirname, '..', 'fixtures')

export const VALID_PDF = path.join(FIXTURES_DIR, 'test-document.pdf')
export const VALID_JPG = path.join(FIXTURES_DIR, 'test-image.jpg')
export const INVALID_EXE = path.join(FIXTURES_DIR, 'fake-image.exe')
export const OVERSIZE_PDF = path.join(FIXTURES_DIR, 'oversize.pdf')

function ensureFixtures(): void {
  fs.mkdirSync(FIXTURES_DIR, { recursive: true })

  if (!fs.existsSync(VALID_PDF)) {
    const pdf = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 200 200]>>endobj
xref
0 4
trailer<</Size 4/Root 1 0 R>>
startxref
100
%%EOF`
    fs.writeFileSync(VALID_PDF, pdf)
  }

  if (!fs.existsSync(VALID_JPG)) {
    const jpeg = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
      0x00, 0xff, 0xd9,
    ])
    fs.writeFileSync(VALID_JPG, jpeg)
  }

  if (!fs.existsSync(INVALID_EXE)) {
    const exe = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00])
    fs.writeFileSync(INVALID_EXE, exe)
  }

  if (!fs.existsSync(OVERSIZE_PDF)) {
    const header = Buffer.from('%PDF-1.4\n')
    const body = Buffer.alloc(5 * 1024 * 1024 + 1, 0x20)
    fs.writeFileSync(OVERSIZE_PDF, Buffer.concat([header, body]))
  }
}

ensureFixtures()
