import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseClient = createClient(supabaseUrl, serviceKey)

    const { product, variation, quantity = 1 } = await req.json()

    // 1. Get Mercado Pago credentials from site_config
    const { data: config, error: configError } = await supabaseClient
      .from('site_config')
      .select('mercado_pago_access_token')
      .eq('id', 1)
      .single()

    if (configError || !config?.mercado_pago_access_token) {
      throw new Error('Mercado Pago access token not configured')
    }

    const accessToken = config.mercado_pago_access_token

    // 2. Prepare Preference data
    const unitPrice = variation?.valor && variation.valor > 0 ? variation.valor : product.valor
    
    const preference = {
      items: [
        {
          id: String(product.id),
          title: `${product.nome}${variation ? ` - ${variation.tamanho}` : ''}`,
          description: product.descricao?.substring(0, 250),
          picture_url: product.foto_url,
          category_id: product.categoria || 'others',
          quantity: Number(quantity),
          currency_id: 'BRL',
          unit_price: Number(unitPrice),
        }
      ],
      back_urls: {
        success: `${req.headers.get('origin')}/pagamento-sucesso`,
        failure: `${req.headers.get('origin')}/catalogo`,
        pending: `${req.headers.get('origin')}/pagamento-sucesso`,
      },
      auto_return: 'approved',
      notification_url: `${supabaseUrl}/functions/v1/mercadopago-webhook`,
      statement_descriptor: 'SINHO IMPORTS',
      external_reference: `prod_${product.id}_${Date.now()}`,
    }

    // 3. Create Preference in Mercado Pago
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    })

    const mpData = await mpResponse.json()

    if (!mpResponse.ok) {
      console.error('Mercado Pago Error:', mpData)
      throw new Error(mpData.message || 'Error creating payment preference')
    }

    // 4. Register initial sale in DB
    const { error: saleError } = await supabaseClient
      .from('vendas')
      .insert({
        produto_id: product.id,
        valor_total: unitPrice * quantity,
        quantidade: quantity,
        status: 'pendente',
        pagamento_status: 'pendente',
        checkout_id: mpData.id,
        checkout_url: mpData.init_point,
      })

    if (saleError) console.error('Error creating sale record:', saleError)

    return new Response(
      JSON.stringify({ checkoutUrl: mpData.init_point, preferenceId: mpData.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
