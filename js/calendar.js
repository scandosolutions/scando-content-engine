'use strict';

// ── Calendar view ─────────────────────────────────────────────────────────────
// Depends on globals: allPosts, allAccounts, allPersonas, accountsMap, switchView,
// activePlatform, activeStatus, activeObjective, activeTopic, renderCards, esc

let calendarWeekStart = null;
let calendarStatus = 'all';
let calendarTarget = 'all';
let calendarPersona = 'all';

const calendarStatusDefs = {
    draft: { label: 'Draft', color: '#6B7280' },
    ready: { label: 'Ready', color: '#D97706' },
    scheduled: { label: 'Scheduled', color: '#7C3AED' },
    published: { label: 'Published', color: '#059669' },
};

function renderCalendarView() {
    const root = document.getElementById('calendar-root');
    if (!root) return;

    ensureCalendarState();

    const weekDays = getWeekDays(calendarWeekStart);
    const postsForWeek = getPostsForWeek(weekDays);

    root.innerHTML = `
        <div class="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5">
            <div class="calendar-toolbar flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
                <div class="flex items-center gap-2">
                    <button onclick="calendarShiftWeek(-1)" class="calendar-nav-btn" aria-label="Previous week">&#x2190;</button>
                    <div class="calendar-week-label text-sm sm:text-base font-semibold text-gray-800">${esc(formatWeekRange(weekDays))}</div>
                    <button onclick="calendarShiftWeek(1)" class="calendar-nav-btn" aria-label="Next week">&#x2192;</button>
                </div>
                <div class="flex flex-wrap gap-2">
                    <select onchange="calendarSetStatus(this.value)" class="calendar-select text-sm px-3 py-2 rounded-full border border-gray-300 text-gray-600 bg-white">
                        ${buildStatusOptions()}
                    </select>
                    <select onchange="calendarSetTarget(this.value)" class="calendar-select text-sm px-3 py-2 rounded-full border border-gray-300 text-gray-600 bg-white">
                        ${buildTargetOptions()}
                    </select>
                    <select onchange="calendarSetPersona(this.value)" class="calendar-select text-sm px-3 py-2 rounded-full border border-gray-300 text-gray-600 bg-white">
                        ${buildPersonaOptions()}
                    </select>
                </div>
            </div>

            ${buildCalendarGrid(weekDays, postsForWeek)}
        </div>
    `;
}

function ensureCalendarState() {
    if (calendarWeekStart) return;
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    calendarWeekStart = startOfWeekUTC(todayUTC);
}

function buildStatusOptions() {
    const options = [
        { value: 'all', label: 'All statuses' },
        { value: 'draft', label: 'Draft' },
        { value: 'ready', label: 'Ready' },
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'published', label: 'Published' },
    ];

    return options.map(o =>
        `<option value="${esc(o.value)}" ${o.value === calendarStatus ? 'selected' : ''}>${esc(o.label)}</option>`
    ).join('');
}

function buildTargetOptions() {
    const platformSet = new Set();
    allAccounts.forEach(acc => {
        const platform = (acc.platform || '').trim();
        if (platform) platformSet.add(platform);
    });

    const sortedPlatforms = Array.from(platformSet).sort((a, b) => a.localeCompare(b));
    const sortedAccounts = allAccounts
        .slice()
        .sort((a, b) => ((a.platform || '') + ' ' + (a.handle || '')).localeCompare((b.platform || '') + ' ' + (b.handle || '')));

    const platformOptions = sortedPlatforms.map(platform => {
        const value = `platform:${platform.toLowerCase()}`;
        return `<option value="${esc(value)}" ${value === calendarTarget ? 'selected' : ''}>Platform: ${esc(platform)}</option>`;
    }).join('');

    const accountOptions = sortedAccounts.map(acc => {
        const label = acc.handle
            ? `${acc.platform || 'Account'} @${acc.handle}`
            : `${acc.platform || 'Account'} ${acc.id || ''}`;
        const value = `account:${acc.id}`;
        return `<option value="${esc(value)}" ${value === calendarTarget ? 'selected' : ''}>Account: ${esc(label.trim())}</option>`;
    }).join('');

    return `<option value="all" ${calendarTarget === 'all' ? 'selected' : ''}>All platforms/accounts</option>${platformOptions}${accountOptions}`;
}

function buildPersonaOptions() {
    const items = allPersonas.slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    return `<option value="all" ${calendarPersona === 'all' ? 'selected' : ''}>All personas</option>` +
        items.map(p =>
            `<option value="${esc(p.id)}" ${p.id === calendarPersona ? 'selected' : ''}>Persona: ${esc(p.name || p.id)}</option>`
        ).join('');
}

function buildCalendarGrid(weekDays, postsByDate) {
    const totalPosts = weekDays.reduce((sum, d) => {
        const key = toDateKey(d);
        return sum + (postsByDate[key] || []).length;
    }, 0);

    if (totalPosts === 0) {
        return '<div class="calendar-empty text-center py-14 text-gray-400"><p class="font-semibold text-lg">No posts for this week.</p><p class="text-sm mt-1">Try another week or relax your filters.</p></div>';
    }

    const columns = weekDays.map(day => {
        const dayKey = toDateKey(day);
        const posts = postsByDate[dayKey] || [];

        const postMarkup = renderDayPosts(posts);
        return `
            <div class="calendar-day bg-slate-50 rounded-xl border border-slate-200 p-3">
                <div class="calendar-day-header mb-2">
                    <div class="text-xs uppercase tracking-widest text-gray-400 font-semibold">${esc(formatWeekday(day))}</div>
                    <div class="text-sm font-bold text-gray-800">${esc(formatDayLabel(day))}</div>
                </div>
                <div class="calendar-post-list flex flex-col gap-2">
                    ${postMarkup}
                </div>
            </div>
        `;
    }).join('');

    return `<div class="calendar-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3">${columns}</div>`;
}

function renderDayPosts(posts) {
    if (posts.length === 0) {
        return '<p class="text-xs text-gray-400">No posts</p>';
    }

    const visible = posts.slice(0, 4).map(post => {
        const statusKey = (post.status || '').trim().toLowerCase();
        const statusDef = calendarStatusDefs[statusKey] || { label: post.status || 'Unknown', color: '#6B7280' };
        const account = accountsMap[(post.account_id || '').trim()] || {};
        const accountLabel = account.handle
            ? `@${account.handle}`
            : account.platform || post.account_id || 'Unknown account';

        return `
            <button class="calendar-post text-left w-full rounded-lg border border-gray-200 bg-white px-2.5 py-2"
                    onclick="calendarOpenPost('${escJs(post.id || '')}')">
                <div class="flex items-center justify-between gap-2">
                    <span class="text-xs font-semibold text-gray-700 truncate">${esc(post.title || post.id || 'Untitled post')}</span>
                    <span class="text-[11px] font-semibold" style="color:${statusDef.color};">${esc(statusDef.label)}</span>
                </div>
                <div class="mt-1 text-[11px] text-gray-500 flex items-center justify-between gap-2">
                    <span class="truncate">${esc(accountLabel)}</span>
                    <span>${esc(post.format || '')}</span>
                </div>
            </button>
        `;
    }).join('');

    const remaining = posts.length > 4
        ? `<p class="text-xs text-gray-500 font-medium">+${posts.length - 4} more</p>`
        : '';

    return visible + remaining;
}

function getPostsForWeek(weekDays) {
    const keys = new Set(weekDays.map(toDateKey));
    const grouped = {};

    weekDays.forEach(day => { grouped[toDateKey(day)] = []; });

    allPosts.forEach(post => {
        const key = resolvePostDateKey(post);
        if (!key || !keys.has(key)) return;
        if (!matchesCalendarFilters(post)) return;
        grouped[key].push(post);
    });

    Object.keys(grouped).forEach(key => {
        grouped[key].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    });

    return grouped;
}

function matchesCalendarFilters(post) {
    const statusKey = (post.status || '').trim().toLowerCase();
    if (calendarStatus !== 'all' && statusKey !== calendarStatus) return false;

    if (calendarTarget !== 'all') {
        const account = accountsMap[(post.account_id || '').trim()] || {};
        if (calendarTarget.startsWith('platform:')) {
            const platform = calendarTarget.slice('platform:'.length);
            if ((account.platform || '').toLowerCase() !== platform) return false;
        } else if (calendarTarget.startsWith('account:')) {
            const accountId = calendarTarget.slice('account:'.length);
            if ((post.account_id || '').trim() !== accountId) return false;
        }
    }

    if (calendarPersona !== 'all') {
        const personaIds = (post.persona_ids || '').split(',').map(s => s.trim()).filter(Boolean);
        if (!personaIds.includes(calendarPersona)) return false;
    }

    return true;
}

function resolvePostDateKey(post) {
    const scheduled = normalizeDateString(post.scheduled_date);
    if (scheduled) return scheduled;
    return normalizeDateString(post.published_date);
}

function normalizeDateString(value) {
    const input = (value || '').trim();
    if (!input) return null;

    const m = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;

    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);

    if (month < 1 || month > 12 || day < 1 || day > 31) return null;

    const test = new Date(Date.UTC(year, month - 1, day));
    if (
        test.getUTCFullYear() !== year
        || (test.getUTCMonth() + 1) !== month
        || test.getUTCDate() !== day
    ) {
        return null;
    }

    return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getWeekDays(start) {
    const days = [];
    for (let i = 0; i < 7; i++) {
        days.push(addDaysUTC(start, i));
    }
    return days;
}

function startOfWeekUTC(date) {
    const weekday = date.getUTCDay();
    const offset = (weekday + 6) % 7; // Monday start
    return addDaysUTC(date, -offset);
}

function addDaysUTC(date, delta) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + delta));
}

function toDateKey(date) {
    return `${String(date.getUTCFullYear()).padStart(4, '0')}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

function formatWeekRange(weekDays) {
    const first = weekDays[0];
    const last = weekDays[6];

    const firstMonth = first.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
    const lastMonth = last.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

    return `${firstMonth} - ${lastMonth}`;
}

function formatWeekday(date) {
    return date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
}

function formatDayLabel(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

function escJs(str) {
    return String(str)
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\"/g, '\\"')
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ');
}

function calendarShiftWeek(delta) {
    ensureCalendarState();
    calendarWeekStart = addDaysUTC(calendarWeekStart, delta * 7);
    renderCalendarView();
}

function calendarSetStatus(value) {
    calendarStatus = value || 'all';
    renderCalendarView();
}

function calendarSetTarget(value) {
    calendarTarget = value || 'all';
    renderCalendarView();
}

function calendarSetPersona(value) {
    calendarPersona = value || 'all';
    renderCalendarView();
}

function calendarOpenPost(postId) {
    const post = allPosts.find(p => (p.id || '') === postId);
    if (!post) return;
    openIdeaFromCalendar((post.idea_id || '').trim());
}

function openIdeaFromCalendar(ideaId) {
    if (!ideaId) return;

    switchView('ideas');

    const allBtn = Array.from(document.querySelectorAll('#view-ideas .filter-btn')).find(btn =>
        (btn.getAttribute('onclick') || '').includes("setPlatformFilter('all'")
    );

    if (allBtn) setPlatformFilter('all', allBtn);
    activeStatus = 'all';
    activeObjective = 'all';
    activeTopic = 'all';

    const statusSel = document.getElementById('status-filter');
    const objectiveSel = document.getElementById('objective-filter');
    const topicSel = document.getElementById('topic-filter');

    if (statusSel) statusSel.value = 'all';
    if (objectiveSel) objectiveSel.value = 'all';
    if (topicSel) topicSel.value = 'all';

    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = ideaId;

    renderCards();

    setTimeout(() => {
        const card = document.querySelector(`#card-grid [data-idea-id="${ideaId}"]`);
        if (!card) return;
        card.classList.add('idea-highlight');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => card.classList.remove('idea-highlight'), 2000);
    }, 60);
}
