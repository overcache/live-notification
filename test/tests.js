var should = chai.should()

describe("Test Common.js", function() {
	it("test addNumPadding", function(){
		addNumPadding(9).should.equal("09")
		addNumPadding(0).should.equal("00")
		addNumPadding(19).should.equal("19")
	})

	it("test formatTime", function() {
		formatTime(new Date("1987-03-30 12:32")).should.equal("03-30 12:32")
	})

	it.skip("test requestInfoSync", function() {
		var info = requestInfoSync("2009")
		info.roomId.should.equal("2009")
		info.hostName.should.equal("伍声2009")
	})

	it.skip("test requestInfo", function(done) {
		this.timeout(30000)
		requestInfo("2009", function(info) {
			info.roomId.should.equal("2009")
			info.hostName.should.equal("伍声2009")
			done()
		})
	})

	it.skip("test notifications", function() {
		var info = {
			hostName: "Test",
			roomName: "Room Name",
			roomImg: ""
		}
		showNotificationV2(info)
	})
})
