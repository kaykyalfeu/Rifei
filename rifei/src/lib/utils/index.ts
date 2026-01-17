import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isAfter, isBefore, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ===========================================
// CLASSES CSS
// ===========================================

/**
 * Combina classes CSS com suporte a Tailwind merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ===========================================
// FORMATAÇÃO DE DATAS
// ===========================================

/**
 * Formata uma data para exibição
 */
export function formatarData(data: string | Date, formato: string = 'dd/MM/yyyy'): string {
  return format(new Date(data), formato, { locale: ptBR })
}

/**
 * Formata uma data para exibição completa
 */
export function formatarDataCompleta(data: string | Date): string {
  return format(new Date(data), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
}

/**
 * Retorna tempo relativo (ex: "há 2 horas")
 */
export function tempoRelativo(data: string | Date): string {
  return formatDistanceToNow(new Date(data), { addSuffix: true, locale: ptBR })
}

/**
 * Calcula dias restantes até uma data
 */
export function diasRestantes(dataFim: string | Date): number {
  return differenceInDays(new Date(dataFim), new Date())
}

/**
 * Verifica se uma data já passou
 */
export function dataExpirada(data: string | Date): boolean {
  return isBefore(new Date(data), new Date())
}

/**
 * Verifica se uma data ainda não chegou
 */
export function dataFutura(data: string | Date): boolean {
  return isAfter(new Date(data), new Date())
}

// ===========================================
// FORMATAÇÃO DE NÚMEROS E MOEDA
// ===========================================

/**
 * Formata um número como moeda brasileira
 */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

/**
 * Formata um número com separador de milhares
 */
export function formatarNumero(numero: number): string {
  return new Intl.NumberFormat('pt-BR').format(numero)
}

/**
 * Formata porcentagem
 */
export function formatarPorcentagem(valor: number, casasDecimais: number = 0): string {
  return `${valor.toFixed(casasDecimais)}%`
}

/**
 * Formata número de forma compacta (1K, 1M, etc)
 */
export function formatarNumeroCompacto(numero: number): string {
  return new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(numero)
}

// ===========================================
// MANIPULAÇÃO DE STRINGS
// ===========================================

/**
 * Gera um slug a partir de um texto
 */
export function gerarSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .trim()
}

/**
 * Trunca um texto com reticências
 */
export function truncar(texto: string, tamanho: number): string {
  if (texto.length <= tamanho) return texto
  return texto.slice(0, tamanho).trim() + '...'
}

/**
 * Capitaliza a primeira letra de cada palavra
 */
export function capitalizar(texto: string): string {
  return texto
    .toLowerCase()
    .split(' ')
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(' ')
}

/**
 * Formata CPF (XXX.XXX.XXX-XX)
 */
export function formatarCPF(cpf: string): string {
  const numeros = cpf.replace(/\D/g, '')
  return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

/**
 * Formata telefone ((XX) XXXXX-XXXX)
 */
export function formatarTelefone(telefone: string): string {
  const numeros = telefone.replace(/\D/g, '')
  if (numeros.length === 11) {
    return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
}

// ===========================================
// VALIDAÇÕES
// ===========================================

/**
 * Valida email
 */
export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * Valida CPF
 */
export function validarCPF(cpf: string): boolean {
  const numeros = cpf.replace(/\D/g, '')
  
  if (numeros.length !== 11) return false
  if (/^(\d)\1+$/.test(numeros)) return false // Todos dígitos iguais
  
  // Validação dos dígitos verificadores
  let soma = 0
  for (let i = 0; i < 9; i++) {
    soma += parseInt(numeros.charAt(i)) * (10 - i)
  }
  let resto = 11 - (soma % 11)
  let digitoVerificador1 = resto > 9 ? 0 : resto
  
  soma = 0
  for (let i = 0; i < 10; i++) {
    soma += parseInt(numeros.charAt(i)) * (11 - i)
  }
  resto = 11 - (soma % 11)
  let digitoVerificador2 = resto > 9 ? 0 : resto
  
  return (
    digitoVerificador1 === parseInt(numeros.charAt(9)) &&
    digitoVerificador2 === parseInt(numeros.charAt(10))
  )
}

/**
 * Valida nome de usuário (@username)
 */
export function validarNomeUsuario(nomeUsuario: string): boolean {
  const regex = /^[a-z0-9_]{3,30}$/
  return regex.test(nomeUsuario)
}

// ===========================================
// UTILITÁRIOS GERAIS
// ===========================================

/**
 * Gera um ID único
 */
export function gerarId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
}

/**
 * Aguarda um tempo em ms (útil para debounce, loading, etc)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Debounce de função
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), wait)
  }
}

/**
 * Copia texto para a área de transferência
 */
export async function copiarParaClipboard(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto)
    return true
  } catch {
    return false
  }
}

/**
 * Gera uma cor aleatória em hex
 */
export function gerarCorAleatoria(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
}

/**
 * Calcula o XP necessário para o próximo nível
 */
export function xpParaProximoNivel(nivelAtual: number): number {
  const xpPorNivel: Record<number, number> = {
    1: 100,
    2: 300,
    3: 600,
    4: 1000,
    5: Infinity, // Nível máximo
  }
  return xpPorNivel[nivelAtual] || Infinity
}

/**
 * Calcula o progresso para o próximo nível
 */
export function progressoNivel(xpAtual: number, nivelAtual: number): number {
  const xpNecessario = xpParaProximoNivel(nivelAtual)
  if (xpNecessario === Infinity) return 100
  
  const xpNivelAnterior = nivelAtual > 1 ? xpParaProximoNivel(nivelAtual - 1) : 0
  const xpNesteNivel = xpAtual - xpNivelAnterior
  const xpTotalNivel = xpNecessario - xpNivelAnterior
  
  return Math.min(100, (xpNesteNivel / xpTotalNivel) * 100)
}

/**
 * Retorna a cor de raridade
 */
export function corRaridade(raridade: string): string {
  const cores: Record<string, string> = {
    comum: '#6B7280',
    incomum: '#10B981',
    raro: '#3B82F6',
    epico: '#8B5CF6',
    lendario: '#F59E0B',
  }
  return cores[raridade] || cores.comum
}

/**
 * Gera números aleatórios únicos
 */
export function gerarNumerosAleatorios(quantidade: number, maximo: number, minimo: number = 1): number[] {
  const numeros = new Set<number>()
  
  while (numeros.size < quantidade) {
    const numero = Math.floor(Math.random() * (maximo - minimo + 1)) + minimo
    numeros.add(numero)
  }
  
  return Array.from(numeros).sort((a, b) => a - b)
}

// ===========================================
// CONSTANTES
// ===========================================

export const TAXA_PLATAFORMA = 0.05 // 5%
export const TEMPO_RESERVA_NUMEROS = 15 * 60 * 1000 // 15 minutos em ms
export const MAX_NUMEROS_POR_COMPRA = 100
export const MIN_PRECO_NUMERO = 0.50
export const MAX_TOTAL_NUMEROS = 100000
export const MIN_TOTAL_NUMEROS = 10
