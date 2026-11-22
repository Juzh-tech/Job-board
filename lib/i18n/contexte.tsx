/**
 * @fileoverview Provider de locale (pays → langue UI).
 *
 * But
 *   Expose t() + pays courant. Branché dans app/layout.tsx.
 */
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  PAYS_DEFAUT,
  paysParCode,
  type CodePays,
  type DefinitionPays,
} from "@/lib/pays";
import { DICTIONNAIRES, type CleI18n } from "@/lib/i18n/dictionnaires";

const CLE_STOCKAGE = "jobboard_pays";

type ContexteLocale = {
  pays: DefinitionPays;
  codePays: CodePays;
  setCodePays: (code: CodePays) => void;
  t: (cle: CleI18n) => string;
  libelleDevise: string;
};

const LocaleCtx = createContext<ContexteLocale | null>(null);

export function FournisseurLocale({ children }: { children: ReactNode }) {
  const [codePays, setCodePaysState] = useState<CodePays>(PAYS_DEFAUT);

  useEffect(() => {
    try {
      const stocke = localStorage.getItem(CLE_STOCKAGE) as CodePays | null;
      if (stocke) {
        setCodePaysState(stocke);
      }
    } catch {
      // ignore
    }
  }, []);

  const setCodePays = useCallback((code: CodePays) => {
    setCodePaysState(code);
    try {
      localStorage.setItem(CLE_STOCKAGE, code);
    } catch {
      // ignore
    }
    const def = paysParCode(code);
    document.documentElement.lang = def.langue;
    window.dispatchEvent(new Event("jobboard-pays"));
  }, []);

  useEffect(() => {
    document.documentElement.lang = paysParCode(codePays).langue;
  }, [codePays]);

  const pays = paysParCode(codePays);

  const value = useMemo<ContexteLocale>(() => {
    const dico = DICTIONNAIRES[pays.langue];
    return {
      pays,
      codePays,
      setCodePays,
      t: (cle) => dico[cle] ?? DICTIONNAIRES.fr[cle] ?? cle,
      libelleDevise: `${pays.devise.symbole} (${pays.devise.code})`,
    };
  }, [pays, codePays, setCodePays]);

  return <LocaleCtx.Provider value={value}>{children}</LocaleCtx.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleCtx);
  if (!ctx) {
    throw new Error("useLocale doit être utilisé dans FournisseurLocale");
  }
  return ctx;
}
