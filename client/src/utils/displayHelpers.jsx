// client/src/utils/displayHelpers.jsx

// Helper to format dates (same as in MyProjectsPage)
export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric', /* hour: '2-digit', minute: '2-digit' */ // Add time if needed
        });
    } catch (e) {
        return 'Invalid Date';
    }
};

// Helper to format currency values
export const formatCurrency = (value) => {
    if (value === undefined || value === null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
};

// Helper to format numbers with commas
export const formatNumber = (value) => {
    if (value === undefined || value === null) return '0';
    return new Intl.NumberFormat('en-US').format(value);
};

// Helper to display relative time (e.g., "2 hours ago")
export const timeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return 'just now';
        }

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
        }

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        }

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) {
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        }

        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) {
            return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
        }

        const diffInYears = Math.floor(diffInMonths / 12);
        return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
    } catch (e) {
        return 'Invalid Date';
    }
};

// Helper to display status badges (same as in MyProjectsPage, but add bid statuses)
export const StatusBadge = ({ status }) => {
    let bgColor = 'bg-gray-200'; // Default background
    let textColor = 'text-gray-800'; // Default text color

    switch (status.toLowerCase()) {
        // Project Statuses
        case 'open': bgColor = 'bg-blue-100'; textColor = 'text-blue-800'; break;
        case 'in_progress': bgColor = 'bg-yellow-100'; textColor = 'text-yellow-800'; break;
        case 'pending_selection': bgColor = 'bg-purple-100'; textColor = 'text-purple-800'; break;
        case 'completed': bgColor = 'bg-green-100'; textColor = 'text-green-800'; break;
        case 'cancelled': case 'disputed': bgColor = 'bg-red-100'; textColor = 'text-red-800'; break;

        // Bid Statuses
        case 'pending': bgColor = 'bg-gray-100'; textColor = 'text-gray-800'; break;
        case 'accepted': case 'counter_accepted': bgColor = 'bg-green-100'; textColor = 'text-green-800'; break;
        case 'rejected': case 'withdrawn': case 'counter_rejected': bgColor = 'bg-red-100'; textColor = 'text-red-800'; break;
        case 'counter_offered': bgColor = 'bg-blue-100'; textColor = 'text-blue-800'; break; // Added for counter_offered

        default:
            // Keep default colors or handle unknown status
            break;
    }

    return (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
            {status.replace(/_/g, ' ')}
        </span>
    );
};