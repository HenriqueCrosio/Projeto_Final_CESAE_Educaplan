"use client";

import React, { PropsWithChildren } from "react";
import { NavBar } from "./navigation/desktop/nav-bar";
import { PageLoader } from "@/components/page-loader";
import { useUser } from "@auth0/nextjs-auth0/client";

export const PageLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const { isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="page-layout">
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="page-layout">
      <NavBar />
      {/* Dono de scroll por omissão: toda a rota abaixo da navbar (3.5rem) rola
          aqui. Áreas com sidebar (dashboard/aluno) limitam a própria altura, logo
          não duplicam scroll. body é overflow-hidden, então sem isto rotas sem
          layout próprio (profile/developer/onboarding) ficam cortadas. */}
      <div className="h-[calc(100dvh-3.5rem)] overflow-y-auto">{children}</div>
    </div>
  );
};