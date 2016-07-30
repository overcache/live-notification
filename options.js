function unsubscribeHandler() {
	var ul = document.getElementById("subscriptions")
	var item = this.parentElement
	var roomIdText = this.previousSibling.title

	unsubscribe(roomIdText)
	ul.removeChild(item)
}

function subscribeHandler() {
	var roomIdText = document.getElementById("room-id").value
	var pattern = /^[0-9]+$/
	if (pattern.test(roomIdText) === false) {
		showNotification("房号不合法", "目前PANDA.TV房间号只由数字组成.", false)
		// feedback("error", "房号不合法: 目前PANDA.TV房间号只由数字组成.")
		return 1
	}

	var info = requestInfoSync(roomIdText)
	if (info.errno === 0) {
		// var ul = document.getElementById("subscriptions")
		// ul.appendChild(createItem(info.hostName, info.roomId))
		subscribe(info)
		// feedback("sucess", "成功订阅: " + info.hostName)
		var msg = "该直播目前休息中."
		var requireInteraction = false
		if (info.status === "2") {
			msg = "该主播目前正在直播，点击本通知观看。"
			requireInteraction = true
		}
		showNotification("成功订阅: " + info.hostName, msg, requireInteraction)
		return 0
	} else {
		showNotification("无法订阅", info.errmsg, false)
		return 1
		// feedback("error", "无法订阅: " + info.errmsg)
	}


}


function createItem(host, id) {
	var newItem = document.createElement("li")
	var newSpan = document.createElement("span")
	newSpan.textContent = host
	newSpan.title = id
	var newButton = document.createElement("button")
	newButton.textContent = "取消订阅"
	newButton.className = "del-btn"
	newButton.addEventListener("click", unsubscribeHandler)
	newItem.appendChild(newSpan)
	newItem.appendChild(newButton)
	return newItem
}

(function initList() {
	var ul = document.getElementById("subscriptions")
	var subscriptions = getSubscriptions()
	for(var i = 0; i < subscriptions.length; i = i + 1) {
		var li = createItem(subscriptions[i].hostName, subscriptions[i].roomId)
		ul.appendChild(li)
	}
})()

//显示订阅列表

document.getElementById("add-btn").addEventListener("click", subscribeHandler)
