import { PaymentTicket, PaymentStatus, PaymentTicketDetail } from "@/types/interfaces";
import { generateId } from "@/lib/utils/general.utils";
import { useCentralStore } from "@/store/central.store";

class PaymentService {
  private static instance: PaymentService | null = null;
  // Teacher ID hardcoded conforme solicitado.
  private teacherId = "cm6bntysq0005s911c7r7o87g";

  private constructor() {}

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  /**
   * Calcula o ticket de pagamento para um professor num determinado mês/ano.
   * O agrupamento é feito por módulo e enrollment, convertendo a duração (em minutos) para horas.
   * Para cada grupo, tenta-se obter o preço por hora do moduleAssignment; se não encontrado, usa 50€.
   */
  public calculatePaymentTicket(month: number, year: number): PaymentTicket {
    const teacherId = this.teacherId;
    const scheduleLessons = useCentralStore.getState().getData("classScheduleLessons") || [];
    const moduleAssignments = useCentralStore.getState().getData("moduleAssignments") || [];

    // Filtrar as aulas do professor que ocorreram no mês/ano desejado.
    const lessonsForPeriod = scheduleLessons.filter((lesson: any) => {
      const start = new Date(lesson.startTime);
      return lesson.teacherId === teacherId &&
             start.getMonth() + 1 === month &&
             start.getFullYear() === year;
    });

    // Agrupar por chave composta: módulo e enrollment.
    // Cada grupo terá a soma das horas (convertidas de minutos) e o preço por hora obtido do moduleAssignment.
    const grouped: Record<string, { enrollmentId: string; moduleId: string; hours: number; pricePerHour: number }> = {};

    lessonsForPeriod.forEach((lesson: any) => {
      // Se o enrollmentId não estiver presente, ignoramos este registro.
      if (!lesson.enrollmentId) return;

      const enrollmentId = lesson.enrollmentId;
      const moduleId = lesson.moduleId;
      // Converter a duração de minutos para horas.
      const hours = lesson.duration / 60;
      // Chave composta: módulo + enrollment.
      const key = `${moduleId}_${enrollmentId}`;

      if (!grouped[key]) {
        // Tenta obter o moduleAssignment que corresponda ao módulo, enrollment e teacher.
        const assignment = moduleAssignments.find((a: any) =>
          a.moduleId === moduleId &&
          a.enrollementId === enrollmentId && // Observe que o campo no moduleAssignment é "enrollementId"
          a.teacherId === teacherId
        );
        // Se não for encontrado, usa o valor padrão de 50€ por hora.
        const pricePerHour = assignment ? assignment.pricePerHour : 50;
        grouped[key] = { enrollmentId, moduleId, hours: 0, pricePerHour };
      }
      grouped[key].hours += hours;
    });

    // Criar os detalhes do ticket e calcular o total.
    const details: PaymentTicketDetail[] = [];
    let totalAmount = 0;

    for (const key in grouped) {
      const { enrollmentId, moduleId, hours, pricePerHour } = grouped[key];
      const amount = hours * pricePerHour;
      totalAmount += amount;
      details.push({ enrollmentId, moduleId, hours, pricePerHour, amount });
    }

    const ticket: PaymentTicket = {
      id: generateId(),
      teacherId,
      month,
      year,
      totalAmount,
      status: PaymentStatus.PENDING,
      paidAt: new Date(),
      details,
    };

    // Se necessário, guarde o ticket na store:
    // useCentralStore.getState().addData("paymentTickets", ticket);

    return ticket;
  }

  /**
   * Marca um ticket de pagamento como pago.
   * Atualiza o status do ticket para PaymentStatus.PAID na store.
   */
  public markTicketAsPaid(ticketId: string): void {
    useCentralStore.getState().updateData("paymentTickets", ticketId, { status: PaymentStatus.PAID });
  }
}

export const paymentService = PaymentService.getInstance();
