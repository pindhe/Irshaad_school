/**
 * AL-irshaad School Management System - Daily Attendance View Component
 */

import { db, generateUUID } from '../db.js';
import { auth } from '../auth.js';

class AttendanceView {
    constructor(container) {
        this.container = container;
        this.classSubjects = [];
        this.activeStudents = [];
    }

    async render() {
        const user = auth.getCurrentUser();
        const isAdmin = user.role === 'Admin';

        // Fetch course assignments based on role
        const allCourseMaps = await db.getAll('classSubjects');
        const teachers = await db.getAll('teachers');
        const classes = await db.getAll('classes');
        const subjects = await db.getAll('subjects');

        if (isAdmin) {
            this.classSubjects = allCourseMaps;
        } else {
            // Teacher role: filter mapping by assignedTeacherId matching user's relatedEntityId
            this.classSubjects = allCourseMaps.filter(c => c.assignedTeacherId === user.relatedEntityId);
        }

        // Set default date to today
        const todayStr = new Date().toISOString().substring(0, 10);

        this.container.innerHTML = `
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 class="text-2xl font-black text-white tracking-wide">Attendance Register</h1>
                    <p class="text-xs text-slate-400 mt-1">Select class-course sessions to record daily attendance, mark lateness, or add exceptions.</p>
                </div>
            </div>

            <!-- Configuration Selector Panel -->
            <div class="p-5 bg-slate-900/30 border border-slate-800/60 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div>
                    <label for="att-select-course" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select Class & Subject</label>
                    <select id="att-select-course" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition">
                        <option value="">-- Select Assigned Class --</option>
                        ${this.classSubjects.map(cs => {
                            const cls = classes.find(c => c.classId === cs.classId);
                            const sub = subjects.find(s => s.subjectId === cs.subjectId);
                            const clsName = cls ? cls.name : 'Unknown';
                            const subName = sub ? sub.name : 'Unknown';
                            return `<option value="${cs.classSubjectId}">${clsName} - ${subName}</option>`;
                        }).join('')}
                    </select>
                </div>

                <div>
                    <label for="att-select-date" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Record Session Date</label>
                    <input type="date" id="att-select-date" value="${todayStr}" max="${todayStr}" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-250 text-xs focus:outline-none focus:border-indigo-500 transition">
                </div>

                <div>
                    <button type="button" id="btn-load-attendance" class="w-full bg-indigo-650 hover:bg-indigo-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-md shadow-indigo-650/15">
                        Open Session Register
                    </button>
                </div>
            </div>

            <!-- Attendance Register Sheet (Populated dynamically) -->
            <div id="attendance-sheet-container" class="hidden bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 space-y-6">
                <!-- Session header statistics -->
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-850">
                    <div>
                        <h3 id="session-class-title" class="text-sm font-bold text-white uppercase tracking-wider">Session Register</h3>
                        <p id="session-stats-subtitle" class="text-[11px] text-slate-400 mt-1">Please mark the attendance status of the students listed below.</p>
                    </div>

                    <!-- Statistics summary pill -->
                    <div class="flex gap-2 text-[10px] font-bold">
                        <span class="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-lg">P: <span id="stat-present">0</span></span>
                        <span class="px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-lg">L: <span id="stat-late">0</span></span>
                        <span class="px-2.5 py-1 bg-violet-500/15 border border-violet-500/30 text-violet-400 rounded-lg">E: <span id="stat-excused">0</span></span>
                        <span class="px-2.5 py-1 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-lg">A: <span id="stat-absent">0</span></span>
                    </div>
                </div>

                <!-- Tabular Grid Sheet -->
                <form id="form-save-attendance" class="space-y-6">
                    <div class="overflow-x-auto custom-scrollbar">
                        <table class="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr class="border-b border-slate-850 text-slate-500 font-bold uppercase tracking-wider">
                                    <th class="py-2.5 px-4 w-10">Avatar</th>
                                    <th class="py-2.5 px-4">Student Full Name</th>
                                    <th class="py-2.5 px-4 text-center w-64">Attendance Status</th>
                                    <th class="py-2.5 px-4 w-60">Session Exception Note</th>
                                </tr>
                            </thead>
                            <tbody id="attendance-tbody" class="divide-y divide-slate-850/40 text-slate-300">
                                <!-- Populated dynamically -->
                            </tbody>
                        </table>
                    </div>

                    <div class="flex justify-end gap-3 pt-4 border-t border-slate-850">
                        <button type="submit" class="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-indigo-650 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/10">
                            Save Attendance Record
                        </button>
                    </div>
                </form>
            </div>
        `;

        this.registerEvents();
    }

    registerEvents() {
        const btnLoad = document.getElementById('btn-load-attendance');
        const sheetContainer = document.getElementById('attendance-sheet-container');
        const selectCourse = document.getElementById('att-select-course');
        const selectDate = document.getElementById('att-select-date');
        const tbody = document.getElementById('attendance-tbody');
        const formSave = document.getElementById('form-save-attendance');

        btnLoad.addEventListener('click', async () => {
            const classSubjectId = selectCourse.value;
            const dateStr = selectDate.value;

            if (!classSubjectId) {
                showNotification('Please select a Class Subject combination first.', 'error');
                return;
            }

            try {
                // Find course map
                const classes = await db.getAll('classes');
                const subjects = await db.getAll('subjects');
                const courseMap = this.classSubjects.find(cs => cs.classSubjectId === classSubjectId);
                
                const cls = classes.find(c => c.classId === courseMap.classId);
                const sub = subjects.find(s => s.subjectId === courseMap.subjectId);

                document.getElementById('session-class-title').textContent = `${cls.name} — ${sub.name} Register`;

                // Fetch students of this class
                const students = await db.getAll('students');
                this.activeStudents = students.filter(s => s.currentClassId === courseMap.classId);

                if (this.activeStudents.length === 0) {
                    showNotification('No students are enrolled in this class room.', 'info');
                    sheetContainer.classList.add('hidden');
                    return;
                }

                // Fetch already logged attendance for this combination & date
                const existing = await db.getAll('attendanceRecords');
                const savedMap = {};
                existing.forEach(rec => {
                    if (rec.classSubjectId === classSubjectId && rec.date === dateStr) {
                        savedMap[rec.studentId] = { status: rec.status, notes: rec.notes || '' };
                    }
                });

                // Render register sheet
                let html = '';
                this.activeStudents.forEach(s => {
                    const saved = savedMap[s.studentId] || { status: 'Present', notes: '' };
                    
                    const avatarHtml = s.photoUrl
                        ? `<img src="${s.photoUrl}" class="w-full h-full object-cover">`
                        : `<span class="font-bold text-[10px] text-indigo-400">${s.firstName[0]}${s.lastName[0]}</span>`;

                    html += `
                        <tr class="hover:bg-slate-900/10 transition-all align-middle" data-student-id="${s.studentId}">
                            <td class="py-3 px-4">
                                <div class="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 overflow-hidden flex items-center justify-center">
                                    ${avatarHtml}
                                </div>
                            </td>
                            <td class="py-3 px-4 font-bold text-white text-xs">${s.firstName} ${s.lastName}</td>
                            <td class="py-3 px-4">
                                <div class="flex justify-center gap-1.5 radio-badge-group">
                                    <!-- Present -->
                                    <label class="cursor-pointer select-none">
                                        <input type="radio" name="status-${s.studentId}" value="Present" ${saved.status === 'Present' ? 'checked' : ''} class="hidden peer">
                                        <span class="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-500 font-bold text-[10px] uppercase peer-checked:bg-emerald-500/15 peer-checked:border-emerald-500/30 peer-checked:text-emerald-400 transition block">
                                            Present
                                        </span>
                                    </label>
                                    <!-- Late -->
                                    <label class="cursor-pointer select-none">
                                        <input type="radio" name="status-${s.studentId}" value="Late" ${saved.status === 'Late' ? 'checked' : ''} class="hidden peer">
                                        <span class="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-500 font-bold text-[10px] uppercase peer-checked:bg-amber-500/15 peer-checked:border-amber-500/30 peer-checked:text-amber-400 transition block">
                                            Late
                                        </span>
                                    </label>
                                    <!-- Excused -->
                                    <label class="cursor-pointer select-none">
                                        <input type="radio" name="status-${s.studentId}" value="Excused" ${saved.status === 'Excused' ? 'checked' : ''} class="hidden peer">
                                        <span class="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-500 font-bold text-[10px] uppercase peer-checked:bg-violet-500/15 peer-checked:border-violet-500/30 peer-checked:text-violet-400 transition block">
                                            Excused
                                        </span>
                                    </label>
                                    <!-- Absent -->
                                    <label class="cursor-pointer select-none">
                                        <input type="radio" name="status-${s.studentId}" value="Absent" ${saved.status === 'Absent' ? 'checked' : ''} class="hidden peer">
                                        <span class="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-500 font-bold text-[10px] uppercase peer-checked:bg-rose-500/15 peer-checked:border-rose-500/30 peer-checked:text-rose-400 transition block">
                                            Absent
                                        </span>
                                    </label>
                                </div>
                            </td>
                            <td class="py-3 px-4">
                                <input type="text" name="notes-${s.studentId}" value="${saved.notes}" class="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-350 focus:outline-none focus:border-indigo-500 transition" placeholder="e.g. Traffic delays, sickness...">
                            </td>
                        </tr>
                    `;
                });

                tbody.innerHTML = html;
                sheetContainer.classList.remove('hidden');

                // Trigger count summaries
                this.updateLiveStats();

                // Bind listener on radio status change to update dynamic stats live!
                tbody.querySelectorAll('input[type="radio"]').forEach(radio => {
                    radio.addEventListener('change', () => this.updateLiveStats());
                });

            } catch (err) {
                console.error(err);
                showNotification(err.message, 'error');
            }
        });

        // Save Form listener
        formSave.addEventListener('submit', async (e) => {
            e.preventDefault();

            const classSubjectId = selectCourse.value;
            const dateStr = selectDate.value;
            const user = auth.getCurrentUser();

            try {
                // Fetch current stored list
                const records = await db.getAll('attendanceRecords');

                for (const student of this.activeStudents) {
                    const statusRadios = document.getElementsByName(`status-${student.studentId}`);
                    let activeStatus = 'Present';
                    for (const r of statusRadios) {
                        if (r.checked) {
                            activeStatus = r.value;
                            break;
                        }
                    }

                    const activeNote = document.getElementsByName(`notes-${student.studentId}`)[0].value.trim();

                    // Check if already exists to update
                    const match = records.find(r => r.studentId === student.studentId && r.classSubjectId === classSubjectId && r.date === dateStr);
                    
                    const record = {
                        attendanceRecordId: match ? match.attendanceRecordId : `att-rec-${generateUUID().substring(0, 10)}`,
                        studentId: student.studentId,
                        classSubjectId,
                        date: dateStr,
                        status: activeStatus,
                        notes: activeNote,
                        recordedByUserId: user.userId
                    };

                    await db.put('attendanceRecords', record);
                }

                showNotification('Attendance session register saved successfully', 'success');
            } catch (err) {
                console.error(err);
                showNotification('Failed to save record: ' + err.message, 'error');
            }
        });
    }

    updateLiveStats() {
        const stats = { Present: 0, Late: 0, Excused: 0, Absent: 0 };
        
        this.activeStudents.forEach(s => {
            const statusRadios = document.getElementsByName(`status-${s.studentId}`);
            for (const r of statusRadios) {
                if (r.checked) {
                    stats[r.value]++;
                    break;
                }
            }
        });

        document.getElementById('stat-present').textContent = stats.Present;
        document.getElementById('stat-late').textContent = stats.Late;
        document.getElementById('stat-excused').textContent = stats.Excused;
        document.getElementById('stat-absent').textContent = stats.Absent;
    }
}

export { AttendanceView };
