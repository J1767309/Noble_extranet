import { supabase } from './supabase-config.js';

// BI Tools data
const biTools = [
    {
        number: 1,
        name: "Weekly Forecast Sheet (Yellow sheet)",
        description: "This report presents a weekly comparison of production metrics for hotels against multiple benchmarks: the Noble Budget, the forecast for the current month, the operational summary, the manager's budget, and the previous year's data",
        frequency: "Weekly",
        location: "Noble Dropbox/Monthly Forecasts",
        link: null
    },
    {
        number: 2,
        name: "Monthly forecast (Blue sheet)",
        description: "This report provides a monthly analysis of hotel production metrics, juxtaposing actual figures with various benchmarks: the Noble Budget, the manager's budget, the previous operational summary, the current operational summary, and the forecast for the respective months.",
        frequency: "Monthly",
        location: "Noble Dropbox/Monthly Forecasts",
        link: null
    },
    {
        number: 3,
        name: "Email Report (In the Monthly Forecast)",
        description: "The report provides a detailed summary for each hotel, covering the most recent month and year-to-date (YTD) performance, comparing actual results against the manager's budget, the Noble budget, and the previous year's figures. It highlights management issues in revenue and expenses and includes the most current Guest Satisfaction Survey (GSS) results.",
        frequency: "Monthly",
        location: "Tab in Noble Dropbox/Monthly Forecasts",
        link: null
    },
    {
        number: 4,
        name: "Ops report",
        description: "This report delivers an in-depth analysis of key performance indicators (KPIs) for each hotel, comparing the actuals from the past three years against current year budget and the forecasts for selected months. It quantifies the KPIs relative to the 2019 metrics, represented as a percentage. To further highlight performance discrepancies between the most recent operational summary and the last summary that was published and the variances budget",
        frequency: "Monthly",
        location: "Noble Dropbox/Monthly Forecasts",
        link: null
    },
    {
        number: 5,
        name: "Ops memo",
        description: "This report presents an overview of the U.S. market's current performance, updates on ongoing renovations across our hotel portfolio, and examination of portfolio-wide trends concerning Revenue per Available Room (RevPAR), Average Daily Rate (ADR), and Occupancy rates. Additionally, it examines market-specific factors influencing individual hotel forecasts and concludes with the latest forecasts from CBRE and LARC.",
        frequency: "Monthly",
        location: "Noble Dropbox/Monthly Forecasts",
        link: null
    },
    {
        number: 6,
        name: "Monthly Stats report",
        description: "The 'Monthly Hotel Statistics Report' provides a comprehensive performance review of the Noble Total Portfolio, revealing key financial metrics and market trends. It compares current ADR, RevPAR, and occupancy rates against past years and budget forecasts, noting a steady recovery yet challenges in achieving budget targets. The report concludes with a summary of revised growth forecasts from CBRE and LARC for the U.S. market",
        frequency: "Monthly",
        location: "Noble Dropbox/Asset Management Team Folder/Monthly Report Package",
        link: null
    },
    {
        number: 7,
        name: "Tableau",
        description: "• STR\n• Channel Contribution Report\n• Gov Per Diem\n• Hyatt Report: Koddi\n• Hilton Reports: Hilton Koddi, Hilton Loyalty Report\n• Labor Survey\n• Market Forecasts\n• Marriott Report: Loyalty Report, Koddi Marriott Report, Traffic Source Report\n• Travelads Report",
        frequency: "Monthly",
        location: "Link (URL to be added)",
        link: null
    },
    {
        number: 8,
        name: "Marriott M-Dash: Topline Activators Report",
        description: "A business intelligence tool that uses data visualization and dynamic reporting capabilities to consolidate Foundational/Critical Business Metrics into one place. It has the ability to drill down, dynamically filter, and compare portfolio level data in multiple avenues of reporting including web and mobile. The currently platform utilizes, Microsoft PowerBI that requires authentication through Microsoft via your Marriott EID. If you are currently signed in to Microsoft via your Noble account you will either need to sign out, or use a different web browser to access the platform",
        frequency: "Daily",
        location: "Link (URL to be added)",
        link: null
    },
    {
        number: 9,
        name: "Hilton Owners Engagement Report",
        description: "The Enterprise Engagement Snapshot visualizes key metrics (Commercial, Operational, and Initiative) for your portfolio of hotels in YTD, 6-month or 3-month increments.",
        frequency: "Monthly",
        location: "Link (URL to be added)",
        link: null
    },
    {
        number: 10,
        name: "Demand360",
        description: "The platform provides demand data by channel and segmentation for both historical and future time frames.",
        frequency: "Daily",
        location: "Link (URL to be added)",
        link: null
    },
    {
        number: 11,
        name: "Noble Power BI",
        description: "The platform provides a detailed expense analysis platform for each Noble hotels.",
        frequency: "Monthly",
        location: "Link (URL to be added)",
        link: null
    },
    {
        number: 12,
        name: "Light House Report",
        description: "The platform offers detailed insights into each hotel's performance by segment and includes access to forecasts from the system, the Revenue Management System (RMS), and inputs from the user",
        frequency: "Daily",
        location: "Link (URL to be added)",
        link: null
    },
    {
        number: 13,
        name: "Hotel Initiatives Document",
        description: "Asset manager documents, the hotels, expense, and revenue initiatives",
        frequency: "Monthly",
        location: "Asset Management Team Folder/Hotels/Initiatives",
        link: null
    },
    {
        number: 15,
        name: "eCommerce Matrix",
        description: "This report outlines the key e-commerce strategies recommended for each property, indicating the level of engagement by individual hotels in the specified tactics. It emphasizes that not every tactic is actively pursued; instead, participation is aligned with each property's strategic goals and initiatives",
        frequency: "Monthly",
        location: "Asset Management Team Folder/E-Commerce and Revenue Management",
        link: null
    },
    {
        number: 16,
        name: "OneNote",
        description: "Each one note, notebook contains detailed notes by each asset manager, as it pertains to each of their hotels",
        frequency: "Monthly",
        location: "• Steven\n• Lisa\n• Denise\n• Jody\n• Michael",
        link: null
    }
];

let allTools = [...biTools];

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
        alert('Access denied. Business Intelligence Tools are only available to internal users.');
        window.location.href = 'dashboard.html';
        return;
    }

    // Show user management link if admin
    if (userData.role === 'admin') {
        document.getElementById('user-management-link').style.display = 'flex';
    }

    document.getElementById('user-email').textContent = session.user.email;
    displayTools(allTools);
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

// Display tools in table
function displayTools(tools) {
    const tbody = document.getElementById('tools-table-body');
    tbody.innerHTML = '';

    if (tools.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 3rem; color: #6b7280;">No tools found</td></tr>';
        return;
    }

    tools.forEach(tool => {
        const tr = document.createElement('tr');

        // Frequency badge
        let frequencyClass = 'frequency-monthly';
        if (tool.frequency === 'Daily') frequencyClass = 'frequency-daily';
        else if (tool.frequency === 'Weekly') frequencyClass = 'frequency-weekly';

        const frequencyBadge = `<span class="frequency-badge ${frequencyClass}">${tool.frequency}</span>`;

        // Location/Link
        let locationHtml = '';
        if (tool.link) {
            locationHtml = `<a href="${tool.link}" target="_blank" rel="noopener noreferrer">
                ${tool.location}
                <svg class="link-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
            </a>`;
        } else {
            locationHtml = tool.location.replace(/\n/g, '<br>');
        }

        tr.innerHTML = `
            <td class="tool-number">${tool.number}</td>
            <td class="tool-name">${tool.name}</td>
            <td class="tool-description">${tool.description.replace(/\n/g, '<br>')}</td>
            <td class="tool-frequency">${frequencyBadge}</td>
            <td class="tool-link">${locationHtml}</td>
        `;

        tbody.appendChild(tr);
    });
}

// Search functionality
document.getElementById('search-input').addEventListener('input', (e) => {
    const searchQuery = e.target.value.toLowerCase();

    if (!searchQuery) {
        displayTools(allTools);
        return;
    }

    const filtered = allTools.filter(tool => {
        const name = tool.name.toLowerCase();
        const description = tool.description.toLowerCase();
        return name.includes(searchQuery) || description.includes(searchQuery);
    });

    displayTools(filtered);
});
