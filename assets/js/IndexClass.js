! function(a, b, c) {
    var d = b.Jobs;
    if ("undefined" == typeof d || "undefined" == typeof d.PageClass || "undefined" == typeof d.AgentClass) throw "Missing dependency";
    c(a).ready(function() {
        var a = new d.PageClass,
            e = new d.AgentClass(a),
            f = a.getQuery(),
            g = !1;
        f = c.isEmptyObject(f) ? { type: "all" } : f, "job_details" === f.from && (g = !0), a.refreshCheckedGenres(), a.parseSearchAndFetch({ filter: f.type, addHistory: !0 }), b.onload = function() { g && e.scrollToJobOpenings() }, c("#ie8").length > 0 && c(".team-list").delegate(".team-filter", "click", function() {
            var a = c(this).find("input");
            a.attr("checked") && a.attr("checked", !1), a.change(), a.blur(), a.focus() }), c(".team-list").delegate(".team-filter", "change", function() { a.clearColumns(), e.toggleCheckedClasses(this) }), c(".openings-button").click(function() { e.scrollToJobOpenings() });
        var h = "MainHero.jpg";
        c(b).width() <= 480 && (h = "MainHero_mobile.jpg"), c("<img/>").attr("src", "/i/jobs/" + h).load(function() { c(this).remove(), c("#img_section").addClass("hero-bg") }), c("<img/>").attr("src", "/i/jobs/make-friends.jpg").load(function() { c(this).remove(), c("#friends_banner").addClass("friends-bg") }), c.typer.options.typerInterval = 4e3, c.typer.options.color = "#FFFFFF", c.typer.options.backgroundColor = "#658CBF", c.typer.options.backgroundColorOpacity = 0, c(".intro-text > span[data-typer-targets]").typer() }) }(document, window, jQuery);
