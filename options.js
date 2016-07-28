var common = chrome.extension.getBackgroundPage()

function unsubscribeHandler() {
	var ul = document.getElementById("subsciption")
	var item = this.parentElement
	var roomId = this.previousSibling.title

	common.unsubscribe(roomId)
	ul.removeChild(item)
}

function subscribeHandler() {
	var roomIdText = document.getElementById("room-id").value
	var ul = document.getElementById("subsciption")

	var info = common.requestInfoSync(roomIdText)
	if (info.host !== "") {
		ul.appendChild(createItem(info.host, info.roomId))
		common.subscribe(info)
	} else {
			//TODO: no host. Inform user.
			console.log("no host")
		}
	}

function createItem(host, roomId) {
	var newItem = document.createElement("li")
	var newSpan = document.createElement("span")
	newSpan.textContent = host
	newSpan.title = roomId
	var newButton = document.createElement("button")
	newButton.textContent = "取消订阅"
	newButton.className = "del-btn"
	newButton.addEventListener("click", unsubscribeHandler)
	newItem.appendChild(newSpan)
	newItem.appendChild(newButton)
	return newItem
}

var initList = function(subscription) {
	var ul = document.getElementById("subsciption")
	for(var i = 0; i < subscription.length; i = i + 1) {
		ul.appendChild(createItem(subscription[i].host, subscription[i].roomId))
	}
}

common.getSubscription(initList)

document.getElementById("add-btn").addEventListener("click", subscribeHandler)
