import type { NavGroup, NavItem } from "@/types/navigation.types";

export const createNavItem = (
    id: string,
    title: string,
    href: string,
    icon: string,
    secondaryNav: NavGroup[] = []
): NavItem => ({
    id,
    name: title,
    icon,
    href,
    children: secondaryNav,
    isActive: false,
});

export const createNavGroup = (id: string, title: string, type: "header" | "body", items: any[]): NavGroup => ({
    id,
    name: title,
    type,
    children: items.map(({ id, itemId, title, description, href, other }) => ({
        id,
        itemId,
        name: title,
        description,
        href,
        other,
        isActive: false,
    })),
});

/** Simulate fetching from a database */
export const getDynamicActivities = async (): Promise<NavGroup> => {
    return createNavGroup("2", "Atividade recente", "body", [
        { id: "1", title: "Notificação 1", description: "Ajuste suas preferências", href: "/dashboard/notifications" },
        { id: "2", title: "Notificação 2", description: "Gerencie suas notificações", href: "/dashboard/notifications" },
    ]);
};

export const getDynamicCoursesHeader = async (): Promise<NavGroup> => {
    return createNavGroup("1", "Gestão de Cursos", "header", [
        { id: "registarcurso", title: "Adicionar novo curso", href: "/dashboard/cursos/registar-curso", description: "Crie um novo curso" },
        { id: "modulos", title: "Todos os módulos", href: "/dashboard/cursos/modulos", description: "Gerencie os módulos" },
    ]);
};

export const getDynamicCoursesBody = async (): Promise<NavGroup> => {
    return createNavGroup("2", "Cursos Disponíveis", "body", [
        { id: "curso1", title: "Curso de Programação", href: "/dashboard/cursos/curso1", description: "Aprenda a programar do zero" },
        { id: "curso2", title: "Curso de Design", href: "/dashboard/cursos/curso2", description: "Aprenda os fundamentos do design gráfico" },
    ]);
};

export const getDynamicClasses = async (): Promise<NavGroup> => {
    return createNavGroup("1", "Lista de Turmas", "body", [
        { id: "class-list", title: "Lista de Turmas", href: "/classes/list", description: "Veja a lista de turmas" },
        { id: "create-class", title: "Criar Turma", href: "/classes/create", description: "Crie uma nova turma" },
    ]);
};
