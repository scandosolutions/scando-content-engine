'use strict';

// ── Topics view (Production Workspace) ─────────────────────────────────────────
// Depends on globals: allPosts, allPersonas, objectivesMap, topicsMap, switchView, esc

function renderTopicsView() {
    const container = document.getElementById('topics-grid');
    if (!container) return;

    const topics = Object.values(topicsMap);
    if (topics.length === 0) {
        container.innerHTML = '<p class="text-slate-400 col-span-3 text-center py-16">No topics loaded.</p>';
        return;
    }

    function escapeJs(str) {
        return String(str || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }

    const html = topics.map(topic => {
        const topicId = (topic.id || '').trim();

        // Linked posts
        const posts = allPosts.filter(post => {
            const raw = Array.isArray(post.topic_ids)
                ? post.topic_ids
                : (post.topic_ids || '').split(',').map(s => s.trim());
            return raw.includes(topicId);
        });

        const postsByStatus = {
            backlog:   posts.filter(p => (p.status || '').toLowerCase() === 'backlog').length,
            writing:   posts.filter(p => (p.status || '').toLowerCase() === 'writing').length,
            scheduled: posts.filter(p => (p.status || '').toLowerCase() === 'scheduled').length,
            published: posts.filter(p => (p.status || '').toLowerCase() === 'published').length,
        };

        const publishRate = posts.length > 0
            ? Math.round((postsByStatus.published / posts.length) * 100)
            : 0;

        // Aligned objectives pills
        const objIds = Array.isArray(topic.objective_ids)
            ? topic.objective_ids
            : (topic.objective_ids || '').split(',').map(s => s.trim()).filter(Boolean);
        const objPills = objIds.map(oid => {
            const o = objectivesMap[oid];
            return o ? `<span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">${esc(o.title)}</span>` : '';
        }).join('');

        // Aligned personas pills
        const perIds = Array.isArray(topic.persona_ids)
            ? topic.persona_ids
            : (topic.persona_ids || '').split(',').map(s => s.trim()).filter(Boolean);
        const perPills = perIds.map(pid => {
            const p = personasMap[pid];
            return p ? `<span class="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700" dir="auto">${esc(p.name ? p.name.replace('The ', '') : pid)}</span>` : '';
        }).join('');

        return `
        <div class="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4 shadow-xs hover:shadow-md transition-shadow">
            <div>
                <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded">${esc(topic.id || '')}</span>
                    <span class="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">${posts.length} Posts</span>
                </div>
                <h3 class="text-lg font-bold text-slate-900 mt-1 leading-snug">${esc(topic.title || '')}</h3>
                ${topic.title_ar ? `
                    <div class="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1 mt-1.5 inline-block" dir="auto">
                        ${esc(topic.title_ar)}
                    </div>
                ` : ''}
                <p class="text-sm text-slate-600 mt-2 leading-relaxed font-normal">${esc(topic.description || '')}</p>
            </div>

            ${objIds.length > 0 ? `
            <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Target Objectives</span>
                <div class="flex flex-wrap gap-1">${objPills}</div>
            </div>` : ''}

            ${perIds.length > 0 ? `
            <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Target Personas</span>
                <div class="flex flex-wrap gap-1">${perPills}</div>
            </div>` : ''}

            <!-- Production Pipeline Status Strip -->
            <div class="rounded-xl p-3 bg-slate-50 border border-slate-200">
                <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Production Status</div>
                <div class="grid grid-cols-4 gap-2 text-center">
                    <div class="bg-white rounded-lg p-2 border border-slate-200">
                        <div class="text-base font-bold text-slate-600">${postsByStatus.backlog}</div>
                        <div class="text-[10px] text-slate-400 font-medium">Backlog</div>
                    </div>
                    <div class="bg-white rounded-lg p-2 border border-slate-200">
                        <div class="text-base font-bold text-blue-600">${postsByStatus.writing}</div>
                        <div class="text-[10px] text-slate-400 font-medium">Writing</div>
                    </div>
                    <div class="bg-white rounded-lg p-2 border border-slate-200">
                        <div class="text-base font-bold text-purple-600">${postsByStatus.scheduled}</div>
                        <div class="text-[10px] text-slate-400 font-medium">Scheduled</div>
                    </div>
                    <div class="bg-white rounded-lg p-2 border border-slate-200">
                        <div class="text-base font-bold text-emerald-600">${postsByStatus.published}</div>
                        <div class="text-[10px] text-slate-400 font-medium">Published</div>
                    </div>
                </div>
            </div>

            <!-- Published Rate Bar -->
            <div class="rounded-xl px-3 py-2 bg-slate-50 border border-slate-200">
                <div class="flex items-center justify-between gap-2">
                    <span class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Publication Progress</span>
                    <span class="text-xs font-bold text-slate-800">${publishRate}%</span>
                </div>
                <div class="mt-2 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div class="h-full bg-emerald-500" style="width:${publishRate}%;"></div>
                </div>
            </div>

            <div class="mt-auto pt-2">
                <button onclick="filterPostsByTopic('${escapeJs(topicId)}')"
                        class="w-full text-center text-xs font-semibold py-2.5 rounded-xl border border-[#1c58dd] text-[#1c58dd] hover:bg-[#1c58dd] hover:text-white transition-all shadow-2xs">
                    View Linked Posts in Kanban &rarr;
                </button>
            </div>
        </div>`;
    }).join('');

    container.innerHTML = html;
}

function filterPostsByTopic(topicId) {
    if (typeof switchView === 'function') {
        switchView('posts');
    }
    // Search query or format in posts
    const searchInput = document.getElementById('posts-search-input');
    if (searchInput) {
        searchInput.value = topicId;
        if (typeof onPostsSearchInput === 'function') {
            onPostsSearchInput(topicId);
        }
    }
}
