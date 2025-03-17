import { useRouter, usePathname } from "next/navigation"

export const useGoBack = () => {
  const router = useRouter()
  const pathname = usePathname()

  const goBack = () => {
    const pathSegments = pathname.split("/")

    if (pathSegments.length > 3 && pathSegments[1] === "dashboard") {
      pathSegments.pop()
      const newPath = pathSegments.join("/")
      router.push(newPath)
    } else {
      router.push("/dashboard")
    }
  }

  return { goBack }
}

