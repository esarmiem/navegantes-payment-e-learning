'use client';

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

const RespuestaPago = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [estado, setEstado] = useState<'loading' | 'success' | 'error'>('loading');
  const [transaccion, setTransaccion] = useState<any>(null);
  const [cliente, setCliente] = useState<any>(null);

  useEffect(() => {
    const verificarTransaccion = async () => {
      const transactionId = searchParams?.get('id');
      
      if (!transactionId) {
        setEstado('error');
        return;
      }

      try {
        // Verificar transacción usando la nueva API route
        const response = await fetch('/api/wompi/verificar-transaccion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ transactionId })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error al verificar transacción:', errorData);
          setEstado('error');
          return;
        }

        const resultadoVerificacion = await response.json();

        setTransaccion(resultadoVerificacion.transaction);
        setCliente(resultadoVerificacion.cliente);

        if (resultadoVerificacion.transaction.status === 'APPROVED') {
          setEstado('success');
          
          // Mostrar mensaje de éxito
          toast({
            title: "¡Pago exitoso!",
            description: "Tu membresía ha sido activada. Recibirás un email de confirmación.",
          });
        } else {
          setEstado('error');
        }
        
      } catch (error) {
        console.error('Error en verificación:', error);
        setEstado('error');
      }
    };

    verificarTransaccion();
  }, [searchParams, toast]);

  const handleVolverInicio = () => {
    router.push('/');
  };

  const handleReintentarPago = () => {
    if (cliente) {
      router.push(`/registro?plan=${cliente.plan_seleccionado}&retry=${cliente.referencia_pago}`);
    }
  };

  if (estado === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center space-y-4 p-8">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <h2 className="text-xl font-semibold">Verificando pago...</h2>
            <p className="text-muted-foreground text-center">
              Por favor espera mientras confirmamos tu transacción
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (estado === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-md animate-scale-in">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">¡Pago Exitoso!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Tu membresía <strong className="text-primary">{cliente?.plan_seleccionado}</strong> ha sido activada exitosamente.
              </p>
              <p className="text-sm text-muted-foreground">
                ID de transacción: <code className="bg-muted px-2 py-1 rounded">{transaccion?.id}</code>
              </p>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">¿Qué sigue?</h3>
              <ul className="text-sm text-muted-foreground space-y-1 text-left">
                <li>✓ Recibirás un email de confirmación</li>
                <li>✓ Instrucciones de acceso a la plataforma</li>
                <li>✓ Tus credenciales de inicio de sesión</li>
              </ul>
            </div>
            
            <Button onClick={handleVolverInicio} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Estado de error
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
      <Card className="w-full max-w-md animate-scale-in">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-700">Pago No Completado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Tu pago no pudo ser procesado exitosamente.
            </p>
            {transaccion?.status && (
              <p className="text-sm text-muted-foreground">
                Estado: <code className="bg-muted px-2 py-1 rounded">{transaccion.status}</code>
              </p>
            )}
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Posibles causas:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 text-left">
              <li>• Fondos insuficientes</li>
              <li>• Problemas con la tarjeta</li>
              <li>• Transacción cancelada</li>
              <li>• Error en los datos ingresados</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            {cliente && (
              <Button onClick={handleReintentarPago} className="w-full">
                Reintentar Pago
              </Button>
            )}
            <Button onClick={handleVolverInicio} variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Volver al Inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RespuestaPago; 