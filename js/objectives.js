'use strict';

// ── Objectives view ───────────────────────────────────────────────────────────
// Depends on globals: objectivesMap, topicsMap, allPosts, esc()
// Renders the objectives grid into #objectives-grid

function renderObjectivesView() {
    const items = Object.values(objectivesMap);
    const container = document.getElementById('objectives-grid');
    if (!container) return;

    if (items.length === 0) {
        container.innerHTML = '<p class="text-slate-400 col-span-3 text-center py-16">No objectives loaded.</p>';
        return;
    }

    const html = items.map(obj => {
        // Linked posts
        const posts = allPosts.filter(p => {
            const raw = Array.isArray(p.objective_ids)
                ? p.objective_ids
                : (p.objective_ids || p.objective_id || '').split(',').map(s => s.trim());
            return raw.includes(obj.id);
        });

        // Linked topics
        const topics = Object.values(topicsMap).filter(t => {
            const raw = Array.isArray(t.objective_ids)
                ? t.objective_ids
                : (t.objective_ids || '').split(',').map(s => s.trim());
            return raw.includes(obj.id);
        });

        const topicPills = topics.map(t =>
            `<span class="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">${esc(t.title)}</span>`
        ).join('');

        const postsByStatus = {
            backlog:   posts.filter(p => (p.status || '').toLowerCase() === 'backlog').length,
            writing:   posts.filter(p => (p.status || '').toLowerCase() === 'writing').length,
            scheduled: posts.filter(p => (p.status || '').toLowerCase() === 'scheduled').length,
            published: posts.filter(p => (p.status || '').toLowerCase() === 'published').length,
        };

        return `
        <div class="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4 shadow-xs hover:shadow-md transition-shadow">
            <div>
                <div class="flex items-center justify-between mb-1.5">
                    <span class="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded">${esc(obj.id)}</span>
                    ${obj.category ? `<span class="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">${esc(obj.category)}</span>` : ''}
                </div>
                <h3 class="text-lg font-bold text-slate-900 mt-1 leading-snug">${esc(obj.title)}</h3>
                ${obj.target_market ? `
                    <div class="text-xs font-medium text-blue-900 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 mt-2.5 flex items-center justify-between">
                        <span class="text-[10px] font-bold uppercase tracking-wider text-blue-600">Target Market</span>
                        <span class="font-semibold">${esc(obj.target_market)}</span>
                    </div>` : ''}
                <p class="text-sm text-slate-600 mt-2.5 leading-relaxed font-normal">${esc(obj.description || '')}</p>
            </div>

            <!-- Linked Topics -->
            ${topics.length > 0 ? `
            <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Aligned Topics</span>
                <div class="flex flex-wrap gap-1">${topicPills}</div>
            </div>` : ''}

            <!-- Pipeline Status -->
            <div class="rounded-xl p-3 bg-slate-50 border border-slate-200">
                <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Production Status (${posts.length} Posts)</div>
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
        </div>`;
    }).join('');

    container.innerHTML = html;
}
