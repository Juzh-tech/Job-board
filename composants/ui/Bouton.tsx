/**
 * @fileoverview Bouton UI réutilisable (variants marque).
 */
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ProprietesBouton = {
  children: ReactNode;
  /** principal = navy ; action = bordeaux (Postuler) ; miseEnAvant = doré */
  variante?: "principal" | "secondaire" | "silencieux" | "action" | "miseEnAvant";
  className?: string;
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "onClick" | "disabled">;

const STYLES: Record<NonNullable<ProprietesBouton["variante"]>, string> = {
  principal: "bg-marque text-ivoire hover:bg-marque-hover disabled:opacity-50",
  action: "bg-action text-ivoire hover:bg-action-hover disabled:opacity-50",
  miseEnAvant: "bg-dore text-marque hover:bg-dore-hover disabled:opacity-50",
  secondaire:
    "border border-encre/20 bg-transparent text-encre hover:border-encre disabled:opacity-50",
  silencieux: "bg-transparent text-muet underline-offset-4 hover:text-encre hover:underline",
};

/** Bouton réutilisable. Dans un formulaire, passer type="submit". */
export function Bouton({
  children,
  variante = "principal",
  type = "button",
  className = "",
  ...reste
}: ProprietesBouton) {
  return (
    <button
      type={type}
      className={`inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold ${STYLES[variante]} ${className}`}
      {...reste}
    >
      {children}
    </button>
  );
}
