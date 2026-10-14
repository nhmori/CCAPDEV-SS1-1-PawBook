// Mock data for all businesses (used by business-profile.html?id=N)
// The business that is currently logged in as the owner is id 1; edits saved from
// manage-business.html are layered on top of that one.

function mockHours(overrides, sundayClosed) {
  var base = { closed: false, open: "09:00", close: "18:00" };
  var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  var out = {};
  days.forEach(function (d) { out[d] = Object.assign({}, base); });
  if (sundayClosed) out.Sunday.closed = true;
  Object.keys(overrides || {}).forEach(function (d) { Object.assign(out[d], overrides[d]); });
  return out;
}

const mockBusinesses = [
  {
    id: 1,
    fields: {
      bizName: "Pawfect Grooming Spa", bizType: "Grooming Salon", bizTagline: "Gentle grooming for happy pets",
      bizDesc: "Family-run grooming salon with certified groomers. We offer full grooming, baths, and nail care for dogs and cats in a calm, stress-free space.",
      bizPhone: "+63 917 123 4567", bizEmail: "hello@pawfectspa.example", bizWebsite: "https://pawfectspa.example",
      bizSocial: "@pawfectspa", bizAddress: "Unit 4, 123 Example Street", bizCity: "Metro Manila", bizBranches: "3",
      bizPolicy: "Please cancel at least 24 hours before your appointment.",
      bizNotes: "Dogs must be up to date on vaccinations."
    },
    checks: { petDog: true, petCat: true, petSmall: false, payCash: true, payCard: true, payEwallet: true,
              amAC: true, amWifi: true, amParking: false, amPickup: true, amWalkin: false },
    services: [
      { name: "Full Grooming", price: "800", time: "120" },
      { name: "Bath & Dry", price: "400", time: "60" },
      { name: "Nail Trim", price: "150", time: "30" }
    ],
    hours: mockHours({ Friday: { close: "20:00" }, Saturday: { open: "10:00", close: "17:00" } }, true),
    rating: { score: 4.9, count: 97 },
    reviews: [
      { name: "Sarah Jenkins", rating: 5, date: "Oct 28", text: "Milo came out looking great and was calm the whole time. Staff were gentle and patient." },
      { name: "Juan Dela Cruz", rating: 5, date: "Oct 12", text: "Buddy loved his fresh cut. Easy booking and on-time service." },
      { name: "Maria Santos", rating: 4, date: "Sep 30", text: "Great bath and dry for Ming. Parking is a bit tight on weekends." }
    ]
  },
  {
    id: 2,
    fields: {
      bizName: "Furry Tails Studio", bizType: "Pet Spa", bizTagline: "Spa days for pets who deserve the best",
      bizDesc: "A boutique pet spa in the heart of Makati. Our groomers specialize in relaxing spa treatments, from aromatherapy baths to full-coat styling.",
      bizPhone: "+63 918 222 3344", bizEmail: "hello@furrytails.example", bizWebsite: "https://furrytails.example",
      bizSocial: "@furrytailsstudio", bizAddress: "2F Ayala Avenue Plaza, Ayala Avenue", bizCity: "Makati", bizBranches: "1",
      bizPolicy: "Appointments are held for 15 minutes. Please reschedule at least 12 hours ahead.",
      bizNotes: "Cats are groomed in a separate quiet room."
    },
    checks: { petDog: true, petCat: true, petSmall: true, payCash: false, payCard: true, payEwallet: true,
              amAC: true, amWifi: true, amParking: true, amPickup: false, amWalkin: false },
    services: [
      { name: "Full Grooming", price: "950", time: "120" },
      { name: "Spa Bath", price: "700", time: "90" },
      { name: "Aromatherapy Add-on", price: "250", time: "20" }
    ],
    hours: mockHours({ Saturday: { open: "10:00", close: "19:00" } }, true),
    rating: { score: 4.8, count: 64 },
    reviews: [
      { name: "Katrina Lim", rating: 5, date: "Nov 2", text: "The spa bath worked wonders for my Persian. She came home smelling amazing." },
      { name: "Paolo Reyes", rating: 5, date: "Oct 19", text: "Very clean shop and the staff clearly love animals." },
      { name: "Anna Cruz", rating: 4, date: "Oct 3", text: "Lovely service, a little pricey but worth it." }
    ]
  },
  {
    id: 3,
    fields: {
      bizName: "The Dog Barber", bizType: "Pet Barber", bizTagline: "Sharp cuts and serious de-shedding",
      bizDesc: "Pet barbershop focused on breed-specific cuts and de-shedding treatments that cut loose fur by up to 80%. Walk-ins welcome on weekdays.",
      bizPhone: "+63 927 555 0101", bizEmail: "book@dogbarber.example", bizWebsite: "",
      bizSocial: "@thedogbarberph", bizAddress: "88 Roxas Boulevard", bizCity: "Pasay", bizBranches: "2",
      bizPolicy: "Late arrivals of more than 20 minutes may need to be rescheduled.",
      bizNotes: "Heavy-coated breeds may need extra time and a second visit."
    },
    checks: { petDog: true, petCat: false, petSmall: false, payCash: true, payCard: true, payEwallet: false,
              amAC: true, amWifi: false, amParking: true, amPickup: false, amWalkin: true },
    services: [
      { name: "Breed Haircut", price: "600", time: "75" },
      { name: "De-shedding Treatment", price: "750", time: "90" },
      { name: "Nail Trim", price: "120", time: "20" }
    ],
    hours: mockHours({ Saturday: { open: "08:00", close: "20:00" }, Sunday: { open: "10:00", close: "16:00" } }, false),
    rating: { score: 4.7, count: 203 },
    reviews: [
      { name: "Miguel Tan", rating: 5, date: "Nov 5", text: "The de-shedding session was a game changer. Far less fur on the couch." },
      { name: "Sarah Jenkins", rating: 5, date: "Oct 22", text: "Took Milo for a summer de-shed and he looks fantastic." },
      { name: "Carla Bautista", rating: 4, date: "Oct 8", text: "Good cut and friendly staff. Wait was a bit long on a Saturday." }
    ]
  },
  {
    id: 4,
    fields: {
      bizName: "Bark & Bath Studio", bizType: "Grooming Salon", bizTagline: "Full grooms, styled your way",
      bizDesc: "Full-service grooming studio in Quezon City offering complete grooms, creative styling, and gentle baths for dogs of all sizes.",
      bizPhone: "+63 915 808 7766", bizEmail: "hello@barkandbath.example", bizWebsite: "https://barkandbath.example",
      bizSocial: "@barkandbathstudio", bizAddress: "15 Timog Avenue", bizCity: "Quezon", bizBranches: "2",
      bizPolicy: "A 50% deposit is required for styling appointments.",
      bizNotes: "Creative styling and coloring use pet-safe products only."
    },
    checks: { petDog: true, petCat: true, petSmall: false, payCash: true, payCard: true, payEwallet: true,
              amAC: true, amWifi: true, amParking: true, amPickup: true, amWalkin: false },
    services: [
      { name: "Full Groom", price: "900", time: "120" },
      { name: "Creative Styling", price: "1,200", time: "150" },
      { name: "Bath & Blow-dry", price: "450", time: "60" }
    ],
    hours: mockHours({ Saturday: { open: "09:00", close: "17:00" } }, true),
    rating: { score: 4.9, count: 84 },
    reviews: [
      { name: "Denise Ocampo", rating: 5, date: "Nov 8", text: "Gorgeous styling for my Shih Tzu. They took lots of photos for me too." },
      { name: "Ramon Villanueva", rating: 5, date: "Oct 26", text: "Pick-up and delivery made it so easy. Max came back spotless." },
      { name: "Joy Garcia", rating: 5, date: "Oct 11", text: "Best groomer I have tried in QC." }
    ]
  }
];