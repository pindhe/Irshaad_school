/**
 * AL-irshaad School Management System - Login View Component
 */

import { auth } from '../auth.js';

class LoginView {
    constructor(container) {
        this.container = container;
    }

    render() {
        this.container.innerHTML = `
            <div class="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden p-8 z-10 animate-fade-in">
                <!-- Branding Header -->
                <div class="text-center mb-8">
                    <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-2xl text-white shadow-xl shadow-indigo-500/20 mx-auto mb-4">
                        AI
                    </div>
                    <h2 class="text-2xl font-extrabold tracking-wide text-white">AL-irshaad Secondary</h2>
                    <p class="text-xs text-slate-400 font-medium mt-1">Sign in to school portal</p>
                </div>

                <!-- Alert message area -->
                <div id="login-error" class="hidden mb-4 p-3 bg-rose-950/50 border border-rose-500/30 rounded-xl text-rose-200 text-xs flex items-center gap-2">
                    <svg class="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                    <span id="login-error-msg">Incorrect username or password.</span>
                </div>

                <!-- Form -->
                <form id="form-login" class="space-y-5">
                    <div>
                        <label for="username" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Username</label>
                        <input type="text" id="username" name="username" required
                            class="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition placeholder-slate-650"
                            placeholder="e.g. admin or ahmed">
                    </div>

                    <div>
                        <label for="password" class="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Password</label>
                        <input type="password" id="password" name="password" required
                            class="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition placeholder-slate-650"
                            placeholder="••••••••">
                    </div>

                    <div class="flex items-center justify-between text-xs pt-1">
                        <label class="flex items-center gap-2 cursor-pointer select-none text-slate-300">
                            <input type="checkbox" id="rememberMe" name="rememberMe" class="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0 focus:ring-offset-0">
                            <span>Remember this device</span>
                        </label>
                        <a href="javascript:void(0)" onclick="alert('Please contact your administrator to reset your password.')" class="text-indigo-400 hover:text-indigo-300 font-medium">Forgot password?</a>
                    </div>

                    <button type="submit" id="btn-submit"
                        class="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all duration-300 transform active:scale-95 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 mt-6">
                        <span>Sign In</span>
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                        </svg>
                    </button>
                </form>

                <!-- Help details box -->
                <div class="mt-8 pt-6 border-t border-slate-800/80 text-center">
                    <div class="bg-indigo-500/5 rounded-xl border border-indigo-500/10 p-3.5">
                        <h4 class="text-xs font-semibold text-indigo-300 mb-1 flex items-center justify-center gap-1.5">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Default Demo Portals
                        </h4>
                        <div class="text-[10px] text-slate-400 text-left space-y-1 mt-2">
                            <div class="flex justify-between">
                                <span><strong>Admin</strong>: username: <code class="text-indigo-400 font-bold bg-slate-950 px-1 rounded">admin</code></span>
                                <span>password: <code class="text-indigo-400 font-bold bg-slate-950 px-1 rounded">admin123</code></span>
                            </div>
                            <div class="flex justify-between">
                                <span><strong>Teacher</strong>: username: <code class="text-violet-400 font-bold bg-slate-950 px-1 rounded">ahmed</code></span>
                                <span>password: <code class="text-violet-400 font-bold bg-slate-950 px-1 rounded">teacher123</code></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.registerEvents();
    }

    registerEvents() {
        const form = document.getElementById('form-login');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            const rememberMeInput = document.getElementById('rememberMe');
            const btnSubmit = document.getElementById('btn-submit');
            const errorAlert = document.getElementById('login-error');
            const errorMsg = document.getElementById('login-error-msg');

            // Button loading state
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = `
                <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Signing in...</span>
            `;
            errorAlert.classList.add('hidden');

            try {
                const username = usernameInput.value.trim().toLowerCase();
                const password = passwordInput.value;
                const rememberMe = rememberMeInput.checked;

                await auth.login(username, password, rememberMe);
                
                showNotification('Welcome back, ' + username + '!', 'success');
                
                // Redirect to dashboard SPA hash
                window.location.hash = '#/dashboard';
            } catch (err) {
                console.error(err);
                // Reset loading button state
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = `
                    <span>Sign In</span>
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                    </svg>
                `;

                // Display detailed message
                errorMsg.textContent = err.message || 'Incorrect credentials, try again.';
                errorAlert.classList.remove('hidden');
            }
        });
    }
}

export { LoginView };
