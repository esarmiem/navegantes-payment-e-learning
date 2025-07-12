'use client';

import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-navegantes.jpg";
import { ArrowRight, Users, BookOpen, Globe } from "lucide-react";

const Hero = () => {
  const scrollToPlans = () => {
    document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background con overlay */}
      <div className="absolute inset-0">
        <img 
          src={typeof heroImage === 'string' ? heroImage : heroImage.src} 
          alt="Navegantes - Formación en Turismo" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent"></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Contenido de texto */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                <span className="block">Navegantes</span>
                <span className="block text-secondary">Turismo</span>
              </h1>
              <p className="text-xl text-white/90 max-w-lg">
                Eleva tu carrera en el sector turístico con nuestros programas de formación especializados. 
                Accede a cursos diseñados por expertos de la industria.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 py-6">
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-secondary-foreground" />
                </div>
                <p className="text-white font-medium">+500 Estudiantes</p>
              </div>
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-secondary-foreground" />
                </div>
                <p className="text-white font-medium">30+ Cursos</p>
              </div>
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                  <Globe className="w-6 h-6 text-secondary-foreground" />
                </div>
                <p className="text-white font-medium">Certificado</p>
              </div>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={scrollToPlans}
                size="lg" 
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold px-8 py-4 rounded-full shadow-glow transition-all duration-300 hover:scale-105"
              >
                Explorar Planes
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <p className="text-white/70 text-sm">
                ✓ Acceso inmediato • ✓ Certificaciones válidas • ✓ Soporte 24/7
              </p>
            </div>
          </div>

          {/* Contenido visual adicional */}
          <div className="hidden lg:block animate-scale-in">
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-4">
                  ¿Por qué Navegantes?
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2 animate-float"></div>
                    <p className="text-white/90">Cursos actualizados con las últimas tendencias del turismo</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2 animate-float" style={{animationDelay: '0.5s'}}></div>
                    <p className="text-white/90">Instructores certificados con experiencia internacional</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2 animate-float" style={{animationDelay: '1s'}}></div>
                    <p className="text-white/90">Flexibilidad total para estudiar a tu ritmo</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2 animate-float" style={{animationDelay: '1.5s'}}></div>
                    <p className="text-white/90">Red de networking con profesionales del sector</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de scroll */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;