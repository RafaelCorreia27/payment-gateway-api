export default {
  appKey: process.env.APP_KEY || '',
  http: {
    allowMethodSpoofing: false,
    trustProxy: false,
    forceContentNegotiationTo: 'application/json',
  },
}
