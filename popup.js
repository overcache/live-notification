//TODO: 当用户没有订阅任何主播时，提供提示

//info{host,status,startTime,endTime,roomName, roomId}
function createDiv(subscription) {
	var newDiv = document.createElement("div")
	newDiv.className = "host"
	var newH2 = document.createElement("h2")
	newH2.textContent = subscription.hostName
	var newHr = document.createElement("hr")
	var newUl = document.createElement("ul")
	var names = ["查询时间: ", "状态: ", "房间号: ", "房间名: ", "最近直播: "]
	var status = ""
	var time = ""
	var now = (new Date()).valueOf()
	var fetchTime = Math.round((now - subscription.fetchTime) / 60000)
	var fetchmsg = fetchTime + " 分钟前"
	if (fetchTime <= 1) {
		fetchmsg = "刚刚"
	}

	if (subscription.status === "2") {
		status = "正在直播"
		time = formatTime(new Date(subscription.startTime)) + " ~ 现在"
	} else {
		status = "休息中"
		time = formatTime(new Date(subscription.startTime)) + " ~ " + formatTime(new Date(subscription.endTime))
	}
	var values = [fetchmsg, status, subscription.roomId, subscription.roomName, time]
	for(var i = 0; i < names.length; i = i + 1) {
		var newItem = document.createElement("li")

		var newNameSpan = document.createElement("span")
		newNameSpan.textContent = names[i]
		newItem.appendChild(newNameSpan)
		newNameSpan.className = "name"

		var newValueEl
		if (i === 1) {
			newValueEl = document.createElement("a")
			newValueEl.className = "value " + (subscription.status === "2" ? "online" : "offline")
			newValueEl.href = "http://www.panda.tv/" + subscription.roomId
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


var subscriptions = getSubscriptions()
var content = document.getElementById("content")
for(var i = 0; i < subscriptions.length; i++) {
	var el = createDiv(subscriptions[i])
	content.appendChild(el)
}

document.getElementById("go-to-options").addEventListener("click", openOptionsPage)
