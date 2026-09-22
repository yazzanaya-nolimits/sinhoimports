import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { z } from 'npm:zod@3'

const CheckoutSchema = z.object({
  product: z.object({ id: z.string().uuid() }).passthrough(),
  variation: z.object({ tamanho: z.string().min(1).max(100), valor: z.number().positive().nullable().optional() }).optional(),
  quantity: z.number().int().min(1).max(20).default(1),
  installments: z.number().int().min(1).max(24).default(1),
})

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseClient = createClient(supabaseUrl, serviceKey)

    const parsed = CheckoutSchema.safeParse(await req.json())
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Dados do produto inválidos.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const { product: requestedProduct, variation, quantity, installments } = parsed.data

    const { data: product, error: productError } = await supabaseClient
      .from('produtos')
      .select('id,nome,descricao,valor,foto_url,categoria,status,quantidade,aceita_pix,aceita_cartao,max_parcelas,variacoes')
      .eq('id', requestedProduct.id)
      .eq('status', 'ativo')
      .single()

    if (productError || !product) throw new Error('Produto indisponível.')
    if (product.quantidade < quantity) throw new Error('Quantidade indisponível em estoque.')

    const storedVariations = Array.isArray(product.variacoes) ? product.variacoes : []
    const storedVariation = variation
      ? storedVariations.find((item: { tamanho?: string }) => item?.tamanho === variation.tamanho)
      : undefined
    if (variation && !storedVariation) throw new Error('Variação indisponível.')

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
    const variationPrice = storedVariation && typeof storedVariation.valor === 'number' ? storedVariation.valor : null
    const unitPrice = variationPrice && variationPrice > 0 ? variationPrice : Number(product.valor)
    const originHeader = req.headers.get('origin')
    const origin = originHeader?.startsWith('http') ? originHeader : 'https://sinhoimports.com.br'
    
    const preference = {
      items: [
        {
          id: String(product.id),
          title: `${product.nome}${storedVariation ? ` - ${storedVariation.tamanho}` : ''}`,
          description: product.descricao?.substring(0, 250),
          picture_url: product.foto_url,
          category_id: product.categoria || 'others',
          quantity: Number(quantity),
          currency_id: 'BRL',
          unit_price: Number(unitPrice),
        }
      ],
      back_urls: {
        success: `${origin}/pagamento-sucesso`,
        failure: `${origin}/catalogo`,
        pending: `${origin}/pagamento-sucesso`,
      },
      auto_return: 'approved',
      notification_url: `${supabaseUrl}/functions/v1/mercadopago-webhook`,
      statement_descriptor: 'SINHO IMPORTS',
      external_reference: `prod_${product.id}_${Date.now()}`,
      payment_methods: {
        installments: Math.min(installments, Number(product.max_parcelas) || 12),
      },
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
        produto_nome: product.nome,
        variacao: storedVariation?.tamanho ?? null,
        valor_total: unitPrice * quantity,
        valor_unitario: unitPrice,
        quantidade: quantity,
        forma_pagamento: 'mercado_pago',
        parcelas: Math.min(installments, Number(product.max_parcelas) || 12),
        status: 'pendente',
        pagamento_status: 'pendente',
        checkout_id: mpData.id,
        checkout_url: mpData.init_point,
      })

    if (saleError) {
      console.error('Error creating sale record:', saleError)
      throw new Error('Não foi possível registrar o pedido.')
    }

    return new Response(
      JSON.stringify({ checkoutUrl: mpData.init_point, preferenceId: mpData.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro ao iniciar pagamento.' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
