var common = chrome.extension.getBackgroundPage()

//info{host,status,startTime,endTime,roomName, roomId}
function createDiv(info) {
	var newDiv = document.createElement("div")
	var newH2 = document.createElement("h2")
	newH2.textContent = info.host + "/" + info.roomId
	var newUl = document.createElement("ul")
	var opt = ["status: ", "room-name: ", "start-time: ", "end-time: "]
	var values = [info.status, info.roomName, info.startTime, info.endTime]
	for(var i = 0; i < opt.length; i = i + 1) {
		var newItem = document.createElement("li")
		var newText = document.createTextNode(opt[i])
		var newSpan = document.createElement("span")
		newSpan.textContent = values[i]
		newItem.appendChild(newText)
		newItem.appendChild(newSpan)
		newUl.appendChild(newItem)
	}
	newDiv.appendChild(newH2)
	newDiv.appendChild(newUl)

	return newDiv
}


common.getSubscription(function(subscription) {
	var content = document.getElementById("content")
	for(var i = 0; i < subscription.length; i = i + 1) {
		common.requestInfo(subscription[i], function(info) {
			var el = createDiv(info)
			content.appendChild(el)
		})
	}
})

document.getElementById("go-to-options").addEventListener("click", common.openOptionsPage)
