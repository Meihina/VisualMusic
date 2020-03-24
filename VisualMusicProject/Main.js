import * as THREE from './SourceJS/three.module.js'
import { OrbitControls } from './SourceJS/OrbitControls.js'
import Stats from './SourceJS/stats.module.js'
import { GUI } from './SourceJS/dat.gui.module.js'
import { Lensflare , LensflareElement} from './SourceJS/Lensflare.js'

// import { OutlineEffect } from './SourceJS/OutlineEffect.js'
import { MMDLoader } from './SourceJS/MMDLoader.js'
import { MMDAnimationHelper } from './SourceJS/MMDAnimationHelper.js'


// ========== 一堆变量 ==========
var renderer, camera, scene, ambientLight, directionalLight, control
var gui, stats
var TextMesh , FontLoader = new THREE.FontLoader()
var helper , ikHelper , physicsHelper , clock = new THREE.Clock() , MeshMMD , effect

var analyser = null , audioMesh , PosAudio , geometry = new THREE.SphereGeometry(2, 100, 100) , MusicIndex = 0

var group , group2 , group3 , group4 , group5 , group6 , group8 , group7 , group9
const color1 = {color : 0xFFB90F} , color2 = {color : 0x8B0000}, color3 = {color : 0x0040FF} , color4 = {color : 0xDCDCDC}

const MusicName = ['Mili - Colorful' , 'DECO*27 - Otome Kaibou' , 'Mili - world.execute (me)']
const MusicList = ['./SourceMusic/A.mp3' , './SourceMusic/B.mp3' , './SourceMusic/C.mp3']


// ========= MMD模型 ==========
function initMMD(){
    function onProgress( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round( percentComplete, 2 ) + '% downloaded' )
        }
    }


    var modelFile = './SourceModel/miku/miku_v2.pmd'
    var vmdFiles = [ './SourceModel/vmds/wavefile_v2.vmd' ]

    helper = new MMDAnimationHelper( {
        afterglow: 2.0
    } )

    var loader = new MMDLoader()

    loader.loadWithAnimation( modelFile, vmdFiles, function ( mmd ) {

        MeshMMD = mmd.mesh
        MeshMMD.position.y = 1
        MeshMMD.scale.y = 3.5
        MeshMMD.scale.x = 3.5
        MeshMMD.scale.z = 3.5
        MeshMMD.receiveShadow = true //可以接收阴影
        MeshMMD.castShadow = true
        scene.add( MeshMMD )

        helper.add( MeshMMD, {
            animation: mmd.animation,
            physics: true
        })

        // 骨骼辅助
        ikHelper = helper.objects.get( MeshMMD ).ikSolver.createHelper();
        ikHelper.visible = false
        scene.add( ikHelper )

        // 刚体辅助
        physicsHelper = helper.objects.get( MeshMMD ).physics.createHelper();
        physicsHelper.visible = false
        scene.add( physicsHelper )
    }, onProgress, null )

    // effect = new OutlineEffect(renderer)
}



// ========== 场景生成 ==========
function initScene() {
    scene = new THREE.Scene()

    FontLoader.load('./SourceJson/gentilis_regular.typeface.json',function(font){
        initText(font , "Mili - Colorful")
    })

    // ===== 天空盒 =====
    scene.background = new THREE.CubeTextureLoader()
        .setPath("./SourceImg/SkyBox/")
        .load(['posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg'])
}


// ========== 渲染器生成 ==========
function initRender() {
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    })
    renderer.setSize(window.innerWidth, window.innerHeight)

    // ===== 阴影效果 =====
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    document.body.appendChild(renderer.domElement)
}


// ========== 镜头生成 ==========
function initCamera() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 15000)
    camera.position.set(100, 200, 700)
    camera.lookAt(new THREE.Vector3(0, 0, 0))
}


// ========== 状态生成 ==========
function initStats() {
    stats = new Stats()
    document.body.appendChild(stats.dom)
}


// ========== 改名 ==========
function OutChangeName(New_name){
    scene.remove(TextMesh)
    FontLoader.load('./SourceJson/gentilis_regular.typeface.json',function(font){
        initText(font , New_name)
    })
}

// ========== GUI生成 ==========
function initGui() {
    // ===== 改变音乐以及名字模块 =====
    function ChangeName(New_name){
        OutChangeName(New_name)
    }

    function ChangeSong(path){
        PosAudio.stop()
        MusicReq(PosAudio , path)
    }

    // ===== dat.gui功能组 =====
    var controls = new function () {
        this.Pause = function() {PosAudio.pause()}
        this.Play = function() {PosAudio.play()}
        this.Stop = function() {PosAudio.stop()}
        this.MusicList = 'Mili - Colorful'
        this.LoopMode = true
    }

    // ===== dat.gui具现化 =====
    gui = new GUI()
    var MusicControl = gui.add(controls , 'MusicList' , MusicName)
    var isLoop = gui.add(controls , 'LoopMode')
    gui.add(controls , 'Pause')
    gui.add(controls , 'Play')
    gui.add(controls , 'Stop')

    MusicControl.onFinishChange(function(value){
        MusicIndex = MusicName.indexOf(value)
        ChangeName(value)
        ChangeSong(MusicList[MusicIndex])
        // alert(MusicIndex)
    })

    isLoop.onFinishChange(function(value){
        if(value){
            PosAudio.onEnded = function(){
                // alert('next')
                PosAudio.stop()
                if(MusicIndex >= MusicList.length - 1){
                    MusicIndex = 0
                }else{MusicIndex += 1}
                MusicReq(PosAudio , MusicList[MusicIndex])
                ChangeName(MusicName[MusicIndex])
            }
        }else{
            PosAudio.onEnded = null
        }
    })
}


// ========== 光线生成 ==========
function initLight() {
    ambientLight = new THREE.AmbientLight("#ffffff")
    scene.add(ambientLight)

    directionalLight = new THREE.DirectionalLight("#ffffff")
    directionalLight.position.set(400, 200, 100)

    directionalLight.shadow.camera.near = 0 // 产生阴影的最近距离
    directionalLight.shadow.camera.far = 4000 // 产生阴影的最远距离
    directionalLight.shadow.camera.left = -500 // 产生阴影距离位置的最左边位置
    directionalLight.shadow.camera.right = 500 // 最右边
    directionalLight.shadow.camera.top = 500 // 最上边
    directionalLight.shadow.camera.bottom = -500 // 最下面

    // 这两个值决定生成阴影密度 默认512
    directionalLight.shadow.mapSize.height = 2048
    directionalLight.shadow.mapSize.width = 2048

    // 告诉平行光需要开启阴影投射
    directionalLight.castShadow = true
    scene.add(directionalLight)
}


// ========== 光晕生成 ==========
function initLensflares(){
    let dirLight = new THREE.DirectionalLight( 0xffffff, 0.05 )
    dirLight.position.set( 0, - 1, 0 ).normalize()
    dirLight.color.setHSL( 0.1, 0.7, 0.5 )
    scene.add( dirLight )


    var textureLoader = new THREE.TextureLoader()
    var textureFlare0 = textureLoader.load( './SourceImg/lensflare/lensflare0.png' )
    var textureFlare3 = textureLoader.load( './SourceImg/lensflare/lensflare3.png' )

    addLight( 0.55 , 0.9 , 0.3 , 0 , 200 , 0 , 200)
    addLight( 0.995 , 0.9 , 0.9 , 8000 , 50 , 1800 , 800 )

    function addLight( h, s, l, x, y, z, b ) {

        var light = new THREE.PointLight( 0xffffff, 1.5, 2000 )
        light.color.setHSL( h, s, l )
        light.position.set( x, y, z )
        scene.add( light )

        var lensflare = new Lensflare()
        lensflare.addElement( new LensflareElement( textureFlare0, b, 0, light.color ) )
        lensflare.addElement( new LensflareElement( textureFlare3, 60, 0.6 ) )
        lensflare.addElement( new LensflareElement( textureFlare3, 70, 0.7 ) )
        lensflare.addElement( new LensflareElement( textureFlare3, 120, 0.9 ) )
        lensflare.addElement( new LensflareElement( textureFlare3, 70, 1 ) )
        light.add( lensflare )
    }
}


// ========== 地基生成 ==========
function initPlane() {
    var planeGeometry = new THREE.BoxGeometry(1000, 1000 ,200)
    var planeMaterial = new THREE.MeshLambertMaterial({color: 0xaaaaaa, side: THREE.DoubleSide})
    var plane = new THREE.Mesh(planeGeometry, planeMaterial)
    plane.rotation.x = -0.5 * Math.PI
    plane.position.y = -100
    plane.receiveShadow = true //可以接收阴影
    scene.add(plane)
}


// ========== 镜头控制 ==========
function initControl() {
    control = new OrbitControls(camera, renderer.domElement)
}


// ========== 文字生成 ==========
function initText(font , text){
    let Geometry = new THREE.TextGeometry(text,{
        font:font,
        size:30,
        height:2
    })

    Geometry.computeBoundingBox()    //3D文字材质
    let Mesh = new THREE.MeshBasicMaterial({color:0x222222})
    TextMesh = new THREE.Mesh(Geometry , Mesh)
    TextMesh.position.set(0 ,275, 0)
    TextMesh.castShadow = true
    scene.add(TextMesh)
}


// ========== 定义音乐 ==========
function initMusic(){
    let material = new THREE.MeshLambertMaterial({emissive: 0xffffff})
    audioMesh = new THREE.Mesh( geometry , material)
    audioMesh.position.set(0, -10 , 0)
    audioMesh.castShadow = true
    scene.add(audioMesh)
}


// ========== 音乐播放者 ==========
function initPlay(){
    var listener = new THREE.AudioListener()
    camera.add(listener)
    PosAudio = new THREE.PositionalAudio(listener)
    audioMesh.add(PosAudio)
    MusicReq(PosAudio , MusicList[MusicIndex])
    PosAudio.onEnded = function(){
        PosAudio.stop()
        alert('next')
        if(MusicIndex >= MusicList.length - 1){
            MusicIndex = 0
        }else{MusicIndex += 1}
        MusicReq(PosAudio , MusicList[MusicIndex])
        OutChangeName(MusicName[MusicIndex])
    }
}

function MusicReq(Audio , path){
    var audioLoader = new THREE.AudioLoader()
    audioLoader.load(path, function(AudioBuffer) {
        Audio.setBuffer(AudioBuffer)
        Audio.setVolume(0.9) //音量
        Audio.setRefDistance(200) //参数值越大,声音越大
        Audio.play() //播放

        analyser = new THREE.AudioAnalyser(Audio , 256)
    })
}


// ========== 建模 ==========
function initGroup(){
    let N = 128 //控制音频分析器返回频率数据数量
    let rad = (360 / N / 2) // 5.625

    function LongBox(Group , R , H){
        for (let i = 0; i <= N / 2 + 2; i++) {
            var box = new THREE.BoxGeometry(3, H, 3) //创建一个立方体几何对象

            if(Math.random() > 0.5){
                var material = new THREE.MeshPhongMaterial(color1) //材质对象
            }else{
                var material = new THREE.MeshPhongMaterial(color2) //材质对象
            }

            var mesh = new THREE.Mesh(box, material) //网格模型对象
            // 长方体间隔20，整体居中
            let x = R * Math.sin(rad * (i - 1)) , y = R * Math.cos(rad * (i - 1))
            mesh.position.set(x ,0.5, y)
            mesh.castShadow = true
            Group.add(mesh)
        }
    }

    function TowerBox(Group , x , z){
        for (let i = 0; i < 14; i++) {
            for(let j = 0;j < 14 ;j++){
                let H = (function(){

                    let di = i + 1 , dj = j + 1
                    if(x < 0 && z > 0){
                        di = 14 + 1 - i
                    }else if(x > 0 && z < 0){
                        dj = 14 + 1 - j
                    }else if(x < 0 && z < 0){
                        dj = 14 + 1 - j , di = 14 + 1 - i
                    }

                    let height = 300 * Math.random() - di * dj * 3
                    return height > 0 ? height : 0
                })()
                if(H === 0){continue}
                var box = new THREE.BoxGeometry(20, H, 20) //创建一个立方体几何对象


                if(Math.random() > 0.5){
                    var material = new THREE.MeshPhongMaterial(color3) //材质对象
                }else{
                    var material = new THREE.MeshPhongMaterial(color4) //材质对象
                }

                var mesh = new THREE.Mesh(box, material) //网格模型对象
                // 长方体间隔20，整体居中
                let rx = x - i * 30
                mesh.position.set(rx ,H / 2, z - 30 * j)
                mesh.castShadow = true
                mesh.receiveShadow = true
                Group.add(mesh)
            }
        }
    }

    function LineBox(Group , x , y , z , w , n){
        for (let i = 0; i <= n; i++) {
            var box = new THREE.BoxGeometry(w, 1, w) //创建一个立方体几何对象

            if(i % 2 == 0){
                var material = new THREE.MeshStandardMaterial(color1) //材质对象
            }else{
                var material = new THREE.MeshStandardMaterial(color2) //材质对象
            }
            var mesh = new THREE.Mesh(box, material) //网格模型对象
            // 长方体间隔20，整体居中
            mesh.position.set(x , y , z)

            let roll = []
            for(let i = 0;i < 3; i++){
                if(Math.random() > 0.5){
                    roll.push(Math.random() * 10)
                }else{
                    roll.push(-Math.random() * 10)
                }
            }
            mesh.rotation.set(roll[0] ,roll[1], roll[2])
            mesh.castShadow = true
            Group.add(mesh)
        }
    }


    group = new THREE.Group()
    LongBox(group , 150 , 0.2)
    group2 = new THREE.Group()
    LongBox(group2 , 200 , 0.2)
    group3 = new THREE.Group()
    LineBox(group3 , 0 , 200 , 0 , 0.3 , 20)
    group4 = new THREE.Group()
    LineBox(group4 , 0 , 200 , 0 , 0.1 , 30)
    group5 = new THREE.Group()
    LineBox(group5 , 0 , 200 , 0 , 0.2 , 40)
    group6 = new THREE.Group()
    TowerBox(group6,480,480)
    group7 = new THREE.Group()
    TowerBox(group7,-90,480)
    group8 = new THREE.Group()
    TowerBox(group8,480,-90)
    group9 = new THREE.Group()
    TowerBox(group9,-90,-90)

    scene.add(group)
    scene.add(group2)
    scene.add(group3)
    scene.add(group4)
    scene.add(group5)
    scene.add(group6)
    scene.add(group7)
    scene.add(group8)
    scene.add(group9)
}


// ========== 渲染至画布 ==========
function render() {
    control.update()
    helper.update( clock.getDelta() )
    // effect.render(scene, camera)
    renderer.render(scene, camera)
    renderer.setClearColor(0xb9d3ff, 1)
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}


// ========== 动态渲染 ==========
function animate() {
    // 更新渲染和状态
    render()
    stats.update()

    if (analyser) {
        // 获得频率数据N个
        var arr = analyser.getFrequencyData()
        group.children.forEach((elem, index) => {
            elem.scale.y = arr[index] * 10 / 2
            elem.material.color.r = 100
        })

        group2.children.forEach((elem, index) => {
            elem.scale.y = arr[index] * 9
            elem.material.color.r = 100
            audioMesh.scale.y = arr[index] * 5 / 500 + 1
            audioMesh.scale.x = arr[index] * 5 / 500 + 1
            audioMesh.scale.z = arr[index] * 5 / 500 + 1
        })

        group3.children.forEach((elem, index) => {
            elem.scale.y = arr[index] * 0.8
            elem.material.color.r = 200
            elem.rotation.x += Math.random() / 100
            elem.rotation.y += Math.random() / 100
            elem.rotation.z += Math.random() / 100
        })

        group4.children.forEach((elem, index) => {
            elem.scale.y = arr[index] * 3
            elem.material.color.r = 200
            elem.rotation.x += Math.random() / 100
            elem.rotation.y += Math.random() / 100
            elem.rotation.z += Math.random() / 100
        })

        group5.children.forEach((elem, index) => {
            elem.scale.y = arr[index] * 1.5
            elem.material.color.r = 200
            elem.rotation.x += Math.random() / 100
            elem.rotation.y += Math.random() / 100
            elem.rotation.z += Math.random() / 100
        })

        group7.children.forEach((elem, index) => {
            elem.scale.y = arr[index] * 10 / 4000 + 1
        })
        group8.children.forEach((elem, index) => {
            elem.scale.y = arr[index] * 10 / 4000 + 1
        })
        group9.children.forEach((elem, index) => {
            elem.scale.y = arr[index] * 10 / 4000 + 1
        })
        group6.children.forEach((elem, index) => {
            elem.scale.y = arr[index] * 10 / 4000 + 1
        })

        TextMesh.rotation.y += 0.001
        MeshMMD.rotation.y += 0.005
    }

    requestAnimationFrame(animate)
}


Ammo().then( function ( AmmoLib ) {

    Ammo = AmmoLib

    initScene()
    initRender()
    initCamera()
    initStats()
    initGui()
    initLight()
    initPlane()
    initLensflares()
    initMMD()

    initMusic()
    initPlay()
    initGroup()
    initControl()
    animate()
    window.onresize = onWindowResize

} )