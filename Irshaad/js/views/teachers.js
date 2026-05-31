/**
 * AL-irshaad School Management System - Teachers Management View Component
 */

import { db, generateUUID } from '../db.js';

class TeachersView {
    constructor(container) {
        this.container = container;
    }

    async render() {
        const subjects = await db.getAll('subjects');
        const classes = await db.getAll('classes');

        this.container.innerHTML = `
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 class="text-2xl font-black text-white tracking-wide">Teacher Faculty Registry</h1>
                    <p class="text-xs text-slate-400 mt-1">Manage teacher details, professional credentials, and subject assignments.</p>
                </div>
                <button id="btn-add-teacher" class="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                    </svg>
                    <span>Register New Teacher</span>
                </button>
            </div>

            <!-- Double Column layout -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Left Directory (2 Cols) -->
                <div class="lg:col-span-2 space-y-5" id="teachers-list-container">
                    <!-- Populated dynamically -->
                </div>

                <!-- Right Assignments Panel (1 Col) -->
                <div class="bg-slate-900/30 border border-slate-800/60 p-6 rounded-2xl space-y-4">
                    <div class="flex items-center gap-2 pb-2 border-b border-slate-850">
                        <span class="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                            </svg>
                        </span>
                        <h3 class="text-xs font-bold text-white uppercase tracking-wider">Assign Subject & Class</h3>
                    </div>

                    <form id="form-assign-subject" class="space-y-4">
                        <div>
                            <label for="assign-teacher" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Select Teacher</label>
                            <select id="assign-teacher" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition">
                                <option value="">-- Select Teacher --</option>
                            </select>
                        </div>
                        <div>
                            <label for="assign-class" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Class</label>
                            <select id="assign-class" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition">
                                <option value="">-- Select Class --</option>
                                ${classes.map(c => `<option value="${c.classId}">${c.name}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label for="assign-subject" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Subject</label>
                            <select id="assign-subject" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition">
                                <option value="">-- Select Subject --</option>
                                ${subjects.map(s => `<option value="${s.subjectId}">${s.name}</option>`).join('')}
                            </select>
                        </div>

                        <button type="submit" class="w-full bg-indigo-650 hover:bg-indigo-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-md shadow-indigo-650/15">
                            Add Course Assignment
                        </button>
                    </form>

                    <!-- Assignments list -->
                    <div class="border-t border-slate-850 pt-4 space-y-2">
                        <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Course Assignments</h4>
                        <div class="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1" id="active-assignments-container">
                            <!-- Populated dynamically -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- MODAL: Add/Edit Teacher -->
            <div id="modal-teacher" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
                <div class="bg-[#090e24] border border-slate-800 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <h3 id="modal-teacher-title" class="text-base font-bold text-white mb-4">Register Faculty Teacher</h3>
                    
                    <form id="form-teacher" class="space-y-4">
                        <input type="hidden" id="edit-teacher-id">
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label for="t-first" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">First Name</label>
                                <input type="text" id="t-first" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition">
                            </div>
                            <div>
                                <label for="t-last" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Last Name</label>
                                <input type="text" id="t-last" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition">
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label for="t-phone" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mobile Phone</label>
                                <input type="tel" id="t-phone" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition">
                            </div>
                            <div>
                                <label for="t-email" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
                                <input type="email" id="t-email" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition">
                            </div>
                        </div>

                        <div>
                            <label for="t-qualification" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Academic Credentials</label>
                            <input type="text" id="t-qualification" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition" placeholder="e.g. Master of Science in Mathematics">
                        </div>

                        <div>
                            <label for="t-specialization" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Specialized Focus Subjects (comma separated)</label>
                            <input type="text" id="t-specialization" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition" placeholder="e.g. Mathematics, Physics">
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label for="t-street" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Street Address</label>
                                <input type="text" id="t-street" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition">
                            </div>
                            <div>
                                <label for="t-city" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">City Location</label>
                                <input type="text" id="t-city" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition">
                            </div>
                        </div>

                        <div>
                            <label for="t-joined" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Faculty Hiring Date</label>
                            <input type="date" id="t-joined" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition">
                        </div>

                        <div class="flex justify-end gap-2 pt-4">
                            <button type="button" id="btn-close-teacher-modal" class="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 font-semibold rounded-xl text-xs transition">
                                Cancel
                            </button>
                            <button type="submit" class="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs transition">
                                Save Teacher Profile
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        await this.loadTeachers();
        await this.loadAssignments();
        this.registerEvents();
    }

    async loadTeachers() {
        const container = document.getElementById('teachers-list-container');
        if (!container) return;

        const teachers = await db.getAll('teachers');
        const classes = await db.getAll('classes');
        const selectAssign = document.getElementById('assign-teacher');

        // Populate dropdown as well
        let selectHtml = '<option value="">-- Select Teacher --</option>';

        if (teachers.length === 0) {
            container.innerHTML = `
                <div class="py-12 text-center text-slate-500 italic bg-slate-900/10 border border-slate-850/40 rounded-2xl">
                    No teacher profiles registered yet.
                </div>
            `;
            selectAssign.innerHTML = selectHtml;
            return;
        }

        let html = '';
        teachers.forEach(t => {
            selectHtml += `<option value="${t.teacherId}">Dr. ${t.firstName} ${t.lastName}</option>`;

            // Homeroom class mapping
            const homeroomClass = classes.find(c => c.homeroomTeacherId === t.teacherId);
            const homeroomText = homeroomClass 
                ? `<span class="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[9px] uppercase tracking-wide">Homeroom: ${homeroomClass.name}</span>`
                : '';

            const specializedBadgeList = t.specialization 
                ? t.specialization.map(spec => `<span class="px-2 py-0.5 rounded bg-slate-950 border border-slate-800/80 text-slate-400 font-semibold text-[10px]">${spec}</span>`).join(' ') 
                : '';

            html += `
                <div class="bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-indigo-500/20 transition duration-300">
                    <div class="space-y-2.5">
                        <div class="flex items-center gap-2">
                            <h3 class="font-extrabold text-sm text-white">${t.firstName} ${t.lastName}</h3>
                            ${homeroomText}
                        </div>
                        <div class="text-[11px] text-slate-400 leading-relaxed font-medium">
                            <span class="text-indigo-300 font-semibold">${t.qualification}</span>
                            <span class="mx-1.5 opacity-40">•</span>
                            <span>Email: <strong class="text-slate-300">${t.contactInfo.email}</strong></span>
                            <span class="mx-1.5 opacity-40">•</span>
                            <span>Phone: <strong class="text-slate-300">${t.contactInfo.phone}</strong></span>
                        </div>
                        <div class="flex items-center gap-1.5 flex-wrap">
                            ${specializedBadgeList}
                        </div>
                    </div>

                    <div class="flex sm:flex-col gap-2 w-full sm:w-auto text-right">
                        <span class="hidden sm:inline text-[9px] text-slate-500 font-bold uppercase tracking-wider">Hired: ${t.hireDate}</span>
                        <div class="flex gap-1.5 justify-end">
                            <button onclick="window.editTeacher('${t.teacherId}')" class="p-1.5 bg-slate-900 border border-slate-800 hover:bg-indigo-650/20 hover:text-white text-indigo-400 rounded-lg transition" title="Edit Teacher">
                                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                </svg>
                            </button>
                            <button onclick="window.deleteTeacher('${t.teacherId}')" class="p-1.5 bg-slate-900 border border-slate-800 hover:bg-rose-650/20 hover:text-white text-rose-400 rounded-lg transition" title="Remove Teacher">
                                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        selectAssign.innerHTML = selectHtml;
    }

    async loadAssignments() {
        const container = document.getElementById('active-assignments-container');
        if (!container) return;

        const classSubjects = await db.getAll('classSubjects');
        const teachers = await db.getAll('teachers');
        const classes = await db.getAll('classes');
        const subjects = await db.getAll('subjects');

        if (classSubjects.length === 0) {
            container.innerHTML = `
                <div class="py-4 text-center text-slate-500 italic text-[11px]">
                    No subject mappings assigned yet.
                </div>
            `;
            return;
        }

        let html = '';
        classSubjects.forEach(cs => {
            const teacher = teachers.find(t => t.teacherId === cs.assignedTeacherId);
            const matchingClass = classes.find(c => c.classId === cs.classId);
            const subject = subjects.find(s => s.subjectId === cs.subjectId);

            const tName = teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unassigned';
            const cName = matchingClass ? matchingClass.name : 'Unknown Class';
            const sName = subject ? subject.name : 'Unknown Subject';

            html += `
                <div class="p-3 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center justify-between text-[11px] group">
                    <div class="overflow-hidden pr-2">
                        <div class="flex items-center gap-1.5">
                            <span class="font-bold text-white">${cName}</span>
                            <span class="text-slate-500">→</span>
                            <span class="font-semibold text-indigo-400">${sName}</span>
                        </div>
                        <p class="text-[10px] text-slate-400 mt-0.5 truncate">Teacher: Dr. ${tName}</p>
                    </div>
                    <button onclick="window.removeAssignment('${cs.classSubjectId}')" class="p-1 bg-slate-900 hover:bg-red-950 hover:text-rose-400 text-slate-500 border border-slate-800 rounded opacity-0 group-hover:opacity-100 transition">
                        ✕
                    </button>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    registerEvents() {
        const modal = document.getElementById('modal-teacher');
        const btnAdd = document.getElementById('btn-add-teacher');
        const btnClose = document.getElementById('btn-close-teacher-modal');
        const form = document.getElementById('form-teacher');
        const formAssign = document.getElementById('form-assign-subject');

        btnAdd.addEventListener('click', () => {
            form.reset();
            document.getElementById('edit-teacher-id').value = '';
            document.getElementById('modal-teacher-title').textContent = 'Register Faculty Teacher';
            document.getElementById('t-joined').value = new Date().toISOString().substring(0, 10);
            modal.classList.remove('hidden');
        });

        btnClose.addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        // Save profile
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const teacherIdInput = document.getElementById('edit-teacher-id').value;
            const firstName = document.getElementById('t-first').value.trim();
            const lastName = document.getElementById('t-last').value.trim();
            const phone = document.getElementById('t-phone').value.trim();
            const email = document.getElementById('t-email').value.trim();
            const qualification = document.getElementById('t-qualification').value.trim();
            const specialString = document.getElementById('t-specialization').value.trim();
            const street = document.getElementById('t-street').value.trim();
            const city = document.getElementById('t-city').value.trim();
            const hireDate = document.getElementById('t-joined').value;

            // specialized splits
            const specialization = specialString.split(',').map(s => s.trim()).filter(s => s !== '');

            const teacherData = {
                teacherId: teacherIdInput || 'teach-' + generateUUID().substring(0, 12),
                firstName,
                lastName,
                contactInfo: { phone, email },
                qualification,
                specialization,
                address: { street, city, state: 'Banaadir', zip: '10001' },
                hireDate
            };

            try {
                await db.put('teachers', teacherData);
                showNotification(teacherIdInput ? 'Teacher profile updated' : 'Teacher registered successfully!', 'success');
                modal.classList.add('hidden');
                await this.loadTeachers();
            } catch (err) {
                console.error(err);
                showNotification('Failed to save profile: ' + err.message, 'error');
            }
        });

        // Assign Course mapping
        formAssign.addEventListener('submit', async (e) => {
            e.preventDefault();

            const assignedTeacherId = document.getElementById('assign-teacher').value;
            const classId = document.getElementById('assign-class').value;
            const subjectId = document.getElementById('assign-subject').value;

            const assignment = {
                classSubjectId: `cs-${generateUUID().substring(0, 8)}`,
                classId,
                subjectId,
                assignedTeacherId
            };

            try {
                // Ensure duplicate combination doesn't exist
                const current = await db.getAll('classSubjects');
                const dup = current.find(c => c.classId === classId && c.subjectId === subjectId);
                if (dup) {
                    throw new Error('Course Mapping (Subject + Class) is already assigned!');
                }

                await db.put('classSubjects', assignment);
                showNotification('Course subject assigned successfully', 'success');
                formAssign.reset();
                await this.loadAssignments();
            } catch (err) {
                console.error(err);
                showNotification(err.message, 'error');
            }
        });

        // Edit
        window.editTeacher = async (teacherId) => {
            const t = await db.get('teachers', teacherId);
            if (!t) return;

            document.getElementById('edit-teacher-id').value = t.teacherId;
            document.getElementById('t-first').value = t.firstName;
            document.getElementById('t-last').value = t.lastName;
            document.getElementById('t-phone').value = t.contactInfo.phone;
            document.getElementById('t-email').value = t.contactInfo.email;
            document.getElementById('t-qualification').value = t.qualification;
            document.getElementById('t-specialization').value = t.specialization ? t.specialization.join(', ') : '';
            document.getElementById('t-street').value = t.address ? t.address.street : '';
            document.getElementById('t-city').value = t.address ? t.address.city : '';
            document.getElementById('t-joined').value = t.hireDate;

            document.getElementById('modal-teacher-title').textContent = 'Modify Teacher Profile';
            modal.classList.remove('hidden');
        };

        // Delete
        window.deleteTeacher = async (teacherId) => {
            const t = await db.get('teachers', teacherId);
            if (!t) return;

            if (confirm(`Are you sure you want to remove teacher "${t.firstName} ${t.lastName}" from faculty? This will unlink their associated logins.`)) {
                await db.delete('teachers', teacherId);
                
                // Clear any linked subject assignments
                const current = await db.getAll('classSubjects');
                for (const cs of current) {
                    if (cs.assignedTeacherId === teacherId) {
                        await db.delete('classSubjects', cs.classSubjectId);
                    }
                }

                showNotification('Teacher removed successfully', 'success');
                await this.loadTeachers();
                await this.loadAssignments();
            }
        };

        // Delete Assignment
        window.removeAssignment = async (classSubjectId) => {
            if (confirm('Are you sure you want to delete this class-subject course mapping?')) {
                await db.delete('classSubjects', classSubjectId);
                showNotification('Course mapping deleted', 'success');
                await this.loadAssignments();
            }
        };
    }
}

export { TeachersView };
