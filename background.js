common = chrome.extension.getBackgroundPage()

function isOnline(info) {
	if (info.status === "offline") {
		return
	}
	common.message(info.host, "您关注的主播正在直播，点击本通知跳转观看")
}

function checkSubscription(subscription) {
	for(var i = 0; i < subscription.length; i = i + 1) {
		common.requestInfo(subscription[i], isOnline)
	}
}

setInterval(function(){
	common.getSubscription(checkSubscription)
}, 600000)
