// Role-Based Access Control middleware
// Roles: Administrador, Lead Member, Member

const ROLES = {
  ADMIN: 'Administrador',
  LEAD: 'Lead Member',
  MEMBER: 'Member',
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

    const userRole = request.session.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return response.status(403).send('Acceso denegado. No tienes permisos para realizar esta acción.');
    }

    next();
  };
};

module.exports = {ROLES, authorize};
