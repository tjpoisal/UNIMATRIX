/**
 * Organization Utilities
 * Handles multi-tenant organization logic, especially around OAuth signups.
 */

import { prisma } from './prisma';

export async function getOrCreatePersonalOrganization(userId: string, userEmail: string, userName?: string | null) {
  // Check if user already has any organization membership
  const existingMembership = await prisma.organizationMember.findFirst({
    where: { userId },
    include: {
      organization: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  if (existingMembership) {
    return existingMembership.organization;
  }

  // Create a new Personal Organization
  const orgName = userName ? `${userName}'s Workspace` : `${userEmail.split('@')[0]}'s Workspace`;

  const organization = await prisma.organization.create({
    data: {
      name: orgName,
      slug: `personal-${userId.slice(0, 8)}`, // simple unique slug
      members: {
        create: {
          userId,
          role: 'owner',
        },
      },
    },
  });

  return organization;
}

export async function getUserOrganizations(userId: string) {
  return prisma.organization.findMany({
    where: {
      members: {
        some: { userId },
      },
    },
    include: {
      members: {
        where: { userId },
        select: { role: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
}
