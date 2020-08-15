import React, {useRef, useEffect, useState, Component} from 'react';


class Video extends Component {

    peer = this.props.peer;

    componentDidMount(){
        this.peer.on("stream", stream=>{
            document.getElementById("video").srcObject = stream;
            document.querySelector(".video-controls").style.display = "block";
        })
    }
    pausePlayVid(action){
        const video = document.getElementById("video");
        switch(action){
            case "pause":
                video.pause();
                //show notice(video)
                this.showHideNotice("video", "show");
                //blur the video
                this.blurUnblurVid("blur");
                break;
            case "resume":
                video.play();
                this.showHideNotice("video", "hide");
                // console.log("yefutdutd");
                // unblur the video
                this.blurUnblurVid("unblur");

            default: return    
        }
    }
    pausePlayAud(action){
        const video = document.getElementById("video");
        switch(action){
            case "pause":
                video.muted = true;
                console.log(video.muted);
                this.showHideNotice("audio", "show");
                
                break;
            case "resume":
                // video.muted = false;   
                console.log("unnnnmmmuutteed")
                // console.log("unnnnnnmuttttted");
                this.showHideNotice("audio", "hide");


                

            default: return;

        }
    }

    blurUnblurVid(action){
        const video = document.getElementById("video");
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

    showHideNotice(track, action){
        const videoNotice = document.querySelector(".video-videoPaused ");
        const audioNotice = document.querySelector(".video-audioPaused");
        let className;
        let lastClassName;
        switch(action){
            case "show":
                className = "notice__visible";
                lastClassName= "notice__invisible";
                break;
            case "hide":
                className = "notice__invisible";
                lastClassName = "notice__visible";
                // console.log("hdden")
        }
        console.log(className, lastClassName);
        switch(track){
            case "video":
                if(videoNotice.classList.contains(lastClassName)){
                    videoNotice.classList.remove(lastClassName);
                    videoNotice.classList.add(className);
                    console.log(className, lastClassName)
                }else{
                    videoNotice.classList.add(className);
                    console.log(videoNotice.classList.contains(lastClassName), lastClassName)
  
                }
                break;
            case "audio":
                if(audioNotice.classList.contains(lastClassName)){
                    audioNotice.classList.remove(lastClassName);
                    audioNotice.classList.add(className);
                    console.log("this is supposed to fire");
                }else{
                    audioNotice.classList.add(className);    
                    console.log(className, lastClassName);
                }
        }
    }




    render() { 
        return ( 
            <video className="video-composition--1" id="video" playsInline autoPlay></video>
         );
    }
}
 
export default Video;




// const Video = (props) => {
//     const ref = useRef();
//     const peer = props.peer;
//     const [videoPaused, setVideoPaused] = useState()

//     useEffect(()=>{
//         peer.on("stream", stream=>{
//             ref.current.srcObject = stream
//         })
//     }, [])

//     return ( 
//         <video  className="video" playsInline autoPlay ref={ref}></video>
//      );
// }
 
// export default Video;