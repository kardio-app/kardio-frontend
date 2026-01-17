/**
 * Logger seguro para produção
 * Remove informações sensíveis e só loga em desenvolvimento
 */

const isDevelopment = import.meta.env.DEV

/**
 * Log seguro - só funciona em desenvolvimento
 */
export const safeLog = (...args) => {
  if (isDevelopment) {
    console.log(...args)
  }
}

/**
 * Error log seguro - não expõe dados sensíveis
 */
export const safeError = (message, error = null) => {
  if (isDevelopment) {
    if (error) {
      console.error(message, error)
    } else {
      console.error(message)
    }
  }
  // Em produção, apenas logar mensagem genérica sem detalhes
  // Não logar stack traces ou dados sensíveis
}

/**
 * Warn log seguro
 */
export const safeWarn = (message, data = null) => {
  if (isDevelopment) {
    if (data) {
      console.warn(message, data)
    } else {
      console.warn(message)
    }
  }
}
