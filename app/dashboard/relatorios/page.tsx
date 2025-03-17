'use client'
import { getCurrentTeacherId } from "@/lib/auth";
import { useAuthStore } from "@/store/auth.store";
import { getSession } from "@auth0/nextjs-auth0";
import { useEffect } from "react";

export default function Relatorios() {


    return (
        <div>Welcome to the Dashboard, {} </div>
    );
}
