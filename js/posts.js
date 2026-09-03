'use strict';

// ── Posts Kanban View & Side Drawer ───────────────────────────────────────────
// Depends on globals in app.js: allPosts, allIdeas, allAccounts, allPersonas,
// accountsMap, personasMap, switchView, esc

let postsFilterAccount = 'all';
let postsFilterPersona = 'all';
let postsFilterFormat  = 'all';
let postsSearchQuery   = '';

function escJs(str) {
    return String(str || '')
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\"/g, '\\"')
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ');
}

function esc(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

const postStatusDefs = {
    backlog:    { label: 'Backlog',             badgeClass: 'status-backlog',    borderClass: 'border-slate-300', countBg: 'bg-slate-200 text-slate-700' },
    this_month: { label: 'This Month Calendar', badgeClass: 'status-this_month', borderClass: 'border-amber-300', countBg: 'bg-amber-100 text-amber-800' },
    writing:    { label: 'In Writing',          badgeClass: 'status-writing',    borderClass: 'border-blue-300',  countBg: 'bg-blue-100 text-blue-800' },
    scheduled:  { label: 'Scheduled',           badgeClass: 'status-scheduled',  borderClass: 'border-purple-300',countBg: 'bg-purple-100 text-purple-800' },
    published:  { label: 'Published',           badgeClass: 'status-published',  borderClass: 'border-emerald-300',countBg: 'bg-emerald-100 text-emerald-800' },
};

function renderPostsView() {
    const root = document.getElementById('posts-root');
    if (!root) return;

    root.innerHTML = `
        <!-- Posts Controls Strip -->
        <div class="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-sm">
            <div class="flex flex-wrap gap-3 items-center justify-between">
                <div class="flex flex-wrap gap-2.5 items-center flex-1 min-w-[280px]">
                    <!-- Account Filter -->
                    <select id="posts-account-filter" onchange="setPostsAccountFilter(this.value)"
                            class="text-xs sm:text-sm font-medium px-3.5 py-2 rounded-full border border-gray-300 text-gray-700 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1c58dd]">
                        ${buildPostsAccountOptions()}
                    </select>

                    <!-- Persona Filter -->
                    <select id="posts-persona-filter" onchange="setPostsPersonaFilter(this.value)"
                            class="text-xs sm:text-sm font-medium px-3.5 py-2 rounded-full border border-gray-300 text-gray-700 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1c58dd]">
                        ${buildPostsPersonaOptions()}
                    </select>

                    <!-- Format Filter -->
                    <select id="posts-format-filter" onchange="setPostsFormatFilter(this.value)"
                            class="text-xs sm:text-sm font-medium px-3.5 py-2 rounded-full border border-gray-300 text-gray-700 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1c58dd]">
                        ${buildPostsFormatOptions()}
                    </select>
                </div>

                <!-- Search -->
                <div class="w-full sm:w-72">
                    <input type="text" id="posts-search-input" value="${esc(postsSearchQuery)}"
                           placeholder="Search post copy, title, notes..."
                           oninput="setPostsSearch(this.value)"
                           class="w-full text-xs sm:text-sm px-4 py-2 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#1c58dd] transition">
                </div>
            </div>

            <!-- Active post counter -->
            <div class="flex items-center justify-between text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
                <span id="posts-count-display">${getFilteredPostsCountText()}</span>
                <span class="text-gray-400 italic">Click any card to open detailed copy in side pane</span>
            </div>
        </div>

        <!-- 5-Stage Editorial Production Pipeline -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
            ${renderKanbanColumn('backlog', 'Backlog')}
            ${renderKanbanColumn('this_month', 'This Month Calendar')}
            ${renderKanbanColumn('writing', 'In Writing')}
            ${renderKanbanColumn('scheduled', 'Scheduled')}
            ${renderKanbanColumn('published', 'Published')}
        </div>
    `;
}

function buildPostsAccountOptions() {
    const options = [
        `<option value="all" ${postsFilterAccount === 'all' ? 'selected' : ''}>All Accounts & Channels</option>`
    ];

    allAccounts.forEach(acc => {
        const label = acc.handle ? `${acc.account_name} (@${acc.handle})` : `${acc.account_name} (${acc.platform})`;
        options.push(`<option value="${esc(acc.id)}" ${postsFilterAccount === acc.id ? 'selected' : ''}>${esc(label)}</option>`);
    });

    return options.join('');
}

function buildPostsPersonaOptions() {
    const options = [
        `<option value="all" ${postsFilterPersona === 'all' ? 'selected' : ''}>All Target Personas</option>`
    ];

    allPersonas.forEach(p => {
        options.push(`<option value="${esc(p.id)}" ${postsFilterPersona === p.id ? 'selected' : ''}>Persona: ${esc(p.name)}</option>`);
    });

    return options.join('');
}

function buildPostsFormatOptions() {
    const formatSet = new Set();
    allPosts.forEach(p => {
        const fmt = (p.format || '').trim();
        if (fmt) formatSet.add(fmt);
    });

    const options = [
        `<option value="all" ${postsFilterFormat === 'all' ? 'selected' : ''}>All Post Formats</option>`
    ];

    Array.from(formatSet).sort().forEach(fmt => {
        options.push(`<option value="${esc(fmt)}" ${postsFilterFormat === fmt ? 'selected' : ''}>${esc(fmt)}</option>`);
    });

    return options.join('');
}

function getPostAccountIds(post) {
    if (Array.isArray(post.account_ids)) {
        return post.account_ids.map(s => String(s).trim()).filter(Boolean);
    }
    if (post.account_id) {
        return [String(post.account_id).trim()];
    }
    return [];
}

function getFilteredPosts() {
    const query = postsSearchQuery.trim().toLowerCase();

    return allPosts.filter(post => {
        // Account filter
        if (postsFilterAccount !== 'all') {
            const accIds = getPostAccountIds(post);
            if (!accIds.includes(postsFilterAccount)) return false;
        }

        // Persona filter
        if (postsFilterPersona !== 'all') {
            const raw = Array.isArray(post.persona_ids)
                ? post.persona_ids
                : (post.persona_ids || '').split(',').map(s => s.trim());
            if (!raw.includes(postsFilterPersona)) return false;
        }

        // Format filter
        if (postsFilterFormat !== 'all' && (post.format || '').trim() !== postsFilterFormat) {
            return false;
        }

        // Search query
        if (query) {
            const titleMatch = (post.title || '').toLowerCase().includes(query);
            const contentMatch = (post.content || '').toLowerCase().includes(query);
            const notesMatch = (post.notes || '').toLowerCase().includes(query);
            const idMatch = (post.id || '').toLowerCase().includes(query);
            const topicMatch = (post.topic_ids || []).some(t => t.toLowerCase().includes(query));
            if (!titleMatch && !contentMatch && !notesMatch && !idMatch && !topicMatch) {
                return false;
            }
        }

        return true;
    });
}

function getFilteredPostsCountText() {
    const filtered = getFilteredPosts();
    return `Showing ${filtered.length} of ${allPosts.length} total posts`;
}

// ── Kanban Column & Card Rendering ───────────────────────────────────────────
function renderKanbanColumn(statusKey, defaultLabel) {
    const def = postStatusDefs[statusKey] || { label: defaultLabel, countBg: 'bg-gray-100 text-gray-700' };
    const filtered = getFilteredPosts().filter(p => {
        const s = (p.status || '').trim().toLowerCase();
        if (statusKey === 'backlog') return s === 'backlog' || s === 'draft';
        return s === statusKey;
    });

    const cardsHtml = filtered.length > 0
        ? filtered.map(buildPostCard).join('')
        : `<div class="text-center py-8 px-4 text-xs text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-white/50">
             No posts in this stage
           </div>`;

    return `
        <div class="kanban-column flex flex-col bg-slate-100/90 rounded-2xl p-3 border border-slate-200/80 min-h-[500px]">
            <!-- Column Header -->
            <div class="flex items-center justify-between px-2 py-2 mb-2">
                <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full ${getStatusDotClass(statusKey)}"></span>
                    <h3 class="font-bold text-sm text-gray-800 tracking-wide uppercase">${esc(def.label)}</h3>
                </div>
                <span class="text-xs font-bold px-2.5 py-0.5 rounded-full ${def.countBg}">${filtered.length}</span>
            </div>

            <!-- Cards Stack -->
            <div class="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-0.5">
                ${cardsHtml}
            </div>
        </div>
    `;
}

function getStatusDotClass(statusKey) {
    switch (statusKey) {
        case 'backlog':    return 'bg-slate-400';
        case 'this_month': return 'bg-amber-500';
        case 'writing':    return 'bg-blue-500';
        case 'scheduled':  return 'bg-purple-500';
        case 'published':  return 'bg-emerald-500';
        default:           return 'bg-gray-400';
    }
}

function buildPostCard(post) {
    const accIds = getPostAccountIds(post);
    const platformPills = accIds.map(accId => {
        const acc = accountsMap[accId] || {};
        const platform = acc.platform || 'Social';
        const pKey = platform.toLowerCase();
        const handleText = acc.handle ? `@${acc.handle}` : (acc.account_name || accId);
        return `
            <span class="badge-${pKey} text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                <span>${esc(platform)}</span>
                <span class="opacity-75 font-normal text-[10px] truncate max-w-[85px]">${esc(handleText)}</span>
            </span>
        `;
    }).join('');

    // Date pill
    let datePill = '';
    if (post.scheduled_date) {
        datePill = `<span class="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
            ${esc(post.scheduled_date)}
        </span>`;
    } else if (post.published_date) {
        datePill = `<span class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            ✓ ${esc(post.published_date)}
        </span>`;
    }

    // Persona pills
    const personaIds = Array.isArray(post.persona_ids)
        ? post.persona_ids
        : (post.persona_ids || '').split(',').map(s => s.trim()).filter(Boolean);
    const personaPills = personaIds.map(pId => {
        const persona = personasMap[pId] || {};
        const label = persona.name ? persona.name.replace('The ', '') : pId;
        return `<span class="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full" dir="auto">${esc(label)}</span>`;
    }).join('');

    // Topic pills
    const topicIds = Array.isArray(post.topic_ids)
        ? post.topic_ids
        : (post.topic_ids || '').split(',').map(s => s.trim()).filter(Boolean);
    const topicPills = topicIds.map(tId => {
        const topic = topicsMap[tId] || {};
        return `<span class="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">${esc(topic.title || tId)}</span>`;
    }).join('');

    return `
        <div class="post-card bg-white rounded-xl border border-slate-200 p-4 cursor-pointer hover:border-[#1c58dd] hover:shadow-md transition-all duration-200 flex flex-col gap-2.5"
             onclick="openPostDrawer('${escJs(post.id || '')}')">
            
            <!-- Top Row: Platforms & Format -->
            <div class="flex flex-wrap items-center justify-between gap-1.5">
                <div class="flex flex-wrap gap-1">
                    ${platformPills || '<span class="text-xs text-slate-400">No channel</span>'}
                </div>
                <span class="text-[10px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    ${esc(post.format || 'Post')}
                </span>
            </div>

            <!-- Title -->
            <h4 class="text-sm font-bold text-slate-900 leading-snug line-clamp-2" dir="auto">
                ${esc(post.title || 'Untitled Post')}
            </h4>

            <!-- Content preview snippet -->
            <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed" dir="auto">
                ${esc(post.content || post.notes || 'No draft copy yet...')}
            </p>

            <!-- Linked Topics -->
            ${topicPills ? `
                <div class="flex flex-wrap gap-1">
                    ${topicPills}
                </div>
            ` : ''}

            <!-- Bottom Row: Date & Personas -->
            <div class="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1 mt-auto">
                <div class="flex flex-wrap gap-1">
                    ${personaPills}
                </div>
                ${datePill}
            </div>
        </div>
    `;
}

// ── Filter Handlers ───────────────────────────────────────────────────────────
function setPostsAccountFilter(val) {
    postsFilterAccount = val;
    renderPostsView();
}

function setPostsPersonaFilter(val) {
    postsFilterPersona = val;
    renderPostsView();
}

function setPostsFormatFilter(val) {
    postsFilterFormat = val;
    renderPostsView();
}

function setPostsSearch(val) {
    postsSearchQuery = val;
    renderPostsView();
}

// ── Side Drawer Logic ─────────────────────────────────────────────────────────
function openPostDrawer(postId) {
    const post = allPosts.find(p => (p.id || '').trim() === postId);
    if (!post) return;

    const drawer = document.getElementById('post-drawer');
    const backdrop = document.getElementById('post-drawer-backdrop');
    if (!drawer || !backdrop) return;

    const accIds = getPostAccountIds(post);
    const channelsDrawerHtml = accIds.map(accId => {
        const acc = accountsMap[accId] || {};
        const platform = acc.platform || 'Social';
        const pKey = platform.toLowerCase();
        return `
            <div class="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between shadow-2xs">
                <div class="flex items-center gap-2.5">
                    <span class="badge-${pKey} text-xs font-bold px-2.5 py-1 rounded-lg">
                        ${esc(platform)}
                    </span>
                    <div>
                        <div class="text-xs font-bold text-slate-800">${esc(acc.account_name || 'Scando')}</div>
                        <div class="text-[11px] text-[#1c58dd] font-medium">${acc.handle ? `@${esc(acc.handle)}` : ''}</div>
                    </div>
                </div>
                <span class="text-[10px] font-mono text-slate-400 font-semibold">${esc(accId)}</span>
            </div>
        `;
    }).join('') || '<p class="text-xs text-slate-400">No account linked</p>';

    const statusKey = (post.status || 'backlog').toLowerCase();
    const statusDef = postStatusDefs[statusKey] || { label: post.status, badgeClass: 'status-backlog' };

    // Target personas details
    const personaIds = Array.isArray(post.persona_ids)
        ? post.persona_ids
        : (post.persona_ids || '').split(',').map(s => s.trim()).filter(Boolean);
    const personasHtml = personaIds.map(pId => {
        const p = personasMap[pId] || {};
        return `
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div class="text-xs font-bold text-[#1c58dd]" dir="auto">${esc(p.name || pId)}</div>
                <div class="text-[11px] text-slate-600 mt-0.5" dir="auto">${esc(p.role || '')}</div>
                ${p.target_market ? `<div class="text-[10px] text-slate-400 mt-1 font-semibold">${esc(p.target_market)}</div>` : ''}
            </div>
        `;
    }).join('') || '<p class="text-xs text-slate-400">No specific personas tagged.</p>';

    // Aligned topics
    const topicIds = Array.isArray(post.topic_ids)
        ? post.topic_ids
        : (post.topic_ids || '').split(',').map(s => s.trim()).filter(Boolean);
    const topicsHtml = topicIds.map(tId => {
        const t = topicsMap[tId] || {};
        return `
            <div class="bg-blue-50/60 border border-blue-100 rounded-xl p-3">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-blue-800">${esc(t.title || tId)}</span>
                    <span class="text-[10px] font-mono font-bold text-blue-600 bg-white px-2 py-0.5 rounded border border-blue-200">${esc(t.id || tId)}</span>
                </div>
                ${t.title_ar ? `<div class="text-xs text-emerald-800 font-medium mt-1" dir="auto">${esc(t.title_ar)}</div>` : ''}
            </div>
        `;
    }).join('');

    // Aligned objectives
    const objIds = Array.isArray(post.objective_ids)
        ? post.objective_ids
        : (post.objective_ids || '').split(',').map(s => s.trim()).filter(Boolean);
    const objectivesHtml = objIds.map(oId => {
        const o = objectivesMap[oId] || {};
        return `
            <div class="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-emerald-900">${esc(o.title || oId)}</span>
                    <span class="text-[10px] font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">${esc(o.id || oId)}</span>
                </div>
                ${o.target_market ? `<div class="text-[11px] text-slate-600 mt-1">Target Market: <strong>${esc(o.target_market)}</strong></div>` : ''}
            </div>
        `;
    }).join('');

    // Drawer HTML injection
    drawer.innerHTML = `
        <div class="flex flex-col h-full">
            <!-- Header -->
            <div class="flex items-center justify-between p-5 border-b border-slate-200 bg-white sticky top-0 z-10">
                <div class="flex items-center gap-2.5">
                    <span class="text-xs font-mono font-bold text-slate-400 tracking-wider">${esc(post.id || '')}</span>
                    <span class="${statusDef.badgeClass} text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        ${esc(statusDef.label)}
                    </span>
                    <span class="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                        ${esc(post.format || 'Post')}
                    </span>
                </div>
                <button onclick="closePostDrawer()"
                        class="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                        title="Close drawer (Esc)">
                    ✕
                </button>
            </div>

            <!-- Body -->
            <div class="flex-1 overflow-y-auto p-6 space-y-6">
                <!-- Post Title -->
                <div>
                    <h2 class="text-xl font-bold text-slate-900 leading-snug" dir="auto">
                        ${esc(post.title || 'Untitled Post')}
                    </h2>
                </div>

                <!-- Account & Timing Matrix -->
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div class="flex items-center justify-between">
                        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Target Channels & Platforms (${accIds.length})
                        </div>
                        <div class="text-xs font-semibold text-slate-600">
                            ${post.published_date ? 'Published: ' + esc(post.published_date) : (post.scheduled_date ? 'Scheduled: ' + esc(post.scheduled_date) : 'Unscheduled')}
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        ${channelsDrawerHtml}
                    </div>
                </div>

                <!-- Post Copy / Content Section -->
                <div>
                    <div class="flex items-center justify-between mb-2">
                        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700">Post Copy / Draft</h3>
                        <button onclick="copyPostContentToClipboard()" id="drawer-copy-btn"
                                class="text-xs text-[#1c58dd] hover:bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg font-semibold transition">
                            Copy Text
                        </button>
                    </div>
                    <div id="drawer-post-copy" dir="auto"
                         class="bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-normal shadow-2xs max-h-80 overflow-y-auto">
${esc(post.content || 'Drafting in progress...')}
                    </div>
                </div>

                <!-- Strategy & Execution Notes -->
                ${post.notes ? `
                    <div>
                        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Strategy & Asset Notes</h3>
                        <div class="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 leading-relaxed" dir="auto">
                            ${esc(post.notes)}
                        </div>
                    </div>
                ` : ''}

                <!-- Aligned Topics -->
                ${topicsHtml ? `
                    <div>
                        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Aligned Topics</h3>
                        <div class="space-y-2">
                            ${topicsHtml}
                        </div>
                    </div>
                ` : ''}

                <!-- Aligned Objectives -->
                ${objectivesHtml ? `
                    <div>
                        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Aligned Strategic Objectives</h3>
                        <div class="space-y-2">
                            ${objectivesHtml}
                        </div>
                    </div>
                ` : ''}

                <!-- Target Personas -->
                <div>
                    <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Target Personas</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        ${personasHtml}
                    </div>
                </div>
            </div>
        </div>
    `;

    // Reveal drawer
    backdrop.classList.remove('hidden');
    drawer.classList.remove('translate-x-full');
    document.body.classList.add('overflow-hidden');
}

function closePostDrawer() {
    const drawer = document.getElementById('post-drawer');
    const backdrop = document.getElementById('post-drawer-backdrop');
    if (!drawer || !backdrop) return;

    drawer.classList.add('translate-x-full');
    backdrop.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
}

function copyPostContentToClipboard() {
    const copyBox = document.getElementById('drawer-post-copy');
    const copyBtn = document.getElementById('drawer-copy-btn');
    if (!copyBox || !copyBtn) return;

    navigator.clipboard.writeText(copyBox.innerText).then(() => {
        const originalText = copyBtn.innerText;
        copyBtn.innerText = '✓ Copied!';
        copyBtn.classList.add('bg-emerald-50', 'text-emerald-700', 'border-emerald-300');
        setTimeout(() => {
            copyBtn.innerText = originalText;
            copyBtn.classList.remove('bg-emerald-50', 'text-emerald-700', 'border-emerald-300');
        }, 2000);
    }).catch(() => {
        alert('Failed to copy to clipboard.');
    });
}

function jumpToIdea(ideaId) {
    if (!ideaId) return;
    closePostDrawer();
    if (typeof switchView === 'function') {
        switchView('ideas');
    }
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = ideaId;
        if (typeof renderCards === 'function') renderCards();
    }
    setTimeout(() => {
        const card = document.querySelector(`#card-grid [data-idea-id="${ideaId}"]`);
        if (!card) return;
        card.classList.add('idea-highlight');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => card.classList.remove('idea-highlight'), 2000);
    }, 120);
}

// Global dismiss listeners
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePostDrawer();
});
