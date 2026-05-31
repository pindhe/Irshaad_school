/**
 * AL-irshaad School Management System - Dashboard View Component
 */

import { db } from '../db.js';
import { auth } from '../auth.js';

class DashboardView {
    constructor(container, queryParams) {
        this.container = container;
        this.queryParams = queryParams;
    }

    async render() {
        // Fetch stats dynamically
        const students = await db.getAll('students');
        const teachers = await db.getAll('teachers');
        const classes = await db.getAll('classes');
        const attendance = await db.getAll('attendanceRecords');

        // Calculate attendance rate
        let attendanceRate = 100;
        if (attendance.length > 0) {
            const activePresent = attendance.filter(a => a.status === 'Present' || a.status === 'Late' || a.status === 'Excused').length;
            attendanceRate = Math.round((activePresent / attendance.length) * 100);
        }

        const user = auth.getCurrentUser();
        const isAdmin = user.role === 'Admin';

        // Render dashboard UI
        this.container.innerHTML = `
            <!-- Welcome Header Card -->
            <div class="p-6 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/10 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
                <div class="absolute -right-20 -top-20 w-60 h-60 bg-indigo-500/5 rounded-full blur-[80px]"></div>
                <div>
                    <h1 class="text-2xl font-black tracking-wide text-white flex items-center gap-2">
                        Welcome Back, ${user.name}! 
                        <span class="animate-bounce inline-block">👋</span>
                    </h1>
                    <p class="text-xs text-slate-400 mt-1">Here is a quick overview of AL-irshaad Secondary School's current state today.</p>
                </div>
                
                <!-- Quick date stamp -->
                <div class="px-4 py-2 bg-slate-950 border border-slate-800/60 rounded-xl flex items-center gap-2.5 text-xs text-slate-300 font-semibold shadow-inner">
                    <svg class="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span id="dash-date-clock">Loading Current Time...</span>
                </div>
            </div>

            <!-- Dashboard Stats Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <!-- Students Card -->
                <div class="p-5 bg-slate-900/40 border border-slate-800/60 rounded-2xl flex items-center gap-4 hover:border-indigo-500/30 transition group hover:shadow-lg hover:shadow-indigo-500/5">
                    <div class="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition border border-indigo-500/20 shadow-md">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                        </svg>
                    </div>
                    <div>
                        <span class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Students</span>
                        <h3 class="text-2xl font-black text-white leading-none mt-1">${students.length}</h3>
                    </div>
                </div>

                <!-- Teachers Card -->
                <div class="p-5 bg-slate-900/40 border border-slate-800/60 rounded-2xl flex items-center gap-4 hover:border-violet-500/30 transition group hover:shadow-lg hover:shadow-violet-500/5">
                    <div class="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center text-violet-400 group-hover:scale-110 transition border border-violet-500/20 shadow-md">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                    </div>
                    <div>
                        <span class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Teachers</span>
                        <h3 class="text-2xl font-black text-white leading-none mt-1">${teachers.length}</h3>
                    </div>
                </div>

                <!-- Classes Card -->
                <div class="p-5 bg-slate-900/40 border border-slate-800/60 rounded-2xl flex items-center gap-4 hover:border-pink-500/30 transition group hover:shadow-lg hover:shadow-pink-500/5">
                    <div class="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center text-pink-400 group-hover:scale-110 transition border border-pink-500/20 shadow-md">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                        </svg>
                    </div>
                    <div>
                        <span class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Classes</span>
                        <h3 class="text-2xl font-black text-white leading-none mt-1">${classes.length}</h3>
                    </div>
                </div>

                <!-- Attendance Card -->
                <div class="p-5 bg-slate-900/40 border border-slate-800/60 rounded-2xl flex items-center gap-4 hover:border-emerald-500/30 transition group hover:shadow-lg hover:shadow-emerald-500/5">
                    <div class="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition border border-emerald-500/20 shadow-md">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <div>
                        <span class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Attendance Rate</span>
                        <h3 class="text-2xl font-black text-white leading-none mt-1">${attendanceRate}%</h3>
                    </div>
                </div>
            </div>

            <!-- Dynamic split columns -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Left panel: Quick Actions -->
                <div class="lg:col-span-2 space-y-6">
                    <div class="bg-slate-900/30 border border-slate-800/60 p-6 rounded-2xl space-y-4">
                        <h3 class="text-sm font-bold text-white uppercase tracking-wider">Quick Actions & Workflows</h3>
                        
                        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <a href="#/students" class="p-4 bg-slate-950 hover:bg-indigo-600/10 border border-slate-800/80 hover:border-indigo-500/40 rounded-xl text-center transition flex flex-col items-center justify-center gap-3">
                                <span class="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                                    </svg>
                                </span>
                                <span class="text-xs font-semibold text-slate-350">Add Student</span>
                            </a>
                            
                            <a href="#/attendance" class="p-4 bg-slate-950 hover:bg-violet-600/10 border border-slate-800/80 hover:border-violet-500/40 rounded-xl text-center transition flex flex-col items-center justify-center gap-3">
                                <span class="p-2 bg-violet-500/10 rounded-lg text-violet-400">
                                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                    </svg>
                                </span>
                                <span class="text-xs font-semibold text-slate-350">Record Attendance</span>
                            </a>

                            <a href="#/grading" class="p-4 bg-slate-950 hover:bg-emerald-600/10 border border-slate-800/80 hover:border-emerald-500/40 rounded-xl text-center transition flex flex-col items-center justify-center gap-3">
                                <span class="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                    </svg>
                                </span>
                                <span class="text-xs font-semibold text-slate-350">Grade Entry</span>
                            </a>

                            <a href="#/reports" class="p-4 bg-slate-950 hover:bg-pink-600/10 border border-slate-800/80 hover:border-pink-500/40 rounded-xl text-center transition flex flex-col items-center justify-center gap-3">
                                <span class="p-2 bg-pink-500/10 rounded-lg text-pink-400">
                                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                    </svg>
                                </span>
                                <span class="text-xs font-semibold text-slate-350">Report Cards</span>
                            </a>

                            ${isAdmin ? `
                            <a href="#/database" class="p-4 bg-slate-950 hover:bg-cyan-600/10 border border-slate-800/80 hover:border-cyan-500/40 rounded-xl text-center transition flex flex-col items-center justify-center gap-3">
                                <span class="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20"/>
                                    </svg>
                                </span>
                                <span class="text-xs font-semibold text-slate-350">Database Backup</span>
                            </a>

                            <a href="#/settings" class="p-4 bg-slate-950 hover:bg-amber-600/10 border border-slate-800/80 hover:border-amber-500/40 rounded-xl text-center transition flex flex-col items-center justify-center gap-3">
                                <span class="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
                                    </svg>
                                </span>
                                <span class="text-xs font-semibold text-slate-350">School Settings</span>
                            </a>
                            ` : `
                            <div class="p-4 bg-slate-950/20 border border-slate-900/60 rounded-xl text-center flex flex-col items-center justify-center gap-2 opacity-50 col-span-2">
                                <span class="text-[10px] text-slate-500">More operations available to administrative staff accounts.</span>
                            </div>
                            `}
                        </div>
                    </div>

                    <!-- Recent Grades Panel -->
                    <div class="bg-slate-900/30 border border-slate-800/60 p-6 rounded-2xl space-y-4">
                        <div class="flex justify-between items-center">
                            <h3 class="text-sm font-bold text-white uppercase tracking-wider">Recent Exam/Assessment Scores</h3>
                            <a href="#/grading" class="text-xs font-semibold text-indigo-400 hover:text-indigo-300">Gradebook →</a>
                        </div>

                        <div class="overflow-x-auto custom-scrollbar">
                            <table class="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr class="border-b border-slate-800 text-slate-400 font-semibold">
                                        <th class="py-2.5">Student</th>
                                        <th class="py-2.5">Subject</th>
                                        <th class="py-2.5">Assessment</th>
                                        <th class="py-2.5">Score</th>
                                        <th class="py-2.5 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-850/40 text-slate-300" id="dash-recent-grades-tbody">
                                    <tr>
                                        <td colspan="5" class="py-4 text-center text-slate-500">Retrieving recent scores...</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Right panel: Quick info calendar + School Contact -->
                <div class="space-y-6">
                    <!-- Academic calendar snapshot -->
                    <div class="bg-slate-900/30 border border-slate-800/60 p-6 rounded-2xl space-y-4">
                        <h3 class="text-sm font-bold text-white uppercase tracking-wider">School Details</h3>
                        <div class="space-y-3.5 text-xs">
                            <div class="flex flex-col gap-1 p-3 bg-slate-950/60 border border-slate-850 rounded-xl">
                                <span class="text-[10px] font-bold text-indigo-400 uppercase tracking-wide">Campus Address</span>
                                <span class="text-slate-300 font-semibold leading-relaxed">K4 Square, Maka Al-Mukarama Rd, Mogadishu, Somalia</span>
                            </div>
                            <div class="flex flex-col gap-1 p-3 bg-slate-950/60 border border-slate-850 rounded-xl">
                                <span class="text-[10px] font-bold text-violet-400 uppercase tracking-wide">Contact Details</span>
                                <span class="text-slate-300 font-semibold">Phone: +252 61 999 1234</span>
                                <span class="text-slate-300 font-semibold">Email: info@irshaad.edu.so</span>
                            </div>
                        </div>
                    </div>

                    <!-- Quick notes or offline notice -->
                    <div class="p-6 bg-indigo-950/10 border border-indigo-500/10 rounded-2xl space-y-3 relative overflow-hidden">
                        <div class="absolute -right-10 -bottom-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl"></div>
                        <h4 class="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                            <svg class="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Offline Synchronization
                        </h4>
                        <p class="text-[11px] text-slate-400 leading-relaxed">
                            This portal is completely running inside your local browser database cache. Any additions or updates you execute are committed immediately to <strong>IndexedDB</strong>. 
                        </p>
                        <p class="text-[11px] text-indigo-350 leading-relaxed font-semibold">
                            ⚠️ Ensure you trigger manual database exports in "Data Management" regularly to keep backup recovery files!
                        </p>
                    </div>
                </div>
            </div>
        `;

        this.initClock();
        await this.loadRecentGrades();
    }

    initClock() {
        const updateClock = () => {
            const clockEl = document.getElementById('dash-date-clock');
            if (!clockEl) return;
            const now = new Date();
            clockEl.textContent = now.toLocaleDateString(undefined, { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            }) + ' | ' + now.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        };
        updateClock();
        this.clockInterval = setInterval(updateClock, 1000);
    }

    async loadRecentGrades() {
        const tbody = document.getElementById('dash-recent-grades-tbody');
        if (!tbody) return;

        try {
            const grades = await db.getAll('grades');
            const students = await db.getAll('students');
            const classSubjects = await db.getAll('classSubjects');
            const subjects = await db.getAll('subjects');

            if (grades.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="py-6 text-center text-slate-500 italic">No grade records seeded/entered yet.</td>
                    </tr>
                `;
                return;
            }

            // Sort grades by date descending and take top 5
            const sortedGrades = grades.sort((a, b) => new Date(b.gradeDate) - new Date(a.gradeDate)).slice(0, 5);
            
            let html = '';
            for (const grade of sortedGrades) {
                const student = students.find(s => s.studentId === grade.studentId);
                const classSubject = classSubjects.find(cs => cs.classSubjectId === grade.classSubjectId);
                const subject = classSubject ? subjects.find(sub => sub.subjectId === classSubject.subjectId) : null;
                
                const studentName = student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
                const subjectName = subject ? subject.name : 'Unknown Subject';
                const percentage = grade.gradePercentage;

                // Color code status badge
                let statusBadge = '';
                if (percentage >= 85) {
                    statusBadge = '<span class="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">Excellent</span>';
                } else if (percentage >= 70) {
                    statusBadge = '<span class="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold">Good</span>';
                } else if (percentage >= 60) {
                    statusBadge = '<span class="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold">Pass</span>';
                } else {
                    statusBadge = '<span class="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold">Needs Attention</span>';
                }

                html += `
                    <tr class="hover:bg-slate-900/20 transition-all">
                        <td class="py-3 font-semibold text-white">${studentName}</td>
                        <td class="py-3 text-indigo-300 font-medium">${subjectName}</td>
                        <td class="py-3 text-slate-400">${grade.assessmentName} <span class="text-[9px] opacity-60">(${grade.assessmentType})</span></td>
                        <td class="py-3 font-black text-white">${grade.score}/${grade.maxScore} <span class="text-[10px] text-indigo-400">(${percentage}%)</span></td>
                        <td class="py-3 text-right">${statusBadge}</td>
                    </tr>
                `;
            }
            tbody.innerHTML = html;
        } catch (e) {
            console.error('Failed to load recent grades dashboard:', e);
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="py-4 text-center text-rose-400 font-medium">Failed to retrieve grade statistics.</td>
                </tr>
            `;
        }
    }

    // Clean up timers on view destroy
    destroy() {
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
        }
    }
}

export { DashboardView };
