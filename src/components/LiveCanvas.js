import React, { useContext, useEffect, useRef, useState } from 'react';
import  {socketContext} from "../Context/socketContext";


const LivCanvas = (props) => {
    const socket = useContext(socketContext),
    canvasRef = useRef(),
    ctx = useRef(),
    scrollFromPeer = useRef(),
    containerRef = useRef(),
    toolRef = useRef(),
    colorRef = useRef(),
    paintingRef = useRef();
    scrollFromPeer.current = false;
    // toolRef.current = tool;
    // let painting = false;
    // let tool = "draw";
    toolRef.current = "draw";
    paintingRef.current = false
    // let colorRef = useRef();
    colorRef.current = "black";

    useEffect(()=>{
        ctx.current = canvasRef.current.getContext("2d");
        canvasRef.current.height = window.innerHeight * 2;
        canvasRef.current.width = window.innerWidth * 2;
        canvasRef.current.style.width = `${window.innerWidth}px`;
        canvasRef.current.style.height = `${window.innerHeight}px`;
        ctx.current.scale(2,2);

        document.querySelectorAll(".colors").forEach(el=>{
            el.addEventListener("click", (e)=>{
                colorRef.current = e.currentTarget.style.backgroundColor;
                console.log(colorRef.current)
                // console.log(e.currentTarget.style.backgroundColor);
            })
        })

        ////socket events ///////////////////////////////////////////////
        socket.on("draw", data=>{
            // console.log("peers is drawing")
            const {x,y,type, color} = data;
            // console.log(x,y,type,color);
            switch(type){
                case "start":startPosition(x,y,color);
                break;
                case "stop": finishedPosition();
                break;
                case "draw": draw(x,y);
            }
        })

        socket.on("erase", ()=>{
            // setTool("erase")
            // toolRef.current = "erase";
            // console.log("peer is erasing");
            toolRef.current = "erase";
        })

        socket.on("unerase", ()=>{
            toolRef.current = "draw"
        }) 

        socket.on("clear", ()=>{
            ctx.current.clearRect(0,0,canvasRef.current.width,canvasRef.current.height);
        })

        socket.on("scroll", data=>{
            const {x,y} = data;
            scrollFromPeer.current = true;
            containerRef.current.scrollTo(x,y);
            console.log(x,y)
        })

    },[])

    useEffect(()=>{
        console.log("LC rerendered");
        // console.log(document.querySelector(".liveCanvas--container").getBoundingClientRect());

    })

    const changeTool = (string)=>{
        toolRef.current = string;
        if(toolRef.current === "erase"){
            socket.emit("erase")
        }else{
            socket.emit("unerase")
        }
    }

    const clear = ()=>{
        ctx.current.clearRect(0,0,canvasRef.current.width,canvasRef.current.height);
        socket.emit("clear");
    }

    const startPosition =(x,y,peerColor)=>{
        console.log(toolRef.current, "is used")
        ctx.current.lineCap = 'round';
        ctx.current.moveTo(x, y);
        ctx.current.beginPath();
        // setPainting(true);
        paintingRef.current = true;
        switch(toolRef.current){
            case "erase":
                ctx.current.lineWidth = 20;
                ctx.current.globalCompositeOperation = 'destination-out';
             break;
             case "draw":
                ctx.current.globalCompositeOperation = 'source-over';
                if(peerColor){
                    ctx.current.strokeStyle = peerColor;
                }else{
                    ctx.current.strokeStyle = colorRef.current;
                }
                draw(x,y);
                ctx.current.lineWidth = 6;
             break;
             default: //do nothing   

        }
    }

    const finishedPosition = ()=>{
        // setPainting(false);
        paintingRef.current = false;
    }

    const draw = (x,y)=>{
        if(!paintingRef.current) return;
       //  if(erase){
       //  }
        ctx.current.lineTo(x, y);
        ctx.current.lineCap = "round";
        ctx.current.stroke()
   }

   const drawFunc = (e)=>{
    // console.log(e)
    const x = e.clientX - document.querySelector("#canvas").getBoundingClientRect().x;
    const y = e.clientY - document.querySelector("#canvas").getBoundingClientRect().y;
    let type;
    switch(e.type){
        case "mousedown": type = "start";
         break;
        case "mouseup": type ="stop";
        break;
        case "mousemove": type="draw";
        default: //
    }

    if(paintingRef.current || type === "start") /////////////////////////////////////////////////////////////////////////////////////////////////////////////
    socket.emit("draw", {x,y,type,color: colorRef.current});

    switch(type){
        case "start": startPosition(x,y,false);
        break;
        case "stop": finishedPosition();
        break;
        case "draw": draw(x,y)
    }
}




    return ( 
        <div style={{position: "relative"}}>
           <div ref={containerRef} className="liveCanvas--container" onScroll={(e)=>{
                if(scrollFromPeer.current){
                    scrollFromPeer.current = false;
                    return
                }
                    socket.emit("scroll", {x: e.currentTarget.scrollLeft, y: e.currentTarget.scrollTop})
           }}>
             <canvas id="canvas" style={{backgroundColor: "white"}} ref={canvasRef} onMouseDown={drawFunc} onMouseUp={drawFunc} onMouseMove={drawFunc}></canvas>
           </div>


            <div className="liveCanvas--controls">
                <button id="draw" onClick={()=>{
                    changeTool("draw");
                }}>Draw</button>
                <button id="erase" onClick={()=>{
                    changeTool("erase")
                }}>Erase</button>
                <button id="clear" onClick={clear}>Clear canvas</button>
                <button className="colors" style={{backgroundColor: "black", color: "white"}}>Black</button>
                <button className="colors"   style={{backgroundColor: "red", color: "white"}}>Red</button>
                <button className="colors"   style={{backgroundColor: "blue", color: "white"}}>Blue</button>
                <button className="colors"   style={{backgroundColor: "yellow", color: "black"}}>yellow</button>
            </div>


        </div>
     );
}
 
export default React.memo(LivCanvas);