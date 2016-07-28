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
	console.log("requestInfo is being called")
	var xhr = new XMLHttpRequest()
	xhr.responseType = "json"
	xhr.open("GET", "http://www.panda.tv/api_room_v2?roomid=" + id)
	xhr.onload = function() {
		var info = {
			host: "",
			roomName: "",
			roomId: "",
			status: "",
			startTime: "",
			endTime: "",
			platform: "",
		}
		var data = this.response.data
		if (data !== "{}") {
			info.host = data.hostinfo.name
			info.status =  data.videoinfo.status === "2" ? "online" : "offline"
			info.roomName = data.roominfo.name
			info.roomId = data.roominfo.id
			// info.startTime = common.formatTime(new Date(data.roominfo.start_time * 1000))
			// info.endTime = common.formatTime(new Date(data.roominfo.end_time * 1000))
			info.startTime = data.roominfo.start_time * 1000
			info.endTime = data.roominfo.end_time * 1000
			info.platform = "http://www.panda.tv"
		}

		callback(info)
	}
	xhr.send(null)
}

function requestInfoSync(id) {
	console.log("requestInfoSync is being called")
	var xhr = new XMLHttpRequest()
	// xhr.responseType = "json"
	xhr.open("GET", "http://www.panda.tv/api_room_v2?roomid=" + id, false)
	xhr.send(null)

	var info = {
		host: "",
		roomName: "",
		roomId: "",
		status: "",
		startTime: "",
		endTime: ""
	}
	var data = JSON.parse(xhr.response).data
	if (data !== "{}") {
		info.host = data.hostinfo.name
		info.status =  data.videoinfo.status === "2" ? "online" : "offline"
		info.roomName = data.roominfo.name
		info.roomId = data.roominfo.id
		// info.startTime = common.formatTime(new Date(data.roominfo.start_time * 1000))
		// info.endTime = common.formatTime(new Date(data.roominfo.end_time * 1000))
		info.startTime = data.roominfo.start_time * 1000
		info.endTime = data.roominfo.end_time * 1000
		info.platform = "http://www.panda.tv"
	}
	return info
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

function getSubscription(callback) {
	chrome.storage.sync.get({
		subscription: []
	}, function(items) {
		callback(items.subscription)
	})
}

function saveSubscription(subscription, callback) {
	chrome.storage.sync.set({
		subscription: subscription
	}, callback)
}

function updateSubscription(info) {
	getSubscription(function(subscription) {
		for(var i = 0; i < subscription.length; i = i + 1) {
			if (subscription[i].roomId === info.roomId) {
				subscription[i] = info
				saveSubscription(subscription)
			}
		}
	})
}

function subscribe(info) {
	getSubscription(function(subscription) {
		subscription.push(info)
		saveSubscription(subscription, function() {
			showNotification("已订阅：", info.host, false)
		})
	})
}

function unsubscribe(roomId) {
	getSubscription(function(subscription) {
		for(var i = 0; i < subscription.length; i = i + 1) {
			if (subscription[i].roomId === roomId)	{
				subscription.splice(i, 1)
			}
		}
		saveSubscription(subscription)
	})
}

function getNotifyTime(roomId, callback) {
	chrome.storage.sync.get({
		notifyTime: []
	}, function(items) {
		var times = items.notifyTime
		for(var i = 0; i < times.length; i = i + 1) {
			if (times[i].roomId === roomId) {
				callback(times[i].time)
			}
		}
	})
}

function updateNotifyTime(roomId, time) {
	chrome.storage.sync.get({
		notifyTime: []
	}, function(items) {
		var times = items.notifyTime
		for(var i = 0; i < times.length; i = i + 1) {
			if (times[i].roomId === roomId) {
				times[i].time = time
				chrome.storage.sync.set({
					notifyTime: times
				}, function() { console.log(times)})
			}
		}
	})
}


function print(msg) {
	console.log(msg)
}
