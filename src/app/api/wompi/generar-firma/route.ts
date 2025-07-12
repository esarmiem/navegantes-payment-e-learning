import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { referencia, monto_centavos, moneda } = await request.json();

    // Validar parámetros requeridos
    if (!referencia || !monto_centavos || !moneda) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos' },
        { status: 400 }
      );
    }

    // Obtener el secreto de integridad desde variables de entorno
    const integritySecret = process.env.WOMPI_INTEGRITY_SECRET_SANDBOX;
    
    if (!integritySecret) {
      console.error('WOMPI_INTEGRITY_SECRET no está configurado');
      return NextResponse.json(
        { error: 'Error de configuración del servidor' },
        { status: 500 }
      );
    }

    // Generar firma de integridad según documentación de Wompi
    // Formato: SHA256(reference + amount_in_cents + currency + integrity_secret)
    const dataToSign = `${referencia}${monto_centavos}${moneda}${integritySecret}`;
    const signature = crypto.createHash('sha256').update(dataToSign).digest('hex');

    return NextResponse.json({
      signature,
      reference: referencia,
      amount_in_cents: monto_centavos,
      currency: moneda
    });

  } catch (error) {
    console.error('Error al generar firma:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 