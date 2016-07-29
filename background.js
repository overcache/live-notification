function isOnline(info) {
	if (info.errno !== 0) {
		console.log("check host is online or not error.", info.errmsg)
		return
	} else {
		getSubscription(info.roomId, function(subscription) {
			if (info.status === "2" && subscription.status !== "2") {
				showNotification("活捉正在直播的" + info.data.hostinfo.name, "点击本通知跳转观看", true)
			}
			updateSubscription(info)
		})
	}
}


function checkSubscriptions(subscriptions) {
	for(var i = 0; i < subscriptions.length; i = i + 1) {
		requestInfo(subscriptions[i].roomId, isOnline)
	}
}

setInterval(function(){
	getSubscriptions(checkSubscriptions)
}, 60000000)
