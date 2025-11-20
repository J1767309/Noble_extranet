import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get Resend API key from environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not set')
    }

    // Get all active (non-archived) projects
    const { data: projects, error: projectsError } = await supabaseClient
      .from('hotel_projects')
      .select('*')
      .eq('archived', false)

    if (projectsError) throw projectsError

    let emailsSent = 0
    const results = []

    // Process each project
    for (const project of projects || []) {
      // Get tasks for this project
      const { data: tasks, error: tasksError } = await supabaseClient
        .from('project_tasks')
        .select('status')
        .eq('project_id', project.id)

      if (tasksError) {
        console.error(`Error loading tasks for project ${project.id}:`, tasksError)
        continue
      }

      // Calculate project statistics
      const totalTasks = tasks?.length || 0
      const completedTasks = tasks?.filter(t => t.status === 'Complete').length || 0
      const inProgressTasks = tasks?.filter(t => t.status === 'In Progress').length || 0
      const notStartedTasks = tasks?.filter(t => t.status === 'Not Started').length || 0
      const needResourcesTasks = tasks?.filter(t => t.status === 'Need Resources').length || 0
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

      // Get assigned users for this project
      const { data: assignments, error: assignmentsError } = await supabaseClient
        .from('project_users')
        .select(`
          user_id,
          users (
            id,
            name,
            email
          )
        `)
        .eq('project_id', project.id)

      if (assignmentsError) {
        console.error(`Error loading assignments for project ${project.id}:`, assignmentsError)
        continue
      }

      const assignedUsers = assignments?.map(a => a.users) || []

      // Format opening date
      const openingDate = project.opening_date
        ? new Date(project.opening_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : 'No date set'

      // Send email to each assigned user
      for (const user of assignedUsers) {
        if (!user?.email) continue

        const emailHtml = generateEmailHtml({
          userName: user.name,
          projectName: project.name,
          projectStatus: project.status,
          openingDate,
          progress,
          totalTasks,
          completedTasks,
          inProgressTasks,
          notStartedTasks,
          needResourcesTasks,
          projectUrl: `http://localhost:8000/hotel-opening-detail.html?id=${project.id}`
        })

        // Send email using Resend
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'onboarding@resend.dev',
            to: [user.email],
            subject: `Daily Update: ${project.name}`,
            html: emailHtml
          })
        })

        if (emailResponse.ok) {
          emailsSent++
          results.push({ project: project.name, user: user.email, status: 'sent' })
        } else {
          const errorData = await emailResponse.json()
          console.error(`Failed to send email to ${user.email}:`, errorData)
          results.push({ project: project.name, user: user.email, status: 'failed', error: errorData })
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailsSent,
        projectsProcessed: projects?.length || 0,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})

function generateEmailHtml(data: {
  userName: string
  projectName: string
  projectStatus: string
  openingDate: string
  progress: number
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  notStartedTasks: number
  needResourcesTasks: number
  projectUrl: string
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Project Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Daily Project Update</h1>
              <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 14px;">Your hotel opening project status</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 30px 40px 20px 40px;">
              <p style="margin: 0; font-size: 16px; color: #374151;">Hi ${data.userName},</p>
              <p style="margin: 16px 0 0 0; font-size: 16px; color: #374151;">Here's your daily update for the hotel opening project you're assigned to.</p>
            </td>
          </tr>

          <!-- Project Info -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <div style="background-color: #f9fafb; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 4px;">
                <h2 style="margin: 0 0 12px 0; font-size: 20px; color: #1a1a1a;">${data.projectName}</h2>
                <div style="display: flex; gap: 16px; margin-bottom: 8px;">
                  <span style="display: inline-block; padding: 4px 12px; background-color: #dbeafe; color: #1e40af; border-radius: 12px; font-size: 13px; font-weight: 500;">${data.projectStatus}</span>
                </div>
                <p style="margin: 12px 0 0 0; color: #6b7280; font-size: 14px;">
                  <strong>Target Opening:</strong> ${data.openingDate}
                </p>
              </div>
            </td>
          </tr>

          <!-- Progress Bar -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #374151;">Overall Progress</h3>
              <div style="background-color: #e5e7eb; height: 24px; border-radius: 12px; overflow: hidden; position: relative;">
                <div style="background: linear-gradient(90deg, #10b981, #059669); height: 100%; width: ${data.progress}%; transition: width 0.3s;"></div>
                <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 13px; font-weight: 600; color: ${data.progress > 50 ? '#ffffff' : '#1a1a1a'};">${data.progress}%</span>
              </div>
            </td>
          </tr>

          <!-- Stats Grid -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #374151;">Task Breakdown</h3>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 16px; background-color: #f0f9ff; border-radius: 8px; text-align: center; width: 50%;">
                    <div style="font-size: 28px; font-weight: 700; color: #3b82f6; margin-bottom: 4px;">${data.totalTasks}</div>
                    <div style="font-size: 13px; color: #6b7280;">Total Tasks</div>
                  </td>
                  <td style="width: 16px;"></td>
                  <td style="padding: 16px; background-color: #f0fdf4; border-radius: 8px; text-align: center; width: 50%;">
                    <div style="font-size: 28px; font-weight: 700; color: #10b981; margin-bottom: 4px;">${data.completedTasks}</div>
                    <div style="font-size: 13px; color: #6b7280;">Completed</div>
                  </td>
                </tr>
                <tr><td colspan="3" style="height: 16px;"></td></tr>
                <tr>
                  <td style="padding: 16px; background-color: #eff6ff; border-radius: 8px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #3b82f6; margin-bottom: 4px;">${data.inProgressTasks}</div>
                    <div style="font-size: 13px; color: #6b7280;">In Progress</div>
                  </td>
                  <td style="width: 16px;"></td>
                  <td style="padding: 16px; background-color: #f3f4f6; border-radius: 8px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #6b7280; margin-bottom: 4px;">${data.notStartedTasks}</div>
                    <div style="font-size: 13px; color: #6b7280;">Not Started</div>
                  </td>
                </tr>
                ${data.needResourcesTasks > 0 ? `
                <tr><td colspan="3" style="height: 16px;"></td></tr>
                <tr>
                  <td colspan="3" style="padding: 16px; background-color: #fffbeb; border-radius: 8px; text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #f59e0b; margin-bottom: 4px;">${data.needResourcesTasks}</div>
                    <div style="font-size: 13px; color: #92400e;">Need Resources ⚠️</div>
                  </td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 40px 40px 40px; text-align: center;">
              <a href="${data.projectUrl}" style="display: inline-block; padding: 14px 32px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 15px;">View Full Project Details</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #6b7280;">
                You're receiving this email because you're assigned to this hotel opening project.
              </p>
              <p style="margin: 12px 0 0 0; font-size: 13px; color: #9ca3af;">
                © ${new Date().getFullYear()} Noble Investment Group. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}
