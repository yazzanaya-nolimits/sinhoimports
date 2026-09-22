import { createClient } from 'npm:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabaseClient = createClient(supabaseUrl, serviceKey)

  try {
    const body = await req.json()
    console.log('Webhook received:', body)

    const { type, data } = body

    if (type === 'payment' && data?.id) {
      const paymentId = data.id

      // 1. Get token
      const { data: config } = await supabaseClient
        .from('site_config')
        .select('mercado_pago_access_token')
        .eq('id', 1)
        .single()

      if (!config?.mercado_pago_access_token) throw new Error('No token configured')

      // 2. Fetch payment details from MP
      const mpResp = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(String(paymentId))}`, {
        headers: { 'Authorization': `Bearer ${config.mercado_pago_access_token}` }
      })
      const paymentData = await mpResp.json()
      if (!mpResp.ok) throw new Error('Não foi possível validar o pagamento.')

      if (paymentData.status === 'approved') {
        const preferenceId = paymentData.preference_id
        if (!preferenceId) throw new Error('Pagamento sem referência do checkout.')

        // A condição pendente torna o processamento idempotente: webhooks repetidos não duplicam caixa/estoque.
        const { data: venda, error: updateError } = await supabaseClient
          .from('vendas')
          .update({ 
            pagamento_status: 'pago',
            status: 'concluido',
            pagamento_metodo: paymentData.payment_method_id
          })
          .eq('checkout_id', preferenceId)
          .neq('pagamento_status', 'pago')
          .select()
          .maybeSingle()

        if (updateError) throw updateError

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
          const { data: prod } = await supabaseClient.from('produtos').select('quantidade').eq('id', venda.produto_id).single()
          if (prod) {
            await supabaseClient.from('produtos').update({ quantidade: Math.max(0, prod.quantidade - venda.quantidade) }).eq('id', venda.produto_id)
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
