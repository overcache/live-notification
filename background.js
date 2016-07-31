addNotificationHandler()
addAlarmHandler()
chrome.alarms.create("checkSubscriptions", {delayInMinutes: 1, periodInMinutes: 14})
