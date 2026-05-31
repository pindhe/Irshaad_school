/**
 * AL-irshaad School Management System - Client-side Hash Router
 */

import { auth } from './auth.js';

class Router {
    constructor() {
        this.routes = {};
        this.appContentId = 'app-content';
        this.sidebarContainerId = 'sidebar-container';
        
        // Listen to hash changes
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => this.handleRoute());
    }

    addRoute(path, viewClass, requiredRole = null) {
        this.routes[path] = { viewClass, requiredRole };
    }

    async handleRoute() {
        let hash = window.location.hash || '#/dashboard';
        
        // Parse simple hash (remove leading # and query if any)
        const parts = hash.split('?');
        let path = parts[0];
        const queryString = parts[1] || '';
        
        // Extract query parameters
        const queryParams = {};
        if (queryString) {
            queryString.split('&').forEach(param => {
                const [key, val] = param.split('=');
                queryParams[key] = decodeURIComponent(val);
            });
        }

        // Authentication & Role Check
        const isAuthenticated = auth.isAuthenticated();
        
        if (path === '#/login') {
            if (isAuthenticated) {
                window.location.hash = '#/dashboard';
                return;
            }
            this.renderLogin();
            return;
        }

        if (!isAuthenticated) {
            window.location.hash = '#/login';
            return;
        }

        const route = this.routes[path];
        if (!route) {
            console.warn(`Route ${path} not found. Redirecting to dashboard.`);
            window.location.hash = '#/dashboard';
            return;
        }

        // Role restriction check
        if (route.requiredRole) {
            const user = auth.getCurrentUser();
            if (user.role !== route.requiredRole && user.role !== 'Admin') {
                // If unauthorized, redirect to dashboard with warning
                showNotification('Access Denied: Admin role required.', 'error');
                window.location.hash = '#/dashboard';
                return;
            }
        }

        // Render Sidebar Layout if authenticated and not in login screen
        this.ensureLayout();

        // Update active class in sidebar links
        this.updateSidebarActive(path);

        // Instantiate and render the view
        const container = document.getElementById(this.appContentId);
        if (container) {
            container.innerHTML = `
                <div class="flex items-center justify-center h-64">
                    <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            `;
            try {
                const viewInstance = new route.viewClass(container, queryParams);
                await viewInstance.render();
            } catch (err) {
                console.error(`Error rendering view ${path}:`, err);
                container.innerHTML = `
                    <div class="p-6 bg-red-950/20 border border-red-500/30 rounded-2xl text-center text-red-200">
                        <svg class="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                        <h3 class="text-xl font-bold mb-2">Error Loading View</h3>
                        <p class="text-sm opacity-80">${err.message}</p>
                        <button onclick="window.location.reload()" class="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition">Retry</button>
                    </div>
                `;
            }
        }
    }

    renderLogin() {
        // Remove app shell and render login screen directly
        document.body.innerHTML = `
            <div id="login-container" class="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
                <!-- Glowing background circles -->
                <div class="absolute w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] -top-40 -left-40 animate-pulse duration-10000"></div>
                <div class="absolute w-[500px] h-[500px] bg-violet-900/20 rounded-full blur-[120px] -bottom-40 -right-40 animate-pulse duration-10000"></div>
                
                <div id="app-content"></div>
            </div>
            <div id="toast-container" class="fixed top-4 right-4 z-50 flex flex-col gap-2"></div>
        `;
        
        import('./views/login.js').then(module => {
            const loginContainer = document.getElementById('app-content');
            new module.LoginView(loginContainer).render();
        });
    }

    ensureLayout() {
        if (document.getElementById('app-shell')) return;

        const user = auth.getCurrentUser();
        const isAdmin = user && user.role === 'Admin';

        // Rebuild full layout shell
        document.body.innerHTML = `
            <div id="app-shell" class="min-h-screen bg-[#070b19] text-slate-100 flex overflow-hidden font-sans">
                <!-- Sidebar -->
                <aside id="sidebar" class="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/60 flex flex-col flex-shrink-0 transition-all duration-300 relative z-20">
                    <div class="p-5 flex items-center gap-3 border-b border-slate-800/60">
                        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-indigo-500/20">
                            AI
                        </div>
                        <div>
                            <h1 class="font-extrabold text-sm tracking-wider uppercase bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">AL-irshaad</h1>
                            <p class="text-[10px] text-slate-400">Offline Management</p>
                        </div>
                    </div>

                    <!-- Navigation Items -->
                    <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                        <a href="#/dashboard" data-path="#/dashboard" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all group">
                            <svg class="w-5 h-5 group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"/>
                            </svg>
                            <span class="text-sm font-medium">Dashboard</span>
                        </a>

                        <div class="pt-4 pb-2 px-4 text-[10px] font-bold text-slate-500 tracking-wider uppercase">Academic</div>

                        <a href="#/students" data-path="#/students" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all group">
                            <svg class="w-5 h-5 group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                            </svg>
                            <span class="text-sm font-medium">Students</span>
                        </a>

                        <a href="#/teachers" data-path="#/teachers" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all group">
                            <svg class="w-5 h-5 group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                            </svg>
                            <span class="text-sm font-medium">Teachers</span>
                        </a>

                        <a href="#/classes" data-path="#/classes" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all group">
                            <svg class="w-5 h-5 group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                            </svg>
                            <span class="text-sm font-medium">Classes & Subjects</span>
                        </a>

                        <div class="pt-4 pb-2 px-4 text-[10px] font-bold text-slate-500 tracking-wider uppercase">Operations</div>

                        <a href="#/attendance" data-path="#/attendance" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all group">
                            <svg class="w-5 h-5 group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                            </svg>
                            <span class="text-sm font-medium">Attendance</span>
                        </a>

                        <a href="#/grading" data-path="#/grading" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all group">
                            <svg class="w-5 h-5 group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <span class="text-sm font-medium">Grading</span>
                        </a>

                        <a href="#/reports" data-path="#/reports" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all group">
                            <svg class="w-5 h-5 group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                            <span class="text-sm font-medium">Report Cards</span>
                        </a>

                        ${isAdmin ? `
                        <div class="pt-4 pb-2 px-4 text-[10px] font-bold text-slate-500 tracking-wider uppercase">Administration</div>

                        <a href="#/users" data-path="#/users" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all group">
                            <svg class="w-5 h-5 group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
                            </svg>
                            <span class="text-sm font-medium">User Accounts</span>
                        </a>

                        <a href="#/settings" data-path="#/settings" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all group">
                            <svg class="w-5 h-5 group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            <span class="text-sm font-medium">School Settings</span>
                        </a>

                        <a href="#/database" data-path="#/database" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all group">
                            <svg class="w-5 h-5 group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4m0 5c0 2.21-3.58 4-8 4s-8-1.79-8-4"/>
                            </svg>
                            <span class="text-sm font-medium">Data Management</span>
                        </a>
                        ` : ''}
                    </nav>

                    <!-- Sidebar Footer: Offline indicator + profile -->
                    <div class="p-4 border-t border-slate-800/60 bg-slate-900/40 flex flex-col gap-3">
                        <!-- Offline glow indicator -->
                        <div class="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                            <span class="relative flex h-2 w-2">
                                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span class="text-[10px] text-indigo-200 font-medium tracking-wide">Database Connected (Offline)</span>
                        </div>

                        <!-- User Profile Card -->
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <div class="w-9 h-9 rounded-lg bg-indigo-600/30 flex items-center justify-center font-bold text-indigo-400 border border-indigo-500/20 text-xs">
                                    ${user.name ? user.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : 'U'}
                                </div>
                                <div class="overflow-hidden w-28">
                                    <h4 class="text-xs font-semibold text-white truncate leading-none mb-1">${user.name}</h4>
                                    <span class="text-[10px] text-slate-400 capitalize">${user.role}</span>
                                </div>
                            </div>
                            <!-- Logout Button -->
                            <button id="btn-logout" class="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800/50 transition">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </aside>

                <!-- Collapsed Sidebar Trigger for Mobile -->
                <div class="flex-1 flex flex-col overflow-hidden">
                    <!-- Top header bar -->
                    <header class="h-16 bg-[#090e24]/75 backdrop-blur-md border-b border-slate-800/60 px-6 flex items-center justify-between z-10">
                        <div class="flex items-center gap-4">
                            <!-- Menu burger for mobile -->
                            <button class="md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-800/50">
                                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                                </svg>
                            </button>
                            <h2 id="header-school-name" class="text-md font-bold text-white tracking-wide">AL-irshaad School</h2>
                        </div>
                        <div class="flex items-center gap-4 text-xs text-slate-400">
                            <div class="hidden sm:flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800/50">
                                <span class="font-medium text-slate-300">Academic Year:</span>
                                <span id="header-academic-year" class="text-indigo-400 font-semibold">2025-2026</span>
                            </div>
                            <div class="hidden sm:flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800/50">
                                <span class="font-medium text-slate-300">Term:</span>
                                <span id="header-current-term" class="text-violet-400 font-semibold">Term 1</span>
                            </div>
                        </div>
                    </header>

                    <!-- Main Dynamic Content Container -->
                    <main class="flex-1 overflow-y-auto custom-scrollbar p-6 relative">
                        <div id="app-content" class="max-w-7xl mx-auto space-y-6 animate-fade-in"></div>
                    </main>
                </div>
            </div>
            <div id="toast-container" class="fixed top-4 right-4 z-50 flex flex-col gap-2"></div>
        `;

        // Register Logout button listener
        document.getElementById('btn-logout').addEventListener('click', () => {
            auth.logout();
            showNotification('Logged out successfully', 'info');
            window.location.hash = '#/login';
        });

        // Update header details from IndexedDB dynamically
        this.loadHeaderSettings();
    }

    async loadHeaderSettings() {
        try {
            const schoolName = await db.get('settings', 'schoolName');
            const academicYear = await db.get('settings', 'academicYear');
            const currentTerm = await db.get('settings', 'currentTerm');

            if (schoolName) document.getElementById('header-school-name').textContent = schoolName.settingValue;
            if (academicYear) document.getElementById('header-academic-year').textContent = academicYear.settingValue;
            if (currentTerm) document.getElementById('header-current-term').textContent = currentTerm.settingValue;
        } catch (e) {
            console.error('Failed to load settings in header:', e);
        }
    }

    updateSidebarActive(path) {
        const links = document.querySelectorAll('#sidebar nav a');
        links.forEach(link => {
            const linkPath = link.getAttribute('data-path');
            if (linkPath === path) {
                link.classList.remove('text-slate-400', 'hover:text-white', 'hover:bg-slate-800/40');
                link.classList.add('text-white', 'bg-gradient-to-r', 'from-indigo-600/30', 'to-violet-600/10', 'border-l-4', 'border-indigo-500', 'pl-3');
            } else {
                link.classList.add('text-slate-400', 'hover:text-white', 'hover:bg-slate-800/40');
                link.classList.remove('text-white', 'bg-gradient-to-r', 'from-indigo-600/30', 'to-violet-600/10', 'border-l-4', 'border-indigo-500', 'pl-3');
            }
        });
    }
}

// Global Notification Helper (Dynamic Toast)
window.showNotification = function(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `transform translate-y-2 opacity-0 transition-all duration-300 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm max-w-sm backdrop-blur-md`;
    
    let bgClass = 'bg-[#0f1b2d]/90 border-slate-700 text-slate-100';
    let icon = '';

    if (type === 'success') {
        bgClass = 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200';
        icon = `<svg class="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
    } else if (type === 'error') {
        bgClass = 'bg-rose-950/80 border-rose-500/30 text-rose-200';
        icon = `<svg class="w-5 h-5 text-rose-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;
    } else if (type === 'info') {
        bgClass = 'bg-indigo-950/80 border-indigo-500/30 text-indigo-200';
        icon = `<svg class="w-5 h-5 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
    }

    toast.className += ` ${bgClass}`;
    toast.innerHTML = `${icon}<span>${message}</span>`;
    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    // Remove toast
    setTimeout(() => {
        toast.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
};

const router = new Router();
export { router };
