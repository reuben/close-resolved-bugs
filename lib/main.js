var buttons = require("sdk/ui/button/action");
var tabs = require("sdk/tabs");
var request = require("sdk/request");

var button = buttons.ActionButton({
  id: "close-resolved-bugs",
  label: "Close Resolved Bugs",
  icon: {
    "64": "./bug-64.png"
  },
  onClick: closeBugs
});

function closeBugs(state) {
  var bzTabs = {};
  var ids = [];
  for each (var tab in tabs) {
    if (tab.url.startsWith("https://bugzilla.mozilla.org/show_bug.cgi")) {
      var id = /[?&]id=(\d+)/.exec(tab.url);
      if (id) {
        bzTabs[id[1]] = tab;
        ids.push(id[1]);
      }
    }
  }

  if (ids.length > 0) {
    new request.Request({
      url: "https://bugzilla.mozilla.org/rest/bug?id=" + ids.join(",") + "&include_fields=id,resolution,status",
      headers: {
        "Accept": "application/json",
      },
      onComplete: function(response) {
        if (response.status == 200) {
          var bugs = response.json.bugs;
          for (var i = 0; i < bugs.length; ++i) {
            var bug = bugs[i];
            if (bug.status == "RESOLVED" && bug.resolution == "FIXED") {
              bzTabs[bug.id].close();
            }
          }
        }
      }
    }).get();
  }
}
