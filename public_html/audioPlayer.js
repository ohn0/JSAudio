"use strict";

function audioFW(params){
    var aPlayer = {};
    aPlayer.cDiv = params.context || null;
    aPlayer.cHeight = params.height;
    aPlayer.cWidth = params.width;
    aPlayer.fileList = params.fileList || {};
    if(aPlayer.cDiv === null){
        alert("No div specified, quitting.");
        return null;
    }
    
    aPlayer.addMusicFile = function(musicFile){
        aPlayer.fileList.push(musicFile);
    };
    
    return aPlayer;
}