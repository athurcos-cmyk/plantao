/**
 * Gera icon-192.png e icon-512.png com design de caderneta de enfermagem
 * Sem dependências externas — usa apenas zlib nativo do Node.js
 */
const zlib = require('zlib')
const fs   = require('fs')
const path = require('path')

// ── CRC32 ──────────────────────────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()

function crc32(buf) {
  let c = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ CRC_TABLE[(c ^ buf[i]) & 0xFF]
  return (c ^ 0xFFFFFFFF) >>> 0
}

function chunk(type, data) {
  const lenBuf  = Buffer.alloc(4); lenBuf.writeUInt32BE(data.length)
  const typeBuf = Buffer.from(type)
  const crcBuf  = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf])
}

function encodePNG(width, height, rgba) {
  const sig  = Buffer.from([137,80,78,71,13,10,26,10])

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4)
  ihdr[8]=8; ihdr[9]=6 // 8-bit RGBA

  // scanlines com filter byte 0
  const raw = Buffer.alloc(height * (1 + width * 4))
  for (let y = 0; y < height; y++) {
    raw[y*(1+width*4)] = 0
    for (let x = 0; x < width; x++) {
      const src = (y*width+x)*4
      const dst = y*(1+width*4)+1+x*4
      raw[dst]   = rgba[src]
      raw[dst+1] = rgba[src+1]
      raw[dst+2] = rgba[src+2]
      raw[dst+3] = rgba[src+3]
    }
  }

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ])
}

// ── Primitivas de desenho ──────────────────────────────────────────────────
function makeCanvas(size) {
  const buf = new Uint8Array(size * size * 4)

  function px(x, y, r, g, b, a = 255) {
    x = Math.round(x); y = Math.round(y)
    if (x < 0 || x >= size || y < 0 || y >= size) return
    const i = (y*size+x)*4
    // alpha blend sobre o que já está
    const aa = a / 255
    buf[i]   = Math.round(buf[i]   * (1-aa) + r * aa)
    buf[i+1] = Math.round(buf[i+1] * (1-aa) + g * aa)
    buf[i+2] = Math.round(buf[i+2] * (1-aa) + b * aa)
    buf[i+3] = Math.min(255, buf[i+3] + a)
  }

  function rect(x1, y1, x2, y2, r, g, b, a = 255) {
    for (let y = Math.round(y1); y <= Math.round(y2); y++)
      for (let x = Math.round(x1); x <= Math.round(x2); x++)
        px(x, y, r, g, b, a)
  }

  // Retângulo com cantos arredondados
  function roundRect(x1, y1, x2, y2, radius, r, g, b, a = 255) {
    for (let y = Math.round(y1); y <= Math.round(y2); y++) {
      for (let x = Math.round(x1); x <= Math.round(x2); x++) {
        // Verifica se está dentro dos cantos arredondados
        let inside = true
        const corners = [
          [x1+radius, y1+radius], [x2-radius, y1+radius],
          [x1+radius, y2-radius], [x2-radius, y2-radius]
        ]
        if (x < x1+radius && y < y1+radius) {
          const dx = x-(x1+radius), dy = y-(y1+radius)
          inside = dx*dx+dy*dy <= radius*radius
        } else if (x > x2-radius && y < y1+radius) {
          const dx = x-(x2-radius), dy = y-(y1+radius)
          inside = dx*dx+dy*dy <= radius*radius
        } else if (x < x1+radius && y > y2-radius) {
          const dx = x-(x1+radius), dy = y-(y2-radius)
          inside = dx*dx+dy*dy <= radius*radius
        } else if (x > x2-radius && y > y2-radius) {
          const dx = x-(x2-radius), dy = y-(y2-radius)
          inside = dx*dx+dy*dy <= radius*radius
        }
        if (inside) px(x, y, r, g, b, a)
      }
    }
  }

  // Círculo preenchido
  function circle(cx, cy, radius, r, g, b, a = 255) {
    for (let y = Math.round(cy-radius); y <= Math.round(cy+radius); y++)
      for (let x = Math.round(cx-radius); x <= Math.round(cx+radius); x++) {
        const dx = x-cx, dy = y-cy
        if (dx*dx+dy*dy <= radius*radius) px(x, y, r, g, b, a)
      }
  }

  return { buf, px, rect, roundRect, circle }
}

// ── Desenha caderneta de enfermagem ───────────────────────────────────────
function drawNotebook(size) {
  const c = makeCanvas(size)
  const s = size / 192  // escala

  // Fundo: #0A1628
  c.rect(0, 0, size-1, size-1, 10, 22, 40)

  // Sombra do caderno
  c.roundRect(
    44*s, 32*s, 154*s, 164*s, 8*s,
    0, 0, 0, 80
  )

  // Corpo da caderneta: branco-creme #F2EEE5
  c.roundRect(
    40*s, 28*s, 152*s, 162*s, 8*s,
    242, 238, 229
  )

  // Espinha esquerda: azul #2962FF
  c.roundRect(
    40*s, 28*s, 62*s, 162*s, 8*s,
    41, 98, 255
  )
  // quadrado direito da espinha (sem arredondamento no lado das páginas)
  c.rect(54*s, 28*s, 62*s, 162*s, 41, 98, 255)

  // Argolas da espinha (3 círculos brancos)
  const argolas = [68, 95, 122]
  for (const ay of argolas) {
    circle_argola(c, s, 51*s, ay*s)
  }

  // Linhas nas páginas (6 linhas)
  const lx1 = 72*s, lx2 = 144*s
  const ly0 = 52*s, lsep = 17*s
  for (let i = 0; i < 6; i++) {
    const ly = ly0 + i*lsep
    if (ly < 154*s) {
      c.rect(lx1, ly, lx2, ly + Math.max(1, 1.5*s), 180, 170, 155)
    }
  }

  // Cruz vermelha no topo das páginas (símbolo médico/enfermagem)
  const cx = 108*s, cy = 40*s, arm = 5*s, thick = 3*s
  c.rect(cx-arm, cy-thick, cx+arm, cy+thick, 220, 50, 50)
  c.rect(cx-thick, cy-arm, cx+thick, cy+arm, 220, 50, 50)

  return c.buf
}

function circle_argola(c, s, cx, cy) {
  const r = 5*s
  // Anel branco externo
  c.circle(cx, cy, r, 255, 255, 255)
  // Buraco interno (cor do fundo azul)
  c.circle(cx, cy, r*0.55, 41, 98, 255)
}

// hack: adiciona circle no objeto canvas
function addCircle(canvas) {
  canvas.circle = (cx, cy, radius, r, g, b, a = 255) => {
    for (let y = Math.round(cy-radius); y <= Math.round(cy+radius); y++)
      for (let x = Math.round(cx-radius); x <= Math.round(cx+radius); x++) {
        const dx = x-cx, dy = y-cy
        if (dx*dx+dy*dy <= radius*radius) canvas.px(x, y, r, g, b, a)
      }
  }
}

// Recria drawNotebook com circle disponível
function drawIcon(size) {
  const s = size / 192
  const canvas = makeCanvas(size)
  addCircle(canvas)
  const { buf, px, rect, roundRect, circle } = canvas

  // Fundo
  rect(0, 0, size-1, size-1, 10, 22, 40)

  // Sombra
  roundRect(44*s, 32*s, 154*s, 164*s, 8*s, 0, 0, 0, 70)

  // Páginas: creme
  roundRect(40*s, 28*s, 152*s, 162*s, 8*s, 242, 238, 229)

  // Espinha: azul (com borda arredondada só na esquerda)
  roundRect(40*s, 28*s, 62*s, 162*s, 8*s, 41, 98, 255)
  rect(54*s, 28*s, 62*s, 162*s, 41, 98, 255) // preenche canto direito

  // Linhas nas páginas
  const lx1 = 72*s, lx2 = 144*s
  const ly0 = 54*s, lsep = 18*s
  for (let i = 0; i < 6; i++) {
    const ly = ly0 + i*lsep
    if (ly < 154*s) {
      rect(lx1, ly, lx2, ly + Math.max(1, Math.round(1.5*s)), 180, 168, 150)
    }
  }

  // Argolas
  for (const ay of [68, 95, 122]) {
    circle(51*s, ay*s, 5.5*s, 255, 255, 255)
    circle(51*s, ay*s, 3*s,   41, 98, 255)
  }

  // Cruz médica
  const mcx = 108*s, mcy = 40*s
  const arm = 5*s, thick = Math.max(2, 2.5*s)
  rect(mcx-arm, mcy-thick, mcx+arm, mcy+thick, 215, 45, 45)
  rect(mcx-thick, mcy-arm, mcx+thick, mcy+arm, 215, 45, 45)

  return buf
}

// ── Gera os dois tamanhos ─────────────────────────────────────────────────
const outDir = path.join(__dirname, '..', 'public', 'icons')
fs.mkdirSync(outDir, { recursive: true })

for (const size of [192, 512]) {
  const pixels = drawIcon(size)
  const png    = encodePNG(size, size, pixels)
  const out    = path.join(outDir, `icon-${size}.png`)
  fs.writeFileSync(out, png)
  console.log(`✅ icon-${size}.png gerado (${png.length} bytes)`)
}
