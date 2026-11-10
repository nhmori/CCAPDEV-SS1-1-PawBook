window.PawBookBookings = (function () {
    var KEY = 'pawbook_bookings';

    // read/write bookings from localStorage
    function read() { 
        return PawBookUtil.readList(KEY); 
    }

    // save bookings to localStorage
    function save(list) { 
        localStorage.setItem(KEY, JSON.stringify(list)); 
    }

    // get the start time of a booking in milliseconds
    function startOf(b) {
        return PawBookUtil.isoToDate(b.date).getTime() + PawBookUtil.hhmmaToMinutes(b.time) * 60000;
    }

    // check if a booking is in the past
    function isPast(b) { 
        return startOf(b) < Date.now(); 
    }

    // resolve the status of a booking based on its current status and whether it is in the past
    function resolveStatus(b) {
        if (b.status === 'Cancelled' || b.status === 'Rejected' || b.status === 'Completed') return b.status;
        if (isPast(b)) return b.status === 'Confirmed' ? 'Completed' : 'Expired';
        return b.status || 'Pending';
    }

    // find a booking by its reference number
    function find(ref) { 
        return read().filter(function (b) { return b.ref === ref; })[0]; 
    }

    // get all bookings for a specific business
    function forBusiness(id) { 
        return read().filter(function (b) { return b.businessId === id; }); 
    }

    // rank bookings based on their status for sorting purposes
    function rank(b) { 
        return b.status === 'Pending' ? 0 : (b.status === 'Confirmed' ? 1 : 2); 
    }

    // public API
    return { 
        KEY: KEY, 
        read: read, 
        save: save, 
        startOf: startOf, 
        isPast: isPast, 
        resolveStatus: resolveStatus, 
        find: find, 
        forBusiness: forBusiness, 
        rank: rank };
})();