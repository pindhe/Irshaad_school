/**
 * AL-irshaad School Management System - User Accounts View Component (Admin Only)
 */

import { db, generateUUID } from '../db.js';
import { auth, hashPassword } from '../auth.js';

class UsersView {
    constructor(container) {
        this.container = container;
    }

    async render() {
        // Fetch all users and teachers to associate
        const users = await db.getAll('users');
        const teachers = await db.getAll('teachers');

        this.container.innerHTML = `
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 class="text-2xl font-black text-white tracking-wide">User Account Settings</h1>
                    <p class="text-xs text-slate-400 mt-1">Admin Panel: Control portal logins, reset credentials, and assign teacher links.</p>
                </div>
                <button id="btn-add-user" class="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                    </svg>
                    <span>Create User Account</span>
                </button>
            </div>

            <!-- Users Directory List -->
            <div class="bg-slate-900/40 border border-slate-800/60 rounded-2xl overflow-hidden p-6">
                <div class="overflow-x-auto custom-scrollbar">
                    <table class="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr class="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                                <th class="py-3 px-4">Full Name</th>
                                <th class="py-3 px-4">Username</th>
                                <th class="py-3 px-4">Role System</th>
                                <th class="py-3 px-4">Teacher Association</th>
                                <th class="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-850/40 text-slate-350" id="users-tbody">
                            <!-- Populated dynamically -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- MODAL: Create User -->
            <div id="modal-user" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
                <div class="bg-[#090e24] border border-slate-800/80 rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-fade-in">
                    <h3 id="modal-user-title" class="text-base font-bold text-white mb-4">Create New Account</h3>
                    
                    <form id="form-user" class="space-y-4">
                        <input type="hidden" id="edit-user-id">
                        
                        <div>
                            <label for="user-name" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                            <input type="text" id="user-name" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition">
                        </div>

                        <div>
                            <label for="user-username" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Username (Login ID)</label>
                            <input type="text" id="user-username" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition">
                        </div>

                        <div id="password-group">
                            <label for="user-password" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Password</label>
                            <input type="password" id="user-password" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition" placeholder="Enter secure password">
                        </div>

                        <div>
                            <label for="user-role" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">System Role</label>
                            <select id="user-role" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition">
                                <option value="Admin">Admin (Full Control)</option>
                                <option value="Teacher">Teacher (Assigned Access Only)</option>
                            </select>
                        </div>

                        <div id="teacher-assoc-group" class="hidden">
                            <label for="user-teacher" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Associate Teacher Record</label>
                            <select id="user-teacher" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition">
                                <option value="">-- No Link --</option>
                                ${teachers.map(t => `<option value="${t.teacherId}">${t.firstName} ${t.lastName}</option>`).join('')}
                            </select>
                        </div>

                        <div class="flex justify-end gap-2 pt-4">
                            <button type="button" id="btn-close-modal" class="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 font-semibold rounded-xl text-xs transition">
                                Cancel
                            </button>
                            <button type="submit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition">
                                Save Account
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        await this.loadUsersTable();
        this.registerEvents();
    }

    async loadUsersTable() {
        const tbody = document.getElementById('users-tbody');
        if (!tbody) return;

        const users = await db.getAll('users');
        const teachers = await db.getAll('teachers');
        const activeUser = auth.getCurrentUser();

        let html = '';
        users.forEach(user => {
            let assocText = 'N/A (Admin)';
            if (user.role === 'Teacher') {
                const teach = teachers.find(t => t.teacherId === user.relatedEntityId);
                assocText = teach ? `${teach.firstName} ${teach.lastName}` : '<span class="text-rose-450 italic font-semibold">Unlinked Record</span>';
            }

            const roleBadge = user.role === 'Admin' 
                ? '<span class="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-[10px] uppercase">Admin</span>'
                : '<span class="px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 font-bold text-[10px] uppercase">Teacher</span>';

            const isSelf = activeUser && activeUser.userId === user.userId;

            html += `
                <tr class="hover:bg-slate-900/20 transition">
                    <td class="py-3.5 px-4 font-bold text-white">${user.name} ${isSelf ? '<span class="text-[9px] text-indigo-400 font-semibold">(You)</span>' : ''}</td>
                    <td class="py-3.5 px-4 font-semibold text-indigo-300">${user.username}</td>
                    <td class="py-3.5 px-4">${roleBadge}</td>
                    <td class="py-3.5 px-4 text-xs font-medium">${assocText}</td>
                    <td class="py-3.5 px-4 text-right flex justify-end gap-1.5">
                        <button onclick="window.editUser('${user.userId}')" class="p-1.5 bg-slate-900 hover:bg-indigo-600/20 text-indigo-400 hover:text-white border border-slate-800 rounded-lg transition" title="Edit/Reset Password">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                            </svg>
                        </button>
                        <button onclick="window.deleteUser('${user.userId}')" ${isSelf ? 'disabled class="p-1.5 opacity-30 text-slate-500 cursor-not-allowed border border-slate-850 rounded-lg"' : 'class="p-1.5 bg-slate-900 hover:bg-rose-600/20 text-rose-400 hover:text-white border border-slate-800 rounded-lg transition"'} title="Delete user">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html || `
            <tr>
                <td colspan="5" class="py-6 text-center text-slate-500 italic">No user accounts found.</td>
            </tr>
        `;
    }

    registerEvents() {
        const modal = document.getElementById('modal-user');
        const btnAdd = document.getElementById('btn-add-user');
        const btnClose = document.getElementById('btn-close-modal');
        const form = document.getElementById('form-user');
        const selectRole = document.getElementById('user-role');
        const assocGroup = document.getElementById('teacher-assoc-group');
        const passwordGroup = document.getElementById('password-group');
        const userPassword = document.getElementById('user-password');

        // Toggle Teacher dropdown based on role select
        selectRole.addEventListener('change', () => {
            if (selectRole.value === 'Teacher') {
                assocGroup.classList.remove('hidden');
            } else {
                assocGroup.classList.add('hidden');
            }
        });

        btnAdd.addEventListener('click', () => {
            form.reset();
            document.getElementById('edit-user-id').value = '';
            document.getElementById('modal-user-title').textContent = 'Create New Account';
            assocGroup.classList.add('hidden');
            userPassword.required = true;
            passwordGroup.querySelector('label').textContent = 'Password';
            modal.classList.remove('hidden');
        });

        btnClose.addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const userIdInput = document.getElementById('edit-user-id').value;
            const name = document.getElementById('user-name').value.trim();
            const username = document.getElementById('user-username').value.trim().toLowerCase();
            const password = userPassword.value;
            const role = selectRole.value;
            const relatedEntityId = role === 'Teacher' ? document.getElementById('user-teacher').value : null;

            try {
                // If editing
                if (userIdInput) {
                    const existingUser = await db.get('users', userIdInput);
                    if (!existingUser) throw new Error('Account does not exist');
                    
                    existingUser.name = name;
                    existingUser.username = username;
                    existingUser.role = role;
                    existingUser.relatedEntityId = relatedEntityId;

                    // Update password only if provided
                    if (password) {
                        existingUser.hashedPassword = await hashPassword(password);
                    }

                    await db.put('users', existingUser);
                    showNotification('User account updated successfully', 'success');
                } else {
                    // Creating new account
                    // Check username availability
                    const existing = await db.getByIndex('users', 'username', username);
                    if (existing.length > 0) {
                        throw new Error('Username already exists');
                    }

                    if (!password) {
                        throw new Error('Password is required for new accounts');
                    }

                    const newHashed = await hashPassword(password);
                    const newUser = {
                        userId: generateUUID(),
                        name,
                        username,
                        hashedPassword: newHashed,
                        role,
                        relatedEntityId
                    };

                    await db.put('users', newUser);
                    showNotification('Account created successfully!', 'success');
                }

                modal.classList.add('hidden');
                await this.loadUsersTable();
            } catch (err) {
                console.error(err);
                showNotification(err.message, 'error');
            }
        });

        // Global functions for actions
        window.editUser = async (userId) => {
            const user = await db.get('users', userId);
            if (!user) return;

            document.getElementById('edit-user-id').value = user.userId;
            document.getElementById('user-name').value = user.name || '';
            document.getElementById('user-username').value = user.username;
            document.getElementById('user-role').value = user.role;
            userPassword.value = '';
            userPassword.required = false;
            passwordGroup.querySelector('label').textContent = 'Change Password (Leave blank to keep same)';

            if (user.role === 'Teacher') {
                assocGroup.classList.remove('hidden');
                document.getElementById('user-teacher').value = user.relatedEntityId || '';
            } else {
                assocGroup.classList.add('hidden');
            }

            document.getElementById('modal-user-title').textContent = 'Edit Portal Credentials';
            modal.classList.remove('hidden');
        };

        window.deleteUser = async (userId) => {
            const user = await db.get('users', userId);
            if (!user) return;

            if (confirm(`Are you absolutely sure you want to delete user account "${user.username}"?`)) {
                await db.delete('users', userId);
                showNotification('User deleted successfully', 'success');
                await this.loadUsersTable();
            }
        };
    }
}

export { UsersView };
