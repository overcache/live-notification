var common = chrome.extension.getBackgroundPage()

//info{host,status,startTime,endTime,roomName, roomId}
function createDiv(info) {
	var newDiv = document.createElement("div")
	newDiv.className = "host"
	var newH2 = document.createElement("h2")
	newH2.textContent = info.host
	var newHr = document.createElement("hr")
	var newUl = document.createElement("ul")
	var names = ["状态: ", "房间号: ", "房间名: ", "最近直播: "]
	var status = ""
	var time = ""
	if (info.status === "online") {
		status = "正在直播"
		time = common.formatTime(new Date(info.startTime)) + " ~ 现在"
	} else {
		status = "休息中"
		time = common.formatTime(new Date(info.startTime)) + " ~ " + common.formatTime(new Date(info.endTime))
	}
	var values = [status, info.roomId, info.roomName, time]
	for(var i = 0; i < names.length; i = i + 1) {
		var newItem = document.createElement("li")

		var newNameSpan = document.createElement("span")
		newNameSpan.textContent = names[i]
		newItem.appendChild(newNameSpan)
		newNameSpan.className = "name"

		var newValueEl
		if (i === 0) {
			newValueEl = document.createElement("a")
			newValueEl.className = "value " + info.status
			newValueEl.href = info.platform + "/" + info.roomId
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


common.getSubscription(function(subscription) {
	var content = document.getElementById("content")
	for(var i = 0; i < subscription.length; i = i + 1) {
		common.requestInfo(subscription[i].roomId, function(info) {
			var el = createDiv(info)
			content.appendChild(el)
		})
	}
})

document.getElementById("go-to-options").addEventListener("click", common.openOptionsPage)
