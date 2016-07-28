function myFmt(num) {
	if (num < 10) {
		return "0" + num
	} else {
		return num.toString()
	}
}

function myTime(time) {
	var temp = time.getMonth()
	var m = myFmt(temp + 1)
	var d = myFmt(time.getDate())
	var h = myFmt(time.getHours())
	var mm = myFmt(time.getMinutes())
	var s = myFmt(time.getSeconds())
	return `${m}月${d}日 ${h}:${mm}:${s}`
}

function goToOptions() {
	if (chrome.runtime.openOptionsPage) {
		chrome.runtime.openOptionsPage()
	} else {
		window.open(chrome.runtime.getURL("options.html"))
	}
}

function fetchData(id, callback) {
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
		if (data === "{}") {
			console.log(this.response.errmsg)
		}
		info.host = data.hostinfo.name
		info.status =  data.videoinfo.status === "2" ? "online" : "offline"
		info.roomName = data.roominfo.name
		info.roomId = data.roominfo.id
		info.startTime = common.myTime(new Date(data.roominfo.start_time * 1000))
		info.endTime = common.myTime(new Date(data.roominfo.end_time * 1000))

		callback(info)
	}
	xhr.send(null)
}

function message(title, message) {
	var opt = {
		type: "basic",
		title: title,
		iconUrl: "icon128.png",
		message: message,
		requireInteraction: true
	}
	chrome.notifications.create(opt)
}

function getRooms(callback) {
	chrome.storage.sync.get({
		rooms: []
	}, function(items) {
		callback(items.rooms)
	})
}

function setRooms(rooms) {
	chrome.storage.sync.set({
		rooms: rooms
	}, message("Save sucess.", rooms.join("\n")))
}

function pushRoom(room) {
	getRooms(function(rooms) {
		rooms.push(room)
		setRooms(rooms)
	})
}

function popRoom(room) {
	getRooms(function(rooms) {
		rooms.splice(rooms.indexOf(room), 1)
		setRooms(rooms)
	})
}
