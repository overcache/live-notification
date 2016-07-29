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

function getSubscriptions(callback) {
	chrome.storage.sync.get({
		"subscriptions": []
	}, function(items) {
		callback(items.subscriptions)
	})
}

function getSubscription(id, callback) {
	getSubscriptions(function(subscriptions) {
		var data = null
		for(var i = 0; i < subscriptions.length; i = i + 1) {
			if (subscriptions[i].roomId === id) {
				data = subscriptions[i]
				break
			}
		}
		callback(data)
	})
}

function saveSubscriptions(subscriptions, callback) {
	chrome.storage.sync.set({
		"subscriptions": subscriptions
	}, callback)
}


function updateSubscription(info) {
	getSubscriptions(function(subscriptions) {
		for(var i = 0; i < subscriptions.length; i = i + 1) {
			if (subscriptions[i].roomId === info.roomId) {
				subscriptions[i] = info
				saveSubscriptions(subscriptions)
				return 0
			}
		}
		console.log("没有订阅该主播，无法更新状态")
	})
}

function subscribe(info) {
	getSubscription(info.roomId, function(data) {
		if (data !== null) {
			showNotification("您已订阅过该主播。", info.hostName, false)
		} else {
			getSubscriptions(function(subscriptions) {
				console.log(subscriptions)
				subscriptions.push(info)
				saveSubscriptions(subscriptions, function() {
					console.log(subscriptions)
					// showNotification("已订阅：", info.hostName, false)
				})
			})
		}
	})
}

function unsubscribe(id) {
	getSubscriptions(function(subscriptions) {
		for(var i = 0; i < subscriptions.length; i = i + 1) {
			if (subscriptions[i].roomId === id)	{
				subscriptions.splice(i, 1)
				saveSubscriptions(subscriptions)
				return 0
			}
		}
		console.log("没有订阅该主播，无法取消订阅")
		return 1
	})
}

function kiss(responseJson) {
	return {
		hostName: responseJson.data.hostinfo.name,
		hostAvartar: responseJson.data.hostinfo.avatar,
		roomName: responseJson.data.roominfo.name,
		roomId: responseJson.data.roominfo.id,
		roomImg: responseJson.data.roominfo.pictures.img,
		startTime: responseJson.data.roominfo.start_time,
		endTime: responseJson.data.roominfo.end_time,
		status: responseJson.data.videoinfo.status,
		errno: responseJson.errno,
		errmsg: responseJson.errmsg
	}
}
