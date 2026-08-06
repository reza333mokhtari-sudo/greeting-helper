/**
 * Never use window.alert/confirm/prompt. Always use app dialog system.
 */

type DialogType = "alert" | "confirm" | "prompt" | "custom";
type DialogVariant = "default" | "success" | "warning" | "danger";

interface DialogOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: DialogVariant;
  defaultValue?: string; // For prompt
  content?: React.ReactNode; // For custom
}

interface DialogState {
  id: string;
  type: DialogType;
  options: DialogOptions;
  resolve: (value: any) => void;
}

let listeners: ((state: DialogState | null) => void)[] = [];
let currentDialog: DialogState | null = null;

const emit = () => {
  listeners.forEach((l) => l(currentDialog));
};

export const dialog = {
  alert: (title: string, message?: string, variant: DialogVariant = "default") => {
    return new Promise<void>((resolve) => {
      currentDialog = {
        id: Math.random().toString(36),
        type: "alert",
        options: { title, message, variant, confirmText: "OK" },
        resolve,
      };
      emit();
    });
  },

  confirm: (options: string | DialogOptions) => {
    const opts = typeof options === "string" ? { title: options } : options;
    return new Promise<boolean>((resolve) => {
      currentDialog = {
        id: Math.random().toString(36),
        type: "confirm",
        options: {
          confirmText: "Confirm",
          cancelText: "Cancel",
          variant: "default",
          ...opts,
        },
        resolve,
      };
      emit();
    });
  },

  prompt: (title: string, defaultValue = "", message?: string) => {
    return new Promise<string | null>((resolve) => {
      currentDialog = {
        id: Math.random().toString(36),
        type: "prompt",
        options: { title, message, defaultValue, confirmText: "Submit", cancelText: "Cancel" },
        resolve,
      };
      emit();
    });
  },

  open: (options: DialogOptions) => {
    return new Promise<any>((resolve) => {
      currentDialog = {
        id: Math.random().toString(36),
        type: "custom",
        options,
        resolve,
      };
      emit();
    });
  },

  close: (value: any = null) => {
    if (currentDialog) {
      currentDialog.resolve(value);
      currentDialog = null;
      emit();
    }
  },

  subscribe: (listener: (state: DialogState | null) => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
};
