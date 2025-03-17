import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

async function readJSONFile(filename) {
  try {
    const data = await fs.readFile(filename, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT' || error instanceof SyntaxError) {
      return [];
    }
    throw error;
  }
}

async function writeJSONFile(filename, data) {
  await fs.writeFile(filename, JSON.stringify(data, null, 2));
}

async function createRolesUserAndTeacher() {
  const roles = [
    { id: uuidv4(), name: 'teacher', description: 'Teacher role' },
    { id: uuidv4(), name: 'student', description: 'Student role' },
    { id: uuidv4(), name: 'entity', description: 'Entity role' },
    { id: uuidv4(), name: 'admin', description: 'Admin role' }
  ];

  const user = {
    id: uuidv4(),
    email: 'pedrotfrodrigues@gmail.com',
    emailVerified: new Date().toISOString(),
    userApiToken: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastAccessedAt: new Date().toISOString(),
    isActive: true,
    isDeleted: false
  };

  const profile = {
    id: uuidv4(),
    userId: user.id,
    firstName: null,
    lastName: null,
    displayName: null,
    bio: null,
    birthDate: null,
    phoneNumber: null
  };

  const teacherRole = roles.find(role => role.name === 'teacher');
  const userRole = {
    userId: user.id,
    roleId: teacherRole.id
  };

  const teacher = {
    id: uuidv4(),
    userId: user.id,
    specialization: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const account = {
    id: uuidv4(),
    userId: user.id,
    type: null,
    provider: null,
    providerAccountId: null,
    refresh_token: null,
    access_token: null,
    expires_at: null,
    token_type: null,
    scope: null,
    id_token: null,
    session_state: null,
    oauth_token_secret: null,
    oauth_token: null
  };

  try {
    // Update role.data.json
    await writeJSONFile('role.data.json', roles);
    console.log('Roles created successfully');

    // Update user.data.json
    const usersData = await readJSONFile('user.data.json');
    usersData.push(user);
    await writeJSONFile('user.data.json', usersData);
    console.log('User created successfully');

    // Update profile.data.json
    const profilesData = await readJSONFile('profile.data.json');
    profilesData.push(profile);
    await writeJSONFile('profile.data.json', profilesData);
    console.log('Profile created successfully');

    // Update userrole.data.json
    const userRolesData = await readJSONFile('userrole.data.json');
    userRolesData.push(userRole);
    await writeJSONFile('userrole.data.json', userRolesData);
    console.log('User role association created successfully');

    // Update teacher.data.json
    const teachersData = await readJSONFile('teacher.data.json');
    teachersData.push(teacher);
    await writeJSONFile('teacher.data.json', teachersData);
    console.log('Teacher created and associated with user successfully');

    // Update account.data.json
    const accountsData = await readJSONFile('account.data.json');
    accountsData.push(account);
    await writeJSONFile('account.data.json', accountsData);
    console.log('Account created successfully');

  } catch (error) {
    console.error('Error updating data files:', error);
  }
}

createRolesUserAndTeacher();