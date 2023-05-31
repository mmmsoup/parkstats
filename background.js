/* woo standards!! */
if (typeof(browser) === "undefined") {
	var browser = chrome;
}

browser.runtime.onMessage.addListener((message, sender) => {
	browser.tabs.update(sender.tab.id, {
		url: browser.runtime.getURL("map.html")+"?lang="+message.lang+"&name="+btoa(message.name)+"&data="+btoa(JSON.stringify(message.data))
	});
});
