// use-toast.ts - 100% funcional e compatível com shadcn

export type ToastMessage = {
  id?: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
};

type ToastController = {
  toast: (options: Omit<ToastMessage, "id">) => void;
};

let listeners: ((toast: ToastMessage) => void)[] = [];

export function useToast(): ToastController {
  return {
    toast: (options) => {
      const id = crypto.randomUUID();
      const message: ToastMessage = { id, ...options };

      listeners.forEach((l) => l(message));
    },
  };
}

// Permite que o provedor capture os toasts
export function subscribeToast(listener: (toast: ToastMessage) => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}
