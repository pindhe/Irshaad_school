/**
 * AL-irshaad School Management System - Report Card view component
 */

import { db } from '../db.js';

class ReportsView {
    constructor(container) {
        this.container = container;
    }

    async render() {
        const students = await db.getAll('students');
        const classes = await db.getAll('classes');

        // Selectors
        this.container.innerHTML = `
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
                <div>
                    <h1 class="text-2xl font-black text-white tracking-wide">Academic Reporting</h1>
                    <p class="text-xs text-slate-400 mt-1">Review school attendance digests and generate official pupil term-end report cards.</p>
                </div>
            </div>

            <!-- Configuration Selector Panel (no-print) -->
            <div class="p-5 bg-slate-900/30 border border-slate-800/60 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 items-end no-print">
                <div>
                    <label for="rep-select-student" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select Student</label>
                    <select id="rep-select-student" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition">
                        <option value="">-- Select Pupil --</option>
                        ${students.map(s => {
                            const cls = classes.find(c => c.classId === s.currentClassId);
                            const clsName = cls ? cls.name : 'Unassigned';
                            return `<option value="${s.studentId}">${s.firstName} ${s.lastName} (${clsName})</option>`;
                        }).join('')}
                    </select>
                </div>

                <div>
                    <label for="rep-select-term" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Academic Session Period</label>
                    <select id="rep-select-term" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition">
                        <option value="Term 1">Term 1</option>
                        <option value="Term 2">Term 2</option>
                        <option value="Term 3">Term 3</option>
                    </select>
                </div>

                <div>
                    <button type="button" id="btn-generate-report" class="w-full bg-indigo-650 hover:bg-indigo-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-md shadow-indigo-650/15">
                        Compile Report Card
                    </button>
                </div>
            </div>

            <!-- Report Card Output Container -->
            <div id="report-card-container" class="hidden space-y-6">
                <!-- Actions panel (no-print) -->
                <div class="flex justify-end gap-2.5 p-3 bg-slate-900/20 border border-slate-850 rounded-xl no-print">
                    <button id="btn-print-report" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-md shadow-indigo-600/10">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                        </svg>
                        <span>Print / Save PDF</span>
                    </button>
                </div>

                <!-- Report Card Sheet Content -->
                <div id="report-card-sheet" class="bg-white text-slate-900 p-8 sm:p-10 rounded-2xl shadow-2xl border border-slate-200 print-card space-y-8 max-w-4xl mx-auto">
                    
                    <!-- Report Header -->
                    <div class="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-6 border-b-2 border-slate-900 pb-6 text-center sm:text-left">
                        <div class="flex items-center gap-4 flex-col sm:flex-row">
                            <div class="w-16 h-16 rounded-xl bg-slate-900 flex items-center justify-center font-bold text-3xl text-white shadow-md">
                                AI
                            </div>
                            <div>
                                <h1 class="text-xl sm:text-2xl font-black tracking-wide text-slate-900 uppercase">AL-irshaad Secondary School</h1>
                                <p class="text-xs text-slate-500 font-bold tracking-wider mt-0.5 uppercase">Official Academic Performance Record</p>
                                <p class="text-[10px] text-slate-400 mt-1 font-semibold leading-relaxed">K4 Square, Maka Al-Mukarama Rd, Mogadishu, Somalia | info@irshaad.edu.so</p>
                            </div>
                        </div>
                        <div class="text-center sm:text-right border-l-2 sm:border-l-0 sm:border-r-2 border-slate-900 pl-4 sm:pl-0 sm:pr-4">
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Academic Period</span>
                            <span id="rep-out-academic-year" class="text-sm font-black text-slate-900 block mt-0.5">2025-2026</span>
                            <span id="rep-out-term" class="px-2 py-0.5 bg-slate-100 rounded text-slate-800 font-bold text-[9px] uppercase tracking-wide block w-fit mt-1.5 mx-auto sm:mr-0">Term 1</span>
                        </div>
                    </div>

                    <!-- Student Metadata Split -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <div class="space-y-2">
                            <div class="flex"><span class="text-slate-400 font-bold w-24">Pupil Name:</span><span id="rep-out-name" class="font-extrabold text-slate-900">Abdi Warsame</span></div>
                            <div class="flex"><span class="text-slate-400 font-bold w-24">Student ID:</span><span id="rep-out-id" class="font-bold text-slate-700">std-123456</span></div>
                            <div class="flex"><span class="text-slate-400 font-bold w-24">Assigned Class:</span><span id="rep-out-class" class="font-bold text-slate-750">Grade 10A</span></div>
                        </div>
                        <div class="space-y-2 sm:border-l border-slate-200 sm:pl-6">
                            <div class="flex"><span class="text-slate-400 font-bold w-28">Gender / Age:</span><span id="rep-out-gender-age" class="font-semibold text-slate-700">Male • 16 Years</span></div>
                            <div class="flex"><span class="text-slate-400 font-bold w-28">Guardian Name:</span><span id="rep-out-guardian" class="font-semibold text-slate-700">Warsame Farah</span></div>
                            <div class="flex"><span class="text-slate-400 font-bold w-28">Date Evaluated:</span><span id="rep-out-date" class="font-bold text-slate-800">2026-05-31</span></div>
                        </div>
                    </div>

                    <!-- Grades Table Ledger -->
                    <div class="space-y-2">
                        <h3 class="text-xs font-bold text-slate-900 uppercase tracking-widest pb-1 border-b border-slate-200">I. Course/Syllabus Performance</h3>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left text-xs border-collapse print-table">
                                <thead>
                                    <tr class="bg-slate-50 text-slate-700 font-bold uppercase border border-slate-200">
                                        <th class="py-2.5 px-4">Syllabus Subject</th>
                                        <th class="py-2.5 px-4 text-center">Classwork Avg</th>
                                        <th class="py-2.5 px-4 text-center">Term Exams</th>
                                        <th class="py-2.5 px-4 text-center">Total Percentage</th>
                                        <th class="py-2.5 px-4 text-center">Assigned Grade</th>
                                        <th class="py-2.5 px-4">Performance Remark</th>
                                    </tr>
                                </thead>
                                <tbody id="rep-tbody" class="divide-y divide-slate-200 text-slate-700 border-x border-b border-slate-200">
                                    <!-- Dynamic Rows -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Attendance Summary -->
                    <div class="space-y-2">
                        <h3 class="text-xs font-bold text-slate-900 uppercase tracking-widest pb-1 border-b border-slate-200">II. Attendance & Conduct</h3>
                        <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
                            <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                <span class="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Days Present</span>
                                <span id="rep-att-present" class="text-base font-black text-slate-900 block mt-1">0</span>
                            </div>
                            <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                <span class="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Days Late</span>
                                <span id="rep-att-late" class="text-base font-black text-slate-900 block mt-1">0</span>
                            </div>
                            <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                <span class="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Days Excused</span>
                                <span id="rep-att-excused" class="text-base font-black text-slate-900 block mt-1">0</span>
                            </div>
                            <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                <span class="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Days Absent</span>
                                <span id="rep-att-absent" class="text-base font-black text-slate-900 block mt-1">0</span>
                            </div>
                            <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl col-span-2 sm:col-span-1">
                                <span class="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Ratio Rate</span>
                                <span id="rep-att-rate" class="text-base font-black text-slate-900 block mt-1">0%</span>
                            </div>
                        </div>
                    </div>

                    <!-- Evaluation Signatures -->
                    <div class="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        <div class="space-y-2">
                            <div class="border-t border-slate-900 pt-2 w-48 mx-auto">Class Teacher Signature</div>
                        </div>
                        <div class="space-y-2">
                            <div class="border-t border-slate-900 pt-2 w-48 mx-auto">Headmaster Signature</div>
                        </div>
                        <div class="space-y-2">
                            <div class="border-t border-slate-900 pt-2 w-48 mx-auto">Parent/Guardian Stamp</div>
                        </div>
                    </div>

                </div>
            </div>
        `;

        this.registerEvents();
    }

    registerEvents() {
        const btnGenerate = document.getElementById('btn-generate-report');
        const container = document.getElementById('report-card-container');
        const selectStudent = document.getElementById('rep-select-student');
        const selectTerm = document.getElementById('rep-select-term');

        btnGenerate.addEventListener('click', async () => {
            const studentId = selectStudent.value;
            const term = selectTerm.value;

            if (!studentId) {
                showNotification('Please pick a student to compile.', 'error');
                return;
            }

            try {
                // Fetch settings
                const schoolNameVal = await db.get('settings', 'schoolName');
                const academicYearVal = await db.get('settings', 'academicYear');
                const gradingScaleSetting = await db.get('settings', 'gradingScale');
                
                const gradingScale = gradingScaleSetting ? gradingScaleSetting.settingValue : [];

                // Fetch database records
                const student = await db.get('students', studentId);
                const classes = await db.getAll('classes');
                const classSubjects = await db.getAll('classSubjects');
                const subjects = await db.getAll('subjects');
                const grades = await db.getAll('grades');
                const attendance = await db.getAll('attendanceRecords');

                if (!student) throw new Error('Student records missing.');

                const matchingClass = classes.find(c => c.classId === student.currentClassId);
                const className = matchingClass ? matchingClass.name : 'Unassigned Class';

                // Set headers
                document.getElementById('rep-out-academic-year').textContent = academicYearVal ? academicYearVal.settingValue : '2025-2026';
                document.getElementById('rep-out-term').textContent = term;
                document.getElementById('rep-out-name').textContent = `${student.firstName} ${student.lastName}`;
                document.getElementById('rep-out-id').textContent = student.studentId.toUpperCase();
                document.getElementById('rep-out-class').textContent = className;
                document.getElementById('rep-out-guardian').textContent = student.parentGuardian.name;
                document.getElementById('rep-out-date').textContent = new Date().toISOString().substring(0, 10);

                // Gender/Age details
                let age = 'N/A';
                if (student.dateOfBirth) {
                    const dob = new Date(student.dateOfBirth);
                    const ageDifMs = Date.now() - dob.getTime();
                    const ageDate = new Date(ageDifMs);
                    age = Math.abs(ageDate.getUTCFullYear() - 1970);
                }
                document.getElementById('rep-out-gender-age').textContent = `${student.gender} • Age ${age}`;

                // Calculate grades dynamically!
                // Filter classSubjects that belong to this student's class
                const classCourseMaps = classSubjects.filter(cs => cs.classId === student.currentClassId);

                let tbodyHtml = '';
                
                if (classCourseMaps.length === 0) {
                    tbodyHtml = `
                        <tr>
                            <td colspan="6" class="py-6 text-center text-slate-400 italic">No syllabus subject courses mapped to this class room yet.</td>
                        </tr>
                    `;
                } else {
                    classCourseMaps.forEach(cs => {
                        const subject = subjects.find(sub => sub.subjectId === cs.subjectId);
                        const subjectName = subject ? subject.name : 'Unknown';

                        // Filter student's grades for this mapping
                        const stdGrades = grades.filter(g => g.studentId === studentId && g.classSubjectId === cs.classSubjectId);
                        
                        // Classwork averages vs. Midterm/Final Exams
                        const classworkTasks = stdGrades.filter(g => g.assessmentType === 'Homework' || g.assessmentType === 'Quiz' || g.assessmentType === 'Project');
                        const examTasks = stdGrades.filter(g => g.assessmentType === 'Midterm' || g.assessmentType === 'Final Exam');

                        let classworkAvg = 0;
                        if (classworkTasks.length > 0) {
                            classworkAvg = Math.round(classworkTasks.reduce((acc, curr) => acc + curr.gradePercentage, 0) / classworkTasks.length);
                        }

                        let examScore = 0;
                        if (examTasks.length > 0) {
                            examScore = Math.round(examTasks.reduce((acc, curr) => acc + curr.gradePercentage, 0) / examTasks.length);
                        }

                        // Weighted final term average
                        // Fallback weight: Classwork is 40%, Exams are 60%
                        let finalAvg = 0;
                        if (classworkTasks.length > 0 && examTasks.length > 0) {
                            finalAvg = Math.round((classworkAvg * 0.4) + (examScore * 0.6));
                        } else if (classworkTasks.length > 0) {
                            finalAvg = classworkAvg;
                        } else if (examTasks.length > 0) {
                            finalAvg = examScore;
                        }

                        // Determine Letter Grade from Scale
                        let letterGrade = 'F';
                        let remark = 'Needs Urgent Focus';
                        
                        const matchedGrade = gradingScale.find(scale => finalAvg >= scale.min && finalAvg <= scale.max);
                        if (matchedGrade) {
                            letterGrade = matchedGrade.grade;
                            if (finalAvg >= 90) remark = 'Outstanding Mastery';
                            else if (finalAvg >= 80) remark = 'Excellent performance';
                            else if (finalAvg >= 70) remark = 'Commendable Pass';
                            else if (finalAvg >= 60) remark = 'Satisfactory Progress';
                        }

                        tbodyHtml += `
                            <tr class="align-middle">
                                <td class="py-2.5 px-4 font-black text-slate-800">${subjectName}</td>
                                <td class="py-2.5 px-4 text-center font-bold text-slate-700">${classworkTasks.length > 0 ? classworkAvg + '%' : '-'}</td>
                                <td class="py-2.5 px-4 text-center font-bold text-slate-700">${examTasks.length > 0 ? examScore + '%' : '-'}</td>
                                <td class="py-2.5 px-4 text-center font-black text-indigo-700">${finalAvg > 0 ? finalAvg + '%' : '-'}</td>
                                <td class="py-2.5 px-4 text-center"><span class="px-2 py-0.5 bg-slate-900 text-white rounded font-black text-[10px]">${letterGrade}</span></td>
                                <td class="py-2.5 px-4 italic text-slate-500 font-semibold">${remark}</td>
                            </tr>
                        `;
                    });
                }

                document.getElementById('rep-tbody').innerHTML = tbodyHtml;

                // Attendance stats for this student
                const studentAttendance = attendance.filter(a => a.studentId === studentId);
                const stats = { Present: 0, Late: 0, Excused: 0, Absent: 0 };
                studentAttendance.forEach(a => {
                    if (stats[a.status] !== undefined) stats[a.status]++;
                });

                document.getElementById('rep-att-present').textContent = stats.Present;
                document.getElementById('rep-att-late').textContent = stats.Late;
                document.getElementById('rep-att-excused').textContent = stats.Excused;
                document.getElementById('rep-att-absent').textContent = stats.Absent;

                let attRate = 100;
                if (studentAttendance.length > 0) {
                    const presentRate = stats.Present + stats.Late + stats.Excused;
                    attRate = Math.round((presentRate / studentAttendance.length) * 100);
                }
                document.getElementById('rep-att-rate').textContent = attRate + '%';

                container.classList.remove('hidden');
                showNotification('Report card compiled perfectly!', 'success');

            } catch (err) {
                console.error(err);
                showNotification(err.message, 'error');
            }
        });

        // Print card triggers native browser printing
        document.getElementById('btn-print-report').addEventListener('click', () => {
            window.print();
        });
    }
}

export { ReportsView };
