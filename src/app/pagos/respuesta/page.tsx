import { Suspense } from "react";
import RespuestaPago from "@/components/RespuestaPago";

export default function RespuestaPagoPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <RespuestaPago />
    </Suspense>
  );
} 