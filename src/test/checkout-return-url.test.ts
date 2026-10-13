import { describe, expect, it } from 'vitest';
import { checkoutReturnOrigin } from '../../supabase/functions/mercadopago-checkout/return-url';

describe('Mercado Pago return address', () => {
  it('uses the public store address for local preview', () => {
    expect(checkoutReturnOrigin('http://localhost:8080')).toBe('https://sinhoimports.com.br');
  });
  it('does not accept arbitrary caller domains', () => {
    expect(checkoutReturnOrigin('https://other-store.example')).toBe('https://sinhoimports.com.br');
  });
  it('preserves the published store origin', () => {
    expect(checkoutReturnOrigin('https://sinhoimports.lovable.app')).toBe('https://sinhoimports.lovable.app');
  });
});