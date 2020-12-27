"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var max = 5;
var me = 0;

if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
	me = 1;
}

var Ws = function Ws() {
	var _this = this;

	_classCallCheck(this, Ws);

	this.connect = function () {
		var socket = new SockJS('/chat');
		_this.stompClient = Stomp.over(socket);
		var that = _this;
		_this.stompClient.connect({}, function (frame) {
			that.connected = true;
			that.stompClient.subscribe('/topic/messages', function (messageOutput) {
				var message = JSON.parse(messageOutput.body);
				if (that.subscribers[message.topic]) {
					that.subscribers[message.topic](message.payload);
				}
			});
		});
	};

	this.subscribe = function (topic, fn) {
		_this.subscribers[topic] = fn;
	};

	this.unsubscribe = function (topic) {
		if (_this.subscribers[topic]) {
			delete _this.subscribers[topic];
		}
	};

	this.send = function (message) {
		if (_this.connected) {
			_this.stompClient.send("/app/chat", {}, JSON.stringify(message));
		} else {
			console.log("message could not be sent");
		}
	};

	this.disconnect = function () {
		if (_this.stompClient != null) {
			console.log("disconnected");
			_this.stompClient.disconnect();
		}
	};

	this.stompClient = null;
	this.connected = false;
	this.subscribers = {};
};

// init websocket class


var ws = new Ws();

var filterArray = function filterArray(len) {
	var arr = [];
	for (var i = 0; i < len; i++) {
		arr.push(i);
	}
	return arr;
};

var Play = function (_React$Component) {
	_inherits(Play, _React$Component);

	function Play(props) {
		_classCallCheck(this, Play);

		var _this2 = _possibleConstructorReturn(this, (Play.__proto__ || Object.getPrototypeOf(Play)).call(this, props));

		_this2.notifyPlayerLeft = function () {
			if (_this2.props.playerName) {
				ws.send({
					topic: "left",
					payload: {
						player: _this2.props.playerName
					}
				});
			}
		};

		_this2.reset = function () {
			_this2.setState({
				x: filterArray(10),
				y: filterArray(10),
				play: {},
				winner: -1
			});
		};

		_this2.bottomLeftToTopRight = function (userIndex, point) {
			var _this2$state = _this2.state,
			    x = _this2$state.x,
			    y = _this2$state.y,
			    play = _this2$state.play;
			// step 1 move point to bottom left and start count

			var currentPoint = { x: point.x, y: point.y };
			while (true) {
				if (currentPoint.x === x[0]) {
					// reached to the left
					break;
				}
				if (currentPoint.y === y[y.length - 1]) {
					// reached to bottom
					break;
				}
				currentPoint.x--;
				currentPoint.y++;
			}
			// step 2 we now have from point let count from start to endpoint
			var count = 0;

			while (true) {
				var key = currentPoint.x + ':' + currentPoint.y;
				if (play[key] === userIndex) {
					count++;
					if (count === max) {
						return true;
					}
				} else {
					count = 0;
				}
				if (currentPoint.x === x[x.length - 1]) {
					// reached to the right
					break;
				}
				if (currentPoint.y === 0) {
					// reached to the top
					break;
				}
				currentPoint.x++;
				currentPoint.y--;
			}
			return count >= max;
		};

		_this2.topLeftToBottomRight = function (userIndex, point) {
			var _this2$state2 = _this2.state,
			    x = _this2$state2.x,
			    y = _this2$state2.y,
			    play = _this2$state2.play;
			// step 1 move point to top left and start count

			var currentPoint = { x: point.x, y: point.y };
			while (true) {
				if (currentPoint.x === x[0]) {
					// reached to the left
					break;
				}
				if (currentPoint.y === y[0]) {
					// reached to top
					break;
				}
				currentPoint.x--;
				currentPoint.y--;
			}
			// step 2 we now have from point let count from start to endpoint
			var count = 0;

			while (true) {
				var key = currentPoint.x + ':' + currentPoint.y;
				if (play[key] === userIndex) {
					count++;
					if (count === max) {
						return true;
					}
				} else {
					count = 0;
				}
				if (currentPoint.x === x[x.length - 1]) {
					// reached to the right
					break;
				}
				if (currentPoint.y === y[y.length - 1]) {
					// reached to the bottom
					break;
				}
				currentPoint.x++;
				currentPoint.y++;
			}
			return count >= max;
		};

		_this2.topToBottom = function (userIndex, point) {
			var _this2$state3 = _this2.state,
			    x = _this2$state3.x,
			    y = _this2$state3.y,
			    play = _this2$state3.play;
			// step 1 move point to top

			var currentPoint = { x: point.x, y: point.y };
			while (true) {
				if (currentPoint.y === y[0]) {
					// reached to top
					break;
				}
				currentPoint.y--;
			}
			// step 2 counting
			var count = 0;
			while (true) {
				var key = currentPoint.x + ':' + currentPoint.y;
				if (play[key] === userIndex) {
					count++;
					if (count === max) {
						return true;
					}
				} else {
					count = 0;
				}
				if (currentPoint.y === y[y.length - 1]) {
					// reached to the bottom
					break;
				}
				currentPoint.y++;
			}
			return count >= max;
		};

		_this2.leftToRight = function (userIndex, point) {
			var _this2$state4 = _this2.state,
			    x = _this2$state4.x,
			    y = _this2$state4.y,
			    play = _this2$state4.play;
			// step 1 move point to left

			var currentPoint = { x: point.x, y: point.y };
			while (true) {
				if (currentPoint.x === x[0]) {
					// reached to left
					break;
				}
				currentPoint.x--;
			}
			// step 2 counting
			var count = 0;
			while (true) {
				var key = currentPoint.x + ':' + currentPoint.y;
				if (play[key] === userIndex) {
					count++;
					if (count === max) {
						return true;
					}
				} else {
					count = 0;
				}
				if (currentPoint.x === x[x.length - 1]) {
					// reached to the right
					break;
				}
				currentPoint.x++;
			}
			return count >= max;
		};

		_this2.notifyWinner = function (user) {
			ws.send({
				topic: "winner",
				payload: {
					user: user
				}
			});
		};

		_this2.checkWin = function (userIndex, point) {
			// check bottom left -> top right
			if (_this2.bottomLeftToTopRight(userIndex, point)) {
				_this2.notifyWinner(userIndex);
			}
			if (_this2.topLeftToBottomRight(userIndex, point)) {
				_this2.notifyWinner(userIndex);
			}
			if (_this2.topToBottom(userIndex, point)) {
				_this2.notifyWinner(userIndex);
			}
			if (_this2.leftToRight(userIndex, point)) {
				_this2.notifyWinner(userIndex);
			}
		};

		_this2.state = {
			x: filterArray(10),
			y: filterArray(10),
			play: {},
			currentPlayer: 0,
			players: [],
			winner: -1
		};

		_this2.dialogRef = React.createRef();
		_this2.closeDialogRef = React.createRef();
		return _this2;
	}

	_createClass(Play, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			var _this3 = this;

			var that = this;
			// subscribe each play
			ws.subscribe("play", function (payload) {
				var player = parseInt(payload.player);
				console.log("receive player:", player);
				if (_this3.state.currentPlayer !== player) {
					return;
				}
				var key = payload.x + ':' + payload.y;
				if (typeof that.state.play[key] !== "undefined") {
					// exist.
					alert("This position already played");
					return;
				}
				var value = that.state.currentPlayer === 0 ? 0 : 1;
				//let value = me === 0 ? 0 : 1;
				that.setState({
					currentPlayer: that.state.currentPlayer === 1 ? 0 : 1,
					play: Object.assign({}, _this3.state.play, _defineProperty({}, key, value))
				}, function () {
					return that.checkWin(player, { x: payload.x, y: payload.y });
				});
			});

			// subscribe who is winner
			ws.subscribe("winner", function (payload) {
				if (that.state.winner > -1) {
					// already notify
					return;
				}

				that.setState({
					winner: payload.user
				}, function () {
					if (that.dialogRef && that.dialogRef.current) {
						var dialog = that.dialogRef.current;
						if (!dialog.showModal) {
							dialogPolyfill.registerDialog(dialog);
						}
						dialog.showModal();
						if (that.closeDialogRef.current) {
							that.closeDialogRef.current.addEventListener('click', function () {
								if (!dialog.hidden) {
									dialog.close();
								}
							});
						}
					}
				});
			});
			ws.subscribe("join", function (payload) {
				if (_this3.props.playerName) {
					me = payload.players.findIndex(function (p) {
						return p === _this3.props.playerName;
					});
				}
				that.setState({
					players: payload.players
				});
			});
			window.addEventListener("beforeunload", this.notifyPlayerLeft);
		}
	}, {
		key: 'componentWillUnmount',
		value: function componentWillUnmount() {
			window.removeEventListener("beforeunload", this.notifyPlayerLeft);
		}
	}, {
		key: 'render',
		value: function render() {
			var _this4 = this;

			var _state = this.state,
			    x = _state.x,
			    y = _state.y,
			    play = _state.play,
			    currentPlayer = _state.currentPlayer,
			    players = _state.players;
			var playerName = this.props.playerName;

			var friend = players.find(function (p) {
				return p !== playerName;
			});
			return React.createElement(
				'div',
				{ className: 'container' },
				React.createElement(
					'div',
					{ className: "header" },
					React.createElement(
						'div',
						{ className: "players flex" },
						React.createElement(
							'div',
							{ className: "you" },
							playerName
						),
						friend && React.createElement(
							'div',
							{ className: "friend" },
							friend
						)
					)
				),
				React.createElement(
					'div',
					{ className: 'table' },
					React.createElement(
						'table',
						null,
						React.createElement(
							'tbody',
							null,
							x.map(function (yValue, xIndex) {
								var rowClass = "table-row";
								if (xIndex === x.length - 1) {
									rowClass = "table-row last-row";
								}
								return React.createElement(
									'tr',
									{ className: rowClass, key: 'row-' + xIndex },
									y.map(function (xValue, yIndex) {
										var key = xValue + ':' + yValue;
										var value = me === 0 ? 0 : 1;
										var columnClass = "allow";
										if (me !== currentPlayer) {
											columnClass = "not-allow";
										}
										return React.createElement(
											'td',
											{
												className: columnClass,
												onClick: function onClick() {
													if (me !== currentPlayer) {
														// this step is not for you
														return;
													}
													if (typeof play[key] === "undefined") {
														_this4.setState({
															currentPlayer: _this4.state.currentPlayer === 1 ? 0 : 1,
															play: Object.assign({}, _this4.state.play, _defineProperty({}, key, value))
														}, function () {
															// send over socket
															ws.send({
																topic: "play",
																payload: {
																	player: me,
																	x: xValue,
																	y: yValue
																}
															});
															// check who is winner
															_this4.checkWin(me, { x: xValue, y: yValue });
														});
													}
												},
												key: 'col-' + key
											},
											typeof play[key] === "undefined" && React.createElement('span', { className: 'material-icons' }),
											play[key] === 0 && React.createElement(
												'span',
												{
													className: 'material-icons'
												},
												'radio_button_unchecked'
											),
											play[key] === 1 && React.createElement(
												'span',
												{
													style: { fontSize: 34 },
													className: 'material-icons' },
												'close'
											)
										);
									})
								);
							})
						)
					)
				),
				React.createElement(
					'dialog',
					{ ref: this.dialogRef, className: 'mdl-dialog', id: 'winnerDialog' },
					React.createElement(
						'h4',
						{ className: 'mdl-dialog__title' },
						this.state.winner === me ? 'You win 😄' : "You lost 😢"
					),
					React.createElement(
						'div',
						{ className: 'mdl-dialog__actions mdl-dialog__actions--full-width' },
						React.createElement(
							'button',
							{ style: {
									marginTop: 20
								}, ref: this.closeDialogRef, onClick: function onClick() {
									_this4.reset();
								}, type: 'button', className: 'mdl-button close' },
							'Play again'
						)
					)
				)
			);
		}
	}]);

	return Play;
}(React.Component);

var App = function (_React$Component2) {
	_inherits(App, _React$Component2);

	function App(props) {
		_classCallCheck(this, App);

		var _this5 = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

		_this5.state = {
			playerName: ""
		};
		_this5.registerDialog = React.createRef();
		_this5.closeRegisterDialogRef = React.createRef();
		_this5.inputRef = React.createRef();

		return _this5;
	}

	_createClass(App, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			ws.connect();
			var that = this;
			if (this.registerDialog && this.registerDialog.current) {
				var dialog = this.registerDialog.current;
				if (!dialog.showModal) {
					dialogPolyfill.registerDialog(dialog);
				}
				if (!this.state.playerName) {
					dialog.showModal();
				}
				if (this.closeRegisterDialogRef.current) {
					this.closeRegisterDialogRef.current.addEventListener('click', function () {
						if (that.inputRef.current) {
							var playerName = that.inputRef.current.value;
							that.setState({
								playerName: playerName
							}, function () {
								if (playerName) {
									// notify to websocket join to play game
									ws.send({
										topic: "join",
										payload: {
											name: playerName
										}
									});
									if (!dialog.hidden) {
										dialog.close();
									}
								}
							});
						}
					});
				}
			}
		}
	}, {
		key: 'componentWillUnmount',
		value: function componentWillUnmount() {
			ws.disconnect();
		}
	}, {
		key: 'render',
		value: function render() {
			return React.createElement(
				'div',
				null,
				React.createElement(Play, { playerName: this.state.playerName }),
				React.createElement(
					'dialog',
					{ id: 'register-dialog', ref: this.registerDialog, className: 'mdl-dialog' },
					React.createElement(
						'h5',
						{ className: 'mdl-dialog__title' },
						'UED Caro game'
					),
					React.createElement(
						'div',
						{ className: 'mdl-dialog__content' },
						React.createElement(
							'div',
							{ className: 'mdl-textfield mdl-js-textfield', style: { width: '100%' } },
							React.createElement('input', { ref: this.inputRef, style: { width: "100%" }, className: 'mdl-textfield__input', type: 'text', id: 'name' }),
							React.createElement(
								'label',
								{ className: 'mdl-textfield__label', htmlFor: 'name' },
								'Your name'
							)
						)
					),
					React.createElement(
						'div',
						{ className: 'mdl-dialog__actions mdl-dialog__actions--full-width' },
						React.createElement(
							'button',
							{ style: {
									marginTop: 20
								}, ref: this.closeRegisterDialogRef, type: 'button', className: 'mdl-button close' },
							'Play now'
						)
					)
				)
			);
		}
	}]);

	return App;
}(React.Component);

var domContainer = document.querySelector("#root");
ReactDOM.render(React.createElement(App, null), domContainer);