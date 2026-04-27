import { Schema, model, Types } from 'mongoose';

const teamMembershipSchema = new Schema(
  {
    userId:   { type: Types.ObjectId, ref: 'User', required: true },
    teamId:   { type: Types.ObjectId, ref: 'Team', required: true },
    role:     { type: String, enum: ['coach', 'member'], required: true, default: 'member' },
    joinedAt: { type: Date, required: true, default: () => new Date() },
    // null = active member; set to a Date when the user leaves (Phase 3)
    leftAt:   { type: Date, default: null },
  },
  { timestamps: true },
);

// Fast lookup of all members in a team
teamMembershipSchema.index({ teamId: 1, role: 1 });

// Enforces the single-team restriction: a user can only have one active membership (leftAt === null)
// Past memberships (leftAt set) are excluded from the constraint, supporting Phase 3 leave/rejoin
teamMembershipSchema.index(
  { userId: 1 },
  { unique: true, partialFilterExpression: { leftAt: null } },
);

export const TeamMembership = model('TeamMembership', teamMembershipSchema);
