/**
 * AL-irshaad School Management System - Classes & Subjects Management View Component
 */

import { db, generateUUID } from '../db.js';

class ClassesView {
    constructor(container) {
        this.container = container;
    }

    async render() {
        const teachers = await db.getAll('teachers');

        this.container.innerHTML = `
            <div>
                <h1 class="text-2xl font-black text-white tracking-wide">Classes & Core Subjects</h1>
                <p class="text-xs text-slate-400 mt-1">Configure academic classrooms, assign homeroom primary teachers, and organize subjects.</p>
            </div>

            <!-- Double split panel -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                <!-- Left Panel: Classroom list -->
                <div class="space-y-6 bg-slate-900/30 border border-slate-800/60 p-6 rounded-2xl">
                    <div class="flex justify-between items-center pb-3 border-b border-slate-850">
                        <div class="flex items-center gap-2">
                            <span class="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                </svg>
                            </span>
                            <h3 class="text-xs font-bold text-white uppercase tracking-wider">Academic Classrooms</h3>
                        </div>
                        <button id="btn-add-class" class="px-2.5 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-lg text-[10px] transition flex items-center gap-1 shadow-md shadow-indigo-650/15">
                            ＋ Add Class
                        </button>
                    </div>

                    <!-- Classes List container -->
                    <div class="space-y-3" id="classes-list-container">
                        <!-- Dynamic -->
                    </div>
                </div>

                <!-- Right Panel: Subjects list -->
                <div class="space-y-6 bg-slate-900/30 border border-slate-800/60 p-6 rounded-2xl">
                    <div class="flex justify-between items-center pb-3 border-b border-slate-850">
                        <div class="flex items-center gap-2">
                            <span class="p-1.5 bg-violet-500/10 text-violet-400 rounded-lg">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                                </svg>
                            </span>
                            <h3 class="text-xs font-bold text-white uppercase tracking-wider">Defined Subjects</h3>
                        </div>
                        <button id="btn-add-subject" class="px-2.5 py-1.5 bg-violet-650 hover:bg-violet-600 text-white font-bold rounded-lg text-[10px] transition flex items-center gap-1 shadow-md shadow-violet-650/15">
                            ＋ Add Subject
                        </button>
                    </div>

                    <!-- Subjects list container -->
                    <div class="space-y-3" id="subjects-list-container">
                        <!-- Dynamic -->
                    </div>
                </div>

            </div>

            <!-- MODAL: Add/Edit Class -->
            <div id="modal-class" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
                <div class="bg-[#090e24] border border-slate-800 rounded-2xl w-full max-w-sm p-6 relative shadow-2xl animate-fade-in">
                    <h3 id="modal-class-title" class="text-base font-bold text-white mb-4">Create New Classroom</h3>
                    
                    <form id="form-class" class="space-y-4">
                        <input type="hidden" id="edit-class-id">
                        
                        <div>
                            <label for="c-name" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Classroom Name</label>
                            <input type="text" id="c-name" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition" placeholder="e.g. Grade 10A or Grade 11 Science">
                        </div>

                        <div>
                            <label for="c-homeroom" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assigned Homeroom Teacher</label>
                            <select id="c-homeroom" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition">
                                <option value="">-- Choose Homeroom Teacher --</option>
                                ${teachers.map(t => `<option value="${t.teacherId}">${t.firstName} ${t.lastName}</option>`).join('')}
                            </select>
                        </div>

                        <div>
                            <label for="c-year" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Academic Year Session</label>
                            <input type="text" id="c-year" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition" placeholder="e.g. 2025-2026">
                        </div>

                        <div class="flex justify-end gap-2 pt-4">
                            <button type="button" id="btn-close-class-modal" class="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 font-semibold rounded-xl text-xs transition">
                                Cancel
                            </button>
                            <button type="submit" class="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs transition">
                                Save Classroom
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- MODAL: Add/Edit Subject -->
            <div id="modal-subject" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
                <div class="bg-[#090e24] border border-slate-800 rounded-2xl w-full max-w-sm p-6 relative shadow-2xl animate-fade-in">
                    <h3 id="modal-subject-title" class="text-base font-bold text-white mb-4">Define School Subject</h3>
                    
                    <form id="form-subject" class="space-y-4">
                        <input type="hidden" id="edit-subject-id">
                        
                        <div>
                            <label for="s-name" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Subject Name</label>
                            <input type="text" id="s-name" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition" placeholder="e.g. Mathematics or Islamic Studies">
                        </div>

                        <div>
                            <label for="s-desc" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Curriculum Details / Description</label>
                            <textarea id="s-desc" rows="3" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition resize-none" placeholder="Provide general details of this syllabus course..."></textarea>
                        </div>

                        <div class="flex justify-end gap-2 pt-4">
                            <button type="button" id="btn-close-sub-modal" class="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 font-semibold rounded-xl text-xs transition">
                                Cancel
                            </button>
                            <button type="submit" class="px-4 py-2 bg-violet-650 hover:bg-violet-600 text-white font-bold rounded-xl text-xs transition">
                                Save Subject
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        await this.loadClasses();
        await this.loadSubjects();
        this.registerEvents();
    }

    async loadClasses() {
        const container = document.getElementById('classes-list-container');
        if (!container) return;

        const classes = await db.getAll('classes');
        const teachers = await db.getAll('teachers');
        const students = await db.getAll('students');

        if (classes.length === 0) {
            container.innerHTML = `
                <div class="py-6 text-center text-slate-500 italic text-xs">
                    No academic classes defined.
                </div>
            `;
            return;
        }

        let html = '';
        classes.forEach(c => {
            const homeroom = teachers.find(t => t.teacherId === c.homeroomTeacherId);
            const homeroomName = homeroom ? `Dr. ${homeroom.firstName} ${homeroom.lastName}` : 'Unassigned';
            
            // Student headcount
            const count = students.filter(s => s.currentClassId === c.classId).length;

            html += `
                <div class="p-4 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center justify-between hover:border-slate-800 transition group animate-fade-in">
                    <div>
                        <h4 class="font-extrabold text-sm text-white">${c.name}</h4>
                        <div class="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1 font-medium">
                            <span class="text-indigo-400 font-bold">${c.academicYear} Session</span>
                            <span>•</span>
                            <span>Homeroom: <strong class="text-slate-350">${homeroomName}</strong></span>
                            <span>•</span>
                            <span class="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-semibold text-[9px] uppercase tracking-wide border border-indigo-500/15">${count} Enrolled</span>
                        </div>
                    </div>
                    <div class="flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
                        <button onclick="window.editClass('${c.classId}')" class="p-1 bg-slate-900 border border-slate-800 hover:bg-indigo-650/20 text-indigo-400 hover:text-white rounded transition">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                        </button>
                        <button onclick="window.deleteClass('${c.classId}')" class="p-1 bg-slate-900 border border-slate-800 hover:bg-rose-650/20 text-rose-400 hover:text-white rounded transition">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    async loadSubjects() {
        const container = document.getElementById('subjects-list-container');
        if (!container) return;

        const subjects = await db.getAll('subjects');

        if (subjects.length === 0) {
            container.innerHTML = `
                <div class="py-6 text-center text-slate-500 italic text-xs">
                    No curriculum subjects defined.
                </div>
            `;
            return;
        }

        let html = '';
        subjects.forEach(s => {
            html += `
                <div class="p-4 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center justify-between hover:border-slate-800 transition group animate-fade-in">
                    <div class="overflow-hidden pr-3">
                        <h4 class="font-extrabold text-sm text-white">${s.name}</h4>
                        <p class="text-[10px] text-slate-400 mt-1 leading-relaxed truncate w-64">${s.description || 'No specialized description provided.'}</p>
                    </div>
                    <div class="flex gap-1.5 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                        <button onclick="window.editSubject('${s.subjectId}')" class="p-1 bg-slate-900 border border-slate-800 hover:bg-violet-650/20 text-violet-400 hover:text-white rounded transition">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                        </button>
                        <button onclick="window.deleteSubject('${s.subjectId}')" class="p-1 bg-slate-900 border border-slate-800 hover:bg-rose-650/20 text-rose-400 hover:text-white rounded transition">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    registerEvents() {
        // Modal class triggers
        const modalClass = document.getElementById('modal-class');
        const btnAddClass = document.getElementById('btn-add-class');
        const btnCloseClass = document.getElementById('btn-close-class-modal');
        const formClass = document.getElementById('form-class');

        // Modal subject triggers
        const modalSubject = document.getElementById('modal-subject');
        const btnAddSubject = document.getElementById('btn-add-subject');
        const btnCloseSub = document.getElementById('btn-close-sub-modal');
        const formSubject = document.getElementById('form-subject');

        // Class Modal Actions
        btnAddClass.addEventListener('click', () => {
            formClass.reset();
            document.getElementById('edit-class-id').value = '';
            document.getElementById('modal-class-title').textContent = 'Create New Classroom';
            
            // Set academic year fallback
            db.get('settings', 'academicYear').then(yearSetting => {
                if (yearSetting) document.getElementById('c-year').value = yearSetting.settingValue;
            });

            modalClass.classList.remove('hidden');
        });

        btnCloseClass.addEventListener('click', () => {
            modalClass.classList.add('hidden');
        });

        formClass.addEventListener('submit', async (e) => {
            e.preventDefault();

            const classIdInput = document.getElementById('edit-class-id').value;
            const name = document.getElementById('c-name').value.trim();
            const homeroomTeacherId = document.getElementById('c-homeroom').value;
            const academicYear = document.getElementById('c-year').value.trim();

            const classData = {
                classId: classIdInput || 'class-' + generateUUID().substring(0, 8),
                name,
                homeroomTeacherId,
                academicYear
            };

            try {
                await db.put('classes', classData);
                showNotification(classIdInput ? 'Classroom updated successfully' : 'New classroom created successfully!', 'success');
                modalClass.classList.add('hidden');
                await this.loadClasses();
            } catch (err) {
                console.error(err);
                showNotification(err.message, 'error');
            }
        });

        // Subject Modal Actions
        btnAddSubject.addEventListener('click', () => {
            formSubject.reset();
            document.getElementById('edit-subject-id').value = '';
            document.getElementById('modal-subject-title').textContent = 'Define School Subject';
            modalSubject.classList.remove('hidden');
        });

        btnCloseSub.addEventListener('click', () => {
            modalSubject.classList.add('hidden');
        });

        formSubject.addEventListener('submit', async (e) => {
            e.preventDefault();

            const subjectIdInput = document.getElementById('edit-subject-id').value;
            const name = document.getElementById('s-name').value.trim();
            const description = document.getElementById('s-desc').value.trim();

            const subjectData = {
                subjectId: subjectIdInput || 'sub-' + generateUUID().substring(0, 8),
                name,
                description
            };

            try {
                await db.put('subjects', subjectData);
                showNotification(subjectIdInput ? 'Subject syllabus details updated' : 'School subject defined successfully!', 'success');
                modalSubject.classList.add('hidden');
                await this.loadSubjects();
            } catch (err) {
                console.error(err);
                showNotification(err.message, 'error');
            }
        });

        // Edit Class
        window.editClass = async (classId) => {
            const c = await db.get('classes', classId);
            if (!c) return;

            document.getElementById('edit-class-id').value = c.classId;
            document.getElementById('c-name').value = c.name;
            document.getElementById('c-homeroom').value = c.homeroomTeacherId || '';
            document.getElementById('c-year').value = c.academicYear;

            document.getElementById('modal-class-title').textContent = 'Modify Classroom Config';
            modalClass.classList.remove('hidden');
        };

        // Delete Class
        window.deleteClass = async (classId) => {
            const c = await db.get('classes', classId);
            if (!c) return;

            if (confirm(`Are you sure you want to completely delete class room "${c.name}"? Active students will remain active but marked unassigned.`)) {
                await db.delete('classes', classId);
                
                // Set matching students class to empty
                const currentStds = await db.getAll('students');
                for (const std of currentStds) {
                    if (std.currentClassId === classId) {
                        std.currentClassId = '';
                        await db.put('students', std);
                    }
                }

                showNotification('Classroom deleted, student references cleared', 'success');
                await this.loadClasses();
            }
        };

        // Edit Subject
        window.editSubject = async (subjectId) => {
            const s = await db.get('subjects', subjectId);
            if (!s) return;

            document.getElementById('edit-subject-id').value = s.subjectId;
            document.getElementById('s-name').value = s.name;
            document.getElementById('s-desc').value = s.description || '';

            document.getElementById('modal-subject-title').textContent = 'Modify Syllabus Details';
            modalSubject.classList.remove('hidden');
        };

        // Delete Subject
        window.deleteSubject = async (subjectId) => {
            const s = await db.get('subjects', subjectId);
            if (!s) return;

            if (confirm(`Warning: Deleting subject "${s.name}" will automatically purge any teacher course maps associated to this subject.`)) {
                await db.delete('subjects', subjectId);
                
                // Clean course maps (classSubjects)
                const courseMaps = await db.getAll('classSubjects');
                for (const map of courseMaps) {
                    if (map.subjectId === subjectId) {
                        await db.delete('classSubjects', map.classSubjectId);
                    }
                }

                showNotification('Subject and associated course maps deleted', 'success');
                await this.loadSubjects();
            }
        };
    }
}

export { ClassesView };
