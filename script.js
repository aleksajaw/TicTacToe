class Game {
    constructor () {
        this.loading = false;
        this.userMark = 'X';
        this.opponentMark = 'O';
        this.whoStarts = 'user';
        this.turn = 'user';
        this.currentMark = 'X';
        this.turnField = null;
        // change below if you just want to play with a friend
        this.isOpponentBot = true;
        this.currRow = null;
        this.currCol = null;
        this.message = '';
        this.hasWinner = false;
        this.diagonalLeft = ['00', '11', '22'];
        this.diagonalRight = ['02', '11', '20'];
    }
    setLoading ( bool ) {
        this.loading = bool
    }
    setTurn ( player ) {
        this.turn = player;
    }
    // WHOSE TURN
    changeTurn () {
        let newTurn = '';
        let newMark = '';

        if ( this.turn === 'user' ) {
            newTurn = 'opponent';
            newMark = this.opponentMark;

        } else if ( this.turn === 'opponent' ) {
            newTurn = 'user';
            newMark = this.userMark;
        }
        this.setTurn( newTurn );
        this.setCurrentMark( newMark );
        this.setTurnField( this.turn );
    }
    setCurrentMark ( mark ) {
        this.currentMark = mark;
    }
    setTurnField ( text ) {
        if ( !this.turnField ) this.turnField = document.getElementById('turnField');
        this.turnField.innerHTML = text;
    }
    setCurrPosition ( row, col ) {
        this.currRow = row;
        this.currCol = col;
    }
    setMessage ( text ) {
        this.message = text;
    }
    setHasWinner ( bool ) {
        this.hasWinner = bool
    }
}



let ticTacToe = new Game();



class Board {
    constructor ( state = [[ '', '', '' ],[ '', '', '' ],[ '', '', '' ]] ) {
        this.state = state;
        this.emptyCells = 9;
    }
    changeCell ( row, col, newValue ) {
        this.state[row][col] = newValue;
    }
    getCell ( row, col ) {
        return this.state[row][col]
    }
    setEmptyCells ( amount ) {
        this.emptyCells = amount
    }
}



let mainBoard = new Board();



class CellInDOM {
    constructor ( row, col ) {
        this.HTMLNode = document.createElement('input');
        this.setNodeType( 'text' );
        this.addNodeClass( 'cell' );
        this.setNodeAttribute( 'cell-row', row );
        this.setNodeAttribute( 'cell-col', col );
        this.setNodeReadOnly( true );
        this.addNodeEvent( 'click', () => {
            this.clickedCell( this.getNodeAttribute('cell-row'), this.getNodeAttribute('cell-col') )
        } );
    }
    setNodeType ( type ) {
        this.HTMLNode.type = type;
    }
    addNodeClass ( newClass ) {
        this.HTMLNode.classList.add( newClass );
    }
    getNodeAttribute ( attr ) {
        return this.HTMLNode.getAttribute( attr );
    }
    setNodeAttribute ( attr, val ) {
        this.HTMLNode.setAttribute( attr, val );
    }
    setNodeValue ( val ) {
        this.HTMLNode.value = val
    }
    setNodeDisabled ( bool ) {
        this.HTMLNode.disabled = bool
    }
    setNodeReadOnly ( bool ) {
        this.HTMLNode.readOnly = bool
    }
    addNodeEvent ( action, fn ) {
        this.HTMLNode.addEventListener( action , fn);
    }
    // FIRST ACTION
    clickedCell( row, col ) {
        this.setNodeValue( ticTacToe.currentMark );
        this.setNodeDisabled( true );
        mainBoard.changeCell( row, col, ticTacToe.currentMark );
        mainBoard.setEmptyCells( mainBoard.emptyCells - 1 );
        ticTacToe.setCurrPosition( row, col );
        let noNextTurn = false;

        if ( mainBoard.emptyCells < 5 ) {

            // ONE WINNER
            if ( checkIsWin() ) {
                noNextTurn = true
                ticTacToe.message = 'PLAYER WITH MARK "' + ticTacToe.currentMark + '" WIN!';

            // TIE
            } else if ( !mainBoard.emptyCells ) {
                noNextTurn = true
                ticTacToe.message = 'BOTH PLAYERS WIN :)';
            }

            if ( noNextTurn ) {
                changeCellsAttr('disabled', '');
                ticTacToe.setTurnField('reset game');
                setTimeout( () => { alert(ticTacToe.message) }, 100 );
            }
        }

        if ( !noNextTurn ) {
            // BOT MOVE
            if ( ticTacToe.currentMark != ticTacToe.opponentMark && ticTacToe.isOpponentBot ) {
                
                changeCellsAttr( 'disabled', '' );
                ticTacToe.changeTurn();
                ticTacToe.setLoading(true);
                setTimeout( () => {
                    changeCellsAttr(  'disabled', '', 'remove' );
                    botMove();
                    ticTacToe.setLoading(false);
                }, 1000 );

            // JUST CHANGE MARKS
            // FOR 2 PLAYERS GAME (without bot)
            } else ticTacToe.changeTurn();
        }
    }
}



class BoardInDOM {
    constructor () {
        this.boardDOM = document.createElement('div');
        this.setNodeAttribute( "id", "TTTboard" );
    }
    setNodeAttribute ( attr, val ) {
        this.boardDOM.setAttribute( attr, val );
    }
    giveMeCells () {
        let row = null;
        let cell = null;
    
        for ( let r = 0; r < 3; r++ ) {
            
            row = document.createElement('div');
    
            for ( let c = 0; c < 3; c++ ) {
                
                cell = new CellInDOM( r, c );
                row.appendChild(cell.HTMLNode);
            }
            this.boardDOM.appendChild(row);
        }
    }
    displayInDOM () {
        this.giveMeCells();
        let TTTboard = document.getElementById('TTTboard');
        TTTboard.parentNode.replaceChild(this.boardDOM, TTTboard);
    }
}



let TTTBoard = new BoardInDOM();



class BotMoveBase {
    constructor () {
        this.moveScores = {
            user: -10,
            computer: 10,
            tie: 0
        };
        this.newMove = { row: '', col:'' };
        this.hasNewMove = false;
        this.optionalWinner = null;
        this.optionalEmptyCells = 0;
    }
    setNewMove ( r, c ) {
        this.newMove = { row: r, col: c }
    }
    setHasNewMove ( bool ) {
        this.hasNewMove = bool;
    }
    setOptionalWinner ( optWinner ) {
        this.optionalWinner = optWinner
    }
    setOptionalEmptyCells ( amount ) {
        this.optionalEmptyCells = amount
    }
}



let botMoveObj = new BotMoveBase();



// LET'S MAKE THE BOT MOVES!

function botMove ( board ) {

    if ( !board ) board = mainBoard;
    let bestMoveScore = -Infinity;
    botMoveObj.setHasNewMove( false );
    let movesArray = []

    for ( let r = 0; r < 3; r++ ) {

        for ( let c = 0; c < 3; c++ ) {

            if ( !board.getCell(r,c) ) {
                
                board.changeCell( r, c, ticTacToe.opponentMark );
                ticTacToe.setCurrPosition( r, c);
                let moveScore = miniMax( board, false );
                board.changeCell( r, c, '' );

                if ( moveScore == bestMoveScore ) {
                    movesArray.push({r,c});

                } else if ( moveScore > bestMoveScore ) {
                    movesArray = []
                    movesArray.push({r,c});
                    bestMoveScore = moveScore;
                }
            }
        }
    }
    console.log(movesArray)
    // add more randomness
    randScore = movesArray[Math.floor(Math.random() * movesArray.length)];
    botMoveObj.setNewMove( randScore.r, randScore.c );

    botMoveObj.setHasNewMove( true );
    if ( botMoveObj.hasNewMove ) {
        board.changeCell( botMoveObj.newMove.row, botMoveObj.newMove.col, ticTacToe.opponentMark);
        document.querySelectorAll( '[cell-row="' + botMoveObj.newMove.row + '"][cell-col="' + botMoveObj.newMove.col + '"]' )[0].click();
    }
}


// MINIMAX ALGORITHM

function miniMax ( board, isMaximizing ) {

    if ( !board ) board = mainBoard;
    let result = checkOptionalWin(board);
    let bestMoveScore = -Infinity;

    if ( result !== null )
        return botMoveObj.moveScores[result];
    
    if ( isMaximizing ) {

        for ( let r = 0; r < 3; r++ ) {

            for ( let c = 0; c < 3; c++ ) {

                if ( !board.getCell(r,c) ) {


                    board.changeCell( r, c, ticTacToe.opponentMark );
                    ticTacToe.setCurrPosition( r, c);
                    let moveScore = miniMax( board, false );
                    board.changeCell( r, c, '' );
                    bestMoveScore = Math.max( moveScore, bestMoveScore );
                }
            }
        }

    } else {

        bestMoveScore = Infinity;

        for ( let r = 0; r < 3; r++ ) {

            for ( let c = 0; c < 3; c++ ) {
                
                if ( !board.getCell(r,c) ) {

                    board.changeCell( r, c, ticTacToe.userMark );
                    ticTacToe.setCurrPosition( r, c);
                    let moveScore = miniMax( board, true );
                    board.changeCell( r, c, '' );
                    bestMoveScore = Math.min( moveScore, bestMoveScore );
                }
            }
        }
    }
    return bestMoveScore;
}


// HELPER FOR MINIMAX ALGORITHM

function checkOptionalWin ( board ) {

    botMoveObj.setOptionalWinner(null);
    botMoveObj.setOptionalEmptyCells(0);

    if ( checkIsWin() ) {
        let newOptWinner = ( board.getCell(ticTacToe.currRow, ticTacToe.currCol) === ticTacToe.userMark )
            ? 'user'
            : 'computer';
        botMoveObj.setOptionalWinner( newOptWinner );
    }

    // get empty cells
    for ( let r = 0; r < 3; r++ ) {

        for ( let c = 0; c < 3; c++ ) {
            
            if ( !board.getCell(r,c) ) botMoveObj.setOptionalEmptyCells(botMoveObj.optionalEmptyCells + 1);
        }
    }
    
    return ( !botMoveObj.optionalWinner && !botMoveObj.optionalEmptyCells )
        ? 'tie'
        : botMoveObj.optionalWinner;
}


// MARKS IN LINE

function checkMarksInLine ( cell1, cell2, cell3 ) {
    return ( cell1 === cell2 && cell2 === cell3 && cell3 != null )
}


// DID ANYBODY WIN?
// shorter function for user move
// (less calculations)

function checkIsWin ( board ) {

    if ( !board ) board = mainBoard;
    ticTacToe.setHasWinner(false);
    let row = ticTacToe.currRow;
    let col = ticTacToe.currCol;

    // row & column
    if ( checkMarksInLine( board.getCell(row, 0), board.getCell(row, 1), board.getCell(row, 2) )
      || checkMarksInLine( board.getCell(0, col), board.getCell(1, col), board.getCell(2, col) ) ) {
            
        ticTacToe.setHasWinner(true);
    }

    // diagonals
    else if ( ( ticTacToe.diagonalLeft.includes( row + '' + col ) && checkInDiagonal('left') )
            | ( ticTacToe.diagonalRight.includes( row + '' + col ) && checkInDiagonal('right') ) ) {
                
                ticTacToe.setHasWinner(true);
    }

    return ticTacToe.hasWinner;
}


// DIAGONALS CHECKING BASE

function checkInDiagonal ( dir, board ){

    if ( !board ) board = mainBoard;

    return ( dir === 'left' )
            ? checkMarksInLine( board.getCell(0, 0), board.getCell(1,1), board.getCell(2,2) )
            : ( dir === 'right' )
                ? checkMarksInLine( board.getCell(2, 0), board.getCell(1,1), board.getCell(0,2) )
                : false
}


// CHANGING ALL CELLS

function changeCellsAttr ( attr, val = '', action = 'set' ) {

    Array.from( document.getElementsByClassName('cell') ).forEach( (cell) => {
        
        if ( action === 'remove' ) {
            if ( attr != 'disabled' || ( !cell.value && attr === 'disabled' ) )
                cell.removeAttribute( attr );
            
        } else if ( attr === 'value' )
            cell[attr] = val;

        else if ( attr === 'disabled' )
            cell.setAttribute( attr, val );
    })
}


// RESET

function resetEverything () {

    if ( !ticTacToe.loading ) {
        ticTacToe = new Game();
        ticTacToe.setLoading(true);
        ticTacToe.setTurnField(ticTacToe.turn);
        mainBoard = new Board();
        TTTBoard = new BoardInDOM();
        TTTBoard.displayInDOM();
        ticTacToe.setLoading(false);
    }
}


function writeBoardInConsole (board) {
    
    let boardRow = ''
    console.log(' ')
    for ( let row = 0; row < 3; row++ ) {
        boardRow = ''
        for ( let col = 0; col < 3; col++ ) {
            boardRow += board.state[row][col] || ' '
            boardRow += ' '
        }
        console.log(boardRow)
    }
    console.log(' ')
}



document.addEventListener('DOMContentLoaded',  () => {

    TTTBoard = new BoardInDOM();
    TTTBoard.displayInDOM();
    ticTacToe = new Game();
    mainBoard = new Board();
    document.getElementById('reset').addEventListener( 'click', () => resetEverything() );
    ticTacToe.setTurnField(ticTacToe.turn);
})