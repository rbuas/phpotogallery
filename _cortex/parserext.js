/*
meu texto *titulo1* exemplo para #tèg1 e #tag2 @myplace1 and@myplace2
com #tag3 e#ta+g4 com [user1] e[user2] em **titulo2** para ver
{media1}e{media2} em ***titulo3*** 
*/
parserext = (function ($) {

    var parserext = {
        macth: function (str, regexp) {
            return str.match(regexp);
        },

        matchClean : function (matches, start, end) {
            if(!matches)
                return;

            var cleanmatches = [];
            for(var m in matches) {
                if(!matches.hasOwnProperty(m))
                    continue;

                var value = matches[m];
                if(!value)
                    continue;

                if(start) value = value.replace(new RegExp(start, 'i'), "");
                if(end) value = value.replace(new RegExp(end, 'i'), "");
                if(!value)
                    continue;

                cleanmatches.push(value);
            }
            return cleanmatches;
        },

        matchAllBetween: function (start, end) {
            start = start || "";
            end = end || "";

            var regexp = new RegExp(start + "(.*?)" + end, "gi");
            return this.matchClean(this.macth(regexp), start, end);
        },

        macthAllTags: function (str) {
            var regexp = new RegExp("#+([^\\s]+)", "gi");
            return this.matchClean(this.macth(str, regexp), "#+");
        },

        replaceAllTags: function (str) {
            var regexp = new RegExp("#+([^\\s]+)", "gi");
            return str.replace(regexp, "<span class=\"tag\">$1</span>");
        },

        macthAllMedias: function (str) {
            var regexp = new RegExp("\\{+(.*?)\\}+", "gi");
            return this.matchClean(this.macth(str, regexp), "\\{+", "\\}+");
        },

        replaceAllMedias: function (str) {
            var regexp = new RegExp("\\{+(.*?)\\}+", "gi");
            return str.replace(regexp, "<span class=\"media\">$1</span>");
        },

        macthAllTitles: function (str) {
            var regexp = new RegExp("\\*+(.*?)\\*+", "gi");
            return this.matchClean(this.macth(str, regexp), "\\*+", "\\*+");
        },

        replaceAllTitles: function (str) {
            var regexp = new RegExp("\\*+(.*?)\\*+", "gi");
            return str.replace(regexp, "<span class=\"title\">$1</span>");
        },

        macthAllUsers: function (str) {
            var regexp = new RegExp("\\[+(.*?)\\]+", "gi");
            return this.matchClean(this.macth(str, regexp), "\\[+", "\\]+");
        },

        replaceAllUsers: function (str) {
            var regexp = new RegExp("\\[+(.*?)\\]+", "gi");
            return str.replace(regexp, "<span class=\"user\">$1</span>");
        },

        macthAllPlaces: function (str) {
            var regexp = new RegExp("@+([^\\s]+)", "gi");
            return this.matchClean(this.macth(str, regexp), "@+");
        },

        replaceAllPlaces: function (str) {
            var regexp = new RegExp("@+([^\\s]+)", "gi");
            return str.replace(regexp, "<span class=\"place\">$1</span>");
        }
    };

    return parserext;
})(jQuery);