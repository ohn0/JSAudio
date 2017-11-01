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
        updateSongList();
        return null;
    };
    
    aPlayer.setBufferSize = function(bufferSize){
        //MUST be a power of two.
        aCTX.analyser.fftSize = bufferSize;
        return null;
    };
    
    aPlayer.pulse = function(){
        return null;
    };
    
    function createPlayer(){
        aPlayer.audioDIV = document.createElement('div');
        aPlayer.audioDIV.nextButton = document.createElement('button');
        aPlayer.audioDIV.prevButton = document.createElement('button');
        aPlayer.audioDIV.list = document.createElement('div');
        aPlayer.audioDIV.style.width = "80%";
        aPlayer.audioDIV.style.margin = "auto";
        aPlayer.audioDIV.list.style.color = "white"; 
        aPlayer.audioDIV.style.textAlign = "auto";
//        aPlayer.audioDIV.style.display = "inline";
//        aPlayer.audioDIV.list.style.textAlign = "center";
//        aPlayer.audioDIV.list.style.margin = "auto";
//        aPlayer.audioDIV.list.style.width = "80%";
        aPlayer.audioDIV.nextButton.type = "button";
        aPlayer.audioDIV.nextButton.value = "next";
        aPlayer.audioDIV.nextButton.innerHTML = "next";
        aPlayer.audioDIV.prevButton.type = "button";
        aPlayer.audioDIV.prevButton.value = "previous";
        aPlayer.audioDIV.prevButton.innerHTML = "previous";
        aPlayer.audioEle = document.createElement('audio');
        aPlayer.audioDIV.style.minWidth = "80%";
        aPlayer.audioDIV.style.margin = "auto";
        aPlayer.audioDIV.style.textAlign = "center";
        aPlayer.audioDIV.appendChild(aPlayer.audioEle);
        aPlayer.audioDIV.appendChild(aPlayer.audioDIV.prevButton);
        aPlayer.audioDIV.appendChild(aPlayer.audioDIV.nextButton);
        aPlayer.audioDIV.appendChild(aPlayer.audioDIV.list);
        setButtonFn();
        aPlayer.audioEle.controls = true;
        aPlayer.audioEle.id = params.fwID;
        aPlayer.audioEle.onpause = aPlayer.stopVis;
        aPlayer.audioEle.onplay = aPlayer.startVis;
        aPlayer.currentlyPlaying = 0;
        aPlayer.audioEle.src = aPlayer.fileList[aPlayer.currentlyPlaying];
        updateSongList();
        aPlayer.audioDIV.list.innerHTML = aPlayer.fileString;
        aPlayer.cDiv.appendChild(aPlayer.audioDIV);
        return null;
    }
    
    function updateSongList(){
        aPlayer.fileString = "";
        for(var i = 0; i < aPlayer.fileList.length; i++){
            if(i === aPlayer.currentlyPlaying){
                aPlayer.fileString += "(currently playing)";
            }
            aPlayer.fileString += (aPlayer.fileList[i])+"<br/>";
        }
        LOG(aPlayer.fileString);
    }
    
    function setButtonFn(){
        aPlayer.audioDIV.nextButton.onclick = function(){    
            aPlayer.currentlyPlaying++;
            if(aPlayer.currentlyPlaying === aPlayer.fileList.length){
                aPlayer.currentlyPlaying = 0;
            }
            updateSongList();
            aPlayer.audioEle.src = aPlayer.fileList[aPlayer.currentlyPlaying];
            aPlayer.audioDIV.list.innerHTML = aPlayer.fileString;
        
        };
        aPlayer.audioDIV.prevButton.onclick = function(){
            aPlayer.currentlyPlaying--;
            if(aPlayer.currentlyPlaying === -1){
                aPlayer.currentlyPlaying = aPlayer.fileList.length-1;
            }
            updateSongList();
            aPlayer.audioEle.src = aPlayer.fileList[(aPlayer.currentlyPlaying)];
            aPlayer.audioDIV.list.innerHTML = aPlayer.fileString;

        };
    }
    
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
        aPlayer.animator.ctx.setTransform(1,0,0,1,0,0);
        aPlayer.animator.ctx.clearRect(0,0, aPlayer.cWidth, aPlayer.cHeight);
        aPlayer.CTX.analyser.getByteFrequencyData(aPlayer.animator.freqData);
        aPlayer.animator.ctx.beginPath();
        aPlayer.animator.ctx.arc(aPlayer.cWidth/2, aPlayer.cHeight/2, 50, 
                                 0, 2*Math.PI);
        var radianSlice = (2*Math.PI)/aPlayer.animator.freqData.length;
        aPlayer.animator.ctx.strokeStyle = params.colorFn({
            time:(document.getElementById(aPlayer.audioEle.id).currentTime),
            duration:document.getElementById(aPlayer.audioEle.id).duration});
        aPlayer.animator.ctx.lineWidth = 2;
        aPlayer.animator.ctx.stroke();
        aPlayer.animator.ctx.fillStyle = params.colorFn({
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
    
    aPlayer.setVolume = function(nVolume){
        aPlayer.audioEle.volume = nVolume;
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