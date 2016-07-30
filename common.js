function addNumPadding(num) {
	if (num < 10) {
		return "0" + num
	} else {
		return num.toString()
	}
}

function formatTime(time) {
	var temp = time.getMonth()
	var m = addNumPadding(temp + 1)
	var d = addNumPadding(time.getDate())
	var h = addNumPadding(time.getHours())
	var mm = addNumPadding(time.getMinutes())
	// var s = addNumPadding(time.getSeconds())
	return `${m}月${d}日 ${h}:${mm}`
}

function openOptionsPage() {
	if (chrome.runtime.openOptionsPage) {
		chrome.runtime.openOptionsPage()
	} else {
		window.open(chrome.runtime.getURL("options.html"))
	}
}

function requestInfo(id, callback) {
	var xhr = new XMLHttpRequest()
	xhr.open("GET", "http://www.panda.tv/api_room_v2?roomid=" + id)
	if (callback === undefined) {
		console.error("A callback must be offered.")
		return
	}
	xhr.responseType = "json"
	xhr.onload = function() {
		callback(kiss(xhr.response))
	}
	xhr.send(null)
}

function requestInfoSync(id) {
	var xhr = new XMLHttpRequest()
	xhr.open("GET", "http://www.panda.tv/api_room_v2?roomid=" + id, false)
	xhr.send(null)
	return kiss(JSON.parse(xhr.response))
}

function showNotification(title, message, requireInteraction) {
	var opt = {
		type: "basic",
		title: title,
		iconUrl: "icon128.png",
		message: message,
		requireInteraction: requireInteraction
	}
	chrome.notifications.create(opt)
}

function getSubscriptions() {
	var str = localStorage.getItem("subscriptions") || "[]"
	return JSON.parse(str)
}

function getSubscription(id) {
	var subscriptions = getSubscriptions()
	for (var i = 0; i < subscriptions.length; i++) {
		if (subscriptions[i].roomId === id) {
			return subscriptions[i]
		}
	}
	return null
}

function saveSubscriptions(subscriptions) {
	var str = JSON.stringify(subscriptions)
	localStorage.setItem("subscriptions", str)
}


function updateSubscriptions(info) {
	var subscriptions = getSubscriptions()
	for(var i = 0; i < subscriptions.length; i++) {
		if (subscriptions[i].roomId === info.roomId) {
			subscriptions[i] = info
			saveSubscriptions(subscriptions)
			return 0
		}
	}
	console.log("没有订阅该主播，无法更新状态")
	return 1
}

function subscribe(info) {
	if (getSubscription(info.roomId) !== null) {
		showNotification("您已订阅过该主播。", info.hostName, false)
	} else {
		var subscriptions = getSubscriptions()
		subscriptions.push(info)
		saveSubscriptions(subscriptions)
		// showNotification("成功订阅主播：", info.hostName, false)
	}
}

function unsubscribe(id) {
	if (getSubscription(id) === null) {
		showNotification("没有订阅该主播, 无法取消订阅：", id, false)
		return 1
	} else {
		var subscriptions = getSubscriptions()
		for(var i = 0; i < subscriptions.length; i++) {
			if (subscriptions[i].roomId === id)	{
				subscriptions.splice(i, 1)
				saveSubscriptions(subscriptions)
				return 0
			}
		}
	}
}

function kiss(responseJson) {
	return {
		hostName: responseJson.data.hostinfo.name,
		hostAvartar: responseJson.data.hostinfo.avatar,
		roomName: responseJson.data.roominfo.name,
		roomId: responseJson.data.roominfo.id,
		roomImg: responseJson.data.roominfo.pictures.img,
		startTime: responseJson.data.roominfo.start_time * 1000,
		endTime: responseJson.data.roominfo.end_time * 1000,
		status: responseJson.data.videoinfo.status,
		errno: responseJson.errno,
		errmsg: responseJson.errmsg,
		fetchTime: String((new Date()).valueOf())
	}
}

function checkSubscription(info) {
	var subscription = getSubscription(info.roomId)
	if (info.errno !== 0) {
		console.log("check host is online or not error.", info.errmsg)
	} else if (info.status === "2" && subscription.status !== "2") {
		showNotification("活捉正在直播的" + info.hostName, "点击本通知跳转观看", true)
	}
	updateSubscriptions(info)
}

function checkSubscriptions() {
	var subscriptions = getSubscriptions()
	for(var i = 0; i < subscriptions.length; i++) {
		requestInfo(subscriptions[i].roomId, checkSubscription)
	}
}
