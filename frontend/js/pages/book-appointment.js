// redirect to find-groomer.html if no business id is provided in the query string
(function () {
    var params = new URLSearchParams(window.location.search);
    var bizId = parseInt(params.get('id'), 10);
    if (!bizId) {
        window.location.replace('find-groomer.html');
        return;
    }
})();

$(function () {
    var OWNER_ID = 1;
    var PROFILE_KEY = 'pawbook_business_profile';
    var DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    var SLOT_STEP = 30; // minutes

    var _id = parseInt(new URLSearchParams(window.location.search).get('id'), 10);
    if (_id) $('#backLink, #cancelLink').attr('href', 'business-profile.html?id=' + _id);

    if (typeof mockBusinesses === 'undefined') {
        $('#bookingForm').addClass('d-none');
        $('#alertRegion').html('<div class="alert alert-secondary small">Business data could not be loaded. Check that js/businesses-data.js is included.</div>');
        return;
    }

    // load pets from localStorage or mock data
    var pets = [];
    var rawPets = localStorage.getItem('pawbook_pets_v2');
    if (rawPets !== null) {
        try { 
            pets = JSON.parse(rawPets) || []; 
        } catch (e) { pets = []; }
    } else if (typeof mockCustomerPets !== 'undefined') {
        pets = mockCustomerPets;
    }

    // redirect to find-groomer.html if the business id is invalid
    var params = new URLSearchParams(window.location.search);
    var bizId = parseInt(params.get('id'), 10);
    if (!bizId || !mockBusinesses.some(function (b) { return b.id === bizId; })) {
        window.location.replace('find-groomer.html');
        return;
    }
    var biz = null, data = null;

    // wrapper for PawBookUtil helpers
    function showAlert(type, msg) { PawBookUtil.showAlert($('#alertRegion'), type, msg); }
    function priceOf(s) { return PawBookUtil.priceOf(s); }

    // load business data based on the provided business id, and update the UI accordingly
    function loadBusiness(id) {
        biz = mockBusinesses.filter(function (b) { return b.id === id; })[0];
        bizId = biz.id;
        data = { fields: biz.fields, services: biz.services, hours: biz.hours };
        if (biz.id === OWNER_ID) {
            try {
                var saved = JSON.parse(localStorage.getItem(PROFILE_KEY));
                if (saved && saved.fields && saved.fields.bizName) data = saved;
            } catch (e) {}
        }
        $('#bizName').text(data.fields.bizName);
        $('#bizPlace').text([data.fields.bizAddress, data.fields.bizCity].filter(Boolean).join(', '));
        document.title = 'PawBook — Book ' + data.fields.bizName;
        $('#backLink, #cancelLink').attr('href', 'business-profile.html?id=' + bizId);
        $('#sumBiz').text(data.fields.bizName);
        $('#sumLocation').text([data.fields.bizAddress, data.fields.bizCity].filter(Boolean).join(', '));
        $('#policyText').text(data.fields.bizPolicy || '');
        buildServices(); buildSlots(); updateSummary();
    }

    // build the list of services offered by the business, allowing users to select them
    function buildServices() {
        var $l = $('#serviceList').empty();
        var preselect = (params.get('service') || '').toLowerCase();
        (data.services || []).forEach(function (s, i) {
            var id = 'svc' + i;
            var $row = $('<label class="list-group-item d-flex align-items-center gap-3" style="cursor:pointer;"></label>').attr('for', id);
            $row.append($('<input class="form-check-input flex-shrink-0 svc-check" type="checkbox">').attr('id', id).val(i)
                .prop('checked', preselect && s.name.toLowerCase() === preselect));
            $row.append($('<div class="flex-grow-1"></div>')
                .append($('<div class="small fw-bold"></div>').text(s.name))
                .append($('<div class="small text-muted"></div>').text((s.time || '—') + ' min')));
            $row.append($('<div class="small fw-bold"></div>').text(PawBookUtil.money(priceOf(s))));
            $l.append($row);
        });
    }

    // get the list of selected services based on user input
    function selectedServices() {
        return $('.svc-check:checked').map(function () { return data.services[+this.value]; }).get();
    }

    // update the summary section based on selected services, date, time slot, and pet
    $('#serviceList').on('change', '.svc-check', function () { buildSlots(); updateSummary(); });

    // set the minimum and maximum selectable dates for appointments, and handle date changes
    var today = new Date();
    $('#apptDate').attr('min', PawBookUtil.dateToIso(today));
    var maxD = new Date(today); maxD.setDate(maxD.getDate() + 60);
    $('#apptDate').attr('max', PawBookUtil.dateToIso(maxD));
    $('#apptDate').on('change', function () { 
        buildSlots(); updateSummary(); 
    });

    // calculate the total duration of selected services in minutes
    function totalDuration() {
        return selectedServices().reduce(function (t, s) { return t + (Number(s.time) || 60); }, 0);
    }

    // build the list of available time slots based on the selected date and total duration of services
    function buildSlots() {
        var $s = $('#slotList').empty();
        var date = $('#apptDate').val(), dur = totalDuration();
        var $hint = $('#slotHint');
        if (!dur) { $hint.text('Choose at least one service to see available times.'); return; }
        if (!date) { $hint.text('Choose a date to see available times.'); return; }

        // simulate available slots based on business hours and current time
        var d = PawBookUtil.isoToDate(date);
        var h = (data.hours || {})[DAYS[(d.getDay() + 6) % 7]];
        if (!h || h.closed) { $hint.text(data.fields.bizName + ' is closed on this day. Try another date.'); return; }

        // calculate the opening and closing times in minutes, and generate time slots accordingly
        var open = PawBookUtil.hhmmToMinutes(h.open), close = PawBookUtil.hhmmToMinutes(h.close);
        var nowMin = (date === PawBookUtil.dateToIso(today)) ? today.getHours() * 60 + today.getMinutes() + 30 : -1;
        var count = 0;
        for (var t = open; t + dur <= close; t += SLOT_STEP) {
            var id = 'slot' + t;
            var taken = (PawBookUtil.stableHash(bizId + date + t) % 5 === 0) || t < nowMin; // simulated availability
            var $in = $('<input type="radio" class="btn-check" name="slot" autocomplete="off">').attr('id', id).val(t).prop('disabled', taken);
            var $lb = $('<label class="btn btn-outline-dark btn-sm"></label>').attr('for', id).text(PawBookUtil.minutesTo12h(t));
            $s.append($in, $lb);
            if (!taken) count++;
        }
        $hint.text(count ? count + ' times available. Your visit takes about ' + dur + ' minutes.' : 'No times left on this day. Try another date.');
    }
    $('#slotList').on('change', 'input[name=slot]', updateSummary);

    // build the list of pets for selection, including an option to add a new pet
    function buildPets() {
        var $p = $('#petList').empty();
        pets.forEach(function (p, i) {
            var id = 'pet' + i;
            var $col = $('<div class="col-6 col-md-4"></div>');
            $col.append($('<input type="radio" class="btn-check" name="pet" autocomplete="off">').attr('id', id).val(i));
            $col.append($('<label class="btn btn-outline-dark w-100 text-start"></label>').attr('for', id)
                .append($('<div class="small fw-bold"></div>').text(p.name))
                .append($('<div class="small opacity-75"></div>').text(p.breed || '')));
            $p.append($col);
        });
        var $new = $('<div class="col-6 col-md-4"></div>');
        $new.append('<input type="radio" class="btn-check" name="pet" id="petNew" value="new" autocomplete="off">');
        $new.append('<label class="btn btn-outline-dark w-100 text-start" for="petNew"><div class="small fw-bold">+ Add new pet</div><div class="small opacity-75">Enter details</div></label>');
        $p.append($new);
    }
    $('#petList').on('change', 'input[name=pet]', function () {
        $('#newPetFields').toggleClass('d-none', $('input[name=pet]:checked').val() !== 'new');
        updateSummary();
    });
    $('#newPetName').on('input', updateSummary);

    // get the name of the selected pet, handling both existing pets and new pet entries
    function selectedPetName() {
        var v = $('input[name=pet]:checked').val();
        if (v === undefined) return '';
        if (v === 'new') return $('#newPetName').val().trim();
        return pets[+v].name;
    }

    // update the summary section with selected services, date, time, pet, and total cost
    function updateSummary() {
        var sv = selectedServices(), dur = totalDuration();
        var $l = $('#sumServices').empty();
        if (!sv.length) $l.append('<li class="text-muted">None selected</li>');
        var total = 0;
        sv.forEach(function (s) {
            total += priceOf(s);
            $l.append($('<li class="d-flex justify-content-between mb-1"></li>')
                .append($('<span></span>').text(s.name)).append($('<span></span>').text(PawBookUtil.money(priceOf(s)))));
        });
        $('#sumTotal').text(PawBookUtil.money(total));
        $('#sumDuration').text(dur ? dur + ' min' : '—');
        var date = $('#apptDate').val();
        $('#sumDate').text(date ? PawBookUtil.formatDate(date) : '—');
        var slot = $('input[name=slot]:checked').val();
        $('#sumTime').text(slot !== undefined ? PawBookUtil.minutesTo12h(+slot) : '—');
        $('#sumPet').text(selectedPetName() || '—');
    }

    // handle form submission for booking an appointment, including validation, saving the booking, and displaying a confirmation
    $('#bookingForm').on('submit', function (e) {
        // prevent the default form submission behavior
        e.preventDefault();

        // validate the form fields and selected options, collecting any errors
        var form = this, errors = [];
        $(form).addClass('was-validated');
        if (!selectedServices().length) errors.push('Select at least one service.');
        if (!$('#apptDate').val()) errors.push('Choose a date.');
        else if ($('input[name=slot]:checked').val() === undefined) errors.push('Pick an available time.');
        if ($('input[name=pet]:checked').val() === undefined) errors.push('Select your pet.');
        $('#newPetName').prop('required', $('input[name=pet]:checked').val() === 'new');
        if (errors.length || !form.checkValidity()) {
            showAlert('danger', errors.length ? errors.join(' ') : 'Some required fields are missing or invalid. Check the highlighted fields and try again.');
            $('html, body').animate({ scrollTop: 0 }, 200);
            return;
        }

        // simulate sending the booking data and saving it to localStorage, then display a confirmation message
        var $btn = $('#confirmBtn').prop('disabled', true).text('SENDING...');
        setTimeout(function () {
            var sv = selectedServices(), total = sv.reduce(function (t, s) { return t + priceOf(s); }, 0);
            var ref = 'PB-' + Math.random().toString(36).slice(2, 8).toUpperCase();
            var slot = +$('input[name=slot]:checked').val();
            var booking = {
                ref: ref, businessId: bizId, business: data.fields.bizName,
                date: $('#apptDate').val(), time: PawBookUtil.minutesTo12h(slot), pet: selectedPetName(),
                services: sv.map(function (s) { return s.name; }), total: total, status: 'Pending',
                customer: { name: $('#custName').val().trim(), phone: $('#custPhone').val().trim(), email: $('#custEmail').val().trim() },
                notes: $('#custNotes').val().trim()
            };
            
            // save using booking-data.js
            var all = PawBookBookings.read();
            all.push(booking);
            PawBookBookings.save(all);

            // display the confirmation details to the user
            $('#confRef').text(ref);
            $('#confBiz').text(booking.business);
            $('#confDate').text(PawBookUtil.formatDate(booking.date));
            $('#confTime').text(booking.time);
            $('#confPet').text(booking.pet);
            $('#confServices').text(booking.services.join(', '));
            $('#confTotal').text(PawBookUtil.money(total));
            $('#bookingForm, #alertRegion').addClass('d-none');
            $('#confirmation').removeClass('d-none');
            $('html, body').animate({ scrollTop: 0 }, 200);
        }, 800);
    });

    // initialize the page by building the list of pets and loading the business data based on the provided business id
    buildPets();
    loadBusiness(bizId);
});