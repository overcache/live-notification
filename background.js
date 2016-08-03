/* global chrome, liveNotification*/

liveNotification.addNotificationHandler()
liveNotification.addAlarmHandler()
chrome.alarms.create("checkSubscriptions", {delayInMinutes: 1, periodInMinutes: 14})
