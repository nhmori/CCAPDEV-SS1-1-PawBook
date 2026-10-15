

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
    
    image: "dogscity.jpg",                       
    gallery: ["dogs2.jpg", "dogs3.jpg"],   
    fields: {
      bizName: "Dogs & The City", bizType: "Pet Store, ✂️Vet & Grooming Service", bizTagline: "Gentle grooming for happy pets",
      bizDesc: "Dogs and the City understands what it means to love your pet💖#PawmilyComesFirst",
      bizPhone: "+63 917 123 4567", bizEmail: "Dogs&thecity@gmail.com", bizWebsite: "https://dogsandthecityph.com/",
      bizSocial: "@dogsandthecityph", bizAddress: "Mall  of Asia", bizCity: "Metro Manila", bizBranches: "3",
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
    
    image: "petexp.jpg",                       
    gallery: ["petexp1.jpg", "Teddy1.jpg"],   
    fields: {
      bizName: "Pet Express", bizType: "Pet Store", bizTagline: "The best pet store",
      bizDesc: "Pet Express: the dog and cat shop 💛🐶🐱",
      bizPhone: "+63 918 222 3344", bizEmail: "petexpress@gmail.com", bizWebsite: "https://www.petexpress.com.ph/",
      bizSocial: "@Petexpress", bizAddress: "Greenbelt 3", bizCity: "Makati", bizBranches: "1",
      bizPolicy: "Appointments are held for 15 minutes. Please reschedule at least 24 hours ahead.",
      bizNotes: "We also offer veterinary services"
    },
    checks: { petDog: true, petCat: true, petSmall: true, payCash: false, payCard: true, payEwallet: true,
              amAC: true, amWifi: true, amParking: true, amPickup: false, amWalkin: false },
    services: [
      { name: "Full Grooming", price: "950", time: "120" },
      { name: "Spa Bath", price: "700", time: "90" },
      { name: "Pet shower", price: "250", time: "20" }
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
   
    image: "Abys.jpg",                       
    gallery: ["Abby.jpg", "Abby3.jpg"],   
    fields: {
      bizName: "Abby’s Paws n’ Play", bizType: "Pet playground", bizTagline: "Your Pet's favorite playground",
      bizDesc: "Pet Grooming • Pet Spa • Pet Hotel • Pet Day Care • Pet Indoor Pool • Events Place",
      bizPhone: "☎️ (02) 7007 4148 • (02) 8838 0686", bizEmail: "pawsnplay.ph@gmail.com", bizWebsite: "https://www.instagram.com/pawsnplay.ph/?hl=en",
      bizSocial: "@pawsnplay.ph", bizAddress: " 546 Ronquillo St, Santa Cruz, Manila, 1014", bizCity: "Metro Manila", bizBranches: "2",
      bizPolicy: "Reservations can be made by calling.",
      bizNotes: "Limited Parking outside of store"
    },
    checks: { petDog: true, petCat: false, petSmall: false, payCash: true, payCard: true, payEwallet: false,
              amAC: true, amWifi: false, amParking: true, amPickup: false, amWalkin: true },
    services: [
      { name: "Pet swimming", price: "600", time: "75" },
      { name: "Pet spa", price: "750", time: "90" },
      { name: "Pet grooming", price: "120", time: "20" }
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
    
    image: "botique.jpg",                       
    gallery: ["botique2.jpg", "botique3.jpg"],   
    fields: {
      bizName: "Pretty Bubble Botique", bizType: "♛ Pet, Essentials & Makeover", bizTagline: "The best from Korea",
      bizDesc: "♛ First Best Loved Pet Boutique in the Philippines.",
      bizPhone: "+63 915 808 7766", bizEmail: "bubblebotique@gmail.com", bizWebsite: "https://prettybubbleboutique.com/",
      bizSocial: "@prettybubbleboutique", bizAddress: " G/F, Two Parkade, 30th St, Taguig, Metro Manila", bizCity: "Bonifacio Global City", bizBranches: "2",
      bizPolicy: "A 50% deposit is required for reservations of pets",
      bizNotes: "All pets are authentic from Korea."
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


var PawBookBiz = (function () {
  var OWNER_ID = 1;                              
  var PROFILE_KEY = 'pawbook_business_profile';  
  var DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  function toMin(t) { var p = String(t).split(':'); return +p[0] * 60 + +p[1]; }
  function clock(t) {
    var p = String(t).split(':'), h = +p[0], m = +p[1];
    return ((h % 12) || 12) + (m ? ':' + p[1] : '') + (h >= 12 ? 'PM' : 'AM');
  }
  function price(s) { return Number(String(s.price).replace(/,/g, '')) || 0; }

  
  function view(b) {
    var v = { id: b.id, image: b.image, gallery: b.gallery, fields: b.fields, checks: b.checks, services: b.services, hours: b.hours, rating: b.rating, reviews: b.reviews };
    if (b.id === OWNER_ID) {
      try {
        var s = JSON.parse(localStorage.getItem(PROFILE_KEY));
        if (s && s.fields && s.fields.bizName) {
          v.fields = s.fields;
          v.checks = s.checks || v.checks;
          v.services = s.services || v.services;
          v.hours = s.hours || v.hours;
        }
      } catch (e) {}
    }
    return v;
  }

  function all() { return mockBusinesses.map(view); }
  function get(id) { return all().filter(function (b) { return b.id === id; })[0] || null; }

  function todayHours(b) { return (b.hours || {})[DAYS[(new Date().getDay() + 6) % 7]] || null; }
  function isOpenNow(b) {
    var h = todayHours(b);
    if (!h || h.closed) return false;
    var d = new Date(), m = d.getHours() * 60 + d.getMinutes();
    return m >= toMin(h.open) && m < toMin(h.close);
  }
  function hoursLabel(b) {
    var h = todayHours(b);
    if (!h) return '';
    return h.closed ? 'Closed today' : clock(h.open) + '–' + clock(h.close);
  }

  function priceRange(b) {
    var p = (b.services || []).map(price).filter(Boolean);
    return p.length ? { min: Math.min.apply(null, p), max: Math.max.apply(null, p) } : null;
  }
  
  function priceTier(b) {
    var p = (b.services || []).map(price).filter(Boolean);
    if (!p.length) return 0;
    var avg = p.reduce(function (t, n) { return t + n; }, 0) / p.length;
    return avg < 500 ? 1 : (avg < 800 ? 2 : 3);
  }

  function unique(list) {
    return list.filter(function (v, i) { return v && list.indexOf(v) === i; }).sort();
  }
  function cities() { return unique(all().map(function (b) { return b.fields.bizCity; })); }
  function serviceNames() {
    var names = [];
    all().forEach(function (b) { (b.services || []).forEach(function (s) { names.push(s.name); }); });
    return unique(names);
  }

  
  function setPhoto($el, src, label) {
    $el.addClass('position-relative overflow-hidden');
    function fallback() { $el.empty().append('<small class="text-muted">[Image]</small>'); }
    if (!src) { fallback(); return; }
    $el.empty();
    $('<img>').attr({ src: src, alt: label || '' })
      .css({ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' })
      .on('error', fallback).appendTo($el);
  }
  
  function photo(src, height, label) {
    var $b = $('<div class="bg-light d-flex align-items-center justify-content-center"></div>');
    if (height === 'fill') $b.addClass('h-100').css('min-height', '160px'); else $b.css('height', height);
    setPhoto($b, src, label);
    return $b;
  }

  return { all: all, get: get, isOpenNow: isOpenNow, hoursLabel: hoursLabel, price: price,
           priceRange: priceRange, priceTier: priceTier, cities: cities, serviceNames: serviceNames,
           setPhoto: setPhoto, photo: photo };
})();