/**
 * Configurações da aplicação
 * Incluído appKey e http que são lidos pelo framework (evita erros no boot).
 */
export default {
  appKey: process.env.APP_KEY || '',
  http: {
    allowMethodSpoofing: false,
    trustProxy: false,
    forceContentNegotiationTo: 'application/json',
  },
}
