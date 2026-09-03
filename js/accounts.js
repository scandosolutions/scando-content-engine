'use strict';

// ── Accounts view ─────────────────────────────────────────────────────────────
// Depends on globals: allAccounts, allPosts, esc()
// Renders account cards grouped by brand into #accounts-grid

function renderAccountsView() {
    const platformBg = {
        linkedin:  '#0A66C2',
        instagram: '#E1306C',
        facebook:  '#1877F2',
        youtube:   '#FF0000',
        tiktok:    '#1a1a1a',
        blog:      '#00f260',
    };
    const platformFg = { blog: '#1f2937' };

    const postStatusDefs = [
        { key: 'draft',     label: 'Draft',     color: '#6B7280' },
        { key: 'ready',     label: 'Ready',     color: '#D97706' },
        { key: 'scheduled', label: 'Scheduled', color: '#7C3AED' },
        { key: 'published', label: 'Published', color: '#059669' },
    ];

    if (allAccounts.length === 0) {
        document.getElementById('accounts-grid').innerHTML =
            '<p class="text-gray-400 text-center py-16">No accounts loaded.</p>';
        return;
    }

    // Group accounts by brand
    const brands = {};
    allAccounts.forEach(acc => {
        const b = acc.brand || 'Other';
        if (!brands[b]) brands[b] = [];
        brands[b].push(acc);
    });

    const html = Object.entries(brands).map(([brand, accounts]) => {
        const brandPostCount = allPosts.filter(p =>
            accounts.some(a => a.id === (p.account_id || '').trim())
        ).length;

        const accountCards = accounts.map(acc => {
            const posts          = allPosts.filter(p => (p.account_id || '').trim() === acc.id);
            const platKey        = (acc.platform || '').toLowerCase();
            const bg             = platformBg[platKey] || '#1c58dd';
            const fg             = platformFg[platKey] || '#ffffff';
            const publishedPosts = posts.filter(p => (p.status || '').toLowerCase() === 'published').length;

            const statPills = postStatusDefs.map(s => {
                const n = posts.filter(p => (p.status || '').toLowerCase() === s.key).length;
                return n > 0
                    ? `<span class="text-xs font-semibold px-1 py-0.5"
                           style="color:${s.color};">${n} ${s.label}</span>`
                    : '';
            }).join('');

            const handleBadge = acc.handle
                ? `<span class="text-xs text-gray-400 font-mono">@${esc(acc.handle)}</span>`
                : '';

            const urlLink = acc.url
                ? `<a href="${esc(acc.url)}" target="_blank" rel="noopener noreferrer"
                      class="text-xs text-[#1c58dd] hover:underline truncate block">${esc(acc.url)}</a>`
                : '';

            const followersHTML = acc.followers
                ? `<div class="text-xs text-gray-500">
                        <span class="font-semibold text-gray-700">${esc(acc.followers)}</span> followers
                        ${acc.followers_date ? `<span class="text-gray-400">&middot; ${esc(acc.followers_date)}</span>` : ''}
                    </div>`
                : '';

            return `
            <div class="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col gap-3">
                <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-xs font-bold px-3 py-1 rounded-full"
                          style="background:${bg};color:${fg};">${esc(acc.platform)}</span>
                    ${handleBadge}
                </div>
                ${urlLink}
                ${followersHTML}
                <div class="grid grid-cols-2 gap-2">
                    <div class="rounded-xl p-3 text-center" style="background:#F8FAFC;border:1px solid #e5e7eb;">
                        <div class="text-xl font-bold" style="color:#1c58dd;">${posts.length}</div>
                        <div class="text-xs text-gray-500 mt-0.5 font-medium">Posts</div>
                    </div>
                    <div class="rounded-xl p-3 text-center" style="background:#F8FAFC;border:1px solid #e5e7eb;">
                        <div class="text-xl font-bold" style="color:#059669;">${publishedPosts}</div>
                        <div class="text-xs text-gray-500 mt-0.5 font-medium">Published</div>
                    </div>
                </div>
                ${statPills
                    ? `<div class="flex flex-wrap gap-1.5">${statPills}</div>`
                    : `<p class="text-xs text-gray-400 text-center">No posts yet</p>`}
            </div>`;
        }).join('');

        return `
        <div class="mb-10">
            <div class="flex items-center gap-3 mb-4 pb-2 border-b border-gray-100">
                <h2 class="text-lg font-bold text-gray-800">${esc(brand)}</h2>
                <span class="text-sm font-semibold rounded-full px-3 py-0.5"
                      style="background:#F1F5F9;color:#374151;">${brandPostCount} posts</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                ${accountCards}
            </div>
        </div>`;
    }).join('');

    document.getElementById('accounts-grid').innerHTML = html;
}
