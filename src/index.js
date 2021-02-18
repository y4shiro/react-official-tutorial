import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button
      className={`square ${props.isHighLight ? 'highlight' : ''}`}
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i, isHighLight = false) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        key={i}
        isHighLight={isHighLight}
      />
    );
  }

  render() {
    const cols = 3; // 縦の列数
    const rows = 3; // 横の行数
    const boardElements = [];
    const highLightSquares = this.props.highLight ?? [];

    for (let i = 0; i < rows; i++) {
      const rowElemnts = [];
      for (let j = 0; j < cols; j++) {
        const isHighLight = highLightSquares.includes(j + (i * 3))
        rowElemnts.push(this.renderSquare(j + (i * 3), isHighLight));
      }
      boardElements.push(
        <div className="board-row" key={i}>
          {rowElemnts}
        </div>
      );
    }

    return (
      <div>
        {boardElements}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          col: 0,
          row: 0,
        }
      ],
      stepNumber: 0,
      xIsNext: true,
      isAscSort: true
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares,
          col: i % 3,
          row: Math.floor(i / 3) + 1,
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }

  toggleAscSort() {
    this.setState({
      isAscSort: !this.state.isAscSort
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const desc = move ?
        `Go to move # ${move} (${step.col}, ${step.row})` :
        'Go to game start';
      return (
        <li key={move}>
          <button
            onClick={() => this.jumpTo(move)}
            className={ move === this.state.stepNumber ? 'bold' : '' }
          >
            {desc}
          </button>
        </li>
      );
    });

    let status;
    if (winner) {
      // ドローの場合は引き分けの文言を表示、勝者がいる場合は勝者の名前を表示
      status = winner.isDraw ? "引き分けです" : "Winner: " + winner.name;
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    // state の値に応じて moves の並び順を反転
    if (!this.state.isAscSort) moves.reverse();

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={i => this.handleClick(i)}
            highLight={winner ? winner.line : null}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.toggleAscSort()}>着手の並び順入れ替え</button>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        isDraw: false,
        name: squares[a],
        line: lines[i]
      };
    }
  }
  if (!squares.includes(null)) { // squares にマス目の空き(null)がなくなった場合、isDraw: true を返す
    return {
      isDraw: true,
      name: null,
      line: null
    };
  }
  return null;
}
