/**
 * AL-irshaad School Management System - Settings View Component (Admin Only)
 */

import { db } from '../db.js';

class SettingsView {
    constructor(container) {
        this.container = container;
        this.gradingScale = [];
    }

    async render() {
        // Fetch current school configuration settings
        const schoolName = await db.get('settings', 'schoolName');
        const academicYear = await db.get('settings', 'academicYear');
        const currentTerm = await db.get('settings', 'currentTerm');
        const gradingScaleSetting = await db.get('settings', 'gradingScale');

        this.gradingScale = gradingScaleSetting ? gradingScaleSetting.settingValue : [];

        this.container.innerHTML = `
            <div>
                <h1 class="text-2xl font-black text-white tracking-wide">School Configurations</h1>
                <p class="text-xs text-slate-400 mt-1">Admin Panel: Configure core school metadata, update session terms, and tailor grading scales.</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Left panel (2 cols): General configurations -->
                <div class="lg:col-span-2 space-y-6">
                    <form id="form-general-settings" class="bg-slate-900/30 border border-slate-800/60 p-6 rounded-2xl space-y-4">
                        <h3 class="text-xs font-bold text-indigo-400 uppercase tracking-wider pb-2 border-b border-slate-850">General School Profile</h3>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div class="sm:col-span-2">
                                <label for="set-school-name" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">School Name</label>
                                <input type="text" id="set-school-name" value="${schoolName ? schoolName.settingValue : 'AL-irshaad Secondary School'}" required
                                    class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition">
                            </div>
                            <div>
                                <label for="set-academic-year" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Academic Year</label>
                                <input type="text" id="set-academic-year" value="${academicYear ? academicYear.settingValue : '2025-2026'}" required
                                    class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition" placeholder="e.g. 2025-2026">
                            </div>
                            <div>
                                <label for="set-current-term" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Current Active Term</label>
                                <select id="set-current-term" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition">
                                    <option value="Term 1" ${currentTerm && currentTerm.settingValue === 'Term 1' ? 'selected' : ''}>Term 1</option>
                                    <option value="Term 2" ${currentTerm && currentTerm.settingValue === 'Term 2' ? 'selected' : ''}>Term 2</option>
                                    <option value="Term 3" ${currentTerm && currentTerm.settingValue === 'Term 3' ? 'selected' : ''}>Term 3</option>
                                </select>
                            </div>
                        </div>

                        <div class="flex justify-end pt-4">
                            <button type="submit" class="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs transition shadow-md shadow-indigo-650/15">
                                Save Profile Configurations
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Right panel (1 col): Dynamic Grading Scale editing -->
                <div class="bg-slate-900/30 border border-slate-800/60 p-6 rounded-2xl space-y-4">
                    <h3 class="text-xs font-bold text-violet-400 uppercase tracking-wider pb-2 border-b border-slate-850">Grading Boundaries Scale</h3>
                    <p class="text-[10px] text-slate-450 leading-relaxed font-medium">Modify letter grades ranges. Minimum values must be lower than maximums.</p>

                    <form id="form-grading-scale" class="space-y-4">
                        <div class="space-y-2.5 max-h-96 overflow-y-auto custom-scrollbar pr-1" id="grading-scale-container">
                            <!-- Populated dynamically -->
                        </div>

                        <button type="submit" class="w-full bg-indigo-650 hover:bg-indigo-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-md shadow-indigo-650/15">
                            Update Grading Boundaries
                        </button>
                    </form>
                </div>
            </div>
        `;

        this.loadGradingScale();
        this.registerEvents();
    }

    loadGradingScale() {
        const container = document.getElementById('grading-scale-container');
        if (!container) return;

        let html = '';
        this.gradingScale.forEach((scale, i) => {
            html += `
                <div class="p-3 bg-slate-950/60 border border-slate-850 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <span class="w-8 font-black text-white text-center bg-slate-900 border border-slate-800 py-1 rounded text-[10px] uppercase">${scale.grade}</span>
                    
                    <div class="flex items-center gap-1.5 flex-1">
                        <input type="number" id="scale-min-${i}" value="${scale.min}" min="0" max="100" required
                            class="w-16 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-center font-semibold text-slate-300 focus:outline-none focus:border-indigo-500">
                        <span class="text-slate-500 font-bold">%</span>
                        <span class="text-slate-500 text-[10px] uppercase font-bold mx-1">to</span>
                        <input type="number" id="scale-max-${i}" value="${scale.max}" min="0" max="100" required
                            class="w-16 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-center font-semibold text-slate-300 focus:outline-none focus:border-indigo-500">
                        <span class="text-slate-500 font-bold">%</span>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    registerEvents() {
        const formGeneral = document.getElementById('form-general-settings');
        const formGrading = document.getElementById('form-grading-scale');

        formGeneral.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('set-school-name').value.trim();
            const year = document.getElementById('set-academic-year').value.trim();
            const term = document.getElementById('set-current-term').value;

            try {
                await db.put('settings', { settingKey: 'schoolName', settingValue: name });
                await db.put('settings', { settingKey: 'academicYear', settingValue: year });
                await db.put('settings', { settingKey: 'currentTerm', settingValue: term });

                showNotification('General settings saved successfully!', 'success');

                // Update UI headers instantly
                const headerSchool = document.getElementById('header-school-name');
                const headerYear = document.getElementById('header-academic-year');
                const headerTerm = document.getElementById('header-current-term');

                if (headerSchool) headerSchool.textContent = name;
                if (headerYear) headerYear.textContent = year;
                if (headerTerm) headerTerm.textContent = term;
            } catch (err) {
                console.error(err);
                showNotification('Failed to update config: ' + err.message, 'error');
            }
        });

        formGrading.addEventListener('submit', async (e) => {
            e.preventDefault();

            try {
                const newScale = this.gradingScale.map((scale, i) => {
                    const minVal = parseInt(document.getElementById(`scale-min-${i}`).value);
                    const maxVal = parseInt(document.getElementById(`scale-max-${i}`).value);

                    if (minVal > maxVal) {
                        throw new Error(`Invalid range for Grade ${scale.grade}: Min cannot exceed Max.`);
                    }

                    return {
                        grade: scale.grade,
                        min: minVal,
                        max: maxVal,
                        gpa: scale.gpa
                    };
                });

                await db.put('settings', { settingKey: 'gradingScale', settingValue: newScale });
                this.gradingScale = newScale;
                showNotification('Grading boundaries scale updated successfully', 'success');
            } catch (err) {
                console.error(err);
                showNotification(err.message, 'error');
            }
        });
    }
}

export { SettingsView };
