import React, {useRef, useEffect, useState, Component} from 'react';


class Video extends Component {

    peer = this.props.peer;

    componentDidMount(){
        this.peer.on("stream", stream=>{
            document.getElementById("video").srcObject = stream;
        })
    }
    pausePlayVid(action){
        const video = document.getElementById("video");
        switch(action){
            case "pause":
                video.pause();
                break;
            case "resume":
                video.play();
        }
    }
    render() { 
        return ( 
            <video id="video" className="video" playsInline autoPlay></video>
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