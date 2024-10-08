const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");
const boardChess = document.getElementById("boardChess");
const waitingMessage = document.getElementById("waitingMessage");
const userId = document.getElementById('userId');
const userId2 = document.getElementById('userId2');
const userId3 = document.getElementById('userId3');
let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach((row, rowindex) => {
        row.forEach((square, squareindex) => {
            const squareElement = document.createElement("div");
            squareElement.classList.add("square",
                (rowindex + squareindex) % 2 === 0 ? "light" : "dark");
            squareElement.dataset.row = rowindex;
            squareElement.dataset.col = squareindex;

            if (square) {
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece", square.color === "w" ? "white" : "black");
                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = { row: rowindex, col: squareindex };
                        e.dataTransfer.setData("text/plain", "");
                    }
                })
                pieceElement.addEventListener("dragend", (e) => {
                    draggedPiece = null;
                    sourceSquare = null;
                })
                squareElement.appendChild(pieceElement);
            }
            squareElement.addEventListener("dragover", function (e) {
                e.preventDefault();
            });

            squareElement.addEventListener("drop", function (e) {
                e.preventDefault();
                if (draggedPiece) {
                    const targetSource = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col)
                    };
                    handleMove(sourceSquare, targetSource);
                }
            })
            boardElement.appendChild(squareElement);
        });
    });
    if(playerRole==="b"){
        boardElement.classList.add("flipped");
    }
    else{
        boardElement.classList.remove("flipped");
    }
    
};
const handleMove = (source,target) => {
    const move={
        from: `${String.fromCharCode(97+source.col)}${8-source.row}`,
        to: `${String.fromCharCode(97+target.col)}${8-target.row}`,
        promotion :"q",
    }
    socket.emit("move",move);
 };
const getPieceUnicode = (piece) => {
    const unicodePieces = {

        p: "♙",
        r: "♖",
        n: "♘",
        b: "♗",
        q: "♕",
        k: "♔",
        P: "♟",
        R: "♜",
        N: "♞",
        B: "♝",
        Q: "♛",
        K: "♚",
    }
    return unicodePieces[piece.type] || "";
};

socket.on("playerRole",function(role){
    playerRole = role;
    renderBoard();
});
socket.on('waiting', (data) => {   
    boardChess.style.display = 'none';
    waitingMessage.style.display = 'block';
    // userId.innerHTML=`user Name : ${name}`;
    userId2.innerHTML=`user id : ${socket.id}`;
    userId3.innerHTML=`user role : ${playerRole}`;
});
socket.on('chat-start', (data) => {   
    // const PlayerName = prompt("Enter your name");
    // socket.Name = PlayerName;
    userId.innerHTML=`user id2 : ${socket.id}`;
    boardChess.style.display = 'block';
    waitingMessage.style.display = 'none';
    // userId.innerHTML=`user name : ${name}`;
    userId2.innerHTML=`user role2 : ${playerRole}`;
    userId3.innerHTML=`user room2 : ${data}`;
});
socket.on("spectatorRole",function(){
    console.log("SPec");
    const boardMain = document.querySelector(".boardMain");
    const newDiv = document.createElement("div");
    newDiv.textContent = "Spectator";
    newDiv.classList.add("newDivClass");
    boardMain.appendChild(newDiv);
    playerRole = null;
    renderBoard();
});
socket.on("boardstate",function(fen){
    chess.load(fen);
    renderBoard();
});
socket.on("move",function(move){  
    chess.move(move);
    renderBoard();
});



renderBoard();

