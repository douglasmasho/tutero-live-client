import React, {Component} from 'react';


class Video extends Component {

    peer = this.props.peer;
    video = React.createRef();

    componentDidMount(){
        this.peer.on("stream", stream=>{
            this.video.current.srcObject = stream;
            this.props.videoControls.style.display = "flex";
            this.props.loadingRef.style.display = "none";
        })
    }
    pausePlayVid(action){
        const video = this.video.current;
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
        const video = this.video.current;
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
                video.muted = false  

            default: return;

        }
    }

    blurUnblurVid(action){
        const video = this.video.current;
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
        const videoNotice = this.props.videoPausedRef;
        const audioNotice = this.props.audioPausedRef;
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
            <video style={this.props.styleObj} className="video-composition--1" ref={this.video} playsInline autoPlay></video>
         );
    }
}
 
export default Video;
