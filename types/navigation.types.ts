
export type NavItem = {
    id: string
    name: string
    icon: string
    href: string
    children?: NavGroup[]
    isActive: boolean
  }
  
  export type NavGroup = {
    id: string
    name: string
    description?: string
    type: "header" | "body"
    imageUrl?: string
    color?: string
    children: NavGroupItem[]
    href?: string
  }
  
  export type NavGroupItem = {
    id: string
    itemId?: string
    href: string
    name: string
    description?: string
    other?: string
    children?: NavGroupItem[]
    isActive: boolean
    color?: string
  }
  
  export type NavigationConfig = {
    topNav: NavItem[]
    bottomNav: NavItem[]
  }
  