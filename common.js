(function(window) {
	"use strict"
	/* jshint unused: false */
	/* global chrome */

	//全局变量liveNotification，避免污染全局空间
	window.liveNotification = {}
	var L = window.liveNotification

	/**
	 * Padding an integer to 2-length string.
	 * @param {Integer}
	 * @return {String}
	 */
	L.addNumPadding = function addNumPadding(num) {
		if (num < 10) {
	 		return "0" + num
	 	} else {
	 		return num.toString()
	 	}
	}

	/**
	 * Format a Date obejct to custom string.
	 * @param  {Date}
	 * @return {String}
	 */
	L.formatTime = function formatTime(time) {
	 	var temp = time.getMonth()
	 	var m = L.addNumPadding(temp + 1)
	 	var d = L.addNumPadding(time.getDate())
	 	var h = L.addNumPadding(time.getHours())
	 	var mm = L.addNumPadding(time.getMinutes())
		// var s = addNumPadding(time.getSeconds())
		return `${m}-${d} ${h}:${mm}`
	}

	/**
	 * openOptionPage
	 */
	L.openOptionsPage = function openOptionsPage() {
	 	if (chrome.runtime.openOptionsPage) {
	 		chrome.runtime.openOptionsPage()
	 	} else {
	 		window.open(chrome.runtime.getURL("options.html"))
	 	}
	 }


	/**
	 * request room info from server, then process info with callback
	 * @param  {String}
	 * @param  {Function}
	 * @return {[type]}
	 */
	L.requestInfo = function requestInfo(id, callback) {
	 	var xhr = new XMLHttpRequest()
	 	xhr.open("GET", "http://www.panda.tv/api_room_v2?roomid=" + id)
	 	if ( typeof callback !== "function" ) {
	 		console.error("A callback must be offered.")
	 		return
	 	}
	 	xhr.responseType = "json"
	 	xhr.onload = function() {
	 		callback(L.kiss(xhr.response, "http://panda.tv/"))
	 	}
	 	xhr.send(null)
	 }

	/**
	 * @param  {String}
	 * @return {[type]}
	 */
	L.requestInfoSync = function requestInfoSync(id) {
	 	var xhr = new XMLHttpRequest()
	 	xhr.open("GET", "http://www.panda.tv/api_room_v2?roomid=" + id, false)
	 	xhr.send(null)
	 	return L.kiss(JSON.parse(xhr.response, "http://panda.tv/"))
	}


	/**
	 * @param  {object}
	 * @return {null}
	 */
	L.showNotificationV2 =  function showNotificationV2(info) {
	 	var opt = {
	 		type: "image",
	 		title: info.hostName + "发车了!!!",
	 		iconUrl: "icon128.png",
	 		message: "车次『"+ info.roomName + "』, 点击通知上车!",
	 		imageUrl: info.roomImg,
	 		requireInteraction: true,
	 		isClickable: true
	 	}
	 	chrome.notifications.create(info.site + info.roomId, opt)
	}

	L.addNotificationHandler = function addNotificationHandler() {
	 	chrome.notifications.onClicked.addListener(function(id) {
	 		chrome.notifications.clear(id)
	 		var pattern = /^https*:\/\/.*/i
	 		if (pattern.test(id)) {
	 			chrome.tabs.create({url: id})
	 		}
	 	})
	}

	L.getSubscriptions = function getSubscriptions() {
	 	var str = localStorage.getItem("subscriptions") || "[]"
	 	return JSON.parse(str)
	}

	L.getSubscription = function getSubscription(id) {
	 	var subscriptions = L.getSubscriptions()
	 	for (var i = 0; i < subscriptions.length; i += 1) {
	 		if (subscriptions[i].roomId === id) {
	 			return subscriptions[i]
	 		}
	 	}
	 	return null
	}

	L.saveSubscriptions = function saveSubscriptions(subscriptions) {
	 	var str = JSON.stringify(subscriptions)
	 	localStorage.setItem("subscriptions", str)
	}


	L.updateSubscriptions = function updateSubscriptions(info) {
	 	var subscriptions = L.getSubscriptions()
	 	for(var i = 0; i < subscriptions.length; i += 1) {
	 		if (subscriptions[i].roomId === info.roomId) {
	 			subscriptions[i] = info
	 			L.saveSubscriptions(subscriptions)
	 			return 0
	 		}
	 	}
	 	console.log("没有订阅该主播，无法更新状态")
	 	return 1
	}

	L.subscribe = function subscribe(info) {
	 	var subscriptions = L.getSubscriptions()
	 	subscriptions.push(info)
	 	L.saveSubscriptions(subscriptions)
	}

	L.unsubscribe = function unsubscribe(id) {
	 	var subscriptions = L.getSubscriptions()
	 	for(var i = 0; i < subscriptions.length; i += 1) {
	 		if (subscriptions[i].roomId === id)	{
	 			subscriptions.splice(i, 1)
	 			L.saveSubscriptions(subscriptions)
	 		}
	 	}
	}

	L.kiss = function kiss(responseJson, site) {
	 	if (responseJson.errno !== 0) {
	 		return responseJson
	 	} else {
	 		return {
	 			hostName: responseJson.data.hostinfo.name,
	 			hostAvartar: responseJson.data.hostinfo.avatar,
	 			roomName: responseJson.data.roominfo.name,
	 			roomId: responseJson.data.roominfo.id,
	 			roomImg: responseJson.data.roominfo.pictures.img,
	 			startTime: responseJson.data.roominfo.start_time * 1000,
	 			endTime: responseJson.data.roominfo.end_time * 1000,
	 			status: responseJson.data.videoinfo.status,
	 			errno: responseJson.errno,
	 			errmsg: responseJson.errmsg,
	 			fetchTime: String((new Date()).valueOf()),
	 			site: site
	 		}
	 	}
	}

	L.checkSubscription = function checkSubscription(info) {
	 	var subscription = L.getSubscription(info.roomId)
	 	if (info.errno !== 0) {
	 		console.log("check host is online or not error.", info.errmsg)
	 	} else {
	 		L.updateSubscriptions(info)
	 		if (info.status === "2" && subscription.status !== "2") {
	 			L.showNotificationV2(info)
	 		}
	 	}
	}

	L.checkSubscriptions =function checkSubscriptions() {
	 	var subscriptions = L.getSubscriptions()
	 	for(var i = 0; i < subscriptions.length; i += 1) {
	 		L.requestInfo(subscriptions[i].roomId, L.checkSubscription)
	 	}
	}

	L.setAll2Offline = function setAll2Offline() {
	 	var subscriptions = L.getSubscriptions()
	 	for(var i = 0; i < subscriptions.length; i += 1) {
	 		subscriptions[i].status = "3"
	 	}
	 	L.saveSubscriptions(subscriptions)
	}

	L.addAlarmHandler = function addAlarmHandler() {
	 	chrome.alarms.onAlarm.addListener(function(alarm) {
	 		console.log("alarm " + alarm.name + " has been fired at ", Date())
	 		if (alarm.name === "checkSubscriptions") {
	 			L.checkSubscriptions()
	 		}
	 	})
	}

})(window)
