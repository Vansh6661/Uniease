export const APP_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  RESTAURANT: 'RESTAURANT',
  LAUNDRY: 'LAUNDRY',
};

const RESTAURANT_IDS = [
  'quench',
  'southern-stories',
  'nescafe',
  'dominos',
  'subway',
  'sneapeats',
  'infinity',
];

export const toAppRole = (user) => {
  const roleName = (user?.roleName || '').toLowerCase();

  if (roleName === 'admin' || roleName === 'super_admin' || roleName === 'staff') {
    return APP_ROLES.ADMIN;
  }

  if (roleName === 'restaurant') {
    return APP_ROLES.RESTAURANT;
  }

  if (roleName === 'laundry') {
    return APP_ROLES.LAUNDRY;
  }

  return APP_ROLES.USER;
};

export const getDefaultRouteForRole = (user) => {
  const role = user?.appRole || toAppRole(user);

  if (role === APP_ROLES.ADMIN) {
    return '/admin/dashboard';
  }

  if (role === APP_ROLES.RESTAURANT) {
    return '/restaurant/dashboard';
  }

  if (role === APP_ROLES.LAUNDRY) {
    return '/laundry/dashboard';
  }

  return '/home';
};

export const inferRegistrationProfile = (email = '') => {
  const localPart = String(email).split('@')[0].trim().toLowerCase();

  if (localPart === 'admin') {
    return { role: APP_ROLES.ADMIN, restaurantId: null };
  }

  if (localPart === 'laundry') {
    return { role: APP_ROLES.LAUNDRY, restaurantId: null };
  }

  if (RESTAURANT_IDS.includes(localPart)) {
    return { role: APP_ROLES.RESTAURANT, restaurantId: localPart };
  }

  return { role: APP_ROLES.USER, restaurantId: null };
};
