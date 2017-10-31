"use strict";

function audioFW(params){
    var aPlayer = {};
    var aCTX = {};
    var aAnimator = {};
    aPlayer.cDiv = params.context || null;
    aPlayer.cHeight = params.height || 400;
    aPlayer.cWidth = params.width || 800;
    aPlayer.fileList = params.fileList || [];
    aPlayer.isPlaying = true;
    aPlayer.cDiv.style.borderStyle = "solid";
    aPlayer.cDiv.style.borderColor = "white";
    aPlayer.requestVar = null;
    var rippleList = [];
    var rippleCounter = 0;
    var rippleLimit = 100;

    if(aPlayer.cDiv === null){
        alert("No div specified, quitting.");
        return null;
    }
    
    aPlayer.addMusicFile = function(musicFile){
        aPlayer.fileList.push(musicFile);
        return null;
    };
    
    aPlayer.setBufferSize = function(bufferSize){
        aCTX.analyser.fftSize = bufferSize;
        return null;
    };
    
    aPlayer.pulse = function(){
        return null;
    };
    
    function createPlayer(){
        aPlayer.audioDIV = document.createElement('div');
        aPlayer.audioEle = document.createElement('audio');
        aPlayer.audioDIV.style.minWidth = "80%";
        aPlayer.audioDIV.style.margin = "auto";
        aPlayer.audioDIV.style.textAlign = "center";
        aPlayer.audioDIV.appendChild(aPlayer.audioEle);
        aPlayer.audioEle.controls = true;
        aPlayer.audioEle.volume = 0.1;
        aPlayer.audioEle.id = params.fwID;
        aPlayer.audioEle.onpause = aPlayer.stopVis;
        aPlayer.audioEle.onplay = aPlayer.startVis;
        aPlayer.audioEle.src = aPlayer.fileList[1];
        aPlayer.cDiv.appendChild(aPlayer.audioDIV);
        return null;
    }
    
    function createAudioContext(){
        aCTX.context = new AudioContext();
        aCTX.analyser = aCTX.context.createAnalyser();
        aCTX.source = aCTX.context.createMediaElementSource(aPlayer.audioEle);
        aCTX.source.connect(aCTX.analyser);
        aCTX.analyser.connect(aCTX.context.destination);
        aCTX.analyser.fftSize = 128;
        aPlayer.CTX = aCTX;
        return null;
    }
    
    function createVisualizer(){
        if(params.visualize === null || params.visualize === false){
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
    
    aPlayer.lineVisual = function(timestamp){
        aPlayer.animator.ctx.clearRect(0,0, aPlayer.cWidth, aPlayer.cHeight);
        aPlayer.CTX.analyser.getByteFrequencyData(aPlayer.animator.freqData);
        aPlayer.CTX.analyser.getFloatFrequencyData(aPlayer.animator.floatFreqData);
//        LOG(aPlayer.animator.floatFreqData[0]);
        aPlayer.animator.ctx.beginPath();
        aPlayer.animator.ctx.moveTo(0, aPlayer.cHeight/2);
        for(var i = 0; i < aPlayer.CTX.analyser.fftSize/2; i++){
            changeColor('rgb(0,'+((i*aPlayer.animator.rectWidth)/aPlayer.cWidth)
                    *255 + ',128)');
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
    
    aPlayer.circleVisual = function(timestamp){
        aPlayer.animator.ctx.clearRect(0,0, aPlayer.cWidth, aPlayer.cHeight);
        aPlayer.CTX.analyser.getByteFrequencyData(aPlayer.animator.freqData);
        aPlayer.animator.ctx.beginPath();
        aPlayer.animator.ctx.arc(aPlayer.cWidth/2, aPlayer.cHeight/2, 50, 
                                 0, 2*Math.PI);
        for(var i = 0; i < aPlayer.CTX.analyser.fftSize/2; i++){
            
        }
        aPlayer.animator.ctx.strokeStyle = "red";
        aPlayer.animator.ctx.lineWidth = 2;
        aPlayer.animator.ctx.stroke();
    };
    
    aPlayer.gridVisual = function(timestamp){
        aPlayer.CTX.analyser.getByteFrequencyData(aPlayer.animator.freqData);
        var rectWidth = aPlayer.cWidth / aPlayer.grid.length;
        var rectHeight = aPlayer.cHeight / aPlayer.grid[0].length;
//        aPlayer.animator.ctx.clearRect(0,0, aPlayer.cWidth, aPlayer.cHeight);
        for(var i = 0; i < aPlayer.CTX.analyser.fftSize/2; i++){
            var gridX = (i * (Math.floor(Math.random()*20))) % aPlayer.grid.length;
            var gridY = aPlayer.animator.freqData[i] * Math.floor(Math.random() * 20)
                        % aPlayer.grid[0].length;
            changeColor('rgb(0,'+ aPlayer.animator.freqData[i]
                     + ',128)');
            grid[gridX][gridY].color = 'rgb(0,'+ aPlayer.animator.freqData[i]+ ',128)';
            aPlayer.animator.ctx.fillRect(aPlayer.grid[gridX][gridY].x,
                                          aPlayer.grid[gridX][gridY].y,
                                          rectWidth, rectHeight);
        }
        
        for(var i = 0; i < aPlayer.grid.length; i++){
            for(var j = 0; j < aPlayer.grid[0].length; j++){
                
            }
        }
    };
    
    
    
    
    function changeColor(colorVal){
        aPlayer.animator.ctx.fillStyle = colorVal;
        return null;
    }
    
    aPlayer.startVis = function(){
        aPlayer.requestVar = window.requestAnimationFrame(aPlayer.visualFn);
        aPlayer.isPlaying = true;
    };
    
    aPlayer.stopVis = function(){
        window.cancelAnimationFrame(aPlayer.requestVar);
        aPlayer.isPlaying = false;
    };
    
    if(params.visualStyle === "bar"){
        aPlayer.visualFn = aPlayer.barVisual;
    }
    else if(params.visualStyle === "circle"){
        aPlayer.visualFn = aPlayer.circleVisual;
    }
    else if(params.visualStyle === "line"){
        aPlayer.visualFn = aPlayer.lineVisual;
    }
    else if(params.visualStyle === "grid"){
        aPlayer.visualFn = aPlayer.gridVisual;
        aPlayer.grid = makeGrid({x:aPlayer.cWidth, y:aPlayer.cHeight});
    }
    
    createPlayer();
    createAudioContext();
    if(params.visualize){
        createVisualizer();
        setInterval(function(){
            aPlayer.requestVar = window.requestAnimationFrame(aPlayer.visualFn);
        },25);
    }
    
    document.body.onresize = function(){
        aPlayer.animator.rectWidth = Math.ceil(aPlayer.cDiv.clientWidth / 
                (aPlayer.CTX.analyser.fftSize/2));
        aPlayer.animator.canvasEle.width = aPlayer.cDiv.clientWidth;
        aPlayer.cWidth = aPlayer.cDiv.clientWidth;
    };
    LOG('Done');
    return aPlayer;
}

function ripples(params){
    var rippleList = {};
    rippleList.x = params.x;
    rippleList.y = params.y;
    rippleList.growthRate = params.growthRate;
    rippleList.radius = 2;
    rippleList.grow = function(){
        if(rippleList.radius < 100){
            rippleList.radius += rippleList.growthRate;
        }
    };
    return rippleList;
}

function makeGrid(params){
    var grid = [];
    for(var i = 0; i < params.x; i+=10){
        grid.push([]);
        for(var j = 0; j < params.y; j+=10){
            grid[grid.length - 1].push({x:i,y:j});
        }
    }
    return grid;
}