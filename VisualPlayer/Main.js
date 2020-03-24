// ============== 画布初始化 ===============
var c = document.getElementById("cav")
var cav = c.getContext("2d")
c.width = 1200
c.height = 800
console.log(c.width , c.height)
cav.fillStyle = 'rgb(0,0,0)'
cav.fillRect(0, 0, c.width,  c.height)


// ============== 初始化 ===============
var AudioContext = window.AudioContext || window.webkitAudioContext
try{
    var ctx = new AudioContext()
    var musicList = ['musics/A.mp3','musics/B.mp3','musics/C.mp3','musics/D.mp3','musics/E.mp3']
    var sourceNode
    var bufferLength
    var dataArray
    var isPlaying = false
    var isLoop = false
    var isClick = true
    var musicIndex = 0
    var Analyser = ctx.createAnalyser()
    Analyser.fftSize = 512
    bufferLength = Analyser.fftSize
    draw()
    console.log('Ready.' , ctx)
}catch(e){
    console.log('您的浏览器太菜了.jpg')
}


// ============== 播放 ===============
function playBuffer(buffer) {
    sourceNode = ctx.createBufferSource()
    sourceNode.buffer = buffer
    sourceNode.onended = function () {
        isPlaying = false
        console.log(isPlaying)
        if(isLoop == true){
            if(musicIndex >= musicList.length - 1){
                musicIndex = 0
            }
            musicIndex += 1
            isPlaying = true
            XML(musicList[musicIndex])
        }
    }

    // ===== 分析者 =====
    Analyser.fftSize = 512
    Analyser.smoothingTimeConstant = 0.75
    bufferLength = Analyser.fftSize
    dataArray = new Uint8Array(bufferLength)
    sourceNode.connect(Analyser)
    Analyser.connect(ctx.destination)

    // ===== 开始 =====
    sourceNode.start(0)
}


// ============== 解码者 ===============
function XML(mp3){
    // ===== 防止连点导致脑残 =====
    if(!isClick && isPlaying){
        return false
    }
    isPlaying = true
    isClick = false
    setTimeout(function(){
        isClick = true
    },2000)

    // ===== 后台请求 =====
    var request = new XMLHttpRequest()
    request.open('GET' , mp3 , true)
    request.responseType = 'arraybuffer'
    request.onload = function(){
        ctx.decodeAudioData(request.response , function(buffer){
            playBuffer(buffer)
        },function(){
            console.log('解码失败了嗷')
        })
    }
    request.send()
}

// ============== 停止播放 ===============
function toStop(){
    isPlaying = false
    sourceNode.stop()
}
document.getElementById('Stop').addEventListener('click' , toStop )

// ============== 本地播放事件 ===============
let as = document.getElementsByTagName('a')
for(let i = 0; i < musicList.length ;i++){
    as[i].addEventListener('click' , () => {
        if(sourceNode){
            toStop()
        }

        if(isPlaying == false){
            musicIndex = i
            console.log(musicIndex)
            XML(musicList[i])
        }
    })
}

// ============== 循环播放 ===============
let loop =  document.getElementById('Loop')
loop.style.borderColor = 'white'
loop.style.backgroundColor = 'black'
document.getElementById('Loop').addEventListener('click' , () => {
    if(loop.style.borderColor == 'white'){
        loop.style.borderColor = 'blue'
        loop.style.backgroundColor = 'blue'

        isLoop = true
        console.log('开启循环')
    }else{
        loop.style.borderColor = 'white'
        loop.style.backgroundColor = 'black'

        isLoop = false
        console.log('关闭循环')
    }
})