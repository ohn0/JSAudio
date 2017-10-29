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
        aPlayer.audioEle.onpause = aPlayer.stopVis;
        aPlayer.audioEle.onplay = aPlayer.startVis;
        aPlayer.audioEle.src = aPlayer.fileList[0];
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
    
    aPlayer.startVis = function(){
        aPlayer.requestVar = window.requestAnimationFrame(aPlayer.barVisual);
        aPlayer.isPlaying = true;
    };
    
    aPlayer.stopVis = function(){
        window.cancelAnimationFrame(aPlayer.requestVar);
        aPlayer.isPlaying = false;
    };
    
    aPlayer.barVisual = function(timestamp){
        if(aPlayer.isPlaying){ 
            aPlayer.animator.ctx.clearRect(0,0,aPlayer.cWidth,aPlayer.cHeight);
        }
        aPlayer.CTX.analyser.getByteFrequencyData(aPlayer.animator.freqData);
        aPlayer.CTX.analyser.getFloatFrequencyData(aPlayer.animator.floatFreqData);
        for(var i = 0; i < aPlayer.CTX.analyser.fftSize/2; i++){
            aPlayer.animator.ctx.fillStyle = 'rgb(0,' + 
                    ((i*aPlayer.animator.rectWidth)/aPlayer.cWidth) * 255 + ','+
                    '128)';
            aPlayer.animator.ctx.fillRect(i*aPlayer.animator.rectWidth,
                    400-aPlayer.cHeight * (aPlayer.animator.freqData[i]/255),
                    aPlayer.animator.rectWidth, aPlayer.cHeight * 
                    (aPlayer.animator.freqData[i]/255));
        }
        return null;
    };
    
    createPlayer();
    createAudioContext();
    if(params.visualize){
        createVisualizer();
        setInterval(function(){
            aPlayer.requestVar = window.requestAnimationFrame(aPlayer.barVisual);
        },25);
    }
    document.body.onresize = function(){
        aPlayer.animator.rectWidth = Math.ceil(aPlayer.cDiv.clientWidth / 
                (aPlayer.CTX.analyser.fftSize/2));
    };
    LOG('done');
    return aPlayer;
}