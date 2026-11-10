$(function () {
    var KEY = 'pawbook_posts';

    // load and save posts from localStorage
    function loadPosts() {
        return PawBookUtil.readList(KEY);
    }
  
    // save posts to localStorage
    function savePosts() {
        localStorage.setItem(KEY, JSON.stringify(posts));
    }
  
    var posts = loadPosts();

    // get the author's name from localStorage or return a default
    function authorName() {
        try {
            var a = JSON.parse(localStorage.getItem('pawbook_account'));
            if (a && a.name) return a.name;
        } catch (e) {}
        return 'Juan Dela Cruz';
    }

    // render the list of posts in the UI
    function render() {
        var $wrap = $('#newPosts').empty();
        posts.forEach(function (p) {
        var $body = $('<div class="card-body"></div>');

        var $head = $('<div class="d-flex align-items-center mb-2"></div>');
        $head.append('<div class="bg-secondary rounded-circle me-2" style="width:32px;height:32px;"></div>');
        var $who = $('<div></div>');
        $who.append($('<small class="fw-bold d-block"></small>').text(p.author));
        $who.append($('<small class="text-muted"></small>').text(PawBookUtil.relativeTime(p.ts)));
        $head.append($who);
        $head.append($('<span class="badge bg-light text-dark border ms-auto"></span>').text(p.kind === 'Business' ? ('Business' + (p.type ? ' · ' + p.type : '')) : 'Customer'));
        $body.append($head);

        if (p.title) $body.append($('<h3 class="h6 fw-bold"></h3>').text(p.title));
        $body.append($('<p class="small" style="white-space:pre-wrap;"></p>').text(p.text));

        var $actions = $('<div class="d-flex gap-2"></div>');
        var $like = $('<button type="button" class="btn btn-sm"></button>')
            .addClass(p.liked ? 'btn-dark' : 'btn-outline-dark')
            .text('♥ ' + p.likes)
            .on('click', function () {
            p.liked = !p.liked;
            p.likes += p.liked ? 1 : -1;
            savePosts();
            render();
            });
        $actions.append($like);
        $actions.append('<button type="button" class="btn btn-outline-dark btn-sm">💬 0</button>');
        $actions.append('<button type="button" class="btn btn-outline-dark btn-sm">SHARE</button>');
        $body.append($actions);

        $wrap.append($('<div class="card mb-3"></div>').append($body));
        });
    }

    // show a message in the post form area
    function showMsg(type, html) {
        $('#postMsg').removeClass('d-none alert-success alert-danger').addClass('alert-' + type).html(html);
    }

    // handle post form submission
    $('#postForm').on('submit', function (e) {
        e.preventDefault();
        var text = $('#postText').val().trim();

        // soft auth check
        if (!PawBookAuth.isLoggedIn()) {
            showMsg('danger', 'Please <a href="login-signup.html" class="alert-link">log in</a> to post.');
            return;
        }
        if (!text) {
            showMsg('danger', 'Write something before posting.');
            return;
        }

        posts.unshift({ id: Date.now(), author: authorName(), text: text, ts: Date.now(), likes: 0, liked: false });
        savePosts();
        render();
        $('#postText').val('');
        showMsg('success', 'Your post is live.');
    });

    render();
});