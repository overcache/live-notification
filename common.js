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
	return `${m}-${d} ${h}:${mm}`
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
		callback(kiss(xhr.response, "http://panda.tv/"))
	}
	xhr.send(null)
}

function requestInfoSync(id) {
	var xhr = new XMLHttpRequest()
	xhr.open("GET", "http://www.panda.tv/api_room_v2?roomid=" + id, false)
	xhr.send(null)
	return kiss(JSON.parse(xhr.response, "http://panda.tv/"))
}

function showNotification(title, message, requireInteraction, callback) {
	var opt = {
		type: "basic",
		title: title,
		iconUrl: "icon128.png",
		message: message,
		requireInteraction: requireInteraction || false
	}
	if (callback !== undefined) {
		chrome.notifications.create(opt, callback)
	} else {
		chrome.notifications.create(opt)
	}
}

function showNotificationV2(info) {
	var opt = {
		type: "image",
		title: info.hostName + "发车了!!!",
		iconUrl: "icon128.png",
		message: "车次『"+ info.roomName + "』, 点击通知上车!",
		imageUrl: info.roomImg,
		requireInteraction: true,
		isClickable: true
	}
	chrome.notifications.create(info.site + info.roomId, opt)
}

function addNotificationHandler() {
	chrome.notifications.onClicked.addListener(function(id) {
		chrome.notifications.clear(id)
		var pattern = /^https*:\/\/.*/i
		if (pattern.test(id)) {
			chrome.tabs.create({url: id})
		}
	})
}

function getSubscriptions() {
	var str = localStorage.getItem("subscriptions") || "[]"
	return JSON.parse(str)
}

function getSubscription(id) {
	var subscriptions = getSubscriptions()
	for (var i = 0; i < subscriptions.length; i += 1) {
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
	for(var i = 0; i < subscriptions.length; i += 1) {
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
	var subscriptions = getSubscriptions()
	subscriptions.push(info)
	saveSubscriptions(subscriptions)
}

function unsubscribe(id) {
	var subscriptions = getSubscriptions()
	for(var i = 0; i < subscriptions.length; i += 1) {
		if (subscriptions[i].roomId === id)	{
			subscriptions.splice(i, 1)
			saveSubscriptions(subscriptions)
		}
	}
}

function kiss(responseJson, site) {
	if (responseJson.errno !== 0) {
		return responseJson
	} else {
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
			fetchTime: String((new Date()).valueOf()),
			site: site
		}
	}
}

function checkSubscription(info) {
	var subscription = getSubscription(info.roomId)
	if (info.errno !== 0) {
		console.log("check host is online or not error.", info.errmsg)
	} else {
		updateSubscriptions(info)
		if (info.status === "2" && subscription.status !== "2") {
			showNotificationV2(info)
		}
	}
}

function checkSubscriptions() {
	var subscriptions = getSubscriptions()
	for(var i = 0; i < subscriptions.length; i += 1) {
		requestInfo(subscriptions[i].roomId, checkSubscription)
	}
}

function setAll2Offline() {
	var subscriptions = getSubscriptions()
	for(var i = 0; i < subscriptions.length; i += 1) {
		subscriptions[i].status = "3"
	}
	saveSubscriptions(subscriptions)
}

function addAlarmHandler() {
	chrome.alarms.onAlarm.addListener(function(alarm) {
		console.log("alarm " + alarm.name + " has been fired at ", Date())
		if (alarm.name === "checkSubscriptions") {
			checkSubscriptions()
		}
	})
}

