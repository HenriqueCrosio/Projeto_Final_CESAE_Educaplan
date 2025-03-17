/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NavigationConfig, NavGroup, NavItem } from "@/types/navigation.types";
import { NotificationService } from "./data-services/notification.service";
import { courseService } from "./data-services/course.service";
import { Course, Enrollment } from "@/types/interfaces";
import { useCentralStore } from "@/store/central.store";

const createNavItem = (
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

const createNavGroup = (id: string, title: string, type: "header" | "body", items: any[]): NavGroup => ({
  id,
  name: title,
  type,
  children: items.map((item) => ({
    id: item.id,
    itemId: item.itemId || null,
    name: item.title,
    description: item.description || "",
    href: item.href || "#",
    isActive: false,
    imageURL: item.imageUrl || "",
    color: item.color || "",
  })),
});

export const NavigationDataService = {
  getNavigationConfig: async (): Promise<NavigationConfig> => {
    return {
      topNav: [
        createNavItem("dashboard", "Dashboard", "/dashboard", "dashboard"),
        createNavItem("calendario", "Calendário", "/dashboard/calendario", "calendario"),
        createNavItem("gestao", "Gestão", "/dashboard/gestao", "gestao"),
        createNavItem("cursos", "Cursos", "/dashboard/cursos", "curso"),
        createNavItem("classes", "Aula", "/dashboard/aula", "aula"),
      ],
      bottomNav: [
        createNavItem("financeiro", "Financeiro", "/dashboard/financeiro", "financeiro"),
      ],
    };
  },

  getDashboardGroups: async (): Promise<NavGroup[]> => {
    const notifications = NotificationService.getNotifications();

    const notificationItems = [...notifications].reverse().map((notif) => ({
        id: notif.id,
        title: notif.message,
        description: "Clique para ver mais detalhes",
    }));

    return [
        createNavGroup("2", "Atividade Recente", "body", notificationItems),
    ];
},

getGestaoGroups: async (): Promise<NavGroup[]> => {
  const gestaoGroups: NavGroup[] = [
    createNavGroup("1", "Gerir currículo", "header", [
      { id: "registar", title: "Registar alunos e turmas", href: "/dashboard/gestao/adicionar", description: "Gerencie as disciplinas" },
      { id: "configurar", title: "Configurar plano de curso", href: "/dashboard/gestao/configurar", description: "Acesse os planos de aula" },
      { id: "enrolment", title: "Planos de curso", href: "/dashboard/gestao", description: "Acesse o histórico dos planos de aula" },
      { id: "lesson-plans", title: "Marcação de aulas", href: "/dashboard/gestao/aulas", description: "Acesse o histórico dos planos de aula" },

    ]),
  ];

  const enrollmentGroups: NavGroup[] = await getEnrollmentGroups();

  const allGroups = [...gestaoGroups, ...enrollmentGroups];

  return allGroups;
},



  getCursosGroups: async (): Promise<NavGroup[]> => {
    const courses: Course[] = courseService.getCoursesByTeacher()
    const coursesByCategory = courses.reduce((acc: Record<string, Course[]>, course: Course) => {
      if (!acc[course.category]) {
        acc[course.category] = [];
      }
      acc[course.category].push(course);
      return acc;
    }, {});

    const categoryGroups: NavGroup[] = Object.entries(coursesByCategory).map(([category, courses]) => {
      const items = courses.map((course) => ({
        id: course.id,
        title: course.name,
        href: `/dashboard/cursos/${course.slug}`,
      }));
      return createNavGroup(category, category, "body", items);
    });

    return [
      createNavGroup("1", "Gestão de Cursos", "header", [
        { id: "registarcurso", title: "Adicionar novo curso", href: "/dashboard/cursos/adicionar", description: "Crie um novo curso" },
        { id: "registarmodulo", title: "Adicionar novo módulo", href: "/dashboard/cursos/modulos/adicionar", description: "Crie um novo módulo" },
        { id: "registartopico", title: "Adicionar novo tópico", href: "/dashboard/cursos/topicos/adicionar", description: "Crie um novo tópico" },
        { id: "registaraula", title: "Configurar aulas", href: "/dashboard/cursos/aulas", description: "Crie uma nova aula" },
      ]),
      createNavGroup("3", "Vista geral", "body", [
        { id: "todoscursos", href: "/dashboard/cursos", title: "Todos os cursos" },
        { id: "todosmodulos", href: "/dashboard/cursos/modulos", title: "Todos os módulos" },
        { id: "todostopicos", href: "/dashboard/cursos/topicos", title: "Todos os tópicos" },
      ]),
      ...categoryGroups,
    ];
  },

  getClassesGroups: async (): Promise<NavGroup[]> => {
    // Grupo com opções fixas de navegação para as aulas
    const headerGroup = createNavGroup("1", "Integração de Sistemas de Informação", "header", [
      { id: "1", title: "Planeamento do módulo", href: "/dashboard/statistics", description: "Visualize estatísticas importantes" },
      { id: "2", title: "Tópicos e material de estudo", href: "/dashboard/reports", description: "Acesse relatórios detalhados" },
      { id: "3", title: "Exercícios e exames", href: "/dashboard/exams", description: "Gerencie exercícios e exames" },
      { id: "4", title: "Calendário da turma", href: "/dashboard/calendar", description: "Veja o calendário da turma" },
    ]);

    // Grupo dinâmico: aulas de hoje (a partir do momento atual até à última do dia)
    const todayClassesItems = getTodayClassesNavItems();
    const todayClassesGroup = createNavGroup(
      "today-classes",
      "Aulas de Hoje",
      "body",
      todayClassesItems
    );

    return [headerGroup, todayClassesGroup];
  },

};


const getEnrollmentGroups = async (): Promise<NavGroup[]> => {
  const enrollments: Enrollment[] = useCentralStore.getState().getData("enrollments") || [];
  const now = new Date();

  const upcoming = enrollments.filter((enr) => new Date(enr.startDate) > now);
  const ongoing = enrollments.filter(
    (enr) =>
      new Date(enr.startDate) <= now &&
      new Date(enr.endDate) >= now
  );

  const mapToNavItem = (enr: Enrollment) => ({
    id: enr.id,
    title: enr.name,
    href: `/dashboard/gestao/planos/${enr.slug}`,
    description: enr.enrollmentYear ? String(enr.enrollmentYear) : "",
  });

  const upcomingItems = upcoming.map(mapToNavItem);
  const ongoingItems = ongoing.map(mapToNavItem);

  const groups: NavGroup[] = [];
  if (ongoingItems.length > 0) {
    groups.push(createNavGroup("enrollments-ongoing", "Cursos a decorres", "body", ongoingItems));
  }
  if (upcomingItems.length > 0) {
    groups.push(createNavGroup("enrollments-upcoming", "Próximos Cursos", "body", upcomingItems));
  }
  return groups;
};

const getTodayClassesNavItems = (): NavItem[] => {
  const { getData } = useCentralStore.getState();
  const scheduleLessons: any[] = getData("classScheduleLessons") || [];
  const classesData: any[] = getData("classes") || [];
  const agora = new Date();

  const todaySchedules = scheduleLessons.filter((sch) => {
    const startTime = new Date(sch.startTime);
    const endTime = new Date(sch.endTime); // Assume que a propriedade endTime existe
    return startTime.toDateString() === agora.toDateString() &&
           endTime.getTime() > agora.getTime();
  });

  todaySchedules.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  return todaySchedules.map((sch) => {
    const classInfo = classesData.find((cl) => cl.id === sch.classId);
    return {
      id: sch.id,
      name: classInfo?.name || "Aula desconhecida",
      icon: "aula", 
      href: `/dashboard/aula/${classInfo?.id || sch.classId}`,
      children: [],
      isActive: false,
      color: classInfo?.color || "", // Adiciona a propriedade color
    };
  });
};
