import React, {useRef, useEffect, useState} from 'react';
import Camcorder from "../assets/camera-video.svg";
import Mic from "../assets/mic.svg";
import lottie from "lottie-web";
import animation from "../animations/toggleAnimated.json";

const Controls = (props) => {
    const pauseVidBtn = useRef();
    const resumeVidBtn = useRef();
    const pauseAudBtn = useRef();
    const resumeAudBtn = useRef();
    const animationContainer = useRef();
    const animationContainer2 = useRef();
    const animRef = useRef();
    const animRef2 = useRef();
    const [vidState, setVidState] = useState("on");
    const [audState, setAudState] = useState("on")
    // var animation = bodymovin.loadAnimation({
    //     container: document.getElementById('bm'),
    //     renderer: 'svg',
    //     loop: true,
    //     autoplay: true,
    //     // path: "../assets/toggleAnimation.json"
    //   })

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
    }, [])

    return(
                <div>
                    <div className="controlsDiv">
                            <span><img src={Camcorder} alt="" className="controls__icon" style={{width: "30px"}}/></span>
                            <div className="toggle" ref={animationContainer} onClick={()=>{
                                    if(vidState === "on"){
                                        animRef.current.playSegments([0,12], true);
                                        setVidState("off");
                                        props.pauseTrack("video");
                                    }else{
                                        animRef.current.playSegments([12,24], true);
                                        setVidState("on");
                                        props.resumeTrack("video");
                                    }   
                            }}></div>
                    </div>


                    <div className="controlsDiv">
                        <span><img src={Mic} alt="" className="controls__icon" style={{width: "30px"}} /></span>
                        <div className="toggle" ref={animationContainer2} onClick={()=>{
                                    if(audState === "on"){
                                        animRef2.current.playSegments([0,12], true);
                                        setAudState("off");
                                        props.pauseTrack("audio");

                                    }else{
                                        animRef2.current.playSegments([12,24], true);
                                        setAudState("on");
                                        props.resumeTrack("audio");
 
                                    }   
                            }}></div>

                    </div>      
                </div>
         )


}
 
export default Controls;