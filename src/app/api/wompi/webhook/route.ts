import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-signature');
    
    // 1. Verificar firma del webhook (opcional pero recomendado)
    const webhookSecret = process.env.WOMPI_WEBHOOK_SECRET_SANDBOX;
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');
      
      if (signature !== expectedSignature) {
        console.error('Firma de webhook inválida');
        return NextResponse.json({ error: 'Firma inválida' }, { status: 401 });
      }
    }

    // 2. Parsear el evento recibido
    const event = JSON.parse(body);

    // 3. Procesar solo eventos de actualización de transacción
    if (event.event === 'transaction.updated') {
      // Según la documentación de Wompi, la transacción está en event.data.transaction
      const transaction = event.data.transaction;
      if (!transaction) {
        console.error('No se encontró el objeto transaction en el evento');
        return NextResponse.json({ error: 'Estructura de evento inválida' }, { status: 400 });
      }

      // Extraer estado y referencia
      const wompiStatus = transaction.status ? transaction.status.toLowerCase() : 'unknown';
      const referencia = transaction.reference;
      const wompiId = transaction.id;

      // 4. Buscar cliente por referencia de pago
      const { data: cliente, error: clienteError } = await supabase
        .from('clientes')
        .select('*')
        .eq('referencia_pago', referencia)
        .single();

      if (clienteError || !cliente) {
        console.error('Cliente no encontrado para referencia:', referencia);
        return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
      }

      // 5. Actualizar cliente con el estado e ID de la transacción recibidos
      const { error: updateError } = await supabase
        .from('clientes')
        .update({
          id_transaccion_wompi: wompiId,
          estado_transaccion: wompiStatus
        })
        .eq('id', cliente.id);

      if (updateError) {
        console.error('Error al actualizar cliente:', updateError);
        return NextResponse.json({ error: 'Error al actualizar cliente' }, { status: 500 });
      }

      // 6. Solo enviar email si la transacción fue aprobada
      if (wompiStatus === 'approved') {
        try {
          await resend.emails.send({
            from: 'Navegantes <dev.alaskatech@gmail.com>',
            to: ['faritmajul@gmail.com'],
            subject: `Nueva Membresía Activada - ${cliente.nombres} ${cliente.apellidos}`,
            html: `
              <h2>Nueva Membresía Activada (Webhook)</h2>
              <p><strong>Cliente:</strong> ${cliente.nombres} ${cliente.apellidos}</p>
              <p><strong>Identificación:</strong> ${cliente.identificacion}</p>
              <p><strong>Email:</strong> ${cliente.correo_electronico}</p>
              <p><strong>Teléfono:</strong> ${cliente.telefono}</p>
              <p><strong>Plan:</strong> ${cliente.plan_seleccionado}</p>
              <p><strong>Monto:</strong> $${(cliente.monto_pagado / 100).toLocaleString('es-CO')} COP</p>
              <p><strong>ID Transacción Wompi:</strong> ${wompiId}</p>
              <p><strong>Referencia:</strong> ${cliente.referencia_pago}</p>
              <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CO')}</p>
              <p><strong>Procesado por:</strong> Webhook automático</p>
            `
          });
        } catch (emailError) {
          console.error('Error al enviar email desde webhook:', emailError);
        }
      }

      console.log(`Webhook procesado para transacción: ${wompiId} con estado: ${wompiStatus}`);
    }

    // 7. Responder siempre 200 para que Wompi no reintente innecesariamente
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error en webhook:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 