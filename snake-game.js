//grab the canvas and get 2d object with canvas methods
let context = document.querySelector("#context").getContext('2d');
//scoreboard
let scoreDisplay = document.querySelector('#score-display');
//level btns easy,normal,hard
let levelEasy = document.querySelector('#easy');
let levelNormal = document.querySelector('#normal');
let levelHard = document.querySelector('#hard');

let WIDTH = 500;
let HEIGHT = 500;
let snakeList, foodList, direction, velocity, eaten, gameLevel, intervalVar, score, running;




context.font = "20px Calibri";
context.fillText('Click me to start the game', 140, 250);
running =false;
//game setting
velocity = 7;
score = 0;
//increase the difficulty til 15
gameLevel = 5;


//game objects
let snakeBody = {
    //snake consists of multiple rect shapes (snakeBody) rather than one rect.
    width: 20,
    height: 20,
    headColor: "black",
    bodyColor: 'green',
};

let food = {
    width: 20,
    height: 20,
    color: 'orange',
};

//sound 

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.loop = false;
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
      this.sound.play();
    }
    this.stop = function(){
      this.sound.pause();
    }
    this.loop = function(){
        this.sound.loop=true;
      }
  }

let eatSound = new sound("eatSound.wav");
let gameOver = new sound("gameOver.wav");
let bgMusic = new sound("bg.mp3");

//change velocity depending on level the player chooses;
levelEasy.addEventListener('click', (e) => {
    velocity = 5;
    e.target.classList.add('selected');
    levelNormal.classList.remove('selected');
    levelHard.classList.remove('selected');
    console.log(velocity);
})

levelNormal.addEventListener('click', (e) => {
    velocity = 7;
    e.target.classList.add('selected');
    levelEasy.classList.remove('selected');
    levelHard.classList.remove('selected');
    console.log(velocity);
})

levelHard.addEventListener('click', (e) => {
    velocity = 12;
    e.target.classList.add('selected');
    levelEasy.classList.remove('selected');
    levelNormal.classList.remove('selected');
    console.log(velocity);
})

//when the canvas is clicked, the game will start
document.getElementById('context').onmousedown = function(){
    if(running){
        clearInterval(intervalVar);
        bgMusic.stop();
        running = false;
        //game level also reset
        velocity = 7;
        console.log("reset" + velocity);
    }

    startGame();
}



//fire function when a key is pressed. event stores which key is pressed
document.onkeydown = function(event){

    event.preventDefault();
    //0 -left
    //1 -Up
    //2 -right
    //3 -down
     if (event.keyCode == 37 && direction != 2) {
          direction = 0;
        }
        else if (event.keyCode == 38 && direction != 3) {
          direction = 1;
        }
        else if (event.keyCode == 39 && direction != 0) {
          direction = 2;
        }
        else if (event.keyCode == 40 && direction != 1) {
          direction = 3;
        }
}

//sb = snakeBody, i = index of snakeList
drawSnake = function(sb, i){
    //save the state of canvas
    context.save();
    if( i==0 ){
        context.fillStyle = snakeBody.headColor;
    } else {
        context.fillStyle = snakeBody.bodyColor;
    }
    
    context.fillRect(sb.x, sb.y, snakeBody.width, snakeBody.height);
    context.restore();
}

updateSnakeList = function(){
    for(let i = snakeList.length-1; i >= 0; i--){
        
        if( direction == 0) {
            if( i == 0 ){
                snakeList[i].x = snakeList[i].x - velocity;       
            } else {
                snakeList[i].x = snakeList[i-1].x;
                snakeList[i].y = snakeList[i-1].y;
            }
        } else  if( direction == 1) {
            if( i == 0 ){
                snakeList[i].y = snakeList[i].y - velocity;       
            } else {
                snakeList[i].x = snakeList[i-1].x;
                snakeList[i].y = snakeList[i-1].y;
            }
        } else  if( direction == 2) {
            if( i == 0 ){
                snakeList[i].x = snakeList[i].x + velocity;       
            } else {
                snakeList[i].x = snakeList[i-1].x;
                snakeList[i].y = snakeList[i-1].y;
            }
        } else  if( direction == 3) {
            if( i == 0 ){
                snakeList[i].y = snakeList[i].y + velocity;       
            } else {
                snakeList[i].x = snakeList[i-1].x;
                snakeList[i].y = snakeList[i-1].y;
            }
        }
        
    }

}


drawFood = function (f, i){
    context.save();
    context.fillStyle = food.color;
    context.fillRect(f.x, f.y, food.width, food.height);
    context.restore();
}

//boundary condition for a snake
checkSnakePosition = function(){
    //check the pos of the head of a snake
    if( snakeList[0].x > 500 ){
        snakeList[0].x = 0;
    }
    if( snakeList[0].x < 0 ){
        snakeList[0].x = 500;
    }
    if( snakeList[0].y > 500 ){
        snakeList[0].y = 0;
    }
    if( snakeList[0].y < 0 ){
        snakeList[0].y = 500;
    }
}

//check if objects are collided
testCollision = function(rect1, rect2){
    return ((rect1.x <= rect2.x + food.width) && 
            (rect2.x <= rect1.x + snakeBody.width) &&
            (rect1.y <= rect2.y + food.height) &&
            (rect2.y <= rect1.y + snakeBody.height));
}

testCollisionSnake = function(snake1, snake2){
    return ((Math.abs(snake1.x - snake2.x) < gameLevel) &&
            (Math.abs(snake1.y - snake2.y) < gameLevel));
}

isGameOver = function() {
    for(i in snakeList){
        if (i==0){
            continue;
        }

        if(testCollisionSnake(snakeList[0], snakeList[i])){
            gameOver.play();
            bgMusic.stop()
            //stop the game loop
            clearInterval(intervalVar);
            context.fillText('Game Over!! Click me to restart', 140, 250);
            return;
        }
    }
}

//game loop
updateSnakePosition = function(){
    //redraw canvas
    context.clearRect(0, 0, WIDTH, HEIGHT);
    //if there is no food left, create a food
    while(eaten){
        let pos_x = Math.random()*485 + 5;
        let pos_y = Math.random()*485 + 5;
        foodList[0] = {x: pos_x, y:pos_y};
        eaten = false;
    }

    if(testCollision(snakeList[0], foodList[0])){
        foodList = [];
        eaten = true;
        eatSound.play();
        score += 1;

        let new_X, new_Y;
        if(direction == 0){
            new_X = snakeList[0].x - 10;
            new_Y = snakeList[0].y;
        } else if(direction == 1){
            new_X = snakeList[0].x;
            new_Y = snakeList[0].y - 10;
        } else if(direction == 2){
            new_X = snakeList[0].x + 10;
            new_Y = snakeList[0].y;
        } else if(direction == 3){
            new_X = snakeList[0].x;
            new_Y = snakeList[0].y + 10;
        }
        //add new snake body at the front of the list(instead of pushing to the end)
        snakeList.unshift({x:new_X, y:new_Y});
    }

    //update the score
    scoreDisplay.innerHTML = score;
    isGameOver();
    foodList.forEach(drawFood);
    //draw each body
    snakeList.forEach(drawSnake);
    checkSnakePosition();
    //after a snake is drawn, update SnakeList info; moving;
    updateSnakeList();
}

//game init
startGame = function() {
    bgMusic.loop();
    bgMusic.play();


    snakeList = [{x:220,y:200},
                 {x:210,y:200},
                 {x:200,y:200}];
    foodList = [];
    direction = 99;
    eaten = true;
    running = true;
    intervalVar = setInterval(updateSnakePosition,20); //50fps
  }

