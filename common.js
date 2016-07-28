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
	var s = addNumPadding(time.getSeconds())
	return `${m}月${d}日 ${h}:${mm}:${s}`
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
	xhr.responseType = "json"
	xhr.open("GET", "http://www.panda.tv/api_room_v2?roomid=" + id)
	xhr.onload = function() {
		var info = {
			host: "",
			roomName: "",
			roomId: "",
			status: "",
			startTime: "",
			endTime: ""
		}
		var data = this.response.data
		if (data !== "{}") {
			info.host = data.hostinfo.name
			info.status =  data.videoinfo.status === "2" ? "online" : "offline"
			info.roomName = data.roominfo.name
			info.roomId = data.roominfo.id
			info.startTime = common.formatTime(new Date(data.roominfo.start_time * 1000))
			info.endTime = common.formatTime(new Date(data.roominfo.end_time * 1000))
		}

		callback(info)
	}
	xhr.send(null)
}

function showNotification(title, message) {
	var opt = {
		type: "basic",
		title: title,
		iconUrl: "icon128.png",
		message: message,
		requireInteraction: true
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

function saveSubscription(subscription) {
	chrome.storage.sync.set({
		subscription: subscription
	}, message("Save sucess. Your subscription: ", subscription.join("\n- ")))
}

function subscribe(info) {
	getSubscription(function(subscription) {
		subscription.push(info)
		saveSubscription(subscription)
	})
}

function unsubscribe(roomId) {
	getSubscription(function(subscription) {
		subscription.splice(subscription.indexOf(roomId), 1)
		saveSubscription(subscription)
	})
}
