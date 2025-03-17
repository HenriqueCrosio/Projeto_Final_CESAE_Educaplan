import { useCentralStore } from "@/store/central.store";

// Função que devolve as lições agendadas para hoje a partir da lição corrente
export const scheduleService = {
  /**
   * Devolve a lista de lições agendadas para o dia de hoje, a partir do momento atual,
   * ordenadas por hora de início.
   */
  getRemainingLessonsForToday: (): any[] => {
    const { data } = useCentralStore.getState();
    const scheduleLessons = data.classScheduleLessons || [];
    const agora = new Date();

    // Filtrar apenas as lições do dia de hoje com hora de início >= agora
    const hojeLicoes = scheduleLessons.filter((ls: any) => {
      const inicioLicao = new Date(ls.startTime);
      return inicioLicao.toDateString() === agora.toDateString() &&
             inicioLicao.getTime() >= agora.getTime();
    });

    // Ordenar por hora de início (ascendente)
    hojeLicoes.sort(
      (a: any, b: any) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    return hojeLicoes;
  },

  /**
   * Dado o ID de uma lição agendada, devolve todos os detalhes associados:
   * - Informação do curso
   * - Módulos associados à lição (via courseModules e modules)
   * - Tópicos associados (via moduleTopics e topics)
   * - A lição anterior (caso exista)
   * - A turma e os alunos associados à classe
   */
  getLessonDetails: (lessonId: string): any => {
    const { data } = useCentralStore.getState();

    // Procurar a lição agendada
    const scheduleLesson = (data.classScheduleLessons || []).find(
      (ls: any) => ls.lessonId === lessonId
    );
    if (!scheduleLesson) return null;

    // Obter a informação do curso
    const course = (data.courses || []).find(
      (c: any) => c.id === scheduleLesson.courseId
    );

    // Obter os courseModules relacionados com o curso
    const courseModules = (data.courseModules || []).filter(
      (cm: any) => cm.courseId === scheduleLesson.courseId
    );

    // Obter os módulos completos
    const modules = courseModules
      .map((cm: any) =>
        (data.modules || []).find((mod: any) => mod.id === cm.moduleId)
      )
      .filter(Boolean);

    // Obter os tópicos associados a cada módulo (através de moduleTopics)
    const topics = modules.flatMap((mod: any) => {
      const modTopics = (data.moduleTopics || []).filter(
        (mt: any) => mt.moduleId === mod.id
      );
      return modTopics
        .map((mt: any) =>
          (data.topics || []).find((t: any) => t.id === mt.topicId)
        )
        .filter(Boolean);
    });

    // Obter a lição agendada anterior (caso exista)
    const hojeLicoes = scheduleService.getRemainingLessonsForToday();
    // Para determinar a lição anterior, assumimos que a lista completa do dia está ordenada
    const indiceAtual = hojeLicoes.findIndex(
      (ls: any) => ls.lessonId === lessonId
    );
    const previousLesson = indiceAtual > 0 ? hojeLicoes[indiceAtual - 1] : null;

    // Obter a classe associada à lição (caso exista)
    const classData = (data.classes || []).find(
      (cl: any) => cl.id === scheduleLesson.classId
    );

    // Obter os alunos associados à classe (através de classStudents)
    const classStudents = (data.classStudents || []).filter(
      (cs: any) => cs.classId === scheduleLesson.classId
    );

    return {
      course,
      modules,
      topics,
      scheduleLesson,
      previousLesson,
      class: classData,
      students: classStudents,
    };
  },

  /**
   * Atualiza os agendamentos das lições (pode ser chamada, por exemplo, após alterações)
   */
  refreshLessons: () => {
    // Implemente qualquer lógica necessária para atualizar ou recalcular os agendamentos
    console.log("Refreshing scheduled lessons...");
    // Poder-se-á fazer, por exemplo, um novo carregamento dos dados
  },
};
