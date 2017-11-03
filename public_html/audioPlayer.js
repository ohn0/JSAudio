"use strict";

function LOG(val){console.log(val);}
//This framework generates an audio player and a visualizer if the user desires.
//The audio is created via the audio element and the sampling data is extracted
//using the audio API javascript provides. 
//There are 3 visualizations provided to the user, a line, bar, and circle visual.
//More details on those in their relevant functions.
//The visualization is done using the canvas element. The user does not need to 
//pass any canvas or audio elements into the framework, I only need a single div
//into which everything will be created.
//

function audioFW(params){
    
    //Create three objects, the aPlayer will be a VERY rich structure composed
    //of the audio context and animator objects. The aPlayer will also hold
    //all the elements being created and their various properties. The user will 
    //be given the aPlayer at the end, giving them access to all the elements within
    //the player. 
    //
    //The aCTX will hold all the audio context information, this is what we will
    //use to set up an analyser node and destination node to grab the sampled data
    //from the file and use it for our visualizations. Once the aCTX is created, a 
    //handle to it is given to the aPlayer.
    //
    //the aAnimator will hold all the drawing information. The canvas will be created
    //within the aAnimator, after which a handle will be given to aPlayer to use.
    //
    //
    var aPlayer = {};
    var aCTX = {};
    var aAnimator = {};
    
    //Check if a some vital parameters have values, if they don't, we set some
    //default values.
    //
    aPlayer.cDiv = params.context || null;
    aPlayer.cHeight = params.height || 400;
    aPlayer.cWidth = params.width || 800;
    aPlayer.fileList = params.fileList || [];
    aPlayer.isPlaying = true;
    aPlayer.cDiv.style.borderStyle = "solid";
    aPlayer.cDiv.style.borderColor = "black";
//    aPlayer.colorFn = params.colorFn || 
    aPlayer.mainID = params.contextID;
    aPlayer.requestVar = null;

    //We atleast need a div to start working.
    if(aPlayer.cDiv === null){
        alert("No div specified, quitting.");
        return null;
    }
    
    //adds the string musicFile to the list of files to be played.
    aPlayer.addFile = function(musicFile){
        aPlayer.fileList.push(musicFile);
        updateSongList();
        return null;
    };
    
    //Set the quality of the visuals, the higher the value of bufferSize, the
    //more objects being drawn. This also means more computation time.
    //bufferSize MUST BE A POWER OF TWO.
    aPlayer.setQuality = function(bufferSize){
        //bufferSize MUST be a power of two.
        aCTX.analyser.fftSize = bufferSize;
        return null;
    };
    
    //Creates almost all the elements the player will require. A div element
    //is created and we add the audio element to it, along with a song list that
    //will display all the songs that the user has added. A next and previous button
    //is also added, somehow the audio player doesn't come included with those...
    //The functions of the buttons are then set with setButtonFn along with onpause
    //and onplay events, which also clear the visual or pause them.
    //The first song the user added is set as the currently playing song, the user
    //just needs to hit play to start playing it.
    //Once all the elements are created, we add them all into aPlayer.
    //
    function createPlayer(){
        aPlayer.audioDIV = document.createElement('div');
        aPlayer.audioDIV.nextButton = document.createElement('button');
        aPlayer.audioDIV.prevButton = document.createElement('button');
        aPlayer.audioDIV.list = document.createElement('div');
        aPlayer.audioDIV.style.margin = "auto";
        aPlayer.audioDIV.list.style.color = "black"; 
        aPlayer.audioDIV.style.textAlign = "auto";
        aPlayer.audioDIV.nextButton.type = "button";
        aPlayer.audioDIV.nextButton.value = "next";
        aPlayer.audioDIV.nextButton.innerHTML = "next";
        aPlayer.audioDIV.prevButton.type = "button";
        aPlayer.audioDIV.prevButton.value = "previous";
        aPlayer.audioDIV.prevButton.innerHTML = "previous";
        aPlayer.audioEle = document.createElement('audio');
        aPlayer.audioDIV.style.margin = "auto";
        aPlayer.audioDIV.style.textAlign = "center";
        aPlayer.audioDIV.appendChild(aPlayer.audioDIV.prevButton);
        aPlayer.audioDIV.appendChild(aPlayer.audioEle);
        aPlayer.audioDIV.appendChild(aPlayer.audioDIV.nextButton);
        aPlayer.audioDIV.appendChild(aPlayer.audioDIV.list);
        setButtonFn();
        aPlayer.audioEle.controls = true;
        aPlayer.audioEle.id = params.fwID;
        aPlayer.audioEle.onpause = aPlayer.stopVis;
        aPlayer.audioEle.onplay = aPlayer.startVis;
        aPlayer.currentlyPlaying = 0;
        aPlayer.audioEle.src = aPlayer.fileList[aPlayer.currentlyPlaying];
        aPlayer.hideList = false;
        updateSongList();
        aPlayer.audioDIV.list.innerHTML = aPlayer.fileString;
        aPlayer.cDiv.appendChild(aPlayer.audioDIV);
        return null;
    }
    
    //Whenever a song is added, this function is called to recreate the song
    //list string and write it to the respective div on the screen.
    function updateSongList(){
        if(aPlayer.hideList){return null;}
        aPlayer.fileString = "";
        for(var i = 0; i < aPlayer.fileList.length; i++){
            if(i === aPlayer.currentlyPlaying){
                aPlayer.fileString += "(currently playing)";
            }
            aPlayer.fileString += (aPlayer.fileList[i])+"<br/>";
        }
        aPlayer.audioDIV.list.innerHTML = aPlayer.fileString;
        LOG(aPlayer.fileString);
    }
    
    //Sets the functions of the next and previous buttons. Both are basically the same
    //If next is hit and the song is at the end, it just loops to the beginning, same
    //thing in reverse for the previous button.
    function setButtonFn(){
        aPlayer.audioDIV.nextButton.onclick = function(){    
            aPlayer.currentlyPlaying++;
            if(aPlayer.currentlyPlaying === aPlayer.fileList.length){
                aPlayer.currentlyPlaying = 0;
            }
            updateSongList();
            aPlayer.audioEle.src = aPlayer.fileList[(aPlayer.currentlyPlaying)];

            if(!aPlayer.hideList){
                aPlayer.audioDIV.list.innerHTML = aPlayer.fileString;                
            }
        };
        aPlayer.audioDIV.prevButton.onclick = function(){
            aPlayer.currentlyPlaying--;
            if(aPlayer.currentlyPlaying === -1){
                aPlayer.currentlyPlaying = aPlayer.fileList.length-1;
            }
            updateSongList();
            aPlayer.audioEle.src = aPlayer.fileList[(aPlayer.currentlyPlaying)];
            if(!aPlayer.hideList){
                aPlayer.audioDIV.list.innerHTML = aPlayer.fileString;                
            }
        };
    }
    
    
    //Hide the song list if it is getting too big.
    aPlayer.closeList = function(){
        aPlayer.audioDIV.list.innerHTML = "";
        aPlayer.hideList = true;
    };
    
    //Show the song list for some reason.
    aPlayer.showList = function(){
        aPlayer.hideList = false;
    };
    
    //Creates an audio context in aCTX and links it to aPlayer.
    //fftSize is the size of the buffer that the analyser will use to store
    //sampling data from the audio file.
    //Add the context to aPlayer at the end.
    function createAudioContext(){
        aCTX.context = new AudioContext();
        aCTX.analyser = aCTX.context.createAnalyser();
        aCTX.source = aCTX.context.createMediaElementSource(aPlayer.audioEle);
        aCTX.source.connect(aCTX.analyser);
        aCTX.analyser.connect(aCTX.context.destination);
        aCTX.analyser.fftSize = 512;
        aPlayer.CTX = aCTX;
        return null;
    }
    
    //Creates the canvas context that will hold the visuals.
    //First check to see if the user wants to see visuals.
    //We also create the arrays that will hold the sampling data for the visualizer
    //rectWidth is the size of a single rectangle the bar visual will use so
    //it can draw equal sized rectangles.
    //Once everything is done, add it all to aPlayer.
    function createVisualizer(){
        if(params.visualize === null || params.visualialze === false){
            return null;
        }
        aAnimator.canvasEle = document.createElement('canvas');
        aAnimator.ctx = aAnimator.canvasEle.getContext('2d');
        aAnimator.canvasEle.height = aPlayer.cHeight;
        aAnimator.canvasEle.width = aPlayer.cWidth;
        aAnimator.freqData = new Uint8Array(aCTX.analyser.frequencyBinCount);
        aAnimator.floatFreqData = new Float32Array(aCTX.analyser.frequencyBinCount);
        aAnimator.rectWidth = Math.ceil(aPlayer.cWidth/(aPlayer.CTX.analyser.fftSize/2));
        aPlayer.cDiv.appendChild(aAnimator.canvasEle);
        aPlayer.animator = aAnimator;
        return null;
    }
    
    //Set the color function for the aPlayer. This is the default if the
    //user did not specify their own. The default just changes the color
    //of the lines/bars/circle as time goes on. If the user wishes
    //to set their own color function, it must take a parameter object that
    //has a time and duration parameter, and must return a string.
    aPlayer.colorFn = params.colorFn || function(params){
        var color = "rgb("+
        ((params.time)/params.duration)* 255+
        ",128,0)";
         return color;
    };
    
    //Create the bar visual. This visual draws a bunch of rectangles that grow and
    //shrink based on the value in the array that they are associated with. 
    //We first clear the canvas, then get some new data from the audio file. 
    //We then iterate through the array and use each value to calculate the new
    //height of the rectangle, along with it's color.
    aPlayer.barVisual = function(timestamp){
        if(aPlayer.isPlaying){ 
            aPlayer.animator.ctx.clearRect(0,0,aPlayer.cWidth,aPlayer.cHeight);
        }
        aPlayer.CTX.analyser.getByteFrequencyData(aPlayer.animator.freqData);
        aPlayer.CTX.analyser.getFloatFrequencyData(aPlayer.animator.floatFreqData);
        for(var i = 0; i < aPlayer.CTX.analyser.fftSize/2; i++){
            changeColor('rgb(0,'+((i*aPlayer.animator.rectWidth)/aPlayer.cWidth)
                    *255 + ',128)');
            aPlayer.animator.ctx.fillRect(i*aPlayer.animator.rectWidth,
                    (400)-aPlayer.cHeight * (aPlayer.animator.freqData[i]/255),
                    aPlayer.animator.rectWidth, aPlayer.cHeight * 
                    (aPlayer.animator.freqData[i]/255));
        }
        return null;
    };
    
    //Create the line visual.
    //We need to use the path function of the canvas to draw the line.
    //The path function draws a line based on however the user has specified it.
    //We first call beginPath to indicate we are drawing a new path.
    //moveTo is then called which moves a marker to a point on the canvas, this
    //will be the starting point of the line.
    //We then keep calling the lineTo method, everytime lineTo is called, a line 
    //is drawn from whereever the marker currently is to the position specified by
    //lineTo. Once we are done with the path, we call stroke to create the whole line.
    //We create the visual by iterating through all values of the array and for each
    //value, calling lineTo on the value of the array, using it as a height offset 
    //from the bottom of the canvas.
    //
    aPlayer.lineVisual = function(timestamp){
        aPlayer.animator.ctx.clearRect(0,0, aPlayer.cWidth, aPlayer.cHeight);
        aPlayer.CTX.analyser.getByteFrequencyData(aPlayer.animator.freqData);
        aPlayer.CTX.analyser.getFloatFrequencyData(aPlayer.animator.floatFreqData);
        aPlayer.animator.ctx.beginPath();
        aPlayer.animator.ctx.moveTo(0, aPlayer.cHeight/2);
        for(var i = 0; i < aPlayer.CTX.analyser.fftSize/2; i++){
            aPlayer.animator.ctx.fillStyle = aPlayer.colorFn({
            time:(document.getElementById(aPlayer.audioEle.id).currentTime),
            duration:document.getElementById(aPlayer.audioEle.id).duration});
            aPlayer.animator.ctx.lineTo(i*aPlayer.animator.rectWidth,
                           (aPlayer.cHeight/2) - ((aPlayer.cHeight/2) *
                                   (aPlayer.animator.freqData[i]/255)));
        }
        aPlayer.animator.ctx.lineTo(aPlayer.cWidth, aPlayer.cHeight/2);
        aPlayer.animator.ctx.lineWidth = 2;
        aPlayer.animator.ctx.strokeStyle = "rgb(0,"+ 
               (255 * (document.getElementById(aPlayer.audioEle.id).currentTime)/
                document.getElementById(aPlayer.audioEle.id).duration) +",128)";
        aPlayer.animator.ctx.stroke();
    };
    
    //Creates the circle visual.
    //The circle visual has a circle in the center that radiates a bunch of lines.
    //The length of the lines is dependent on the values sampled from the audio file
    //at that given time.
    //All of this is accomplished using the transform method from the canvas.
    //setTransfrom allows us to specify a transformation matrix from setTransform's parameters
    //These values allow us to scale, rotate, and translate and drawings we are about to
    //make on the canvas. We only care about the rotational values. So everytime
    //we want to draw a new line that will radiate from the circle.
    //We first compute the angle of that line from 0 radians and then we get the
    //start point of the line given the radius of the circle and the sin and cos 
    //functions, sin gives us the Y value, cos gives us the X value.
    //Once we have the (x,y) pair that designates the start point of the line, we
    //call setTransform at that point and then call the rotate method, this ensures
    //that only the currently drawn line will be rotate the value we want, instead
    //of having the whole canvas rotated.
    //
    aPlayer.circleVisual = function(timestamp){
        aPlayer.animator.ctx.setTransform(1,0,0,1,0,0);
        aPlayer.animator.ctx.clearRect(0,0, aPlayer.cWidth, aPlayer.cHeight);
        aPlayer.CTX.analyser.getByteFrequencyData(aPlayer.animator.freqData);
        aPlayer.animator.ctx.beginPath();
        aPlayer.animator.ctx.arc(aPlayer.cWidth/2, aPlayer.cHeight/2, 50, 
                                 0, 2*Math.PI);
        var radianSlice = (2*Math.PI)/aPlayer.animator.freqData.length;
        aPlayer.animator.ctx.strokeStyle = aPlayer.colorFn({
            time:(document.getElementById(aPlayer.audioEle.id).currentTime),
            duration:document.getElementById(aPlayer.audioEle.id).duration});
        aPlayer.animator.ctx.lineWidth = 2;
        aPlayer.animator.ctx.stroke();
        aPlayer.animator.ctx.fillStyle = aPlayer.colorFn({
            time:(document.getElementById(aPlayer.audioEle.id).currentTime),
            duration:document.getElementById(aPlayer.audioEle.id).duration});
        var lineLength = aPlayer.cWidth/2;
        for(var i = 0; i < aPlayer.CTX.analyser.fftSize/2; i++){
            var location = radianSlice * i;
            var startX = 50 * (Math.cos(location));
            var startY = 50 * (Math.sin(location));
            aPlayer.animator.ctx.setTransform(1, 0, 0, 1, startX+(aPlayer.cWidth/2),
            (aPlayer.cHeight/2)-startY);
            aPlayer.animator.ctx.rotate((location - (Math.PI/2))/-1);
            aPlayer.animator.ctx.fillRect(0,
            0, 1, (-1*aPlayer.animator.freqData[i]/255) * lineLength);
            aPlayer.animator.ctx.rotate(0);
        }
    };
    
    //Gee I wonder what this does
    aPlayer.setVolume = function(nVolume){
        if(nVolume > 0 && nVolume < 100){
            aPlayer.audioEle.volume = nVolume;
        }
    };
    
    function changeColor(colorVal){
        aPlayer.animator.ctx.fillStyle = colorVal;
        return null;
    }
    
    //If the button was pressed, this function is also called to start up the
    //visual again.
    //requestAnimationFrame is like set interval, but doesn't update if the
    //screen is not focused.
    aPlayer.startVis = function(){
        if(aPlayer.visual){
            aPlayer.requestVar = window.requestAnimationFrame(aPlayer.visualFn);
        }
        aPlayer.isPlaying = true;
    };
    
    //Stops the canvas from drawing the visual if pause was hit. 
    //cancelAnimationFrame drops any frame that was about to be drawn.
    aPlayer.stopVis = function(){
        if(aPlayer.visual){
            window.cancelAnimationFrame(aPlayer.requestVar);
 
        }
        aPlayer.isPlaying = false;
    };
    
    //Change visual to whatever nVisual specifies.
    aPlayer.changeVisual = function(nVisual){
        if(nVisual === "bar"){
            aPlayer.visualFn = aPlayer.barVisual;
        }
        else if(nVisual === "circle"){
            aPlayer.cHeight = aPlayer.cWidth;
            aPlayer.animator.canvasEle.height = aPlayer.cHeight;
            aPlayer.visualFn = aPlayer.circleVisual;
        }
        else if(nVisual === "line"){
            aPlayer.visualFn = aPlayer.lineVisual;
        }
        else{
            alert("Invalid visual type entered, setting to 'bar'.");
            aPlayer.visualFn = aPlayer.barVisual;
        }
    };
    
    //Create the player, and the audio context, check if the user wants visuals
    //and respond accordingly.
    createPlayer();
    createAudioContext();
    
    //If we want visuals, also call setInterval to fire requestAnimationFrame
    //every 25ms. 
    //Add a resize listener to change the size of all elements if the user resizes
    //the window.
    if(params.visualize){
        aPlayer.visual = true;
        createVisualizer();
        aPlayer.changeVisual(params.visualStyle);

        setInterval(function(){
            aPlayer.requestVar = window.requestAnimationFrame(aPlayer.visualFn);
        },25);
        aPlayer.animator.canvasEle.width = aPlayer.cDiv.clientWidth;
        aPlayer.cWidth = aPlayer.cDiv.clientWidth;
        window.addEventListener("resize", function(){
            aPlayer.animator.rectWidth = Math.ceil(aPlayer.cDiv.clientWidth / 
                    (aPlayer.CTX.analyser.fftSize/2));
            aPlayer.animator.canvasEle.width = aPlayer.cDiv.clientWidth;
            aPlayer.cWidth = aPlayer.cDiv.clientWidth;
        });
    }
    
    LOG('Done');
    return aPlayer;
}


