function draw(){
    drawVisual = requestAnimationFrame(draw)

    // ===== 分析8bit数组 =====
    bufferLength = Analyser.frequencyBinCount
    dataArray = new Uint8Array(bufferLength)
    Analyser.getByteFrequencyData(dataArray)

    // ===== 每次清空画布 =====
    cav.fillStyle = 'rgb(0,0,0)'
    cav.fillRect(0, 0, c.width, c.height)

    // ===== 条子宽以及起始位置 =====
    let barWidth = (c.height / bufferLength) * 5 , barHeight
    let x = c.width * 0.05 // 开始描绘的x坐标

    // ===== 线条位置初始化 =====
    let last_x = 0 , last_y = 0 , last_x_blue = 0 , last_y_blue = 0

    // ===== 绘制 =====
    for(let i = 0; i < 50; i++) {
        barHeight = dataArray[i] * 1.5 - i * 8

        // ===== 更多层次感 =====
        if(i < 5){
            barHeight -= 50 * (4 - i * Math.random / 2) - 80
        }else if(i >= 15 && i < 24){
            barHeight += Math.pow(i , 2) * 0.02 * Math.random() / 2 + 30
        }else if(i >= 24 && i < 30){
            barHeight += Math.pow(i , 3) * 0.006
        }else if(i >= 30 && i < 35){
            barHeight += Math.pow(i , 5) * 0.000006
        }else if(i >= 35){
            barHeight += Math.pow(i , 2) * 0.15
        }

        if(barHeight < 0){
            barHeight = 0
        }

        // ===== 主绘画区 =====
        // cav.fillStyle = 'rgb(' + (barHeight) + ','+(barHeight)+', 200,' + (barHeight / (barHeight + 100)) + ')'
        cav.fillStyle = 'rgb(' +(barHeight) / 1.8 +',' +(barHeight)+',0 ,'+ (Math.random() + 1) +')'
        cav.fillRect(x , c.height * 0.7 - barHeight , barWidth , barHeight)
        cav.fillStyle = 'rgb(' + (barHeight + 100) + ','+(barHeight + 20)+',50, 0.1 )'
        cav.fillRect(x , c.height * 0.7 + 10 , barWidth , barHeight * 0.3)

        cav.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50,0.1)'
        cav.fillRect(x , c.height * 0.7 + 10 + barHeight * 0.3 - (0.05 *　barHeight * Math.random()) + 20 , barWidth , 10)

        cav.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50,' + (barHeight - 1) + ')'
        cav.fillRect(x , c.height * 0.7 - 45 - barHeight, barWidth , 10)

        cav.fillStyle = 'rgb(' + (barHeight + 100) + ',50,250,' + (barHeight / (barHeight + 100)) + ')'
        cav.fillRect(x , c.height * 0.7 - barHeight - 30 , barWidth , 10)
        cav.fillRect(x , c.height * 0.7 - barHeight - 15 , barWidth , 10)

        // ===== 线条绘画区 =====
        if(i !== 0){
            cav.beginPath()
            cav.moveTo(last_x , last_y)
            cav.lineWidth = 3
            cav.strokeStyle = 'red'
            cav.lineTo(x + barWidth / 2 , c.height * 0.7 - barHeight - 80)
            cav.stroke()

            cav.beginPath()
            cav.moveTo(last_x_blue , last_y_blue)
            cav.lineWidth = 3
            cav.strokeStyle = 'blue'
            let new_last_y_blue = c.height * 0.7 - barHeight - 80 - (Math.random() - 0.5) * 40
            cav.lineTo(x + barWidth / 2 , new_last_y_blue)
            last_y_blue = new_last_y_blue
            cav.stroke()
        }
        last_x = x + barWidth / 2 , last_y = c.height * 0.7 - barHeight - 80

        last_x_blue = x + barWidth / 2
        if(i == 0){
            last_y_blue = c.height * 0.7 - barHeight - 80 - (Math.random() - 0.5) * 40
        }

        x += barWidth + 5
    }
}
