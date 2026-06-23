"use client";

import * as React from "react";
import { useTheme } from "next-themes";

/**
 * Torna a BD a fonte de verdade do tema entre dispositivos: na montagem, se o
 * utilizador tem um tema guardado que difere do estado local (next-themes/
 * localStorage), aplica o da BD. No mesmo dispositivo mantêm-se alinhados porque
 * o toggle grava ambos.
 */
export function ThemeSync({ serverTheme }: { serverTheme: string | null }) {
  const { theme, setTheme } = useTheme();

  React.useEffect(() => {
    if (serverTheme && serverTheme !== theme) {
      setTheme(serverTheme);
    }
    // Apenas quando o valor do servidor muda (tipicamente na montagem).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverTheme]);

  return null;
}
