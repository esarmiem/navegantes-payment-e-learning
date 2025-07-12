import { Suspense } from "react";
import FormularioRegistro from "@/components/FormularioRegistro";

export default function RegistroPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <FormularioRegistro />
    </Suspense>
  );
} 