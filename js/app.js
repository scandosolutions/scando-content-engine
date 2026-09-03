'use strict';

// ── Global state ──────────────────────────────────────────────────────────────
let allIdeas      = [];
let objectivesMap = {};  // id → { id, title, description }
let topicsMap     = {};  // id → { id, title, description }
let allAccounts   = [];
let accountsMap   = {};  // id → account row
let allPosts      = [];
let allPersonas   = [];
let personasMap   = {};  // id → persona row

let activePlatform  = 'all';
let activeStatus    = 'all';
let activeObjective = 'all';
let activeTopic     = 'all';
let activeView      = 'posts';

// ── CSV parser (RFC 4180 compliant, supports multiline quoted text) ───────────
function parseCSV(text) {
    if (!text || !text.trim()) return [];

    const rows = [];
    let currentRow = [];
    let currentVal = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === '"') {
            if (inQuotes && text[i + 1] === '"') {
                currentVal += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (c === ',' && !inQuotes) {
            currentRow.push(currentVal);
            currentVal = '';
        } else if ((c === '\n' || c === '\r') && !inQuotes) {
            if (c === '\r' && text[i + 1] === '\n') {
                i++;
            }
            currentRow.push(currentVal);
            currentVal = '';
            if (currentRow.some(val => val.trim())) {
                rows.push(currentRow);
            }
            currentRow = [];
        } else {
            currentVal += c;
        }
    }
    if (currentVal || currentRow.length > 0) {
        currentRow.push(currentVal);
        if (currentRow.some(val => val.trim())) {
            rows.push(currentRow);
        }
    }

    if (rows.length < 2) return [];

    const headers = rows[0].map(h => h.trim().toLowerCase());
    return rows.slice(1)
        .map(vals => {
            const obj = {};
            headers.forEach((h, i) => { obj[h] = (vals[i] ?? '').trim(); });
            return obj;
        })
        .filter(row => row.id || row.title);
}

// ── Load JSON Collection from Directory ──────────────────────────────────────
async function loadJsonCollection(dir) {
    try {
        const res = await fetch(`data/${dir}/index.json`);
        if (!res.ok) {
            console.warn(`Cannot load index for ${dir}: HTTP ${res.status}`);
            return [];
        }
        const fileList = await res.json();
        if (!Array.isArray(fileList)) return [];

        const settled = await Promise.allSettled(
            fileList.map(async file => {
                const itemRes = await fetch(`data/${dir}/${file}`);
                if (!itemRes.ok) throw new Error(`Cannot load ${dir}/${file}`);
                return itemRes.json();
            })
        );
        return settled
            .filter(r => r.status === 'fulfilled')
            .map(r => r.value);
    } catch (err) {
        console.warn(`Error loading collection ${dir}:`, err);
        return [];
    }
}

// ── Load all Data ─────────────────────────────────────────────────────────────
async function loadAllData() {
    try {
        const [objectives, topics, accounts, posts, personas] = await Promise.all([
            loadJsonCollection('objectives'),
            loadJsonCollection('topics'),
            loadJsonCollection('accounts'),
            loadJsonCollection('posts'),
            loadJsonCollection('personas'),
        ]);

        allAccounts = accounts;
        allPosts    = posts;
        allPersonas = personas;

        objectivesMap = {};
        objectives.forEach(o => { objectivesMap[o.id] = o; });

        topicsMap = {};
        topics.forEach(t => { topicsMap[t.id] = t; });

        accountsMap = {};
        accounts.forEach(a => { accountsMap[a.id] = a; });

        personasMap = {};
        personas.forEach(p => { personasMap[p.id] = p; });

        const bp = document.getElementById('badge-posts-count');
        if (bp) bp.textContent = allPosts.length;

        // Launch into the default active view (posts)
        switchView(activeView);
    } catch (err) {
        console.error('Fatal data loading error:', err);
    }
}

function populateDropdown(selectId, items, allLabel) {
    const sel = document.getElementById(selectId);
    sel.innerHTML = `<option value="all">${allLabel}</option>` +
        items.map(item => `<option value="${esc(item.id)}">${esc(item.title)}</option>`).join('');
}

// ── File input / drag-and-drop fallback ──────────────────────────────────────
function setupDropZone() {
    const zone  = document.getElementById('drop-zone');
    const input = document.getElementById('file-input');

    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', ()  => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        processFiles(e.dataTransfer.files);
    });
    input.addEventListener('change', e => processFiles(e.target.files));
}

function processFiles(fileList) {
    Array.from(fileList).forEach(file => {
        const reader = new FileReader();
        reader.onload = e => {
            const data = parseCSV(e.target.result);
            const name = file.name.toLowerCase();
            if (name === 'ideas.csv') {
                allIdeas = data;
                document.getElementById('drop-zone').classList.add('hidden');
            } else if (name === 'objectives.csv') {
                data.forEach(o => { objectivesMap[o.id] = o; });
                populateDropdown('objective-filter', data, 'All Objectives');
            } else if (name === 'topics.csv') {
                data.forEach(t => { topicsMap[t.id] = t; });
                populateDropdown('topic-filter', data, 'All Topics');
            } else if (name === 'accounts.csv') {
                allAccounts = data;
                data.forEach(a => { accountsMap[a.id] = a; });
            } else if (name === 'posts.csv') {
                allPosts = data;
                if (typeof renderPostsView === 'function') renderPostsView();
            } else if (name === 'personas.json') {
                try {
                    allPersonas = JSON.parse(e.target.result);
                    allPersonas.forEach(p => { personasMap[p.id] = p; });
                    if (activeView === 'personas' && typeof renderPersonasView === 'function') renderPersonasView();
                } catch(err) { console.error('Invalid personas.json', err); }
            } else if (name === 'personas.csv') {
                allPersonas = data;
                allPersonas.forEach(p => { personasMap[p.id] = p; });
                if (activeView === 'personas' && typeof renderPersonasView === 'function') renderPersonasView();
            }
            if (allIdeas.length > 0) { renderStats(); renderCards(); }
            if (activeView === 'posts' && typeof renderPostsView === 'function') { renderPostsView(); }
        };
        reader.readAsText(file, 'UTF-8');
    });
}

// ── Filter handlers ───────────────────────────────────────────────────────────
function setPlatformFilter(value, btn) {
    activePlatform = value;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderCards();
}

function setStatusFilter(value)    { activeStatus    = value; renderCards(); }
function setObjectiveFilter(value) { activeObjective = value; renderCards(); }
function setTopicFilter(value)     { activeTopic     = value; renderCards(); }

function matchesPlatform(idea, platform) {
    if (platform === 'all') return true;
    const p = (idea.platform || '').toLowerCase();
    return p === platform || p === 'all';
}

function matchesTopic(idea, topicId) {
    if (topicId === 'all') return true;
    const raw = Array.isArray(idea.topic_ids)
        ? idea.topic_ids
        : (idea.topic_ids || '').split(',').map(t => t.trim());
    return raw.includes(topicId);
}

function getObjectiveIds(idea) {
    if (Array.isArray(idea.objective_ids)) return idea.objective_ids;
    const raw = (idea.objective_ids || idea.objective_id || '');
    return Array.isArray(raw) ? raw : raw.split(',').map(id => id.trim()).filter(Boolean);
}

// ── Stats strip ───────────────────────────────────────────────────────────────
function renderStats() {
    const statuses = [
        { key: 'idea',        label: 'Idea',        color: '#6B7280' },
        { key: 'researching', label: 'Researching', color: '#D97706' },
        { key: 'writing',     label: 'Writing',     color: '#2563EB' },
        { key: 'scheduled',   label: 'Scheduled',   color: '#7C3AED' },
        { key: 'published',   label: 'Published',   color: '#059669' },
    ];

    let html = `
        <div class="bg-white rounded-xl p-4 text-center" style="border:1px solid #e5e7eb;">
            <div class="text-2xl font-bold" style="color:#1c58dd;">${allIdeas.length}</div>
            <div class="text-xs text-gray-400 mt-1 font-medium">Total Ideas</div>
        </div>`;

    statuses.forEach(s => {
        const count = allIdeas.filter(i => (i.status || '').toLowerCase() === s.key).length;
        html += `
        <div class="bg-white rounded-xl p-4 text-center" style="border:1px solid #e5e7eb;">
            <div class="text-2xl font-bold" style="color:${s.color};">${count}</div>
            <div class="text-xs text-gray-400 mt-1 font-medium">${s.label}</div>
        </div>`;
    });

    const bp = document.getElementById('badge-posts-count');
    if (bp) bp.textContent = allPosts.length;
    const bi = document.getElementById('badge-ideas-count');
    if (bi) bi.textContent = allIdeas.length;

    const strip = document.getElementById('stats-strip');
    if (strip) strip.innerHTML = html;
}

// ── Card grid ─────────────────────────────────────────────────────────────────
function renderCards() {
    const query = document.getElementById('search-input').value.toLowerCase();

    const filtered = allIdeas.filter(idea => {
        const matchP = matchesPlatform(idea, activePlatform);
        const matchS = activeStatus    === 'all' || (idea.status || '').toLowerCase() === activeStatus;
        const objectiveIds = getObjectiveIds(idea);
        const matchO = activeObjective === 'all' || objectiveIds.includes(activeObjective);
        const matchT = matchesTopic(idea, activeTopic);

        const objTitle = objectiveIds.map(id => (objectivesMap[id] || {}).title || id).join(' ');
        const topicList = Array.isArray(idea.topic_ids)
            ? idea.topic_ids
            : (idea.topic_ids || '').split(',').map(id => id.trim());
        const topicTitles = topicList.map(id =>
            (topicsMap[id.trim()] || {}).title || id.trim()
        ).join(' ');

        const matchQ = !query
            || (idea.title       || '').toLowerCase().includes(query)
            || (idea.description || '').toLowerCase().includes(query)
            || objTitle.toLowerCase().includes(query)
            || topicTitles.toLowerCase().includes(query);

        return matchP && matchS && matchO && matchT && matchQ;
    });

    const grid  = document.getElementById('card-grid');
    const empty = document.getElementById('empty-state');

    document.getElementById('results-count').textContent =
        `Showing ${filtered.length} of ${allIdeas.length} ideas`;

    if (filtered.length === 0) {
        grid.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }

    empty.classList.add('hidden');
    grid.innerHTML = filtered.map(buildCard).join('');
}

// ── Card template ─────────────────────────────────────────────────────────────
function buildCard(idea) {
    const platform  = (idea.platform || 'All').trim();
    const status    = (idea.status   || 'Idea').trim();
    const platKey   = platform.toLowerCase();
    const statusKey = status.toLowerCase();

    const objectiveIds = getObjectiveIds(idea);
    const objectiveBadges = objectiveIds.map(id => {
        const label = (objectivesMap[id] || {}).title || id;
        return `<span class="topic-badge text-xs font-medium px-2 py-0.5 rounded-full">${esc(label)}</span>`;
    }).join('');

    const objectiveHTML = objectiveBadges ? `
        <div class="py-0.5">
            <span class="text-xs font-medium uppercase tracking-widest text-gray-400">Objectives</span>
            <div class="flex flex-wrap gap-1 mt-1">${objectiveBadges}</div>
        </div>` : '';

    const topicIds = Array.isArray(idea.topic_ids)
        ? idea.topic_ids
        : (idea.topic_ids || '').split(',').map(t => t.trim()).filter(Boolean);
    const topicsHTML = topicIds.map(id => {
        const label = (topicsMap[id] || {}).title || id;
        return `<span class="topic-badge text-xs font-medium px-2 py-0.5 rounded-full">${esc(label)}</span>`;
    }).join('');

    const publishDate = idea.publish_date
        ? `<span>Target: <span class="font-semibold text-gray-600">${esc(idea.publish_date)}</span></span>`
        : '';

    const personaIds = Array.isArray(idea.persona_ids)
        ? idea.persona_ids
        : (idea.persona_ids || '').split(',').map(s => s.trim()).filter(Boolean);
    const personasHTML = personaIds.map(id => {
        const p = personasMap[id];
        const label = p ? (p.name || id).replace('The ', '') : id;
        return `<span class="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700" dir="auto">${esc(label)}</span>`;
    }).join('');

    return `
    <div class="idea-card bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-3 shadow-xs hover:shadow-md transition-shadow" data-idea-id="${esc(idea.id || '')}">

        <!-- Platform + Status -->
        <div class="flex items-center justify-between">
            <span class="badge-${platKey} text-xs font-bold px-3 py-1 rounded-full">${esc(platform)}</span>
            <span class="status-${statusKey} text-xs font-semibold px-3 py-1 rounded-full">${esc(status)}</span>
        </div>

        <!-- ID + Title -->
        <div>
            <span class="text-xs text-blue-600 font-mono font-bold tracking-wide">${esc(idea.id || '')}</span>
            <h3 class="text-base font-bold text-gray-900 mt-0.5 leading-snug" dir="auto">${esc(idea.title || '')}</h3>
            ${idea.title_ar && idea.title_ar !== idea.title ? `
                <div class="text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1 mt-1.5 inline-block" dir="auto">
                    ${esc(idea.title_ar)}
                </div>
            ` : ''}
        </div>

        <!-- Description -->
        <p class="text-sm text-gray-600 line-clamp-3 leading-relaxed font-normal" dir="auto">${esc(idea.description || '')}</p>

        <!-- Objective -->
        ${objectiveHTML}

        <!-- Personas -->
        ${personasHTML ? `
        <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Target Personas</span>
            <div class="flex flex-wrap gap-1">${personasHTML}</div>
        </div>` : ''}

        <!-- Footer -->
        <div class="mt-auto pt-3 border-t border-gray-100 flex flex-col gap-2">
            <div class="flex items-center justify-between text-xs text-gray-400">
                <span>Added: <span class="font-semibold text-gray-500">${esc(idea.added_date || '—')}</span></span>
                ${publishDate}
            </div>
            ${topicsHTML ? `<div class="flex flex-wrap gap-1">${topicsHTML}</div>` : ''}
        </div>

    </div>`;
}

// ── HTML entity escaping ──────────────────────────────────────────────────────
function esc(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ── View switching ────────────────────────────────────────────────────────────
function switchView(view) {
    activeView = view;
    const views = ['posts', 'topics', 'objectives', 'personas', 'accounts'];
    views.forEach(v => {
        const el = document.getElementById('view-' + v);
        if (el) el.classList.toggle('hidden', v !== view);
        const tab = document.getElementById('tab-' + v);
        if (tab) {
            tab.classList.toggle('active', v === view);
        }
    });
    if (view === 'posts'      && typeof renderPostsView === 'function')      renderPostsView();
    if (view === 'topics'     && typeof renderTopicsView === 'function')     renderTopicsView();
    if (view === 'objectives' && typeof renderObjectivesView === 'function') renderObjectivesView();
    if (view === 'personas'   && typeof renderPersonasView === 'function')   renderPersonasView();
    if (view === 'accounts'   && typeof renderAccountsView === 'function')   renderAccountsView();
}

// ── Init ──────────────────────────────────────────────────────────────────────
loadAllData();
