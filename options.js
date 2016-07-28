var common = chrome.extension.getBackgroundPage()

var deleteRoom = function() {
	var ul = document.getElementById("subsciption")
	var item = this.parentElement
	var room = this.previousSibling

	common.popRoom(room)
	ul.removeChild(item)
}

var addRoom = function() {
	var room = document.getElementById("room-id").value
	var ul = document.getElementById("subsciption")
	ul.appendChild(createItem(room))

	common.pushRoom(room)
}

var createItem = function(text) {
	var newItem = document.createElement("li")
	var newContent = document.createTextNode(text)
	var newButton = document.createElement("button")
	newButton.textContent = "delete"
	newButton.className = "del-btn"
	newButton.addEventListener("click", deleteRoom)
	newItem.appendChild(newContent)
	newItem.appendChild(newButton)
	return newItem
}

var initList = function(rooms) {
	var ul = document.getElementById("subsciption")
	for(var i = 0; i < rooms.length; i = i + 1) {
		ul.appendChild(createItem(rooms[i]))
	}
}

common.getRooms(initList)

document.getElementById("add-btn").addEventListener("click", addRoom)
