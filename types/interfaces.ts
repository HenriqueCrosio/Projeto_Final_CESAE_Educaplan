export interface User {
    id: string
    email: string
    emailVerified?: Date
    userApiToken?: string
    createdAt: Date
    updatedAt: Date
    lastAccessedAt?: Date
    isActive: boolean
    isDeleted: boolean
    profile?: Profile
    teacher?: Teacher
    student?: Student
    admin?: Admin
  }
  
  export interface Admin {
    id: string
    userId: string
    user?: User
    createdAt: Date
    updatedAt: Date
  }
  
  export interface Profile {
    id: string
    userId: string
    firstName?: string
    lastName?: string
    displayName?: string
    bio?: string
    birthDate?: Date
    phoneNumber?: string
    user?: User
  }
  
  export interface Role {
    id: string
    name: string
    description?: string
    users?: UserRole[]
  }
  
  export interface UserRole {
    userId: string
    roleId: string
    user?: User
    role?: Role
  }
  
  export interface Account {
    id: string
    userId: string
    type: string
    provider: string
    providerAccountId: string
    refresh_token?: string
    access_token?: string
    expires_at?: number
    token_type?: string
    scope?: string
    id_token?: string
    session_state?: string
    oauth_token_secret?: string
    oauth_token?: string
    user?: User
  }
  
  export interface Session {
    id: string
    sessionToken: string
    userId: string
    expires: Date
    user?: User
  }
  
  export interface Teacher {
    id: string
    userId: string
    user?: User
    specialization?: string
  }
  
  export interface Student {
    id: string
    userId: string
    studentId?: string
    createdAt: Date
    updatedAt: Date
    createdBy: string
  }

export enum CourseStatusEnum {
    DRAFT = "DRAFT",
    COMPLETED = "COMPLETED",
    ARCHIVED = "ARCHIVED",
}
  
export enum PublishStatusEnum {
    PRIVATE = "PRIVATE",
    PUBLISHED_FOR_SALE = "PUBLISHED_FOR_SALE",
    PUBLISHED_FOR_RENT = "PUBLISHED_FOR_RENT",
    PUBLISHED_FOR_BOTH = "PUBLISHED_FOR_BOTH",
}

export interface Course {
    id: string
    slug: string
    name: string
    description: string
    category: string
    status: CourseStatusEnum
    createdAt: Date
    updatedAt: Date
    creatorId: string
    ownedId: string[]
    ownerId: string[]
    publishStatus: PublishStatusEnum
    totalMinutes?: number
}

export interface Module {
    id: string
    name: string
    slug: string
    description: string
    category: string
    totalMinutes: number
    averageMinutesPerLesson: number
    minutesToAllocate: number
    creatorId: string
    ownedId: string[]
    ownerId: string[]
    createdAt: Date
    updatedAt: Date
    publishStatus: PublishStatusEnum
    lessonCount?: number
  }

export interface CourseModule {
    id: string
    courseId: string
    moduleId: string
    teacherId: string
    createdAt: Date
    updatedAt: Date
  }

  export interface Topic {
    id: string
    slug: string
    name: string
    description?: string
    category: string
    objectives: Objective[]
    creatorId: string
    ownedId: string[]
    ownerId: string[]
    publishStatus: PublishStatusEnum
  }

  export interface Objective {
    id: string
    description: string
    createdAt: Date
    updatedAt: Date
  }

export interface Lesson {
    id: string
    name: string
    slug: string
    description?: string
    duration?: number
    order: number
    topics?: Topic[]
    lectured: boolean
    teacherId: string
    createdAt: Date
    updatedAt: Date
    status: CourseStatusEnum
}

export interface ModuleLesson {
    id: string
    moduleId: string
    lessonId: string
    lectured: boolean
    teacherId: string
    createdAt: Date
    updatedAt: Date
}



export interface ModuleTopic {
    id: string
    moduleId: string
    topicId: string
    createdAt: Date
    updatedAt: Date
}

  export interface Class {
    id: string
    name: string
    description?: string
    color: string
    imageUrl?: string
    courseId?: string
    teacherId: string
    teams?: Team[]
    createdAt: Date
    updatedAt: Date
  }
  
    export interface Team {
      id: string
      name: string
      description?: string
      classId: string
      studentIds?: Student[]
      createdAt: Date
      updatedAt: Date
      teacherId?: string
      courseId?: string
    }

export interface ModuleTeam {
    id: string
    teamId: string
    moduleId: string
    teacherId: string
    createdAt: Date
    updatedAt: Date
    classId: string
    exerciseIds: string[]
}

export interface Enrollment {
    id: string
    name: string
    slug: string
    courseId: string
    teacherId: string
    createdAt: Date
    updatedAt: Date
    createdBy: string
    assignmentIds?: string[]
    classIds?: string[]
    totalPrice?: number
    enrollmentYear?: number
    startDate: Date
    endDate: Date
}

export interface ModuleAssignment {
    id: string
    moduleId: string
    enrollementId: string
    pricePerHour: number
    currency: "EUR" | "USD"
    createdAt: Date
    updatedAt: Date
    teacherId: string
}

export interface ClassLessonSchedule {
    id: string
    classId: string
    lessonId: string
    courseId: string
    moduleId: string
    teacherId: string
    createdAt: Date
    updatedAt: Date
    enrollmentId: string
    duration: number
    startTime: Date
    endTime?: Date
}

export interface ClassStudent {
    id: string
    classId: string
    studentId: string
}

export interface EnrollmentData {
  enrollments: any[];
  courseModules: any[];
  modules: any[];
  moduleTopics: any[];
  topics: any[];
  classes: any[];
  classStudents: any[];
  moduleAssignments: any[];
  moduleLessons: any[];
  scheduleLessons: any[];
  lessons: any[];
  users: any[];
}

export interface ClassScheduleLessons {
  id: string;
  classId: string;
  lessonId: string;
  courseId: string;
  moduleId: string;
  teacherId: string;
  createdAt: Date;
  updatedAt: Date;
  enrollmentId: string;
  duration: number;
  startTime: Date;
  endTime?: Date;
}



export interface TeacherStats {
  totalCourses: number
  totalModules: number
  totalLessons: number
  totalEnrollments: number
  totalScheduledLessons: number
  totalStudents: number
  upcomingLessons: any[]
  courseCompletionRates: { [courseId: string]: number }
  averageLessonDuration: number
  mostPopularCourse: any
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
}

export interface PaymentTicket {
  id: string;
  teacherId: string;
  month: number; // 1 a 12
  year: number;
  totalAmount: number; // valor calculado com base nas horas e valor por hora
  status: PaymentStatus;
  paidAt: Date;
  details?: PaymentTicketDetail[];
}

export interface PaymentTicketDetail {
  moduleId: string;
  enrollmentId: string; // Novo campo para registrar o enrollment associado
  hours: number;
  pricePerHour: number;
  amount: number;
}
