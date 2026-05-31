/**
 * AL-irshaad School Management System - Students Management View Component
 */

import { db, generateUUID } from '../db.js';
import { auth } from '../auth.js';

class StudentsView {
    constructor(container) {
        this.container = container;
        this.cameraStream = null;
        this.capturedPhotoBase64 = '';
        this.currentStep = 1;
    }

    async render() {
        const classes = await db.getAll('classes');

        this.container.innerHTML = `
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 class="text-2xl font-black text-white tracking-wide">Student Registry</h1>
                    <p class="text-xs text-slate-400 mt-1">Review student profiles, upload avatars, and register enrollment details.</p>
                </div>
                <button id="btn-add-student" class="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                    </svg>
                    <span>Register New Student</span>
                </button>
            </div>

            <!-- Search & Filters Panel -->
            <div class="p-5 bg-slate-900/30 border border-slate-800/60 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
                <div class="flex-1 w-full relative">
                    <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                    </span>
                    <input type="text" id="filter-search" class="w-full bg-slate-950/80 border border-slate-800/80 hover:border-slate-750 focus:border-indigo-500 focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 transition" placeholder="Search by name, contact, parent...">
                </div>

                <div class="w-full md:w-56">
                    <select id="filter-class" class="w-full bg-slate-950/80 border border-slate-800/80 hover:border-slate-750 focus:border-indigo-500 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-slate-350 transition">
                        <option value="">-- Filter by Class --</option>
                        ${classes.map(c => `<option value="${c.classId}">${c.name}</option>`).join('')}
                    </select>
                </div>
            </div>

            <!-- Student Cards List -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" id="students-grid">
                <!-- Dynamically Populated -->
            </div>

            <!-- MODAL: Add/Edit Student Profile (DYNAMIC MULTI-STEP) -->
            <div id="modal-student" class="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto hidden animate-fade-in">
                <div class="bg-[#090e24] border border-slate-800 rounded-2xl w-full max-w-2xl p-6 relative shadow-2xl my-8 max-h-[95vh] overflow-y-auto custom-scrollbar flex flex-col gap-6">
                    
                    <!-- Modal Header -->
                    <div class="flex justify-between items-center pb-3 border-b border-slate-800">
                        <h3 id="modal-student-title" class="text-base font-extrabold text-white tracking-wide">Register New Student</h3>
                        <button type="button" id="btn-close-modal-top" class="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-850 transition">
                            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>

                    <!-- Visual Step Progress Bar -->
                    <div class="relative flex items-center justify-between w-full px-4 mb-2">
                        <!-- Background Line -->
                        <div class="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 z-0"></div>
                        <div id="step-progress-line" class="absolute left-10 top-1/2 -translate-y-1/2 h-0.5 bg-indigo-500 z-0 transition-all duration-300 w-0"></div>

                        <!-- Step 1 Circle -->
                        <div class="flex flex-col items-center gap-1.5 z-10 relative">
                            <div id="circle-step-1" class="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center border-2 border-indigo-500 shadow-lg shadow-indigo-500/25 transition duration-300">1</div>
                            <span id="label-step-1" class="text-[9px] font-bold uppercase tracking-wider text-indigo-400 transition">Identity</span>
                        </div>

                        <!-- Step 2 Circle -->
                        <div class="flex flex-col items-center gap-1.5 z-10 relative">
                            <div id="circle-step-2" class="w-8 h-8 rounded-full bg-slate-900 text-slate-500 font-bold text-xs flex items-center justify-center border-2 border-slate-800 transition duration-300">2</div>
                            <span id="label-step-2" class="text-[9px] font-bold uppercase tracking-wider text-slate-500 transition">Academics</span>
                        </div>

                        <!-- Step 3 Circle -->
                        <div class="flex flex-col items-center gap-1.5 z-10 relative">
                            <div id="circle-step-3" class="w-8 h-8 rounded-full bg-slate-900 text-slate-500 font-bold text-xs flex items-center justify-center border-2 border-slate-800 transition duration-300">3</div>
                            <span id="label-step-3" class="text-[9px] font-bold uppercase tracking-wider text-slate-500 transition">Contact</span>
                        </div>

                        <!-- Step 4 Circle -->
                        <div class="flex flex-col items-center gap-1.5 z-10 relative">
                            <div id="circle-step-4" class="w-8 h-8 rounded-full bg-slate-900 text-slate-500 font-bold text-xs flex items-center justify-center border-2 border-slate-800 transition duration-300">4</div>
                            <span id="label-step-4" class="text-[9px] font-bold uppercase tracking-wider text-slate-500 transition">Guardian</span>
                        </div>
                    </div>

                    <!-- Multi-step Form -->
                    <form id="form-student" class="space-y-6 flex-1">
                        <input type="hidden" id="edit-student-id">
                        
                        <!-- STEP 1: IDENTITY & AVATAR -->
                        <div id="step-container-1" class="space-y-5 animate-fade-in">
                            <!-- Avatar Picker -->
                            <div class="flex flex-col sm:flex-row gap-5 items-center p-4 bg-slate-950/60 rounded-2xl border border-slate-850">
                                <div class="relative w-24 h-24 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner group">
                                    <img id="student-avatar-preview" src="" class="w-full h-full object-cover hidden">
                                    <div id="avatar-placeholder" class="text-center">
                                        <svg class="w-8 h-8 text-slate-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                        </svg>
                                        <span class="text-[9px] text-slate-500 block mt-1 font-semibold">No Image</span>
                                    </div>
                                    <button type="button" id="btn-clear-photo" class="absolute top-1 right-1 p-1 bg-red-650 hover:bg-red-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition text-[9px] font-bold">✕</button>
                                </div>
                                <div class="space-y-2 flex-1 text-center sm:text-left">
                                    <h4 class="text-xs font-bold text-white uppercase tracking-wider">Student Profile Photo</h4>
                                    <p class="text-[10px] text-slate-400 leading-relaxed">Include a pupil snapshot. Stream live frame from device webcam or upload local file.</p>
                                    
                                    <div class="flex flex-wrap justify-center sm:justify-start gap-2">
                                        <label class="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold rounded-xl text-[10px] cursor-pointer transition">
                                            Choose File
                                            <input type="file" id="input-avatar-file" accept="image/*" class="hidden">
                                        </label>
                                        
                                        <button type="button" id="btn-open-camera" class="px-3 py-2 bg-indigo-650 hover:bg-indigo-600 border border-indigo-600/40 text-white font-bold rounded-xl text-[10px] transition flex items-center gap-1.5 shadow-sm">
                                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                                            </svg>
                                            <span>Use Camera</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Live Camera Capture Interface -->
                            <div id="camera-container" class="hidden p-4 bg-slate-950/80 border border-indigo-500/20 rounded-xl space-y-3">
                                <div class="relative w-full max-w-sm mx-auto overflow-hidden bg-black rounded-lg aspect-video border border-slate-850">
                                    <video id="camera-video" autoplay playsinline class="w-full h-full object-cover"></video>
                                    <div class="absolute inset-0 border-2 border-indigo-500/40 pointer-events-none rounded-lg flex items-center justify-center">
                                        <div class="w-40 h-40 border border-dashed border-indigo-400/40 rounded-full"></div>
                                    </div>
                                </div>
                                <div class="flex justify-center gap-2">
                                    <button type="button" id="btn-camera-capture" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition">
                                        Capture Frame
                                    </button>
                                    <button type="button" id="btn-camera-cancel" class="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 font-semibold rounded-xl text-xs transition">
                                        Turn Off Camera
                                    </button>
                                </div>
                                <canvas id="camera-canvas" class="hidden"></canvas>
                            </div>

                            <!-- Fields -->
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label for="std-first" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">First Name</label>
                                    <input type="text" id="std-first" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition">
                                </div>
                                <div>
                                    <label for="std-last" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Last Name</label>
                                    <input type="text" id="std-last" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition">
                                </div>
                                <div>
                                    <label for="std-dob" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Date of Birth</label>
                                    <input type="date" id="std-dob" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition">
                                </div>
                                <div>
                                    <label for="std-gender" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Gender</label>
                                    <select id="std-gender" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition">
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- STEP 2: ACADEMICS -->
                        <div id="step-container-2" class="space-y-5 hidden animate-fade-in">
                            <h4 class="text-xs font-bold text-indigo-400 uppercase tracking-wider pb-1 border-b border-slate-850">Enrollment Configuration</h4>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label for="std-class" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Assigned Class Room</label>
                                    <select id="std-class" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition">
                                        <option value="">-- Select Class --</option>
                                        ${classes.map(c => `<option value="${c.classId}">${c.name}</option>`).join('')}
                                    </select>
                                </div>
                                <div>
                                    <label for="std-enrolled" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Enrollment Joining Date</label>
                                    <input type="date" id="std-enrolled" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition">
                                </div>
                            </div>
                        </div>

                        <!-- STEP 3: CONTACT & LOCATION -->
                        <div id="step-container-3" class="space-y-5 hidden animate-fade-in">
                            <h4 class="text-xs font-bold text-indigo-400 uppercase tracking-wider pb-1 border-b border-slate-850">Contact & Address</h4>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label for="std-phone" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Personal Phone</label>
                                    <input type="tel" id="std-phone" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition" placeholder="e.g. +252 61...">
                                </div>
                                <div>
                                    <label for="std-email" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Personal Email</label>
                                    <input type="email" id="std-email" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition" placeholder="e.g. name@domain.com">
                                </div>
                                <div class="sm:col-span-2">
                                    <label for="std-street" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Street Address</label>
                                    <input type="text" id="std-street" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition" placeholder="e.g. Maka Al-Mukarama Rd">
                                </div>
                                <div>
                                    <label for="std-city" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">City / District</label>
                                    <input type="text" id="std-city" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition" placeholder="e.g. Hodan">
                                </div>
                            </div>
                        </div>

                        <!-- STEP 4: GUARDIAN REGISTRY -->
                        <div id="step-container-4" class="space-y-5 hidden animate-fade-in">
                            <h4 class="text-xs font-bold text-violet-400 uppercase tracking-wider pb-1 border-b border-slate-850">Parent / Guardian Information</h4>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label for="std-p-name" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Guardian Full Name</label>
                                    <input type="text" id="std-p-name" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition">
                                </div>
                                <div>
                                    <label for="std-p-rel" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Relationship to Student</label>
                                    <input type="text" id="std-p-rel" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition" placeholder="e.g. Father, Mother, Uncle">
                                </div>
                                <div>
                                    <label for="std-p-phone" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Guardian Primary Phone</label>
                                    <input type="tel" id="std-p-phone" required class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition" placeholder="e.g. +252 61...">
                                </div>
                                <div>
                                    <label for="std-p-email" class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Guardian Email</label>
                                    <input type="email" id="std-p-email" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 transition">
                                </div>
                            </div>
                        </div>

                        <!-- Navigation Footer Buttons -->
                        <div class="flex justify-between items-center pt-6 border-t border-slate-800">
                            <!-- Left: Cancel or Back -->
                            <div>
                                <button type="button" id="btn-step-back" class="hidden px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 font-semibold rounded-xl text-xs transition">
                                    ← Back
                                </button>
                                <button type="button" id="btn-close-student-modal" class="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-350 font-semibold rounded-xl text-xs transition">
                                    Cancel
                                </button>
                            </div>

                            <!-- Right: Next or Save -->
                            <div>
                                <button type="button" id="btn-step-next" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-md shadow-indigo-600/10">
                                    Next Step →
                                </button>
                                <button type="submit" id="btn-step-save" class="hidden px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-indigo-650 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-md">
                                    Save Student Record
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        `;

        await this.loadStudents();
        this.registerEvents();
    }

    async loadStudents() {
        const grid = document.getElementById('students-grid');
        if (!grid) return;

        const students = await db.getAll('students');
        const classes = await db.getAll('classes');
        const searchVal = document.getElementById('filter-search').value.toLowerCase();
        const classFilter = document.getElementById('filter-class').value;

        // Apply filters
        const filtered = students.filter(s => {
            const matchesSearch = 
                s.firstName.toLowerCase().includes(searchVal) || 
                s.lastName.toLowerCase().includes(searchVal) ||
                (s.contactInfo && s.contactInfo.phone && s.contactInfo.phone.includes(searchVal)) ||
                (s.parentGuardian && s.parentGuardian.name && s.parentGuardian.name.toLowerCase().includes(searchVal));
            
            const matchesClass = !classFilter || s.currentClassId === classFilter;

            return matchesSearch && matchesClass;
        });

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full py-12 text-center text-slate-500 italic bg-slate-900/10 border border-slate-850/40 rounded-2xl">
                    No student records found matching your filters.
                </div>
            `;
            return;
        }

        let html = '';
        filtered.forEach(s => {
            const matchingClass = classes.find(c => c.classId === s.currentClassId);
            const className = matchingClass ? matchingClass.name : 'Unassigned Class';

            // Calculate age
            let age = 'N/A';
            if (s.dateOfBirth) {
                const dob = new Date(s.dateOfBirth);
                const ageDifMs = Date.now() - dob.getTime();
                const ageDate = new Date(ageDifMs);
                age = Math.abs(ageDate.getUTCFullYear() - 1970);
            }

            const avatarHtml = s.photoUrl
                ? `<img src="${s.photoUrl}" class="w-full h-full object-cover">`
                : `<span class="font-extrabold text-sm text-indigo-400">${s.firstName[0]}${s.lastName[0]}</span>`;

            html += `
                <div class="bg-slate-900/40 border border-slate-800/60 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition duration-300 relative group flex flex-col justify-between">
                    <div class="p-5 space-y-4">
                        <!-- Head Details -->
                        <div class="flex items-center gap-3">
                            <div class="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 shadow-md overflow-hidden flex items-center justify-center flex-shrink-0">
                                ${avatarHtml}
                            </div>
                            <div class="overflow-hidden">
                                <h3 class="font-bold text-white text-sm truncate leading-tight">${s.firstName} ${s.lastName}</h3>
                                <div class="flex items-center gap-1.5 mt-1">
                                    <span class="px-2 py-0.5 rounded bg-indigo-650/20 text-indigo-400 font-semibold text-[9px] uppercase tracking-wide border border-indigo-500/10">${className}</span>
                                    <span class="text-[10px] text-slate-400">${s.gender} • Age ${age}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Body Grid -->
                        <div class="space-y-2 text-[11px] text-slate-350 bg-slate-950/30 p-3 rounded-xl border border-slate-850/60">
                            <div class="flex justify-between">
                                <span class="text-slate-500 font-medium">Guardian Name:</span>
                                <span class="font-semibold text-white truncate w-32 text-right">${s.parentGuardian.name}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-slate-500 font-medium">Guardian Phone:</span>
                                <span class="font-bold text-indigo-300">${s.parentGuardian.phone}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-slate-500 font-medium">Address:</span>
                                <span class="font-semibold truncate w-36 text-right">${s.address.street || 'Mogadishu'}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Footer Controls -->
                    <div class="px-5 py-3 border-t border-slate-850/60 bg-slate-900/30 flex justify-between items-center">
                        <span class="text-[9px] text-slate-500 font-bold uppercase tracking-wider">ID: ${s.studentId.substring(0,8)}</span>
                        <div class="flex gap-1.5">
                            <button onclick="window.editStudent('${s.studentId}')" class="p-1.5 bg-slate-900 border border-slate-800 hover:bg-indigo-600/25 hover:text-white text-indigo-400 rounded-lg transition" title="Modify record">
                                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                </svg>
                            </button>
                            <button onclick="window.deleteStudent('${s.studentId}')" class="p-1.5 bg-slate-900 border border-slate-800 hover:bg-rose-600/25 hover:text-white text-rose-400 rounded-lg transition" title="Delete record">
                                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        grid.innerHTML = html;
    }

    registerEvents() {
        const modal = document.getElementById('modal-student');
        const btnAdd = document.getElementById('btn-add-student');
        
        const btnClose = document.getElementById('btn-close-student-modal');
        const btnCloseTop = document.getElementById('btn-close-modal-top');
        const form = document.getElementById('form-student');
        
        const filterSearch = document.getElementById('filter-search');
        const filterClass = document.getElementById('filter-class');

        // Avatar elements
        const inputAvatarFile = document.getElementById('input-avatar-file');
        const btnOpenCamera = document.getElementById('btn-open-camera');
        const btnClearPhoto = document.getElementById('btn-clear-photo');
        const studentAvatarPreview = document.getElementById('student-avatar-preview');
        const avatarPlaceholder = document.getElementById('avatar-placeholder');

        // Camera elements
        const cameraContainer = document.getElementById('camera-container');
        const cameraVideo = document.getElementById('camera-video');
        const btnCameraCapture = document.getElementById('btn-camera-capture');
        const btnCameraCancel = document.getElementById('btn-camera-cancel');
        const cameraCanvas = document.getElementById('camera-canvas');

        // Step Navigation Buttons
        const btnBack = document.getElementById('btn-step-back');
        const btnNext = document.getElementById('btn-step-next');
        const btnSave = document.getElementById('btn-step-save');

        // Filters search trigger
        filterSearch.addEventListener('input', () => this.loadStudents());
        filterClass.addEventListener('change', () => this.loadStudents());

        // File Uploader
        inputAvatarFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = () => {
                this.capturedPhotoBase64 = reader.result;
                studentAvatarPreview.src = reader.result;
                studentAvatarPreview.classList.remove('hidden');
                avatarPlaceholder.classList.add('hidden');
            };
            reader.readAsDataURL(file);
        });

        // Clear photo
        btnClearPhoto.addEventListener('click', () => {
            this.capturedPhotoBase64 = '';
            studentAvatarPreview.src = '';
            studentAvatarPreview.classList.add('hidden');
            avatarPlaceholder.classList.remove('hidden');
            inputAvatarFile.value = '';
        });

        // Open Camera Capturing
        btnOpenCamera.addEventListener('click', async () => {
            cameraContainer.classList.remove('hidden');
            try {
                this.cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
                cameraVideo.srcObject = this.cameraStream;
            } catch (err) {
                console.error('Camera stream access failed:', err);
                showNotification('Camera failed: Ensure permissions are allowed', 'error');
                cameraContainer.classList.add('hidden');
            }
        });

        // Capture webcam screenshot
        btnCameraCapture.addEventListener('click', () => {
            if (!this.cameraStream) return;

            const width = cameraVideo.videoWidth || 320;
            const height = cameraVideo.videoHeight || 240;
            cameraCanvas.width = width;
            cameraCanvas.height = height;

            const ctx = cameraCanvas.getContext('2d');
            ctx.drawImage(cameraVideo, 0, 0, width, height);

            const captureUrl = cameraCanvas.toDataURL('image/jpeg');
            this.capturedPhotoBase64 = captureUrl;

            studentAvatarPreview.src = captureUrl;
            studentAvatarPreview.classList.remove('hidden');
            avatarPlaceholder.classList.add('hidden');

            this.stopCamera();
            cameraContainer.classList.add('hidden');
            showNotification('Photo captured successfully!', 'success');
        });

        // Cancel camera
        btnCameraCancel.addEventListener('click', () => {
            this.stopCamera();
            cameraContainer.classList.add('hidden');
        });

        // Step navigation logic helper
        const showStep = (stepNum) => {
            this.currentStep = stepNum;

            // Update step page containers
            for (let i = 1; i <= 4; i++) {
                const container = document.getElementById(`step-container-${i}`);
                if (i === stepNum) {
                    container.classList.remove('hidden');
                } else {
                    container.classList.add('hidden');
                }
            }

            // Update top progress line and circles styles
            const progressLine = document.getElementById('step-progress-line');
            const percentWidth = ((stepNum - 1) / 3) * 100;
            progressLine.style.width = `${percentWidth}%`;

            for (let i = 1; i <= 4; i++) {
                const circle = document.getElementById(`circle-step-${i}`);
                const label = document.getElementById(`label-step-${i}`);
                
                if (i < stepNum) {
                    // Completed steps
                    circle.className = "w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center border-2 border-emerald-500 shadow-md shadow-emerald-500/10 transition duration-300";
                    label.className = "text-[9px] font-bold uppercase tracking-wider text-emerald-400 transition";
                    circle.textContent = "✓";
                } else if (i === stepNum) {
                    // Active step
                    circle.className = "w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center border-2 border-indigo-500 shadow-lg shadow-indigo-500/25 transition duration-300";
                    label.className = "text-[9px] font-bold uppercase tracking-wider text-indigo-400 transition";
                    circle.textContent = i;
                } else {
                    // Future steps
                    circle.className = "w-8 h-8 rounded-full bg-slate-900 text-slate-500 font-bold text-xs flex items-center justify-center border-2 border-slate-800 transition duration-300";
                    label.className = "text-[9px] font-bold uppercase tracking-wider text-slate-500 transition";
                    circle.textContent = i;
                }
            }

            // Update footer buttons visibility
            if (stepNum === 1) {
                btnBack.classList.add('hidden');
                btnClose.classList.remove('hidden');
                btnNext.classList.remove('hidden');
                btnSave.classList.add('hidden');
            } else if (stepNum === 4) {
                btnBack.classList.remove('hidden');
                btnClose.classList.add('hidden');
                btnNext.classList.add('hidden');
                btnSave.classList.remove('hidden');
            } else {
                btnBack.classList.remove('hidden');
                btnClose.classList.add('hidden');
                btnNext.classList.remove('hidden');
                btnSave.classList.add('hidden');
            }
        };

        // Validate active step inputs
        const validateActiveStep = () => {
            const container = document.getElementById(`step-container-${this.currentStep}`);
            const inputs = container.querySelectorAll('input[required], select[required]');
            let isValid = true;

            inputs.forEach(input => {
                if (!input.checkValidity()) {
                    input.reportValidity();
                    input.classList.add('border-rose-500');
                    // Remove glow on focus/input
                    input.addEventListener('input', () => {
                        input.classList.remove('border-rose-500');
                    }, { once: true });
                    isValid = false;
                }
            });

            return isValid;
        };

        // Back action
        btnBack.addEventListener('click', () => {
            if (this.currentStep > 1) {
                showStep(this.currentStep - 1);
            }
        });

        // Next action
        btnNext.addEventListener('click', () => {
            if (validateActiveStep()) {
                showStep(this.currentStep + 1);
            }
        });

        // Add action
        btnAdd.addEventListener('click', () => {
            form.reset();
            this.capturedPhotoBase64 = '';
            studentAvatarPreview.classList.add('hidden');
            avatarPlaceholder.classList.remove('hidden');
            document.getElementById('edit-student-id').value = '';
            document.getElementById('modal-student-title').textContent = 'Register New Student Profile';
            
            // Default join date to today
            document.getElementById('std-enrolled').value = new Date().toISOString().substring(0, 10);
            
            showStep(1);
            modal.classList.remove('hidden');
        });

        // Cancel modal triggers
        const closeModal = () => {
            this.stopCamera();
            modal.classList.add('hidden');
        };
        btnClose.addEventListener('click', closeModal);
        btnCloseTop.addEventListener('click', closeModal);

        // Save Form Submit
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!validateActiveStep()) return;

            const studentIdInput = document.getElementById('edit-student-id').value;
            const firstName = document.getElementById('std-first').value.trim();
            const lastName = document.getElementById('std-last').value.trim();
            const dateOfBirth = document.getElementById('std-dob').value;
            const gender = document.getElementById('std-gender').value;
            const currentClassId = document.getElementById('std-class').value;
            const enrollmentDate = document.getElementById('std-enrolled').value;

            // Contacts
            const phone = document.getElementById('std-phone').value.trim();
            const email = document.getElementById('std-email').value.trim();
            const street = document.getElementById('std-street').value.trim();
            const city = document.getElementById('std-city').value.trim();

            // Guardian
            const pName = document.getElementById('std-p-name').value.trim();
            const pRel = document.getElementById('std-p-rel').value.trim();
            const pPhone = document.getElementById('std-p-phone').value.trim();
            const pEmail = document.getElementById('std-p-email').value.trim();

            const studentData = {
                studentId: studentIdInput || 'std-' + generateUUID().substring(0, 12),
                firstName,
                lastName,
                dateOfBirth,
                gender,
                currentClassId,
                enrollmentDate,
                photoUrl: this.capturedPhotoBase64,
                address: { street, city, state: 'Banaadir', zip: '10001' },
                contactInfo: { phone, email },
                parentGuardian: { name: pName, relationship: pRel, phone: pPhone, email: pEmail }
            };

            try {
                await db.put('students', studentData);
                showNotification(studentIdInput ? 'Student record updated' : 'New student registered successfully!', 'success');
                modal.classList.add('hidden');
                this.stopCamera();
                await this.loadStudents();
            } catch (err) {
                console.error(err);
                showNotification('Failed to save profile: ' + err.message, 'error');
            }
        });

        // Edit triggers
        window.editStudent = async (studentId) => {
            const s = await db.get('students', studentId);
            if (!s) return;

            document.getElementById('edit-student-id').value = s.studentId;
            document.getElementById('std-first').value = s.firstName;
            document.getElementById('std-last').value = s.lastName;
            document.getElementById('std-dob').value = s.dateOfBirth;
            document.getElementById('std-gender').value = s.gender;
            document.getElementById('std-class').value = s.currentClassId || '';
            document.getElementById('std-enrolled').value = s.enrollmentDate;

            // Details
            document.getElementById('std-phone').value = s.contactInfo ? s.contactInfo.phone : '';
            document.getElementById('std-email').value = s.contactInfo ? s.contactInfo.email : '';
            document.getElementById('std-street').value = s.address ? s.address.street : '';
            document.getElementById('std-city').value = s.address ? s.address.city : '';

            document.getElementById('std-p-name').value = s.parentGuardian ? s.parentGuardian.name : '';
            document.getElementById('std-p-rel').value = s.parentGuardian ? s.parentGuardian.relationship : '';
            document.getElementById('std-p-phone').value = s.parentGuardian ? s.parentGuardian.phone : '';
            document.getElementById('std-p-email').value = s.parentGuardian ? s.parentGuardian.email : '';

            // Photo Preview
            if (s.photoUrl) {
                this.capturedPhotoBase64 = s.photoUrl;
                studentAvatarPreview.src = s.photoUrl;
                studentAvatarPreview.classList.remove('hidden');
                avatarPlaceholder.classList.add('hidden');
            } else {
                this.capturedPhotoBase64 = '';
                studentAvatarPreview.classList.add('hidden');
                avatarPlaceholder.classList.remove('hidden');
            }

            document.getElementById('modal-student-title').textContent = 'Modify Student Enrollment';
            showStep(1);
            modal.classList.remove('hidden');
        };

        // Delete triggers
        window.deleteStudent = async (studentId) => {
            const s = await db.get('students', studentId);
            if (!s) return;

            if (confirm(`Warning: Are you sure you want to completely remove student "${s.firstName} ${s.lastName}" from registry? All attendance/grades historical data remains, but profile record will be deleted.`)) {
                await db.delete('students', studentId);
                showNotification('Student profile deleted', 'success');
                await this.loadStudents();
            }
        };
    }

    stopCamera() {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }
    }

    destroy() {
        this.stopCamera();
    }
}

export { StudentsView };
