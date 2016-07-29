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

function requestInfo(id, async, callback) {
	var xhr = new XMLHttpRequest()
	xhr.open("GET", "http://www.panda.tv/api_room_v2?roomid=" + id, async)
	if (async) {
		if (callback === undefined) {
			console.error("A callback must be offered.")
			return
		}
		xhr.responseType = "json"
		xhr.onload = function() {
			callback(this.response)
		}
		xhr.send(null)
	} else {
		xhr.send(null)
		return JSON.parse(xhr.responseText)
	}
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
		subscriptions: []
	}, function(items) {
		callback(items.subscriptions)
	})
}

function getSubscription(id, callback) {
	getSubscriptions(function(subscriptions) {
		for(var i = 0; i < subscriptions.length; i = i + 1) {
			if (subscriptions[i].data.roominfo.id === id) {
				callback(subscriptions[i])
			}
		}
	})
}

function saveSubscriptions(subscriptions, callback) {
	chrome.storage.sync.set({
		subscriptions: subscriptions
	}, callback)
}


function updateSubscription(responseJson) {
	getSubscriptions(function(subscriptions) {
		for(var i = 0; i < subscriptions.length; i = i + 1) {
			if (subscriptions[i].data.roominfo.id === responseJson.data.roominfo.id) {
				subscriptions[i] = responseJson
				saveSubscriptions(subscriptions[i])
			}
		}
	})
}

function subscribe(responseJson) {
	getSubscriptions(function(subscriptions) {
		subscriptions.push(responseJson)
		saveSubscriptions(subscriptions, function() {
			showNotification("已订阅：", responseJson.data.hostinfo.name, false)
		})
	})
}

function unsubscribe(id) {
	getSubscriptions(function(subscriptions) {
		for(var i = 0; i < subscriptions.length; i = i + 1) {
			if (subscriptions[i].data.roominfo.id === id)	{
				subscriptions.splice(i, 1)
			}
		}
		saveSubscriptions(subscriptions)
	})
}
