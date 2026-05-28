import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-client@2'

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const body = await req.json()
    console.log('Webhook received:', body)

    const { type, data } = body

    if (type === 'payment') {
      const paymentId = data.id

      // 1. Get token
      const { data: config } = await supabaseClient
        .from('site_config')
        .select('mercado_pago_access_token')
        .eq('id', 1)
        .single()

      if (!config?.mercado_pago_access_token) throw new Error('No token')

      // 2. Fetch payment details from MP
      const mpResp = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { 'Authorization': `Bearer ${config.mercado_pago_access_token}` }
      })
      const paymentData = await mpResp.json()

      if (paymentData.status === 'approved') {
        const preferenceId = paymentData.order?.id || paymentData.preference_id

        // 3. Update Venda
        const { data: venda, error: findError } = await supabaseClient
          .from('vendas')
          .update({ 
            pagamento_status: 'pago',
            status: 'concluido',
            pagamento_metodo: paymentData.payment_method_id
          })
          .eq('checkout_id', preferenceId)
          .select()
          .single()

        if (venda) {
          // 4. Create Financial Entry
          await supabaseClient.from('financeiro_lancamentos').insert({
            tipo: 'receita',
            categoria: 'venda',
            descricao: `Venda MP #${venda.id}`,
            valor: paymentData.transaction_amount,
            forma_pagamento: paymentData.payment_method_id,
            venda_id: venda.id
          })

          // 5. Update Stock
          const { data: prod } = await supabaseClient.from('produtos').select('estoque').eq('id', venda.produto_id).single()
          if (prod) {
            await supabaseClient.from('produtos').update({ estoque: Math.max(0, prod.estoque - venda.quantidade) }).eq('id', venda.produto_id)
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (err) {
    console.error('Webhook error:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 400 })
  }
})
