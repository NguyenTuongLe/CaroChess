"use strict";

const max = 5;
let me = 0;

if (navigator.userAgent.toLowerCase().indexOf("chrome") > -1) {
  me = 1;
}

class Ws {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.subscribers = {};
  }

  connect = () => {
    let socket = new SockJS("/chat");
    this.stompClient = Stomp.over(socket);
    const that = this;
    this.stompClient.connect({}, function (frame) {
      that.connected = true;
      that.stompClient.subscribe("/topic/messages", function (messageOutput) {
        let message = JSON.parse(messageOutput.body);
        if (that.subscribers[message.topic]) {
          that.subscribers[message.topic](message.payload);
        }
      });
    });
  };

  subscribe = (topic, fn) => {
    this.subscribers[topic] = fn;
  };

  unsubscribe = (topic) => {
    if (this.subscribers[topic]) {
      delete this.subscribers[topic];
    }
  };

  send = (message) => {
    if (this.connected) {
      this.stompClient.send("/app/chat", {}, JSON.stringify(message));
    } else {
      console.log("message could not be sent");
    }
  };

  disconnect = () => {
    if (this.stompClient != null) {
      console.log("disconnected");
      this.stompClient.disconnect();
    }
  };
}

// init websocket class
let ws = new Ws();

const filterArray = (len) => {
  let arr = [];
  for (let i = 0; i < len; i++) {
    arr.push(i);
  }
  return arr;
};

class Play extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      x: filterArray(10),
      y: filterArray(10),
      play: {},
      currentPlayer: 0,
      players: [],
      winner: -1,
    };

    this.dialogRef = React.createRef();
    this.closeDialogRef = React.createRef();
  }

  componentDidMount() {
    const that = this;
    // subscribe each play
    ws.subscribe("play", (payload) => {
      const player = parseInt(payload.player);
      console.log("receive player:", player);
      if (this.state.currentPlayer !== player) {
        return;
      }
      const key = `${payload.x}:${payload.y}`;
      if (typeof that.state.play[key] !== "undefined") {
        // exist.
        alert("This position already played");
        return;
      }
      let value = that.state.currentPlayer === 0 ? 0 : 1;
      //let value = me === 0 ? 0 : 1;
      that.setState(
        {
          currentPlayer: that.state.currentPlayer === 1 ? 0 : 1,
          play: {
            ...this.state.play,
            [key]: value,
          },
        },
        () => that.checkWin(player, { x: payload.x, y: payload.y })
      );
    });

    // subscribe who is winner
    ws.subscribe("winner", (payload) => {
      if (that.state.winner > -1) {
        // already notify
        return;
      }

      that.setState(
        {
          winner: payload.user,
        },
        () => {
          if (that.dialogRef && that.dialogRef.current) {
            let dialog = that.dialogRef.current;
            if (!dialog.showModal) {
              dialogPolyfill.registerDialog(dialog);
            }
            dialog.showModal();
            if (that.closeDialogRef.current) {
              that.closeDialogRef.current.addEventListener(
                "click",
                function () {
                  if (!dialog.hidden) {
                    dialog.close();
                  }
                }
              );
            }
          }
        }
      );
    });
    ws.subscribe("join", (payload) => {
      if (this.props.playerName) {
        me = payload.players.findIndex((p) => p === this.props.playerName);
      }
      that.setState({
        players: payload.players,
      });
    });
    window.addEventListener("beforeunload", this.notifyPlayerLeft);
  }

  componentWillUnmount() {
    window.removeEventListener("beforeunload", this.notifyPlayerLeft);
  }

  notifyPlayerLeft = () => {
    if (this.props.playerName) {
      ws.send({
        topic: "left",
        payload: {
          player: this.props.playerName,
        },
      });
    }
  };
  reset = () => {
    this.setState({
      x: filterArray(10),
      y: filterArray(10),
      play: {},
      winner: -1,
    });
  };

  bottomLeftToTopRight = (userIndex, point) => {
    const { x, y, play } = this.state;
    // step 1 move point to bottom left and start count
    const currentPoint = { x: point.x, y: point.y };
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
    let count = 0;

    while (true) {
      const key = `${currentPoint.x}:${currentPoint.y}`;
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

  topLeftToBottomRight = (userIndex, point) => {
    const { x, y, play } = this.state;
    // step 1 move point to top left and start count
    const currentPoint = { x: point.x, y: point.y };
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
    let count = 0;

    while (true) {
      const key = `${currentPoint.x}:${currentPoint.y}`;
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

  topToBottom = (userIndex, point) => {
    const { x, y, play } = this.state;
    // step 1 move point to top
    const currentPoint = { x: point.x, y: point.y };
    while (true) {
      if (currentPoint.y === y[0]) {
        // reached to top
        break;
      }
      currentPoint.y--;
    }
    // step 2 counting
    let count = 0;
    while (true) {
      const key = `${currentPoint.x}:${currentPoint.y}`;
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

  leftToRight = (userIndex, point) => {
    const { x, y, play } = this.state;
    // step 1 move point to left
    const currentPoint = { x: point.x, y: point.y };
    while (true) {
      if (currentPoint.x === x[0]) {
        // reached to left
        break;
      }
      currentPoint.x--;
    }
    // step 2 counting
    let count = 0;
    while (true) {
      const key = `${currentPoint.x}:${currentPoint.y}`;
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

  notifyWinner = (user) => {
    ws.send({
      topic: "winner",
      payload: {
        user: user,
      },
    });
  };
  checkWin = (userIndex, point) => {
    // check bottom left -> top right
    if (this.bottomLeftToTopRight(userIndex, point)) {
      this.notifyWinner(userIndex);
      return;
    }
    if (this.topLeftToBottomRight(userIndex, point)) {
      this.notifyWinner(userIndex);
      return;
    }
    if (this.topToBottom(userIndex, point)) {
      this.notifyWinner(userIndex);
      return;
    }
    if (this.leftToRight(userIndex, point)) {
      this.notifyWinner(userIndex);
      return;
    }
    this.checkExpandMap(point);
  };

  checkExpandMap = (point) => {
    let { x, y } = this.state;

    console.log("play:", point, x);
    // check left first
    if (point.x === x[0]) {
      // open map to the left
      const minX = x[0];
      x = [...[minX - 2, minX - 1], ...x];
    }
    // react the right
    if (point.x === x[x.length - 1]) {
      const maxX = x[x.length - 1];
      x = [...x, ...[maxX + 1, maxX + 2]];
    }
    // reached the top
    if (point.y === y[0]) {
      const minY = y[0];
      y = [...[minY - 2, minY - 1], ...y];
    }
    // reached the bottom
    if (point.y === y[y.length - 1]) {
      const maxY = y[y.length - 1];
      y = [...y, ...[maxY + 1, maxY + 2]];
    }
    this.setState({ x, y });
  };

  render() {
    const { x, y, play, currentPlayer, players } = this.state;
    const { playerName } = this.props;
    let friend = players.find((p) => p !== playerName);
    return (
      <div className="container">
        <div className={"header"}>
          <div className={"players flex"}>
            <div className={"you"}>{playerName}</div>
            {friend && <div className={"friend"}>{friend}</div>}
          </div>
        </div>
        <div className="table">
          <table>
            <tbody>
              {y.map((yValue, xIndex) => {
                let rowClass = "table-row";
                if (xIndex === x.length - 1) {
                  rowClass = "table-row last-row";
                }
                return (
                  <tr className={rowClass} key={`row-${xIndex}`}>
                    {x.map((xValue, yIndex) => {
                      const key = `${xValue}:${yValue}`;
                      let value = me === 0 ? 0 : 1;
                      let columnClass = "allow";
                      if (me !== currentPlayer) {
                        columnClass = "not-allow";
                      }
                      return (
                        <td
                          className={columnClass}
                          onClick={() => {
                            if (me !== currentPlayer) {
                              // this step is not for you
                              return;
                            }
                            if (typeof play[key] === "undefined") {
                              this.setState(
                                {
                                  currentPlayer:
                                    this.state.currentPlayer === 1 ? 0 : 1,
                                  play: {
                                    ...this.state.play,
                                    [key]: value,
                                  },
                                },
                                () => {
                                  // send over socket
                                  ws.send({
                                    topic: "play",
                                    payload: {
                                      player: me,
                                      x: xValue,
                                      y: yValue,
                                    },
                                  });
                                  // check who is winner
                                  this.checkWin(me, { x: xValue, y: yValue });
                                }
                              );
                            }
                          }}
                          key={`col-${key}`}
                        >
                          {typeof play[key] === "undefined" && (
                            <span className="material-icons" />
                          )}
                          {play[key] === 0 && (
                            <span className="material-icons">
                              radio_button_unchecked
                            </span>
                          )}
                          {play[key] === 1 && (
                            <span
                              style={{ fontSize: 34 }}
                              className="material-icons"
                            >
                              close
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <dialog ref={this.dialogRef} className="mdl-dialog" id="winnerDialog">
          <h4 className="mdl-dialog__title">
            {this.state.winner === me ? "You win 😄" : "You lost 😢"}
          </h4>
          <div className="mdl-dialog__actions mdl-dialog__actions--full-width">
            <button
              style={{
                marginTop: 20,
              }}
              ref={this.closeDialogRef}
              onClick={() => {
                this.reset();
              }}
              type="button"
              className="mdl-button close"
            >
              Play again
            </button>
          </div>
        </dialog>
      </div>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playerName: "",
    };
    this.registerDialog = React.createRef();
    this.closeRegisterDialogRef = React.createRef();
    this.inputRef = React.createRef();
  }

  componentDidMount() {
    ws.connect();
    const that = this;
    if (this.registerDialog && this.registerDialog.current) {
      let dialog = this.registerDialog.current;
      if (!dialog.showModal) {
        dialogPolyfill.registerDialog(dialog);
      }
      if (!this.state.playerName) {
        dialog.showModal();
      }
      if (this.closeRegisterDialogRef.current) {
        this.closeRegisterDialogRef.current.addEventListener(
          "click",
          function () {
            if (that.inputRef.current) {
              const playerName = that.inputRef.current.value;
              that.setState(
                {
                  playerName,
                },
                () => {
                  if (playerName) {
                    // notify to websocket join to play game
                    ws.send({
                      topic: "join",
                      payload: {
                        name: playerName,
                      },
                    });
                    if (!dialog.hidden) {
                      dialog.close();
                    }
                  }
                }
              );
            }
          }
        );
      }
    }
  }

  componentWillUnmount() {
    ws.disconnect();
  }

  render() {
    return (
      <div>
        <Play playerName={this.state.playerName} />
        <dialog
          id="register-dialog"
          ref={this.registerDialog}
          className="mdl-dialog"
        >
          <h5 className="mdl-dialog__title">UED Caro game</h5>
          <div className="mdl-dialog__content">
            <div
              className="mdl-textfield mdl-js-textfield"
              style={{ width: "100%" }}
            >
              <input
                ref={this.inputRef}
                style={{ width: "100%" }}
                className="mdl-textfield__input"
                type="text"
                id="name"
              />
              <label className="mdl-textfield__label" htmlFor="name">
                Your name
              </label>
            </div>
          </div>
          <div className="mdl-dialog__actions mdl-dialog__actions--full-width">
            <button
              style={{
                marginTop: 20,
              }}
              ref={this.closeRegisterDialogRef}
              type="button"
              className="mdl-button close"
            >
              Play now
            </button>
          </div>
        </dialog>
      </div>
    );
  }
}

let domContainer = document.querySelector("#root");
ReactDOM.render(<App />, domContainer);
