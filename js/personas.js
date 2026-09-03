'use strict';

// ── Personas view ─────────────────────────────────────────────────────────────
// Depends on globals: allPersonas, allIdeas, allPosts, topicsMap, esc()
// Renders rich persona cards with IBM Plex Sans Arabic typography, bulleted pains, fears, and triggers

function renderPersonasView() {
    const platformBg = {
        linkedin:  '#0A66C2',
        instagram: '#E1306C',
        facebook:  '#1877F2',
        youtube:   '#FF0000',
        tiktok:    '#1a1a1a',
        whatsapp:  '#25D366',
        podcasts:  '#8B5CF6',
        blog:      '#00f260',
        x:         '#000000',
        twitter:   '#1DA1F2',
    };
    const platformFg = { blog: '#1f2937' };

    if (allPersonas.length === 0) {
        document.getElementById('personas-grid').innerHTML =
            '<p class="text-gray-400 col-span-3 text-center py-16">No personas loaded.</p>';
        return;
    }

    function renderBullets(val) {
        if (!val) return '';
        let items = [];
        if (Array.isArray(val)) {
            items = val.filter(Boolean);
        } else if (typeof val === 'string') {
            items = val.split(/\s*-\s*/).map(s => s.trim()).filter(Boolean);
        }
        if (items.length === 0) return '';
        if (items.length === 1) {
            return `<p class="text-xs sm:text-sm leading-relaxed text-inherit" dir="auto">${esc(items[0])}</p>`;
        }
        return `<ul class="space-y-1.5 list-disc list-inside text-xs sm:text-sm leading-relaxed text-inherit" dir="auto">` +
            items.map(item => `<li class="font-normal">${esc(item)}</li>`).join('') +
            `</ul>`;
    }

    const html = allPersonas.map(p => {
        // Posts that reference this persona (supports Array or comma-separated string)
        const posts = allPosts.filter(post => {
            const raw = Array.isArray(post.persona_ids)
                ? post.persona_ids
                : (post.persona_ids || '').split(',').map(s => s.trim());
            return raw.includes(p.id);
        });

        // Platform pills (supports Array or comma-separated string)
        const platforms = Array.isArray(p.platforms)
            ? p.platforms
            : (p.platforms || '').split(',').map(s => s.trim()).filter(Boolean);

        const platformPills = platforms.map(pl => {
            const key = pl.toLowerCase();
            const bg  = platformBg[key] || '#6B7280';
            const fg  = platformFg[key] || '#ffffff';
            return `<span class="text-xs font-bold px-3 py-1 rounded-full shadow-xs"
                         style="background:${bg};color:${fg};">${esc(pl)}</span>`;
        }).join('');

        // Interest (topic) pills (supports Array or comma-separated string)
        const topicIds = Array.isArray(p.topic_ids)
            ? p.topic_ids
            : (p.topic_ids || '').split(',').map(s => s.trim()).filter(Boolean);

        const topicPills = topicIds.map(tid => {
            const t = topicsMap[tid];
            return t
                ? `<span class="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">${esc(t.title)}</span>`
                : '';
        }).join('');

        // Target objectives pills (supports Array or comma-separated string)
        const objIds = Array.isArray(p.objective_ids)
            ? p.objective_ids
            : (p.objective_ids || '').split(',').map(s => s.trim()).filter(Boolean);

        const objPills = objIds.map(oid => {
            const o = objectivesMap[oid];
            return o
                ? `<span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">${esc(o.title)}</span>`
                : '';
        }).join('');

        // Brand badge
        const brandLabel = esc(p.brand || '');
        const brandBadge = brandLabel
            ? `<span class="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style="background:#F1F5F9;color:#374151;">${brandLabel}</span>`
            : '';

        return `
        <div class="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
            <!-- Header -->
            <div class="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                <div class="flex flex-col gap-1 w-full">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">${esc(p.id)}</span>
                        ${brandBadge}
                    </div>
                    <h3 class="text-lg font-bold text-gray-900 leading-snug mt-1" dir="auto">${esc(p.name)}</h3>
                    <p class="text-xs font-medium text-gray-500" dir="auto">${esc(p.role || '')}</p>
                </div>
            </div>

            <!-- Company Profile -->
            ${p.company_profile ? `
                <div class="text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-1.5" dir="auto">
                    <span>🏢</span> <span>${esc(p.company_profile)}</span>
                </div>
            ` : ''}

            <!-- Overview -->
            <p class="text-sm text-gray-700 leading-relaxed font-normal" dir="auto">${esc(p.description || '')}</p>

            <!-- Language & Tone -->
            ${p.language ? `
                <div class="flex flex-wrap items-center gap-2">
                    <span class="text-xs font-semibold text-blue-900 bg-blue-50/80 px-3 py-1 rounded-full border border-blue-200 flex items-center gap-1.5" dir="auto">
                        <span>🗣️</span> ${esc(p.language)}
                    </span>
                </div>
            ` : ''}

            <!-- Platforms -->
            ${platforms.length > 0 ? `
            <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Where They Spend Time</span>
                <div class="flex flex-wrap gap-1.5">${platformPills}</div>
            </div>` : ''}

            <!-- Pains (نقاط الألم) -->
            ${p.pains ? `
            <div class="bg-red-50/70 border border-red-200 rounded-xl p-4 text-red-950">
                <div class="text-[11px] font-bold uppercase tracking-wider text-red-800 flex items-center gap-1.5 mb-2" dir="auto">
                    <span>⚠️</span> نقاط الألم اليومية (Daily Operational Pains)
                </div>
                ${renderBullets(p.pains)}
            </div>` : ''}

            <!-- Fears (المخاوف) -->
            ${p.fears ? `
            <div class="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-amber-950">
                <div class="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5 mb-2" dir="auto">
                    <span>🛑</span> المخاوف العميقة وحواجز القرار (Fears & Hesitations)
                </div>
                ${renderBullets(p.fears)}
            </div>` : ''}

            <!-- Buying Trigger (محفز الشراء) -->
            ${p.buying_trigger ? `
            <div class="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 text-emerald-950">
                <div class="text-[11px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5 mb-1.5" dir="auto">
                    <span>🎯</span> سر قرار الشراء (Buying Trigger)
                </div>
                <p class="text-xs sm:text-sm text-emerald-950 font-medium leading-relaxed" dir="auto">${esc(p.buying_trigger)}</p>
            </div>` : ''}

            <!-- Topics -->
            ${topicIds.length > 0 ? `
            <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Relevant Topics</span>
                <div class="flex flex-wrap gap-1.5">${topicPills}</div>
            </div>` : ''}

            <!-- Target Objectives -->
            ${objIds.length > 0 ? `
            <div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Aligned Strategic Objectives</span>
                <div class="flex flex-wrap gap-1.5">${objPills}</div>
            </div>` : ''}

            <!-- Stats -->
            <div class="grid grid-cols-2 gap-3 mt-auto pt-3 border-t border-gray-100">
                <div class="rounded-xl p-3 text-center bg-slate-50 border border-slate-200">
                    <div class="text-xl font-bold text-[#1c58dd]">${posts.length}</div>
                    <div class="text-[11px] text-gray-500 font-medium">Linked Posts</div>
                </div>
                <div class="rounded-xl p-3 text-center bg-slate-50 border border-slate-200">
                    <div class="text-xl font-bold text-slate-700">${topicIds.length}</div>
                    <div class="text-[11px] text-gray-500 font-medium">Topics Covered</div>
                </div>
            </div>
        </div>`;
    }).join('');

    document.getElementById('personas-grid').innerHTML = html;
}
