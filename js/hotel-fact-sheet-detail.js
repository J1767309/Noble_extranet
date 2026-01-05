import { supabase } from './supabase-config.js';

let currentUser = null;
let hotelData = null;

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

    if (userData.role === 'admin') {
        document.getElementById('user-management-link').style.display = 'flex';
    }

    document.getElementById('user-email').textContent = session.user.email;

    // Get hotel ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const hotelId = urlParams.get('id');

    if (!hotelId) {
        showError('No hotel ID provided');
        return;
    }

    await loadHotelData(hotelId);
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

// Load hotel data from database
async function loadHotelData(hotelId) {
    try {
        const { data, error } = await supabase
            .from('hotel_fact_sheets')
            .select('*')
            .eq('id', hotelId)
            .single();

        if (error) throw error;

        if (!data) {
            showError('Hotel not found');
            return;
        }

        hotelData = data;
        document.title = `${data.hotel_name} - Hotel Fact Sheet - Noble`;
        displayHotelData(data);
    } catch (error) {
        console.error('Error loading hotel data:', error);
        showError('Error loading hotel data. Please try again.');
    }
}

// Show error message
function showError(message) {
    document.getElementById('hotel-content').innerHTML = `
        <div class="error-state">
            <p>${escapeHtml(message)}</p>
            <a href="hotel-fact-sheets.html" class="btn btn-primary" style="margin-top: 1rem;">Back to Hotels</a>
        </div>
    `;
}

// Display hotel data
function displayHotelData(hotel) {
    const container = document.getElementById('hotel-content');

    // Build location string
    const addressParts = [hotel.address_street, hotel.address_city, hotel.address_state, hotel.address_zip].filter(Boolean);
    const fullAddress = addressParts.join(', ');
    const cityState = [hotel.address_city, hotel.address_state].filter(Boolean).join(', ');

    // Extract brand
    const brand = extractBrand(hotel.hotel_name);

    container.innerHTML = `
        <!-- Hotel Header -->
        <div class="hotel-header">
            <h1 class="hotel-title">${escapeHtml(hotel.hotel_name)}</h1>
            <div class="hotel-subtitle">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                </svg>
                ${escapeHtml(cityState || 'Location not specified')}
            </div>
            ${brand ? `<span class="brand-badge-large">${escapeHtml(brand)}</span>` : ''}
        </div>

        <div class="two-column-grid">
            <!-- Left Column -->
            <div>
                <!-- Property Overview -->
                <div class="detail-section">
                    <h2 class="section-title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        Property Overview
                    </h2>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Owner LLC</span>
                            <span class="detail-value ${!hotel.owner_llc ? 'empty' : ''}">${escapeHtml(hotel.owner_llc) || 'Not specified'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Operating Company</span>
                            <span class="detail-value ${!hotel.operating_company_llc ? 'empty' : ''}">${escapeHtml(hotel.operating_company_llc) || 'Not specified'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Year Built</span>
                            <span class="detail-value ${!hotel.year_built ? 'empty' : ''}">${hotel.year_built || 'Not specified'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Total Rooms</span>
                            <span class="detail-value ${!hotel.total_rooms ? 'empty' : ''}">${hotel.total_rooms || 'Not specified'}</span>
                        </div>
                    </div>
                </div>

                <!-- Location & Contact -->
                <div class="detail-section">
                    <h2 class="section-title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        Location & Contact
                    </h2>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Address</span>
                            <span class="detail-value ${!fullAddress ? 'empty' : ''}">${escapeHtml(fullAddress) || 'Not specified'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Phone</span>
                            <span class="detail-value ${!hotel.phone ? 'empty' : ''}">${hotel.phone ? `<a href="tel:${hotel.phone}">${formatPhone(hotel.phone)}</a>` : 'Not specified'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Website</span>
                            <span class="detail-value ${!hotel.website ? 'empty' : ''}">${hotel.website ? `<a href="${formatUrl(hotel.website)}" target="_blank" rel="noopener">${escapeHtml(hotel.website)}</a>` : 'Not specified'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">County / Submarket</span>
                            <span class="detail-value ${!hotel.county && !hotel.submarket ? 'empty' : ''}">${escapeHtml([hotel.county, hotel.submarket].filter(Boolean).join(' / ')) || 'Not specified'}</span>
                        </div>
                    </div>
                </div>

                <!-- Property Details -->
                <div class="detail-section">
                    <h2 class="section-title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="3" y1="9" x2="21" y2="9"></line>
                            <line x1="9" y1="21" x2="9" y2="9"></line>
                        </svg>
                        Property Details
                    </h2>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Buildings</span>
                            <span class="detail-value ${!hotel.num_buildings ? 'empty' : ''}">${hotel.num_buildings || 'Not specified'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Stories</span>
                            <span class="detail-value ${!hotel.num_stories ? 'empty' : ''}">${hotel.num_stories || 'Not specified'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Total Square Footage</span>
                            <span class="detail-value ${!hotel.total_sq_ft ? 'empty' : ''}">${hotel.total_sq_ft ? formatNumber(hotel.total_sq_ft) + ' sq ft' : 'Not specified'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Acreage</span>
                            <span class="detail-value ${!hotel.acreage ? 'empty' : ''}">${hotel.acreage ? hotel.acreage + ' acres' : 'Not specified'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Parking</span>
                            <span class="detail-value ${!hotel.parking_spaces && !hotel.parking_type ? 'empty' : ''}">${[hotel.parking_spaces ? hotel.parking_spaces + ' spaces' : null, hotel.parking_type].filter(Boolean).join(' - ') || 'Not specified'}</span>
                        </div>
                    </div>
                </div>

                <!-- Key Dates & Identifiers -->
                <div class="detail-section">
                    <h2 class="section-title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        Key Dates & Identifiers
                    </h2>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="detail-label">Purchase Date</span>
                            <span class="detail-value ${!hotel.purchase_date ? 'empty' : ''}">${escapeHtml(hotel.purchase_date) || 'Not specified'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Open Date</span>
                            <span class="detail-value ${!hotel.open_date ? 'empty' : ''}">${escapeHtml(hotel.open_date) || 'Not specified'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Marsha Code</span>
                            <span class="detail-value ${!hotel.marsha_code ? 'empty' : ''}">${escapeHtml(hotel.marsha_code) || 'Not specified'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">STR Code</span>
                            <span class="detail-value ${!hotel.str_code ? 'empty' : ''}">${escapeHtml(hotel.str_code) || 'Not specified'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">FEIN</span>
                            <span class="detail-value ${!hotel.fein ? 'empty' : ''}">${escapeHtml(hotel.fein) || 'Not specified'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column -->
            <div>
                <!-- Room Mix -->
                ${hotel.room_mix && hotel.room_mix.length > 0 ? `
                    <div class="detail-section">
                        <h2 class="section-title">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M2 4v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8l-6-6H4c-1.1 0-2 .9-2 2z"></path>
                                <path d="M14 2v6h6"></path>
                            </svg>
                            Room Mix
                        </h2>
                        <table class="room-mix-table">
                            <thead>
                                <tr>
                                    <th>Room Type</th>
                                    <th>Count</th>
                                    <th>Sq Ft</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${hotel.room_mix.map(room => `
                                    <tr>
                                        <td>${escapeHtml(room.type)}</td>
                                        <td>${room.count}</td>
                                        <td>${room.sq_ft || '-'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : ''}

                <!-- Meeting Rooms -->
                ${hotel.meeting_rooms && hotel.meeting_rooms.length > 0 ? `
                    <div class="detail-section">
                        <h2 class="section-title">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            Meeting Rooms
                        </h2>
                        <table class="room-mix-table">
                            <thead>
                                <tr>
                                    <th>Room Name</th>
                                    <th>Sq Ft</th>
                                    <th>Dimensions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${hotel.meeting_rooms.map(room => `
                                    <tr>
                                        <td>${escapeHtml(room.name)}</td>
                                        <td>${room.sq_ft || '-'}</td>
                                        <td>${escapeHtml(room.dimensions) || '-'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : ''}

                <!-- Competitive Set -->
                ${hotel.competitive_set && hotel.competitive_set.length > 0 ? `
                    <div class="detail-section">
                        <h2 class="section-title">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                                <polyline points="17 6 23 6 23 12"></polyline>
                            </svg>
                            Competitive Set
                        </h2>
                        <ul class="comp-set-list">
                            ${hotel.competitive_set.map(comp => `<li>${escapeHtml(comp)}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}

                <!-- Features & Amenities -->
                ${hotel.features_amenities ? `
                    <div class="detail-section">
                        <h2 class="section-title">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="9 11 12 14 22 4"></polyline>
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                            </svg>
                            Features & Amenities
                        </h2>
                        <div class="text-content">${escapeHtml(hotel.features_amenities)}</div>
                    </div>
                ` : ''}
            </div>
        </div>

        <!-- Full Width Sections -->
        ${hotel.renovations ? `
            <div class="detail-section">
                <h2 class="section-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                    </svg>
                    Renovations
                </h2>
                <div class="text-content">${escapeHtml(hotel.renovations)}</div>
            </div>
        ` : ''}

        ${hotel.franchise_brand || hotel.franchise_fees ? `
            <div class="detail-section">
                <h2 class="section-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" y1="1" x2="12" y2="23"></line>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                    Franchise Information
                </h2>
                <div class="detail-grid">
                    ${hotel.franchise_brand ? `
                        <div class="detail-item">
                            <span class="detail-label">Franchise Brand</span>
                            <span class="detail-value">${escapeHtml(hotel.franchise_brand)}</span>
                        </div>
                    ` : ''}
                    ${hotel.franchise_fees ? `
                        <div class="detail-item" style="grid-column: span 2;">
                            <span class="detail-label">Franchise Fees</span>
                            <span class="detail-value">${escapeHtml(hotel.franchise_fees)}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        ` : ''}

        ${hotel.common_area_retail ? `
            <div class="detail-section">
                <h2 class="section-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                    </svg>
                    Common Area / Retail
                </h2>
                <div class="text-content">${escapeHtml(hotel.common_area_retail)}</div>
            </div>
        ` : ''}

        ${hotel.lender_info ? `
            <div class="detail-section">
                <h2 class="section-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                        <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                    Lender Information
                </h2>
                <div class="text-content">${escapeHtml(hotel.lender_info)}</div>
            </div>
        ` : ''}
    `;
}

// Helper functions
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatPhone(phone) {
    if (!phone) return '';
    // Format as (XXX) XXX-XXXX
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
}

function formatUrl(url) {
    if (!url) return '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return 'https://' + url;
    }
    return url;
}

function formatNumber(num) {
    if (!num) return '';
    return num.toLocaleString();
}

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
