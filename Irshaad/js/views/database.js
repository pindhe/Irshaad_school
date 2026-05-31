/**
 * AL-irshaad School Management System - Data Management View Component (Admin Only)
 */

import { db } from '../db.js';
import { auth } from '../auth.js';

class DatabaseView {
    constructor(container) {
        this.container = container;
    }

    async render() {
        this.container.innerHTML = `
            <div>
                <h1 class="text-2xl font-black text-white tracking-wide">Data Storage & Portability</h1>
                <p class="text-xs text-slate-400 mt-1">Admin Panel: Control data portability, backup local storage caches, or perform system resets.</p>
            </div>

            <!-- Grid options -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Backup Panel -->
                <div class="bg-slate-900/30 border border-slate-800/60 p-6 rounded-2xl space-y-4">
                    <div class="flex items-center gap-2 pb-2 border-b border-slate-850">
                        <span class="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                            <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                            </svg>
                        </span>
                        <h3 class="text-xs font-bold text-white uppercase tracking-wider">Export Database Backup</h3>
                    </div>
                    <p class="text-xs text-slate-450 leading-relaxed font-medium">
                        Compiles all pupils, scores, attendance logs, settings, and credentials into a secure download file. Keep this safe for emergency recovery.
                    </p>
                    <button type="button" id="btn-export-db" class="w-full bg-gradient-to-r from-indigo-600 to-violet-650 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-lg shadow-indigo-650/15">
                        Generate & Download JSON Backup
                    </button>
                </div>

                <!-- Restore Panel -->
                <div class="bg-slate-900/30 border border-slate-800/60 p-6 rounded-2xl space-y-4">
                    <div class="flex items-center gap-2 pb-2 border-b border-slate-850">
                        <span class="p-1.5 bg-violet-500/10 text-violet-400 rounded-lg">
                            <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                            </svg>
                        </span>
                        <h3 class="text-xs font-bold text-white uppercase tracking-wider">Import Database Restore</h3>
                    </div>
                    <p class="text-xs text-slate-455 leading-relaxed font-medium">
                        Upload a previously exported backup file to overwrite your current browser cache. <strong>Caution:</strong> This will fully erase current database tables.
                    </p>
                    
                    <label class="w-full border-2 border-dashed border-slate-800 hover:border-violet-500/40 rounded-xl py-4 px-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition bg-slate-950/40">
                        <span class="text-[10px] font-bold text-indigo-400">SELECT BACKUP FILE (.JSON)</span>
                        <span id="restore-file-name" class="text-[10px] text-slate-500 italic">No file selected</span>
                        <input type="file" id="input-restore-file" accept=".json" class="hidden">
                    </label>

                    <button type="button" id="btn-import-db" disabled class="w-full bg-violet-650 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-md shadow-violet-650/15">
                        Trigger Database Restoration
                    </button>
                </div>

                <!-- Wipe Panel -->
                <div class="bg-rose-950/5 border border-rose-500/10 p-6 rounded-2xl space-y-4 md:col-span-2 relative overflow-hidden">
                    <div class="absolute -right-16 -bottom-16 w-40 h-40 bg-rose-500/5 rounded-full blur-2xl"></div>
                    <div class="flex items-center gap-2 pb-2 border-b border-rose-950/20">
                        <span class="p-1.5 bg-rose-500/10 text-rose-450 rounded-lg">
                            <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </span>
                        <h3 class="text-xs font-bold text-rose-350 uppercase tracking-wider">Dangerous: System Hard Reset</h3>
                    </div>
                    <p class="text-xs text-rose-350 opacity-80 leading-relaxed font-semibold">
                        This action will irrevocably delete all student directories, grades sheets, daily attendance records, and credentials. 
                    </p>

                    <div class="flex flex-col sm:flex-row gap-4 items-end bg-[#0c0d16] border border-rose-950/30 p-4 rounded-xl">
                        <div class="flex-1 w-full">
                            <label for="input-wipe-verify" class="block text-[9px] font-bold text-rose-400 uppercase tracking-wider mb-1">Type "RESET" to verify action</label>
                            <input type="text" id="input-wipe-verify" class="w-full bg-slate-950 border border-rose-950/40 rounded-xl px-3 py-2 text-rose-200 text-xs focus:outline-none focus:border-rose-500 transition" placeholder="Type RESET here">
                        </div>
                        <div class="w-full sm:w-48">
                            <button type="button" id="btn-wipe-db" disabled class="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-md shadow-rose-600/20">
                                Erase System Database
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.registerEvents();
    }

    registerEvents() {
        const btnExport = document.getElementById('btn-export-db');
        const btnImport = document.getElementById('btn-import-db');
        const inputRestore = document.getElementById('input-restore-file');
        const restoreNameLabel = document.getElementById('restore-file-name');
        
        const inputWipeVerify = document.getElementById('input-wipe-verify');
        const btnWipe = document.getElementById('btn-wipe-db');

        let parsedRestoreData = null;

        // 1. Export Backup Action
        btnExport.addEventListener('click', async () => {
            try {
                // Fetch all tables
                const storeNames = ['users', 'students', 'teachers', 'classes', 'subjects', 'classSubjects', 'attendanceRecords', 'grades', 'settings'];
                const exportData = {};

                for (const storeName of storeNames) {
                    exportData[storeName] = await db.getAll(storeName);
                }

                // Format filename
                const dateStamp = new Date().toISOString().substring(0, 10).replace(/-/g, '');
                const fileName = `AL-irshaad_backup_${dateStamp}.json`;

                // Create Blob download
                const jsonStr = JSON.stringify(exportData, null, 2);
                const blob = new Blob([jsonStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                showNotification('Database backup JSON exported successfully', 'success');
            } catch (err) {
                console.error(err);
                showNotification('Export failed: ' + err.message, 'error');
            }
        });

        // 2. Select file for restore
        inputRestore.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            restoreNameLabel.textContent = file.name;
            restoreNameLabel.className = 'text-[10px] text-indigo-400 font-bold';

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const parsed = JSON.parse(event.target.result);
                    
                    // Simple Schema validation
                    const required = ['users', 'students', 'teachers', 'classes', 'subjects', 'classSubjects', 'settings'];
                    const missing = required.filter(key => !parsed[key]);
                    
                    if (missing.length > 0) {
                        throw new Error(`File is missing required tables: ${missing.join(', ')}`);
                    }

                    parsedRestoreData = parsed;
                    btnImport.disabled = false;
                    showNotification('Backup file validation succeeded. Click Restore to overwrite.', 'info');
                } catch (err) {
                    console.error(err);
                    showNotification('Validation error: ' + err.message, 'error');
                    restoreNameLabel.textContent = 'Invalid Schema';
                    restoreNameLabel.className = 'text-[10px] text-rose-500 font-bold';
                    parsedRestoreData = null;
                    btnImport.disabled = true;
                }
            };
            reader.readAsText(file);
        });

        // 3. Restore Import Action
        btnImport.addEventListener('click', async () => {
            if (!parsedRestoreData) return;

            if (confirm('Warning: Overwriting is irreversible! This will replace all current data. Do you wish to proceed?')) {
                try {
                    const storeNames = ['users', 'students', 'teachers', 'classes', 'subjects', 'classSubjects', 'attendanceRecords', 'grades', 'settings'];
                    
                    for (const storeName of storeNames) {
                        // Clear database table
                        await db.clearStore(storeName);
                        
                        // Populate with restored list
                        const records = parsedRestoreData[storeName] || [];
                        for (const record of records) {
                            await db.put(storeName, record);
                        }
                    }

                    showNotification('System database successfully restored!', 'success');
                    
                    // Delay and log user out to force reload state
                    setTimeout(() => {
                        auth.logout();
                        window.location.hash = '#/login';
                        window.location.reload();
                    }, 1500);

                } catch (err) {
                    console.error(err);
                    showNotification('Restoration process failed: ' + err.message, 'error');
                }
            }
        });

        // 4. Wipe input listener
        inputWipeVerify.addEventListener('input', () => {
            if (inputWipeVerify.value === 'RESET') {
                btnWipe.disabled = false;
            } else {
                btnWipe.disabled = true;
            }
        });

        // 5. System Wipe Action
        btnWipe.addEventListener('click', async () => {
            if (inputWipeVerify.value !== 'RESET') return;

            if (confirm('CAUTION: Are you absolutely sure you want to completely erase the portal database? All data will be lost forever.')) {
                try {
                    const storeNames = ['users', 'students', 'teachers', 'classes', 'subjects', 'classSubjects', 'attendanceRecords', 'grades', 'settings'];
                    
                    for (const name of storeNames) {
                        await db.clearStore(name);
                    }

                    showNotification('Database cleared. Rebooting system...', 'success');
                    
                    // Delay and log user out to trigger app.js re-bootstrapping and default admin seeding!
                    setTimeout(() => {
                        auth.logout();
                        window.location.hash = '#/login';
                        window.location.reload();
                    }, 1500);

                } catch (err) {
                    console.error(err);
                    showNotification('Wipe failed: ' + err.message, 'error');
                }
            }
        });
    }
}

export { DatabaseView };
