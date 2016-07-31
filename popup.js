
//info{host,status,startTime,endTime,roomName, roomId}
function createDiv(subscription) {
	var hostDiv = document.createElement("div")
	hostDiv.className = (subscription.status === "2") ? "host online" : "host offline"
	var headDiv = document.createElement("div")
	headDiv.className = "head-div"

	var avatarImg = document.createElement("img")
	avatarImg.src = subscription.hostAvartar
	// avatarImg.width = "64"
	avatarImg.className = "avartar"
	headDiv.appendChild(avatarImg)

	var hostNameSpan = document.createElement("span")
	hostNameSpan.textContent = subscription.hostName
	hostNameSpan.className = "host-name"
	headDiv.appendChild(hostNameSpan)

	var roomNameSpan = document.createElement("span")
	roomNameSpan.textContent = subscription.roomName
	roomNameSpan.className = "room-name"
	headDiv.appendChild(roomNameSpan)

	var statusSpan = document.createElement("span")
	statusSpan.textContent = subscription.status === "2" ? "直播中" : "休息"
	statusSpan.className = subscription.status === "2" ? "status online" : "status offline"
	headDiv.appendChild(statusSpan)


	var ulEl = document.createElement("ul")


	var now = (new Date()).valueOf()
	var fetchTime = Math.round((now - subscription.fetchTime) / 60000)
	var fetchmsg = fetchTime + " 分钟前"
	if (fetchTime <= 1) {
		fetchmsg = "刚刚"
	}

	var time = formatTime(new Date(subscription.startTime)) + " <=> "
	if (subscription.status === "2") {
		time = time + "现在"
	} else {
		time = time + formatTime(new Date(subscription.endTime))
	}

	var names = ["查询时间: ", "发车时间: "]
	var values = [fetchmsg, time]
	for(var i = 0; i < names.length; i = i + 1) {
		var liEl = document.createElement("li")
		var nameSpan = document.createElement("span")
		nameSpan.textContent = names[i]
		nameSpan.className = "name"
		liEl.appendChild(nameSpan)

		var valueSpan = document.createElement("span")
		valueSpan.textContent = values[i]
		valueSpan.className = "value"
		liEl.appendChild(valueSpan)
		ulEl.appendChild(liEl)
	}

	hostDiv.appendChild(headDiv)
	hostDiv.appendChild(ulEl)
	// hostDiv.appendChild(document.createElement("hr"))

	hostDiv.addEventListener("click", function() {
		chrome.tabs.create({url: subscription.site + subscription.roomId})
	})

	return hostDiv
}


var subscriptions = getSubscriptions()
var paraEl = document.getElementById("empty")
var content = document.getElementById("content")
if (subscriptions.length !== 0) {
	// empty.setAttribute("display", "none")
	document.body.removeChild(paraEl)
}
for(var i = 0; i < subscriptions.length; i += 1) {
	var el = createDiv(subscriptions[i])
	content.appendChild(el)
}


document.getElementById("go-to-options").addEventListener("click", openOptionsPage)
