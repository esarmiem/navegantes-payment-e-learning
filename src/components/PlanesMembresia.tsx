import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Crown, Zap } from "lucide-react";
import Link from "next/link";

interface Plan {
  id: string;
  nombre: string;
  precio: number;
  descripcion: string;
  caracteristicas: string[];
  icono: React.ReactNode;
  destacado?: boolean;
  color: string;
}

const planes: Plan[] = [
  {
    id: "bronce",
    nombre: "Bronce",
    precio: 150000,
    descripcion: "Ideal para comenzar tu formación en turismo",
    caracteristicas: [
      "Acceso a 10 cursos básicos",
      "Certificado de finalización",
      "Soporte por email",
      "Materiales descargables",
      "Acceso por 6 meses"
    ],
    icono: <Zap className="w-6 h-6" />,
    color: "from-amber-600 to-amber-800"
  },
  {
    id: "plata",
    nombre: "Plata",
    precio: 250000,
    descripcion: "Para profesionales que buscan especialización",
    caracteristicas: [
      "Acceso a 20 cursos intermedios",
      "Certificado profesional",
      "Soporte por chat y email",
      "Sesiones de mentoring grupal",
      "Acceso por 12 meses",
      "Webinars exclusivos"
    ],
    icono: <Star className="w-6 h-6" />,
    destacado: true,
    color: "from-slate-400 to-slate-600"
  },
  {
    id: "oro",
    nombre: "Oro",
    precio: 400000,
    descripcion: "La experiencia completa para líderes del turismo",
    caracteristicas: [
      "Acceso completo a todos los cursos",
      "Certificado de especialización",
      "Soporte premium 24/7",
      "Mentoring personalizado 1:1",
      "Acceso de por vida",
      "Networking con expertos",
      "Bolsa de trabajo exclusiva",
      "Actualizaciones gratuitas"
    ],
    icono: <Crown className="w-6 h-6" />,
    color: "from-yellow-400 to-yellow-600"
  }
];

const PlanesMembresia = () => {
  const formatPrice = (precio: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  };

  return (
    <section id="planes" className="py-20 bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Elige tu Plan de <span className="text-primary">Membresía</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Selecciona el plan que mejor se adapte a tus objetivos profesionales. 
            Todos incluyen acceso a nuestra plataforma y certificaciones válidas.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {planes.map((plan, index) => (
            <Card 
              key={plan.id} 
              className={`
                relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-elegant animate-scale-in
                ${plan.destacado ? 'ring-2 ring-primary shadow-glow' : 'hover:shadow-lg'}
              `}
              style={{animationDelay: `${index * 0.2}s`}}
            >
              {plan.destacado && (
                <div className="absolute top-0 right-0">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1 rounded-bl-lg rounded-tr-lg">
                    Más Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center text-white mb-4`}>
                  {plan.icono}
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">
                  {plan.nombre}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {plan.descripcion}
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center pb-6">
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">
                    {formatPrice(plan.precio)}
                  </span>
                  <span className="text-muted-foreground"> / única vez</span>
                </div>

                <div className="space-y-3">
                  {plan.caracteristicas.map((caracteristica, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground text-left">
                        {caracteristica}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter>
                <Link href={`/registro?plan=${plan.id}`} className="w-full">
                  <Button 
                    className={`
                      w-full py-3 font-semibold transition-all duration-300
                      ${plan.destacado 
                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-glow' 
                        : 'bg-secondary hover:bg-secondary/90 text-secondary-foreground'
                      }
                    `}
                  >
                    Comenzar con {plan.nombre}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12 animate-fade-in">
          <p className="text-muted-foreground mb-4">
            ¿Tienes preguntas sobre nuestros planes?
          </p>
          <p className="text-sm text-muted-foreground">
            ✓ Garantía de satisfacción • ✓ Pagos seguros • ✓ Soporte especializado
          </p>
        </div>
      </div>
    </section>
  );
};

export default PlanesMembresia;