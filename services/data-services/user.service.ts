import { generateId } from "@/lib/utils/general.utils"
import { useCentralStore } from "@/store/central.store"
import { NotificationService as n } from "@/services/data-services/notification.service"
import { handleServiceErrorWithToast } from "@/lib/utils"
import { type User, type Student, type Profile } from "@/types/interfaces" 

/**
 * Serviço para gerir as operações CRUD dos utilizadores.
 * Permite ao professor registar um estudante (padrão com o role "student")
 * apenas informando o email e, opcionalmente, o primeiro e último nome.
 */
class UserService {
  private static instance: UserService | null = null

  // teacherId hardcoded para identificar o professor que regista os estudantes.
  private teacherId = "cm6bntysq0005s911c7r7o87g"

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService()
    }
    return UserService.instance
  }

  /**
   * Obtém todos os utilizadores.
   * @returns Lista de utilizadores.
   */
  getUsers(): User[] {
    try {
      const state = useCentralStore.getState()
      return state.getData("users") || []
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar os utilizadores")
      return []
    }
  }

  /**
   * Regista um novo estudante.
   * O professor regista o estudante apenas com o email e, opcionalmente, com o primeiro e o último nome.
   * Se os nomes forem fornecidos, é criado um perfil onde o displayName é definido automaticamente.
   * O estudante (role student) tem o campo createdBy definido com o teacherId.
   *
   * @param email - Email do estudante.
   * @param firstName - (Opcional) Primeiro nome do estudante.
   * @param lastName - (Opcional) Último nome do estudante.
   * @returns Resultado da operação com a mensagem e o utilizador criado.
   */
  async addStudent(
    email: string,
    firstName?: string,
    lastName?: string
  ): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      if (!email) {
        throw new Error("O email é obrigatório para registar um estudante.")
      }

      const state = useCentralStore.getState()
      const users: User[] = state.getData("users") || []

      if (users.some((u: User) => u.email === email)) {
        throw new Error("Já existe um utilizador com este email.")
      }

      // Se forem fornecidos os nomes, cria-se o perfil com o displayName.
      let profile: Profile | undefined = undefined
      if (firstName || lastName) {
        profile = {
          id: generateId(),
          userId: "", // Será atualizado após a criação do utilizador.
          firstName,
          lastName,
          displayName: `${firstName ?? ""} ${lastName ?? ""}`.trim(),
        }
      }

      // Cria-se o estudante com o campo createdBy definido com o teacherId.
      const student: Student = {
        id: generateId(),
        userId: "", // Será atualizado após a criação do utilizador.
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: this.teacherId,
      }

      // Cria o novo utilizador (com role implícito "student" através da propriedade student).
      const newUser: User = {
        id: generateId(),
        email,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        isDeleted: false,
        profile,
        student,
      }

      // Atualiza os campos userId do perfil e do estudante.
      if (profile) {
        profile.userId = newUser.id
      }
      student.userId = newUser.id

      state.addData("users", newUser)
      n.addNotification("success", "Estudante adicionado com sucesso.")
      return { success: true, message: "Estudante adicionado com sucesso.", user: newUser }
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao adicionar o estudante")
      return { success: false, message: "Falha ao adicionar o estudante" }
    }
  }

  /**
   * Atualiza os dados de um utilizador existente.
   * @param userId - ID do utilizador a atualizar.
   * @param updates - Dados parciais para atualização.
   * @returns Resultado da operação com a mensagem e o utilizador atualizado.
   */
  async updateUser(
    userId: string,
    updates: Partial<User>
  ): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const state = useCentralStore.getState()
      const users: User[] = state.getData("users") || []
      const user = users.find((u) => u.id === userId)
      if (!user) {
        throw new Error("Utilizador não encontrado. Atualização cancelada.")
      }

      const updatedUser: User = { ...user, ...updates, updatedAt: new Date() }
      state.updateData("users", userId, updatedUser)

      n.addNotification("success", "Utilizador atualizado com sucesso.")
      return { success: true, message: "Utilizador atualizado com sucesso.", user: updatedUser }
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao atualizar o utilizador")
      return { success: false, message: "Falha ao atualizar o utilizador" }
    }
  }

  /**
   * Remove um utilizador.
   * @param userId - ID do utilizador a remover.
   * @returns Resultado da operação com a mensagem.
   */
  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const state = useCentralStore.getState()
      const users: User[] = state.getData("users") || []
      const user = users.find((u) => u.id === userId)
      if (!user) {
        throw new Error("Utilizador não encontrado. Exclusão cancelada.")
      }

      state.deleteData("users", userId)
      n.addNotification("success", "Utilizador removido com sucesso.")
      return { success: true, message: "Utilizador removido com sucesso." }
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao remover o utilizador")
      return { success: false, message: "Falha ao remover o utilizador" }
    }
  }

  /**
   * Obtém um utilizador pelo ID.
   * @param userId - ID do utilizador.
   * @returns O utilizador ou null caso não seja encontrado.
   */
  getUserById(userId: string): User | null {
    try {
      const state = useCentralStore.getState()
      const users: User[] = state.getData("users") || []
      return users.find((u) => u.id === userId) || null
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar o utilizador")
      return null
    }
  }

  /**
   * Obtém todos os estudantes.
   * Retorna apenas os utilizadores que possuem a propriedade 'student' definida.
   *
   * @returns Lista de utilizadores com o role de estudante.
   */
  getStudents(): User[] {
    try {
      const state = useCentralStore.getState()
      const users: User[] = state.getData("users") || []
      return users.filter((u) => u.student !== undefined)
    } catch (error) {
      handleServiceErrorWithToast(error, "Falha ao recuperar os estudantes")
      return []
    }
  }
}

export const userService = UserService.getInstance()
