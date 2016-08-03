(function() {
	"use strict"

	/* jshint unused: false */
	/* global liveNotification*/

	function unsubscribeHandler() {
		var ulEl = document.getElementById("subscriptions")
		var liEl = this.parentElement
		var roomSpan = this.previousSibling
		var roomIdText = roomSpan.title

		liveNotification.unsubscribe(roomIdText)
		ulEl.removeChild(liEl)
		feedback("sucess", "不再关注" + roomSpan.textContent)
	}

	function subscribeHandler() {
		var input = document.getElementById("room-id")
		var roomIdText = input.value
		var pattern = /^[0-9]+$/
		// var subscription = getSubscription(roomIdText)
		if (pattern.test(roomIdText) === false) {
			feedback("error", "房号只由数字组成")
		} else if (liveNotification.getSubscription(roomIdText) !== null) {
			feedback("error", "已经添加过该主播")
		} else {
			feedback("info", "正在向panda.tv获取房间信息...")
			liveNotification.requestInfo(roomIdText, function(info) {
				if (info.errno === 0) {
					liveNotification.subscribe(info)
					feedback("sucess", "成功添加主播: " + info.hostName)
					addItem(info)
					if (info.status === "2") {
						liveNotification.showNotificationV2(info)
					}
				} else {
					feedback("error", "无法添加主播: " + info.errmsg)
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
		newButton.textContent = "取消关注"
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
		var subscriptions = liveNotification.getSubscriptions()
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
})()
