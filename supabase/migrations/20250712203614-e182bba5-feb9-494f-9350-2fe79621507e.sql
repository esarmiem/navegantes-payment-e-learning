-- Crear tabla para almacenar clientes y sus transacciones
CREATE TABLE public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombres TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  identificacion TEXT NOT NULL,
  correo_electronico TEXT NOT NULL,
  telefono TEXT NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  direccion TEXT NOT NULL,
  ciudad TEXT NOT NULL,
  plan_seleccionado TEXT NOT NULL CHECK (plan_seleccionado IN ('bronce', 'plata', 'oro')),
  monto_pagado INTEGER NOT NULL, -- en centavos
  referencia_pago TEXT NOT NULL UNIQUE,
  id_transaccion_wompi TEXT, -- se llena después del pago exitoso
  estado_transaccion TEXT DEFAULT 'pending' CHECK (estado_transaccion IN ('pending', 'approved', 'declined', 'voided')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserción pública (para el formulario)
CREATE POLICY "Permitir inserción pública de clientes" 
ON public.clientes 
FOR INSERT 
WITH CHECK (true);

-- Política para permitir actualización pública (para actualizar después del pago)
CREATE POLICY "Permitir actualización pública de clientes" 
ON public.clientes 
FOR UPDATE 
USING (true);

-- Política para permitir lectura pública (para verificar transacciones)
CREATE POLICY "Permitir lectura pública de clientes" 
ON public.clientes 
FOR SELECT 
USING (true);

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para mejorar rendimiento
CREATE INDEX idx_clientes_referencia ON public.clientes(referencia_pago);
CREATE INDEX idx_clientes_transaccion ON public.clientes(id_transaccion_wompi);
CREATE INDEX idx_clientes_correo ON public.clientes(correo_electronico);