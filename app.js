const express =require("express")
const socket = require("socket.io")
const http = require("http")
const {Chess} = require("chess.js")
const path = require("path")
const { Socket } = require("dgram")
const { log } = require("console")


const app = express() 

const server= http.createServer(app)
const io=socket(server)

var chess = new Chess()

let players = {}
let currentPlayer = "w"

app.set("view engine","ejs")
app.use(express.static(path.join(__dirname,"public")))

app.get("/",(req,res)=>{
    res.render("index")
    
})

io.on("connection",(socket)=>{
    
   if(!players.white){
    players.white=socket.id
    socket.emit("playerRole","w");
   }
   else if(!players.black){
    players.black=socket.id
    socket.emit("playerRole","b")
   }
   else {
    socket.emit("spectatorRole")
   }

   socket.on("disconnect",()=>{
    if(socket.id==players.white){
        delete players.white
        if(Object.keys(players).length==0){
            chess = new Chess()
        }
    }else if(socket.id==players.black){
        delete players.black
        if(Object.keys(players).length==0){
            chess= new Chess()
        }
    }
    })

   socket.on("mamar-bari",(move)=>{
    try {
        if(chess.turn()=='w' && socket.id!==players.white)  return;
         if(chess.turn()=='b' && socket.id!=players.black) return;

          const result = chess.move(move)
          
          if(result){
             currentPlayer=chess.turn();
             io.emit("move",move);
             io.emit("boardState",chess.fen()) 
          }else{
             socket.emit("Invalid-move",move)
          }
        
    } catch (error) {
        socket.emit("Invalid-move",move)
    }
    
   })
   
    
})

server.listen(3000,()=>{
    console.log("listening");
})