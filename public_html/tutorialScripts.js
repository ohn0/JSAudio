var aEle = document.getElementById('step2');
var ctx = new AudioContext();
var aSrc = ctx.createMediaElementSource(aEle);
aSrc.connect(ctx.destination);

var aEle = document.getElementById('step3');
var ctx = new AudioContext();
var aSrc = ctx.createMediaElementSource(aEle);
var analyser = ctx.createAnalyser();
aSrc.connect(analyser);
analyser.connect(ctx.destination);
analyser.fftSize = 64;
var outputData = new Uint8Array(analyser.frequencyBinCount);
var outputDIV = document.getElementById('audioData');
function updateVals(){
    analyser.getByteFrequencyData(outputData);
    var values = "";
    for(var i = 0; i < outputData.length/2; i+=2){
        values += (i+": " + outputData[i] +", " + (i+1) +": " + 
                outputData[i+1] + "<br/>");
    }
    outputDIV.innerHTML = values;                        
}
setInterval(updateVals, 50);

var canvasEle = document.getElementById('canvasA');
var cCtx = canvasEle.getContext('2d');
function visual(){
cCtx.clearRect(0,0, canvasEle.width, canvasEle.height);
var rectWidth = canvasEle.width / outputData.length;
cCtx.fillStyle = "#00BBFF";
for(var i = 0; i < outputData.length; i++){
    cCtx.fillRect(i* rectWidth,canvasEle.height - 
            ((outputData[i]/255) * canvasEle.height), rectWidth,
            ((outputData[i]/255) * canvasEle.height));
    }
    requestAnimationFrame(visual);
}
requestAnimationFrame(visual);