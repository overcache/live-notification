function unsubscribeHandler() {
	var ul = document.getElementById("subscriptions")
	var item = this.parentElement
	var roomIdText = this.previousSibling.title

	unsubscribe(roomIdText)
	ul.removeChild(item)
}

function subscribeHandler() {
	var input = document.getElementById("room-id")
	var roomIdText = input.value
	var pattern = /^[0-9]+$/
	// var subscription = getSubscription(roomIdText)
	if (pattern.test(roomIdText) === false) {
		feedback("error", "房间号只由数字组成")
	} else if (getSubscription(roomIdText) !== null) {
		feedback("error", "已经订阅过" + roomIdText + "房间")
	} else {
		feedback("info", "正在向panda.tv查询" + roomIdText +"房间...")
		requestInfo(roomIdText, function(info) {
			if (info.errno === 0) {
				subscribe(info)
				feedback("sucess", "成功订阅: " + info.hostName)
				addItem(info)
				if (info.status === "2") {
					showNotificationV2(info)
				}
			} else {
				feedback("error", "无法订阅: " + info.errmsg)
			}
		})
	}
	input.value = ""
}

function clearInput() {
	var input = document.getElementById("room-id")
	input.value = ""
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

function addItem(subscription) {
	var ul = document.getElementById("subscriptions")
	var li = createItem(subscription.hostName, subscription.roomId)
	ul.appendChild(li)
}

function initList() {
	var ul = document.getElementById("subscriptions")
	var subscriptions = getSubscriptions()
	for(var i = 0; i < subscriptions.length; i = i + 1) {
		var li = createItem(subscriptions[i].hostName, subscriptions[i].roomId)
		ul.appendChild(li)
	}
}

function feedback(className, msg) {
	var para = document.getElementById("feedback")
	para.className = className
	para.textContent = msg
	para.style.visibility = "visible"
	setTimeout(hideFeedback, 2500)
}

function hideFeedback() {
	var para = document.getElementById("feedback")
	para.style.visibility = "hidden"
}

//显示订阅列表
hideFeedback()
initList()

document.getElementById("add-btn").addEventListener("click", subscribeHandler)
