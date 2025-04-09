import { handleRequest, createSuccessResponse, createErrorResponse } from "../_shared/auth.ts"
import { query, execute } from "../_shared/postgres.ts"

interface AcceptInviteRequest {
  invite_id: string
}

interface AcceptInviteResponse {
  success: boolean
  team_id?: string
  error?: string
}

interface TeamInvite {
  id: string
  team_id: string
  email: string
  role: string
}

Deno.serve(async (req) => {
  return handleRequest(req, async (user, body: AcceptInviteRequest) => {
    const { invite_id } = body

    if (!invite_id) {
      return createErrorResponse('Missing required fields')
    }

    // Get the invite
    const { rows: invites } = await query<TeamInvite>(
      'SELECT * FROM team_invites WHERE id = $1 AND email = $2',
      [invite_id, user.email]
    )

    if (!invites || invites.length === 0) {
      return createErrorResponse('Invite not found or expired')
    }

    const invite = invites[0]

    // Check if user is already in the team
    const { rows: members } = await query(
      'SELECT * FROM team_members WHERE team_id = $1 AND user_id = $2',
      [invite.team_id, user.id]
    )

    if (members && members.length > 0) {
      return createErrorResponse('User is already a member of this team')
    }

    // Add user to team
    await execute(
      'INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3)',
      [invite.team_id, user.id, 'member']
    )

    // Delete the invite
    await execute(
      'DELETE FROM team_invites WHERE id = $1',
      [invite_id]
    )

    return createSuccessResponse({
      success: true,
      team_id: invite.team_id
    })
  }, {
    requiredSecrets: ["SUPABASE_URL", "SUPABASE_ANON_KEY"],
    requireAuth: true,
    requireBody: true
  })
}) 