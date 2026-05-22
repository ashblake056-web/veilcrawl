

const canvas =
document.getElementById("game");

const ctx =
canvas.getContext("2d");

canvas.width =
window.innerWidth;

canvas.height =
window.innerHeight;

const TILE = 48;
const MAP_W = 60;
const MAP_H = 60;

let paused = false;

const player = {
x:5,
y:5,
hp:100,
gold:0
};

const enemies = [];
const loot = [];
const map = [];

function createRoom(x,y,w,h){

for(let ry=y; ry<y+h; ry++){
for(let rx=x; rx<x+w; rx++){

if(
rx > 0 &&
ry > 0 &&
rx < MAP_W-1 &&
ry < MAP_H-1
){
map[ry][rx] = 0;
}

}
}

}

function generateMap(){

for(let y=0;y<MAP_H;y++){

const row=[];

for(let x=0;x<MAP_W;x++){
row.push(1);
}

map.push(row);

}

for(let i=0;i<18;i++){

const w =
4 + Math.floor(Math.random()*8);

const h =
4 + Math.floor(Math.random()*8);

const x =
1 + Math.floor(
Math.random()*(MAP_W-w-2)
);

const y =
1 + Math.floor(
Math.random()*(MAP_H-h-2)
);

createRoom(x,y,w,h);

}

}

generateMap();

function spawnEnemies(){

for(let i=0;i<30;i++){

enemies.push({
x:Math.floor(Math.random()*MAP_W),
y:Math.floor(Math.random()*MAP_H),
hp:Math.random()<0.15?50:20,
elite:Math.random()<0.15
});

}

}

spawnEnemies();

function spawnLoot(){

for(let i=0;i<20;i++){

loot.push({
x:Math.floor(Math.random()*MAP_W),
y:Math.floor(Math.random()*MAP_H),
taken:false
});

}

}

spawnLoot();

function move(dx,dy){

const nx = player.x + dx;
const ny = player.y + dy;

if(
nx < 0 ||
ny < 0 ||
nx >= MAP_W ||
ny >= MAP_H
){
return;
}

if(map[ny][nx] === 1){
return;
}

for(let e of enemies){

if(e.hp <= 0) continue;

if(e.x === nx && e.y === ny){

e.hp -= 10;

if(e.hp <= 0){
player.gold += 10;
}

return;

}

}

player.x = nx;
player.y = ny;

for(let item of loot){

if(item.taken) continue;

if(
item.x === player.x &&
item.y === player.y
){

player.hp += 20;

if(player.hp > 100){
player.hp = 100;
}

item.taken = true;

}

}

saveGame();

}

window.addEventListener("keydown",e=>{

if(paused) return;

if(e.key==="w") move(0,-1);
if(e.key==="s") move(0,1);
if(e.key==="a") move(-1,0);
if(e.key==="d") move(1,0);

});

window.addEventListener("touchstart",e=>{

if(paused) return;

const tx = e.touches[0].clientX;
const ty = e.touches[0].clientY;

const cx = canvas.width/2;
const cy = canvas.height/2;

const dx = tx-cx;
const dy = ty-cy;

if(Math.abs(dx)>Math.abs(dy)){

if(dx>0){
move(1,0);
}else{
move(-1,0);
}

}else{

if(dy>0){
move(0,1);
}else{
move(0,-1);
}

}

});

document.getElementById(
"pauseBtn"
).onclick = function(){

paused = !paused;

};

function fogDistance(x,y){

const dx = x-player.x;
const dy = y-player.y;

return Math.sqrt(dx*dx+dy*dy);

}

function enemyAI(){

for(let e of enemies){

if(e.hp <= 0) continue;

const dx = player.x-e.x;
const dy = player.y-e.y;

if(Math.abs(dx)+Math.abs(dy)<8){

if(Math.abs(dx)>Math.abs(dy)){
e.x += dx>0?1:-1;
}else{
e.y += dy>0?1:-1;
}

}

if(
e.x === player.x &&
e.y === player.y
){

player.hp -= e.elite ? 2 : 1;

if(player.hp <= 0){

alert("You Died");

player.hp = 100;
player.x = 5;
player.y = 5;

}

}

}

document.getElementById(
"hp"
).innerText = player.hp;

}

function draw(){

ctx.fillStyle = "black";
ctx.fillRect(
0,0,
canvas.width,
canvas.height
);

const camX =
player.x*TILE -
canvas.width/2;

const camY =
player.y*TILE -
canvas.height/2;

for(let y=0;y<MAP_H;y++){
for(let x=0;x<MAP_W;x++){

const dist =
fogDistance(x,y);

if(dist > 7) continue;

ctx.globalAlpha =
Math.max(0.2,1-dist/7);

ctx.fillStyle =
map[y][x]===1
? "#151515"
: "#2c2c35";

ctx.fillRect(
x*TILE-camX,
y*TILE-camY,
TILE,
TILE
);

}
}

for(let item of loot){

if(item.taken) continue;

const dist =
fogDistance(item.x,item.y);

if(dist > 7) continue;

ctx.fillStyle = "#00d48a";

ctx.beginPath();

ctx.arc(
item.x*TILE-camX+TILE/2,
item.y*TILE-camY+TILE/2,
8,
0,
Math.PI*2
);

ctx.fill();

}

for(let e of enemies){

if(e.hp <= 0) continue;

const dist =
fogDistance(e.x,e.y);

if(dist > 7) continue;

ctx.fillStyle =
e.elite
? "#ff0044"
: "#b3003c";

ctx.beginPath();

ctx.arc(
e.x*TILE-camX+TILE/2,
e.y*TILE-camY+TILE/2,
TILE/3,
0,
Math.PI*2
);

ctx.fill();

}

ctx.globalAlpha = 1;

ctx.fillStyle = "#8c6cff";

ctx.fillRect(
player.x*TILE-camX+4,
player.y*TILE-camY+4,
TILE-8,
TILE-8
);

}

function saveGame(){

localStorage.setItem(
"veilcrawl-save",
JSON.stringify(player)
);

}

function loadGame(){

const save =
localStorage.getItem(
"veilcrawl-save"
);

if(!save) return;

const data =
JSON.parse(save);

player.x = data.x;
player.y = data.y;
player.hp = data.hp;
player.gold = data.gold;

}

loadGame();

function loop(){

if(!paused){
enemyAI();
}

draw();

requestAnimationFrame(loop);

}

loop();

