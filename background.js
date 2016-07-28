common = chrome.extension.getBackgroundPage()

function isOnline(info) {
	if (info.status === "offline") {
		return
	}
	common.message(info.host, "您关注的主播正在直播，点击本通知跳转观看")
}

function checkRooms(rooms) {
	for(var i = 0; i < rooms.length; i = i + 1) {
		common.fetchData(rooms[i], isOnline)
	}
}

setInterval(function(){
	common.getRooms(checkRooms)
}, 600000)
