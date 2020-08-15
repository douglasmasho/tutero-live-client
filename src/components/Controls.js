import React, {useRef, useEffect, useState} from 'react';
import Camcorder from "../assets/camera-video.svg";
import Mic from "../assets/mic.svg";
import lottie from "lottie-web";
import animation from "../animations/toggleAnimated.json";

const Controls = (props) => {

    const animationContainer = useRef();
    const animationContainer2 = useRef();
    const animRef = useRef();
    const animRef2 = useRef();
    const [vidState, setVidState] = useState("on");
    const [audState, setAudState] = useState("on");

    useEffect(()=>{
        animRef.current = lottie.loadAnimation({
            container: animationContainer.current,
            animationData: animation,
            loop: false,
        });
        animRef.current.goToAndStop(0, true);

        animRef2.current = lottie.loadAnimation({
            container: animationContainer2.current,
            animationData: animation,
            loop: false,
        });
        animRef2.current.goToAndStop(0, true);
    }, []);
    const getColorVid = ()=>{
        if(vidState === "on"){
            return "#2ffb52"
        }else if(vidState === "off"){
            return "#ff2c2c"
        }
    }
    const getColorAud = ()=>{
        if(audState === "on"){
            return "#2ffb52"
        }else if(audState === "off"){
            return "#ff2c2c"
        }
    }

    
    const blurUnblurVid =(action)=>{
        // console.log("this must fire")
        const video = document.querySelector(".video-composition--2");
        let className, lastClassName;
        switch(action){
            case "blur":
                className = "video__blurred";
                lastClassName = "video__unblurred" 
                break;
            case "unblur":
                className = "video__unblurred" 
                lastClassName = "video__blurred";
        }

        if(video.classList.contains(lastClassName)){
            video.classList.remove(lastClassName);
            video.classList.add(className);
        }else{
            video.classList.add(className);
        }
    }



    return(
                <div>
                    <div className="controls controls__1" style={{backgroundColor: getColorVid()}}>
                            <span className="controls--icon"><img src={Camcorder} alt="" className="controls__icon" style={{width: "30px"}}/></span>
                            <div className="row controls--expanded center-vert--row">
                            <span className="row-4--child normal-text controls--label">off</span>
                                <div className="toggle" ref={animationContainer} onClick={()=>{
                                        if(vidState === "on"){
                                            animRef.current.playSegments([0,12], true);
                                            setVidState("off");
                                            props.pauseTrack("video");
                                            //show notice (video);
                                            blurUnblurVid("blur")
                                            
                                        }else{
                                            animRef.current.playSegments([12,24], true);
                                            setVidState("on");
                                            props.resumeTrack("video");
                                            //hide notice(video)
                                            blurUnblurVid("unblur")
                                        }   
                                }}></div>
                            <span className="row-4--child normal-text controls--label">on</span>

                            </div>

                    </div>


                    <div className="controls controls__2" style={{backgroundColor: getColorAud()}}>
                        <span className="controls--icon"><img src={Mic} alt="" className="controls__icon" style={{width: "30px"}} /></span>
                        <div className="row controls--expanded  center-vert--row">
                            <span className="row-4--child normal-text controls--label">off</span>
                            <div className="toggle " ref={animationContainer2} onClick={()=>{
                                        if(audState === "on"){
                                            animRef2.current.playSegments([0,12], true);
                                            setAudState("off");
                                            props.pauseTrack("audio");
                                            //show notice(audio)

                                        }else{
                                            animRef2.current.playSegments([12,24], true);
                                            setAudState("on");
                                            props.resumeTrack("audio");
                                            //hide notice(audio)
    
                                        }   
                            }}></div>
                            <span className="row-4--child normal-text controls--label">on</span>

                        </div>

                    </div>      
                </div>
         )


}
 
export default Controls;