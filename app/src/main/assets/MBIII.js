var canvas;
var canvasContext;
var gamestate = 0; //gamestate = 0 is intro, gamestate = 1 is game, gamestate = 2 is game over screen
var backgrnd;
var enemy;
var enemyXInit;
var enemyYInit;
var enemycover;
var playerCover;
var coverSymbol;
var startTimeMS;
var direction;
var score = 0;
var ammo = 10;
var inCover = false;
var gameStartTime;
var TimeRemaining;
var soundMgr;
var music = false;

//start point of the application
 function load()
 {
    //sets up the canvas
    SetUpCanvas();

    //sets up the rest of the game
    initialise();

    //If the music is not currently playing, and if sound manager exists on the current platform, this if statement will start the background music
    if (soundMgr != null && music == false)
    {
        soundMgr.playMusic(0);
        music = true;
    }

    //starts the game loop of the application
    mainGameLoop();
 }

 //This function serves as the template for sprites and images
 function SpriteBlueprint(x, y, imageSRC, velx, vely) {
    this.zindex = 0;
    this.x = x;
    this.y = y;
    this.vx = velx;
    this.vy = vely;
    this.sImage = new Image();
    this.sImage.src = imageSRC;
 }

 //this section will draw the background using the image provided and scaling it to the size of the canvas
 SpriteBlueprint.prototype.renderBackground = function(width, height){
 canvasContext.drawImage(this.sImage, this.x, this.y, canvas.width, canvas.height);
 }

 //this section will draw the game's sprites, scaling at half-size as it fits a phone screen much better
 SpriteBlueprint.prototype.renderSprite = function(){
 canvasContext.drawImage(this.sImage, this.x, this.y, this.sImage.width/2, this.sImage.height/2);
 }

 //the initialise function serves to set up the things needed for the rest of the game to function
 function initialise() {
 if (canvas.getContext){
    window.addEventListener('reorient', reorient, false);

    canvas.addEventListener("click", GetClick , false);

    enemyXInit = canvas.width/2;
    enemyYInit = canvas.height/2;

    backgrnd = new SpriteBlueprint(0,0,"BkgdGY.png", 0, 0);
    coverSymbol = new SpriteBlueprint(canvas.width/2 + 200 , canvas.height/2 + 100, "CoverIcon.png",0,0);
    enemycover = new SpriteBlueprint(enemyXInit - 25,enemyYInit - 100,"Tree.png",0,0);
    enemy = new SpriteBlueprint(enemyXInit,enemyYInit,"angerbox.png",0,0);
    playerCover = new SpriteBlueprint(-3000, 0, "AllyCover.png",0,0);

    startTimeMS = Date.now();
    }
 }

 //initialises the canvas
 function SetUpCanvas()
 {
    canvas = document.getElementById('gameCanvas');
    canvasContext = canvas.getContext('2d');
    reorient();
 }

 //sets the game's orientation
 function reorient()
 {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
 }

 //this is the render function that draws the introduction screen, it is displayed during the appropriate gamestate
 function renderIntro() {
    backgrnd.renderBackground(canvas.width, canvas.height);
    canvasContext.font = "30px Times New Roman";
    canvasContext.fillText("Musket Boxes III",canvas.width/2 - 200, canvas.height/2 - 100);
    canvasContext.fillText("Tap anywhere to play!",canvas.width/2 - 250, canvas.height/2 - 50);

    canvasContext.font = "20px Times New Roman";
    canvasContext.fillText("Tap on the opponents to eliminate them", canvas.width/2 - 200, canvas.height/2 + 100);
    canvasContext.fillText("Enemies will respawn when they die, and will weave in and out from cover", canvas.width/2 - 325, canvas.height/2 + 125);
    canvasContext.fillText("To reload, take cover!",canvas.width/2 - 125, canvas.height/2 + 150);
    canvasContext.fillText("Score will be calculated based on number of enemies eliminated", canvas.width/2 - 350, canvas.height/2 + 175);
 }

 //this is the render function that draws the main game, and is activated when the player is actively playing the game
 function renderGame(delta){
    backgrnd.renderBackground(canvas.width, canvas.height);
    coverSymbol.renderSprite();
    enemy.renderSprite();
    enemycover.renderSprite();
    playerCover.renderSprite();

    canvasContext.font  = "20px Times New Roman";
    canvasContext.fillText(ammo + " BULLETS REMAINING", canvas.width/2 - 200, canvas.height/2 + 100);
    canvasContext.fillText(TimeRemaining, canvas.width/2, canvas.height/2 - 100)
 }

 //this is the render function that draws the game over screen, which is activated after the game ends
 function renderGameOver(){
    backgrnd.renderBackground(canvas.width, canvas.height);

    canvasContext.font = "50px Times New Roman";
    canvasContext.fillText("GAME OVER", canvas.width/2 - 250, canvas.height/2);

    canvasContext.font = "30px Timex New Roman";
    canvasContext.fillText("Your score: " + score, canvas.width/2 - 100, canvas.height/2 + 100)
 }

 //this is the main gameplay loop, and handles the core gameplay mechanics and rendering
 function mainGameLoop(){

 //this switch statement allows the game to draw the sprites and text appropriate for the current gamestate
 //setting it up this way allows multiple screens without having to use multiple activities, which is more efficient for smaller programs
    switch (gamestate){
        case 0:
            renderIntro();
            break;
        case 1:
            var elapsed = (Date.now() - startTimeMS)/1000;
            MoveBox(enemy, enemyXInit);
            renderGame(elapsed);

            //this statement moves a sprite infront of the player, giving the impression of taking cover
            if (inCover && playerCover.x < 0){
                playerCover.x += 100;
            } else if ((inCover == false) && playerCover.x > -3000){
                playerCover.x -= 100;
            }

            TimeRemaining = 15 - (Math.floor((Date.now() - gameStartTime)/1000));

            //this statement procs the game over screen when time runs out
            if (TimeRemaining <= 0){
                gamestate = 2;
            }

            startTimeMS = Date.now();
            break;
        case 2:
            renderGameOver();
            break;
    }

    requestAnimationFrame(mainGameLoop);
 }

 //this function handles the player input for the application, which is done through clicking/tapping
 function GetClick(evt)
 {
    evt.preventDefault();
    //this stores the x and y axis of where on the screen the user has clicked
    var clickX = evt.pageX - canvas.offsetLeft;
    var clickY = evt.pageY - canvas.offsetTop;

    //another switch statement is needed for gamestates here as clicks are used to play the game during the main gamestate, however they are also used to move from one gamestate to the next
    switch (gamestate){
        case 0:
            gameStartTime = Date.now();
            gamestate = 1;
            break;
        case 1:
            console.log("Clicked on " + clickX + " " + clickY);
            console.log("Enemy at " + enemy.x + "-" + (enemy.x + enemy.sImage.width) + " " + enemy.y + "-" + (enemy.y + enemy.sImage.height));

            //this first section takes the player out of cover when they click, if they are already in cover
            if (inCover){
                inCover = false;
                //when you leave cover, the enemy's position is randomized so the player can't abuse cover to stay invulnerable while being able to set up to eliminate enemies
                enemyXInit = Math.floor(Math.random() * canvas.width + 1);
                enemyYInit = Math.floor(Math.random() * canvas.height - 100);
                enemy = new SpriteBlueprint(enemyXInit,enemyYInit,"angerbox.png",0,0);
                enemycover = new SpriteBlueprint(enemyXInit - 25, enemyYInit - 100, "Tree.png",0,0);
            //this if statement checks if the player intended to shoot with their click, or to enter cover
            } else if (CheckForCollision(clickX, clickY, coverSymbol) == false){
                if (ammo > 0){
                    if (soundMgr != null) soundMgr.playSound(1);
                    if ((CheckForCollision(clickX, clickY, enemy) == true) && (CheckForCollision(clickX, clickY, enemycover) == false)){
                        console.log("hit");
                        if (soundMgr != null) soundMgr.playSound(0);
                        score++;
                        enemyXInit = Math.floor(Math.random() * canvas.width + 1);
                        enemyYInit = Math.floor(Math.random() * canvas.height - 1);
                        enemy = new SpriteBlueprint(enemyXInit,enemyYInit,"angerbox.png",0,0);
                        enemycover = new SpriteBlueprint(enemyXInit - 25, enemyYInit - 100, "Tree.png",0,0);
                        } else {
                        console.log("miss");
                    }
                    ammo--;
                } else {
                    console.log("Reload");
                    ammo = 0;
                }
            } else {
            //reloads when the player enters cover
            ammo = 10;
            inCover = true;
            }
            break;
        //when the player clicks on the game over screen it will bring them back to the game, this section resets all the values to what they originally were
        case 2:
            ammo = 10;
            score = 0;
            enemyXInit = canvas.width/2;
            enemyYInit = canvas.height/2;
            initialise();
            gameStartTime = Date.now()
            gamestate = 1;
            break;
    }
 }

 //this function is used in collision/hit detection to check if an object has been clicked on
 function CheckForCollision(XofClick, YofClick, ThingToBeChecked){
     if (((ThingToBeChecked.x <= XofClick) && (XofClick <= (ThingToBeChecked.x + ThingToBeChecked.sImage.width))) && ((ThingToBeChecked.y <= YofClick) && (YofClick <= (ThingToBeChecked.y + ThingToBeChecked.sImage.height)))){
     return true;
     } else {
     return false;
     }
 }

 //this function is used to make the enemies come in and out of cover
 function MoveBox(enemyType, enemyXInit){
    if (enemyType.x > enemyXInit){ direction = true; }
    if (enemyType.x < (enemyXInit -  190)) { direction = false; }

    if (direction) { enemyType.x -= 2; } else { enemyType.x += 2; }
 }