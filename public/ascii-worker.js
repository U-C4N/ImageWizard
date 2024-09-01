const ASCII_CHARS = '@%#*+=-:. '

self.onmessage = function(e) {
  const { imageData, width, height, isColor, outputWidth, outputHeight } = e.data
  const ascii = isColor 
    ? convertToColorASCII(imageData, width, height, outputWidth, outputHeight) 
    : convertToGrayscaleASCII(imageData, width, height, outputWidth, outputHeight)
  self.postMessage(ascii)
}

function convertToGrayscaleASCII(imageData, width, height, outputWidth, outputHeight) {
  let result = ''
  const stepX = width / outputWidth
  const stepY = height / outputHeight

  for (let i = 0; i < outputHeight; i++) {
    for (let j = 0; j < outputWidth; j++) {
      const x = Math.floor(j * stepX)
      const y = Math.floor(i * stepY)
      const idx = (y * width + x) * 4
      const avg = (imageData[idx] + imageData[idx + 1] + imageData[idx + 2]) / 3
      const charIdx = Math.floor((avg / 255) * (ASCII_CHARS.length - 1))
      result += ASCII_CHARS[charIdx]
    }
    result += '\n'
  }
  return result
}

function convertToColorASCII(imageData, width, height, outputWidth, outputHeight) {
  let result = ''
  const stepX = width / outputWidth
  const stepY = height / outputHeight

  for (let i = 0; i < outputHeight; i++) {
    for (let j = 0; j < outputWidth; j++) {
      const x = Math.floor(j * stepX)
      const y = Math.floor(i * stepY)
      const idx = (y * width + x) * 4
      const r = imageData[idx]
      const g = imageData[idx + 1]
      const b = imageData[idx + 2]
      const avg = (r + g + b) / 3
      const charIdx = Math.floor((avg / 255) * (ASCII_CHARS.length - 1))
      result += `<span style="color: rgb(${r},${g},${b})">${ASCII_CHARS[charIdx]}</span>`
    }
    result += '\n'
  }
  return result
}