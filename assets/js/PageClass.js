! function(a, b, c) {
    var d = b.Jobs = b.Jobs || {};
    d.PageClass = function() { this.is_subcat_selected = this.getViewData("is-subcat-selected"), this.add_history = null, this.filter = null, this.prev_group_float = null }, d.PageClass.prototype.getViewData = function(a) {
        return c("#view-data").data(a) }, d.PageClass.prototype.refreshCheckedGenres = function() {
        var a = this,
            b = a.getQuery();
        if (c(".team-filter").removeClass("checked"), "type" in b) {
            var d = b.type.split(",");
            for (var e in d) c(".team-filter[data-department-filter='" + d[e] + "']").addClass("checked") } else c(".team-filter[data-department-filter='all']").addClass("checked") }, d.PageClass.prototype.parseSearchAndFetch = function(a) {
        var d = this; "undefined" == typeof a && (a = {}), d.filter = a.filter, d.addHistory = !!a.addHistory && a.addHistory;
        var e = [],
            f = { type: d.filter };
        d.addHistory && (e.push(["type", f.type].join("=")), e = e.join("&"), e && (e = "?" + e), 0 == c("#ie8").length && 0 == c("#ie9").length && b.history.pushState({}, "Jobs", b.location.pathname + e)), d.showGroup(f.type) }, d.PageClass.prototype.showGroup = function(a) {
        var b = this; "all" === a ? c(".department").show() : (c(".department[data-department-team='" + a + "']").show(), c(".department:not([data-department-team='" + a + "'])").hide()), b.realignGroups(a) }, d.PageClass.prototype.setChecked = function(a, b) {
        var d = this;
        c(".team-filter").removeClass("checked").each(function() { c(this).find("input").removeAttr("checked") }), d.parseSearchAndFetch({ filter: b.val(), addHistory: !0 }), b.attr("checked", "checked"), a.toggleClass("checked") }, d.PageClass.prototype.getQuery = function() {
        for (var a = b.location.search.substring(1), c = a.split("&"), d = {}, e = 0; e < c.length; e++)
            if ("" !== c[e]) {
                var f = c[e].split("=");
                d[decodeURIComponent(f[0])] = decodeURIComponent(f[1]) }
        return d }, d.PageClass.prototype.realignGroups = function(a) {
        if ("all" === a) {
            var b = 1,
                d = 1,
                e = [0, 0, 0, 0],
                f = [0, 0, 0, 0];
            c(".department").each(function() {
                if ("US" === c(this).data("locale")) {
                    if (b <= 3) e[b] = c(this).clone().appendTo("#postings_US .column-" + b).height();
                    else {
                        for (var a = 0, g = 99999, h = 1; h <= 3; h++) e[h] < g && (a = h, g = e[h]);
                        e[a] += c(this).clone().appendTo("#postings_US .column-" + a).height() }
                    b++ } else {
                    if (d <= 3) f[d] = c(this).clone().appendTo("#postings_intl .column-" + d).height();
                    else {
                        for (var a = 0, g = 99999, h = 1; h <= 3; h++) f[h] < g && (a = h, g = f[h]);
                        f[a] += c(this).clone().appendTo("#postings_intl .column-" + a).height() }
                    d++ } }) } else c(".department[data-department-team='" + a + "']").each(function() { "US" === c(this).data("locale") ? c(this).clone().appendTo("#postings_US .column-1") : c(this).clone().appendTo("#postings_intl .column-1") }) }, d.PageClass.prototype.clearColumns = function() { c(".column-1").empty(), c(".column-2").empty(), c(".column-3").empty() } }(document, window, jQuery);
