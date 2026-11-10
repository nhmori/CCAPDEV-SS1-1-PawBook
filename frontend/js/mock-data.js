
const mockShopStats = {
  pending: 5,
  today: 8,
  branches: 3,
  rating: 4.7
};

const mockShopBookingRequests = [
  { date: "Nov 15", customer: "Juan", pet: "Buddy", service: "Full Grooming" },
  { date: "Nov 16", customer: "Maria", pet: "Ming", service: "Bath & Dry" }
];

const mockPopularServices = {
  labels: ['Full Groom', 'Bath & Dry', 'Nail Trim', 'Teeth Cleaning', 'De-shedding'],
  data: [45, 78, 28, 15, 22]
};

const mockRatings = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  data: [4.2, 4.4, 4.6, 4.5, 4.7, 4.8]
};

const mockServiceBreakdown = {
  labels: ['Full Groom', 'Bath & Dry', 'Nail Trim', 'Teeth Cleaning', 'De-shedding'],
  data: [25, 40, 15, 10, 10]
};


const mockCustomerStats = {
  upcoming: 2,
  completed: 12,
  pets: 3,
  reviews: 8
};

const mockCustomerBookings = [
  { date: "Nov 15", business: "Pawfect Grooming Spa", service: "Full Grooming", status: "Confirmed" },
  { date: "Nov 22", business: "Furry Tails Studio", service: "Spa Bath", status: "Pending" }
];

const mockCustomerPets = [
  { name: "Dalla", breed: "Mixed breed" },
  { name: "Kiwi", breed: "Mixed breed" },
  { name: "Charlie", breed: "Mixed breed" }
];

const mockCustomerBookingsPerMonth = {
  labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
  data: [2, 3, 1, 4, 2, 3]
};


const mockAdminStats = {
  users: 1240,
  shops: 85,
  pending: 12,
  posts: 3400
};

const mockAdminUsers = [
  { name: "Juan", role: "Customer", status: "Active" },
  { name: "Happy Paws", role: "Business", status: "Pending" }
];

const mockUserGrowth = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  data: [120, 340, 560, 780, 980, 1240]
};

const mockBookingsPerDay = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  data: [12, 18, 15, 22, 28, 45, 38]
};

const mockTopCities = {
  labels: ['Manila', 'Quezon City', 'Makati', 'Pasig', 'Taguig'],
  data: [320, 280, 190, 140, 110]
};