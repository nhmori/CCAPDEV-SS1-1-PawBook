$(function () {
    // populate featured businesses
    PawBookBiz.all().slice(0, 4).forEach(function (b) {
        var fl = b.fields;
        var $body = $('<div class="card-body"></div>')
          .append($('<h5 class="card-title h6"></h5>').text(fl.bizName));
        if (b.rating) {
          $body.append($('<p class="small mb-1"></p>').text('★ ' + b.rating.score + ' ')
            .append($('<span class="text-muted"></span>').text('(' + b.rating.count + ' reviews)')));
        }
        $body.append($('<p class="small text-muted mb-2"></p>').text(fl.bizCity));
        var $badges = $('<div class="d-flex flex-wrap gap-1 mb-3"></div>');
        (b.services || []).slice(0, 2).forEach(function (s) {
          $badges.append($('<span class="badge bg-light text-dark border"></span>').text(s.name));
        });
        $body.append($badges);
        $body.append($('<a class="btn btn-outline-dark btn-sm w-100">VIEW PROFILE</a>').attr('href', 'business-profile.html?id=' + b.id));

        var $card = $('<div class="card h-100"></div>')
          .append(PawBookBiz.photo(b.image, 160, fl.bizName))
          .append($body);
        $('#featuredList').append($('<div class="col-md-6 col-lg-3"></div>').append($card));
      });

    // populate hero location filter
    PawBookBiz.cities().forEach(function (c) { 
        $('#hLocation').append($('<option></option>').val(c).text(c)); 
    });

    // populate hero service filters
    PawBookBiz.serviceNames().forEach(function (n) { 
        $('#hService').append($('<option></option>').val(n).text(n)); 
    });

    // go to find-groomer page with query params
    function go(p) {
        var qs = $.param(p);
        window.location.href = 'find-groomer.html' + (qs ? '?' + qs : '');
    }

    // handle hero search form
    $('#heroSearch').on('submit', function (e) {
        e.preventDefault();
        var q = $('#heroQ').val().trim();
        go(q ? { q: q } : {});
    });

    // handle hero filter form
    $('#homeFilter').on('submit', function (e) { 
        e.preventDefault();
        var p = {};
        [['location', '#hLocation'], ['service', '#hService'], ['price', '#hPrice'], ['rating', '#hRating']].forEach(function (x) { 
            var v = $(x[1]).val();
            if (v) p[x[0]] = v;
        });
        go(p);
    });
});