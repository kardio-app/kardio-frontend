/**
 * Corrige problemas de encoding: texto UTF-8 interpretado como ISO-8859-1
 * Padrão: "vÃ­deo" deveria ser "vídeo", "pÃ¡gina" deveria ser "página"
 */
export const fixEncoding = (text) => {
  if (!text || typeof text !== 'string') return text
  
  try {
    // Mapeamento de sequências de dois caracteres mal codificados para os corretos
    // Estes são os padrões mais comuns quando UTF-8 é interpretado como ISO-8859-1
    const encodingMap = {
      '\u00C3\u00A1': 'á', // Ã¡
      '\u00C3\u00A9': 'é', // Ã©
      '\u00C3\u00AD': 'í', // Ã­
      '\u00C3\u00B3': 'ó', // Ã³
      '\u00C3\u00BA': 'ú', // Ãº
      '\u00C3\u00A3': 'ã', // Ã£
      '\u00C3\u00B5': 'õ', // Ãµ
      '\u00C3\u00A7': 'ç', // Ã§
      '\u00C3\u0080': 'À', // Ã€
      '\u00C3\u0089': 'É', // Ã‰
      '\u00C3\u008D': 'Í', // Ã
      '\u00C3\u0093': 'Ó', // Ã"
      '\u00C3\u009A': 'Ú', // Ãš
      '\u00C3\u0083': 'Ã', // Ãƒ
      '\u00C3\u0095': 'Õ', // Ã•
      '\u00C3\u0087': 'Ç', // Ã'
      '\u00C3\u00A2': 'â', // Ã¢
      '\u00C3\u00AA': 'ê', // Ãª
      '\u00C3\u00B4': 'ô', // Ã´
      '\u00C3\u0082': 'Â', // Ã€
      '\u00C3\u008A': 'Ê', // ÃŠ
      '\u00C3\u0094': 'Ô', // Ã"
      '\u00C3\u00BC': 'ü', // Ã¼
      '\u00C3\u00BF': 'ÿ', // Ã¿
      '\u00C3\u0081': 'Á', // Ã
      '\u00C3\u00B1': 'ñ', // Ã±
      '\u00C3\u0091': 'Ñ'  // Ã
    }
    
    // Aplicar substituições (ordem importa - padrões mais longos primeiro)
    let fixed = text
    const sortedEntries = Object.entries(encodingMap).sort((a, b) => b[0].length - a[0].length)
    for (const [wrong, correct] of sortedEntries) {
      fixed = fixed.replace(new RegExp(wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), correct)
    }
    
    return fixed
  } catch (e) {
    console.error('Erro ao corrigir encoding:', e)
    return text
  }
}

