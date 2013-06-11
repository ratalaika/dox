function createCookie(name, value, days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		var expires = "; expires=" + date.toGMTString();
	} else var expires = "";
	document.cookie = escape(name) + "=" + escape(value) + expires + "; path=/";
}

function readCookie(name) {
	var nameEQ = escape(name) + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) == 0) return unescape(c.substring(nameEQ.length, c.length));
	}
	return null;
}

function toggleInherited(el) {
	var toggle = $(el).closest(".toggle");
	toggle.toggleClass("toggle-on");
	if (toggle.hasClass("toggle-on")) {
		$("img", toggle).attr("src", dox.rootPath + "/triangle-opened.png");
	} else {
		$("img", toggle).attr("src", dox.rootPath + "/triangle-closed.png");
	}
}

function toggleCollapsed(el) {
	var toggle = $(el).closest(".expando");
	// console.log(toggle);
	toggle.toggleClass("expanded");

	if (toggle.hasClass("expanded")) {
		$("img", toggle).first().attr("src", dox.rootPath + "/triangle-opened.png");
	} else {
		$("img", toggle).first().attr("src", dox.rootPath + "/triangle-closed.png");
	}
	updateTreeState();
}

function updateTreeState(){
	var states = [];
	$("#nav .expando").each(function(i, e){
		states.push($(e).hasClass("expanded") ? 1 : 0);
	});
	var treeState = JSON.stringify(states);
	createCookie("treeState", treeState);
}

var filters = {};

function selectPlatform(e) {
	setPlatform($(e.target).parent().attr("data"));
}

function selectVersion(e) {
	setVersion($(e.target).parent().attr("data"));
}

function setPlatform(platform) {
	selectItem("platform", platform);
	
	var styles = ".platform { display:none }";
	var platforms = dox.platforms;

	for (var i = 0; i < platforms.length; i++)
	{
		var p = platforms[i];
		
		if (platform == "sys")
		{
			if (p != "flash" && p != "flash8" && p != "js")
			{
				styles += ".platform-" + p + " { display:inherit } ";
			}
		}
		else
		{
			if (platform == "all" || p == platform)
			{
				styles += ".platform-" + p + " { display:inherit } ";
			}
		}
	}
	
	if (platform != "flash" && platform != "flash8" && platform != "js")
	{
		styles += ".platform-sys { display:inherit } ";
	}

	$("#dynamicStylesheet").text(styles);
}

function setVersion(version) {
	selectItem("version", version);
}

function selectItem(filter, value)
{
	var dropdown = $("#select-" + filter);
	var item = $("li[data='"+value+"']", dropdown);
	var label = $("a", item).text();
	$(".dropdown-toggle", dropdown).html(label + '<b class="caret">');
	$("li.active", dropdown).removeClass("active");
	item.addClass("active");
	createCookie(filter, value);
}

$(document).ready(function(){
	$("#nav").html(navContent);
	var treeState = readCookie("treeState");
	if (treeState != null)
	{
		var states = JSON.parse(treeState);
		$("#nav .expando").each(function(i, e){
			if (states[i]) {
				$(e).addClass("expanded");
				$("img", e).first().attr("src", dox.rootPath + "/triangle-opened.png");
			}
		});
	}
	$("#select-platform li a").on("click", selectPlatform);
	$("#select-version li a").on("click", selectVersion);
	$("head").append("<style id='dynamicStylesheet'></style>");

	setPlatform(readCookie("platform") == null ? "all" : readCookie("platform"));
	setVersion(readCookie("version") == null ? "3_0" : readCookie("version"));

	$("#search").on("keyup", function(e){
		searchQuery(e.target.value);
	});
});

function searchQuery(query) {
	query = query.toLowerCase();
	$("#nav").removeClass("filtering");
	if (query == "") {
		$("#nav").removeClass("searching");
		$("#nav li").each(function(index, element){
			var e = $(element);
			if (e.hasClass("expando")) {
				e.removeClass("searchPackage");
				e.removeClass("searchPath");
			}
			e.css("display", "");
		});
		return;
	}
	
	var queryParts = query.split(".");
	query = queryParts.pop();
	var packageFilter = null;
	if (queryParts.length > 0) {
		packageFilter = "pack_" +queryParts.join("_");
		$("#nav").addClass("filtering");
	}
	console.log("Searching: "+query);

	$("#nav").addClass("searching");
	$("#nav li").each(function(index, element){
		var e = $(element);
		if (e.hasClass("expando")) {
			var id = e.attr("id");
			e.removeClass("searchPath");
			e.removeClass("searchPackage");
			if (id == null || packageFilter == null) return;
			if (id == packageFilter) e.addClass("searchPackage");
			else if (packageFilter.substr(0, id.length) == id) e.addClass("searchPath");
			return;
		} else {
			var content = e.text().toLowerCase();
			var match = searchMatch(content, query);
			e.css("display", match ? "" : "none");
		}
	});
	
}

function searchMatch(text, query) {
	// I should be working at Google.
	return text.indexOf(query) > -1;
}