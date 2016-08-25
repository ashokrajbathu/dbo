! function(a, b, c) {
    var d = b.Jobs = b.Jobs || {};
    d.AgentClass = function(a) { this.page = a }, d.AgentClass.prototype.toggleCheckedClasses = function(b) {
        var d = this.page,
            e = c(".team-filter").find("input[value='all']"),
            f = e.parent(),
            g = c(b),
            h = g.find("input");
        h.val();
        if (0 == c("#ie8").length) h.is(":checked") ? d.setChecked(g, h) : d.setChecked(f, e);
        else {
            for (var i = a.getElementsByTagName("input"), j = !1, k = 0; k < i.length; k++) i[k].checked && (j = !0);
            j ? d.setChecked(g, h) : d.setChecked(f, e) } }, d.AgentClass.prototype.scrollToJobOpenings = function() {
        var a = (this.page, 60);
        c(b).width() <= 469 && (a = 20), c("html, body").animate({ scrollTop: c("#job_postings_anchor").offset().top - a }, "slow") } }(document, window, jQuery);
