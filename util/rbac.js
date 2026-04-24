// Role-Based Access Control middleware
// Roles: Administrador, Lead Member, Member

const ROLES = {
  ADMIN: 'Administrador',
  LEAD: 'Lead Member',
  MEMBER: 'Member',
};

const ROLE_ALIASES = {
  administrador: ROLES.ADMIN,
  admin: ROLES.ADMIN,
  'lead member': ROLES.LEAD,
  lead: ROLES.LEAD,
  member: ROLES.MEMBER,
};

const normalizeRole = (role) => {
  if (!role) {
    return null;
  }
  const normalized = String(role).trim().toLowerCase();
  return ROLE_ALIASES[normalized] || null;
};

const getRolePermissions = (role) => {
  const normalizedRole = normalizeRole(role);

  return {
    canRegisterUsers: normalizedRole === ROLES.ADMIN,
    canRegisterTeams: normalizedRole === ROLES.ADMIN || normalizedRole === ROLES.LEAD,
    canRegisterProjects: normalizedRole === ROLES.ADMIN || normalizedRole === ROLES.LEAD,
    canViewTeamStandups: normalizedRole === ROLES.ADMIN || normalizedRole === ROLES.LEAD,
  };
};

/**
 * Middleware factory that restricts access to the specified roles.
 * Usage: authorize(ROLES.ADMIN, ROLES.LEAD)
 * @param  {...string} allowedRoles - Roles permitted to access the route
 */
const authorize = (...allowedRoles) => {
  return (request, response, next) => {
    if (!request.session.isLoggedIn) {
      return response.redirect('/login');
    }

    const userRole = normalizeRole(request.session.role);
    const normalizedAllowedRoles = allowedRoles.map((role) => normalizeRole(role));

    if (!userRole || !normalizedAllowedRoles.includes(userRole)) {
      return response.status(403).send('Acceso denegado. No tienes permisos para realizar esta acción.');
    }

    next();
  };
};

module.exports = {ROLES, authorize, normalizeRole, getRolePermissions};
