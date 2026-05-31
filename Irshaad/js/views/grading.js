/**
 * AL-irshaad School Management System - Grades & Assessments View Component
 */

import { db, generateUUID } from '../db.js';
import { auth } from '../auth.js';

class GradingView {
    constructor(container) {
        this.container = container;
        this.classSubjects = [];
        this.activeStudents = [];
    }

    async render() {
        const user = auth.getCurrentUser();
        const isAdmin = user.role === 'Admin';

        // Load courses
        const allCourseMaps = await db.getAll('classSubjects');
        const classes = await db.getAll('classes');
        const subjects = await db.getAll('subjects');

        if (isAdmin) {
            this.classSubjects = allCourseMaps;
        } else {
            this.classSubjects = allCourseMaps.filter(c => c.assignedTeacherId === user.relatedEntityId);
        }

        this.container.innerHTML = `
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 class="text-2xl font-black text-white tracking-wide">Gradebook & Assessments</h1>
                    <p class="text-xs text-slate-400 mt-1">Configure syllabus exams, input raw student performance scores, and review terms gradebooks.</p>
                </div>
            </div>

            <!-- View Selection Tabs -->
            <div class="flex border-b border-slate-800">
                <button id="tab-grade-entry" class="px-5 py-3 border-b-2 border-indigo-500 font-bold text-white text-xs tracking-wide uppercase transition-all duration-300">
                    Grade Entry Sheet
                </button>
                <button id="tab-gradebook-view" class="px-5 py-3 border-b-2 border-transparent hover:border-slate-700 text-slate-400 hover:text-slate-350 font-bold text-xs tracking-wide uppercase transition-all duration-300">
                    Spreadsheet Gradebook View
                </button>
            </div>

            <!-- Section 1: Grade Entry Form -->
            <div id="section-grade-entry" class="space-y-6">
                <!-- Selectors -->
                <div class="p-5 bg-slate-900/30 border border-slate-800/60 rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div class="sm:col-span-2">
                        <label for="grd-select-course" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select Classroom & Subject</label>
                        <select id="grd-select-course" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition">
                            <option value="">-- Select Class --</option>
                            ${this.classSubjects.map(cs => {
                                const cls = classes.find(c => c.classId === cs.classId);
                                const sub = subjects.find(s => s.subjectId === cs.subjectId);
                                return `<option value="${cs.classSubjectId}">${cls ? cls.name : 'Unknown'} - ${sub ? sub.name : 'Unknown'}</option>`;
                            }).join('')}
                        </select>
                    </div>

                    <div>
                        <label for="grd-select-assessment" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select Assessment Task</label>
                        <select id="grd-select-assessment" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition">
                            <option value="">-- Choose Task --</option>
                        </select>
                    </div>

                    <div>
                        <button type="button" id="btn-open-entry" class="w-full bg-indigo-650 hover:bg-indigo-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-md shadow-indigo-650/15">
                            Open Grade Entry Sheet
                        </button>
                    </div>
                </div>

                <!-- Create Assessment mini form -->
                <div class="p-5 bg-slate-900/10 border border-slate-850 rounded-2xl space-y-4">
                    <h3 class="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                        <svg class="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                        </svg>
                        Define New Assessment Task
                    </h3>
                    <form id="form-create-assessment" class="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                        <div class="sm:col-span-2">
                            <label for="new-ass-name" class="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assessment Task Title</label>
                            <input type="text" id="new-ass-name" required class="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition" placeholder="e.g. Chapter 3 Test or Homework 1">
                        </div>
                        <div>
                            <label for="new-ass-type" class="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Task Category</label>
                            <select id="new-ass-type" required class="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition">
                                <option value="Homework">Homework</option>
                                <option value="Quiz">Quiz</option>
                                <option value="Project">Project</option>
                                <option value="Midterm">Midterm Exam</option>
                                <option value="Final Exam">Final Exam</option>
                            </select>
                        </div>
                        <div>
                            <button type="submit" class="w-full bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-750 text-slate-300 font-bold py-2 px-4 rounded-xl text-xs transition">
                                Create Task
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Grading List Register (Hidden by default) -->
                <div id="grade-sheet-container" class="hidden bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 space-y-4 animate-fade-in">
                    <div class="flex justify-between items-center pb-3 border-b border-slate-850">
                        <div>
                            <h3 id="grade-sheet-title" class="text-sm font-bold text-white uppercase tracking-wider">Grade Register</h3>
                            <p class="text-[11px] text-slate-400 mt-0.5">Please input raw scores out of the Max Target Score.</p>
                        </div>
                        
                        <!-- Max Score selector -->
                        <div class="flex items-center gap-2">
                            <label for="grd-max-score" class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Max Target Score:</label>
                            <input type="number" id="grd-max-score" value="100" min="1" class="w-20 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-center font-bold text-indigo-400 focus:outline-none focus:border-indigo-500">
                        </div>
                    </div>

                    <form id="form-save-grades" class="space-y-6">
                        <div class="overflow-x-auto custom-scrollbar">
                            <table class="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr class="border-b border-slate-850 text-slate-500 font-bold uppercase tracking-wider">
                                        <th class="py-2.5 px-4 w-10">Avatar</th>
                                        <th class="py-2.5 px-4">Student Full Name</th>
                                        <th class="py-2.5 px-4 text-center w-48">Raw Score Earned</th>
                                        <th class="py-2.5 px-4 text-right w-48">Percentage Rate</th>
                                    </tr>
                                </thead>
                                <tbody id="grade-tbody" class="divide-y divide-slate-850/40 text-slate-300">
                                    <!-- Dynamic -->
                                </tbody>
                            </table>
                        </div>

                        <div class="flex justify-end gap-3 pt-4 border-t border-slate-850">
                            <button type="submit" class="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-indigo-650/15">
                                Save Grade Scores
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Section 2: Spreadsheet Gradebook (Hidden by default) -->
            <div id="section-gradebook" class="space-y-6 hidden">
                <div class="p-5 bg-slate-900/30 border border-slate-800/60 rounded-2xl flex flex-col sm:flex-row gap-4 items-end">
                    <div class="flex-1 w-full">
                        <label for="book-select-course" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select Classroom & Subject</label>
                        <select id="book-select-course" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition">
                            <option value="">-- Select Class --</option>
                            ${this.classSubjects.map(cs => {
                                const cls = classes.find(c => c.classId === cs.classId);
                                const sub = subjects.find(s => s.subjectId === cs.subjectId);
                                return `<option value="${cs.classSubjectId}">${cls ? cls.name : 'Unknown'} - ${sub ? sub.name : 'Unknown'}</option>`;
                            }).join('')}
                        </select>
                    </div>
                    <div class="w-full sm:w-48">
                        <button type="button" id="btn-load-book" class="w-full bg-indigo-650 hover:bg-indigo-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-md shadow-indigo-650/15">
                            Generate Gradebook
                        </button>
                    </div>
                </div>

                <!-- Gradebook Grid Sheet Container -->
                <div id="gradebook-grid-container" class="hidden bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 overflow-hidden">
                    <h3 id="gradebook-class-title" class="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-850 mb-4">Gradebook Grid View</h3>
                    
                    <div class="overflow-x-auto custom-scrollbar">
                        <table class="w-full text-left text-xs border-collapse" id="gradebook-table">
                            <!-- Dynamic Spreadsheet Grid -->
                        </table>
                    </div>
                </div>
            </div>
        `;

        this.registerEvents();
    }

    registerEvents() {
        const tabEntry = document.getElementById('tab-grade-entry');
        const tabBook = document.getElementById('tab-gradebook-view');
        const secEntry = document.getElementById('section-grade-entry');
        const secBook = document.getElementById('section-gradebook');

        // Course dropdown in grade entry
        const selectCourse = document.getElementById('grd-select-course');
        const selectAss = document.getElementById('grd-select-assessment');
        const btnOpen = document.getElementById('btn-open-entry');
        const sheetContainer = document.getElementById('grade-sheet-container');
        const tbody = document.getElementById('grade-tbody');
        const maxScoreInput = document.getElementById('grd-max-score');

        const formCreateAss = document.getElementById('form-create-assessment');
        const formSaveGrades = document.getElementById('form-save-grades');

        // Gradebook triggers
        const bookSelect = document.getElementById('book-select-course');
        const btnLoadBook = document.getElementById('btn-load-book');
        const bookGridContainer = document.getElementById('gradebook-grid-container');
        const bookTable = document.getElementById('gradebook-table');

        // Toggle Tabs
        tabEntry.addEventListener('click', () => {
            tabEntry.className = 'px-5 py-3 border-b-2 border-indigo-500 font-bold text-white text-xs tracking-wide uppercase transition-all';
            tabBook.className = 'px-5 py-3 border-b-2 border-transparent hover:border-slate-700 text-slate-400 hover:text-slate-350 font-bold text-xs tracking-wide uppercase transition-all';
            secEntry.classList.remove('hidden');
            secBook.classList.add('hidden');
        });

        tabBook.addEventListener('click', () => {
            tabBook.className = 'px-5 py-3 border-b-2 border-indigo-500 font-bold text-white text-xs tracking-wide uppercase transition-all';
            tabEntry.className = 'px-5 py-3 border-b-2 border-transparent hover:border-slate-700 text-slate-400 hover:text-slate-350 font-bold text-xs tracking-wide uppercase transition-all';
            secBook.classList.remove('hidden');
            secEntry.classList.add('hidden');
        });

        // Load assessment dropdown when classSubject is selected
        const updateAssessmentOptions = async () => {
            const classSubjectId = selectCourse.value;
            if (!classSubjectId) {
                selectAss.innerHTML = '<option value="">-- Choose Task --</option>';
                return;
            }

            const grades = await db.getAll('grades');
            
            // Extract unique assessment names for this classSubject
            const uniqueAssNames = [];
            const namesMap = {};
            grades.forEach(g => {
                if (g.classSubjectId === classSubjectId && !namesMap[g.assessmentName]) {
                    namesMap[g.assessmentName] = true;
                    uniqueAssNames.push({ name: g.assessmentName, type: g.assessmentType });
                }
            });

            selectAss.innerHTML = `
                <option value="">-- Choose Task --</option>
                ${uniqueAssNames.map(a => `<option value="${a.name}">${a.name} (${a.type})</option>`).join('')}
            `;
        };
        selectCourse.addEventListener('change', updateAssessmentOptions);

        // Create Assessment Task
        formCreateAss.addEventListener('submit', async (e) => {
            e.preventDefault();
            const classSubjectId = selectCourse.value;
            const name = document.getElementById('new-ass-name').value.trim();
            const type = document.getElementById('new-ass-type').value;

            if (!classSubjectId) {
                showNotification('Please select a Classroom Course in the top dropdown first!', 'error');
                return;
            }

            try {
                // Assessment is implicit by grading record. We will simply add it as a selection.
                showNotification(`Created Task "${name}"! Please select it in the dropdown to record scores.`, 'success');
                formCreateAss.reset();
                await updateAssessmentOptions();
                selectAss.value = name;
            } catch (err) {
                console.error(err);
                showNotification(err.message, 'error');
            }
        });

        // Open Grade Sheet for writing scores
        btnOpen.addEventListener('click', async () => {
            const classSubjectId = selectCourse.value;
            const assessmentName = selectAss.value;

            if (!classSubjectId || !assessmentName) {
                showNotification('Please select Class Subject & Assessment task to open gradesheet.', 'error');
                return;
            }

            try {
                const classes = await db.getAll('classes');
                const subjects = await db.getAll('subjects');
                const courseMap = this.classSubjects.find(cs => cs.classSubjectId === classSubjectId);
                
                const cls = classes.find(c => c.classId === courseMap.classId);
                const sub = subjects.find(s => s.subjectId === courseMap.subjectId);

                document.getElementById('grade-sheet-title').textContent = `${cls.name} — ${sub.name} [${assessmentName}]`;

                // Fetch students of this class
                const students = await db.getAll('students');
                this.activeStudents = students.filter(s => s.currentClassId === courseMap.classId);

                if (this.activeStudents.length === 0) {
                    showNotification('No students are enrolled in this class room.', 'info');
                    sheetContainer.classList.add('hidden');
                    return;
                }

                // Fetch already logged grades
                const grades = await db.getAll('grades');
                const savedMap = {};
                let maxTarget = 100;
                grades.forEach(g => {
                    if (g.classSubjectId === classSubjectId && g.assessmentName === assessmentName) {
                        savedMap[g.studentId] = g.score;
                        maxTarget = g.maxScore || 100;
                    }
                });

                maxScoreInput.value = maxTarget;

                // Render register sheet
                let html = '';
                this.activeStudents.forEach(s => {
                    const savedScore = savedMap[s.studentId] !== undefined ? savedMap[s.studentId] : '';
                    const percent = savedScore !== '' ? Math.round((savedScore / maxTarget) * 100) : 0;
                    
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
                            <td class="py-3 px-4 flex justify-center">
                                <input type="number" name="score-${s.studentId}" value="${savedScore}" min="0" max="${maxTarget}" step="0.5" required
                                    class="w-24 bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-center text-xs font-bold text-white focus:outline-none focus:border-indigo-500 transition score-input">
                            </td>
                            <td class="py-3 px-4 text-right">
                                <span id="percent-${s.studentId}" class="font-black text-indigo-400 text-xs">${percent}%</span>
                            </td>
                        </tr>
                    `;
                });

                tbody.innerHTML = html;
                sheetContainer.classList.remove('hidden');

                // Bind instant calculations on input typing!
                tbody.querySelectorAll('.score-input').forEach(input => {
                    input.addEventListener('input', (e) => {
                        const stdId = e.target.name.replace('score-', '');
                        const maxVal = parseFloat(maxScoreInput.value) || 100;
                        const scoreVal = parseFloat(e.target.value) || 0;
                        
                        const percentSpan = document.getElementById(`percent-${stdId}`);
                        if (percentSpan) {
                            percentSpan.textContent = Math.round((scoreVal / maxVal) * 100) + '%';
                        }
                    });
                });

            } catch (err) {
                console.error(err);
                showNotification(err.message, 'error');
            }
        });

        // Listen to Max Score input updates dynamically to change grading boundaries!
        maxScoreInput.addEventListener('input', () => {
            const maxVal = parseFloat(maxScoreInput.value) || 100;
            tbody.querySelectorAll('.score-input').forEach(input => {
                const stdId = input.name.replace('score-', '');
                input.max = maxVal;
                const scoreVal = parseFloat(input.value) || 0;
                const percentSpan = document.getElementById(`percent-${stdId}`);
                if (percentSpan) {
                    percentSpan.textContent = Math.round((scoreVal / maxVal) * 100) + '%';
                }
            });
        });

        // Save Grades form submission
        formSaveGrades.addEventListener('submit', async (e) => {
            e.preventDefault();

            const classSubjectId = selectCourse.value;
            const assessmentName = selectAss.value;
            const user = auth.getCurrentUser();
            const maxScore = parseFloat(maxScoreInput.value) || 100;

            // Fetch course map
            const classSubjects = await db.getAll('classSubjects');
            const courseMap = classSubjects.find(cs => cs.classSubjectId === classSubjectId);
            
            // Extract category type
            const grades = await db.getAll('grades');
            const prev = grades.find(g => g.classSubjectId === classSubjectId && g.assessmentName === assessmentName);
            const assessmentType = prev ? prev.assessmentType : 'Quiz'; // default fallback

            try {
                for (const student of this.activeStudents) {
                    const scoreValInput = document.getElementsByName(`score-${student.studentId}`)[0].value;
                    const score = parseFloat(scoreValInput) || 0;
                    const gradePercentage = Math.round((score / maxScore) * 100);

                    // Check if already exists to update
                    const match = grades.find(g => g.studentId === student.studentId && g.classSubjectId === classSubjectId && g.assessmentName === assessmentName);

                    const gradeRec = {
                        gradeId: match ? match.gradeId : `grd-${generateUUID().substring(0, 10)}`,
                        studentId: student.studentId,
                        classSubjectId,
                        assessmentType,
                        assessmentName,
                        score,
                        maxScore,
                        gradePercentage,
                        gradeDate: new Date().toISOString().substring(0, 10),
                        recordedByUserId: user.userId
                    };

                    await db.put('grades', gradeRec);
                }

                showNotification('Grade registers saved successfully', 'success');
            } catch (err) {
                console.error(err);
                showNotification('Failed to save score registers: ' + err.message, 'error');
            }
        });

        // Generate spreadsheet gradebook grid view
        btnLoadBook.addEventListener('click', async () => {
            const classSubjectId = bookSelect.value;
            if (!classSubjectId) {
                showNotification('Please select Class Subject combination.', 'error');
                return;
            }

            try {
                const classes = await db.getAll('classes');
                const subjects = await db.getAll('subjects');
                const courseMap = this.classSubjects.find(cs => cs.classSubjectId === classSubjectId);
                
                const cls = classes.find(c => c.classId === courseMap.classId);
                const sub = subjects.find(s => s.subjectId === courseMap.subjectId);

                document.getElementById('gradebook-class-title').textContent = `${cls.name} — ${sub.name} Class Gradebook`;

                // Fetch students of this class
                const students = await db.getAll('students');
                const enrolledStds = students.filter(s => s.currentClassId === courseMap.classId);

                if (enrolledStds.length === 0) {
                    showNotification('No students enrolled in this class.', 'info');
                    bookGridContainer.classList.add('hidden');
                    return;
                }

                // Fetch grades
                const grades = await db.getAll('grades');
                const classGrades = grades.filter(g => g.classSubjectId === classSubjectId);

                // Extract all unique assessments
                const assMap = {};
                classGrades.forEach(g => {
                    assMap[g.assessmentName] = g.assessmentType;
                });
                const assNames = Object.keys(assMap);

                // Build Table HTML
                let tableHtml = `
                    <thead>
                        <tr class="border-b border-slate-850 text-slate-500 font-bold uppercase tracking-wider">
                            <th class="py-3 px-4">Student</th>
                            ${assNames.map(name => `
                                <th class="py-3 px-4 text-center">
                                    <div class="font-extrabold text-white text-xs">${name}</div>
                                    <div class="text-[9px] text-slate-400 font-semibold tracking-wide mt-0.5">${assMap[name]}</div>
                                </th>
                            `).join('')}
                            <th class="py-3 px-4 text-right">Term GPA / Avg</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-850/40 text-slate-300">
                `;

                enrolledStds.forEach(s => {
                    let totalPercent = 0;
                    let count = 0;

                    let studentRowHtml = `
                        <tr class="hover:bg-slate-900/10 transition align-middle">
                            <td class="py-3 px-4 font-bold text-white text-xs">${s.firstName} ${s.lastName}</td>
                    `;

                    assNames.forEach(assName => {
                        const grade = classGrades.find(g => g.studentId === s.studentId && g.assessmentName === assName);
                        if (grade) {
                            studentRowHtml += `<td class="py-3 px-4 text-center font-bold text-indigo-300">${grade.score}/${grade.maxScore} <span class="text-[9px] text-slate-500 font-medium">(${grade.gradePercentage}%)</span></td>`;
                            totalPercent += grade.gradePercentage;
                            count++;
                        } else {
                            studentRowHtml += `<td class="py-3 px-4 text-center text-slate-600 font-medium italic">-</td>`;
                        }
                    });

                    // Term average
                    const average = count > 0 ? Math.round(totalPercent / count) : 0;
                    let averageColor = 'text-slate-400';
                    if (average >= 85) averageColor = 'text-emerald-400 font-black';
                    else if (average >= 70) averageColor = 'text-indigo-400 font-black';
                    else if (average >= 60) averageColor = 'text-amber-400 font-bold';
                    else if (average > 0) averageColor = 'text-rose-450 font-bold';

                    studentRowHtml += `
                            <td class="py-3 px-4 text-right font-black ${averageColor} text-xs">${count > 0 ? average + '%' : 'N/A'}</td>
                        </tr>
                    `;
                    tableHtml += studentRowHtml;
                });

                tableHtml += '</tbody>';
                bookTable.innerHTML = tableHtml;
                bookGridContainer.classList.remove('hidden');

            } catch (err) {
                console.error(err);
                showNotification(err.message, 'error');
            }
        });
    }
}

export { GradingView };
