import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { transactionId } = await request.json();

    if (!transactionId) {
      return NextResponse.json(
        { error: 'ID de transacción requerido' },
        { status: 400 }
      );
    }

    // Determinar el entorno de Wompi
    const isProduction = process.env.NODE_ENV === 'production';
    const wompiBaseUrl = isProduction 
      ? 'https://production.wompi.co/v1' 
      : 'https://sandbox.wompi.co/v1';
    
    const wompiPublicKey = isProduction 
      ? process.env.WOMPI_PUBLIC_KEY_PROD 
      : process.env.WOMPI_PUBLIC_KEY_SANDBOX;

    // Consultar transacción en Wompi
    const response = await fetch(`${wompiBaseUrl}/transactions/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${wompiPublicKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Error al consultar Wompi:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Error al verificar transacción con Wompi' },
        { status: response.status }
      );
    }

    const transaction = await response.json();

    // Buscar cliente por referencia de pago
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .select('*')
      .eq('referencia_pago', transaction.reference)
      .single();

    if (clienteError || !cliente) {
      console.error('Error al buscar cliente:', clienteError);
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      );
    }

    // Si la transacción fue exitosa, actualizar cliente y enviar email
    if (transaction.status === 'APPROVED') {
      // Actualizar cliente con ID de transacción
      const { error: updateError } = await supabase
        .from('clientes')
        .update({
          id_transaccion_wompi: transactionId,
          estado_transaccion: 'approved'
        })
        .eq('id', cliente.id);

      if (updateError) {
        console.error('Error al actualizar cliente:', updateError);
      }

      // Enviar email de confirmación
      try {
        await resend.emails.send({
          from: 'Navegantes <dev.alaskatech@gmail.com>',
          to: ['faritmajul@gmail.com'],
          subject: `Nueva Membresía Activada - ${cliente.nombres} ${cliente.apellidos}`,
          html: `
            <h2>Nueva Membresía Activada</h2>
            <p><strong>Cliente:</strong> ${cliente.nombres} ${cliente.apellidos}</p>
            <p><strong>Identificación:</strong> ${cliente.identificacion}</p>
            <p><strong>Email:</strong> ${cliente.correo_electronico}</p>
            <p><strong>Teléfono:</strong> ${cliente.telefono}</p>
            <p><strong>Plan:</strong> ${cliente.plan_seleccionado}</p>
            <p><strong>Monto:</strong> $${(cliente.monto_pagado / 100).toLocaleString('es-CO')} COP</p>
            <p><strong>ID Transacción Wompi:</strong> ${transactionId}</p>
            <p><strong>Referencia:</strong> ${cliente.referencia_pago}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CO')}</p>
          `
        });
      } catch (emailError) {
        console.error('Error al enviar email:', emailError);
        // No fallar la transacción por error de email
      }
    } else {
      // Actualizar estado si la transacción falló
      await supabase
        .from('clientes')
        .update({
          id_transaccion_wompi: transactionId,
          estado_transaccion: 'declined'
        })
        .eq('id', cliente.id);
    }

    return NextResponse.json({
      transaction,
      cliente,
      success: transaction.status === 'APPROVED'
    });

  } catch (error) {
    console.error('Error en verificación de transacción:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 