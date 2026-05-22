

const canvas =
document.getElementById("game");

const ctx =
canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const TILE = 48;
const MAP_W = 80;
const MAP_H = 80;

let paused = false;

const player = {
x:10,
y:10,
hp:100,
gold:0,
xp:0,
level:1
};

const map = [];
const enemies = [];
const loot = [];

let lastEnemyMove = 0;

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

for(let i=0;i<22;i++){

const w =
5 + Math.floor(Math.random()*10);

const h =
5 + Math.floor(Math.random()*10);

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

function validSpawn(x,y){

if(map[y][x] === 1){
return false;
}

if(
Math.abs(x-player.x) < 6 &&
Math.abs(y-player.y) < 6
){
return false;
}

return true;

}

function spawnEnemies(){

for(let i=0;i<35;i++){

let ex,ey;

do{

ex =
Math.floor(Math.random()*MAP_W);

ey =
Math.floor(Math.random()*MAP_H);

}while(!validSpawn(ex,ey));

enemies.push({
x:ex,
y:ey,
hp:Math.random()<0.12?60:25,
elite:Math.random()<0.12
});

}

}

spawnEnemies();

function spawnLoot(){

for(let i=0;i<20;i++){

let lx,ly;

do{

lx =
Math.floor(Math.random()*MAP_W);

ly =
Math.floor(Math.random()*MAP_H);

}while(map[ly][lx]===1);

loot.push({
x:lx,
y:ly,
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

e.hp -= 15;

if(e.hp <= 0){

player.gold += 10;
player.xp += 15;

if(player.xp >= 100){

player.level++;
player.hp = 100;
player.xp = 0;

}

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

player.hp += 25;

if(player.hp > 100){
player.hp = 100;
}

item.taken = true;

}

}

saveGame();

}

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

const now = Date.now();

if(now-lastEnemyMove < 350){
return;
}

lastEnemyMove = now;

for(let e of enemies){

if(e.hp <= 0) continue;

const dx = player.x-e.x;
const dy = player.y-e.y;

if(Math.abs(dx)+Math.abs(dy) < 7){

if(Math.abs(dx)>Math.abs(dy)){

const nx =
e.x + (dx>0?1:-1);

if(map[e.y][nx]===0){
e.x = nx;
}

}else{

const ny =
e.y + (dy>0?1:-1);

if(map[ny][e.x]===0){
e.y = ny;
}

}

}

if(
e.x === player.x &&
e.y === player.y
){

player.hp -= e.elite ? 8 : 3;

if(player.hp <= 0){

alert(
"YOU DIED
Gold: " +
player.gold +
"
Level: " +
player.level
);

player.hp = 100;
player.gold = 0;
player.level = 1;
player.xp = 0;

player.x = 10;
player.y = 10;

}

}

}

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

if(dist > 8) continue;

ctx.globalAlpha =
Math.max(0.15,1-dist/8);

ctx.fillStyle =
map[y][x]===1
? "#111"
: "#24242d";

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

if(dist > 8) continue;

ctx.fillStyle = "#00d48a";

ctx.beginPath();

ctx.arc(
item.x*TILE-camX+TILE/2,
item.y*TILE-camY+TILE/2,
10,
0,
Math.PI*2
);

ctx.fill();

}

for(let e of enemies){

if(e.hp <= 0) continue;

const dist =
fogDistance(e.x,e.y);

if(dist > 8) continue;

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

ctx.fillStyle = "white";

ctx.font = "18px Arial";

ctx.fillText(
"LV " + player.level +
"  GOLD " + player.gold,
20,
60
);

document.getElementById(
"hp"
).innerText = player.hp;

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

const data = JSON.parse(save);

player.x = data.x;
player.y = data.y;
player.hp = data.hp;
player.gold = data.gold;
player.level = data.level || 1;
player.xp = data.xp || 0;

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

