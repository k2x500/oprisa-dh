// App Logic for Driver Performance Gestiune Dashboard (data2.csv CRM Edition - 6-Tab Connected Workflow Design)

// Global State
let rawDrivers = [];
let filteredDrivers = [];
let selectedDriver = null;
let activeModalContext = 'dir';
let currentLang = localStorage.getItem('app_lang') || 'ro';
let sharedCrmStates = {};

// Database Available Columns Definition
const dbColumns = [
    { id: 'name', ro: 'Nume', en: 'Name' },
    { id: 'city', ro: 'Oraș', en: 'City' },
    { id: 'pn', ro: 'PN', en: 'PN' },
    { id: 'trips', ro: 'Curse', en: 'Trips' },
    { id: 'tripsPerHour', ro: 'Curse/Oră', en: 'Trips/Hour' },
    { id: 'profitReal', ro: 'Profit Real', en: 'Real Profit' },
    { id: 'costuriTotal', ro: 'Costuri Totale', en: 'Total Costs' },
    { id: 'notes', ro: 'Comentariu', en: 'Comment' },
    { id: 'rezultatApel', ro: 'Rezultat Apel (CSV)', en: 'Call Result (CSV)' },
    { id: 'phone', ro: 'Telefon', en: 'Phone' },
    { id: 'lastStatus', ro: 'Status CSV', en: 'CSV Status' },
    { id: 'email', ro: 'Email', en: 'Email' },
    { id: 'uuid', ro: 'UUID', en: 'UUID' },
    { id: 'profitBrut', ro: 'Profit Brut', en: 'Gross Profit' },
    { id: 'profitNetMediu', ro: 'Profit Net Mediu', en: 'Avg Net Profit' },
    { id: 'costuriMediu', ro: 'Costuri Medii', en: 'Avg Costs' }
];

// Active visible columns state
let visibleColumnIds = dbColumns.map(c => c.id);

// Translation Dictionary (i18n)
const i18n = {
    ro: {
        logoText: "OPRISA GMBH",
        tabDashboard: "Dashboard",
        tabDatabase: "Bază de Date",
        tabNonprofit: "Driveri Non-Profit",
        footerText: "© 2026 Oprisa Logistics",
        pageTitle: "Gestiune Performanță",
        pageSubtitle: "Asistență și monitorizare manuală.",
        activeModuleLabel: "Modul Activ:",
        activeModuleVal: "Actualizare Manuală CRM",
        loadingText: "Se încarcă baza de date (data2.csv)...",
        
        statTotalDrivers: "Total Driveri Înregistrați",
        statNonprofit: "Non-Profit",
        statContacted: "Contactați",
        
        cityTableTitle: "Pierderi pe Orașe",
        cityTableSubtitle: "Orașe cu cele mai mari pierderi cumulative.",
        colCity: "Oraș",
        colDriversCount: "Nr. Driveri",
        colTotalLoss: "Pierderi Totale",
        
        searchPlaceholder: "Caută după Nume, Partner Number (PN) sau UUID...",
        filterAllCities: "Toate Orașele",
        filterAllStatuses: "Toate Statusurile",
        filterProfitableOnly: "Doar Profitabili",
        filterLossOnly: "Doar Pierdere",
        
        colSelectorTitle: "Selectare Coloane Bază de Date",
        showingCount: "Afișare: {filtered} din {total} driveri",
        rowClickInfo: "Faceți clic pe orice rând pentru a deschide profilul special în ecran complet",
        
        guideTitle: "Ghid Operare Urmărire Non-Profit",
        guideDesc: "<strong>Queue Asistență Non-Profit:</strong> Această secțiune afișează exclusiv driverii aflați în <em>Pierdere</em> conform bazei de date. Faceți clic pe un card pentru a deschide profilul special în ecran complet.",
        lossDriversTitle: "Driveri în Pierdere",
        
        subtabPending: "De Contactat",
        subtabProgress: "Acceptat",
        subtabNoAnswer: "Fără răspuns",
        subtabClosed: "Refuzat",
        subtabCompleted: "Optimizat",
        subtabRecontact: "De recontactat",
        
        emptyPending: "Nu există driveri în așteptare pentru asistență!",
        emptyProgress: "Niciun driver nu se află în stadiul Acceptat.",
        emptyClosed: "Nu s-au înregistrat driveri care au refuzat programul.",
        emptyNoAnswer: "Nu s-au înregistrat apeluri fără răspuns în acest moment.",
        emptyCompleted: "Nu s-au înregistrat driveri finalizați cu succes.",
        emptyRecontact: "Nu există driveri de recontactat.",
        
        badgePending: "Așteptare",
        badgeCompleted: "Optimizat",
        badgeRecontact: "De recontactat",
        badgeAccepted: "Acceptat",
        badgeRefused: "Refuzat",
        badgeNoAnswer: "Fără răspuns",
        badgeInWork: "În lucru",
        
        crmFileHeader: "FIȘĂ DOSAR CRM DRIVER",
        quickContact: "Date Contact Rapid",
        phoneLabel: "Telefon:",
        emailLabel: "Email:",
        dbFullData: "Date Complete Bază de Date (data2.csv)",
        dbId: "ID / Partner ID (PN):",
        dbUuid: "Sistem UUID:",
        dbStatus: "Status Bază de Date:",
        dbTrips: "Curse Efectuate:",
        tripsUnit: "curse",
        perHour: "oră",
        realProfit: "Profit Real (Total):",
        grossProfit: "Profit Brut:",
        avgNetProfit: "Profit Net Mediu:",
        totalCosts: "Costuri Totale:",
        avgCosts: "Costuri Medii pe Cursă:",
        
        step1Title: "Pasul 1: Începe Lucrul (Start Working)",
        step1Desc: "Managerul pornește lead-ul de asistență.",
        day1: "Ziua 1",
        step1Btn: "Start Monitorizare",
        step1BtnDesc: "Apasă pentru a începe lucrul cu acest lead",
        step1ActiveVal: "Lucru Început de Manager",
        
        step2Title: "Pasul 2: Începere lucru & decizie",
        step2Desc: "Se contactează driverul și se stabilește decizia programului.",
        day2: "Ziua 2",
        step2SelectLabel: "Selectează rezultatul apelului:",
        step2BtnAccept: "Acceptă Programul",
        step2BtnRefuse: "Nu Acceptă (Refuză)",
        step2BtnNoAnswer: "Nu Răspunde",
        step2AcceptVal: "Decizie: Driverul a ACCEPTAT programul",
        step2RefuseVal: "Decizie: REFUZAT (Către Altă Cat.)",
        step2NoAnswerVal: "Decizie: Apel fără Răspuns",
        
        step3Title: "Pasul 3: Follow-up la 3 Zile",
        step3Desc: "Verificare după 3 zile pentru a confirma activitatea driverului.",
        day3: "Ziua 3",
        step3SelectLabel: "Selectează rezultatul follow-up-ului:",
        step3BtnSuccess: "Finalizat cu Succes",
        step3BtnRecontact: "De Recontactat",
        step3SuccessVal: "Stadiu: Finalizat cu Succes (Caz Închis)",
        step3RecontactVal: "Stadiu: De Recontactat",
        
        notesTitle: "Notițe",
        notesPlaceholder: "Scrieți comentariul...",
        btnSaveClose: "Salvează și Închide",
        btnCloseNoSave: "Închide Fără Salvare",
        btnReset: "Resetează",
        
        toastCopied: "Copiat!",
        toastSaved: "Salvat!",
        msgChangesSaved: "Modificări Salvate!",
        msgMovedTo: "Mutat în secțiunea: {dest}",
        msgSavedInDb: "Salvat în: Bază de Date",
        
        activeLabel: "ACTIV",
        inactiveLabel: "INACTIV",
        lblDriver: "DRIVER"
    },
    en: {
        logoText: "OPRISA GMBH",
        tabDashboard: "Dashboard",
        tabDatabase: "Database",
        tabNonprofit: "Non-Profit Drivers",
        footerText: "© 2026 Oprisa Logistics",
        pageTitle: "Performance Management",
        pageSubtitle: "Manual assistance and monitoring.",
        activeModuleLabel: "Active Module:",
        activeModuleVal: "Manual CRM Update",
        loadingText: "Loading database (data2.csv)...",
        
        statTotalDrivers: "Total Registered Drivers",
        statNonprofit: "Non-Profit",
        statContacted: "Contacted",
        
        cityTableTitle: "Losses by City",
        cityTableSubtitle: "Cities with the highest cumulative losses.",
        colCity: "City",
        colDriversCount: "No. Drivers",
        colTotalLoss: "Total Losses",
        
        searchPlaceholder: "Search by Name, Partner Number (PN) or UUID...",
        filterAllCities: "All Cities",
        filterAllStatuses: "All Statuses",
        filterProfitableOnly: "Profitable Only",
        filterLossOnly: "Loss Only",
        
        colSelectorTitle: "Select Database Columns",
        showingCount: "Showing: {filtered} of {total} drivers",
        rowClickInfo: "Click any row to open the special profile in full-screen",
        
        guideTitle: "Non-Profit Tracking Operating Guide",
        guideDesc: "<strong>Queue Asistență Non-Profit:</strong> This section exclusively displays drivers in a <em>Loss</em> state according to the database. Click any card to open the detailed profile modal in full-screen.",
        lossDriversTitle: "Drivers in Loss",
        
        subtabPending: "To Contact",
        subtabProgress: "Accepted",
        subtabNoAnswer: "No Answer",
        subtabClosed: "Rejected",
        subtabCompleted: "Optimized",
        subtabRecontact: "To Recontact",
        
        emptyPending: "No drivers pending support!",
        emptyProgress: "No drivers are in the Accepted stage.",
        emptyClosed: "No drivers registered as rejecting the program.",
        emptyNoAnswer: "No calls registered with no answer at this moment.",
        emptyCompleted: "No drivers successfully optimized yet.",
        emptyRecontact: "No drivers to recontact.",
        
        badgePending: "Pending",
        badgeCompleted: "Optimized",
        badgeRecontact: "To Recontact",
        badgeAccepted: "Accepted",
        badgeRefused: "Rejected",
        badgeNoAnswer: "No Answer",
        badgeInWork: "In Work",
        
        crmFileHeader: "DRIVER CRM FILE",
        quickContact: "Quick Contact Details",
        phoneLabel: "Phone:",
        emailLabel: "Email:",
        dbFullData: "Complete Database Info (data2.csv)",
        dbId: "ID / Partner ID (PN):",
        dbUuid: "System UUID:",
        dbStatus: "Database Status:",
        dbTrips: "Trips Completed:",
        tripsUnit: "trips",
        perHour: "hour",
        realProfit: "Real Profit (Total):",
        grossProfit: "Gross Profit:",
        avgNetProfit: "Average Net Profit:",
        totalCosts: "Total Costs:",
        avgCosts: "Average Costs per Trip:",
        
        step1Title: "Step 1: Start Working",
        step1Desc: "Manager initiates support for the lead.",
        day1: "Day 1",
        step1Btn: "Start Monitoring",
        step1BtnDesc: "Click to start working with this lead",
        step1ActiveVal: "Work Started by Manager",
        
        step2Title: "Step 2: Contact & Decision",
        step2Desc: "Driver is contacted and the program decision is made.",
        day2: "Day 2",
        step2SelectLabel: "Select call result:",
        step2BtnAccept: "Accepts Program",
        step2BtnRefuse: "Declines (Refuses)",
        step2BtnNoAnswer: "No Answer",
        step2AcceptVal: "Decision: Driver ACCEPTED the program",
        step2RefuseVal: "Decision: REJECTED (To Other Cat.)",
        step2NoAnswerVal: "Decision: Call without Answer",
        
        step3Title: "Step 3: 3-Day Follow-up",
        step3Desc: "Check after 3 days to confirm driver activity.",
        day3: "Day 3",
        step3SelectLabel: "Select follow-up result:",
        step3BtnSuccess: "Successfully Completed",
        step3BtnRecontact: "To Recontact",
        step3SuccessVal: "Stage: Successfully Completed (Closed Case)",
        step3RecontactVal: "Stage: To Recontact",
        
        notesTitle: "Notes",
        notesPlaceholder: "Write comment...",
        btnSaveClose: "Save and Close",
        btnCloseNoSave: "Close Without Saving",
        btnReset: "Reset",
        
        toastCopied: "Copied!",
        toastSaved: "Saved!",
        msgChangesSaved: "Changes Saved!",
        msgMovedTo: "Moved to section: {dest}",
        msgSavedInDb: "Saved in: Database",
        
        activeLabel: "ACTIVE",
        inactiveLabel: "INACTIVE",
        lblDriver: "DRIVER"
    }
};

// Tab View Control
function initTabs() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabViews = document.querySelectorAll('.tab-view');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetTab = item.getAttribute('data-tab');
            
            navItems.forEach(nav => nav.classList.remove('active'));
            tabViews.forEach(view => view.classList.remove('active'));
            
            item.classList.add('active');
            const viewEl = document.getElementById(targetTab);
            if (viewEl) {
                viewEl.classList.add('active');
            }

            // Tab trigger behaviors
            if (targetTab === 'view-directory') {
                renderDriversTable();
            } else if (targetTab === 'view-roadmap') {
                renderRoadmapView();
            } else if (targetTab === 'view-overview') {
                calculateStats();
                renderCityTable();
            }
        });
    });
}

// Client-Side CSV Parser
function parseCSV(text) {
    const lines = text.split('\n');
    if (lines.length === 0) return { headers: [], rows: [] };
    
    const headers = lines[0].split(';').map(h => h.trim());
    const rows = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const cells = line.split(';').map(c => c.trim());
        if (cells.length >= headers.length) {
            rows.push(cells);
        }
    }
    return { headers, rows };
}

// Convert CSV Row to Clean JS Object (data2.csv - 15 Columns Schema)
function processDriverData(row) {
    const parseFloatClean = (val) => {
        if (!val || val === '-' || val === '0') return 0.0;
        return parseFloat(val.replace(',', '.')) || 0.0;
    };

    return {
        city: row[0],
        name: row[1],
        rezultatApel: row[2] || '',
        phone: row[3] || '',
        lastStatus: row[4] || '',
        email: row[5] || '',
        pn: row[6] || '',
        uuid: row[7] || '',
        trips: parseInt(row[8]) || 0,
        tripsPerHour: parseFloatClean(row[9]),
        profitBrut: parseFloatClean(row[10]),
        profitNetMediu: parseFloatClean(row[11]),
        profitReal: parseFloatClean(row[12]),
        costuriTotal: parseFloatClean(row[13]),
        costuriMediu: parseFloatClean(row[14])
    };
}

// Get Persistent Driver State (Manual Checklist, Notes)
function getDriverState(uuid, defaultProfitReal) {
    const defaultState = {
        workStarted: false,             // has the manager clicked "Start Working"?
        scheduleAcceptance: 'pending',  // pending, accepted, rejected, no_answer
        step3Outcome: undefined,        // undefined, completed, recontact
        notes: ''
    };

    // Deep merge to safeguard missing properties in existing keys
    let state = { ...defaultState };

    // Read exclusively from shared API states cache
    if (sharedCrmStates && sharedCrmStates[uuid]) {
        state = { ...defaultState, ...sharedCrmStates[uuid] };
    }

    // Default status classification from CSV profitReal (Strict two-status system)
    state.resolvedStatus = defaultProfitReal < 0 ? 'Pierdere' : 'Profitabil';

    // Dynamically compute completedSteps array based on robust state primitives
    state.completedSteps = [];
    if (state.workStarted) {
        state.completedSteps.push(0); // Pasul 1 completed
        if (state.scheduleAcceptance !== 'pending') {
            state.completedSteps.push(1); // Pasul 2 completed
            if (state.scheduleAcceptance === 'accepted' && state.step3Outcome) {
                state.completedSteps.push(2); // Pasul 3 completed
            }
        }
    }

    return state;
}

// Save Driver State to server API
function saveDriverState(uuid, state) {
    // Update shared client cache immediately
    sharedCrmStates[uuid] = state;

    // Asynchronously save state to server CSV database
    fetch('/api/crm-state', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uuid, state })
    })
    .then(res => {
        if (!res.ok) {
            console.warn('Server API crm-state returned non-ok response status:', res.status);
        }
    })
    .catch(err => {
        console.error('Failed to post crm-state update to server:', err);
    });
}

// Load and Parse data2.csv and shared CRM state concurrently
async function loadDriverData() {
    const loadingOverlay = document.getElementById('loading-overlay');
    try {
        // Automatically clear any legacy CRM driver states from browser localStorage
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith('driver_crm_')) {
                localStorage.removeItem(key);
            }
        }

        const [csvRes, crmRes] = await Promise.all([
            fetch('data2.csv'),
            fetch('/api/crm-state').catch(err => {
                console.warn('Server CRM API is currently unreachable.', err);
                return null;
            })
        ]);

        if (!csvRes.ok) {
            throw new Error(`HTTP error! status: ${csvRes.status}`);
        }
        const text = await csvRes.text();
        const { rows } = parseCSV(text);
        
        if (crmRes && crmRes.ok) {
            try {
                sharedCrmStates = await crmRes.json();
                console.log('Successfully synchronized shared CRM states from server.');
            } catch (e) {
                console.error('Failed to parse synchronized CRM states:', e);
            }
        }
        
        rawDrivers = rows.map(processDriverData).filter(d => d.name && d.uuid);
        filteredDrivers = [...rawDrivers];
        
        // Hide loader
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => loadingOverlay.style.display = 'none', 300);
        }

        // Initialize UI with language switcher support
        setLanguage(currentLang);
        
    } catch (error) {
        console.error('Failed to load driver data:', error);
        const textEl = document.querySelector('.loading-text');
        if (textEl) {
            const errMsg = currentLang === 'ro' 
                ? 'Eroare la încărcarea data2.csv. Asigurați-vă că server.py rulează în fundal.' 
                : 'Error loading data2.csv. Make sure server.py is running in the background.';
            textEl.innerHTML = `<span style="color: var(--color-danger)">${errMsg}</span>`;
        }
        const spinner = document.querySelector('.loading-spinner');
        if (spinner) spinner.style.borderTopColor = 'var(--color-danger)';
    }
}

// Populate City dropdown
function populateCityFilter() {
    const select = document.getElementById('filter-city');
    if (!select) return;

    const cities = [...new Set(rawDrivers.map(d => d.city))].sort();
    select.innerHTML = `<option value="all">${i18n[currentLang].filterAllCities}</option>`;
    
    cities.forEach(city => {
        const opt = document.createElement('option');
        opt.value = city;
        opt.textContent = city;
        select.appendChild(opt);
    });
}

// Calculate Summary Statistics
function calculateStats() {
    if (rawDrivers.length === 0) return;

    const totalDrivers = rawDrivers.length;
    
    let nonProfitCount = 0;
    let contactedCount = 0;

    rawDrivers.forEach(d => {
        const state = getDriverState(d.uuid, d.profitReal);
        if (state.resolvedStatus === 'Pierdere') {
            nonProfitCount++;
        }
        if (state.workStarted) {
            contactedCount++;
        }
    });

    document.getElementById('stat-total-drivers').textContent = totalDrivers;
    document.getElementById('stat-non-profit-count').textContent = nonProfitCount;
    document.getElementById('stat-contacted-count').textContent = contactedCount;

    // Render filter counts
    const filterCountEl = document.getElementById('filter-count');
    if (filterCountEl) {
        filterCountEl.textContent = i18n[currentLang].showingCount.replace('{filtered}', filteredDrivers.length).replace('{total}', totalDrivers);
    }
}

// Render City Profitability Table (worst total first)
function renderCityTable() {
    const tbody = document.getElementById('city-profitability-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const cityData = {};
    rawDrivers.forEach(d => {
        if (!cityData[d.city]) {
            cityData[d.city] = { count: 0, totalProfitReal: 0.0 };
        }
        cityData[d.city].count++;
        cityData[d.city].totalProfitReal += d.profitReal;
    });

    const sortedCities = Object.keys(cityData).map(city => ({
        city: city,
        count: cityData[city].count,
        total: cityData[city].totalProfitReal,
        avg: cityData[city].totalProfitReal / cityData[city].count
    })).sort((a, b) => a.total - b.total);

    sortedCities.slice(0, 15).forEach(c => {
        const tr = document.createElement('tr');
        tr.style.cursor = 'default';
        
        const moneyLocale = currentLang === 'ro' ? 'ro-RO' : 'en-US';
        tr.innerHTML = `
            <td style="font-weight: 600; color: var(--text-primary);">${c.city}</td>
            <td>${c.count}</td>
            <td style="font-weight: 600; color: ${c.total < 0 ? 'var(--color-danger)' : 'var(--color-success)'}">
                ${c.total.toLocaleString(moneyLocale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ================= COLLAPSIBLE COLUMN SELECTOR SYSTEM =================
window.toggleColumnsPanel = function() {
    const container = document.getElementById('columns-checkbox-container');
    const chevron = document.getElementById('columns-toggle-chevron');
    if (container && chevron) {
        if (container.style.display === 'none') {
            container.style.display = 'flex';
            chevron.style.transform = 'rotate(180deg)';
        } else {
            container.style.display = 'none';
            chevron.style.transform = 'rotate(0deg)';
        }
    }
};

// Save column preferences to localStorage
function saveColumnSettings(ids) {
    try {
        localStorage.setItem('db_visible_columns', JSON.stringify(ids));
    } catch(e) {
        console.error(e);
    }
}

// Load column preferences from localStorage
function loadColumnSettings() {
    try {
        const stored = localStorage.getItem('db_visible_columns');
        if (stored) {
            return JSON.parse(stored);
        }
    } catch(e) {
        console.error(e);
    }
    // Default: name, city, and profit brut are visible by default
    return ['name', 'city', 'profitBrut'];
}

// Toggle a column visibility from active array
window.toggleColumnVisibility = function(colId) {
    const idx = visibleColumnIds.indexOf(colId);
    if (idx > -1) {
        // Prevent hiding the very last column (keep at least one visible)
        if (visibleColumnIds.length === 1) {
            showToast('Trebuie să păstrați cel puțin o coloană vizibilă!', 'danger');
            // Recheck it
            const checkbox = document.querySelector(`input[data-col-id="${colId}"]`);
            if (checkbox) checkbox.checked = true;
            return;
        }
        visibleColumnIds.splice(idx, 1);
    } else {
        visibleColumnIds.push(colId);
    }
    
    // Maintain same order as dbColumns
    visibleColumnIds.sort((a, b) => {
        return dbColumns.findIndex(c => c.id === a) - dbColumns.findIndex(c => c.id === b);
    });

    saveColumnSettings(visibleColumnIds);
    
    // Toggle active background pill class
    const checkbox = document.querySelector(`input[data-col-id="${colId}"]`);
    if (checkbox) {
        const pill = checkbox.closest('.col-visibility-pill');
        if (pill) {
            if (checkbox.checked) {
                pill.classList.add('active');
            } else {
                pill.classList.remove('active');
            }
        }
    }

    renderDriversTable();
};

// Initialize Checkboxes UI on app start
function initColumnsPanel() {
    visibleColumnIds = loadColumnSettings();
    const container = document.getElementById('columns-checkbox-container');
    if (!container) return;

    container.innerHTML = dbColumns.map(col => {
        const isChecked = visibleColumnIds.includes(col.id);
        const checkedAttr = isChecked ? 'checked' : '';
        const activeClass = isChecked ? 'active' : '';
        return `
            <label class="col-visibility-pill ${activeClass}">
                <input type="checkbox" data-col-id="${col.id}" ${checkedAttr} style="accent-color: var(--color-primary); cursor: pointer;" onchange="toggleColumnVisibility('${col.id}')">
                <span>${col[currentLang] || col.ro}</span>
            </label>
        `;
    }).join('');
}

// Diacritics Removal Helper for smooth Romanian searches
function removeDiacritics(str) {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Substring Highlighter for Premium Search Result visibility
function highlightSearch(text, query) {
    if (!query) return text;
    const normText = removeDiacritics(text.toLowerCase());
    const normQuery = removeDiacritics(query.toLowerCase());
    const index = normText.indexOf(normQuery);
    if (index === -1) return text;
    
    const matchedPart = text.substring(index, index + query.length);
    return text.substring(0, index) + `<mark style="background-color: #fde68a; color: #0f172a; padding: 0.05rem 0.15rem; border-radius: 2px; font-weight: 700; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">${matchedPart}</mark>` + text.substring(index + query.length);
}

// Apply Filters with advanced search enhancements
function applyFilters() {
    const searchVal = document.getElementById('search-driver').value.trim();
    const searchQuery = removeDiacritics(searchVal.toLowerCase());
    const selectedCity = document.getElementById('filter-city').value;
    const profitability = document.getElementById('filter-profitability').value;

    filteredDrivers = rawDrivers.filter(d => {
        const normName = removeDiacritics(d.name.toLowerCase());
        const normPn = removeDiacritics(d.pn.toLowerCase());
        const normUuid = removeDiacritics(d.uuid.toLowerCase());
        const normCity = removeDiacritics(d.city.toLowerCase());

        const matchesSearch = !searchQuery || 
            normName.includes(searchQuery) ||
            normPn.includes(searchQuery) ||
            normUuid.includes(searchQuery) ||
            normCity.includes(searchQuery);

        const matchesCity = selectedCity === 'all' || d.city === selectedCity;

        const state = getDriverState(d.uuid, d.profitReal);
        let matchesProfitability = true;
        if (profitability === 'Profitabil') {
            matchesProfitability = state.resolvedStatus === 'Profitabil';
        } else if (profitability === 'Pierdere') {
            matchesProfitability = state.resolvedStatus === 'Pierdere';
        }

        return matchesSearch && matchesCity && matchesProfitability;
    });

    calculateStats();
    renderDriversTable();
}

// Render Master Directory Table with search highlights & dynamic columns
function renderDriversTable() {
    const tbody = document.getElementById('drivers-table-body');
    const headerRow = document.getElementById('drivers-table-header-row');
    if (!tbody) return;

    // Render Dynamic headers first
    if (headerRow) {
        headerRow.innerHTML = dbColumns
            .filter(col => visibleColumnIds.includes(col.id))
            .map(col => `<th>${col[currentLang] || col.ro}</th>`)
            .join('');
    }

    tbody.innerHTML = '';
    
    if (filteredDrivers.length === 0) {
        const noDriversMsg = currentLang === 'ro' ? 'Niciun driver nu se încadrează în filtrele selectate.' : 'No drivers match the selected filters.';
        tbody.innerHTML = `<tr><td colspan="${visibleColumnIds.length}" style="text-align: center; color: var(--text-muted); padding: 2rem;">${noDriversMsg}</td></tr>`;
        return;
    }

    const sorted = [...filteredDrivers].sort((a, b) => a.profitReal - b.profitReal);
    const searchVal = document.getElementById('search-driver').value.trim();

    sorted.forEach(d => {
        const state = getDriverState(d.uuid, d.profitReal);
        
        const tr = document.createElement('tr');
        tr.setAttribute('data-uuid', d.uuid);

        tr.addEventListener('click', () => {
            selectDriver(d.uuid);
            openProfileModal(d.uuid, 'dir');
        });

        // Use notes if edited, otherwise pre-fill with Rezultat apel from CSV
        const savedNotes = state.notes !== undefined && state.notes !== '' ? state.notes : d.rezultatApel;

        // Apply highlights for matching search text
        const highlightedName = highlightSearch(d.name, searchVal);
        const highlightedPn = highlightSearch(d.pn, searchVal);
        const highlightedCity = highlightSearch(d.city, searchVal);

        // Build dynamic cell string matching exactly visibleColumnIds
        let cellsHtml = '';
        visibleColumnIds.forEach(colId => {
            if (colId === 'name') {
                cellsHtml += `<td style="font-weight: 700; color: var(--text-primary);">${highlightedName}</td>`;
            } else if (colId === 'city') {
                cellsHtml += `<td>${highlightedCity}</td>`;
            } else if (colId === 'pn') {
                cellsHtml += `<td style="font-family: monospace;">${highlightedPn}</td>`;
            } else if (colId === 'trips') {
                cellsHtml += `<td>${d.trips}</td>`;
            } else if (colId === 'tripsPerHour') {
                cellsHtml += `<td>${d.tripsPerHour.toFixed(2)}/h</td>`;
            } else if (colId === 'profitReal') {
                cellsHtml += `<td class="${d.profitReal < 0 ? 'cell-loss' : 'cell-profit'}">${d.profitReal.toLocaleString('ro-RO', { style: 'currency', currency: 'EUR' })}</td>`;
            } else if (colId === 'costuriTotal') {
                cellsHtml += `<td>${d.costuriTotal.toLocaleString('ro-RO', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</td>`;
            } else if (colId === 'notes') {
                cellsHtml += `<td style="font-style: italic; font-size: 0.8rem; color: var(--text-secondary); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${savedNotes}">${savedNotes || '-'}</td>`;
            } else if (colId === 'rezultatApel') {
                cellsHtml += `<td style="font-size: 0.8rem; color: var(--text-secondary); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${d.rezultatApel}">${d.rezultatApel || '-'}</td>`;
            } else if (colId === 'phone') {
                cellsHtml += `<td style="font-family: monospace;">${d.phone || '-'}</td>`;
            } else if (colId === 'lastStatus') {
                cellsHtml += `<td><span class="badge ${d.lastStatus === 'ACTIVE' ? 'completed' : 'pending'}" style="font-size: 0.7rem; padding: 0.2rem 0.5rem;">${d.lastStatus}</span></td>`;
            } else if (colId === 'email') {
                cellsHtml += `<td style="font-family: monospace; font-size: 0.8rem;">${d.email || '-'}</td>`;
            } else if (colId === 'uuid') {
                cellsHtml += `<td style="font-family: monospace; font-size: 0.75rem; color: var(--text-muted);">${d.uuid}</td>`;
            } else if (colId === 'profitBrut') {
                cellsHtml += `<td style="font-weight: 600; color: ${d.profitBrut < 0 ? 'var(--color-danger)' : 'var(--color-success)'}">${d.profitBrut.toLocaleString('ro-RO', { style: 'currency', currency: 'EUR' })}</td>`;
            } else if (colId === 'profitNetMediu') {
                cellsHtml += `<td style="font-weight: 600; color: ${d.profitNetMediu < 0 ? 'var(--color-danger)' : 'var(--color-success)'}">${d.profitNetMediu.toLocaleString('ro-RO', { style: 'currency', currency: 'EUR' })}</td>`;
            } else if (colId === 'costuriMediu') {
                cellsHtml += `<td>${d.costuriMediu.toLocaleString('ro-RO', { style: 'currency', currency: 'EUR' })}</td>`;
            }
        });

        tr.innerHTML = cellsHtml;
        tbody.appendChild(tr);
    });
}

// Select Driver Context
function selectDriver(uuid) {
    const driver = rawDrivers.find(d => d.uuid === uuid);
    if (!driver) return;
    selectedDriver = driver;
}

// Open Full-Screen Glassmorphic Profile Modal
window.openProfileModal = function(uuid, contextKey) {
    const driver = rawDrivers.find(d => d.uuid === uuid);
    if (!driver) return;

    selectedDriver = driver;
    activeModalContext = contextKey;
    
    const modal = document.getElementById('driver-profile-modal');
    const content = document.getElementById('modal-profile-content');
    
    if (modal && content) {
        renderProfileHTML(content, driver, contextKey);
        modal.style.display = 'flex';
        modal.classList.add('active');
    }
};

// Close Profile Modal
window.closeProfileModal = function() {
    const modal = document.getElementById('driver-profile-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
};

// DRY Helper to refresh UI layout elements
function refreshUI(uuid, contextKey) {
    const d = rawDrivers.find(x => x.uuid === uuid);
    if (!d) return;

    const content = document.getElementById('modal-profile-content');
    if (content) {
        renderProfileHTML(content, d, contextKey);
    }

    calculateStats();
    if (contextKey === 'dir') {
        applyFilters();
    } else {
        renderRoadmapView();
    }
}

// Click Începe Lucrul (Start Working on Lead) - Completes Step 1
window.startWorkingOnLead = function(uuid, contextKey) {
    const d = rawDrivers.find(x => x.uuid === uuid);
    if (!d) return;

    const state = getDriverState(uuid, d.profitReal);
    state.workStarted = true;

    saveDriverState(uuid, state);
    showToast('Salvat!', 'success');
    
    refreshUI(uuid, contextKey);
};

// Handle Workflow Call Decisions - Completes Step 2
window.setDriverAcceptance = function(uuid, val, contextKey) {
    const d = rawDrivers.find(x => x.uuid === uuid);
    if (!d) return;

    const state = getDriverState(uuid, d.profitReal);
    state.scheduleAcceptance = val;
    
    if (val !== 'accepted') {
        state.step3Outcome = undefined; // reset step 3 if not accepted
    }

    saveDriverState(uuid, state);
    showToast('Salvat!', 'success');
    
    refreshUI(uuid, contextKey);
};

// Handle Step 3 Branching Decisions (Completed / Recontact) - Completes Step 3
window.setDriverStep3Outcome = function(uuid, val, contextKey) {
    const d = rawDrivers.find(x => x.uuid === uuid);
    if (!d) return;

    const state = getDriverState(uuid, d.profitReal);
    state.step3Outcome = val;

    saveDriverState(uuid, state);
    showToast('Salvat!', 'success');
    
    refreshUI(uuid, contextKey);
};

// Save Profile Manual Status & Notes Comment - With Premium Centered Success Overlay Animation
window.saveProfileChanges = function(uuid, contextKey) {
    const d = rawDrivers.find(x => x.uuid === uuid);
    if (!d) return;

    const notesVal = document.getElementById(`crm-notes-${contextKey}`).value;

    const state = getDriverState(uuid, d.profitReal);
    state.notes = notesVal;

    saveDriverState(uuid, state);

    // Compute dynamic localized destination tab name
    let destinationText = '';
    if (state.resolvedStatus === 'Profitabil') {
        destinationText = currentLang === 'ro' ? 'Bază de Date' : 'Database';
    } else {
        // Pierdere
        if (!state.workStarted) {
            destinationText = i18n[currentLang].subtabPending;
        } else {
            if (state.scheduleAcceptance === 'accepted') {
                if (state.step3Outcome === 'completed') {
                    destinationText = i18n[currentLang].subtabCompleted;
                } else if (state.step3Outcome === 'recontact') {
                    destinationText = i18n[currentLang].subtabRecontact;
                } else {
                    destinationText = i18n[currentLang].subtabProgress;
                }
            } else if (state.scheduleAcceptance === 'rejected') {
                destinationText = i18n[currentLang].subtabClosed;
            } else if (state.scheduleAcceptance === 'no_answer') {
                destinationText = i18n[currentLang].subtabNoAnswer;
            } else {
                destinationText = i18n[currentLang].subtabPending;
            }
        }
    }

    // Close the profile modal instantly
    closeProfileModal();
    
    // Recalculate stats & refresh lists
    calculateStats();
    renderCityTable();
    
    if (contextKey === 'dir') {
        applyFilters(); // refresh table matching new statuses
    } else {
        renderRoadmapView(); // refresh roadmap list queue
    }

    // Fire dynamic localized toast notification
    const toastMsg = currentLang === 'ro'
        ? `Modificări Salvate! Mutat în: ${destinationText}`
        : `Changes Saved! Moved to: ${destinationText}`;
    showToast(toastMsg, 'success');
};

// HTML Profile Template Builder for Modal Grid (3 Steps Simplified CRM)
function renderProfileHTML(container, d, contextKey) {
    const state = getDriverState(d.uuid, d.profitReal);
    
    const workStarted = state.workStarted || false;
    const acceptance = state.scheduleAcceptance || 'pending';
    
    const isCompletedStep1 = workStarted;
    const isCompletedStep2 = workStarted && acceptance !== 'pending';
    const isCompletedStep3 = workStarted && acceptance === 'accepted' && state.step3Outcome;

    const progressSteps = state.completedSteps.length;
    const progressPercent = (progressSteps / 3) * 100;

    let timelineHtml = '';

    // PASUL 1: Începe Lucrul
    const activeStep1 = !isCompletedStep1 ? 'active' : '';
    const completedStep1Class = isCompletedStep1 ? 'completed' : '';
    let step1Content = '';
    if (!workStarted) {
        step1Content = `
            <div style="margin-top: 0.6rem;">
                <button class="btn btn-success" style="font-size: 0.85rem; padding: 0.5rem 1.15rem; background-color: var(--color-primary);" onclick="startWorkingOnLead('${d.uuid}', '${contextKey}')">
                    <i class="fa-solid fa-play"></i> ${i18n[currentLang].step1Btn}
                </button>
            </div>
        `;
    } else {
        step1Content = `
            <div style="margin-top: 0.4rem; font-size: 0.82rem; color: var(--color-success); font-weight: 700;">
                <i class="fa-solid fa-circle-check"></i> ${i18n[currentLang].step1ActiveVal}
            </div>
        `;
    }

    timelineHtml += `
        <div class="timeline-step ${completedStep1Class} ${activeStep1}">
            <div class="step-marker">1</div>
            <div class="step-title">
                <span>${i18n[currentLang].step1Title}</span>
                <span class="step-day">${i18n[currentLang].day1}</span>
            </div>
            <div class="step-desc">${i18n[currentLang].step1Desc}</div>
            ${step1Content}
        </div>
    `;

    // PASUL 2: Începere lucru & decizie (three choices)
    const isStep2Enabled = workStarted;
    const activeStep2 = isStep2Enabled && !isCompletedStep2 ? 'active' : '';
    const completedStep2Class = isCompletedStep2 ? 'completed' : '';
    const step2Opacity = isStep2Enabled ? '1.0' : '0.5';

    let step2Content = '';
    if (isStep2Enabled) {
        if (acceptance === 'pending') {
            step2Content = `
                <div style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.4rem; font-weight:600; margin-top:0.4rem;"><i class="fa-solid fa-circle-question"></i> ${i18n[currentLang].step2SelectLabel}</div>
                <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.35rem;">
                    <button class="btn btn-success" style="font-size: 0.78rem; padding: 0.45rem 0.8rem;" onclick="setDriverAcceptance('${d.uuid}', 'accepted', '${contextKey}')">
                        <i class="fa-solid fa-check"></i> ${i18n[currentLang].step2BtnAccept}
                    </button>
                    <button class="btn" style="font-size: 0.78rem; padding: 0.45rem 0.8rem; background-color: var(--color-danger); color: white;" onclick="setDriverAcceptance('${d.uuid}', 'rejected', '${contextKey}')">
                        <i class="fa-solid fa-xmark"></i> ${i18n[currentLang].step2BtnRefuse}
                    </button>
                    <button class="btn" style="font-size: 0.78rem; padding: 0.45rem 0.8rem; background-color: #f59e0b; color: white;" onclick="setDriverAcceptance('${d.uuid}', 'no_answer', '${contextKey}')">
                        <i class="fa-solid fa-phone-slash"></i> ${i18n[currentLang].step2BtnNoAnswer}
                    </button>
                </div>
            `;
        } else {
            let acceptLabel = '';
            if (acceptance === 'accepted') {
                acceptLabel = `<span style="color: var(--color-success); font-weight:700;"><i class="fa-solid fa-circle-check"></i> ${i18n[currentLang].step2AcceptVal}</span>`;
            } else if (acceptance === 'rejected') {
                acceptLabel = `<span style="color: var(--color-danger); font-weight:700;"><i class="fa-solid fa-circle-xmark"></i> ${i18n[currentLang].step2RefuseVal}</span>`;
            } else {
                acceptLabel = `<span style="color: #f59e0b; font-weight:700;"><i class="fa-solid fa-circle-exclamation"></i> ${i18n[currentLang].step2NoAnswerVal}</span>`;
            }
            step2Content = `
                <div style="margin-top: 0.5rem; font-size: 0.82rem; display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.02); padding: 0.4rem; border-radius: var(--border-radius-sm); width: 100%;">
                    ${acceptLabel}
                    <button class="btn" style="background: transparent; color: var(--color-primary); border: 1px solid var(--color-primary); padding: 0.2rem 0.4rem; font-size: 0.7rem; font-weight: 600;" onclick="setDriverAcceptance('${d.uuid}', 'pending', '${contextKey}')">
                        <i class="fa-solid fa-rotate-left"></i> ${i18n[currentLang].btnReset}
                    </button>
                </div>
            `;
        }
    }

    timelineHtml += `
        <div class="timeline-step ${completedStep2Class} ${activeStep2}" style="opacity: ${step2Opacity};">
            <div class="step-marker">2</div>
            <div class="step-title">
                <span>${i18n[currentLang].step2Title}</span>
                <span class="step-day">${i18n[currentLang].day2}</span>
            </div>
            <div class="step-desc">${i18n[currentLang].step2Desc}</div>
            ${step2Content}
        </div>
    `;

    // PASUL 3: Follow-up la 3 Zile
    const isStep3Enabled = workStarted && acceptance === 'accepted';
    const activeStep3 = isStep3Enabled && !state.step3Outcome ? 'active' : '';
    const completedStep3Class = state.step3Outcome ? 'completed' : '';
    const step3Opacity = isStep3Enabled ? '1.0' : '0.5';

    let step3Content = '';
    if (isStep3Enabled) {
        if (!state.step3Outcome) {
            step3Content = `
                <div style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.4rem; font-weight:600; margin-top:0.4rem;"><i class="fa-solid fa-circle-question"></i> ${i18n[currentLang].step3SelectLabel}</div>
                <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.35rem;">
                    <button class="btn btn-success" style="font-size: 0.78rem; padding: 0.45rem 0.8rem;" onclick="setDriverStep3Outcome('${d.uuid}', 'completed', '${contextKey}')">
                        <i class="fa-solid fa-check"></i> ${i18n[currentLang].step3BtnSuccess}
                    </button>
                    <button class="btn" style="font-size: 0.78rem; padding: 0.45rem 0.8rem; background-color: #f59e0b; color: white;" onclick="setDriverStep3Outcome('${d.uuid}', 'recontact', '${contextKey}')">
                        <i class="fa-solid fa-arrows-spin"></i> ${i18n[currentLang].step3BtnRecontact}
                    </button>
                </div>
            `;
        } else {
            let step3Label = '';
            if (state.step3Outcome === 'completed') {
                step3Label = `<span style="color: var(--color-success); font-weight:700;"><i class="fa-solid fa-circle-check"></i> ${i18n[currentLang].step3SuccessVal}</span>`;
            } else {
                step3Label = `<span style="color: #f59e0b; font-weight:700;"><i class="fa-solid fa-circle-exclamation"></i> ${i18n[currentLang].step3RecontactVal}</span>`;
            }
            step3Content = `
                <div style="margin-top: 0.5rem; font-size: 0.82rem; display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.02); padding: 0.4rem; border-radius: var(--border-radius-sm); width: 100%;">
                    ${step3Label}
                    <button class="btn" style="background: transparent; color: var(--color-primary); border: 1px solid var(--color-primary); padding: 0.2rem 0.4rem; font-size: 0.7rem; font-weight: 600;" onclick="setDriverStep3Outcome('${d.uuid}', undefined, '${contextKey}')">
                        <i class="fa-solid fa-rotate-left"></i> ${i18n[currentLang].btnReset}
                    </button>
                </div>
            `;
        }
    }

    timelineHtml += `
        <div class="timeline-step ${completedStep3Class} ${activeStep3}" style="opacity: ${step3Opacity};">
            <div class="step-marker">3</div>
            <div class="step-title">
                <span>${i18n[currentLang].step3Title}</span>
                <span class="step-day">${i18n[currentLang].day3}</span>
            </div>
            <div class="step-desc">${i18n[currentLang].step3Desc}</div>
            ${step3Content}
        </div>
    `;

    // Pre-fill notes comments value with CSV rezultatApel as default if empty
    const savedNotes = state.notes !== undefined && state.notes !== '' ? state.notes : d.rezultatApel;

    // Render left panel HTML (financial data & contact card with Copy buttons)
    const activeBadgeClass = d.lastStatus === 'ACTIVE' ? 'active' : 'inactive';
    const activeBadgeLabel = d.lastStatus === 'ACTIVE' ? i18n[currentLang].activeLabel : i18n[currentLang].inactiveLabel;

    const moneyLocale = currentLang === 'ro' ? 'ro-RO' : 'en-US';
    const phoneMissing = currentLang === 'ro' ? 'Lipsă Telefon' : 'No Phone';
    const emailMissing = currentLang === 'ro' ? 'Lipsă Email' : 'No Email';

    container.innerHTML = `
        <!-- Column 1: Financial & Identity Info -->
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
            <div style="border-bottom: 1px solid var(--card-border); padding-bottom: 0.75rem; display: flex; flex-direction: column; gap: 0.25rem;">
                <span class="step-day" style="font-size: 0.75rem;">${i18n[currentLang].crmFileHeader}</span>
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.15rem;">
                    <h2 style="font-family: 'Outfit', sans-serif; font-size: 1.65rem; font-weight: 800; color: var(--text-primary);">${d.name}</h2>
                    <div class="glowing-status-badge ${activeBadgeClass}">
                        <span class="dot"></span>
                        <span>${i18n[currentLang].lblDriver} ${activeBadgeLabel}</span>
                    </div>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.35rem; margin-top: 0.15rem;">
                    <i class="fa-solid fa-location-dot" style="color: var(--color-primary)"></i>
                    <span style="font-weight: 700; color: var(--text-primary);">${d.city}</span>
                </p>
            </div>

            <!-- Contact Box with Copy Buttons -->
            <div style="background-color: #f0fdf4; padding: 1.25rem; border-radius: var(--border-radius-md); border: 1px solid #bbf7d0; font-size: 0.9rem; display: flex; flex-direction: column; gap: 0.75rem;">
                <span style="color: #15803d; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;"><i class="fa-solid fa-address-card"></i> ${i18n[currentLang].quickContact}</span>
                
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span style="color: var(--text-secondary); font-weight: 600;"><i class="fa-solid fa-phone" style="color: var(--color-primary); margin-right: 0.35rem;"></i> ${i18n[currentLang].phoneLabel}</span>
                    <div style="display: flex; align-items: center; gap: 0.35rem;">
                        <span style="font-weight: 700; font-family: monospace; font-size: 1rem;"><a href="tel:${d.phone}" style="color: var(--text-primary); text-decoration: none;">${d.phone || phoneMissing}</a></span>
                        ${d.phone ? `<button class="btn" style="padding: 0.2rem 0.4rem; font-size: 0.7rem; background: #cbd5e1; color: var(--text-primary);" onclick="navigator.clipboard.writeText('${d.phone}'); showToast('${i18n[currentLang].toastCopied}', 'success');" title="Copy"><i class="fa-solid fa-copy"></i></button>` : ''}
                    </div>
                </div>
                
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span style="color: var(--text-secondary); font-weight: 600;"><i class="fa-solid fa-envelope" style="color: var(--color-primary); margin-right: 0.35rem;"></i> ${i18n[currentLang].emailLabel}</span>
                    <div style="display: flex; align-items: center; gap: 0.35rem;">
                        <span style="font-weight: 700; font-family: monospace; font-size: 0.85rem;"><a href="mailto:${d.email}" style="color: var(--text-primary); text-decoration: none;">${d.email || emailMissing}</a></span>
                        ${d.email ? `<button class="btn" style="padding: 0.2rem 0.4rem; font-size: 0.7rem; background: #cbd5e1; color: var(--text-primary);" onclick="navigator.clipboard.writeText('${d.email}'); showToast('${i18n[currentLang].toastCopied}', 'success');" title="Copy"><i class="fa-solid fa-copy"></i></button>` : ''}
                    </div>
                </div>
            </div>

            <!-- Financial Grid Summary showing all data fields -->
            <div style="background-color: #f8fafc; padding: 1.25rem; border-radius: var(--border-radius-md); border: 1px solid var(--card-border); font-size: 0.85rem; display: flex; flex-direction: column; gap: 0.6rem;">
                <span style="color: var(--text-secondary); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">${i18n[currentLang].dbFullData}</span>
                
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-secondary)">${i18n[currentLang].dbId}</span>
                    <span style="font-weight: 700; font-family: monospace;">${d.pn}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-secondary)">${i18n[currentLang].dbUuid}</span>
                    <span style="font-family: monospace; font-size: 0.75rem; color: var(--text-muted);">${d.uuid}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-secondary)">${i18n[currentLang].dbStatus}</span>
                    <span style="font-weight: 700; font-family: monospace;">${d.lastStatus}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-secondary)">${i18n[currentLang].dbTrips}</span>
                    <span style="font-weight: 700;">${d.trips} ${i18n[currentLang].tripsUnit} (${d.tripsPerHour.toFixed(2)} / ${i18n[currentLang].perHour})</span>
                </div>
                
                <div style="border-top: 1px solid var(--card-border); padding-top: 0.6rem; margin-top: 0.25rem; display: flex; flex-direction: column; gap: 0.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: 700; font-size: 0.95rem;">${i18n[currentLang].realProfit}</span>
                        <span style="font-size: 1.35rem; font-weight: 800; color: ${d.profitReal < 0 ? 'var(--color-danger)' : 'var(--color-success)'}">
                            ${d.profitReal.toLocaleString(moneyLocale, { style: 'currency', currency: 'EUR' })}
                        </span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-secondary)">${i18n[currentLang].grossProfit}</span>
                        <span style="font-weight: 600;">${d.profitBrut.toLocaleString(moneyLocale, { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-secondary)">${i18n[currentLang].avgNetProfit}</span>
                        <span style="font-weight: 600;">${d.profitNetMediu.toLocaleString(moneyLocale, { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-secondary)">${i18n[currentLang].totalCosts}</span>
                        <span style="color: var(--color-warning); font-weight: 600;">${d.costuriTotal.toLocaleString(moneyLocale, { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-secondary)">${i18n[currentLang].avgCosts}</span>
                        <span style="font-weight: 600;">${d.costuriMediu.toLocaleString(moneyLocale, { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Column 2: Manual 3-Step Roadmap Checklist & Tracker Form -->
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
            
            <!-- Progress Bar -->
            <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem;">
                    <span>${currentLang === 'ro' ? 'Plan Asistență (3 Pași)' : 'Support Plan (3 Steps)'}</span>
                    <span style="color: var(--color-primary);">${progressSteps}/3 ${currentLang === 'ro' ? 'Pași Bifați' : 'Steps Checked'} (${progressPercent.toFixed(0)}%)</span>
                </div>
                <div class="progress-bar-container" style="margin-bottom: 1.25rem;">
                    <div class="progress-bar-fill" style="width: ${progressPercent}%"></div>
                </div>
                
                <!-- Actionable Checklist -->
                <div class="timeline">
                    ${timelineHtml}
                </div>
            </div>

            <!-- Manual Editor Form Fields -->
            <div style="border-top: 1px solid var(--card-border); padding-top: 1rem; display: flex; flex-direction: column; gap: 0.85rem; margin-top: 0.5rem;">
                <div class="form-group">
                    <label>${i18n[currentLang].notesTitle}</label>
                    <textarea id="crm-notes-${contextKey}" class="form-control" rows="3" placeholder="${i18n[currentLang].notesPlaceholder}" style="resize: none;">${savedNotes}</textarea>
                </div>

                <button class="btn btn-success" onclick="saveProfileChanges('${d.uuid}', '${contextKey}')" style="width: 100%; font-size: 0.9rem; padding: 0.75rem;">
                    <i class="fa-solid fa-floppy-disk"></i> ${currentLang === 'ro' ? 'Salvează' : 'Save'}
                </button>
            </div>
        </div>
    `;
}

let activeRoadmapSubtab = 'pending';

window.setRoadmapSubtab = function(subtab) {
    activeRoadmapSubtab = subtab;
    
    // Toggle active state in UI buttons
    document.querySelectorAll('.subtab-btn').forEach(btn => btn.classList.remove('active'));
    
    const activeBtn = document.getElementById(`subtab-${subtab}`);
    if (activeBtn) activeBtn.classList.add('active');
    
    renderRoadmapView();
};

// Render dedicated Non-Profit View queue (3 Steps Progress Indicators)
function renderRoadmapView() {
    const listContainer = document.getElementById('roadmap-drivers-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    
    // Filter non-profit drivers based on status (Pierdere) AND the selected sub-tab category
    const targetDrivers = rawDrivers.filter(d => {
        const state = getDriverState(d.uuid, d.profitReal);
        
        // Only include those who are in Pierdere (Loss/Non-Profit)
        if (state.resolvedStatus !== 'Pierdere') {
            return false;
        }
        
        // Filter by our 6 workflow sub-tabs
        const workStarted = state.workStarted || false;
        const acceptance = state.scheduleAcceptance || 'pending';
        const outcome = state.step3Outcome;
        
        if (activeRoadmapSubtab === 'pending') {
            return !workStarted || acceptance === 'pending';
        } else if (activeRoadmapSubtab === 'progress') {
            return workStarted && acceptance === 'accepted' && !outcome;
        } else if (activeRoadmapSubtab === 'closed') {
            return workStarted && acceptance === 'rejected';
        } else if (activeRoadmapSubtab === 'no-answer') {
            return workStarted && acceptance === 'no_answer';
        } else if (activeRoadmapSubtab === 'completed') {
            return workStarted && acceptance === 'accepted' && outcome === 'completed';
        } else if (activeRoadmapSubtab === 'recontact') {
            return workStarted && acceptance === 'accepted' && outcome === 'recontact';
        }
        return true;
    });
    
    targetDrivers.sort((a, b) => a.profitReal - b.profitReal);

    if (targetDrivers.length === 0) {
        let emptyMessage = '';
        if (activeRoadmapSubtab === 'pending') {
            emptyMessage = i18n[currentLang].emptyPending;
        } else if (activeRoadmapSubtab === 'progress') {
            emptyMessage = i18n[currentLang].emptyProgress;
        } else if (activeRoadmapSubtab === 'closed') {
            emptyMessage = i18n[currentLang].emptyClosed;
        } else if (activeRoadmapSubtab === 'no-answer') {
            emptyMessage = i18n[currentLang].emptyNoAnswer;
        } else if (activeRoadmapSubtab === 'completed') {
            emptyMessage = i18n[currentLang].emptyCompleted;
        } else {
            emptyMessage = i18n[currentLang].emptyRecontact;
        }
        listContainer.innerHTML = `<div style="grid-column: 1/-1; padding: 3rem; text-align: center; color: var(--text-muted)"><i class="fa-solid fa-circle-check" style="font-size: 2.5rem; color: var(--color-success); margin-bottom: 0.5rem;"></i><p>${emptyMessage}</p></div>`;
        return;
    }

    targetDrivers.forEach(d => {
        const state = getDriverState(d.uuid, d.profitReal);
        const progress = state.completedSteps.length;
        const acceptance = state.scheduleAcceptance || 'pending';

        const item = document.createElement('div');
        item.className = `stat-card`;
        
        item.addEventListener('click', () => {
            selectDriver(d.uuid);
            openProfileModal(d.uuid, 'roadmap');
        });

        // Compute premium badge status using style.css classes
        let statusBadge = '';
        if (!state.workStarted) {
            statusBadge = `<span class="badge pending">${i18n[currentLang].badgePending}</span>`;
        } else {
            if (acceptance === 'accepted') {
                if (state.step3Outcome === 'completed') {
                    statusBadge = `<span class="badge completed">${i18n[currentLang].badgeCompleted}</span>`;
                } else if (state.step3Outcome === 'recontact') {
                    statusBadge = `<span class="badge recontact">${i18n[currentLang].badgeRecontact}</span>`;
                } else {
                    statusBadge = `<span class="badge progress">${i18n[currentLang].badgeAccepted} (${progress}/3)</span>`;
                }
            } else if (acceptance === 'rejected') {
                statusBadge = `<span class="badge closed">${i18n[currentLang].badgeRefused}</span>`;
            } else if (acceptance === 'no_answer') {
                statusBadge = `<span class="badge no-answer">${i18n[currentLang].badgeNoAnswer}</span>`;
            } else {
                statusBadge = `<span class="badge progress">${i18n[currentLang].badgeInWork}</span>`;
            }
        }

        const cityLabel = currentLang === 'ro' ? 'Oraș' : 'City';
        const lossLabel = currentLang === 'ro' ? 'Pierderi' : 'Losses';
        const planLabel = currentLang === 'ro' ? 'Plan Asistență' : 'Support Plan';
        const stepsLabel = currentLang === 'ro' ? 'Pași Bifați' : 'Steps Checked';

        item.innerHTML = `
            <div class="card-main-info">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
                    <div class="card-driver-name">${d.name}</div>
                    ${statusBadge}
                </div>
                <div class="card-driver-details" style="margin-top: 0.35rem;">
                    <span>${cityLabel}: <strong style="color: var(--text-primary); font-weight: 600;">${d.city}</strong></span>
                    <span style="color: var(--text-muted)">|</span>
                    <span>${lossLabel}: <span class="card-driver-loss-badge">${d.profitReal.toFixed(0)}€</span></span>
                </div>
            </div>
            <div style="margin-top: 1rem;">
                <div style="font-size: 0.75rem; display: flex; justify-content: space-between; color: var(--text-muted); font-weight: 600;">
                    <span>${planLabel}</span>
                    <span>${progress}/3 ${stepsLabel}</span>
                </div>
                <div class="progress-bar-container" style="margin-top: 0.35rem; height: 6px;">
                    <div class="progress-bar-fill" style="width: ${(progress / 3) * 100}%;"></div>
                </div>
            </div>
        `;
        listContainer.appendChild(item);
    });
}

// Toast Notifications helper
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `badge ${type}`;
    toast.style.position = 'fixed';
    toast.style.bottom = '2rem';
    toast.style.right = '2rem';
    toast.style.padding = '0.75rem 1.25rem';
    toast.style.fontSize = '0.85rem';
    toast.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
    toast.style.zIndex = '999';
    toast.style.animation = 'none'; // simple layout, no animations
    toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-check' : 'fa-xmark'}"></i> ${message}`;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.2s ease';
        setTimeout(() => toast.remove(), 200);
    }, 2000);
}

// Setup Event Listeners on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    loadDriverData();

    // Filtering inputs listeners
    document.getElementById('search-driver').addEventListener('input', applyFilters);
    document.getElementById('filter-city').addEventListener('change', applyFilters);
    document.getElementById('filter-profitability').addEventListener('change', applyFilters);

    // Escape key closes modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeProfileModal();
        }
    });

    // Clicking outside modal content closes it
    const modal = document.getElementById('driver-profile-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeProfileModal();
            }
        });
    }
});

// Setup Language Switcher Functions
window.setLanguage = function(lang) {
    currentLang = lang;
    localStorage.setItem('app_lang', lang);
    
    // Toggle active classes on language buttons
    const btnRo = document.getElementById('lang-btn-ro');
    const btnEn = document.getElementById('lang-btn-en');
    if (btnRo && btnEn) {
        if (lang === 'ro') {
            btnRo.classList.add('active');
            btnEn.classList.remove('active');
        } else {
            btnEn.classList.add('active');
            btnRo.classList.remove('active');
        }
    }
    
    updateLanguageUI();
};

function updateLanguageUI() {
    // 1. Translate all static elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = i18n[currentLang][key];
        if (translation) {
            // Handle placeholders for input elements
            if (el.tagName === 'INPUT') {
                el.placeholder = translation;
            } else {
                el.innerHTML = translation;
            }
        }
    });
    
    // 2. Translate any dynamic components or states
    // Refresh column selection panel (labels need translation)
    initColumnsPanel();
    
    // Re-populate filters and city filters (dropdowns have static/dynamic text)
    populateCityFilter();
    
    // Refresh overview and city table (re-render uses active translations)
    renderCityTable();
    calculateStats();
    
    // Refresh main table
    renderDriversTable();
    
    // Refresh roadmap if active
    renderRoadmapView();
    
    // Refresh modal if active and open
    if (selectedDriver) {
        const content = document.getElementById('modal-profile-content');
        const modal = document.getElementById('driver-profile-modal');
        if (modal && modal.style.display === 'flex' && content) {
            const contextKey = activeModalContext || 'dir';
            renderProfileHTML(content, selectedDriver, contextKey);
        }
    }
}
