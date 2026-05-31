/**
 * AL-irshaad School Management System - IndexedDB Wrapper
 */

const DB_NAME = 'AlIrshaadSchoolDB';
const DB_VERSION = 1;

class SchoolDB {
    constructor() {
        this.db = null;
    }

    async init() {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => {
                console.error('Database failed to open:', event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('Database opened successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                console.log('Database upgrade/initialization running...');

                // 1. Users Store
                if (!db.objectStoreNames.contains('users')) {
                    const store = db.createObjectStore('users', { keyPath: 'userId' });
                    store.createIndex('username', 'username', { unique: true });
                    store.createIndex('role', 'role', { unique: false });
                }

                // 2. Students Store
                if (!db.objectStoreNames.contains('students')) {
                    const store = db.createObjectStore('students', { keyPath: 'studentId' });
                    store.createIndex('firstName', 'firstName', { unique: false });
                    store.createIndex('lastName', 'lastName', { unique: false });
                    store.createIndex('currentClassId', 'currentClassId', { unique: false });
                }

                // 3. Teachers Store
                if (!db.objectStoreNames.contains('teachers')) {
                    const store = db.createObjectStore('teachers', { keyPath: 'teacherId' });
                    store.createIndex('firstName', 'firstName', { unique: false });
                    store.createIndex('lastName', 'lastName', { unique: false });
                }

                // 4. Classes Store
                if (!db.objectStoreNames.contains('classes')) {
                    const store = db.createObjectStore('classes', { keyPath: 'classId' });
                    store.createIndex('name', 'name', { unique: false });
                    store.createIndex('academicYear', 'academicYear', { unique: false });
                }

                // 5. Subjects Store
                if (!db.objectStoreNames.contains('subjects')) {
                    const store = db.createObjectStore('subjects', { keyPath: 'subjectId' });
                    store.createIndex('name', 'name', { unique: true });
                }

                // 6. ClassSubjects Store (Many-to-Many + Teacher mapping)
                if (!db.objectStoreNames.contains('classSubjects')) {
                    const store = db.createObjectStore('classSubjects', { keyPath: 'classSubjectId' });
                    store.createIndex('classId', 'classId', { unique: false });
                    store.createIndex('subjectId', 'subjectId', { unique: false });
                    store.createIndex('assignedTeacherId', 'assignedTeacherId', { unique: false });
                }

                // 7. Attendance Records Store
                if (!db.objectStoreNames.contains('attendanceRecords')) {
                    const store = db.createObjectStore('attendanceRecords', { keyPath: 'attendanceRecordId' });
                    store.createIndex('studentId', 'studentId', { unique: false });
                    store.createIndex('classSubjectId', 'classSubjectId', { unique: false });
                    store.createIndex('date', 'date', { unique: false });
                }

                // 8. Grades Store
                if (!db.objectStoreNames.contains('grades')) {
                    const store = db.createObjectStore('grades', { keyPath: 'gradeId' });
                    store.createIndex('studentId', 'studentId', { unique: false });
                    store.createIndex('classSubjectId', 'classSubjectId', { unique: false });
                    store.createIndex('assessmentType', 'assessmentType', { unique: false });
                }

                // 9. Settings Store
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'settingKey' });
                }
            };
        });
    }

    // Generic Operations helper
    async getStore(storeName, mode = 'readonly') {
        const db = await this.init();
        const transaction = db.transaction(storeName, mode);
        return transaction.objectStore(storeName);
    }

    // Write data
    async put(storeName, value) {
        const store = await this.getStore(storeName, 'readwrite');
        return new Promise((resolve, reject) => {
            const request = store.put(value);
            request.onsuccess = () => resolve(value);
            request.onerror = (e) => reject(e.target.error);
        });
    }

    // Read single
    async get(storeName, key) {
        const store = await this.getStore(storeName, 'readonly');
        return new Promise((resolve, reject) => {
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = (e) => reject(e.target.error);
        });
    }

    // Read all
    async getAll(storeName) {
        const store = await this.getStore(storeName, 'readonly');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = (e) => reject(e.target.error);
        });
    }

    // Delete single
    async delete(storeName, key) {
        const store = await this.getStore(storeName, 'readwrite');
        return new Promise((resolve, reject) => {
            const request = store.delete(key);
            request.onsuccess = () => resolve(true);
            request.onerror = (e) => reject(e.target.error);
        });
    }

    // Query using indexes
    async getByIndex(storeName, indexName, queryValue) {
        const store = await this.getStore(storeName, 'readonly');
        const index = store.index(indexName);
        return new Promise((resolve, reject) => {
            const request = index.getAll(queryValue);
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = (e) => reject(e.target.error);
        });
    }

    // Custom clear store
    async clearStore(storeName) {
        const store = await this.getStore(storeName, 'readwrite');
        return new Promise((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = () => resolve(true);
            request.onerror = (e) => reject(e.target.error);
        });
    }
}

// Generate secure simple UUID
function generateUUID() {
    return 'uuid-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

const db = new SchoolDB();
export { db, generateUUID };
