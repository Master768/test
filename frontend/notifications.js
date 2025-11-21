// Simple notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 glass p-4 rounded-lg shadow-lg max-w-sm animate-slide-in flex items-start gap-3`;

    const icons = {
        error: '<i data-lucide="alert-circle" class="w-5 h-5 text-red-400 flex-shrink-0"></i>',
        success: '<i data-lucide="check-circle" class="w-5 h-5 text-green-400 flex-shrink-0"></i>',
        warning: '<i data-lucide="alert-triangle" class="w-5 h-5 text-yellow-400 flex-shrink-0"></i>',
        info: '<i data-lucide="info" class="w-5 h-5 text-blue-400 flex-shrink-0"></i>'
    };

    notification.innerHTML = `
        ${icons[type] || icons.info}
        <div class="flex-1 text-sm">${message}</div>
        <button onclick="this.parentElement.remove()" class="text-gray-400 hover:text-white">
            <i data-lucide="x" class="w-4 h-4"></i>
        </button>
    `;

    document.body.appendChild(notification);
    lucide.createIcons();

    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Add CSS for animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slide-in {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-in {
        animation: slide-in 0.3s ease-out;
    }
`;
document.head.appendChild(style);
