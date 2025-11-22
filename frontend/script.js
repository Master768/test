// State
let currentUser = null;
let currentRoom = null;
let ws = null;
let pollInterval = null;
let participantsExpanded = false;

// Emoji list
const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '🥹', '☺️', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🫣', '🤭', '🫢', '🫡', '🤫', '🫠', '🤥', '😶', '🫥', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '😵‍💫', '🫨', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾',
    '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦵', '🦿', '🦶', '👣', '👂', '🦻', '👃', '🫀', '🫁', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸',
    '🎅', '🤶', '🧑‍🎄', '🧚', '🧚‍♂️', '🧚‍♀️', '🧞', '🧞‍♂️', '🧞‍♀️', '🧛', '🧛‍♂️', '🧛‍♀️', '🧜', '🧜‍♂️', '🧜‍♀️', '🧝', '🧝‍♂️', '🧝‍♀️', '🧟', '🧟‍♂️', '🧟‍♀️', '🧙', '🧙‍♂️', '🧙‍♀️',
    '🎄', '🎁', '🎀', '🎊', '🎉', '🕯️', '🔔', '🔕', '🎼', '🎵', '🎶', '🌟', '⭐️', '✨', '⚡️', '☄️', '💥', '🔥', '🌪️', '🌈', '☀️', '🌤️', '⛅️', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄️', '🌬️', '💨', '💧', '💦', '🫧', '☔️', '☂️', '🌊',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈️', '♉️', '♊️', '♋️', '♌️', '♍️', '♎️', '♏️', '♐️', '♑️', '♒️', '♓️', '🆔', '⚛️',
    '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💣', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤'
];

// Icons
lucide.createIcons();

// ... (rest of file)

// URL Parameter Detection - Auto-join from shareable link
// URL Parameter Detection - Auto-join from shareable link & Session Restoration
// URL Parameter Detection - Auto-join from shareable link & Session Restoration
window.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get('room');

    // Check for existing session
    const session = localStorage.getItem('secret_santa_session');

    if (session) {
        try {
            const { roomCode: savedCode, user } = JSON.parse(session);

            // Only restore if it's a host session
            if (user && user.is_host) {
                // Verify session is still valid
                const room = await apiCall(`/rooms/${savedCode}`);
                // Check if this user is still the host
                const host = room.participants.find(p => p.id === user.id && p.is_host);

                if (host) {
                    currentUser = host;
                    currentRoom = room;
                    enterLobby();
                    return; // Skip auto-join if session restored
                } else {
                    // Session invalid (room gone or not host anymore)
                    localStorage.removeItem('secret_santa_session');
                }
            } else {
                // If we have a session but it's not a host (shouldn't happen with new logic, but for cleanup)
                localStorage.removeItem('secret_santa_session');
            }
        } catch (e) {
            console.log("Session invalid or expired");
            localStorage.removeItem('secret_santa_session');
        }
    }

    if (roomCode) {
        // Auto-fill room code and show join view
        const joinCodeInput = document.getElementById('join-code');
        if (joinCodeInput) {
            joinCodeInput.value = roomCode.toUpperCase();
            showView('join');
        }
    }
});

// Gracefully close WebSocket when user leaves or refreshes the page
window.addEventListener('beforeunload', () => {
    if (ws) {
        ws.close();
    }
});

function saveSession(room, user) {
    // ONLY save session if the user is the host
    if (user.is_host) {
        localStorage.setItem('secret_santa_session', JSON.stringify({
            roomCode: room.code,
            user: user
        }));
    }
}

function clearSession() {
    localStorage.removeItem('secret_santa_session');
}

// Snow Effect
function createSnow() {
    const container = document.getElementById('snow-container');
    if (!container) return;
    for (let i = 0; i < 50; i++) {
        const flake = document.createElement('div');
        flake.className = 'snowflake';
        flake.innerHTML = '❄';
        flake.style.left = Math.random() * 100 + 'vw';
        flake.style.animationDuration = (Math.random() * 5 + 5) + 's';
        flake.style.opacity = Math.random();
        flake.style.fontSize = (Math.random() * 10 + 10) + 'px';
        container.appendChild(flake);
    }
}
createSnow();

// Countdown Animation
async function showCountdown() {
    const overlay = document.getElementById('countdown-overlay');
    const number = document.getElementById('countdown-number');

    overlay.classList.remove('hidden');

    for (let i = 5; i >= 1; i--) {
        number.textContent = i;
        number.style.animation = 'none';
        setTimeout(() => { number.style.animation = 'countdown-pulse 1s ease-in-out'; }, 10);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    number.textContent = '🎉';
    await new Promise(resolve => setTimeout(resolve, 1000));

    overlay.classList.add('hidden');
}

// Poll functions removed

// Emoji Picker
function toggleEmojiPicker(type) {
    const picker = document.getElementById(`emoji-picker-${type}`);
    if (!picker) return;

    if (picker.classList.contains('hidden')) {
        if (!picker.innerHTML) {
            picker.innerHTML = emojis.map(emoji =>
                `<button type="button" class="emoji-btn" onclick="insertEmoji('${emoji}', '${type}')">${emoji}</button>`
            ).join('');
        }
        picker.classList.remove('hidden');
    } else {
        picker.classList.add('hidden');
    }
}

function insertEmoji(emoji, type) {
    const input = document.getElementById(`chat-input${type === 'mobile' ? '-mobile' : ''}`);
    if (input) {
        input.value += emoji;
        input.focus();
    }
    toggleEmojiPicker(type);
}

// Navigation
function showView(viewId) {
    ['home', 'create', 'join', 'lobby'].forEach(id => {
        const el = document.getElementById(`view-${id}`);
        if (el) el.classList.add('hidden');
    });

    // Clear session if going home
    if (viewId === 'home') {
        clearSession();
        currentUser = null;
        currentRoom = null;

        // Clear URL param
        const url = new URL(window.location);
        url.searchParams.delete('room');
        window.history.pushState({}, '', url);
    }

    const target = document.getElementById(`view-${viewId}`);
    if (target) target.classList.remove('hidden');

    if (viewId !== 'lobby') {
        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
        }
        if (ws) {
            ws.close();
            ws = null;
        }
    }
}

// API Helpers
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';
const API_BASE = isLocal
    ? 'http://localhost:8000'
    : window.location.origin; // Automatically uses the current domain

const API_URL = `${API_BASE}/api`;

async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);

    try {
        const res = await fetch(`${API_URL}${endpoint}`, options);
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'API Error');
        return data;
    } catch (e) {
        console.error("API Call Failed:", e);
        throw e;
    }
}

// Helper Functions
function updateParticipantsList(participants) {
    const list = document.getElementById('participants-list');
    const count = document.getElementById('participant-count');
    const toggleBtn = document.getElementById('toggle-participants-btn');

    if (count) count.innerText = participants.length;
    if (!list) return;

    const isHost = currentUser && currentUser.is_host;
    const gameStarted = currentRoom && currentRoom.is_started;

    const limit = participantsExpanded ? participants.length : Math.min(5, participants.length);
    const displayParticipants = participants.slice(0, limit);

    if (toggleBtn) {
        if (participants.length > 5) {
            toggleBtn.classList.remove('hidden');
            toggleBtn.innerText = participantsExpanded ? 'Show Less' : `Show All (${participants.length})`;
        } else {
            toggleBtn.classList.add('hidden');
        }
    }

    list.innerHTML = displayParticipants.map(p => `
        <div class="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
            <div class="w-8 h-8 bg-gradient-to-br from-red-500 to-green-500 rounded-full flex items-center justify-center font-bold text-sm text-white">
                ${p.name[0].toUpperCase()}
            </div>
            <div class="flex-1">
                <div class="font-semibold text-gray-800 ${p.id === currentUser.id ? 'text-red-600' : ''}">${p.name} ${p.id === currentUser.id ? '(You)' : ''}</div>
                ${p.is_host ? '<div class="text-xs text-red-500">Host</div>' : ''}
            </div>
            ${isHost && !gameStarted && !p.is_host ? `
                <button onclick="removeParticipant('${p.id}')" class="text-red-500 hover:text-red-600" title="Remove participant">
                    <i data-lucide="x-circle" class="w-5 h-5"></i>
                </button>
            ` : ''}
        </div>
    `).join('');

    lucide.createIcons();
}

function toggleParticipantsList() {
    participantsExpanded = !participantsExpanded;
    updateParticipantsList(currentRoom.participants);
}

function removeParticipant(participantId) {
    if (!currentRoom || !currentUser.is_host) return;

    showConfirmModal(
        'Remove Participant?',
        'Are you sure you want to remove this participant?',
        async () => {
            try {
                await apiCall(`/rooms/${currentRoom.code}/participants/${participantId}`, 'DELETE');
                await pollRoomState();
                if (typeof showNotification !== 'undefined') {
                    showNotification("Participant removed successfully", "success");
                }
            } catch (e) {
                showErrorModal('Removal Failed', "Failed to remove participant: " + e.message);
            }
        },
        null,
        { confirmText: 'Remove', isDestructive: true }
    );
}

function updateGameState(participants, isStarted) {
    if (!isStarted) return;

    const me = participants.find(p => p.name === currentUser.name);
    if (me && me.giftee_id) {
        const giftee = participants.find(p => p.id === me.giftee_id);
        if (giftee) {
            const gameArea = document.getElementById('game-area');
            const startBtn = document.getElementById('start-btn');
            const waitMsg = document.getElementById('waiting-msg');
            const matchName = document.getElementById('match-name');
            const matchPref = document.getElementById('match-pref');
            const matchSecret = document.getElementById('match-secret');

            if (gameArea) gameArea.classList.remove('hidden');
            if (startBtn) startBtn.classList.add('hidden');
            if (waitMsg) {
                waitMsg.innerText = "Game Started! Check your match above.";
                waitMsg.classList.remove('hidden');
            }
            if (matchName) matchName.innerText = giftee.name;
            if (matchPref) matchPref.innerText = giftee.preferences || "No preferences provided.";
            if (matchSecret) matchSecret.innerText = giftee.secret_message || "No secret message.";
        }
    }
}

async function pollRoomState() {
    if (!currentRoom) return;
    try {
        const room = await apiCall(`/rooms/${currentRoom.code}`);
        currentRoom = room;
        updateParticipantsList(room.participants);
        updateGameState(room.participants, room.is_started);
    } catch (e) {
        if (e.message.includes("not found")) {
            alert("Room has been closed by the host.");
            window.location.reload();
        }
    }
}

// WebSocket Chat
function addChatMessage(data) {
    const chatDesktop = document.getElementById('chat-messages');
    const chatMobile = document.getElementById('chat-messages-mobile');

    const isSystem = data.type === 'system' || data.type === 'participant_removed';
    const isMe = data.sender === currentUser.name;

    const div = document.createElement('div');
    if (isSystem) {
        div.className = 'text-center text-xs text-gray-500 my-2 italic';
        div.innerText = data.message;
    } else {
        div.className = `flex ${isMe ? 'justify-end' : 'justify-start'}`;
        div.innerHTML = `
            <div class="${isMe ? 'chat-bubble-sent' : 'chat-bubble-received'} px-3 py-2 max-w-[75%] shadow-sm">
                ${!isMe ? `<div class="text-xs font-semibold text-gray-600 mb-1">${data.sender}</div>` : ''}
                <div class="text-sm text-gray-800">${data.message}</div>
            </div>
        `;
    }

    if (chatDesktop) {
        chatDesktop.appendChild(div.cloneNode(true));
        chatDesktop.scrollTop = chatDesktop.scrollHeight;
    }
    if (chatMobile) {
        chatMobile.appendChild(div);
        chatMobile.scrollTop = chatMobile.scrollHeight;
    }
}

function addPollToChat(poll) {
    const chatDesktop = document.getElementById('chat-messages');
    const chatMobile = document.getElementById('chat-messages-mobile');

    const pollHtml = renderPoll(poll);

    if (chatDesktop) {
        chatDesktop.innerHTML += pollHtml;
        chatDesktop.scrollTop = chatDesktop.scrollHeight;
    }
    if (chatMobile) {
        chatMobile.innerHTML += pollHtml;
        chatMobile.scrollTop = chatMobile.scrollHeight;
    }
}

function updatePollInChat(poll) {
    // Find and update existing poll
    const pollContainers = document.querySelectorAll('.poll-container');
    pollContainers.forEach(container => {
        if (container.innerHTML.includes(poll.question)) {
            container.outerHTML = renderPoll(poll);
        }
    });
}

function connectWebSocket() {
    if (ws) ws.close();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = API_BASE ? API_BASE.replace(/^https?:\/\//, '') : window.location.host;
    const wsUrl = `${protocol}//${host}/ws/${currentRoom.code}/${currentUser.name}/${currentUser.id}`;

    ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        // Handle countdown start
        if (data.type === 'countdown_start') {
            showCountdown();
            return;
        }

        // Handle participant removal
        if (data.type === 'participant_removed') {
            if (data.removed_id === currentUser.id) {
                alert("You have been removed from the room by the host.");
                window.location.reload();
                return;
            }
            // Refresh participants list for host and show system message
            pollRoomState();
        }

        // Handle poll creation
        if (data.type === 'poll_created') {
            addPollToChat(data.poll);
            return;
        }

        // Handle poll vote
        if (data.type === 'poll_voted') {
            updatePollInChat(data.poll);
            return;
        }

        addChatMessage(data);
    };

    ws.onclose = () => {
        console.log("WebSocket disconnected");
    };

    ws.onerror = (err) => {
        console.error("WebSocket error:", err);
    };
}

function sendMessage(e) {
    e.preventDefault();
    const inputDesktop = document.getElementById('chat-input');
    const inputMobile = document.getElementById('chat-input-mobile');

    const msg = (inputDesktop?.value || inputMobile?.value || '').trim();
    if (!msg || !ws) return;

    // Include sender name for proper display on all clients
    ws.send(JSON.stringify({ message: msg, sender: currentUser.name }));
    if (inputDesktop) inputDesktop.value = '';
    if (inputMobile) inputMobile.value = '';
}

// Lobby Logic
function enterLobby() {
    const startBtn = document.getElementById('start-btn');
    const closeBtn = document.getElementById('close-room-btn');
    const waitMsg = document.getElementById('waiting-msg');
    const pollBtnDesktop = document.getElementById('create-poll-btn-desktop');
    const pollBtnMobile = document.getElementById('create-poll-btn-mobile');

    if (startBtn) startBtn.classList.remove('hidden');
    if (closeBtn) closeBtn.classList.remove('hidden');
    if (waitMsg) waitMsg.classList.add('hidden');
    if (pollBtnDesktop) pollBtnDesktop.classList.remove('hidden');
    if (pollBtnMobile) pollBtnMobile.classList.remove('hidden');

    // Show lobby view
    showView('lobby');

    // Initial Update
    participantsExpanded = false;
    updateParticipantsList(currentRoom.participants);
    updateGameState(currentRoom.participants, currentRoom.is_started);

    // Render existing polls
    if (currentRoom.polls && currentRoom.polls.length > 0) {
        currentRoom.polls.forEach(poll => addPollToChat(poll));
    }

    // Connect Chat
    connectWebSocket();

    // Start Polling
    if (pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(pollRoomState, 3000);
}

// Actions
async function createRoom() {
    // Check if already hosting a room in session
    const session = localStorage.getItem('secret_santa_session');
    if (session) {
        const { roomCode, user } = JSON.parse(session);
        if (user.is_host) {
            if (confirm("You are already hosting a room. Do you want to rejoin it?")) {
                try {
                    const room = await apiCall(`/rooms/${roomCode}`);
                    currentUser = user;
                    currentRoom = room;
                    enterLobby();
                    return;
                } catch (e) {
                    // Session invalid, continue to create
                    clearSession();
                }
            } else {
                clearSession();
            }
        }
    }

    const roomNameInput = document.getElementById('create-room-name');
    const nameInput = document.getElementById('create-name');
    const prefInput = document.getElementById('create-pref');
    const secretInput = document.getElementById('create-secret');

    const roomName = roomNameInput.value.trim();
    const name = nameInput.value.trim();
    const pref = prefInput.value.trim();
    const secret = secretInput.value.trim();

    if (!name) return showErrorModal('🎅 Name Required', 'Please enter your name to create a room!');

    try {
        const room = await apiCall('/rooms', 'POST', {
            room_name: roomName,
            host_name: name,
            host_preferences: pref,
            host_secret_message: secret
        });
        currentUser = room.participants[0];
        currentRoom = room;
        saveSession(room, currentUser);
        enterLobby();

        // Update URL to include room code
        const url = new URL(window.location);
        url.searchParams.set('room', room.code);
        window.history.pushState({}, '', url);

    } catch (e) {
        showErrorModal('⚠️ Creation Failed', e.message || 'Could not create the room. Please try again.');
    }
}

async function joinRoom() {
    const codeInput = document.getElementById('join-code');
    const nameInput = document.getElementById('join-name');
    const prefInput = document.getElementById('join-pref');
    const secretInput = document.getElementById('join-secret');

    const code = codeInput.value.trim().toUpperCase();
    const name = nameInput.value.trim();
    const pref = prefInput.value.trim();
    const secret = secretInput.value.trim();

    if (!code || !name) return showErrorModal('🎅 Missing Info', 'Please enter the room code and your name!');

    try {
        const participant = await apiCall('/rooms/join', 'POST', {
            room_code: code,
            name,
            preferences: pref,
            secret_message: secret
        });
        currentUser = participant;
        currentRoom = await apiCall(`/rooms/${code}`);

        // saveSession will only save if currentUser.is_host is true (which it shouldn't be for joiners, usually)
        // But if we allow re-joining as host via this flow (unlikely), it handles it.
        saveSession(currentRoom, currentUser);

        enterLobby();

        // Update URL
        const url = new URL(window.location);
        url.searchParams.set('room', code);
        window.history.pushState({}, '', url);

    } catch (e) {
        showErrorModal('⚠️ Join Failed', e.message || 'Could not join the room. Check the code and try again!');
    }
}

async function startGame() {
    if (!currentRoom || !currentUser.is_host) return;

    try {
        const res = await apiCall(`/rooms/${currentRoom.code}/start`, 'POST');
        updateGameState(res.participants, true);
    } catch (e) {
        showErrorModal('Start Failed', e.message);
    }
}

function closeRoom() {
    if (!currentRoom || !currentUser.is_host) return;

    showConfirmModal(
        '🚫 Close Room?',
        'Are you sure you want to close this room? This will delete all data permanently.',
        async () => {
            try {
                await apiCall(`/rooms/${currentRoom.code}`, 'DELETE');
                showSuccessModal('Room Closed', 'Room closed and data deleted.', () => {
                    clearSession();
                    window.location.reload();
                });
            } catch (e) {
                showErrorModal('Failed to Close', "Failed to close room: " + e.message);
            }
        },
        null,
        { confirmText: 'Close Room', isDestructive: true }
    );
}

// Utilities
function copyCode() {
    const code = document.getElementById('lobby-code').innerText;
    navigator.clipboard.writeText(code).then(() => {
        if (typeof showNotification !== 'undefined') {
            showNotification('Room code copied to clipboard!', 'success');
        } else {
            alert('Room code copied to clipboard!');
        }
    });
}

function generateShareableLink(roomCode) {
    return `${window.location.origin}/?room=${roomCode}`;
}

async function copyShareableLink() {
    const link = generateShareableLink(currentRoom.code);

    try {
        await navigator.clipboard.writeText(link);
        if (typeof showNotification !== 'undefined') {
            showNotification('Shareable link copied to clipboard!', 'success');
        } else {
            alert('Shareable link copied to clipboard!');
        }
    } catch (err) {
        // Fallback for older browsers
        const tempInput = document.createElement('input');
        tempInput.value = link;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        if (typeof showNotification !== 'undefined') {
            showNotification('Link copied!', 'success');
        } else {
            alert('Link copied!');
        }
    }
}

function downloadCard() {
    const card = document.getElementById('card-content');
    if (!card) return;

    html2canvas(card, {
        backgroundColor: '#f0fdf4',
        scale: 2
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `secret-santa-${document.getElementById('match-name').innerText}.png`;
        link.href = canvas.toDataURL();
        link.click();
    });
}
