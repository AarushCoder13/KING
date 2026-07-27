// ==========================================================================
// 🎨 CENTRAL BRANDING & DATABASE CONFIGURATION
// ==========================================================================
const THEME_PURPLE_REPLACEMENT = "#ec4899"; // Hot Pink (Gen Z)
const THEME_PURPLE_HOVER       = "#be185d"; // Deep Magenta (Gen Z)
const DATABASE_API_URL = "https://king.aarushsketch.workers.dev";

// ==========================================================================
// 🔐 LOGIN GATEKEEPER SYSTEM (REMEMBERS DEVICE FOREVER UNTIL EXIT IS CLICKED)
// ==========================================================================
function checkUserSessionGatekeeper() {
    const savedName = localStorage.getItem('biz_user_name');
    const savedRole = localStorage.getItem('biz_role');

    if (savedName && savedRole) {
        // Device is recognized, check in to the global database database roster
        reportOnlineAttendanceStatus(savedName);
        return;
    }

    let loginModal = document.getElementById('global-auth-gatekeeper');
    if (!loginModal) {
        loginModal = document.createElement('div');
        loginModal.id = 'global-auth-gatekeeper';
        loginModal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(12, 35, 64, 0.75); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px);
            z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box;
        `;

        loginModal.innerHTML = `
            <div style="background: rgba(255,255,255,0.9); border: 3px solid #000000; border-radius: 2rem; padding: 2.5rem; max-width: 420px; width: 100%; box-shadow: 0 20px 50px rgba(0,0,0,0.4); text-align: center; box-sizing: border-box;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 1rem;">
                    <i class="fa-solid fa-bolt" style="font-size: 2rem; color: #eab308;"></i>
                    <h2 style="font-size: 1.8rem; font-weight: 900; margin: 0; color: #000000; tracking: 0.05em;">KING EV PORTAL</h2>
                </div>
                <p style="color: #000000; font-weight: 800; font-size: 0.9rem; margin-bottom: 1.5rem;">Identify yourself to access the business dashboard</p>
                
                <div style="text-align: left; margin-bottom: 1.25rem;">
                    <label style="font-size: 0.8rem; font-weight: 900; color: #000000; display: block; margin-bottom: 0.4rem;">YOUR NAME:</label>
                    <input type="text" id="gate-user-name" placeholder="Enter your full name" style="width: 100%; border: 2px solid #000; border-radius: 0.75rem; font-weight: 800; padding: 10px; box-sizing: border-box;">
                </div>

                <div style="text-align: left; margin-bottom: 1.5rem;">
                    <label style="font-size: 0.8rem; font-weight: 900; color: #000000; display: block; margin-bottom: 0.4rem;">CHOOSE ACCOUNT ROLE:</label>
                    <select id="gate-user-role" onchange="toggleGatePasswordInput()" style="width: 100%; padding: 10px; border: 2px solid #000; border-radius: 0.75rem; font-weight: 800; box-sizing: border-box;">
                        <option value="staff">👥 Staff Member / Technician</option>
                        <option value="management">🛠️ Management / Administrator</option>
                    </select>
                </div>

                <div id="gate-password-container" style="text-align: left; margin-bottom: 1.5rem; display: none;">
                    <label style="font-size: 0.8rem; font-weight: 900; color: #000000; display: block; margin-bottom: 0.4rem;">MANAGEMENT SECURITY CODE:</label>
                    <input type="password" id="gate-user-pass" placeholder="••••••••" style="width: 100%; padding: 10px; border: 2px solid #000; border-radius: 0.75rem; font-weight: 800; box-sizing: border-box;">
                </div>

                <button onclick="submitGatekeeperSession()" style="width: 100%; padding: 12px; background: ${THEME_PURPLE_REPLACEMENT}; color: #000; font-weight: 900; font-size: 1rem; border: 2px solid #000; border-radius: 1rem; cursor: pointer; transition: all 0.2s;">
                    Secure Sign In <i class="fa-solid fa-arrow-right-to-bracket"></i>
                </button>
            </div>
        `;
        document.body.prepend(loginModal);
    }
}

function toggleGatePasswordInput() {
    const role = document.getElementById('gate-user-role').value;
    const passBox = document.getElementById('gate-password-container');
    if (passBox) {
        passBox.style.display = (role === 'management') ? 'block' : 'none';
    }
}

function submitGatekeeperSession() {
    const nameInput = document.getElementById('gate-user-name').value.trim();
    const roleInput = document.getElementById('gate-user-role').value;
    const passInput = document.getElementById('gate-user-pass').value;

    if (!nameInput) {
        alert("❌ Please type your name before continuing!");
        return;
    }

    if (roleInput === 'management') {
        if (passInput !== "THE KINGS") {
            alert("❌ Access Denied: Incorrect Management Security Code.");
            return;
        }
    }

    localStorage.setItem('biz_user_name', nameInput);
    localStorage.setItem('biz_role', roleInput);
    reportOnlineAttendanceStatus(nameInput);
    window.location.reload();
}

// ==========================================================================
// 👥 GLOBAL DATABASE ATTENDANCE SYNC ROSTER
// ==========================================================================
async function reportOnlineAttendanceStatus(username) {
    try {
        await fetch(`${DATABASE_API_URL}/api/attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: username, timestamp: Date.now() })
        });
    } catch (e) {
        console.log("Attendance sync offline");
    }
}

async function renderOnlineWorkersRoster() {
    const listEl = document.getElementById('global-online-tracker');
    const assignEl = document.getElementById('assignee-select');
    if (!listEl && !assignEl) return;

    let workers = [];
    try {
        const res = await fetch(`${DATABASE_API_URL}/api/attendance`);
        if (res.ok) {
            workers = await res.json(); // Array of active names returned from cloud database database
        }
    } catch (e) {
        // Fallback to current local user if connection drops
        const localUser = localStorage.getItem('biz_user_name');
        workers = localUser ? [localUser] : ["No active workers"];
    }

    if (workers.length === 0) workers = ["No active workers"];
    
    let optionsStr = workers.map(w => `<option value="${w}">${w} (Active)</option>`).join('');
    if (listEl) listEl.innerHTML = optionsStr;
    if (assignEl) assignEl.innerHTML = optionsStr;
}

// ==========================================================================
// 🛠️ MANAGEMENT SECURE DATA PURGE CONTROLLER
// ==========================================================================
function secureManagementSystemReset() {
    const verificationPass = prompt("⚠️ CRITICAL ACTION: Enter Management Password to factory reset all inventory data variables:");
    if (verificationPass === "THE KINGS") {
        if (confirm("Are you absolutely sure you want to wipe out all stock logs and reset everything?")) {
            localStorage.clear();
            alert("System data successfully wiped out. Restarting setup...");
            window.location.reload();
        }
    } else {
        alert("❌ Access Denied: Incorrect Reset Password Authorization.");
    }
}

// ==========================================================================
// ⚙️ INJECT DYNAMIC GLOBAL RESPONSIVE STYLES & THOUGHT OF THE DAY
// ==========================================================================
function injectGlobalStylesAndQuote() {
    const currentRole = AppState.getRole();
    let styleEl = document.getElementById('global-theme-overrides');
    
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'global-theme-overrides';
        styleEl.innerHTML = `
            html, body { 
                background-color: transparent !important; 
                background: transparent !important;
                min-height: 100vh !important;
                margin: 0 !important;
                font-family: system-ui, -apple-system, sans-serif !important;
            }
            
            header, #shared-header, .bg-indigo-950, div[class*="bg-indigo-950"] {
                background-color: transparent !important;
                background: transparent !important;
                background-image: none !important;
                backdrop-filter: none !important;
                -webkit-backdrop-filter: none !important;
                box-shadow: none !important;
                border-bottom: 2px solid #000000 !important;
            }

            header h1, header span, header div, header label {
                color: #000000 !important;
                font-weight: 900 !important;
            }
            
            header div.bg-slate-900\\/50 {
                background-color: rgba(255, 255, 255, 0.4) !important;
                background: rgba(255, 255, 255, 0.4) !important;
                border: 2px solid #000000 !important;
                border-radius: 0.75rem !important;
            }
            
            button, .bg-indigo-900, .bg-indigo-700, span[class*="bg-indigo"], button[class*="bg-indigo"] {
                background-color: ${THEME_PURPLE_REPLACEMENT} !important;
                background: ${THEME_PURPLE_REPLACEMENT} !important;
                transition: all 0.2s ease-in-out !important;
                border: 2px solid #000000 !important;
            }
            
            button:hover, button[class*="bg-indigo"]:hover {
                background-color: ${THEME_PURPLE_HOVER} !important;
                background: ${THEME_PURPLE_HOVER} !important;
            }
            
            main, .king-container, main.col-span-1, main.col-span-3, main.md\\:col-span-3 {
                background-color: rgba(255, 255, 255, 0.12) !important;
                background: rgba(255, 255, 255, 0.12) !important;
                backdrop-filter: blur(10px) !important;
                -webkit-backdrop-filter: blur(10px) !important;
                border: 2px solid #000000 !important;
                border-radius: 1.5rem !important;
            }

            nav, #shared-nav, div.col-span-1, nav a, #shared-nav a {
                border: none !important;
                box-shadow: none !important;
                outline: none !important;
            }

            nav, #shared-nav {
                background-color: rgba(255, 255, 255, 0.12) !important;
                background: rgba(255, 255, 255, 0.12) !important;
                backdrop-filter: blur(10px) !important;
                border-radius: 1.5rem !important;
                padding: 0.5rem !important;
            }

            nav a, #shared-nav a {
                border-radius: 0.75rem !important;
                margin: 0.2rem 0 !important;
            }

            nav a[class*="bg-white"], #shared-nav a[class*="bg-white"] {
                background-color: rgba(255, 255, 255, 0.3) !important;
                background: rgba(255, 255, 255, 0.3) !important;
            }

            input, select, textarea {
                background-color: rgba(255, 255, 255, 0.6) !important;
                border: 2px solid #000000 !important;
                color: #000000 !important;
                font-weight: 800 !important;
            }

            main *, nav *, th, td, h2, h3, h4, p, span, label, select, option, input {
                color: #000000 !important;
                font-weight: 800 !important;
            }

            table, thead, tbody, tr, th, td, .bg-white, .bg-slate-50, .bg-sky-100 {
                background-color: transparent !important;
                background: transparent !important;
                border-color: rgba(0, 0, 0, 0.2) !important;
            }
            
            thead tr { background-color: rgba(0, 0, 0, 0.08) !important; }

            .bg-canvas-quote-frame {
                position: fixed; right: 4rem; bottom: 2.5rem; z-index: 0; max-w: 600px; text-align: right; pointer-events: none; user-select: none;
            }
            .bg-quote-darkblue-title { color: #0c2340 !important; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3em; margin-bottom: 0.2rem; opacity: 0.25; }
            .bg-quote-darkblue-text { color: #0c2340 !important; font-size: 2.2rem; font-weight: 900; font-style: italic; line-height: 1.3; opacity: 0.12; }

            header, #shared-header, button, input, select, a { position: relative; z-index: 10; }
            ${currentRole === 'staff' ? '.mgmt-only { display: none !important; }' : ''}

            /* 📱 MOBILE LAYOUT OVERRIDES */
            @media (max-width: 768px) {
                div[class*="grid-cols-1"], div[class*="max-w-7xl"], .max-w-7xl {
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 1rem !important;
                    padding: 0.5rem !important;
                }

                main, .col-span-1, .md\\:col-span-3, [class*="col-span-"] {
                    grid-column: span 1 / span 1 !important;
                    width: 100% !important;
                    box-sizing: border-box !important;
                    padding: 1rem !important;
                }

                nav, #shared-nav {
                    display: flex !important;
                    flex-direction: column !important;
                    width: 100% !important;
                    gap: 0.4rem !important;
                }
                
                nav a, #shared-nav a {
                    width: 100% !important;
                    text-align: left !important;
                }

                .overflow-x-auto, div[class*="overflow-x"] {
                    width: 100% !important;
                    overflow-x: auto !important;
                    display: block !important;
                    -webkit-overflow-scrolling: touch;
                }
                
                table { min-width: 600px !important; }
                header div { flex-direction: column !important; gap: 0.75rem !important; text-align: center !important; }
                header div.bg-slate-900\\/50 { flex-direction: row !important; }
                .bg-canvas-quote-frame { display: none !important; }
            }
        `;
        document.head.appendChild(styleEl);
    }
    
    const businessQuotesList = [
        "Quality means doing it right when no one is looking.",
        "The best way to predict the future is to create it.",
        "Hustle in silence, let your professional success make the noise.",
        "Chase the vision, not the money; the money will follow.",
        "Great things in business are never done by one person.",
        "Focus on being productive instead of busy.",
        "Opportunities don't happen. You create them.",
        "Action is the foundational key to all business growth."
    ];
    
    const dayOfYear = Math.floor(Date.now() / 86400000); 
    const dailyQuote = businessQuotesList[dayOfYear % businessQuotesList.length];
    
    let quoteBox = document.getElementById('engine-background-quote');
    if (!quoteBox) {
        quoteBox = document.createElement('div');
        quoteBox.id = 'engine-background-quote';
        quoteBox.className = 'bg-canvas-quote-frame';
        document.body.appendChild(quoteBox);
    }
    quoteBox.innerHTML = `
        <p class="bg-quote-darkblue-title"><i class="fa-solid fa-quote-left text-xs"></i> Thought of the Day</p>
        <p class="bg-quote-darkblue-text">"${dailyQuote}"</p>
    `;
}

// ==========================================================================
// 🔄 CLOUD WORKER DATABASE SYNC CHANNELS
// ==========================================================================
async function syncWithDatabase() {
    const routes = [
        { path: 'stocks', key: 'biz_stocks', callback: () => typeof loadInventoryTableRows === 'function' && loadInventoryTableRows() },
        { path: 'leads', key: 'biz_leads', callback: () => typeof renderLeadsGridCards === 'function' && renderLeadsGridCards() },
        { path: 'sales', key: 'biz_sales', callback: () => typeof loadSalesLedgerLogs === 'function' && loadSalesLedgerLogs() }
    ];

    for (const route of routes) {
        try {
            const res = await fetch(`${DATABASE_API_URL}/api/${route.path}`);
            if (res.ok) {
                const dataText = await res.text();
                if (dataText !== null && dataText !== undefined) {
                    localStorage.setItem(route.key, dataText);
                    if (route.callback) route.callback();
                }
            }
        } catch (err) {
            console.log(`Sync paused for /api/${route.path}`);
        }
    }
}

async function pushToDatabase(path, dataArray) {
    try {
        await fetch(`${DATABASE_API_URL}/api/${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataArray)
        });
    } catch (err) {
        console.error(`Failed pushing entry segment to /api/${path}:`, err);
    }
}

// ==========================================================================
// 🛡️ APPLICATION CENTRAL STATE STORAGE ENGINE
// ==========================================================================
window.AppState = {
    getRole: () => localStorage.getItem('biz_role') || 'staff',
    
    setRole: (role) => {
        if (role === 'management') {
            const entryPassword = prompt("🔐 Enter Management Authorization Password:");
            if (entryPassword !== "THE KINGS") {
                alert("❌ Access Denied: Incorrect Password.");
                return; 
            }
        }
        localStorage.setItem('biz_role', role);
        window.location.reload();
    },
    getStocks: () => {
        try {
            const stocks = localStorage.getItem('biz_stocks');
            if (stocks !== null) return JSON.parse(stocks);
        } catch (e) {}
        return [
            { id: '1', name: 'Electric Scooter Trot 2.0', quantity: 15, price: 110000.00, hsn: '8711', gstRate: 5, taxType: 'LOCAL' },
            { id: '2', name: 'Front Hydraulic Brake Disc Pad', quantity: 24, price: 450.00, hsn: '8518', gstRate: 18, taxType: 'LOCAL' }
        ];
    },
    setStocks: (data) => {
        localStorage.setItem('biz_stocks', JSON.stringify(data));
        pushToDatabase("stocks", data);
        if (typeof loadInventoryTableRows === 'function') loadInventoryTableRows();
    },
    getLeads: () => {
        try {
            const leads = localStorage.getItem('biz_leads');
            if (leads !== null) return JSON.parse(leads);
        } catch (e) {}
        return [
            { id: '1', name: 'Vishwanath Hanji', phone: '9552582747', notes: 'Inquired about Electric Scooter availability.' }
        ];
    },
    setLeads: (data) => {
        localStorage.setItem('biz_leads', JSON.stringify(data));
        pushToDatabase("leads", data);
        if (typeof renderLeadsGridCards === 'function') renderLeadsGridCards();
    },
    getSales: () => {
        try {
            const sales = localStorage.getItem('biz_sales');
            if (sales !== null) {
                const parsed = JSON.parse(sales);
                return parsed.filter(sale => sale && sale.invoiceNum && !isNaN(sale.totalAmount));
            }
        } catch (e) {}
        return [];
    },
    setSales: (data) => {
        localStorage.setItem('biz_sales', JSON.stringify(data));
        pushToDatabase("sales", data);
        if (typeof loadSalesLedgerLogs === 'function') loadSalesLedgerLogs();
    }
};

// ==========================================================================
// 🗺️ MASTER NAVIGATION & INTERACTIVE UI ELEMENTS INJECTION
// ==========================================================================
function renderNavigation(activePage) {
    const currentRole = AppState.getRole();
    const currentUserName = localStorage.getItem('biz_user_name') || "User";
    
    if (currentRole !== 'management' && (activePage === 'billing' || activePage === 'finance')) {
        window.location.href = 'stock.html';
        return;
    }
    
    const navElement = document.getElementById('shared-nav');
    if (navElement) {
        navElement.innerHTML = `
            <a href="stock.html" class="flex items-center gap-3 p-3 text-sm font-extrabold text-slate-900 hover:bg-white/40 rounded-xl transition-all border-b border-slate-300/30 no-underline ${activePage === 'stock' ? 'bg-white/60 font-black shadow-sm' : ''}">
                <i class="fa-solid fa-warehouse"></i> Stock Inventory
            </a>
            <a href="work.html" class="flex items-center gap-3 p-3 text-sm font-extrabold text-slate-900 hover:bg-white/40 rounded-xl transition-all border-b border-slate-300/30 no-underline ${activePage === 'work' ? 'bg-white/60 font-black shadow-sm' : ''}">
                <i class="fa-solid fa-screwdriver-wrench"></i> Repairs & Quotations
            </a>
            ${currentRole === 'management' ? `<a href="billing.html" class="flex items-center gap-3 p-3 text-sm font-extrabold text-slate-900 hover:bg-white/40 rounded-xl transition-all border-b border-slate-300/30 no-underline ${activePage === 'billing' ? 'bg-white/60 font-black shadow-sm' : ''}"><i class="fa-solid fa-file-invoice"></i> Fast Billing (myBillBook)</a>` : ''}
            <a href="edits.html" class="flex items-center gap-3 p-3 text-sm font-extrabold text-slate-900 hover:bg-white/40 rounded-xl transition-all border-b border-slate-300/30 no-underline ${activePage === 'edits' ? 'bg-white/60 font-black shadow-sm' : ''}"><i class="fa-solid fa-video"></i> EV Video Factory</a>
            <a href="leads.html" class="flex items-center gap-3 p-3 text-sm font-extrabold text-slate-900 hover:bg-white/40 rounded-xl transition-all border-b border-slate-300/30 no-underline ${activePage === 'leads' ? 'bg-white/60 font-black shadow-sm' : ''}"><i class="fa-solid fa-phone-volume"></i> Call List (Leads)</a>
            <a href="sales.html" class="flex items-center gap-3 p-3 text-sm font-extrabold text-slate-900 hover:bg-white/40 rounded-xl transition-all border-b border-slate-300/30 no-underline ${activePage === 'sales' ? 'bg-white/60 font-black shadow-sm' : ''}"><i class="fa-solid fa-cart-shopping"></i> Sales Log</a>
            ${currentRole === 'management' ? `<a href="finance.html" class="flex items-center gap-3 p-3 text-sm font-extrabold text-slate-900 hover:bg-white/40 rounded-xl transition-all border-b border-slate-300/30 no-underline ${activePage === 'finance' ? 'bg-white/60 font-black shadow-sm' : ''}"><i class="fa-solid fa-wallet"></i> Finance Dashboard</a>` : ''}
        `;
    }
    
    const headerElement = document.getElementById('shared-header');
    if (headerElement) {
        headerElement.className = "text-white p-4 shadow-md flex items-center justify-between w-full border-b-2 border-black";
        headerElement.innerHTML = `
            <div class="max-w-7xl mx-auto flex justify-between items-center gap-4 w-full">
                <div class="flex items-center gap-3">
                    <i class="fa-solid fa-bolt text-2xl text-yellow-400"></i>
                    <h1 class="text-xl font-black tracking-widest text-white m-0">KING EV</h1>
                </div>
                <div class="bg-slate-900/50 backdrop-blur p-1 rounded-lg flex items-center border border-slate-700 gap-1">
                    <span class="text-xs font-black px-2 text-slate-200"><i class="fa-solid fa-circle-user"></i> ${currentUserName.toUpperCase()} (${currentRole.toUpperCase()})</span>
                    <button onclick="AppState.setRole('management')" class="px-3 py-1 text-sm font-bold rounded-md transition-all cursor-pointer flex items-center gap-1 ${currentRole === 'management' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}">🛠️ Management</button>
                    <button onclick="AppState.setRole('staff')" class="px-3 py-1 text-sm font-bold rounded-md transition-all cursor-pointer flex items-center gap-1 ${currentRole === 'staff' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}">👥 Staff</button>
                    
                    <button onclick="localStorage.removeItem('biz_user_name'); localStorage.removeItem('biz_role'); window.location.reload();" class="ml-2 px-2 py-1 text-sm font-bold bg-amber-500 hover:bg-amber-600 text-black rounded-md cursor-pointer transition-all border border-black/40 shadow-sm flex items-center gap-1">
                        <i class="fa-solid fa-right-from-bracket text-xs"></i> Exit
                    </button>

                    ${currentRole === 'management' ? `
                    <button onclick="secureManagementSystemReset()" class="px-2 py-1 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-md cursor-pointer transition-all border border-black/40 shadow-sm flex items-center gap-1">
                        <i class="fa-solid fa-trash-can text-xs"></i> Reset
                    </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    if (window.location.pathname.includes('work.html')) {
        injectGlobalStylesAndQuote();
        renderOnlineWorkersRoster();
        // Check for updates periodically
        setInterval(renderOnlineWorkersRoster, 5000);
    }
}

function toggleModal(id, show) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.style.display = show ? 'flex' : 'none';
    if (show) modal.classList.remove('hidden'); else modal.classList.add('hidden');
}

// ==========================================================================
// 🎬 CINEMATIC VIDEO LIVE BACKGROUND SYSTEM
// ==========================================================================
function initLiveWallpaper() {
    if (!document.getElementById('global-live-wallpaper')) {
        const bgContainer = document.createElement('div');
        bgContainer.id = 'wallpaper-background-layer';
        bgContainer.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: #38bdf8; z-index: -200; pointer-events: none;";
        document.body.prepend(bgContainer);

        const video = document.createElement('video');
        video.id = 'global-live-wallpaper';
        video.src = 'wallpaper.mp4'; 
        video.autoplay = true; video.loop = true; video.muted = true; video.playsInline = true;
        video.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; object-fit: cover; z-index: -150; pointer-events: none;";
        document.body.prepend(video);
    }
}

window.toggleModal = toggleModal;
window.renderNavigation = renderNavigation;

// ==========================================================================
// 🏁 INITIATE APPLICATION PROCESS WITH LOCK GATEWAY
// ==========================================================================
window.addEventListener('DOMContentLoaded', () => {
    checkUserSessionGatekeeper();

    let activePathName = "stock";
    if (window.location.pathname.includes('billing.html')) activePathName = "billing";
    if (window.location.pathname.includes('edits.html'))   activePathName = "edits";
    if (window.location.pathname.includes('leads.html'))   activePathName = "leads";
    if (window.location.pathname.includes('sales.html'))   activePathName = "sales";
    if (window.location.pathname.includes('finance.html')) activePathName = "finance";
    if (window.location.pathname.includes('work.html'))    activePathName = "work";

    injectGlobalStylesAndQuote();
    initLiveWallpaper();
    renderNavigation(activePathName);
    syncWithDatabase();
});
