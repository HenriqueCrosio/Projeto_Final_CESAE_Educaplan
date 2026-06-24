import { redirect } from "next/navigation";

// O Hub foi fundido com o Início (página pessoal configurável). Mantemos o
// redirect para não partir links/bookmarks antigos.
export default function HubRedirect() {
  redirect("/student");
}
