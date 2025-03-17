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
    accounts?: Account[]
    sessions?: Session[]
    roles?: UserRole[]
    comments?: Comment[]
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
    moduleAssignments?: ModuleAssignment[]
    createdCourses?: Course[]
    ownedCourses?: Course[]
    createdModules?: Module[]
    ownedModules?: Module[]
    createdTopics?: Topic[]
    ownedTopics?: Topic[]
    createdExercises?: Exercise[]
    ownedExercises?: Exercise[]
    createdExams?: Exam[]
    ownedExams?: Exam[]
    createdClients?: Client[]
    events?: Event[]
    notifications?: Notification[]
    purchases?: PurchasedItem[]
    rentalPeriods?: RentalPeriod[]
    createdMaterial?: Material[]
    ownedMaterial?: Material[]
    addedStudents?: Student[]
    classes?: Class[]
    lessonsSchedule?: LessonSchedule[]
    enrollments?: Enrollment[]
    teams?: Team[]
  }
  
  export interface Student {
    id: string
    userId: string
    user?: User
    studentId?: string
    enrollYear?: number
    classes?: Class[]
    teams?: Team[]
    notifications?: Notification[]
    createdAt: Date
    updatedAt: Date
    comments?: Comment[]
    addedById: string
    addedBy?: Teacher
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
    creator: Teacher
    owner?: Teacher
    publishStatus: PublishStatusEnum
  }
  
  export interface Module {
    id: string
    slug: string
    name: string
    description?: string
    category: string
    totalHours?: number
    averageHoursPerLesson?: number
    createdAt: Date
    updatedAt: Date
    creatorId: string
    creator?: Teacher
    ownerId: string
    owner?: Teacher
    courseId?: string
    course?: Course
    topics?: Topic[]
    materials?: Material[]
    assignments?: ModuleAssignment[]
    exams?: Exam[]
    lessons?: Lesson[]
    events?: Event[]
    comments?: Comment[]
    publishStatus: PublishStatusEnum
    forSale?: ShopItemForSale
    forRent?: ShopItemForRent
  }
  
  export interface Lesson {
    id: string
    name: string
    description?: string
    duration?: number
    order?: number
    moduleId?: string
    module?: Module
    createdAt: Date
    updatedAt: Date
    schedules?: LessonSchedule[]
    comments?: Comment[]
    teacherId?: string
  }
  
  export interface Topic {
    id: string
    name: string
    description?: string
    order?: number
    moduleId?: string
    module?: Module
    materials?: Material[]
    exercises?: Exercise[]
    objectives?: Objective[]
    comments?: Comment[]
    creatorId: string
    creator?: Teacher
    ownerId: string
    owner?: Teacher
    publishStatus: PublishStatusEnum
  }
  
  export interface Objective {
    id: string
    description: string
    topicId: string
    topic?: Topic
    createdAt: Date
    updatedAt: Date
  }
  
  export interface ModuleAssignment {
    id: string
    moduleId: string
    module?: Module
    teacherId: string
    teacher?: Teacher
    courseId: string
    hourlyRate: number
    currency: CurrencyTypeEnum
    startDate: Date
    endDate: Date
  }
  
  export interface Exercise {
    id: string
    title: string
    description?: string
    content: string
    type: ExerciseTypeEnum
    difficulty: DifficultyLevelEnum
    points: number
    timeLimit?: number
    topicId?: string
    topic?: Topic
    isTeamExercise: boolean
    examExercises?: ExamExercise[]
    creatorId: string
    creator?: Teacher
    ownerId: string
    owner?: Teacher
    createdAt: Date
    updatedAt: Date
    teams?: Team[]
    clientId?: string
    client?: Client
    comments?: Comment[]
    publishStatus: PublishStatusEnum
    forSale?: ShopItemForSale
    forRent?: ShopItemForRent
  }
  
  export interface Exam {
    id: string
    name: string
    description?: string
    type: ExamTypeEnum
    moduleId: string
    module?: Module
    date: Date
    duration: number
    maxScore: number
    exercises?: ExamExercise[]
    creatorId: string
    creator?: Teacher
    ownerId: string
    owner?: Teacher
    comments?: Comment[]
    createdAt: Date
    updatedAt: Date
    publishStatus: PublishStatusEnum
    forSale?: ShopItemForSale
    forRent?: ShopItemForRent
  }
  
  export interface ExamExercise {
    examId: string
    exam?: Exam
    exerciseId: string
    exercise?: Exercise
    order: number
  }
  
  export interface Material {
    id: string
    name: string
    description?: string
    url?: string
    type: MaterialType
    courseId?: string
    course?: Course
    moduleId?: string
    module?: Module
    topicId?: string
    topic?: Topic
    comments?: Comment[]
    createdAt: Date
    updatedAt: Date
    creatorId: string
    creator?: Teacher
    ownerId: string
    owner?: Teacher
    publishStatus: PublishStatusEnum
    forSale?: ShopItemForSale
    forRent?: ShopItemForRent
  }
  
  export interface Comment {
    id: string
    content: string
    userId: string
    user?: User
    courseId?: string
    course?: Course
    moduleId?: string
    module?: Module
    topicId?: string
    topic?: Topic
    materialId?: string
    material?: Material
    enrollmentId?: string
    enrollment?: Enrollment
    classId?: string
    class?: Class
    teamId?: string
    team?: Team
    eventId?: string
    event?: Event
    lessonId?: string
    lesson?: Lesson
    examId?: string
    exam?: Exam
    exerciseId?: string
    exercise?: Exercise
    studentId?: string
    student?: Student
    createdAt: Date
    updatedAt: Date
  }
  
  export interface Enrollment {
    id: string
    courseId: string
    course?: Course
    classId: string
    class?: Class
    status: EnrollmentStatusEnum
    startDate: Date
    endDate: Date
    totalPrice?: number
    currency: CurrencyTypeEnum
    teacherId?: string
    teacher?: Teacher
    createdAt: Date
    updatedAt: Date
    holidays?: Holiday[]
    comments?: Comment[]
  }
  
  export interface Class {
    id: string
    name: string
    description?: string
    color?: string
    courseId: string
    course?: Course
    teacherId?: string
    teacher?: Teacher
    students?: Student[]
    teams?: Team[]
    enrollments?: Enrollment[]
    comments?: Comment[]
    createdAt: Date
    updatedAt: Date
  }
  
  export interface Holiday {
    id: string
    name: string
    startDate: Date
    endDate: Date
    enrollmentId: string
    enrollment?: Enrollment
    createdAt: Date
    updatedAt: Date
  }
  
  export interface LessonSchedule {
    id: string
    lessonId: string
    lesson?: Lesson
    dateTime: Date
    duration: number
    createdAt: Date
    updatedAt: Date
    teacherId?: string
    teacher?: Teacher
  }
  
  export interface Event {
    id: string
    title: string
    description?: string
    startTime: Date
    endTime: Date
    type: EventTypeEnum
    courseId?: string
    course?: Course
    moduleId?: string
    module?: Module
    comments?: Comment[]
    creatorId: string
    creator?: Teacher
    createdAt: Date
    updatedAt: Date
  }
  
  export interface Team {
    id: string
    name: string
    description?: string
    classId: string
    class?: Class
    students?: Student[]
    exercises?: Exercise[]
    comments?: Comment[]
    createdAt: Date
    updatedAt: Date
    teacherId?: string
    teacher?: Teacher
  }
  
  export interface Client {
    id: string
    name: string
    description?: string
    creatorId: string
    creator?: Teacher
    exercises?: Exercise[]
    createdAt: Date
    updatedAt: Date
  }
  
  export interface Notification {
    id: string
    type: "success" | "error" | "info"
    message: string
    sendTo?: string
    createdBy?: string
    read: boolean
    timestamp: number
  }
  
  export interface ShopItemForSale {
    id: string
    itemType: ShopItemTypeEnum
    itemId: string
    sellPrice: number
    currency: CurrencyTypeEnum
    createdAt: Date
    updatedAt: Date
    course?: Course
    module?: Module
    exercise?: Exercise
    exam?: Exam
    material?: Material
    purchases?: PurchasedItem[]
  }
  
  export interface ShopItemForRent {
    id: string
    itemType: ShopItemTypeEnum
    itemId: string
    rentPrice: number
    rentPeriod: number
    currency: CurrencyTypeEnum
    createdAt: Date
    updatedAt: Date
    course?: Course
    module?: Module
    exercise?: Exercise
    exam?: Exam
    material?: Material
    rentalPeriods?: RentalPeriod[]
    isVisible: boolean
  }
  
  export interface PurchasedItem {
    id: string
    teacherId: string
    teacher?: Teacher
    shopItemId: string
    shopItem?: ShopItemForSale
    purchaseDate: Date
    createdAt: Date
    updatedAt: Date
  }
  
  export interface RentalPeriod {
    id: string
    teacherId: string
    teacher?: Teacher
    shopItemId: string
    shopItem?: ShopItemForRent
    rentStartDate: Date
    rentEndDate: Date
    createdAt: Date
    updatedAt: Date
    isActive: boolean
  }
  
export enum CourseStatusEnum {
    DRAFT = "DRAFT",
    COMPLETED = "COMPLETED",
    ARCHIVED = "ARCHIVED",
  }
  
export enum ExerciseTypeEnum {
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
    TRUE_FALSE = "TRUE_FALSE",
    SHORT_ANSWER = "SHORT_ANSWER",
    LONG_ANSWER = "LONG_ANSWER",
    CODE = "CODE",
    FILE_UPLOAD = "FILE_UPLOAD",
  }
  
export enum DifficultyLevelEnum {
    BEGINNER = "BEGINNER",
    INTERMEDIATE = "INTERMEDIATE",
    ADVANCED = "ADVANCED",
    EXPERT = "EXPERT",
  }
  
export enum ExamTypeEnum {
    QUIZ = "QUIZ",
    MIDTERM = "MIDTERM",
    FINAL = "FINAL",
    PRACTICE = "PRACTICE",
  }
  
export enum MaterialType {
    DOCUMENT = "DOCUMENT",
    VIDEO = "VIDEO",
    AUDIO = "AUDIO",
    LINK = "LINK",
    OTHER = "OTHER",
  }
  
export enum EnrollmentStatusEnum {
    PENDING = "PENDING",
    ACTIVE = "ACTIVE",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
  }
  
export enum EventTypeEnum {
    MEETING = "MEETING",
    PROJECT = "PROJECT",
    OTHER = "OTHER",
  }
  
export enum CurrencyTypeEnum {
    USD = "USD",
    EUR = "EUR",
    GBP = "GBP",
  }
  
export enum PublishStatusEnum {
    PRIVATE = "PRIVATE",
    PUBLISHED_FOR_SALE = "PUBLISHED_FOR_SALE",
    PUBLISHED_FOR_RENT = "PUBLISHED_FOR_RENT",
    PUBLISHED_FOR_BOTH = "PUBLISHED_FOR_BOTH",
  }
  
export enum ShopItemTypeEnum {
    COURSE = "COURSE",
    MODULE = "MODULE",
    EXERCISE = "EXERCISE",
    EXAM = "EXAM",
    MATERIAL = "MATERIAL",
  }
  
  