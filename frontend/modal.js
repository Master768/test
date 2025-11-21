// Custom Modal System for Secret Santa
// Festive, beautiful modals to replace browser alerts

function showModal(options) {
    const {
        type = 'info',           // 'success', 'error', 'warning', 'info', 'confirm'
        title = 'Notification',
        message = '',
        confirmText = 'OK',
        cancelText = 'Cancel',
        onConfirm = null,
        onCancel = null,
        onClose = null,
        autoClose = false,
        autoCloseDelay = 3000
    } = options;

    // Remove any existing modals
    const existing = document.querySelectorAll('.festive-modal-overlay');
    existing.forEach(el => el.remove());

    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'festive-modal-overlay';

    // Create modal container
    const modal = document.createElement('div');
    modal.className = `festive-modal festive-modal-${type}`;

    // Get icon based on type
    const icons = {
        success: '🎁',
        error: '🎅',
        warning: '⚠️',
        info: '❄️',
        confirm: '🤔'
    };

    const icon = icons[type] || '🎄';

    // Build modal content
    modal.innerHTML = `
        <div class="festive-modal-header">
            <div class="festive-modal-icon">${icon}</div>
            <h3 class="festive-modal-title">${title}</h3>
        </div>
        <div class="festive-modal-body">
            <p class="festive-modal-message">${message}</p>
        </div>
        <div class="festive-modal-footer">
            ${type === 'confirm'
            ? `<button class="festive-btn festive-btn-cancel" id="modal-cancel">${cancelText}</button>
                   <button class="festive-btn festive-btn-confirm" id="modal-confirm">${confirmText}</button>`
            : `<button class="festive-btn festive-btn-primary" id="modal-ok">${confirmText}</button>`
        }
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Trigger entrance animation
    setTimeout(() => {
        overlay.classList.add('active');
        modal.classList.add('active');
    }, 10);

    // Function to close modal
    const closeModal = (callback) => {
        overlay.classList.remove('active');
        modal.classList.remove('active');
        setTimeout(() => {
            overlay.remove();
            if (callback) callback();
            if (onClose) onClose();
        }, 300);
    };

    // Event listeners
    if (type === 'confirm') {
        const confirmBtn = modal.querySelector('#modal-confirm');
        const cancelBtn = modal.querySelector('#modal-cancel');

        confirmBtn.addEventListener('click', () => {
            closeModal(onConfirm);
        });

        cancelBtn.addEventListener('click', () => {
            closeModal(onCancel);
        });
    } else {
        const okBtn = modal.querySelector('#modal-ok');
        okBtn.addEventListener('click', () => {
            closeModal(onConfirm);
        });
    }

    // Close on backdrop click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeModal(onCancel || onClose);
        }
    });

    // Close on ESC key
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal(onCancel || onClose);
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);

    // Auto close for non-confirm modals
    if (autoClose && type !== 'confirm') {
        setTimeout(() => {
            closeModal();
        }, autoCloseDelay);
    }
}

// Convenience functions
function showSuccessModal(title, message, onClose) {
    showModal({
        type: 'success',
        title: title || '🎉 Success!',
        message,
        onClose,
        autoClose: true
    });
}

function showErrorModal(title, message, onClose) {
    showModal({
        type: 'error',
        title: title || '🎅 Oops!',
        message,
        onClose
    });
}

function showInfoModal(title, message, onClose) {
    showModal({
        type: 'info',
        title: title || '❄️ Info',
        message,
        onClose
    });
}

function showConfirmModal(title, message, onConfirm, onCancel) {
    showModal({
        type: 'confirm',
        title: title || '🤔 Confirm',
        message,
        confirmText: 'Yes',
        cancelText: 'No',
        onConfirm,
        onCancel
    });
}

// Add modal styles
const modalStyles = document.createElement('style');
modalStyles.textContent = `
    .festive-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(8px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
        padding: 20px;
    }
    
    .festive-modal-overlay.active {
        opacity: 1;
    }
    
    .festive-modal {
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        border-radius: 24px;
        max-width: 480px;
        width: 100%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4),
                    0 0 0 1px rgba(255, 255, 255, 0.1);
        transform: scale(0.7) translateY(-50px);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        overflow: hidden;
        position: relative;
    }
    
    .festive-modal.active {
        transform: scale(1) translateY(0);
        opacity: 1;
    }
    
    /* Festive border decoration */
    .festive-modal::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: repeating-linear-gradient(
            90deg,
            #dc2626 0px,
            #dc2626 20px,
            #16a34a 20px,
            #16a34a 40px,
            #eab308 40px,
            #eab308 60px
        );
        animation: lights-slide 2s linear infinite;
    }
    
    @keyframes lights-slide {
        0% { background-position: 0px; }
        100% { background-position: 60px; }
    }
    
    .festive-modal-header {
        padding: 32px 32px 16px;
        text-align: center;
    }
    
    .festive-modal-icon {
        font-size: 64px;
        margin-bottom: 16px;
        animation: icon-bounce 0.6s ease;
        display: inline-block;
    }
    
    @keyframes icon-bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
    }
    
    .festive-modal-title {
        font-size: 24px;
        font-weight: 700;
        color: #1f2937;
        margin: 0;
    }
    
    .festive-modal-body {
        padding: 0 32px 24px;
    }
    
    .festive-modal-message {
        font-size: 16px;
        line-height: 1.6;
        color: #4b5563;
        text-align: center;
        margin: 0;
    }
    
    .festive-modal-footer {
        padding: 0 32px 32px;
        display: flex;
        gap: 12px;
        justify-content: center;
    }
    
    .festive-btn {
        padding: 12px 32px;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .festive-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    }
    
    .festive-btn:active {
        transform: translateY(0);
    }
    
    .festive-btn-primary {
        background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
        color: white;
    }
    
    .festive-btn-confirm {
        background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
        color: white;
    }
    
    .festive-btn-cancel {
        background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
        color: white;
    }
    
    /* Type-specific styling */
    .festive-modal-success .festive-modal-icon {
        animation: icon-bounce 0.6s ease, gift-shake 0.5s ease 0.3s;
    }
    
    @keyframes gift-shake {
        0%, 100% { transform: rotate(0deg); }
        25% { transform: rotate(-10deg); }
        75% { transform: rotate(10deg); }
    }
    
    .festive-modal-error .festive-modal-icon {
        animation: icon-bounce 0.6s ease, santa-sad 0.8s ease;
    }
    
    @keyframes santa-sad {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
    
    .festive-modal-warning .festive-modal-icon {
        animation: icon-bounce 0.6s ease, warning-pulse 1s ease infinite;
    }
    
    @keyframes warning-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
    }
    
    .festive-modal-info .festive-modal-icon {
        animation: icon-bounce 0.6s ease, snowflake-spin 2s linear infinite;
    }
    
    @keyframes snowflake-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    /* Mobile responsive */
    @media (max-width: 640px) {
        .festive-modal {
            max-width: 90%;
        }
        
        .festive-modal-icon {
            font-size: 48px;
        }
        
        .festive-modal-title {
            font-size: 20px;
        }
        
        .festive-modal-message {
            font-size: 14px;
        }
        
        .festive-modal-footer {
            flex-direction: column;
        }
        
        .festive-btn {
            width: 100%;
        }
    }
`;
document.head.appendChild(modalStyles);
