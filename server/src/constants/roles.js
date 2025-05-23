const { PERMISSIONS } = require("./permissions");

const ROLES = {
  SUPERADMIN: {
    name: "SuperAdmin",
    permissions: [
      PERMISSIONS.MANAGE_USERS,
      PERMISSIONS.MANAGE_RESTAURANTS,
      PERMISSIONS.MANAGE_RESERVATIONS,
      PERMISSIONS.MANAGE_EMPLOYEES,
      PERMISSIONS.VIEW_RESERVATIONS,
      PERMISSIONS.HANDLE_COMPLAINTS,
    ],
  },
  ADMIN: {
    name: "Admin",
    permissions: [
      PERMISSIONS.MANAGE_RESTAURANTS,
      PERMISSIONS.MANAGE_EMPLOYEES,
      PERMISSIONS.VIEW_RESERVATIONS,
      PERMISSIONS.HANDLE_COMPLAINTS,
    ],
  },
  EMPLOYEE: {
    name: "Employee",
    permissions: [PERMISSIONS.VIEW_RESERVATIONS, PERMISSIONS.HANDLE_COMPLAINTS],
  },
  CLIENT: {
    name: "Client",
    permissions: [PERMISSIONS.MAKE_RESERVATION, PERMISSIONS.SUBMIT_COMPLAINT],
  },
};

module.exports = { ROLES };
