'use client';

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, CreditCard, Shield, User } from "lucide-react";
import Link from "next/link";

interface FormData {
  nombres: string;
  apellidos: string;
  identificacion: string;
  correo_electronico: string;
  telefono: string;
  fecha_nacimiento: string;
  direccion: string;
  ciudad: string;
  plan_seleccionado: string;
}

const planes = {
  bronce: { nombre: "Bronce", precio: 150000 },
  plata: { nombre: "Plata", precio: 250000 },
  oro: { nombre: "Oro", precio: 400000 }
};

const FormularioRegistro = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const [formData, setFormData] = useState<FormData>(() => {
    const planFromParams = searchParams?.get("plan");
    const initialPlan = (planFromParams && (planFromParams === "bronce" || planFromParams === "plata" || planFromParams === "oro")) 
      ? planFromParams 
      : "bronce";
    
    return {
      nombres: "",
      apellidos: "",
      identificacion: "",
      correo_electronico: "",
      telefono: "",
      fecha_nacimiento: "",
      direccion: "",
      ciudad: "",
      plan_seleccionado: initialPlan
    };
  });

  // Marcar que el componente está hidratado
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Actualizar plan seleccionado cuando cambien los search params
  useEffect(() => {
    const plan = searchParams?.get("plan");
    if (plan && (plan === "bronce" || plan === "plata" || plan === "oro")) {
      setFormData(prev => ({
        ...prev,
        plan_seleccionado: plan
      }));
    }
  }, [searchParams]);

  const formatPrice = (precio: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validar formulario
      const requiredFields = Object.entries(formData);
      const emptyFields = requiredFields.filter(([_, value]) => !value.trim());
      
      if (emptyFields.length > 0) {
        toast({
          title: "Campos requeridos",
          description: "Por favor completa todos los campos del formulario.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Generar referencia única
      const referencia = `NAV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const planSeleccionado = formData.plan_seleccionado as keyof typeof planes;
      const monto = planes[planSeleccionado].precio;

      // Guardar cliente en Supabase
      const { data: cliente, error: clienteError } = await supabase
        .from('clientes')
        .insert({
          ...formData,
          monto_pagado: monto * 100, // en centavos
          referencia_pago: referencia
        })
        .select()
        .single();

      if (clienteError) {
        console.error('Error al guardar cliente:', clienteError);
        toast({
          title: "Error",
          description: "Hubo un problema al procesar tu información. Inténtalo nuevamente.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Generar firma de integridad usando la nueva API route
      const firmaResponse = await fetch('/api/wompi/generar-firma', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          referencia,
          monto_centavos: monto * 100,
          moneda: 'COP'
        })
      });

      if (!firmaResponse.ok) {
        const errorData = await firmaResponse.json();
        console.error('Error al generar firma:', errorData);
        toast({
          title: "Error",
          description: "Hubo un problema al preparar el pago. Inténtalo nuevamente.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      const firmaData = await firmaResponse.json();

      // Inicializar widget de Wompi
      initWompiWidget(referencia, monto * 100, firmaData.signature);
      
    } catch (error) {
      console.error('Error en el proceso:', error);
      toast({
        title: "Error",
        description: "Hubo un error inesperado. Por favor inténtalo nuevamente.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const initWompiWidget = (referencia: string, montoCentavos: number, signature: string) => {
    // Configuración del widget de Wompi
    const checkout = new (window as any).WidgetCheckout({
      currency: 'COP',
      amountInCents: montoCentavos,
      reference: referencia,
      publicKey: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || 'pub_test_pUaknPaaTZOiBTNxmI8H9AHBJFSxngQI',
      redirectUrl: `${window.location.origin}/pagos/respuesta`,
      'signature:integrity': signature
    });

    checkout.open((result: any) => {
      const transaction = result.transaction;
      console.log('Transacción iniciada:', transaction);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    // Cargar script de Wompi
    const script = document.createElement('script');
    script.src = 'https://checkout.wompi.co/widget.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src="https://checkout.wompi.co/widget.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  const planActual = planes[formData.plan_seleccionado as keyof typeof planes] || planes.bronce;
  
  // Asegurar que siempre tengamos un plan válido
  if (!isClient) {
    return <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Cargando formulario...</p>
      </div>
    </div>;
  }

  if (!planActual) {
    console.error('Plan no válido:', formData.plan_seleccionado);
    return <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12 flex items-center justify-center">
      <div className="text-center">
        <p className="text-destructive mb-4">Error: Plan no válido</p>
        <Link href="/">
          <Button>Volver a planes</Button>
        </Link>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <Link href="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a planes
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Registro para Membresía
            </h1>
            <p className="text-muted-foreground">
              Completa tus datos para proceder con el pago seguro
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Formulario */}
            <div className="lg:col-span-2">
              <Card className="animate-scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Información Personal</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nombres">Nombres *</Label>
                        <Input
                          id="nombres"
                          value={formData.nombres}
                          onChange={(e) => handleInputChange('nombres', e.target.value)}
                          placeholder="Tu nombre"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="apellidos">Apellidos *</Label>
                        <Input
                          id="apellidos"
                          value={formData.apellidos}
                          onChange={(e) => handleInputChange('apellidos', e.target.value)}
                          placeholder="Tus apellidos"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="identificacion">Número de Identificación *</Label>
                        <Input
                          id="identificacion"
                          value={formData.identificacion}
                          onChange={(e) => handleInputChange('identificacion', e.target.value)}
                          placeholder="Cédula o documento"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento *</Label>
                        <Input
                          id="fecha_nacimiento"
                          type="date"
                          value={formData.fecha_nacimiento}
                          onChange={(e) => handleInputChange('fecha_nacimiento', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="correo_electronico">Correo Electrónico *</Label>
                        <Input
                          id="correo_electronico"
                          type="email"
                          value={formData.correo_electronico}
                          onChange={(e) => handleInputChange('correo_electronico', e.target.value)}
                          placeholder="tu@email.com"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="telefono">Teléfono *</Label>
                        <Input
                          id="telefono"
                          value={formData.telefono}
                          onChange={(e) => handleInputChange('telefono', e.target.value)}
                          placeholder="+57 300 123 4567"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="direccion">Dirección *</Label>
                      <Input
                        id="direccion"
                        value={formData.direccion}
                        onChange={(e) => handleInputChange('direccion', e.target.value)}
                        placeholder="Tu dirección completa"
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="ciudad">Ciudad *</Label>
                        <Input
                          id="ciudad"
                          value={formData.ciudad}
                          onChange={(e) => handleInputChange('ciudad', e.target.value)}
                          placeholder="Tu ciudad"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="plan">Plan de Membresía *</Label>
                        <Select 
                          value={formData.plan_seleccionado} 
                          onValueChange={(value) => handleInputChange('plan_seleccionado', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bronce">Bronce - {formatPrice(150000)}</SelectItem>
                            <SelectItem value="plata">Plata - {formatPrice(250000)}</SelectItem>
                            <SelectItem value="oro">Oro - {formatPrice(400000)}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-lg font-semibold"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        "Procesando..."
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 mr-2" />
                          Proceder al Pago - {formatPrice(planActual.precio)}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Resumen */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6 animate-scale-in" style={{animationDelay: '0.2s'}}>
                <CardHeader>
                  <CardTitle>Resumen de Compra</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">Plan {planActual.nombre}</h3>
                    <p className="text-muted-foreground text-sm">Membresía completa</p>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-primary">{formatPrice(planActual.precio)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Pago único, sin renovación automática</p>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4" />
                      <span>Pago 100% seguro</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <CreditCard className="w-4 h-4" />
                      <span>Procesado por Wompi</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormularioRegistro;