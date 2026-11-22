/**
 * @fileoverview Mise en page commune des pages légales.
 */
import type { ReactNode } from "react";
import { CadrePage } from "@/composants/mise-en-page/CadrePage";

/** Mise en page commune des pages légales / institutionnelles. */
export function PageLegale({
  titre,
  description,
  children,
}: {
  titre: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <CadrePage titre={titre} description={description} largeur="large">
      <article className="max-w-3xl space-y-6 text-[15px] leading-7 text-encre [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-marque [&_h3]:mt-4 [&_h3]:text-[15px] [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_a]:font-semibold [&_a]:text-marque [&_a]:underline">
        {children}
      </article>
    </CadrePage>
  );
}
