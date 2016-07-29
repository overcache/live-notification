var common = chrome.extension.getBackgroundPage()

function unsubscribeHandler() {
	var ul = document.getElementById("subscriptions")
	var item = this.parentElement
	var roomIdText = this.previousSibling.title

	common.unsubscribe(roomIdText)
	ul.removeChild(item)
}

function subscribeHandler() {
	var roomIdText = document.getElementById("room-id").value
	var pattern = /^[0-9]+$/
	if (pattern.test(roomIdText) === false) {
		common.showNotification("房号不合法", "目前PANDA.TV房间号只由数字组成.", false)
		return
	}
	var ul = document.getElementById("subscriptions")

	var responseJson = common.requestInfo(roomIdText, false)
	if (responseJson.errno === 0) {
		ul.appendChild(createItem(responseJson.data.hostinfo.name, responseJson.data.roominfo.id))
		common.subscribe(responseJson)
	} else {
		common.showNotification("无法订阅", responseJson.errmsg, false)
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

var initList = function(subscriptions) {
	var ul = document.getElementById("subscriptions")
	for(var i = 0; i < subscriptions.length; i = i + 1) {
		var temp = createItem(subscriptions[i].data.hostinfo.name, subscriptions[i].data.roominfo.id)
		ul.appendChild(temp)
	}
}

//显示订阅列表
common.getSubscriptions(initList)

document.getElementById("add-btn").addEventListener("click", subscribeHandler)
