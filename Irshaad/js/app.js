/**
 * AL-irshaad School Management System - Main App Bootstrap
 */

import { db } from './db.js';
import { seedDatabaseIfEmpty } from './auth.js';
import { router } from './router.js';

// Import Views so we can register them in router
import { DashboardView } from './views/dashboard.js';
import { UsersView } from './views/users.js';
import { StudentsView } from './views/students.js';
import { TeachersView } from './views/teachers.js';
import { ClassesView } from './views/classes.js';
import { AttendanceView } from './views/attendance.js';
import { GradingView } from './views/grading.js';
import { ReportsView } from './views/reports.js';
import { SettingsView } from './views/settings.js';
import { DatabaseView } from './views/database.js';

// Register routes
router.addRoute('#/dashboard', DashboardView);
router.addRoute('#/students', StudentsView);
router.addRoute('#/teachers', TeachersView);
router.addRoute('#/classes', ClassesView);
router.addRoute('#/attendance', AttendanceView);
router.addRoute('#/grading', GradingView);
router.addRoute('#/reports', ReportsView);

// Admin-only protected views
router.addRoute('#/users', UsersView, 'Admin');
router.addRoute('#/settings', SettingsView, 'Admin');
router.addRoute('#/database', DatabaseView, 'Admin');

async function bootstrap() {
    try {
        console.log('Bootstrapping system...');
        
        // 1. Initialize IndexedDB
        await db.init();
        
        // 2. Run Database Seeder
        await seedDatabaseIfEmpty();
        
        // 3. Trigger initial routing cycle
        await router.handleRoute();

        // 4. Fade out preloader beautifully
        const preloader = document.getElementById('app-preloader');
        if (preloader) {
            preloader.classList.add('opacity-0', 'pointer-events-none');
            setTimeout(() => preloader.remove(), 500);
        }
        
    } catch (e) {
        console.error('System bootstrap failed:', e);
        const preloader = document.getElementById('app-preloader');
        if (preloader) {
            preloader.innerHTML = `
                <div class="text-center p-6 max-w-sm">
                    <div class="text-rose-500 text-5xl mb-4 font-bold">⚠️</div>
                    <h3 class="text-xl font-bold mb-2">Initialization Error</h3>
                    <p class="text-xs text-slate-400 mb-4">${e.message || 'Failed to open local storage database.'}</p>
                    <button onclick="window.location.reload()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs transition font-semibold">
                        Retry Reload
                    </button>
                </div>
            `;
        }
    }
}

// Start application
window.addEventListener('DOMContentLoaded', bootstrap);
