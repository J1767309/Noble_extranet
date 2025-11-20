import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Google Gemini API configuration
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') ?? ''
const GEMINI_MODEL = 'gemini-1.5-flash' // Use stable model with better rate limits (15 RPM free tier)

interface ChatRequest {
  conversationId?: string
  message: string
  useGrounding?: boolean // Whether to use Google Search grounding
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get authorization token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with user's token
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    })

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user details for access control
    const { data: userData } = await supabase
      .from('users')
      .select('user_type, role')
      .eq('id', user.id)
      .single()

    const { conversationId, message, useGrounding = false } = await req.json() as ChatRequest

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create or get conversation
    let currentConversationId = conversationId
    if (!currentConversationId) {
      const { data: newConversation, error: convError } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: user.id,
          title: message.substring(0, 100), // Use first 100 chars as title
        })
        .select()
        .single()

      if (convError) throw convError
      currentConversationId = newConversation.id
    }

    // Save user message
    await supabase.from('chat_messages').insert({
      conversation_id: currentConversationId,
      role: 'user',
      content: message,
    })

    // Get conversation history
    const { data: history } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('conversation_id', currentConversationId)
      .order('created_at', { ascending: true })
      .limit(10) // Last 10 messages for context

    // Build RAG context from hotel data
    const context = await buildRAGContext(supabase, message, userData)

    // Prepare messages for Gemini
    const geminiMessages = [
      {
        role: 'user',
        parts: [{
          text: buildSystemPrompt(userData, context)
        }]
      },
      ...(history || []).map((msg: ChatMessage) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })),
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ]

    // Call Gemini API
    const geminiResponse = await callGeminiAPI(geminiMessages, useGrounding)

    // Save assistant response
    await supabase.from('chat_messages').insert({
      conversation_id: currentConversationId,
      role: 'assistant',
      content: geminiResponse.text,
      metadata: {
        sources: context.sources,
        hotels_referenced: context.hotels,
        model: GEMINI_MODEL,
        grounding_used: useGrounding,
      },
    })

    return new Response(
      JSON.stringify({
        conversationId: currentConversationId,
        response: geminiResponse.text,
        sources: context.sources,
        hotels: context.hotels,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in gemini-chat:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

/**
 * Build RAG context by querying relevant hotel data
 */
async function buildRAGContext(
  supabase: any,
  query: string,
  userData: any
): Promise<{ context: string; sources: string[]; hotels: string[] }> {
  const sources: string[] = []
  const hotels: string[] = []
  let contextParts: string[] = []

  // Extract potential hotel names from the query
  const hotelKeywords = extractHotelKeywords(query)

  // Check if user has access to internal data
  const isInternal = userData?.user_type === 'internal'

  try {
    // 1. Query Partner Notes (internal only, rich strategic information)
    if (isInternal) {
      const { data: partnerNotes } = await supabase
        .from('hotel_partner_notes')
        .select('*')
        .or(hotelKeywords.length > 0
          ? hotelKeywords.map(h => `hotel_name.ilike.%${h}%`).join(',')
          : 'id.not.is.null'
        )
        .order('review_date', { ascending: false })
        .limit(5)

      if (partnerNotes && partnerNotes.length > 0) {
        partnerNotes.forEach((note: any) => {
          hotels.push(note.hotel_name)
          contextParts.push(`
**Partner Notes - ${note.hotel_name}** (${note.review_period}):
- Keys to Success: ${stripHTML(note.keys_to_success)}
- Market Updates: ${stripHTML(note.market_updates)}
- Top Accounts: ${stripHTML(note.accounts_top)}
- Target Accounts: ${stripHTML(note.accounts_target)}
- GOP Update: ${stripHTML(note.expense_gop_update)}
          `.trim())
          sources.push(`Partner Notes: ${note.hotel_name}`)
        })
      }
    }

    // 2. Query Hotel Tracker (internal only, operational issues/tactics)
    if (isInternal) {
      const { data: trackerData } = await supabase
        .from('hotel_tracker')
        .select('*, hotels(name), management_companies(name)')
        .eq('is_current', true)
        .or(hotelKeywords.length > 0
          ? hotelKeywords.map(h => `hotels.name.ilike.%${h}%`).join(',')
          : 'id.not.is.null'
        )
        .limit(10)

      if (trackerData && trackerData.length > 0) {
        trackerData.forEach((entry: any) => {
          const hotelName = entry.hotels?.name || 'Unknown Hotel'
          hotels.push(hotelName)
          contextParts.push(`
**Hotel Tracker - ${hotelName}**:
- Type: ${entry.type}
- Description: ${entry.description}
- Date: ${entry.date_reported}
- Management: ${entry.management_companies?.name || 'N/A'}
          `.trim())
          sources.push(`Tracker: ${hotelName}`)
        })
      }
    }

    // 3. Query Top Accounts (internal only)
    if (isInternal) {
      const { data: accounts } = await supabase
        .from('hotel_top_accounts')
        .select('*')
        .or(hotelKeywords.length > 0
          ? hotelKeywords.map(h => `hotel_name.ilike.%${h}%`).join(',')
          : 'id.not.is.null'
        )
        .limit(10)

      if (accounts && accounts.length > 0) {
        const accountsByHotel = accounts.reduce((acc: any, account: any) => {
          if (!acc[account.hotel_name]) {
            acc[account.hotel_name] = []
          }
          acc[account.hotel_name].push(account)
          return acc
        }, {})

        Object.entries(accountsByHotel).forEach(([hotelName, hotelAccounts]: [string, any]) => {
          hotels.push(hotelName)
          const accountList = hotelAccounts
            .map((a: any) => `${a.account_name} (${a.account_type}): ${a.rns_2025 || 'N/A'} RNS @ $${a.adr_2025 || 'N/A'}`)
            .join('\n  - ')
          contextParts.push(`
**Top Accounts - ${hotelName}**:
  - ${accountList}
          `.trim())
          sources.push(`Accounts: ${hotelName}`)
        })
      }
    }

    // 4. Query Initiatives (internal only)
    if (isInternal) {
      const { data: initiatives } = await supabase
        .from('initiatives')
        .select('*')
        .or(hotelKeywords.length > 0
          ? hotelKeywords.map(h => `hotel_name.ilike.%${h}%`).join(',')
          : 'id.not.is.null'
        )
        .limit(10)

      if (initiatives && initiatives.length > 0) {
        initiatives.forEach((initiative: any) => {
          hotels.push(initiative.hotel_name)
          contextParts.push(`
**Initiative - ${initiative.hotel_name}**:
- Type: ${initiative.initiative_type}
- Description: ${initiative.initiative_description}
- Status: ${initiative.status}
          `.trim())
          sources.push(`Initiative: ${initiative.hotel_name}`)
        })
      }
    }

    // 5. Query Hotel Projects (accessible to all users)
    const { data: projects } = await supabase
      .from('hotel_projects')
      .select('*')
      .or(hotelKeywords.length > 0
        ? hotelKeywords.map(h => `name.ilike.%${h}%`).join(',')
        : 'id.not.is.null'
      )
      .limit(5)

    if (projects && projects.length > 0) {
      projects.forEach((project: any) => {
        hotels.push(project.name)
        contextParts.push(`
**Hotel Opening Project - ${project.name}**:
- Status: ${project.status}
- Opening Date: ${project.opening_date || 'TBD'}
- Location: ${project.location || 'N/A'}
        `.trim())
        sources.push(`Project: ${project.name}`)
      })
    }

  } catch (error) {
    console.error('Error building RAG context:', error)
  }

  const context = contextParts.length > 0
    ? `Here is relevant hotel data from Noble Investment Group's systems:\n\n${contextParts.join('\n\n---\n\n')}`
    : 'No specific hotel data found. Provide general hotel industry insights.'

  return {
    context,
    sources: [...new Set(sources)], // Remove duplicates
    hotels: [...new Set(hotels)],   // Remove duplicates
  }
}

/**
 * Build system prompt with RAG context
 */
function buildSystemPrompt(userData: any, contextData: any): string {
  const isInternal = userData?.user_type === 'internal'

  return `You are an AI assistant for Noble Investment Group, a hotel investment and management company. You help answer questions about their hotel portfolio, operations, and performance.

**User Access Level**: ${isInternal ? 'Internal User (Full Access)' : 'External User (Limited Access)'}

**Instructions**:
- Answer questions based on the provided hotel data below
- Be specific and cite which hotels you're referencing
- If asked about data you don't have access to, clearly state that
- For financial or sensitive information, remind external users to contact Noble staff
- Be professional and concise
- If you don't have the information, say so rather than making assumptions

**Data Available**:
${contextData.context}

---

Now answer the user's question based on this data:`
}

/**
 * Call Google Gemini API
 */
async function callGeminiAPI(messages: any[], useGrounding: boolean) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

  const requestBody: any = {
    contents: messages,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  }

  // Add Google Search grounding if requested
  if (useGrounding) {
    requestBody.tools = [{
      googleSearchRetrieval: {
        dynamicRetrievalConfig: {
          mode: 'MODE_DYNAMIC',
          dynamicThreshold: 0.3,
        }
      }
    }]
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('No response from Gemini API')
  }

  const text = data.candidates[0].content.parts[0].text

  return { text }
}

/**
 * Extract potential hotel names from query
 */
function extractHotelKeywords(query: string): string[] {
  const keywords: string[] = []

  // Common hotel brands in Noble's portfolio
  const brands = [
    'Renaissance', 'Hyatt House', 'SpringHill', 'Courtyard', 'Residence Inn',
    'Hampton', 'Homewood', 'Hilton', 'Marriott', 'Doubletree'
  ]

  // City names (from the data we've seen)
  const cities = [
    'Raleigh', 'OSU', 'Reading', 'Settlers Ridge', 'Pittsburgh', 'Malvern', 'Philadelphia',
    'Columbus', 'Durham'
  ]

  const allKeywords = [...brands, ...cities]

  allKeywords.forEach(keyword => {
    if (query.toLowerCase().includes(keyword.toLowerCase())) {
      keywords.push(keyword)
    }
  })

  return keywords
}

/**
 * Strip HTML tags from text
 */
function stripHTML(html: string | null): string {
  if (!html) return 'N/A'
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 500) // Limit length to avoid token overflow
}
