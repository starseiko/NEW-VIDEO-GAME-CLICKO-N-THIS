//Global Variables
//==================

var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;

var isLeft;
var isRight;
var isFalling;
var isPlummeting;

var trees;
var collectables;
var clouds;
var mountains;
var canyons;

var game_score;
var flagPole;
var lives;
var text_blink;
var MusicRate;

var platforms;
var enemies;
var ArrowX;

//===================
//    GAME SOUNDS
//===================

var JumpSound;
var CoinPickSound;
var FallingSound;
var GameOverSound;
var StageClearSound;
var GameBGM;
var GuillotineSound;




function preload ()         // PRELOAD SOUNDS
{
    soundFormats ('mp3' , 'wav'); // Set Sound Formats to mp3/ wav

    JumpSound = loadSound('assets/JumpSound.wav'); // load Jumping Sound
    JumpSound.setVolume(0.7);

    CoinPickSound = loadSound('assets/CoinPickUp.mp3');// load Collectable Pick up SOund
    CoinPickSound.setVolume(0.3);

    FallingSound = loadSound('assets/Falling.wav');    // load Falling Sound
    FallingSound.setVolume(0.3);

    GameOverSound = loadSound('assets/GameOver.wav');  // Load Game Over Sound
    GameOverSound.setVolume(0.7);

    StageClearSound = loadSound('assets/FlagPoleReached.wav')   // Load Stage Clear Sound
    StageClearSound.setVolume(0.5);

    GameBGM = loadSound('assets/GameBGM1.wav'); // Game Background Music
    GameBGM.setVolume(0.2);

    GuillotineSound = loadSound('assets/Blade.mp3'); // Load Blade Sound when cuts Player
    GuillotineSound.setVolume(0.4);
}

// FUNCTION Setup
//=====================

function setup()
{
    GameBGM.loop();
    MusicRate = 1;
  createCanvas(1024, 576);
    ArrowX = -1500;      // Set Arrow X coordinate
    game_score = 0;    // Starting GAME SCORE
    lives = 3 ;  // Starting Live Counts
    startGame();
}

// FUNCTION Draw
//=====================
function draw()
{
  background(100, 155, 255); // fill the sky blue
  noStroke();
    // draw some green Grass Patch
    fill(0, 150, 0);
    rect(0, floorPos_y, width, height/4);
   // draw some brown Soil underground
   fill(139, 103, 66);
   rect(0, floorPos_y + 15, width, height/4 - 15);

    push();
    translate(scrollPos,0);     // Implements the background scenery scroll

  // Nesting Array Draw clouds FOR loop Function
//=============================================
  for (var i = 0; i < clouds.length; i++)
  {
    drawClouds(clouds[i]);
    // Movement for the clouds and the End point for the clouds to travel
    if (clouds[i].pos_x < (200+width*2)) {
      clouds[i].pos_x += 0.3;
    // when the Clouds go off the screen, it RESETS to the starting pos
    } else {
      clouds[i].pos_x = -width - 500;
    }
  }

  // At the far left of the world, Draw end of world Cliff
  fill(100, 155, 255);
  rect(-1550, floorPos_y, 180, height/4);
  fill(101, 67, 33); // brown
  rect(-1370, floorPos_y, 25, height/4, 3);
  fill(0, 120, 0); // shadow
  rect(-1370, floorPos_y, 31 , 15, 3);

  // Draw mountains.
    drawMountains();
  // Draw trees.
    drawTrees();
    // Draw Arrow
    drawArrow();

  // Nesting Array Draw Platforms FOR loop Function
//=============================================
    for( var i=0; i<platforms.length; i++)
        {
            platforms[i].draw();
        }

    // Nesting Array Draw Canyons FOR loop Function
//=============================================
    for (var i=0; i< canyons.length; i++)
        {
            drawCanyon(canyons[i]);  // Draw Canyon
            checkCanyon(canyons[i]); // ADDS Plummeting

        }

    // Nesting Array Collectables FOR loop Function
//=============================================
    for(var i=0; i<collectables.length; i++)
        {
           if(collectables[i].isFound == false)
            {
             drawCollectable(collectables[i]);
             checkCollectable(collectables[i]);
            }
        }

    // Draw Enemies/ Traps
    for ( var i=0; i< enemies.length; i++)
        {
            enemies[i].draw();
            enemies[i].update_Pos(gameChar_world_x,gameChar_y);

            var isContact =
            enemies[i].checkContact(gameChar_world_x,gameChar_y);

            if(isContact){
                    if(lives > 0){
                            lives -= 1;
                            startGame();
                            if(lives<1){
                                    gameChar_y = -100;
                                    gameChar_y -= 3;
                                    isFalling = false;
                                    FallingSound.stop();                  //Stop All Sounds
                                   GameBGM.stop();
                                   GameOverSound.play();}                // Play Only Game over Sound

                           }
                      }
            }
    renderFlagPole(); // DRAW FLAGPOLE

  // Draw game character.
  pop();   // Prevents the scenery to move along side the character
  drawGameChar();
    fill(0);
    noStroke();
    textSize(20);
    textAlign(LEFT);
    text("Total Coins: "+ game_score,20,20);    // WRITES GAME SCORE
    // Text to start game
    fill(255,0,0);
    textSize(25);
    textAlign(CENTER);
    text("Press SpaceBar to Jump/Start",width/2,40);

  // Logic to make the game character move or the background scroll + Stop moving when reach end of world
  if(isLeft && gameChar_world_x > -1300)
  {
    if(gameChar_x > width * 0.2)
    {
      gameChar_x -= 5;
    }
    else
    {
      scrollPos += 5;
    }
  }

  if(isRight)
  {
    if(gameChar_x < width * 0.8)
    {
      gameChar_x  += 5;
    }
    else
    {
      scrollPos -= 5; // negative for moving against the background
    }
  }

  // Logic to make the game character rise and fall.
    // add GRAVITY
    if(gameChar_y < floorPos_y)
        {
            var isContact = false;

            for( var i=0; i<platforms.length; i++)
            {
                if(platforms[i].checkContact(gameChar_world_x,gameChar_y)== true)
                    {
                        isContact = true;
                        isFalling = false;
                        break;
                    }
            }
            if(isContact == false)
                {
                    gameChar_y += 3;
                    isFalling = true;
                }

        }
    if((gameChar_y < floorPos_y) && (lives <= 0))
        {
            gameChar_y -= 3;
            isFalling = false;
        }
    else if (gameChar_y == floorPos_y)
        {
            if(isPlummeting == false)
            { isFalling = false;  }

        }
    if(flagPole.isReached == false)
    {
     checkFlagPole(); // Checks gameCharacter and Flagpole
    }


  // Update real position of gameChar for collision detection.
  gameChar_world_x = gameChar_x - scrollPos;

    checkPlayerDie();   // Check Player Lives
    drawLifeTockens();  // Draw Life Tokens

    //ADD Game Over and Level Conplete Text
    if(lives<1)
    {

        fill(255,0,0);
        textSize(30);
        textAlign(CENTER);
        strokeWeight(4);
        stroke(255);
        text("Game Over! Press SpaceBar to ReStart Game",width/2, height/2);

    }
    else if(flagPole.isReached == true)
    {

        push();
        fill(255,255,0);
        textSize(30);
        textStyle(BOLD);
        textAlign(CENTER);
        strokeWeight(3);
        stroke('rgba(0%,0%,0%,0.5)');
        if(text_blink)                          // Text Blink Effect Push
        {
            text("Level Complete! Press SpaceBar to continue",width/2,height/2);
        };
        if(frameCount/30 == parseInt(frameCount/30))
        {
            text_blink =! text_blink;
        }
        pop();
        return;

    }
}

function startGame ()         // Game Start Function
{
    floorPos_y = height * 3/4;
  gameChar_x = width/2;
  gameChar_y = floorPos_y;

  // Variable to control the background scrolling.
  scrollPos = 0;

  // Variable to store the real position of the gameChar in the game
  // world. Needed for collision detection.
  gameChar_world_x = gameChar_x - scrollPos;

  // Boolean variables to control the movement of the game character.
  isLeft = false;
  isRight = false;
  isFalling = false;
  isPlummeting = false;

    // Initialise arrays of scenery objects.
    trees = [ {pos_x:-1200, pos_y: floorPos_y},
              {pos_x:-100, pos_y: floorPos_y},
              {pos_x: 10, pos_y: floorPos_y},             // TREE ARRAY
              {pos_x:700, pos_y: floorPos_y},
              {pos_x:1000, pos_y: floorPos_y},
              {pos_x:1300, pos_y: floorPos_y},
              {pos_x:1500, pos_y: floorPos_y},
              {pos_x:1950, pos_y: floorPos_y},
              {pos_x:2050, pos_y: floorPos_y}
            ];

    collectables =[ {pos_x:-width - 200,pos_y: floorPos_y -30, size: 40, isFound:false},
                    {pos_x:-width+10,pos_y: floorPos_y-130, size: 40, isFound:false},
                    {pos_x:-width+330,pos_y: floorPos_y-30, size: 40, isFound:false},
                    {pos_x:-width+400,pos_y: floorPos_y-140, size: 40, isFound:false},
                    {pos_x:width/2+280,pos_y: floorPos_y-130, size: 40, isFound:false},
                    {pos_x:width/2-750,pos_y: floorPos_y-30, size: 40, isFound:false},
                    {pos_x:width/2-220,pos_y: floorPos_y-35, size: 40, isFound:false},      // COLLECTABLE ARRAY
                    {pos_x:width+820,pos_y: floorPos_y-300, size: 40, isFound:false}
                  ];

     clouds = [{pos_x : -100, pos_y : 80, size:random(70,120)},
              {pos_x : -600, pos_y : 100, size:random(70,120)},
               {pos_x : 100, pos_y : 100, size: random(70,120)},
               {pos_x : 300, pos_y : 100, size: random(70,120)},      // CLOUDS ARRAY
              {pos_x : 700, pos_y : 50, size: random(70,120)},
               {pos_x : 1000, pos_y : 70, size: random(70,120)},
              {pos_x : 1200, pos_y : 100, size: random(70,120)},
              {pos_x : 1800, pos_y : 70, size: random(70,120)},
              {pos_x : 1500, pos_y : 80, size: random(70,120)}

              ];

    mountains =[{pos_x:-850,pos_y:floorPos_y - 182},
                {pos_x:-250,pos_y:floorPos_y - 182},        // MOUNTAINS ARRAY
                {pos_x:600,pos_y:floorPos_y - 182},
                {pos_x:1800,pos_y:floorPos_y - 182}
               ];

    canyons = [{pos_x: -710, width:100},
               {pos_x: 100, width:100},
               {pos_x: 800, width:100},       // CANYONS ARRAY
               {pos_x: 1300, width:100}
              ];


    flagPole = {isReached: false,x_pos: 2000}; // FLAGPOLE

    platforms = [];                               // PLATFORMS ARRAY

    // *EXTENSION 3 CREATE PLATFORM array
    //Check the function CreatePlatforms for detailed expl.
    //====================================
    platforms.push(CreatePlatforms(width/2 - 360,floorPos_y-100,100));
    platforms.push(CreatePlatforms(width/2 - 820,floorPos_y-120,100));
    platforms.push(CreatePlatforms(-width+ 450,floorPos_y-50,random(50,100)));
    platforms.push(CreatePlatforms(-width-30,floorPos_y-100,random(60,100)));
    platforms.push(CreatePlatforms(width/2 + 360,floorPos_y-180,random(50,100)));
    platforms.push(CreatePlatforms(width/2 + 260,floorPos_y-100,random(50,100)));
    platforms.push(CreatePlatforms(width+580,floorPos_y-100,80));
    platforms.push(CreatePlatforms(width+680,floorPos_y-180,80));
    platforms.push(CreatePlatforms(width+780,floorPos_y-260,80));

    //* EXTENSION 4 CREATE ENEMIES array
    // Check function Traps*(Enemies) for detailed expl. on how i used constructor techniques
    //========================================================================
    enemies = [ new Traps(createVector(width/2 +600 ,floorPos_y+30),  2 * PI),
                new Traps(createVector(width +720 ,floorPos_y-167),  2 * PI),
                new Traps(createVector(width/2 -770 ,floorPos_y-108),  2 * PI),
                 new Traps(createVector(-width+160 ,floorPos_y+30),  2 * PI),
                new Traps(createVector(-width-200 ,floorPos_y+30),  2 * PI)];          // ENEMIES ARRAY
}

// ---------------------
// Key control functions
// ---------------------

function keyPressed(){
//open up the console to see how these work
console.log("keyPressed: " + key);
console.log("keyPressed: " + keyCode);

    if(keyCode == 37)
        {
            console.log("left arrow");
            isLeft = true;
        }
    if(keyCode == 39)
        {
            console.log("right arrow");
            isRight = true;
        }
    if(keyCode == 32)
        {
                for ( var i=0; i<platforms.length; i++)
          {
            if( keyCode == 32 && (platforms[i].checkContact(gameChar_world_x,gameChar_y)))
                {
                    console.log("Player on the Platform");
                    gameChar_y -= 120;
                    isFalling = false;
                    isContact = true;
                    JumpSound.play();
                    // To Allow Player to jump on Platforms if the player is under the platform is true
                    // Prevent the Player from Falling when player is on the Platform check function CreatePlatforms() for more details
                }
            }
            console.log("space-bar");
            if(lives<1 || flagPole.isReached==true)   // Restart Game When SpaceBar is Pressed
            {
            StageClearSound.stop();                     // Stop Stage Clear Sound as it restarts game
            GameOverSound.stop();                       // Stop Game over sound and restarts game
            GameBGM.playMode('restart');                // restart Game BGM so it doesnt overlap
            MusicRate = 1;
            GameBGM.rate(MusicRate);                       //restart the Game BGM back to Normal
            return setup();
            }

        }

}

function keyReleased()

{

    var isContact = false;

    console.log("keyReleased: " + key);
    console.log("keyReleased: " + keyCode);

        if(keyCode == 65)
        {
            console.log("left arrow");
            isLeft = false;
        }
    if(keyCode == 68)
        {
            console.log("right arrow");
            isRight = false;
        }
    if(keyCode == 32&&(gameChar_y==floorPos_y))
    {
        console.log("space-bar");
        gameChar_y -= 120;
        JumpSound.play();   // Play Jumping Sound
    }

}


// ------------------------------
// Game character render function
// ------------------------------

// Function to draw the game character.
function drawGameChar()
{
  //the game character
    stroke(0);
  if(isLeft && isFalling)
  {
    // add jumping-left code

    fill(200,150,150);
    ellipse(gameChar_x,gameChar_y-60,25,25);   // HEAD
    fill(255);
    ellipse(gameChar_x-3, gameChar_y-63,10);     // EYES
    fill(0);
    ellipse(gameChar_x-5, gameChar_y-65,4)      // PUPILS
    fill(255,0,0);
    rect(gameChar_x-7,gameChar_y-48,15,30);  // BODY
    fill(0);
    rect(gameChar_x-7,gameChar_y-20,10,13);  // LEGS

    fill(255,255,0);
    rect(gameChar_x-15,gameChar_y-45,8,7);
    rect(gameChar_x-15,gameChar_y-60,5,20);//ARMS


  }
  else if(isRight && isFalling)
  {
    // add jumping-right code
    fill(200,150,150);
    ellipse(gameChar_x,gameChar_y-60,25,25);   // HEAD
    fill(255);
    ellipse(gameChar_x+3, gameChar_y-63,10);     // EYES
    fill(0);
    ellipse(gameChar_x+5, gameChar_y-65,4)      // PUPILS
    fill(255,0,0);
    rect(gameChar_x-7,gameChar_y-48,15,30);  // BODY
    fill(0);
    rect(gameChar_x-2,gameChar_y-20,10,13);  // LEGS

    fill(255,255,0);
    rect(gameChar_x+5,gameChar_y-45,7,7);
    rect(gameChar_x+10,gameChar_y-58,5,20);//ARMS

  }
  else if(isLeft)
  {
    // add walking left code
    fill(200,150,150);
    ellipse(gameChar_x,gameChar_y-50,25,25);   // HEAD
    fill(255);
    ellipse(gameChar_x-3, gameChar_y-53,10);     // EYES
    fill(0);
    ellipse(gameChar_x-5, gameChar_y-53,4)      // PUPILS
    fill(255,0,0);
    rect(gameChar_x-7,gameChar_y-38,15,30);  // BODY
    fill(0);
    rect(gameChar_x-7,gameChar_y-10,10,13);  // LEGS

    stroke(255,255,0);
    strokeWeight(5);
    line(gameChar_x,gameChar_y-30,gameChar_x-13,gameChar_y-17); //RIGHT-HAND(SWING)
    strokeWeight(1);//ARMS

  }
  else if(isRight)
  {
    // add walking right code
    fill(200,150,150);
    ellipse(gameChar_x,gameChar_y-50,25,25);   // HEAD
    fill(255);
    ellipse(gameChar_x+3, gameChar_y-53,10);     // EYES
    fill(0);
    ellipse(gameChar_x+5, gameChar_y-53,4)      // PUPILS
    fill(255,0,0);
    rect(gameChar_x-7,gameChar_y-38,15,30);  // BODY
    fill(0);
    rect(gameChar_x-2,gameChar_y-10,10,13);  // LEGS

    stroke(255,255,0);
    strokeWeight(5);
    line(gameChar_x,gameChar_y-30,gameChar_x+15,gameChar_y-17); //RIGHT-HAND(SWING)
    strokeWeight(1);//ARMS


  }
  else if(isFalling || isPlummeting)
  {
    // add jumping facing forwards code
    fill(200,150,150);
    ellipse(gameChar_x,gameChar_y-60,35);   // HEAD

    fill(255);
    ellipse(gameChar_x-6, gameChar_y-62,12);
    ellipse(gameChar_x+6, gameChar_y-62,12);     // EYES
    fill(0);
    ellipse(gameChar_x-6, gameChar_y-58,5);
    ellipse(gameChar_x+6, gameChar_y-58,5);    // PUPILS

    fill(255,0,0);
    rect(gameChar_x-13,gameChar_y-45,26,30);  // BODY

    fill(0);
    rect(gameChar_x-15,gameChar_y-15,10,10);  // LEGS
    rect(gameChar_x+5,gameChar_y-15,10,10);

    fill(255,255,0);
    rect(gameChar_x-18,gameChar_y-35,7,5);
    rect(gameChar_x+13,gameChar_y-35,7,5);
    rect(gameChar_x-22,gameChar_y-55,5,20); // ARMS
    rect(gameChar_x+18,gameChar_y-55,5,20);
  }
  else
  {
    // add standing front facing code
    fill(200,150,150);
    ellipse(gameChar_x,gameChar_y-50,35);   // HEAD

    fill(255);
    ellipse(gameChar_x-6, gameChar_y-53,12);
    ellipse(gameChar_x+6, gameChar_y-53,12);     // EYES
    fill(0);
    ellipse(gameChar_x-6, gameChar_y-53,5);
    ellipse(gameChar_x+6, gameChar_y-53,5);    // PUPILS

    fill(255,0,0);
    rect(gameChar_x-13,gameChar_y-35,26,30);  // BODY

    fill(0);
    rect(gameChar_x-15,gameChar_y-5,10,10);  // LEGS
    rect(gameChar_x+5,gameChar_y-5,10,10);

    fill(255,255,0);
    rect(gameChar_x-18,gameChar_y-35,5,20); // ARMS
    rect(gameChar_x+13,gameChar_y-35,5,20);

  }
}

// ---------------------------
// *EXTENSION 1 ADD ADVANCED GRAPHICS
//=======================================
// In previous submission the background is too generic and lacks creativity, therefore this time i changed the scenery codes based on what i think looks best.
// * Added shadow EFFECT on objects to create a 3D environment
// * Trees are redone to create a cartoon-ish feel to the game
//* Mountains are redone to add SNOWCAP for realism, background SHADOW for 3D effect
//* Added a background mountain to get a cartoon-ish effect
//* Canyons added shadows, brown soil and  grass patch for realism
//* Spikes are added on the bottom of the canyon as Pungee Pit trap for realism
// Background render functions
// ---------------------------

// Function to draw cloud objects.
function drawClouds()
{
    for (var i = 0; i< clouds.length; i++)
    {
      fill(180); // Cloud Shadows
      ellipse(clouds[i].pos_x - 5, clouds[i].pos_y + 8, clouds[i].size, clouds[i].size - 15)
      ellipse(clouds[i].pos_x - 45, clouds[i].pos_y + 18, clouds[i].size - 20, clouds[i].size - 40);
      ellipse(clouds[i].pos_x + 35, clouds[i].pos_y + 18, clouds[i].size - 20, clouds[i].size - 35);
      fill(255);// White Cloud
      ellipse(clouds[i].pos_x, clouds[i].pos_y, clouds[i].size, clouds[i].size - 15);
      ellipse(clouds[i].pos_x - 40, clouds[i].pos_y + 10, clouds[i].size- 20, clouds[i].size - 40);
      ellipse(clouds[i].pos_x + 40, clouds[i].pos_y + 10, clouds[i].size - 20, clouds[i].size - 35);
    }
}

// Function Draw Arrow at the left side of the world
//==========================
function drawArrow()
{
      fill(255,0,0);
      rect(ArrowX, floorPos_y - 100, 80, 30);
      triangle(ArrowX+ 70, floorPos_y - 125,
               ArrowX + 110, floorPos_y - 85,
               ArrowX + 70, floorPos_y - 45);
}


// Function to draw trees objects.
//=================================
function drawTrees()
{
    for(var i=0; i< trees.length; i++)
    {
    // TREE TRUNK
    fill(139, 69, 19); // redwood brown
    rect( trees[i].pos_x + 11, trees[i].pos_y -60, 46, 30, 10);
    rect( trees[i].pos_x + 30, trees[i].pos_y-50, 5, 53);
    fill(100, 155, 255);
    rect( trees[i].pos_x + 17, trees[i].pos_y-60 ,  36, 25, 10);
    // Top branch
    fill(50, 120, 113);
    rect(trees[i].pos_x + 12, trees[i].pos_y-120, 15, 15, 10); // vertical shadow
    fill(46, 139, 87);
    rect(trees[i].pos_x + 20, trees[i].pos_y -120, 30, 15, 10); // crown Branch
    // Main branch
    fill(50, 120, 113);
    rect( trees[i].pos_x-8, trees[i].pos_y-110, 30, 62, 10); // vertical shadow
    rect( trees[i].pos_x-8, trees[i].pos_y -58, 80, 12, 10); // horizontal shadow
    fill(46, 139, 87);
    rect( trees[i].pos_x , trees[i].pos_y-110, 80, 60, 10); // Outer Branch
    // Inside branch
    fill(50, 120, 113);
    rect( trees[i].pos_x + 25, trees[i].pos_y - 91, 10, 23, 5); // vertical shadow
    rect( trees[i].pos_x + 28, trees[i].pos_y - 73, 30, 7, 5); // horizontal shadow
    fill(60, 179, 113);
    rect( trees[i].pos_x + 30, trees[i].pos_y -90, 30, 20, 5); // inner Branch

    }
}


// Function to draw MOUNTAINS objects.
//======================================
function drawMountains( pos_x, pos_y)
{
      for( var i = 0; i<mountains.length; i++)
          {
              // BACKGROUND  mountain
              //===========================
              fill(100);
              triangle(mountains[i].pos_x, mountains[i].pos_y-30, mountains[i].pos_x - 220,
                       mountains[i].pos_y + 182, mountains[i].pos_x + 160, mountains[i].pos_y + 182);
              // background mountain SNOWCAP
              fill(255);
              beginShape();
              vertex(mountains[i].pos_x, mountains[i].pos_y-30);
              vertex(mountains[i].pos_x - 65, mountains[i].pos_y + 35);
              vertex(mountains[i].pos_x - 35, mountains[i].pos_y + 50);
              vertex(mountains[i].pos_x - 15, mountains[i].pos_y + 40);
              vertex(mountains[i].pos_x, mountains[i].pos_y + 50);
              vertex(mountains[i].pos_x + 15, mountains[i].pos_y + 50);
              vertex(mountains[i].pos_x + 20, mountains[i].pos_y + 40);
              vertex(mountains[i].pos_x + 44, mountains[i].pos_y + 30);
              endShape();
              // background mountain SHADOW for 3D effect
              fill(0, 0, 0, 100);
              triangle(mountains[i].pos_x, mountains[i].pos_y -30, mountains[i].pos_x - 170,
                       mountains[i].pos_y + 140, mountains[i].pos_x - 25, mountains[i].pos_y + 182);

              // First mountain
              //=======================
              fill(150);
              triangle(mountains[i].pos_x - 100, mountains[i].pos_y - 100, mountains[i].pos_x - 250,
                       mountains[i].pos_y + 182, mountains[i].pos_x + 50, mountains[i].pos_y + 182);
              // First mountains SNOWCAP
              fill(255);
              beginShape();
              vertex(mountains[i].pos_x - 100, mountains[i].pos_y - 100);
              vertex(mountains[i].pos_x - 160, mountains[i].pos_y + 10);
              vertex(mountains[i].pos_x - 110, mountains[i].pos_y);
              vertex(mountains[i].pos_x - 80, mountains[i].pos_y + 30);
              vertex(mountains[i].pos_x - 40, mountains[i].pos_y + 10);
              endShape();
              // First mountain SHADOW
              fill(0, 0, 0, 100);
              triangle(mountains[i].pos_x - 100, mountains[i].pos_y - 100, mountains[i].pos_x - 254,
                       mountains[i].pos_y + 182, mountains[i].pos_x - 140, mountains[i].pos_y + 182);
          }

}

// ---------------------------------
// Canyon render and check functions
// ---------------------------------

// Function to draw canyon objects.

function drawCanyon(t_canyon)
{
       fill(100,155,255);
       rect(t_canyon.pos_x+50,floorPos_y,t_canyon.width,200);
       fill(0, 150, 0) // Green colour for Grass Patches
       rect(t_canyon.pos_x+25,floorPos_y, 31, 15, 5);
      fill(101, 67, 33); // Brown Soil
      rect(t_canyon.pos_x+150, floorPos_y, 25, height/4, 3);
      fill(0, 120, 0); // shadow
      rect(t_canyon.pos_x+145, floorPos_y, 35 , 15, 4);
    // Spikes for booby Trap
    //=============================
      fill(165);
      triangle(t_canyon.pos_x+50,height,
               t_canyon.pos_x+65,height-50,
               t_canyon.pos_x+75,height);
      triangle(t_canyon.pos_x+80,height,
               t_canyon.pos_x+95,height-50,
               t_canyon.pos_x+105,height);
      triangle(t_canyon.pos_x+110,height,
               t_canyon.pos_x+125,height-50,
               t_canyon.pos_x+140,height);

}

// Function to check character is over a canyon.

function checkCanyon(t_canyon)
{
     if((gameChar_world_x>(t_canyon.pos_x+50))&&(gameChar_world_x<(t_canyon.pos_x+50+t_canyon.width)))
         {
          isPlummeting = true;
          }
        else
        {
            isPlummeting = false;
        }
        if (isPlummeting == true && (gameChar_y>floorPos_y-20))             // ADD Plummeting into canyon
            {
                gameChar_y += 7;
                isLeft = false;
                isRight = false;
            }
}

// ----------------------------------
// Collectable items render and check functions
// ----------------------------------

// Function to draw collectable objects.

function drawCollectable(t_collectable)
{

         fill(255,255,0);
         ellipse(t_collectable.pos_x,t_collectable.pos_y,t_collectable.size,t_collectable.size+10);
         fill(255, 255, 255);
         rect(t_collectable.pos_x-10,t_collectable.pos_y-10,20,20);
                                                                        // collectable is a MARIO COIN
}

// Function to check character has collected an item.

function checkCollectable(t_collectable)
{
        if(dist(gameChar_world_x,gameChar_y,t_collectable.pos_x,t_collectable.pos_y)< t_collectable.size)
      {
        t_collectable.isFound = true;                     // CHECKS COLLECTABLE
        game_score += 1;                                  // ADDS GAME SCORE
        CoinPickSound.play();                             // Play Collectable Sound
        MusicRate += 0.1;                                // Increase the Music Rate by 10%
        GameBGM.rate(MusicRate);                          // Increase the background music with each collectable
                                                         // Music intensify to create a sense of urgency as game effect
       }
}

 // DRAW FLAGPOLE FUNCTION
// 2 STATES of flapole: Flag raises and Flag down
function renderFlagPole ()
{
    push();
    strokeWeight(5);
    stroke(255,0,0);
    line ( flagPole.x_pos,floorPos_y,flagPole.x_pos,floorPos_y-150);
    // Flag Raises when the Char reaches finish line
    if(flagPole.isReached == true)
    {
    fill (255);
    triangle(flagPole.x_pos,floorPos_y-150,
             flagPole.x_pos+40,floorPos_y-120,
             flagPole.x_pos,floorPos_y-90);
     isRight= false;                                  // Stop Game Character Movements when reach Flag Pole
     isLeft = false;
    }
    // Flag drops when Char is not on Finish line
    else{
    fill(255);
   triangle(flagPole.x_pos,floorPos_y-70,
             flagPole.x_pos-40,floorPos_y-30,
             flagPole.x_pos,floorPos_y-20);
    }

    pop();
}

// Function Check FlagPole Status
function checkFlagPole()
{

    if (dist(gameChar_world_x,gameChar_y,flagPole.x_pos,gameChar_y) <= 10)
    {
        flagPole.isReached = true;
        GameBGM.stop();                                                 // Stop Background Music
        StageClearSound.play();                                        // Play ONLY Stage Clear Music

    }
}

function checkPlayerDie()     // CHECK PLAYER LIVES
{
    if(gameChar_y>floorPos_y+100)
      {  console.log("Player Died");              // Testing when player died
        lives-= 1;                                 // Decrement live when fall into canyon
       FallingSound.play();                               // ADD Falling Sound Effect
        isRight = false;
        isLeft = false;                                 // Stop Player from colliding into walls when plummeting


        if( lives>0)
            {
                startGame();
            }

       if(lives<=0)
        {
           gameChar_y = -100;
           FallingSound.stop();                  //Stop All Sounds
           GameBGM.stop();
           GameOverSound.play();                 // Play ONLY Game over Sound

        }
      }


}
// Function Draw Life tokens on SCREEN to help player keep track of number of lives left
function drawLifeTockens()
{
    for(var i=0; i<lives; i++)
        {
            fill(255,0,0);
            heart(40*i+10,30,30);
        }

}

// DRAW HEART SHAPE CONTAINERS
// Heart Shape to represent the amount of lives the player Character is left
function heart(x, y, size)
{
  beginShape();
  vertex(x+20, y);
  bezierVertex(x - size / 2+20, y - size / 2, x - size+20, y + size / 3, x+20, y + size);
  bezierVertex(x + size+20, y + size / 3, x + size / 2+20, y - size / 2, x+20, y);
  endShape(CLOSE);
}
//===============================
// * Extension 3 - Platforms
//===============================
// Create Platform function
/*
  Create Platform is a simple Constructor function that creates a draw funtion of the platform and a checkContact function

  - First is the draw funtion(), Create (x,y,length) and create Grass and Ground using the x,y and length variables
  - Second, use CheckContact function to checks if the playerChar Position is near the Platform.x
    and underneath the platform with Platform.y return true
  - returning a True Value allows the player to jump on the platform check>>> (KeyPressed Function() of keycode"32"-spacebar) it
    prevents the player from falling thru the platform and lets it stand,move and jump while on the platform.
*/
function CreatePlatforms(x, y, length)
{
     var p = {
            x: x,
            y: y,
            length: length,
            draw: function()
                {
                  fill(139, 103, 66); // Brown Ground
                  rect(this.x, this.y, this.length, 25, 8);
                  fill(34, 139, 34); // Green grass
                  rect(this.x, this.y, this.length + 2, 10, 8);
                  fill(101, 67, 33); // Ground Shadow
                  rect(this.x, this.y, 20, 25, 3);
                  fill(0, 120, 0); // Grass Shadow
                  rect(this.x - 3, this.y, 25, 10, 3);
                },
         checkContact: function(Charac_x, Charac_y)
         {
             if((Charac_x> this.x) && (Charac_x< this.x+this.length))
                {
                    var d = this.y - Charac_y;
                    if( (d>=0)&& (d<5))
                        {
                            return true;
                        }
                }
             return false;
          }
       }

     return p;
}

function Traps( vector, angle)
{
    this.bladeVector = createVector(0,-125); // Center Part of the Blade
    this.bladeVector2 = createVector(-25,-120); // Outer 1 part of the Blade
    this.bladeVector3 = createVector(25,-120); // Outer 2 part of the Blade

    this.Charac_x = 0;
    this.Charac_y = 0;

    this.rotateSpeed = -0.02;
    // This draws the Chains
    this.chain = function()
    {
       for (var i = 0; i < 4; i++) {
       fill(70);
       ellipse(0, -(i * 30), 20);
       fill(200);
       ellipse(5, -(i * 30) - 5, 3);}
    }
    // This Draws the The Blades
    this.Blades = function()
    {
        fill(150);
        arc(0, -100, 100, 100, PI, TWO_PI);
        fill(130);
        arc(0, -100, 80, 80, PI, TWO_PI);
        fill(0, -100, 0, 20);
        arc(0, -100, 80, 80, -PI/3, TWO_PI);
    }
    this.checkContact = function(Charac_x, Charac_y)
    {
        // Dist from blade to player height
        var d = dist(this.Charac_x,this.Charac_y-30,this.bladeVector.x,this.bladeVector.y);
        var d2 = dist(this.Charac_x,this.Charac_y-30,this.bladeVector2.x,this.bladeVector2.y);
        var d3 = dist(this.Charac_x,this.Charac_y-30,this.bladeVector3.x,this.bladeVector3.y);

        if( d<50 || d2 <40 || d3<40)
            {
                GuillotineSound.play();
                return true;
            }
        return false;
    }
    // This allows the player to be inside the Guillotine and still be fine as long as not touching the blades
    this.update_Pos = function ( Charac_x, Charac_y)
    {
        this.Charac_x = Charac_x - vector.x;
        this.Charac_y = Charac_y - vector.y;
    }
    // This function DRAWS the Guillotine design with Chains using push and pop
    this.draw = function()
    {
        push();
        fill(150);
        rectMode(CENTER);
        translate(vector.x, vector.y);
        this.bladeVector.rotate(this.rotateSpeed);
        this.bladeVector2.rotate(this.rotateSpeed);
        this.bladeVector3.rotate(this.rotateSpeed);
        noStroke();
        rect(0, 0, 25, 25, 5);
        rotate(angle);
        this.chain();
        this.Blades();
        angle += this.rotateSpeed;
        pop();
    }
}
