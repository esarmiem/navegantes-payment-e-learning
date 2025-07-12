import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-signature');
    
    // Verificar firma del webhook (opcional pero recomendado)
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

    const event = JSON.parse(body);
    
    // Solo procesar eventos de transacciones aprobadas
    if (event.event === 'transaction.updated' && event.data.status === 'APPROVED') {
      const transaction = event.data;
      
      // Buscar cliente por referencia
      const { data: cliente, error: clienteError } = await supabase
        .from('clientes')
        .select('*')
        .eq('referencia_pago', transaction.reference)
        .single();

      if (clienteError || !cliente) {
        console.error('Cliente no encontrado para referencia:', transaction.reference);
        return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
      }

      // Actualizar cliente
      const { error: updateError } = await supabase
        .from('clientes')
        .update({
          id_transaccion_wompi: transaction.id,
          estado_transaccion: 'approved'
        })
        .eq('id', cliente.id);

      if (updateError) {
        console.error('Error al actualizar cliente:', updateError);
        return NextResponse.json({ error: 'Error al actualizar cliente' }, { status: 500 });
      }

      // Enviar email de confirmación
      try {
        await resend.emails.send({
          from: 'Navegantes <noreply@navegantes.com>',
          to: ['dev.alaskatech@gmail.com'],
          subject: `Nueva Membresía Activada - ${cliente.nombres} ${cliente.apellidos}`,
          html: `
            <h2>Nueva Membresía Activada (Webhook)</h2>
            <p><strong>Cliente:</strong> ${cliente.nombres} ${cliente.apellidos}</p>
            <p><strong>Identificación:</strong> ${cliente.identificacion}</p>
            <p><strong>Email:</strong> ${cliente.correo_electronico}</p>
            <p><strong>Teléfono:</strong> ${cliente.telefono}</p>
            <p><strong>Plan:</strong> ${cliente.plan_seleccionado}</p>
            <p><strong>Monto:</strong> $${(cliente.monto_pagado / 100).toLocaleString('es-CO')} COP</p>
            <p><strong>ID Transacción Wompi:</strong> ${transaction.id}</p>
            <p><strong>Referencia:</strong> ${cliente.referencia_pago}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CO')}</p>
            <p><strong>Procesado por:</strong> Webhook automático</p>
          `
        });
      } catch (emailError) {
        console.error('Error al enviar email desde webhook:', emailError);
      }

      console.log('Webhook procesado exitosamente para transacción:', transaction.id);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error en webhook:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 