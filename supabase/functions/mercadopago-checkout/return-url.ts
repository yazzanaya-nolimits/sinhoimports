const STORE_ORIGIN = 'https://sinhoimports.com.br'

// Checkout Pro requires publicly accessible HTTPS return URLs, not local preview addresses.
export function checkoutReturnOrigin(value: string | null): string {
  try {
    const url = new URL(value ?? '')
    if (url.protocol === 'https:' && (
      url.hostname === 'sinhoimports.com.br' ||
      url.hostname === 'www.sinhoimports.com.br' ||
      url.hostname === 'sinhoimports.lovable.app'
    )) return url.origin
  } catch {
    // Missing or malformed Origin falls back to the store's public domain.
  }
  return STORE_ORIGIN
}