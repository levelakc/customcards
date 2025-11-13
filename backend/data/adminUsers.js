const adminUsers = [
  {
    name: 'Admin User One',
    email: 'admin1@example.com',
    password: 'password123', // This will be hashed by the userModel pre-save hook
    isAdmin: true,
    phone: '123-456-7890',
    address: {
      street: '123 Admin St',
      city: 'Adminville',
      postalCode: '12345',
    },
  },
  {
    name: 'Admin User Two',
    email: 'admin2@example.com',
    password: 'password456', // This will be hashed by the userModel pre-save hook
    isAdmin: true,
    phone: '098-765-4321',
    address: {
      street: '456 Super St',
      city: 'Supercity',
      postalCode: '67890',
    },
  },
];

export default adminUsers;
