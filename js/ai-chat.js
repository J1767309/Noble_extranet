import { supabase } from './supabase-config.js'

// State
let currentUser = null
let currentConversationId = null
let conversations = []

// DOM Elements
const chatMessages = document.getElementById('chat-messages')
const chatInput = document.getElementById('chat-input')
const sendBtn = document.getElementById('send-btn')
const newChatBtn = document.getElementById('new-chat-btn')
const conversationsList = document.getElementById('conversations-list')
const emptyState = document.getElementById('empty-state')
const useGroundingCheckbox = document.getElementById('use-grounding')
const userEmailSpan = document.getElementById('user-email')
const logoutBtn = document.getElementById('logout-btn')
const changePasswordBtn = document.getElementById('change-password-btn')

// Show/hide internal user links
const internalLinks = [
    'hotel-tracker-link',
    'hotel-top-accounts-link',
    'hotel-partner-notes-link',
    'initiatives-link',
    'bi-tools-link'
]

// Show/hide admin links
const adminLinks = [
    'bug-management-link',
    'user-management-link'
]

// Initialize
async function init() {
    try {
        // Check authentication
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error || !user) {
            window.location.href = 'index.html'
            return
        }

        currentUser = user

        // Get user details
        const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

        if (userData) {
            userEmailSpan.textContent = userData.email

            // Show/hide links based on user type
            if (userData.user_type === 'internal') {
                internalLinks.forEach(linkId => {
                    const link = document.getElementById(linkId)
                    if (link) link.style.display = 'flex'
                })
            }

            // Show admin links if user is admin
            if (userData.role === 'admin') {
                adminLinks.forEach(linkId => {
                    const link = document.getElementById(linkId)
                    if (link) link.style.display = 'flex'
                })
            }
        }

        // Load conversations
        await loadConversations()

        // Event listeners
        sendBtn.addEventListener('click', sendMessage)
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
            }
        })

        // Auto-resize textarea
        chatInput.addEventListener('input', () => {
            chatInput.style.height = 'auto'
            chatInput.style.height = Math.min(chatInput.scrollHeight, 150) + 'px'
        })

        newChatBtn.addEventListener('click', startNewConversation)

        logoutBtn.addEventListener('click', async () => {
            await supabase.auth.signOut()
            window.location.href = 'index.html'
        })

        changePasswordBtn.addEventListener('click', () => {
            window.location.href = 'change-password.html'
        })

    } catch (error) {
        console.error('Initialization error:', error)
        alert('An error occurred. Please refresh the page.')
    }
}

/**
 * Load all conversations for the current user
 */
async function loadConversations() {
    try {
        const { data, error } = await supabase
            .from('chat_conversations')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('updated_at', { ascending: false })

        if (error) throw error

        conversations = data || []
        renderConversations()

        // Load the most recent conversation if exists
        if (conversations.length > 0 && !currentConversationId) {
            loadConversation(conversations[0].id)
        }
    } catch (error) {
        console.error('Error loading conversations:', error)
    }
}

/**
 * Render conversations list
 */
function renderConversations() {
    if (conversations.length === 0) {
        conversationsList.innerHTML = '<p style="padding: 20px; text-align: center; color: #999;">No conversations yet</p>'
        return
    }

    conversationsList.innerHTML = conversations.map(conv => `
        <div class="conversation-item ${conv.id === currentConversationId ? 'active' : ''}" data-id="${conv.id}">
            <div class="conversation-content">
                <div class="conversation-title">${escapeHtml(conv.title)}</div>
                <div class="conversation-date">${formatDate(conv.updated_at)}</div>
            </div>
            <button class="delete-conversation-btn" data-id="${conv.id}" title="Delete conversation">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        </div>
    `).join('')

    // Add click listeners for loading conversations
    document.querySelectorAll('.conversation-item').forEach(item => {
        const contentArea = item.querySelector('.conversation-content')
        contentArea.addEventListener('click', () => {
            loadConversation(item.dataset.id)
        })
    })

    // Add click listeners for delete buttons
    document.querySelectorAll('.delete-conversation-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation() // Prevent loading conversation when clicking delete
            deleteConversation(btn.dataset.id)
        })
    })
}

/**
 * Load a specific conversation
 */
async function loadConversation(conversationId) {
    try {
        currentConversationId = conversationId

        // Update active state in sidebar
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.toggle('active', item.dataset.id === conversationId)
        })

        // Load messages
        const { data: messages, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })

        if (error) throw error

        // Clear chat
        chatMessages.innerHTML = ''
        emptyState.style.display = 'none'

        // Render messages
        if (messages && messages.length > 0) {
            messages.forEach(msg => {
                appendMessage(msg.role, msg.content, msg.metadata, msg.created_at)
            })
        }

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight
    } catch (error) {
        console.error('Error loading conversation:', error)
        alert('Error loading conversation')
    }
}

/**
 * Start a new conversation
 */
function startNewConversation() {
    currentConversationId = null
    chatMessages.innerHTML = ''
    emptyState.style.display = 'flex'

    // Deselect all conversations
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.classList.remove('active')
    })

    // Focus input
    chatInput.focus()
}

/**
 * Delete a conversation
 */
async function deleteConversation(conversationId) {
    // Confirm deletion
    const conversation = conversations.find(c => c.id === conversationId)
    const confirmMsg = conversation
        ? `Delete "${conversation.title}"?\n\nThis will permanently delete the conversation and all its messages.`
        : 'Delete this conversation?\n\nThis will permanently delete the conversation and all its messages.'

    if (!confirm(confirmMsg)) {
        return
    }

    try {
        // Delete from database (messages will be cascaded automatically)
        const { error } = await supabase
            .from('chat_conversations')
            .delete()
            .eq('id', conversationId)

        if (error) throw error

        // Remove from local array
        conversations = conversations.filter(c => c.id !== conversationId)

        // If deleted conversation was active, start new conversation
        if (currentConversationId === conversationId) {
            startNewConversation()
        }

        // Re-render conversations list
        renderConversations()

    } catch (error) {
        console.error('Error deleting conversation:', error)
        alert('Error deleting conversation. Please try again.')
    }
}

/**
 * Send a message
 */
async function sendMessage() {
    const message = chatInput.value.trim()

    if (!message) return

    // Disable input while sending
    chatInput.disabled = true
    sendBtn.disabled = true

    // Hide empty state
    emptyState.style.display = 'none'

    // Add user message to UI
    appendMessage('user', message, null, new Date().toISOString())

    // Clear input
    chatInput.value = ''
    chatInput.style.height = 'auto'

    // Show typing indicator
    const typingIndicator = document.createElement('div')
    typingIndicator.className = 'message'
    typingIndicator.innerHTML = `
        <div class="message-avatar assistant">AI</div>
        <div class="message-content">
            <div class="typing-indicator active">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `
    chatMessages.appendChild(typingIndicator)
    chatMessages.scrollTop = chatMessages.scrollHeight

    try {
        // Call Edge Function
        const { data: { session } } = await supabase.auth.getSession()

        const response = await fetch(`${supabase.supabaseUrl}/functions/v1/gemini-chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
                conversationId: currentConversationId,
                message: message,
                useGrounding: useGroundingCheckbox.checked,
            }),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to get response')
        }

        const data = await response.json()

        // Remove typing indicator
        typingIndicator.remove()

        // Add assistant response
        appendMessage('assistant', data.response, {
            sources: data.sources,
            hotels_referenced: data.hotels
        }, new Date().toISOString())

        // Update current conversation ID if this was a new conversation
        if (!currentConversationId) {
            currentConversationId = data.conversationId
            await loadConversations()
        } else {
            // Update conversation timestamp
            const convIndex = conversations.findIndex(c => c.id === currentConversationId)
            if (convIndex !== -1) {
                conversations[convIndex].updated_at = new Date().toISOString()
                renderConversations()
            }
        }

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight

    } catch (error) {
        console.error('Error sending message:', error)

        // Remove typing indicator
        typingIndicator.remove()

        // Show error message
        appendMessage('assistant', `Sorry, I encountered an error: ${error.message}. Please try again.`, null, new Date().toISOString())
    } finally {
        // Re-enable input
        chatInput.disabled = false
        sendBtn.disabled = false
        chatInput.focus()
    }
}

/**
 * Append a message to the chat
 */
function appendMessage(role, content, metadata, timestamp) {
    const messageDiv = document.createElement('div')
    messageDiv.className = 'message ' + role

    const avatar = role === 'user'
        ? `<div class="message-avatar user">U</div>`
        : `<div class="message-avatar assistant">AI</div>`

    const sender = role === 'user' ? 'You' : 'AI Assistant'

    let sourcesHTML = ''
    if (metadata && metadata.sources && metadata.sources.length > 0) {
        sourcesHTML = `
            <div class="message-sources">
                <div class="message-sources-title">Sources:</div>
                <div class="message-sources-list">
                    ${metadata.sources.map(source =>
                        `<span class="source-tag">${escapeHtml(source)}</span>`
                    ).join('')}
                </div>
            </div>
        `
    }

    messageDiv.innerHTML = `
        ${avatar}
        <div class="message-content">
            <div class="message-header">
                <span class="message-sender">${sender}</span>
                <span class="message-time">${formatTime(timestamp)}</span>
            </div>
            <div class="message-text">${formatMessageContent(content)}</div>
            ${sourcesHTML}
        </div>
    `

    chatMessages.appendChild(messageDiv)
    chatMessages.scrollTop = chatMessages.scrollHeight
}

/**
 * Format message content (convert markdown to HTML, etc.)
 */
function formatMessageContent(content) {
    // Basic markdown-like formatting
    let formatted = escapeHtml(content)

    // Bold: **text**
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

    // Italic: *text*
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>')

    // Lists
    formatted = formatted.replace(/^- (.+)$/gm, '<li>$1</li>')
    formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')

    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>')

    return formatted
}

/**
 * Format timestamp
 */
function formatTime(timestamp) {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    })
}

/**
 * Format date for conversation list
 */
function formatDate(timestamp) {
    const date = new Date(timestamp)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
        return 'Today'
    } else if (diffDays === 1) {
        return 'Yesterday'
    } else if (diffDays < 7) {
        return `${diffDays} days ago`
    } else {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        })
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
}

// Initialize on page load
init()
