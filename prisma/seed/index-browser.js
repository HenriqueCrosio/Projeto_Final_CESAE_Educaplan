
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.3.0
 * Query Engine version: acc0b9dd43eb689cbd20c9470515d719db10d0b0
 */
Prisma.prismaVersion = {
  client: "6.3.0",
  engine: "acc0b9dd43eb689cbd20c9470515d719db10d0b0"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  emailVerified: 'emailVerified',
  userApiToken: 'userApiToken',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  lastAccessedAt: 'lastAccessedAt',
  isActive: 'isActive',
  isDeleted: 'isDeleted'
};

exports.Prisma.AdminScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  firstName: 'firstName',
  lastName: 'lastName',
  displayName: 'displayName',
  bio: 'bio',
  birthDate: 'birthDate',
  phoneNumber: 'phoneNumber'
};

exports.Prisma.RoleScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description'
};

exports.Prisma.UserRoleScalarFieldEnum = {
  userId: 'userId',
  roleId: 'roleId'
};

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  provider: 'provider',
  providerAccountId: 'providerAccountId',
  refresh_token: 'refresh_token',
  access_token: 'access_token',
  expires_at: 'expires_at',
  token_type: 'token_type',
  scope: 'scope',
  id_token: 'id_token',
  session_state: 'session_state',
  oauth_token_secret: 'oauth_token_secret',
  oauth_token: 'oauth_token'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  sessionToken: 'sessionToken',
  userId: 'userId',
  expires: 'expires'
};

exports.Prisma.TeacherScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  specialization: 'specialization'
};

exports.Prisma.StudentScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  studentId: 'studentId',
  enrollYear: 'enrollYear',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  addedById: 'addedById'
};

exports.Prisma.CourseScalarFieldEnum = {
  id: 'id',
  slug: 'slug',
  name: 'name',
  description: 'description',
  category: 'category',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  creatorId: 'creatorId',
  ownerId: 'ownerId',
  publishStatus: 'publishStatus'
};

exports.Prisma.ModuleScalarFieldEnum = {
  id: 'id',
  slug: 'slug',
  name: 'name',
  description: 'description',
  category: 'category',
  totalHours: 'totalHours',
  averageHoursPerLesson: 'averageHoursPerLesson',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  creatorId: 'creatorId',
  ownerId: 'ownerId',
  courseId: 'courseId',
  publishStatus: 'publishStatus'
};

exports.Prisma.LessonScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  duration: 'duration',
  order: 'order',
  moduleId: 'moduleId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TopicScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  order: 'order',
  moduleId: 'moduleId'
};

exports.Prisma.ObjectiveScalarFieldEnum = {
  id: 'id',
  description: 'description',
  topicId: 'topicId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ModuleAssignmentScalarFieldEnum = {
  id: 'id',
  moduleId: 'moduleId',
  teacherId: 'teacherId',
  courseId: 'courseId',
  hourlyRate: 'hourlyRate',
  currency: 'currency',
  startDate: 'startDate',
  endDate: 'endDate'
};

exports.Prisma.ExerciseScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  content: 'content',
  type: 'type',
  difficulty: 'difficulty',
  points: 'points',
  timeLimit: 'timeLimit',
  topicId: 'topicId',
  isTeamExercise: 'isTeamExercise',
  creatorId: 'creatorId',
  ownerId: 'ownerId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  clientId: 'clientId',
  publishStatus: 'publishStatus'
};

exports.Prisma.ExamScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  type: 'type',
  moduleId: 'moduleId',
  date: 'date',
  duration: 'duration',
  maxScore: 'maxScore',
  creatorId: 'creatorId',
  ownerId: 'ownerId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  publishStatus: 'publishStatus'
};

exports.Prisma.ExamExerciseScalarFieldEnum = {
  examId: 'examId',
  exerciseId: 'exerciseId',
  order: 'order'
};

exports.Prisma.MaterialScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  url: 'url',
  type: 'type',
  courseId: 'courseId',
  moduleId: 'moduleId',
  topicId: 'topicId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  creatorId: 'creatorId',
  ownerId: 'ownerId',
  publishStatus: 'publishStatus'
};

exports.Prisma.CommentScalarFieldEnum = {
  id: 'id',
  content: 'content',
  userId: 'userId',
  courseId: 'courseId',
  moduleId: 'moduleId',
  topicId: 'topicId',
  materialId: 'materialId',
  enrollmentId: 'enrollmentId',
  classId: 'classId',
  teamId: 'teamId',
  eventId: 'eventId',
  lessonId: 'lessonId',
  examId: 'examId',
  exerciseId: 'exerciseId',
  studentId: 'studentId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EnrollmentScalarFieldEnum = {
  id: 'id',
  courseId: 'courseId',
  classId: 'classId',
  status: 'status',
  startDate: 'startDate',
  endDate: 'endDate',
  totalPrice: 'totalPrice',
  currency: 'currency',
  teacherId: 'teacherId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ClassScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  color: 'color',
  courseId: 'courseId',
  teacherId: 'teacherId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.HolidayScalarFieldEnum = {
  id: 'id',
  name: 'name',
  startDate: 'startDate',
  endDate: 'endDate',
  enrollmentId: 'enrollmentId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LessonScheduleScalarFieldEnum = {
  id: 'id',
  lessonId: 'lessonId',
  dateTime: 'dateTime',
  duration: 'duration',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  teacherId: 'teacherId'
};

exports.Prisma.EventScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  startTime: 'startTime',
  endTime: 'endTime',
  type: 'type',
  courseId: 'courseId',
  moduleId: 'moduleId',
  creatorId: 'creatorId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TeamScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  classId: 'classId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  teacherId: 'teacherId'
};

exports.Prisma.ClientScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  creatorId: 'creatorId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  title: 'title',
  message: 'message',
  type: 'type',
  teacherId: 'teacherId',
  studentId: 'studentId',
  seen: 'seen',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ShopItemForSaleScalarFieldEnum = {
  id: 'id',
  itemType: 'itemType',
  itemId: 'itemId',
  sellPrice: 'sellPrice',
  currency: 'currency',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ShopItemForRentScalarFieldEnum = {
  id: 'id',
  itemType: 'itemType',
  itemId: 'itemId',
  rentPrice: 'rentPrice',
  rentPeriod: 'rentPeriod',
  currency: 'currency',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  isVisible: 'isVisible'
};

exports.Prisma.PurchasedItemScalarFieldEnum = {
  id: 'id',
  teacherId: 'teacherId',
  shopItemId: 'shopItemId',
  purchaseDate: 'purchaseDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RentalPeriodScalarFieldEnum = {
  id: 'id',
  teacherId: 'teacherId',
  shopItemId: 'shopItemId',
  rentStartDate: 'rentStartDate',
  rentEndDate: 'rentEndDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  isActive: 'isActive'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.CourseStatusEnum = exports.$Enums.CourseStatusEnum = {
  DRAFT: 'DRAFT',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED'
};

exports.PublishStatusEnum = exports.$Enums.PublishStatusEnum = {
  PRIVATE: 'PRIVATE',
  PUBLISHED_FOR_SALE: 'PUBLISHED_FOR_SALE',
  PUBLISHED_FOR_RENT: 'PUBLISHED_FOR_RENT',
  PUBLISHED_FOR_BOTH: 'PUBLISHED_FOR_BOTH'
};

exports.CurrencyTypeEnum = exports.$Enums.CurrencyTypeEnum = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP'
};

exports.ExerciseTypeEnum = exports.$Enums.ExerciseTypeEnum = {
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  TRUE_FALSE: 'TRUE_FALSE',
  SHORT_ANSWER: 'SHORT_ANSWER',
  LONG_ANSWER: 'LONG_ANSWER',
  CODE: 'CODE',
  FILE_UPLOAD: 'FILE_UPLOAD'
};

exports.DifficultyLevelEnum = exports.$Enums.DifficultyLevelEnum = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
  EXPERT: 'EXPERT'
};

exports.ExamTypeEnum = exports.$Enums.ExamTypeEnum = {
  QUIZ: 'QUIZ',
  MIDTERM: 'MIDTERM',
  FINAL: 'FINAL',
  PRACTICE: 'PRACTICE'
};

exports.MaterialType = exports.$Enums.MaterialType = {
  DOCUMENT: 'DOCUMENT',
  VIDEO: 'VIDEO',
  AUDIO: 'AUDIO',
  LINK: 'LINK',
  OTHER: 'OTHER'
};

exports.EnrollmentStatusEnum = exports.$Enums.EnrollmentStatusEnum = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

exports.EventTypeEnum = exports.$Enums.EventTypeEnum = {
  MEETING: 'MEETING',
  PROJECT: 'PROJECT',
  OTHER: 'OTHER'
};

exports.NotificationTypeEnum = exports.$Enums.NotificationTypeEnum = {
  CREATED: 'CREATED',
  UPDATED: 'UPDATED',
  DELETED: 'DELETED',
  CLASS_STARTED: 'CLASS_STARTED',
  CLASS_ENDED: 'CLASS_ENDED',
  ENROLLMENT: 'ENROLLMENT',
  OTHER: 'OTHER'
};

exports.ShopItemTypeEnum = exports.$Enums.ShopItemTypeEnum = {
  COURSE: 'COURSE',
  MODULE: 'MODULE',
  EXERCISE: 'EXERCISE',
  EXAM: 'EXAM',
  MATERIAL: 'MATERIAL'
};

exports.Prisma.ModelName = {
  User: 'User',
  Admin: 'Admin',
  Profile: 'Profile',
  Role: 'Role',
  UserRole: 'UserRole',
  Account: 'Account',
  Session: 'Session',
  Teacher: 'Teacher',
  Student: 'Student',
  Course: 'Course',
  Module: 'Module',
  Lesson: 'Lesson',
  Topic: 'Topic',
  Objective: 'Objective',
  ModuleAssignment: 'ModuleAssignment',
  Exercise: 'Exercise',
  Exam: 'Exam',
  ExamExercise: 'ExamExercise',
  Material: 'Material',
  Comment: 'Comment',
  Enrollment: 'Enrollment',
  Class: 'Class',
  Holiday: 'Holiday',
  LessonSchedule: 'LessonSchedule',
  Event: 'Event',
  Team: 'Team',
  Client: 'Client',
  Notification: 'Notification',
  ShopItemForSale: 'ShopItemForSale',
  ShopItemForRent: 'ShopItemForRent',
  PurchasedItem: 'PurchasedItem',
  RentalPeriod: 'RentalPeriod'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
