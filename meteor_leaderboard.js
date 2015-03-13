PlayersList = new Mongo.Collection('players');

if (Meteor.isClient) {
	Template.leaderboard.helpers({
		player: function () {
			// var currentUserId = Meteor.userId();
			return PlayersList.find({}, { sort: { score: -1, name: 1 } });
		},
		selectedClass: function () {
			var playerId = this._id;
			var selectedPlayer = Session.get('selectedPlayer');
			if (playerId === selectedPlayer) {
				return 'selected';
			}
		},
		showSelectedPlayer: function () {
			var selectedPlayer = Session.get('selectedPlayer');
			return PlayersList.findOne(selectedPlayer);
		}
	});

	Template.leaderboard.events({
		'click .player': function() {
			var playerId = this._id;
			Session.set('selectedPlayer', playerId);
		},
		'click .increment': function () {
			var selectedPlayer = Session.get('selectedPlayer');
			// PlayersList.update(selectedPlayer, { $inc: { score: 5 } });
			Meteor.call('modifyPlayerScore', selectedPlayer, 5);
		},
		'click .decrement': function () {
			var selectedPlayer = Session.get('selectedPlayer');
			// PlayersList.update(selectedPlayer, { $inc: { score: -5 } });
			Meteor.call('modifyPlayerScore', selectedPlayer, -5);
		},
		'click .remove': function () {
			var confirmRemove = confirm('Are you sure you want to remove this person?');
			if (confirmRemove) {
				var selectedPlayer = Session.get('selectedPlayer');
				Meteor.call('removePlayerData', selectedPlayer);
			}
		}
	});

	Template.addPlayerForm.events({
		'submit form': function (event) {
			event.preventDefault();
			var playerNameVar = event.target.playerName.value;
			event.target.playerName.value = '';
			Meteor.call('insertPlayerData', playerNameVar);
		}
	});

	Meteor.subscribe('thePlayers');
}

if (Meteor.isServer) {
	Meteor.publish('thePlayers', function () {
		var currentUserId = this.userId;
		return PlayersList.find({createdBy: currentUserId});
	});
	Meteor.methods({
		'insertPlayerData': function (playerNameVar) {
			var currentUserId = Meteor.userId();
			PlayersList.insert({
				name: playerNameVar,
				score: 0,
				createdBy: currentUserId
			});
		},
		'removePlayerData': function (selectedPlayer) {
			PlayersList.remove(selectedPlayer);
		},
		'modifyPlayerScore': function (selectedPlayer, scoreValue) {
			PlayersList.update(selectedPlayer, { $inc: { score: scoreValue } });
		}
	});
}