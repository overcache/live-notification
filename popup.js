//TODO: 当用户没有订阅任何主播时，提供提示

var common = chrome.extension.getBackgroundPage()

//info{host,status,startTime,endTime,roomName, roomId}
function createDiv(subscription) {
	var newDiv = document.createElement("div")
	newDiv.className = "host"
	var newH2 = document.createElement("h2")
	newH2.textContent = subscription.hostinfo.name
	var newHr = document.createElement("hr")
	var newUl = document.createElement("ul")
	var names = ["状态: ", "房间号: ", "房间名: ", "最近直播: "]
	var status = ""
	var time = ""
	if (subscription.videoinfo.status === "2") {
		status = "正在直播"
		time = common.formatTime(new Date(subscription.roominfo.start_time * 1000)) + " ~ 现在"
	} else {
		status = "休息中"
		time = common.formatTime(new Date(subscription.roominfo.start_time * 1000)) + " ~ " + common.formatTime(new Date(subscription.roominfo.end_time * 1000))
	}
	var values = [status, subscription.roominfo.id, subscription.roominfo.name, time]
	for(var i = 0; i < names.length; i = i + 1) {
		var newItem = document.createElement("li")

		var newNameSpan = document.createElement("span")
		newNameSpan.textContent = names[i]
		newItem.appendChild(newNameSpan)
		newNameSpan.className = "name"

		var newValueEl
		if (i === 0) {
			newValueEl = document.createElement("a")
			newValueEl.className = "value " + (subscription.videoinfo.status === "2" ? "online" : "offline")
			newValueEl.href = "http://www.panda.tv/" + subscription.roominfo.id
			newValueEl.addEventListener("click", function() {
				chrome.tabs.create({url: this.href})
			})
		} else {
			newValueEl = document.createElement("span")
			newValueEl.className = "value"
		}
		newValueEl.textContent = values[i]
		newItem.appendChild(newValueEl)
		newUl.appendChild(newItem)
	}
	newDiv.appendChild(newH2)
	newDiv.appendChild(newUl)
	newDiv.appendChild(newHr)

	return newDiv
}


common.getSubscriptions(function(subscriptions) {
	var content = document.getElementById("content")
	for(var i = 0; i < subscriptions.length; i = i + 1) {
		// common.requestInfo(subscriptions[i].roomId, function(info) {
			var el = createDiv(subscriptions[i])
			content.appendChild(el)
		// })
	}
})

document.getElementById("go-to-options").addEventListener("click", common.openOptionsPage)
