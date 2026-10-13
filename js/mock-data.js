// shop dashboard
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

// customer dashboard
const mockCustomerStats = {
  upcoming: 2,
  completed: 12,
  pets: 3,
  reviews: 8
};

const mockCustomerBookings = [
  { date: "Nov 15", business: "Happy Paws", service: "Full Groom", status: "Confirmed" },
  { date: "Nov 22", business: "Dogs & City", service: "Bath & Dry", status: "Pending" }
];

const mockCustomerPets = [
  { name: "Buddy", breed: "Labrador" },
  { name: "Ming", breed: "Persian" },
  { name: "Max", breed: "Shih Tzu" }
];

const mockCustomerBookingsPerMonth = {
  labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
  data: [2, 3, 1, 4, 2, 3]
};