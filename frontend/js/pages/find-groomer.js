$(function () {
    var businesses = PawBookBiz.all();

    // populate location filter
    PawBookBiz.cities().forEach(function (c) { 
        $('#fgLocation').append($('<option></option>').val(c).text(c)); 
    });

    // populate service filter
    PawBookBiz.serviceNames().forEach(function (n) { 
        $('#fgService').append($('<option></option>').val(n).text(n)); 
    });

    // populate form values from query string
    var params = new URLSearchParams(window.location.search);
    $('#fgSearch').val(params.get('q') || '');
    $('#fgLocation').val(params.get('location') || '');
    $('#fgService').val(params.get('service') || '');
    $('#fgPrice').val(params.get('price') || '');
    $('#fgRating').val(params.get('rating') || '');
    if ($('#fgLocation').val() === null) $('#fgLocation').val('');
    if ($('#fgService').val() === null) $('#fgService').val('');

    // filter values from form
    function filters() { 
        return {
            q: $('#fgSearch').val().trim().toLowerCase(),
            location: $('#fgLocation').val(),
            service: $('#fgService').val(),
            price: $('#fgPrice').val(),
            rating: $('#fgRating').val(),
            open: $('#open').is(':checked')
        };
    }

    // check if a business matches the filters
    function matches(b, f) {
        var fl = b.fields;
        if (f.q) {
            var hay = [fl.bizName, fl.bizType, fl.bizTagline, fl.bizCity, fl.bizAddress]
            .concat((b.services || []).map(function (s) { return s.name; })).join(' ').toLowerCase();
            var ok = f.q.split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
            if (!ok) return false;
        }
        if (f.location && fl.bizCity !== f.location) return false;
        if (f.service && !(b.services || []).some(function (s) { return s.name === f.service; })) return false;
        if (f.price && PawBookBiz.priceTier(b) !== +f.price) return false;
        if (f.rating && (!b.rating || b.rating.score < +f.rating)) return false;
        if (f.open && !PawBookBiz.isOpenNow(b)) return false;
        return true;
    }

    // sorting functions
    function minPrice(b) { 
        var r = PawBookBiz.priceRange(b); return r ? r.min : Infinity; 
    }
    var SORTS = {
        rating:  function (a, b) { return ((b.rating || {}).score || 0) - ((a.rating || {}).score || 0); },
        reviews: function (a, b) { return ((b.rating || {}).count || 0) - ((a.rating || {}).count || 0); },
        price:   function (a, b) { return minPrice(a) - minPrice(b); },
        name:    function (a, b) { return a.fields.bizName.localeCompare(b.fields.bizName); }
    };

    // badge builder
    function badge(text) { 
        return $('<span class="badge bg-light text-dark border"></span>').text(text); 
    }

    // card builder
    function card(b) {
        var fl = b.fields, open = PawBookBiz.isOpenNow(b), range = PawBookBiz.priceRange(b);

        var $top = $('<div class="d-flex justify-content-between align-items-start"></div>');
        $top.append($('<h5 class="card-title h6 mb-1"></h5>').text(fl.bizName));
        $top.append($('<span class="badge"></span>').addClass(open ? 'bg-dark' : 'bg-secondary').text(open ? 'Open' : 'Closed'));

        var $body = $('<div class="card-body"></div>').append($top);
        if (b.rating) {
            $body.append($('<p class="small mb-1"></p>').text('★ ' + b.rating.score + ' ')
            .append($('<span class="text-muted"></span>').text('(' + b.rating.count + ' reviews)')));
        }
        $body.append($('<p class="small text-muted mb-2"></p>')
            .text([fl.bizAddress, fl.bizCity].filter(Boolean).join(', ') + ' · ' + PawBookBiz.hoursLabel(b)));

        var $badges = $('<div class="d-flex flex-wrap gap-1 mb-3"></div>');
        (b.services || []).forEach(function (s) { $badges.append(badge(s.name)); });
        $body.append($badges);

        var $actions = $('<div class="d-flex gap-2"></div>')
            .append($('<a class="btn btn-outline-dark btn-sm">VIEW PROFILE</a>').attr('href', 'business-profile.html?id=' + b.id))
            .append($('<a class="btn btn-dark btn-sm">BOOK</a>').attr('href', 'book-appointment.html?id=' + b.id));
        $body.append($('<div class="d-flex flex-wrap justify-content-between align-items-center gap-2"></div>')
            .append($('<span class="small"></span>').text(range ? '₱' + range.min.toLocaleString() + ' - ₱' + range.max.toLocaleString() : ''))
            .append($actions));

        var $img = PawBookBiz.photo(b.image, 'fill', fl.bizName);
        return $('<div class="card mb-3"></div>').append(
            $('<div class="row g-0"></div>')
            .append($('<div class="col-md-3"></div>').append($img))
            .append($('<div class="col-md-9"></div>').append($body)));
    }

    // render results
    function render() {
        var f = filters();
        var list = businesses.filter(function (b) { return matches(b, f); }).sort(SORTS[$('#fgSort').val()]);
        var $l = $('#groomerList').empty();
        list.forEach(function (b) { $l.append(card(b)); });
        $('#resultCount').empty().append($('<b></b>').text(list.length)).append(' ' + (list.length === 1 ? 'groomer' : 'groomers') + ' found');
        $('#noResults').toggleClass('d-none', list.length > 0);
    }

    // handle form events
    $('#filterForm').on('submit', function (e) { 
        e.preventDefault(); render(); 
    });

    // reset form and re-render after a short delay to allow the reset to take effect
    $('#filterForm').on('reset', function () { 
        setTimeout(render, 0); 
    });
    $('#fgLocation, #fgService, #fgPrice, #fgRating, #open, #fgSort').on('change', render);
    $('#fgSearch').on('input', render);

    render();
});