addNotificationHandler()
addAlarmHandler()
chrome.alarms.create("checkSubscriptions", {delayInMinutes: 1, periodInMinutes: 14})
// setInterval(function(){
// 	console.log("checkSubscriptions at: ", Date())
// 	checkSubscriptions()
// }, 900000)
