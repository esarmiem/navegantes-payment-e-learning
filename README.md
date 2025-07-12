# Navegantes - Hub de Membresías

Aplicación web para la venta de membresías del programa "Navegantes" de formación en turismo, construida con Next.js, Tailwind CSS y Supabase.

## 🚀 Características

- ✅ Landing page moderna con presentación del programa
- ✅ Tres planes de membresía (Bronce, Plata, Oro)
- ✅ Formulario de registro completo
- ✅ Integración con Wompi para pagos
- ✅ Base de datos Supabase para almacenar clientes
- ✅ Envío automático de emails con Resend
- ✅ Webhook para notificaciones de Wompi
- ✅ Verificación de transacciones
- ✅ Interfaz responsive y moderna

## 📋 Requisitos Previos

- Node.js 18+ 
- Cuenta en Supabase
- Cuenta en Wompi (sandbox y producción)
- Cuenta en Resend para emails

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd navega-membresias-hub
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp env.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase

# Wompi Configuration - Sandbox (Testing)
NEXT_PUBLIC_WOMPI_PUBLIC_KEY_SANDBOX=pub_test_tu_clave_publica
WOMPI_PUBLIC_KEY_SANDBOX=pub_test_tu_clave_publica
WOMPI_PRIVATE_KEY_SANDBOX=prv_test_tu_clave_privada
WOMPI_INTEGRITY_SECRET_SANDBOX=tu_secreto_de_integridad
WOMPI_WEBHOOK_SECRET_SANDBOX=tu_secreto_de_webhook

# Wompi Configuration - Production
NEXT_PUBLIC_WOMPI_PUBLIC_KEY_PROD=pub_prod_tu_clave_publica
WOMPI_PUBLIC_KEY_PROD=pub_prod_tu_clave_publica
WOMPI_PRIVATE_KEY_PROD=prv_prod_tu_clave_privada
WOMPI_INTEGRITY_SECRET_PROD=tu_secreto_de_integridad
WOMPI_WEBHOOK_SECRET_PROD=tu_secreto_de_webhook

# Resend Configuration (Email Service)
RESEND_API_KEY=re_tu_clave_de_resend

# Environment
NODE_ENV=development
```

4. **Configurar Supabase**
- Ejecuta las migraciones en tu proyecto Supabase
- La tabla `clientes` se creará automáticamente

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

## 🔧 Configuración de Wompi

### 1. Obtener Credenciales
- Ve a [Wompi](https://wompi.co) y crea una cuenta
- Obtén las claves públicas y privadas para sandbox y producción
- Configura el secreto de integridad en tu panel de Wompi

### 2. Configurar Webhook
En tu panel de Wompi, configura el webhook con:
- **URL**: `https://tu-dominio.com/api/wompi/webhook`
- **Eventos**: `transaction.updated`
- **Método**: `POST`

### 3. Configurar URLs de Redirección
En tu panel de Wompi, configura:
- **URL de éxito**: `https://tu-dominio.com/pagos/respuesta`
- **URL de fallo**: `https://tu-dominio.com/pagos/respuesta`

## 📧 Configuración de Resend

1. Crea una cuenta en [Resend](https://resend.com)
2. Obtén tu API key
3. Configura el dominio de envío (opcional)
4. Agrega la API key a tus variables de entorno

## 🗄️ Estructura de la Base de Datos

La tabla `clientes` incluye:
- `id`: UUID único
- `nombres`: Nombre del cliente
- `apellidos`: Apellidos del cliente
- `identificacion`: Número de identificación
- `correo_electronico`: Email del cliente
- `telefono`: Teléfono del cliente
- `fecha_nacimiento`: Fecha de nacimiento
- `direccion`: Dirección completa
- `ciudad`: Ciudad del cliente
- `plan_seleccionado`: Plan elegido (bronce/plata/oro)
- `monto_pagado`: Monto en centavos
- `referencia_pago`: Referencia única del pago
- `id_transaccion_wompi`: ID de transacción de Wompi
- `estado_transaccion`: Estado del pago
- `created_at`: Fecha de creación
- `updated_at`: Fecha de actualización

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en Vercel
3. Despliega automáticamente

### Otros Proveedores
- Netlify
- Railway
- DigitalOcean App Platform

## 🔍 API Routes

### `/api/wompi/generar-firma`
Genera la firma de integridad para Wompi.

**POST** `/api/wompi/generar-firma`
```json
{
  "referencia": "NAV-1234567890",
  "monto_centavos": 15000000,
  "moneda": "COP"
}
```

### `/api/wompi/verificar-transaccion`
Verifica el estado de una transacción.

**POST** `/api/wompi/verificar-transaccion`
```json
{
  "transactionId": "wompi_transaction_id"
}
```

### `/api/wompi/webhook`
Webhook para recibir notificaciones de Wompi.

**POST** `/api/wompi/webhook`
Recibe eventos de transacciones actualizadas.

## 🧪 Testing

Para probar la integración con Wompi:

1. **Usa las tarjetas de prueba de Wompi:**
   - Aprobada: `4242424242424242`
   - Declinada: `4000000000000002`
   - Fecha: Cualquier fecha futura
   - CVV: Cualquier número de 3 dígitos

2. **Verifica los logs** en la consola del navegador y del servidor

3. **Revisa la base de datos** para confirmar que los datos se guardan correctamente

## 🔒 Seguridad

- Todas las claves secretas están en variables de entorno
- Las firmas de integridad se generan en el servidor
- Validación de datos en frontend y backend
- Webhook con verificación de firma (opcional)

## 📝 Notas Importantes

1. **Variables de Entorno**: Nunca subas `.env.local` al repositorio
2. **Wompi Sandbox**: Usa siempre sandbox para desarrollo
3. **Emails**: Los emails se envían a `dev.alaskatech@gmail.com` por defecto
4. **Base de Datos**: La tabla se crea automáticamente con las migraciones

## 🐛 Solución de Problemas

### Error: "WOMPI_INTEGRITY_SECRET no está configurado"
- Verifica que la variable de entorno esté configurada
- Asegúrate de que el archivo `.env.local` existe

### Error: "Cliente no encontrado"
- Verifica que la tabla `clientes` exista en Supabase
- Revisa los logs de la API para más detalles

### Error: "Error al enviar email"
- Verifica tu API key de Resend
- Asegúrate de que el dominio esté configurado en Resend

## 📞 Soporte

Para soporte técnico, contacta a:
- Email: dev.alaskatech@gmail.com
- GitHub Issues: [Crear un issue](https://github.com/tu-usuario/navega-membresias-hub/issues)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
