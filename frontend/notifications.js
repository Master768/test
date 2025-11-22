// Enhanced notification system with festive styling
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');

    // Different styles for different types
    const styles = {
        error: {
            gradient: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
            icon: '❌',
            iconClass: 'animate-shake'
        },
        success: {
            gradient: 'linear-gradient(135deg, #dc2626 0%, #16a34a 100%)', // Christmas red to green
            icon: '🎁',
            iconClass: 'animate-bounce-slow'
        },
        warning: {
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            icon: '⚠️',
            iconClass: 'animate-pulse'
        },
        info: {
            gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            icon: 'ℹ️',
            iconClass: 'animate-pulse'
        }
    };

    const style = styles[type] || styles.info;

    notification.className = 'notification-toast';
    notification.style.background = style.gradient;

    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon ${style.iconClass}">${style.icon}</div>
            <div class="notification-message">${message}</div>
            <button onclick="this.parentElement.parentElement.remove()" class="notification-close">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
        </div>
    `;

    document.body.appendChild(notification);
    lucide.createIcons();

    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS for enhanced animations and styling
const style = document.createElement('style');
style.textContent = `
    .notification-toast {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
        border-radius: 16px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 
                    0 10px 10px -5px rgba(0, 0, 0, 0.2),
                    0 0 0 1px rgba(255, 255, 255, 0.1);
        transform: translateX(450px);
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
    
    .notification-toast.show {
        transform: translateX(0);
        opacity: 1;
    }
    
    .notification-content {
        padding: 16px 20px;
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .notification-icon {
        font-size: 28px;
        flex-shrink: 0;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }
    
    .notification-message {
        flex: 1;
        color: white;
        font-weight: 600;
        font-size: 14px;
        line-height: 1.5;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
    
    .notification-close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        cursor: pointer;
        border-radius: 8px;
        padding: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        flex-shrink: 0;
    }
    
    .notification-close:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
    }
    
    @keyframes bounce-slow {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    .animate-bounce-slow {
        animation: bounce-slow 1s ease-in-out infinite;
    }
    
    .animate-shake {
        animation: shake 0.5s ease-in-out;
    }
    
    .animate-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }
    
    /* Mobile responsive */
    @media (max-width: 640px) {
        .notification-toast {
            right: 10px;
            left: 10px;
            max-width: none;
            transform: translateY(-100px);
        }
        
        .notification-toast.show {
            transform: translateY(0);
        }
        
        .notification-content {
            padding: 14px 16px;
        }
        
        .notification-icon {
            font-size: 24px;
        }
        
        .notification-message {
            font-size: 13px;
        }
    }
`;
document.head.appendChild(style);
