/**
 * AL-irshaad School Management System - Authentication, Encryption & Seeding Helper
 */

import { db, generateUUID } from './db.js';

// Secure Hashing function using Web Cryptography API
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + "AL-irshaad-school-salt");
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Seed Mock Data to make the system highly rich out-of-the-box
async function seedDatabaseIfEmpty() {
    const users = await db.getAll('users');
    if (users.length > 0) {
        console.log('Database already initialized.');
        return;
    }

    console.log('Database empty. Seeding highly premium sample data...');

    // 1. Core Settings
    await db.put('settings', { settingKey: 'schoolName', settingValue: 'AL-irshaad Secondary School' });
    await db.put('settings', { settingKey: 'academicYear', settingValue: '2025-2026' });
    await db.put('settings', { settingKey: 'currentTerm', settingValue: 'Term 1' });
    await db.put('settings', { 
        settingKey: 'gradingScale', 
        settingValue: [
            { grade: 'A+', min: 95, max: 100, gpa: 4.0 },
            { grade: 'A', min: 90, max: 94, gpa: 4.0 },
            { grade: 'B+', min: 85, max: 89, gpa: 3.5 },
            { grade: 'B', min: 80, max: 84, gpa: 3.0 },
            { grade: 'C+', min: 75, max: 79, gpa: 2.5 },
            { grade: 'C', min: 70, max: 74, gpa: 2.0 },
            { grade: 'D', min: 60, max: 69, gpa: 1.0 },
            { grade: 'F', min: 0, max: 59, gpa: 0.0 }
        ] 
    });

    // 2. Admin User
    const adminHashedPassword = await hashPassword('admin123');
    await db.put('users', {
        userId: 'admin-id',
        username: 'admin',
        hashedPassword: adminHashedPassword,
        role: 'Admin',
        name: 'Administrator'
    });

    // 3. Teachers & Teacher Users
    const teacher1Id = 'teacher-1-id';
    const teacher2Id = 'teacher-2-id';

    await db.put('teachers', {
        teacherId: teacher1Id,
        firstName: 'Ahmed',
        lastName: 'Ali',
        contactInfo: { phone: '+252 61 555 1234', email: 'ahmed.ali@irshaad.edu' },
        address: { street: 'Maka Al-Mukarama Rd', city: 'Mogadishu', state: 'Banaadir', zip: '10001' },
        qualification: 'Master of Science in Mathematics',
        specialization: ['Mathematics', 'Physics'],
        hireDate: '2022-09-01'
    });

    await db.put('teachers', {
        teacherId: teacher2Id,
        firstName: 'Saynab',
        lastName: 'Yusuf',
        contactInfo: { phone: '+252 61 555 5678', email: 'saynab.yusuf@irshaad.edu' },
        address: { street: 'Wada Jada', city: 'Mogadishu', state: 'Banaadir', zip: '10001' },
        qualification: 'Bachelor of Education (Chemistry)',
        specialization: ['Chemistry', 'English'],
        hireDate: '2023-08-15'
    });

    const teacherHashedPassword1 = await hashPassword('teacher123');
    const teacherHashedPassword2 = await hashPassword('saynab123');

    await db.put('users', {
        userId: 'user-teacher-1',
        username: 'ahmed',
        hashedPassword: teacherHashedPassword1,
        role: 'Teacher',
        name: 'Dr. Ahmed Ali',
        relatedEntityId: teacher1Id
    });

    await db.put('users', {
        userId: 'user-teacher-2',
        username: 'saynab',
        hashedPassword: teacherHashedPassword2,
        role: 'Teacher',
        name: 'Mrs. Saynab Yusuf',
        relatedEntityId: teacher2Id
    });

    // 4. Classes
    const class1Id = 'class-10a-id';
    const class2Id = 'class-11sci-id';

    await db.put('classes', {
        classId: class1Id,
        name: 'Grade 10A',
        academicYear: '2025-2026',
        homeroomTeacherId: teacher1Id
    });

    await db.put('classes', {
        classId: class2Id,
        name: 'Grade 11 Science',
        academicYear: '2025-2026',
        homeroomTeacherId: teacher2Id
    });

    // 5. Subjects
    const subMathId = 'sub-math-id';
    const subPhysId = 'sub-phys-id';
    const subChemId = 'sub-chem-id';
    const subEngId = 'sub-eng-id';

    await db.put('subjects', { subjectId: subMathId, name: 'Mathematics', description: 'Core math and algebra fundamentals' });
    await db.put('subjects', { subjectId: subPhysId, name: 'Physics', description: 'Classical and analytical physics' });
    await db.put('subjects', { subjectId: subChemId, name: 'Chemistry', description: 'Organic and inorganic chemistry' });
    await db.put('subjects', { subjectId: subEngId, name: 'English Literature', description: 'Grammar, rhetoric, and text analysis' });

    // 6. Assign Subjects to Classes (ClassSubjects mapping)
    await db.put('classSubjects', { classSubjectId: 'cs-1', classId: class1Id, subjectId: subMathId, assignedTeacherId: teacher1Id });
    await db.put('classSubjects', { classSubjectId: 'cs-2', classId: class1Id, subjectId: subPhysId, assignedTeacherId: teacher1Id });
    await db.put('classSubjects', { classSubjectId: 'cs-3', classId: class2Id, subjectId: subChemId, assignedTeacherId: teacher2Id });
    await db.put('classSubjects', { classSubjectId: 'cs-4', classId: class2Id, subjectId: subEngId, assignedTeacherId: teacher2Id });

    // 7. Seed Students
    const student1Id = 'std-1-id';
    const student2Id = 'std-2-id';
    const student3Id = 'std-3-id';
    const student4Id = 'std-4-id';

    await db.put('students', {
        studentId: student1Id,
        firstName: 'Abdi',
        lastName: 'Warsame',
        dateOfBirth: '2010-04-12',
        gender: 'Male',
        address: { street: 'K4 Square', city: 'Mogadishu', state: 'Banaadir', zip: '10001' },
        contactInfo: { phone: '+252 61 777 0001', email: 'abdi.warsame@gmail.com' },
        parentGuardian: { name: 'Warsame Farah', relationship: 'Father', phone: '+252 61 777 0002', email: 'warsame.farah@gmail.com' },
        enrollmentDate: '2024-09-01',
        currentClassId: class1Id,
        photoUrl: '' // Base64 empty placeholder
    });

    await db.put('students', {
        studentId: student2Id,
        firstName: 'Fartun',
        lastName: 'Osman',
        dateOfBirth: '2010-11-23',
        gender: 'Female',
        address: { street: 'Madrassa St', city: 'Mogadishu', state: 'Banaadir', zip: '10001' },
        contactInfo: { phone: '+252 61 777 0003', email: 'fartun.osman@gmail.com' },
        parentGuardian: { name: 'Osman Duale', relationship: 'Father', phone: '+252 61 777 0004', email: 'osman.duale@gmail.com' },
        enrollmentDate: '2024-09-01',
        currentClassId: class1Id,
        photoUrl: ''
    });

    await db.put('students', {
        studentId: student3Id,
        firstName: 'Mohamed',
        lastName: 'Aden',
        dateOfBirth: '2009-08-05',
        gender: 'Male',
        address: { street: 'Hodan District', city: 'Mogadishu', state: 'Banaadir', zip: '10001' },
        contactInfo: { phone: '+252 61 777 0005', email: 'mohamed.aden@gmail.com' },
        parentGuardian: { name: 'Halima Warsame', relationship: 'Mother', phone: '+252 61 777 0006', email: 'halima.w@gmail.com' },
        enrollmentDate: '2023-09-01',
        currentClassId: class2Id,
        photoUrl: ''
    });

    await db.put('students', {
        studentId: student4Id,
        firstName: 'Yasmin',
        lastName: 'Barre',
        dateOfBirth: '2009-01-30',
        gender: 'Female',
        address: { street: 'Waberi District', city: 'Mogadishu', state: 'Banaadir', zip: '10001' },
        contactInfo: { phone: '+252 61 777 0007', email: 'yasmin.barre@gmail.com' },
        parentGuardian: { name: 'Barre Shire', relationship: 'Father', phone: '+252 61 777 0008', email: 'barre.s@gmail.com' },
        enrollmentDate: '2023-09-01',
        currentClassId: class2Id,
        photoUrl: ''
    });

    // 8. Seed some Grades and Attendance to make views populated
    // Grades: Abdi & Fartun in cs-1 (Grade 10A - Math)
    await db.put('grades', {
        gradeId: 'g-1',
        studentId: student1Id,
        classSubjectId: 'cs-1',
        assessmentType: 'Quiz',
        assessmentName: 'Introduction to Functions',
        score: 85,
        maxScore: 100,
        gradePercentage: 85,
        gradeDate: '2026-05-15',
        recordedByUserId: 'user-teacher-1'
    });

    await db.put('grades', {
        gradeId: 'g-2',
        studentId: student2Id,
        classSubjectId: 'cs-1',
        assessmentType: 'Quiz',
        assessmentName: 'Introduction to Functions',
        score: 92,
        maxScore: 100,
        gradePercentage: 92,
        gradeDate: '2026-05-15',
        recordedByUserId: 'user-teacher-1'
    });

    await db.put('grades', {
        gradeId: 'g-3',
        studentId: student1Id,
        classSubjectId: 'cs-1',
        assessmentType: 'Midterm',
        assessmentName: 'Term 1 Midterm Exam',
        score: 78,
        maxScore: 100,
        gradePercentage: 78,
        gradeDate: '2026-05-28',
        recordedByUserId: 'user-teacher-1'
    });

    await db.put('grades', {
        gradeId: 'g-4',
        studentId: student2Id,
        classSubjectId: 'cs-1',
        assessmentType: 'Midterm',
        assessmentName: 'Term 1 Midterm Exam',
        score: 95,
        maxScore: 100,
        gradePercentage: 95,
        gradeDate: '2026-05-28',
        recordedByUserId: 'user-teacher-1'
    });

    // Attendance
    const todayStr = '2026-05-31';
    await db.put('attendanceRecords', {
        attendanceRecordId: 'a-1',
        studentId: student1Id,
        classSubjectId: 'cs-1',
        date: todayStr,
        status: 'Present',
        notes: '',
        recordedByUserId: 'user-teacher-1'
    });

    await db.put('attendanceRecords', {
        attendanceRecordId: 'a-2',
        studentId: student2Id,
        classSubjectId: 'cs-1',
        date: todayStr,
        status: 'Late',
        notes: 'Arrived 10 minutes late due to traffic',
        recordedByUserId: 'user-teacher-1'
    });

    await db.put('attendanceRecords', {
        attendanceRecordId: 'a-3',
        studentId: student3Id,
        classSubjectId: 'cs-3',
        date: todayStr,
        status: 'Present',
        notes: '',
        recordedByUserId: 'user-teacher-2'
    });

    await db.put('attendanceRecords', {
        attendanceRecordId: 'a-4',
        studentId: student4Id,
        classSubjectId: 'cs-3',
        date: todayStr,
        status: 'Absent',
        notes: 'Sick leave',
        recordedByUserId: 'user-teacher-2'
    });

    console.log('Database successfully seeded!');
}

class AuthService {
    constructor() {
        this.currentUserKey = 'al_irshaad_session_user';
    }

    async login(username, password, rememberMe = false) {
        const storedUserList = await db.getByIndex('users', 'username', username);
        if (storedUserList.length === 0) {
            throw new Error('User not found');
        }

        const user = storedUserList[0];
        const enteredHashed = await hashPassword(password);
        if (user.hashedPassword !== enteredHashed) {
            throw new Error('Invalid password');
        }

        const sessionUser = {
            userId: user.userId,
            username: user.username,
            role: user.role,
            name: user.name || user.username,
            relatedEntityId: user.relatedEntityId || null
        };

        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem(this.currentUserKey, JSON.stringify(sessionUser));
        return sessionUser;
    }

    logout() {
        localStorage.removeItem(this.currentUserKey);
        sessionStorage.removeItem(this.currentUserKey);
    }

    getCurrentUser() {
        const sessionVal = sessionStorage.getItem(this.currentUserKey) || localStorage.getItem(this.currentUserKey);
        return sessionVal ? JSON.parse(sessionVal) : null;
    }

    isAuthenticated() {
        return this.getCurrentUser() !== null;
    }

    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'Admin';
    }

    isTeacher() {
        const user = this.getCurrentUser();
        return user && user.role === 'Teacher';
    }
}

const auth = new AuthService();
export { auth, hashPassword, seedDatabaseIfEmpty };
