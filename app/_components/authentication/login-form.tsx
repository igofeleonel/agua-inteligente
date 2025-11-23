/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Button } from "@/components/ui/button";
import { Droplets } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();

  const handleGoogleLogin = () => {
    router.push("/dashboard");
  };

  return (
    <div className="flex h-screen w-screen">
      {/* Left Section */}
      <div className="flex flex-1 flex-col justify-center bg-slate-50 px-12 dark:bg-slate-950">
        <div className="mx-auto w-full max-w-sm space-y-8">
          <div className="space-y-2 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/20">
              <Droplets className="h-8 w-8 text-white" />
            </div>

            <h1 className="bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-4xl font-bold text-transparent">
              Água Inteligente
            </h1>

            <p className="text-muted-foreground">
              Economize água e dinheiro no dia a dia
            </p>
          </div>

          {/* Google Button */}
          <Button
            onClick={handleGoogleLogin}
            className="flex h-14 w-full items-center justify-center gap-3 border-2 border-slate-200 bg-white text-base font-medium text-gray-900 transition-all hover:border-slate-300 hover:bg-slate-50"
            variant="outline"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Entrar com Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="text-muted-foreground bg-slate-50 px-4 dark:bg-slate-950">
                Acesso rápido e seguro
              </span>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <p className="text-muted-foreground text-sm">
              Ao continuar, você concorda com nossos
            </p>
            <div className="text-muted-foreground flex justify-center gap-2 text-xs">
              <a href="#" className="hover:text-blue-600 hover:underline">
                Termos de Serviço
              </a>
              <span>e</span>
              <a href="#" className="hover:text-blue-600 hover:underline">
                Política de Privacidade
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="relative hidden flex-1 items-center justify-center bg-linear-to-br from-blue-600/30 to-cyan-500/30 lg:flex">
        {/* Background image with overlay */}
        <div className="absolute inset-0 bg-[url('/images/captura-20de-20tela-20-28512-29.png')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-linear-to-br from-blue-600/40 to-cyan-500/40 backdrop-blur-[2px]" />

        <div className="relative z-10 px-10 text-center">
          <Droplets className="mx-auto h-24 w-24 text-white opacity-90 drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]" />

          <h2 className="mt-6 text-4xl leading-snug font-bold text-white">
            Economize até 30%
            <br />
            na conta de água
          </h2>

          <p className="mx-auto mt-4 max-w-md text-lg text-blue-100/80">
            Análise inteligente com IA para identificar desperdícios e sugerir
            melhorias
          </p>
        </div>
      </div>
    </div>
  );
}
