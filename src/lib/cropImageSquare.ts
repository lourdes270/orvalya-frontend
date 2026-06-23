export async function cropImageSquare(file: File, size = 512): Promise<Blob> {
  const url = URL.createObjectURL(file)
  try {
    const img = await loadImage(url)
    const side = Math.min(img.width, img.height)
    const sx = (img.width - side) / 2
    const sy = (img.height - side) / 2
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas no disponible')
    ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size)
    const blob = await canvasToBlob(canvas, 'image/jpeg', 0.88)
    return blob
  } finally {
    URL.revokeObjectURL(url)
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('No se pudo cargar la imagen'))
    img.src = src
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('No se pudo procesar la imagen'))), type, quality)
  })
}
