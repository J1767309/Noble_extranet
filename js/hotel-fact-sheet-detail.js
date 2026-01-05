import { supabase } from './supabase-config.js';

let currentUser = null;
let hotelData = null;
let isEditMode = false;
let originalData = null;

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

    const isAdmin = currentUser && currentUser.role === 'admin';

    container.innerHTML = `
        <!-- Hotel Header -->
        <div class="hotel-header">
            <div class="header-actions-row">
                <div class="header-info">
                    <h1 class="hotel-title">
                        <span class="display-value">${escapeHtml(hotel.hotel_name)}</span>
                        <input type="text" class="edit-input edit-field" data-field="hotel_name" value="${escapeHtml(hotel.hotel_name || '')}">
                    </h1>
                    <div class="hotel-subtitle">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        ${escapeHtml(cityState || 'Location not specified')}
                    </div>
                    ${brand ? `<span class="brand-badge-large">${escapeHtml(brand)}</span>` : ''}
                </div>
                ${isAdmin ? `
                    <button class="edit-btn show" id="edit-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Edit
                    </button>
                    <div class="edit-actions" id="edit-actions">
                        <button class="save-btn" id="save-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Save
                        </button>
                        <button class="cancel-btn" id="cancel-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                            Cancel
                        </button>
                    </div>
                ` : ''}
            </div>
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
                            <span class="detail-value display-value ${!hotel.owner_llc ? 'empty' : ''}">${escapeHtml(hotel.owner_llc) || 'Not specified'}</span>
                            <input type="text" class="edit-input edit-field" data-field="owner_llc" value="${escapeHtml(hotel.owner_llc || '')}">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Operating Company</span>
                            <span class="detail-value display-value ${!hotel.operating_company_llc ? 'empty' : ''}">${escapeHtml(hotel.operating_company_llc) || 'Not specified'}</span>
                            <input type="text" class="edit-input edit-field" data-field="operating_company_llc" value="${escapeHtml(hotel.operating_company_llc || '')}">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Year Built</span>
                            <span class="detail-value display-value ${!hotel.year_built ? 'empty' : ''}">${hotel.year_built || 'Not specified'}</span>
                            <input type="number" class="edit-input edit-field" data-field="year_built" value="${hotel.year_built || ''}">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Total Rooms</span>
                            <span class="detail-value display-value ${!hotel.total_rooms ? 'empty' : ''}">${hotel.total_rooms || 'Not specified'}</span>
                            <input type="number" class="edit-input edit-field" data-field="total_rooms" value="${hotel.total_rooms || ''}">
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
                            <span class="detail-label">Street Address</span>
                            <span class="detail-value display-value ${!hotel.address_street ? 'empty' : ''}">${escapeHtml(hotel.address_street) || 'Not specified'}</span>
                            <input type="text" class="edit-input edit-field" data-field="address_street" value="${escapeHtml(hotel.address_street || '')}">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">City</span>
                            <span class="detail-value display-value ${!hotel.address_city ? 'empty' : ''}">${escapeHtml(hotel.address_city) || 'Not specified'}</span>
                            <input type="text" class="edit-input edit-field" data-field="address_city" value="${escapeHtml(hotel.address_city || '')}">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">State</span>
                            <span class="detail-value display-value ${!hotel.address_state ? 'empty' : ''}">${escapeHtml(hotel.address_state) || 'Not specified'}</span>
                            <input type="text" class="edit-input edit-field" data-field="address_state" value="${escapeHtml(hotel.address_state || '')}">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">ZIP</span>
                            <span class="detail-value display-value ${!hotel.address_zip ? 'empty' : ''}">${escapeHtml(hotel.address_zip) || 'Not specified'}</span>
                            <input type="text" class="edit-input edit-field" data-field="address_zip" value="${escapeHtml(hotel.address_zip || '')}">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Phone</span>
                            <span class="detail-value display-value ${!hotel.phone ? 'empty' : ''}">${hotel.phone ? `<a href="tel:${hotel.phone}">${formatPhone(hotel.phone)}</a>` : 'Not specified'}</span>
                            <input type="text" class="edit-input edit-field" data-field="phone" value="${escapeHtml(hotel.phone || '')}">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Website</span>
                            <span class="detail-value display-value ${!hotel.website ? 'empty' : ''}">${hotel.website ? `<a href="${formatUrl(hotel.website)}" target="_blank" rel="noopener">${escapeHtml(hotel.website)}</a>` : 'Not specified'}</span>
                            <input type="text" class="edit-input edit-field" data-field="website" value="${escapeHtml(hotel.website || '')}">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">County</span>
                            <span class="detail-value display-value ${!hotel.county ? 'empty' : ''}">${escapeHtml(hotel.county) || 'Not specified'}</span>
                            <input type="text" class="edit-input edit-field" data-field="county" value="${escapeHtml(hotel.county || '')}">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Submarket</span>
                            <span class="detail-value display-value ${!hotel.submarket ? 'empty' : ''}">${escapeHtml(hotel.submarket) || 'Not specified'}</span>
                            <input type="text" class="edit-input edit-field" data-field="submarket" value="${escapeHtml(hotel.submarket || '')}">
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
                            <span class="detail-value display-value ${!hotel.num_buildings ? 'empty' : ''}">${hotel.num_buildings || 'Not specified'}</span>
                            <input type="number" class="edit-input edit-field" data-field="num_buildings" value="${hotel.num_buildings || ''}">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Stories</span>
                            <span class="detail-value display-value ${!hotel.num_stories ? 'empty' : ''}">${hotel.num_stories || 'Not specified'}</span>
                            <input type="number" class="edit-input edit-field" data-field="num_stories" value="${hotel.num_stories || ''}">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Total Square Footage</span>
                            <span class="detail-value display-value ${!hotel.total_sq_ft ? 'empty' : ''}">${hotel.total_sq_ft ? formatNumber(hotel.total_sq_ft) + ' sq ft' : 'Not specified'}</span>
                            <input type="number" class="edit-input edit-field" data-field="total_sq_ft" value="${hotel.total_sq_ft || ''}">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Acreage</span>
                            <span class="detail-value display-value ${!hotel.acreage ? 'empty' : ''}">${hotel.acreage ? hotel.acreage + ' acres' : 'Not specified'}</span>
                            <input type="number" step="0.01" class="edit-input edit-field" data-field="acreage" value="${hotel.acreage || ''}">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Parking Spaces</span>
                            <span class="detail-value display-value ${!hotel.parking_spaces ? 'empty' : ''}">${hotel.parking_spaces || 'Not specified'}</span>
                            <input type="number" class="edit-input edit-field" data-field="parking_spaces" value="${hotel.parking_spaces || ''}">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Parking Type</span>
                            <span class="detail-value display-value ${!hotel.parking_type ? 'empty' : ''}">${escapeHtml(hotel.parking_type) || 'Not specified'}</span>
                            <input type="text" class="edit-input edit-field" data-field="parking_type" value="${escapeHtml(hotel.parking_type || '')}">
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
                            <span class="detail-value display-value ${!hotel.purchase_date ? 'empty' : ''}">${escapeHtml(hotel.purchase_date) || 'Not specified'}</span>
                            <input type="text" class="edit-input edit-field" data-field="purchase_date" value="${escapeHtml(hotel.purchase_date || '')}">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Open Date</span>
                            <span class="detail-value display-value ${!hotel.open_date ? 'empty' : ''}">${escapeHtml(hotel.open_date) || 'Not specified'}</span>
                            <input type="text" class="edit-input edit-field" data-field="open_date" value="${escapeHtml(hotel.open_date || '')}">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Marsha Code</span>
                            <span class="detail-value display-value ${!hotel.marsha_code ? 'empty' : ''}">${escapeHtml(hotel.marsha_code) || 'Not specified'}</span>
                            <input type="text" class="edit-input edit-field" data-field="marsha_code" value="${escapeHtml(hotel.marsha_code || '')}">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">STR Code</span>
                            <span class="detail-value display-value ${!hotel.str_code ? 'empty' : ''}">${escapeHtml(hotel.str_code) || 'Not specified'}</span>
                            <input type="text" class="edit-input edit-field" data-field="str_code" value="${escapeHtml(hotel.str_code || '')}">
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">FEIN</span>
                            <span class="detail-value display-value ${!hotel.fein ? 'empty' : ''}">${escapeHtml(hotel.fein) || 'Not specified'}</span>
                            <input type="text" class="edit-input edit-field" data-field="fein" value="${escapeHtml(hotel.fein || '')}">
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column -->
            <div>
                <!-- Room Mix -->
                <div class="detail-section">
                    <h2 class="section-title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M2 4v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8l-6-6H4c-1.1 0-2 .9-2 2z"></path>
                            <path d="M14 2v6h6"></path>
                        </svg>
                        Room Mix
                    </h2>
                    <!-- Display Mode -->
                    <div class="display-value">
                        ${hotel.room_mix && hotel.room_mix.length > 0 ? `
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
                        ` : '<p class="empty">No room mix data</p>'}
                    </div>
                    <!-- Edit Mode -->
                    <div class="edit-field" id="room-mix-edit">
                        <table class="room-mix-table editable-table">
                            <thead>
                                <tr>
                                    <th>Room Type</th>
                                    <th>Count</th>
                                    <th>Sq Ft</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody id="room-mix-tbody">
                                ${(hotel.room_mix || []).map((room, idx) => `
                                    <tr data-index="${idx}">
                                        <td><input type="text" class="edit-input-sm" data-array="room_mix" data-index="${idx}" data-prop="type" value="${escapeHtml(room.type || '')}"></td>
                                        <td><input type="number" class="edit-input-sm" data-array="room_mix" data-index="${idx}" data-prop="count" value="${room.count || ''}"></td>
                                        <td><input type="text" class="edit-input-sm" data-array="room_mix" data-index="${idx}" data-prop="sq_ft" value="${room.sq_ft || ''}"></td>
                                        <td><button type="button" class="remove-row-btn" onclick="removeArrayRow('room_mix', ${idx})">×</button></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        <button type="button" class="add-row-btn" onclick="addRoomMixRow()">+ Add Room Type</button>
                    </div>
                </div>

                <!-- Meeting Rooms -->
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
                    <!-- Display Mode -->
                    <div class="display-value">
                        ${hotel.meeting_rooms && hotel.meeting_rooms.length > 0 ? `
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
                        ` : '<p class="empty">No meeting rooms data</p>'}
                    </div>
                    <!-- Edit Mode -->
                    <div class="edit-field" id="meeting-rooms-edit">
                        <table class="room-mix-table editable-table">
                            <thead>
                                <tr>
                                    <th>Room Name</th>
                                    <th>Sq Ft</th>
                                    <th>Dimensions</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody id="meeting-rooms-tbody">
                                ${(hotel.meeting_rooms || []).map((room, idx) => `
                                    <tr data-index="${idx}">
                                        <td><input type="text" class="edit-input-sm" data-array="meeting_rooms" data-index="${idx}" data-prop="name" value="${escapeHtml(room.name || '')}"></td>
                                        <td><input type="text" class="edit-input-sm" data-array="meeting_rooms" data-index="${idx}" data-prop="sq_ft" value="${room.sq_ft || ''}"></td>
                                        <td><input type="text" class="edit-input-sm" data-array="meeting_rooms" data-index="${idx}" data-prop="dimensions" value="${escapeHtml(room.dimensions || '')}"></td>
                                        <td><button type="button" class="remove-row-btn" onclick="removeArrayRow('meeting_rooms', ${idx})">×</button></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        <button type="button" class="add-row-btn" onclick="addMeetingRoomRow()">+ Add Meeting Room</button>
                    </div>
                </div>

                <!-- Competitive Set -->
                <div class="detail-section">
                    <h2 class="section-title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                            <polyline points="17 6 23 6 23 12"></polyline>
                        </svg>
                        Competitive Set
                    </h2>
                    <!-- Display Mode -->
                    <div class="display-value">
                        ${hotel.competitive_set && hotel.competitive_set.length > 0 ? `
                            <ul class="comp-set-list">
                                ${hotel.competitive_set.map(comp => `<li>${escapeHtml(comp)}</li>`).join('')}
                            </ul>
                        ` : '<p class="empty">No competitive set data</p>'}
                    </div>
                    <!-- Edit Mode -->
                    <div class="edit-field" id="competitive-set-edit">
                        <div id="competitive-set-list">
                            ${(hotel.competitive_set || []).map((comp, idx) => `
                                <div class="comp-set-row" data-index="${idx}">
                                    <input type="text" class="edit-input" data-array="competitive_set" data-index="${idx}" value="${escapeHtml(comp || '')}">
                                    <button type="button" class="remove-row-btn" onclick="removeCompSetRow(${idx})">×</button>
                                </div>
                            `).join('')}
                        </div>
                        <button type="button" class="add-row-btn" onclick="addCompSetRow()">+ Add Competitor</button>
                    </div>
                </div>

                <!-- Features & Amenities -->
                <div class="detail-section">
                    <h2 class="section-title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="9 11 12 14 22 4"></polyline>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                        </svg>
                        Features & Amenities
                    </h2>
                    <div class="text-content display-value ${!hotel.features_amenities ? 'empty' : ''}">${escapeHtml(hotel.features_amenities) || 'Not specified'}</div>
                    <textarea class="edit-textarea edit-field" data-field="features_amenities" rows="4">${escapeHtml(hotel.features_amenities || '')}</textarea>
                </div>
            </div>
        </div>

        <!-- Full Width Sections -->
        <div class="detail-section">
            <h2 class="section-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                </svg>
                Renovations
            </h2>
            <div class="text-content display-value ${!hotel.renovations ? 'empty' : ''}">${escapeHtml(hotel.renovations) || 'Not specified'}</div>
            <textarea class="edit-textarea edit-field" data-field="renovations" rows="4">${escapeHtml(hotel.renovations || '')}</textarea>
        </div>

        <div class="detail-section">
            <h2 class="section-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                Franchise Information
            </h2>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Franchise Brand</span>
                    <span class="detail-value display-value ${!hotel.franchise_brand ? 'empty' : ''}">${escapeHtml(hotel.franchise_brand) || 'Not specified'}</span>
                    <input type="text" class="edit-input edit-field" data-field="franchise_brand" value="${escapeHtml(hotel.franchise_brand || '')}">
                </div>
                <div class="detail-item" style="grid-column: span 2;">
                    <span class="detail-label">Franchise Fees</span>
                    <span class="detail-value display-value ${!hotel.franchise_fees ? 'empty' : ''}">${escapeHtml(hotel.franchise_fees) || 'Not specified'}</span>
                    <textarea class="edit-textarea edit-field" data-field="franchise_fees" rows="2">${escapeHtml(hotel.franchise_fees || '')}</textarea>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h2 class="section-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                Common Area / Retail
            </h2>
            <div class="text-content display-value ${!hotel.common_area_retail ? 'empty' : ''}">${escapeHtml(hotel.common_area_retail) || 'Not specified'}</div>
            <textarea class="edit-textarea edit-field" data-field="common_area_retail" rows="4">${escapeHtml(hotel.common_area_retail || '')}</textarea>
        </div>

        <div class="detail-section">
            <h2 class="section-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
                Lender Information
            </h2>
            <div class="text-content display-value ${!hotel.lender_info ? 'empty' : ''}">${escapeHtml(hotel.lender_info) || 'Not specified'}</div>
            <textarea class="edit-textarea edit-field" data-field="lender_info" rows="4">${escapeHtml(hotel.lender_info || '')}</textarea>
        </div>
    `;

    // Set up edit event handlers if admin
    if (isAdmin) {
        setupEditHandlers();
    }
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

// Set up edit event handlers
function setupEditHandlers() {
    const editBtn = document.getElementById('edit-btn');
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    if (editBtn) {
        editBtn.addEventListener('click', () => toggleEditMode(true));
    }
    if (saveBtn) {
        saveBtn.addEventListener('click', saveHotelData);
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => cancelEdit());
    }
}

// Toggle edit mode
function toggleEditMode(enable) {
    isEditMode = enable;

    const editBtn = document.getElementById('edit-btn');
    const editActions = document.getElementById('edit-actions');
    const displayValues = document.querySelectorAll('.display-value');
    const editFields = document.querySelectorAll('.edit-field');

    if (enable) {
        // Store original data for cancel
        originalData = { ...hotelData };

        // Hide edit button, show save/cancel
        if (editBtn) editBtn.classList.remove('show');
        if (editActions) editActions.classList.add('show');

        // Hide display values, show edit fields
        displayValues.forEach(el => el.style.display = 'none');
        editFields.forEach(el => el.classList.add('show'));
    } else {
        // Show edit button, hide save/cancel
        if (editBtn) editBtn.classList.add('show');
        if (editActions) editActions.classList.remove('show');

        // Show display values, hide edit fields
        displayValues.forEach(el => el.style.display = '');
        editFields.forEach(el => el.classList.remove('show'));
    }
}

// Cancel edit and restore original values
function cancelEdit() {
    // Restore original values to inputs
    const editFields = document.querySelectorAll('.edit-field');
    editFields.forEach(field => {
        const fieldName = field.dataset.field;
        if (fieldName && originalData) {
            field.value = originalData[fieldName] || '';
        }
    });

    toggleEditMode(false);
}

// Save hotel data to database
async function saveHotelData() {
    const saveBtn = document.getElementById('save-btn');
    const editActions = document.getElementById('edit-actions');

    // Show saving state
    saveBtn.disabled = true;
    saveBtn.innerHTML = `
        <span class="saving-indicator">
            <span class="spinner"></span>
            Saving...
        </span>
    `;

    try {
        // Collect all edited values
        const updates = {};
        const editFields = document.querySelectorAll('.edit-field[data-field]');

        editFields.forEach(field => {
            const fieldName = field.dataset.field;
            if (!fieldName) return;

            let value = field.value.trim();

            // Convert number fields
            if (field.type === 'number') {
                value = value === '' ? null : Number(value);
            }

            // Convert empty strings to null
            if (value === '') {
                value = null;
            }

            updates[fieldName] = value;
        });

        // Collect array data (room_mix, meeting_rooms, competitive_set)
        const arrayData = collectArrayData();
        updates.room_mix = arrayData.room_mix.length > 0 ? arrayData.room_mix : null;
        updates.meeting_rooms = arrayData.meeting_rooms.length > 0 ? arrayData.meeting_rooms : null;
        updates.competitive_set = arrayData.competitive_set.length > 0 ? arrayData.competitive_set : null;

        // Update in database
        const { data, error } = await supabase
            .from('hotel_fact_sheets')
            .update(updates)
            .eq('id', hotelData.id)
            .select()
            .single();

        if (error) throw error;

        // Update local data
        hotelData = data;
        document.title = `${data.hotel_name} - Hotel Fact Sheet - Noble`;

        // Re-render the page with updated data
        displayHotelData(data);

        // Show success message briefly
        showSuccessMessage('Changes saved successfully!');

    } catch (error) {
        console.error('Error saving hotel data:', error);
        alert('Error saving changes: ' + error.message);

        // Restore save button
        saveBtn.disabled = false;
        saveBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Save
        `;
    }
}

// Show success message
function showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        ${message}
    `;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Global functions for array editing (need to be on window object)
window.addRoomMixRow = function() {
    const tbody = document.getElementById('room-mix-tbody');
    const idx = tbody.querySelectorAll('tr').length;
    const row = document.createElement('tr');
    row.dataset.index = idx;
    row.innerHTML = `
        <td><input type="text" class="edit-input-sm" data-array="room_mix" data-index="${idx}" data-prop="type" value=""></td>
        <td><input type="number" class="edit-input-sm" data-array="room_mix" data-index="${idx}" data-prop="count" value=""></td>
        <td><input type="text" class="edit-input-sm" data-array="room_mix" data-index="${idx}" data-prop="sq_ft" value=""></td>
        <td><button type="button" class="remove-row-btn" onclick="removeArrayRow('room_mix', ${idx})">×</button></td>
    `;
    tbody.appendChild(row);
};

window.addMeetingRoomRow = function() {
    const tbody = document.getElementById('meeting-rooms-tbody');
    const idx = tbody.querySelectorAll('tr').length;
    const row = document.createElement('tr');
    row.dataset.index = idx;
    row.innerHTML = `
        <td><input type="text" class="edit-input-sm" data-array="meeting_rooms" data-index="${idx}" data-prop="name" value=""></td>
        <td><input type="text" class="edit-input-sm" data-array="meeting_rooms" data-index="${idx}" data-prop="sq_ft" value=""></td>
        <td><input type="text" class="edit-input-sm" data-array="meeting_rooms" data-index="${idx}" data-prop="dimensions" value=""></td>
        <td><button type="button" class="remove-row-btn" onclick="removeArrayRow('meeting_rooms', ${idx})">×</button></td>
    `;
    tbody.appendChild(row);
};

window.addCompSetRow = function() {
    const list = document.getElementById('competitive-set-list');
    const idx = list.querySelectorAll('.comp-set-row').length;
    const row = document.createElement('div');
    row.className = 'comp-set-row';
    row.dataset.index = idx;
    row.innerHTML = `
        <input type="text" class="edit-input" data-array="competitive_set" data-index="${idx}" value="">
        <button type="button" class="remove-row-btn" onclick="removeCompSetRow(${idx})">×</button>
    `;
    list.appendChild(row);
};

window.removeArrayRow = function(arrayName, index) {
    const tbodyId = arrayName === 'room_mix' ? 'room-mix-tbody' : 'meeting-rooms-tbody';
    const tbody = document.getElementById(tbodyId);
    const row = tbody.querySelector(`tr[data-index="${index}"]`);
    if (row) row.remove();
    // Re-index remaining rows
    tbody.querySelectorAll('tr').forEach((tr, newIdx) => {
        tr.dataset.index = newIdx;
        tr.querySelectorAll('input').forEach(input => {
            input.dataset.index = newIdx;
        });
        tr.querySelector('.remove-row-btn').setAttribute('onclick', `removeArrayRow('${arrayName}', ${newIdx})`);
    });
};

window.removeCompSetRow = function(index) {
    const list = document.getElementById('competitive-set-list');
    const row = list.querySelector(`.comp-set-row[data-index="${index}"]`);
    if (row) row.remove();
    // Re-index remaining rows
    list.querySelectorAll('.comp-set-row').forEach((div, newIdx) => {
        div.dataset.index = newIdx;
        div.querySelector('input').dataset.index = newIdx;
        div.querySelector('.remove-row-btn').setAttribute('onclick', `removeCompSetRow(${newIdx})`);
    });
};

// Collect array data from edit forms
function collectArrayData() {
    const data = {
        room_mix: [],
        meeting_rooms: [],
        competitive_set: []
    };

    // Collect room_mix
    const roomMixRows = document.querySelectorAll('#room-mix-tbody tr');
    roomMixRows.forEach(row => {
        const type = row.querySelector('input[data-prop="type"]')?.value.trim();
        const count = row.querySelector('input[data-prop="count"]')?.value;
        const sq_ft = row.querySelector('input[data-prop="sq_ft"]')?.value.trim();
        if (type || count) {
            data.room_mix.push({
                type: type || '',
                count: count ? parseInt(count) : 0,
                sq_ft: sq_ft || ''
            });
        }
    });

    // Collect meeting_rooms
    const meetingRows = document.querySelectorAll('#meeting-rooms-tbody tr');
    meetingRows.forEach(row => {
        const name = row.querySelector('input[data-prop="name"]')?.value.trim();
        const sq_ft = row.querySelector('input[data-prop="sq_ft"]')?.value.trim();
        const dimensions = row.querySelector('input[data-prop="dimensions"]')?.value.trim();
        if (name || sq_ft || dimensions) {
            data.meeting_rooms.push({
                name: name || '',
                sq_ft: sq_ft || '',
                dimensions: dimensions || ''
            });
        }
    });

    // Collect competitive_set
    const compSetRows = document.querySelectorAll('#competitive-set-list .comp-set-row input');
    compSetRows.forEach(input => {
        const value = input.value.trim();
        if (value) {
            data.competitive_set.push(value);
        }
    });

    return data;
}
