String.prototype.rightChars = function(a) {
        return a <= 0 ? "" : a > this.length ? this : this.substring(this.length, this.length - a) },
    function(a) {
        var b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q = { highlightSpeed: 20, typeSpeed: 100, clearDelay: 500, typeDelay: 200, clearOnHighlight: !0, typerDataAttr: "data-typer-targets", typerInterval: 2e3, color: "#000000", backgroundColor: "#ffffff", backgroundColorOpacity: 1, pickWordsRandomly: 0 },
            r = [],
            s = 0,
            t = a("html").attr("dir");
        e = function(b, c) {
            return "rgba(0, 0, 0, 0)" === b && (b = "rgb(255, 255, 255)"), a("<span></span>").css("color", b).css("background-color", c) }, i = function(a) {
            return !isNaN(parseFloat(a)) && isFinite(a) }, h = function(a) { a.removeData("typePosition"), a.removeData("highlightPosition"), a.removeData("leftStop"), a.removeData("rightStop"), a.removeData("primaryColor"), a.removeData("backgroundColor"), a.removeData("text"), a.removeData("typing"), a.removeData("typePosition") }, d = function(a) {
            var b = a.data("text"),
                c = a.data("oldLeft"),
                e = a.data("oldRight");
            return b && 0 !== b.length ? ("rtl" !== t ? a.text(c + b.charAt(0) + e).data({ oldLeft: c + b.charAt(0), text: b.substring(1) }) : a.text(c + b.charAt(b.length - 1) + e).data({ oldRight: b.charAt(b.length - 1) + e, text: b.substring(0, b.length - 1) }), void setTimeout(function() { d(a) }, l())) : void h(a) }, c = function(a) { a.find("span").remove(), setTimeout(function() { d(a) }, g()) }, b = function(a) {
            var d, g, h, j = a.data("highlightPosition");
            if ("rtl" !== t) {
                if (i(j) || (j = a.data("rightStop") + 1), j <= a.data("leftStop")) return void setTimeout(function() { c(a) }, f());
                d = a.text().substring(0, j - 1), g = a.text().substring(j - 1, a.data("rightStop") + 1), h = a.text().substring(a.data("rightStop") + 1), a.html(d).append(e(n(), o()).append(g)).append(h), a.data("highlightPosition", j - 1), setTimeout(function() {
                    return b(a) }, k()) } else {
                if (i(j) || (j = a.data("leftStop")), j > a.data("rightStop")) return void setTimeout(function() { c(a) }, f());
                d = a.text().substring(0, a.data("leftStop")), g = a.text().substring(a.data("leftStop"), j + 1), h = a.text().substring(j + 1, a.text().length), a.html(d).append(e(n(), o()).append(g)).append(h), a.data("highlightPosition", j + 1), setTimeout(function() {
                    return b(a) }, k()) } }, j = function(b) {
            var c;
            if (!b.data("typing")) {
                try { c = JSON.parse(b.attr(a.typer.options.typerDataAttr)).targets } catch (a) {} "undefined" == typeof c && (c = a.map(b.attr(a.typer.options.typerDataAttr).split(","), function(b) {
                    return a.trim(b) })), p = c.length, a.typer.options.pickWordsRandomly === !0 ? (b.typeTo(c[s]), randomizeTyperPosition()) : (b.typeTo(c[s]), advanceTyperPosition()) } }, a.typer = function() {
            return { options: q } }(), a.extend(a.typer, { options: q }), a.fn.typer = function() {
            var b = a(this);
            return b.each(function() {
                var b = a(this); "undefined" != typeof b.attr(a.typer.options.typerDataAttr) && (j(b), setInterval(function() { j(b) }, m())) }) }, a.fn.typeTo = function(c) {
            var d = a(this),
                e = d.text(),
                f = 0,
                g = 0;
            if (e === c) return d;
            if (e !== d.html()) return console.error("Typer does not work on elements with child elements."), d;
            for (d.data("typing", !0); e.charAt(f) === c.charAt(f);) f++;
            for (; e.rightChars(g) === c.rightChars(g);) g++;
            return c = c.substring(f, c.length - g + 1), d.data({ oldLeft: e.substring(0, f), oldRight: e.rightChars(g - 1), leftStop: f, rightStop: e.length - g, primaryColor: d.css("color"), backgroundColor: d.css("background-color"), text: c }), b(d), d }, k = function() {
            return a.typer.options.highlightSpeed }, l = function() {
            return a.typer.options.typeSpeed }, f = function() {
            return a.typer.options.clearDelay }, g = function() {
            return a.typer.options.typeDelay }, m = function() {
            return a.typer.options.typerInterval }, n = function() {
            var b = u(a.typer.options.color);
            return "rgb(" + b.r + ", " + b.g + ", " + b.b + ")" }, o = function() {
            var b = u(a.typer.options.backgroundColor),
                c = a.typer.options.backgroundColorOpacity;
            return 0 == a("#ie8").length && 0 == a("#ie9").length ? "rgba(" + b.r + ", " + b.g + ", " + b.b + ", " + c + ")" : "rgb(" + b.r + ", " + b.g + ", " + b.b + ")" }, randomizeTyperPosition = function() {
            var b = !0;
            a.each(r, function(a, c) { c || (b = !1) }), b && initializeTyperPosition();
            do s = Math.floor(Math.random() * p); while (r[s] === !0);
            r[s] = !0 }, initializeTyperPosition = function() { r = [];
            for (var a = 0; a < p; a++) r.push(!1) }, advanceTyperPosition = function() { s++, s >= p && (s = 0) };
        var u = function(a) {
            var b = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            a = a.replace(b, function(a, b, c, d) {
                return b + b + c + c + d + d });
            var c = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(a);
            return c ? { r: parseInt(c[1], 16), g: parseInt(c[2], 16), b: parseInt(c[3], 16) } : null } }(jQuery);
