import type { Team, TeamMember } from '../../types'

export function TeamHeader({ team, members }: { team: Team; members: TeamMember[] }) {
  return (
    <div className="team-page__card team-page__team-header">
      {team.photoUrl && (
        <img
          className="team-page__team-photo"
          src={team.photoUrl}
          alt={team.name}
        />
      )}
      <div className="team-page__team-info">
        <p className="team-page__team-name">{team.name}</p>
        <p className="team-page__member-count">
          {members.length} {members.length === 1 ? 'member' : 'members'}
        </p>
      </div>
    </div>
  )
}
