$(function () {
    // ensure the user is logged in as a pet owner
    if (!PawBookAuth.requireRole('owner')) return;

    var SEEDED = 'pawbook_bookings_seeded';
    var DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    var STEP = 30; 

    var bookings = PawBookBookings.read();
    
    // utility functions
    function save() { 
        PawBookBookings.save(bookings);
    }

    function money(n) { 
        return PawBookUtil.money(n); 
    }

    function priceOf(s) { 
        return PawBookUtil.priceOf(s); 
    }

    function showAlert(type, msg) { 
        PawBookUtil.showAlert($('#apptAlert'), type, msg); 
    }

    // seed some sample bookings if none exist yet (for demo purposes)
    if (!localStorage.getItem(SEEDED) && typeof PawBookBiz !== 'undefined') {
        var base = new Date(); base.setHours(0, 0, 0, 0);
        [
            { off: 5,   biz: 1, svc: ['Full Grooming'],         time: 600, pet: 'Dalla',   status: 'Confirmed' },
            { off: 12,  biz: 2, svc: ['Spa Bath'],              time: 780, pet: 'Kiwi',    status: 'Pending' },
            { off: -4,  biz: 1, svc: ['Full Grooming'],         time: 600, pet: 'Dalla',   status: 'Confirmed' },
            { off: -19, biz: 3, svc: ['De-shedding Treatment'], time: 660, pet: 'Charlie', status: 'Confirmed' },
            { off: -37, biz: 2, svc: ['Spa Bath'],              time: 840, pet: 'Kiwi',    status: 'Confirmed' }
        ].forEach(function (x) {
            var biz = PawBookBiz.get(x.biz); if (!biz) return;
            var d = new Date(base); d.setDate(d.getDate() + x.off);
            for (var i = 0; i < 7; i++) {            // move to a day the shop is open
                var h = (biz.hours || {})[DAYS[(d.getDay() + 6) % 7]];
                if (h && !h.closed) break;
                d.setDate(d.getDate() + 1);
            }
            var sv = (biz.services || []).filter(function (s) { return x.svc.indexOf(s.name) !== -1; });
            bookings.push({
                ref: 'PB-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
                businessId: x.biz, business: biz.fields.bizName,
                date: PawBookUtil.dateToIso(d), time: PawBookUtil.minutesTo12h(x.time), pet: x.pet,
                services: sv.map(function (s) { return s.name; }),
                total: sv.reduce(function (t, s) { return t + priceOf(s); }, 0),
                status: x.status, customer: { name: 'Juan Dela Cruz' }, notes: ''
            });
        });
        save();
        localStorage.setItem(SEEDED, '1');
    }

    // render the dashboard
    function render() {
        var up = [], past = [];

        // sort bookings into upcoming and past
        bookings.forEach(function (b) { 
            (PawBookBookings.isPast(b) || ['Cancelled', 'Rejected', 'Completed'].indexOf(b.status) !== -1 ? past : up).push(b); 
        });
        up.sort(function (a, b) { return PawBookBookings.startOf(a) - PawBookBookings.startOf(b); });
        past.sort(function (a, b) { return PawBookBookings.startOf(b) - PawBookBookings.startOf(a); });

        // render the upcoming and past bookings
        var $u = $('#upcomingBody').empty();
        up.forEach(function (b) {
            var $m = $('<button type="button" class="btn btn-outline-dark btn-sm">MODIFY</button>').on('click', function () { openModify(b.ref); });
            var $c = $('<button type="button" class="btn btn-dark btn-sm">CANCEL</button>').on('click', function () { openCancel(b.ref); });
            
            var $tr = $('<tr></tr>')
            $tr.append($('<td class="small"></td>')
            .append($('<div></div>').text(PawBookUtil.formatDate(b.date) + ' · ' + b.time))
            .append($('<div class="text-muted"></div>').text(b.ref)));
            $tr.append($('<td class="small"></td>').text(b.business));
            $tr.append($('<td class="small"></td>').text((b.services || []).join(', ')));
            $tr.append($('<td class="small"></td>').text(b.pet || '—'));
            $tr.append($('<td class="small"></td>').text(money(b.total || 0)));
            $tr.append($('<td></td>').append(PawBookUtil.statusBadge(PawBookBookings.resolveStatus(b))));
            $tr.append($('<td class="text-end text-nowrap"></td>').append($('<div class="d-flex gap-2 justify-content-end"></div>').append([$m, $c])));

            $u.append($tr);
        });
        $('#upcomingEmpty').toggleClass('d-none', up.length > 0);

        // render past bookings
        var $h = $('#historyBody').empty();
        past.forEach(function (b) {
            var $again = $('<a class="btn btn-outline-dark btn-sm">BOOK AGAIN</a>').attr('href', 'book-appointment.html?id=' + b.businessId);
            
            var $tr = $('<tr></tr>');
            $tr.append($('<td class="small"></td>')
                .append($('<div></div>').text(PawBookUtil.formatDate(b.date) + ' · ' + b.time))
                .append($('<div class="text-muted"></div>').text(b.ref)));
            $tr.append($('<td class="small"></td>').text(b.business));
            $tr.append($('<td class="small"></td>').text((b.services || []).join(', ')));
            $tr.append($('<td class="small"></td>').text(b.pet || '—'));
            $tr.append($('<td class="small"></td>').text(money(b.total || 0)));
            $tr.append($('<td></td>').append(PawBookUtil.statusBadge(PawBookBookings.resolveStatus(b))));
            $tr.append($('<td class="text-end text-nowrap"></td>').append($('<div class="d-flex gap-2 justify-content-end"></div>').append($again)));
            
            $h.append($tr);
        });
        $('#historyEmpty').toggleClass('d-none', past.length > 0);

        // update the stats
        $('#statUpcoming').text(up.length);
        $('#statCompleted').text(past.filter(function (b) { return PawBookBookings.resolveStatus(b) === 'Completed'; }).length);
    }
    
    // load the user's pets from localStorage
    var pets = PawBookUtil.readList('pawbook_pets_v2');
    if (pets === null) pets = [];
    $('#statPets').text(pets.length);
    
    // cancel appointment modal    
    var cancelModal = new bootstrap.Modal(document.getElementById('cancelModal'));
    var cancelling = null;

    // open the cancel modal for a booking
    function openCancel(ref) {
        var b = PawBookBookings.find(ref); 
        if (!b) return;
        cancelling = b;
        $('#cText').text('Cancel your appointment at ' + b.business + ' on ' + PawBookUtil.formatDate(b.date) + ' at ' + b.time + '?');
        var biz = (typeof PawBookBiz !== 'undefined') ? PawBookBiz.get(b.businessId) : null;
        $('#cPolicy').text(biz && biz.fields.bizPolicy ? 'Cancellation policy: ' + biz.fields.bizPolicy : '');
        cancelModal.show();
    }

    // confirm cancellation
    $('#confirmCancel').on('click', function () {
        if (!cancelling) return;
        cancelling.status = 'Cancelled';
        save(); 
        render();
        cancelModal.hide();
        showAlert('success', 'Your appointment at ' + cancelling.business + ' on ' + PawBookUtil.formatDate(cancelling.date) + ' was cancelled.');
        cancelling = null;
    });
      
    // modify appointment modal
    var modifyModal = new bootstrap.Modal(document.getElementById('modifyModal'));
    var editing = null, editBiz = null, pickedSlot = null, originalMin = 0;

    // get the selected services
    function selectedServices() {
        return $('.m-svc:checked').map(function () { return editBiz.services[+this.value]; }).get();
    }

    // get the total duration of the selected services
    function totalDuration() {
        return selectedServices().reduce(function (t, s) { return t + (Number(s.time) || 60); }, 0);
    }

    // build the available time slots for the selected date and services
    function buildSlots() {
        var $s = $('#mSlots').empty(), $hint = $('#mSlotHint');
        var date = $('#mDate').val(), dur = totalDuration(), avail = [];
        if (!dur) { $hint.text('Choose at least one service to see available times.'); pickedSlot = null; return; }
        if (!date) { $hint.text('Choose a date to see available times.'); pickedSlot = null; return; }

        var d = PawBookUtil.isoToDate(date);
        var h = (editBiz.hours || {})[DAYS[(d.getDay() + 6) % 7]];
        if (!h || h.closed) { $hint.text(editBiz.fields.bizName + ' is closed on this day. Try another date.'); pickedSlot = null; return; }

        var open = PawBookUtil.hhmmToMinutes(h.open), close = PawBookUtil.hhmmToMinutes(h.close), now = new Date();
        var nowMin = (date === PawBookUtil.dateToIso(now)) ? now.getHours() * 60 + now.getMinutes() + 30 : -1;
        for (var t = open; t + dur <= close; t += STEP) {
            var own = (date === editing.date && t === originalMin);      // the time you already have stays available
            var taken = !own && ((PawBookUtil.stableHash(editBiz.id + date + t) % 5 === 0) || t < nowMin);
            var id = 'mslot' + t;
            var $in = $('<input type="radio" class="btn-check" name="mslot" autocomplete="off">')
                .attr('id', id).val(t).prop('disabled', taken).prop('checked', !taken && t === pickedSlot);
            $s.append($in, $('<label class="btn btn-outline-dark btn-sm"></label>').attr('for', id).text(PawBookUtil.minutesTo12h(t)));
            if (!taken) avail.push(t);
        }
        if (avail.indexOf(pickedSlot) === -1) pickedSlot = null;     // chosen time no longer fits
        $hint.text(avail.length ? avail.length + ' times available. Your visit takes about ' + dur + ' minutes.' : 'No times left on this day. Try another date.');
      }

    // update the summary of selected services, total price, and duration
    function updateSummary() {
        var sv = selectedServices(), total = sv.reduce(function (t, s) { return t + priceOf(s); }, 0), dur = totalDuration();
        $('#mTotal').text(money(total));
        $('#mDuration').text(dur ? 'Duration: about ' + dur + ' minutes. Final price may vary by pet size and coat.' : '');
    }

    function openModify(ref) {
        var b = PawBookBookings.find(ref); 
        if (!b) return;
        var biz = (typeof PawBookBiz !== 'undefined') ? PawBookBiz.get(b.businessId) : null;
        if (!biz) { showAlert('danger', b.business + ' is no longer listed, so this appointment cannot be changed here.'); return; }
        
        editing = b; 
        editBiz = biz; 
        originalMin = PawBookUtil.hhmmaToMinutes(b.time); 
        pickedSlot = originalMin;

        $('#mError').addClass('d-none');
        $('#mBiz').text(biz.fields.bizName);
        $('#mPlace').text([biz.fields.bizAddress, biz.fields.bizCity].filter(Boolean).join(', '));
        $('#mPolicy').text(biz.fields.bizPolicy ? 'Policy: ' + biz.fields.bizPolicy : '');

        var $l = $('#mServices').empty();
        (biz.services || []).forEach(function (s, i) {
            var id = 'msvc' + i;
            var $r = $('<label class="list-group-item d-flex align-items-center gap-3" style="cursor:pointer;"></label>').attr('for', id);
            $r.append($('<input class="form-check-input flex-shrink-0 m-svc" type="checkbox">').attr('id', id).val(i)
                .prop('checked', (b.services || []).indexOf(s.name) !== -1));
            $r.append($('<div class="flex-grow-1"></div>')
                .append($('<div class="small fw-bold"></div>').text(s.name))
                .append($('<div class="small text-muted"></div>').text((s.time || '—') + ' min')));
            $r.append($('<div class="small fw-bold"></div>').text(money(priceOf(s))));
            $l.append($r);
        });

        var today = new Date(), maxD = new Date(today); maxD.setDate(maxD.getDate() + 60);
        $('#mDate').attr({ min: PawBookUtil.dateToIso(today), max: PawBookUtil.dateToIso(maxD) }).val(b.date);

        var names = pets.map(function (p) { return p.name; });
        if (b.pet && names.indexOf(b.pet) === -1) names.unshift(b.pet);
        var $p = $('#mPet').empty();
        names.forEach(function (n) { $p.append($('<option></option>').val(n).text(n)); });
        $p.val(b.pet);
        $('#mNotes').val(b.notes || '');

        buildSlots(); updateSummary();
        modifyModal.show();
    }

    $('#mServices').on('change', '.m-svc', function () { buildSlots(); updateSummary(); });
    $('#mDate').on('change', function () { buildSlots(); });
    $('#mSlots').on('change', 'input[name=mslot]', function () { pickedSlot = +this.value; });

    $('#modifyForm').on('submit', function (e) {
        e.preventDefault();
        var sv = selectedServices(), errs = [];
        if (!sv.length) errs.push('Select at least one service.');
        if (!$('#mDate').val()) errs.push('Choose a date.');
        else if (pickedSlot === null) errs.push('Pick an available time.');
        if (!$('#mPet').val()) errs.push('Select your pet.');
        if (errs.length) { $('#mError').text(errs.join(' ')).removeClass('d-none'); return; }

        var newDate = $('#mDate').val(), newTime = PawBookUtil.minutesTo12h(pickedSlot), names = sv.map(function (s) { return s.name; });
        var changed = newDate !== editing.date || newTime !== editing.time || names.join('|') !== (editing.services || []).join('|');

        editing.date = newDate; 
        editing.time = newTime; 
        editing.services = names;
        editing.total = sv.reduce(function (t, s) { return t + priceOf(s); }, 0);
        editing.pet = $('#mPet').val(); editing.notes = $('#mNotes').val().trim();
        var reconfirm = changed && editing.status === 'Confirmed';
        if (reconfirm) editing.status = 'Pending';       

        save(); 
        render();
        modifyModal.hide();
        showAlert('success', 'Your appointment at ' + editing.business + ' was updated for ' + PawBookUtil.formatDate(editing.date) + ' at ' + editing.time + '.' + (reconfirm ? ' The shop will confirm the change.' : ''));
    });

    render();
});