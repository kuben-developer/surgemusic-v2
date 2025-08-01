import type { NavSection, ProjectItem, TeamItem } from "../types/navigation.types"

/**
 * Validates navigation section data
 */
export function validateNavSections(sections: NavSection[]): boolean {
  return Array.isArray(sections) && sections.every(section => 
    section.section && 
    Array.isArray(section.items) &&
    section.items.every(item => 
      item.title && 
      item.url && 
      typeof item.icon === 'function'
    )
  )
}

/**
 * Validates project items
 */
export function validateProjects(projects: ProjectItem[]): boolean {
  return Array.isArray(projects) && projects.every(project =>
    project.name &&
    project.url &&
    typeof project.icon === 'function'
  )
}

/**
 * Validates team items
 */
export function validateTeams(teams: TeamItem[]): boolean {
  return Array.isArray(teams) && teams.every(team =>
    team.name &&
    team.plan &&
    typeof team.logo === 'function'
  )
}

/**
 * Gets safe user name from user object
 */
export function getSafeUserName(user: any): string {
  if (!user) return "User"
  return user.fullName || user.firstName || user.username || "User"
}

/**
 * Gets safe user email from user object
 */
export function getSafeUserEmail(user: any): string {
  if (!user?.emailAddresses) return ""
  return user.emailAddresses[0]?.emailAddress || ""
}

/**
 * Generates user initials from name
 */
export function generateUserInitials(name: string, maxLength: number = 2): string {
  if (!name) return "U"
  
  return name
    .split(" ")
    .map(part => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, maxLength) || "U"
}