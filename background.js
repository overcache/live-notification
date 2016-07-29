var common = chrome.extension.getBackgroundPage()

function isOnline(responseJson) {
	if (responseJson.errno !== 0) {
		console.log("check host is online or not error.", responseJson.errmsg)
		return
	} else {
		common.getSubscription(responseJson.data.roominfo.id, function(subscription) {
			if (responseJson.data.roominfo.status === "2" && subscription.data.roominfo.status !== "2") {
				common.showNotification("活捉正在直播的" + responseJson.data.hostinfo.name, "点击本通知跳转观看", true)
			}
			common.updateSubscription(responseJson)
		})
	}
}


function checkSubscriptions(subscriptions) {
	for(var i = 0; i < subscriptions.length; i = i + 1) {
		common.requestInfo(subscriptions[i].data.roominfo.id, isOnline)
	}
}

setInterval(function(){
	common.getSubscriptions(checkSubscriptions)
}, 600000)
