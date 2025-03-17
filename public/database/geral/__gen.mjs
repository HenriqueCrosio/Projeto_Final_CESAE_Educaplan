import fs from 'fs/promises';

const models = [
  'User',
  'Admin',
  'Profile',
  'Role',
  'UserRole',
  'Account',
  'Session',
  'Teacher',
  'Student',
  'Course',
  'Module',
  'Lesson',
  'Topic',
  'Objective',
  'ModuleAssignment',
  'Exercise',
  'Exam',
  'ExamExercise',
  'Material',
  'Comment',
  'Enrollment',
  'Class',
  'Holiday',
  'LessonSchedule',
  'Event',
  'Team',
  'Client',
  'Notification',
  'ShopItemForSale',
  'ShopItemForRent',
  'PurchasedItem',
  'RentalPeriod'
];

async function generateJsonFiles() {
  for (const model of models) {
    const fileName = `${model.toLowerCase()}.data.json`;
    const emptyData = [];
    
    try {
      await fs.writeFile(fileName, JSON.stringify(emptyData, null, 2));
      console.log(`Created ${fileName}`);
    } catch (error) {
      console.error(`Error creating ${fileName}:`, error);
    }
  }
}

generateJsonFiles();