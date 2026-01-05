import { supabase } from './supabase-config.js';

let allHotels = [];
let currentUser = null;
let allStates = [];
let allBrands = [];

// Check authentication and restrict to internal users only
async function initPage() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        window.location.href = 'index.html';
        return;
    }

    // Check if user is internal
    const { data: userData, error } = await supabase
        .from('users')
        .select('user_type, role')
        .eq('id', session.user.id)
        .single();

    if (error || !userData || userData.user_type !== 'internal') {
        // Not an internal user, redirect to dashboard
        alert('Access denied. Hotel Fact Sheets are only available to internal users.');
        window.location.href = 'dashboard.html';
        return;
    }

    currentUser = userData;

    // Show internal links
    document.getElementById('hotel-tracker-link').style.display = 'flex';
    document.getElementById('hotel-top-accounts-link').style.display = 'flex';
    document.getElementById('hotel-partner-notes-link').style.display = 'flex';
    document.getElementById('initiatives-link').style.display = 'flex';
    document.getElementById('bi-tools-link').style.display = 'flex';
    document.getElementById('hotel-fact-sheets-link').style.display = 'flex';

    // Show user management link if admin
    if (userData.role === 'admin') {
        document.getElementById('user-management-link').style.display = 'flex';
    }

    document.getElementById('user-email').textContent = session.user.email;
    await loadHotels();
    setupEventListeners();
}

// Initialize page
initPage();

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
        window.location.href = 'index.html';
    }
});

// Handle logout
document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
        await supabase.auth.signOut();
    } catch (error) {
        console.error('Error signing out:', error);
        alert('Error signing out. Please try again.');
    }
});

// Load hotels from database
async function loadHotels() {
    try {
        const { data, error } = await supabase
            .from('hotel_fact_sheets')
            .select('*')
            .order('hotel_name', { ascending: true });

        if (error) throw error;

        allHotels = data || [];

        // Extract unique states and brands for filters
        allStates = [...new Set(allHotels.map(h => h.address_state).filter(Boolean))].sort();
        allBrands = [...new Set(allHotels.map(h => extractBrand(h.hotel_name)).filter(Boolean))].sort();

        populateFilters();
        displayHotels(allHotels);
    } catch (error) {
        console.error('Error loading hotels:', error);
        document.getElementById('hotel-cards-container').innerHTML = `
            <div class="no-results">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p>Error loading hotels. Please refresh the page.</p>
            </div>
        `;
    }
}

// Extract brand from hotel name
function extractBrand(hotelName) {
    if (!hotelName) return null;

    const brandPatterns = [
        { pattern: /^AC Hotel/i, brand: 'AC Hotel' },
        { pattern: /^Aloft/i, brand: 'Aloft' },
        { pattern: /^Courtyard/i, brand: 'Courtyard' },
        { pattern: /^Element/i, brand: 'Element' },
        { pattern: /^Embassy Suites/i, brand: 'Embassy Suites' },
        { pattern: /^EVEN/i, brand: 'EVEN' },
        { pattern: /^Fairfield/i, brand: 'Fairfield Inn' },
        { pattern: /^Hampton Inn/i, brand: 'Hampton Inn' },
        { pattern: /^Hilton Garden Inn/i, brand: 'Hilton Garden Inn' },
        { pattern: /^Holiday Inn Express/i, brand: 'Holiday Inn Express' },
        { pattern: /^Holiday Inn/i, brand: 'Holiday Inn' },
        { pattern: /^Home2/i, brand: 'Home2 Suites' },
        { pattern: /^Homewood/i, brand: 'Homewood Suites' },
        { pattern: /^Hyatt House/i, brand: 'Hyatt House' },
        { pattern: /^Hyatt Place/i, brand: 'Hyatt Place' },
        { pattern: /^Renaissance/i, brand: 'Renaissance' },
        { pattern: /^Residence Inn/i, brand: 'Residence Inn' },
        { pattern: /^SpringHill/i, brand: 'SpringHill Suites' },
        { pattern: /^Staybridge/i, brand: 'Staybridge Suites' },
        { pattern: /^TownePlace/i, brand: 'TownePlace Suites' },
        { pattern: /^Westin/i, brand: 'Westin' },
        { pattern: /^WoodSpring/i, brand: 'WoodSpring Suites' },
    ];

    for (const { pattern, brand } of brandPatterns) {
        if (pattern.test(hotelName)) {
            return brand;
        }
    }

    return null;
}

// Populate filter dropdowns
function populateFilters() {
    const stateSelect = document.getElementById('filter-state');
    const brandSelect = document.getElementById('filter-brand');

    // Populate states
    allStates.forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        stateSelect.appendChild(option);
    });

    // Populate brands
    allBrands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandSelect.appendChild(option);
    });
}

// Display hotels in card grid
function displayHotels(hotels) {
    const container = document.getElementById('hotel-cards-container');
    const countElement = document.getElementById('hotel-count');

    countElement.textContent = `Showing ${hotels.length} hotel${hotels.length !== 1 ? 's' : ''}`;

    if (hotels.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <p>No hotels found matching your search criteria.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = hotels.map(hotel => {
        const brand = extractBrand(hotel.hotel_name);
        const location = [hotel.address_city, hotel.address_state].filter(Boolean).join(', ');

        return `
            <a href="hotel-fact-sheet-detail.html?id=${hotel.id}" class="hotel-card">
                <div class="hotel-name">${escapeHtml(hotel.hotel_name)}</div>
                <div class="hotel-location">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    ${escapeHtml(location || 'Location not specified')}
                </div>
                <div class="hotel-stats">
                    ${hotel.total_rooms ? `
                        <div class="hotel-stat">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                            </svg>
                            ${hotel.total_rooms} rooms
                        </div>
                    ` : ''}
                    ${hotel.year_built ? `
                        <div class="hotel-stat">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            Built ${hotel.year_built}
                        </div>
                    ` : ''}
                </div>
                ${brand ? `<span class="brand-badge">${escapeHtml(brand)}</span>` : ''}
            </a>
        `;
    }).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Setup event listeners
function setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    const stateFilter = document.getElementById('filter-state');
    const brandFilter = document.getElementById('filter-brand');

    // Debounce search
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(applyFilters, 300);
    });

    stateFilter.addEventListener('change', applyFilters);
    brandFilter.addEventListener('change', applyFilters);
}

// Apply filters
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const stateFilter = document.getElementById('filter-state').value;
    const brandFilter = document.getElementById('filter-brand').value;

    let filtered = allHotels.filter(hotel => {
        // Search filter
        if (searchTerm) {
            const searchFields = [
                hotel.hotel_name,
                hotel.address_city,
                hotel.address_state,
                hotel.county,
                hotel.submarket
            ].filter(Boolean).join(' ').toLowerCase();

            if (!searchFields.includes(searchTerm)) {
                return false;
            }
        }

        // State filter
        if (stateFilter && hotel.address_state !== stateFilter) {
            return false;
        }

        // Brand filter
        if (brandFilter) {
            const hotelBrand = extractBrand(hotel.hotel_name);
            if (hotelBrand !== brandFilter) {
                return false;
            }
        }

        return true;
    });

    displayHotels(filtered);
}
