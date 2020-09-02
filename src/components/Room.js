import React, {useRef, useState, useEffect, useContext} from 'react';

import Video from "./Video";
import Peer from "simple-peer";
import Controls from "./Controls";
import lottie from "lottie-web";
import animLoading from "../animations/loading.json"
import {socketContext} from "../Context/socketContext";
import Icon from "./Icon";
import Middle from './Middle';
import Logo from "../assets/logo.svg";
// const worker = new Worker("../worker.js");

const Room = (props) => {
    const roomID = props.routeArgs.match.params.roomID,
          [peers, setPeers] = useState([]),//////////////////////your peer is here
          [mode, setMode] = useState("default"),
          [currentFeature, setCurrentFeature] = useState(""),
          videoRef = useRef(),
          peersRef = useRef([]),
          socketRef = useRef(),
          controlsRef= useRef(),
          otherVideo = useRef(),
          animContainerLoading = useRef(),
          animRefLoading = useRef(),
          videoPausedRef = useRef(),
          audioPausedRef = useRef(),
          [hasJoined, setHasJoined] = useState(false),
          [connectionMade, setConnectionMade] = useState(false),
          [otherUsers, setOtherusers] = useState([]),
          logoRef = useRef(),
          testRef = useRef(),
          videoStream = useRef(),
          screenSharedRef = useRef(false),
          [screenShared, setScreenShared] = useState(false);
          screenSharedRef.current = screenShared;


    socketRef.current = useContext(socketContext);

    const pauseTrack =(track)=>{
        switch(track){
            case "video":
                //pause your video;
                 videoRef.current.pause();
                 socketRef.current.emit("pause video", "");
                break;
            case "audio":
                console.log("this fired")
                //send message to the other peer to mute their audio of you
                socketRef.current.emit("mute audio", "");
                break;
           default: //do nothing
        }
        //this code causes a error, resort to stopping the video and audio manually on the other peer.
        // console.log(stream.getAudioTracks()[0]);
        // peers[0].removeTrack(stream.getAudioTracks()[0], stream);
    }

    const resumeTrack=(track)=>{
        switch(track){
            case "video":
                //resume your video
                videoRef.current.play();
                socketRef.current.emit("resume video", "");
                break; 
            case "audio":
                socketRef.current.emit("unmute audio", "")
                break;
            default: //do nothing   
                 
        }


    }

    useEffect(()=>{
        animRefLoading.current = lottie.loadAnimation({
            container: animContainerLoading.current,
            animationData: animLoading,
            loop: true,
        });
        //init socket
        //get media stream 
        navigator.mediaDevices.getUserMedia({video: true, audio: true}).then(stream=>{
            //put the stream in the ref
            //everything else is done here
            videoStream.current = stream;
            videoRef.current.srcObject = stream;
            //send a request to join the current room.
            socketRef.current.emit("join room", roomID);
              
            socketRef.current.on("room full", data=>{
                console.log(data);
            });

            socketRef.current.on("you joined", otherUsers=>{
                //user has joined a room
                 setHasJoined(true);
                //create a peer for each user
                const peers = [];
                setOtherusers(otherUsers);
                otherUsers.forEach(userID=>{
                    const peer = createPeer(userID, stream);
                    //add to the peersRef;
                    peersRef.current.push({
                        peerID: userID,
                        peer
                    })
                    //add peer to state
                    //push the peer into the peers array
                peers.push(peer);
                });
                setPeers(peers)
            });

            socketRef.current.on("caller sending signal", data=>{
                const {callerID, signal}  = data;
                //create a response peer
                const peer = createRespPeer(callerID, signal, stream);
                peer.signal(signal);
                //add to the peersRef;
                peersRef.current.push({
                    peerID: callerID,
                    peer
                })   
                //add peer to peer state 
                setPeers([peer]);
            })

            socketRef.current.on("recipient returned signal", data=>{
                //find the peer that corresponds with the caller
               const peerObj = peersRef.current.find(obj=>(
                    obj.peerID === data.recipientID
            ))
                const peer = peerObj.peer;
                peer.signal(data.signal);
                //set signal as established 
                setConnectionMade(true);
                //send message to old user to tell them that the connection has established
                socketRef.current.emit("connection established", "");
            })

            socketRef.current.on("connection established", data=>{
                setConnectionMade(true);
            })

            socketRef.current.on("client disconnected", discID=>{
                //find the peer associated with the disconnected client
                const discPeer = peersRef.current.find(obj=> obj.peerID === discID).peer;
                // console.log(discPeer);
                // //remove the peer from the array in state.
                setPeers(peers=> (peers.filter(p=>(p !== discPeer)) ) )
                discPeer.destroy();
            })

            socketRef.current.on("hello world", data=>{
                console.log(data)
            })

            socketRef.current.on("pause video", data=>{
                //pause other video
                otherVideo.current.pausePlayVid("pause");
            })

            socketRef.current.on("resume video", data=>{
                //pause other video
                otherVideo.current.pausePlayVid("resume");
            })

            socketRef.current.on("mute audio", data=>{
                otherVideo.current.pausePlayAud("pause")
            })

            socketRef.current.on("unmute audio", data=>{
                otherVideo.current.pausePlayAud("resume")
            })

        })
    },[]);
    const createPeer = (recipient, stream)=>{
        //create a peer
        const peer = new Peer({initiator: true, trickle: false, stream: stream});
        //when signal is ready, send one
        /////////////listen to events 
        peer.on("signal", signal=>{
            socketRef.current.emit("sending signal", {recipient: recipient, signal: signal})
        });
        // peer.on("data", handleReceivingData);
        return peer;
    }

    const createRespPeer = (callerID, signal, stream)=>{
        //create a non-initiator peer
        const peer = new Peer({initiator:false, trickle:false, stream: stream});
        //set the RespPeer signal to the incoming signal
        // setConnectionMade(true);///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //respond to caller when signal is ready
        peer.on("signal", signal=>{
            socketRef.current.emit("returning signal", {signal: signal, callerID: callerID});
        })
        // peer.on("data", handleReceivingData);
        return peer;
    }

    const initFeatureMode =(feature)=>{
        setMode("feature");
        setCurrentFeature(feature);
    }

    const initDefaultMode = ()=>{
        setMode("default");
        document.querySelector(".active").classList.remove("active")
    }

    const stopShareScreen = ()=>{
        if(screenSharedRef.current){
            peersRef.current[0].peer.replaceTrack(peersRef.current[0].peer.streams[0].getVideoTracks()[0], videoStream.current.getVideoTracks()[0], peersRef.current[0].peer.streams[0]);
            setScreenShared(false);
            console.log(screenSharedRef)
        }else{
            console.log("i aint doin' shiz bucko")
        }
    }

    const shareScreen = ()=>{
         navigator.mediaDevices.getDisplayMedia().then(stream => {
            const track = stream.getTracks()[0];
            // peersRef.current[0].peer.streams[0].getVideoTracks()[0].stop();
            peersRef.current[0].peer.replaceTrack(peersRef.current[0].peer.streams[0].getVideoTracks()[0], track,peersRef.current[0].peer.streams[0]);
            setScreenShared(true);
            track.onended = stopShareScreen;
        });
    } 

    const fullScreen = ()=>{
        otherVideo.current.fullScreen();
    }


    let containerStyle, video1Style, video2Style, pausedStyle, controlsStyle;
    switch(mode){
        case "feature":
            containerStyle = {
                width: "15%",
                display: "flex",
                flexDirection: "column"
            };
            video1Style = {
                width: "100%",
                height: "unset",
                position: "relative",
                borderRadius: 0,
                borderBottomLeftRadius: "20px",
                borderBottomRightRadius: "20px"
            };
            video2Style = {
                position: "relative",
                bottom: "unset",
                left: "unset",
                width: "100%",
                borderRadius: 0,
                borderTopLeftRadius: "20px",
                borderTopRightRadius: "20px"
            };
            pausedStyle = {
                position: "relative",
                left: "unset",
                top: "unset",
            };
            controlsStyle = {
                marginRight: 0
            }
        break;
        case "default":
            containerStyle = {};
            video1Style = {};
            video2Style = {};
            pausedStyle = {};
            controlsStyle = {};
            break;

        default: 
        //do nothing     
    }

     //prevent user from using controls if they havent joined
    let icons;
     if(hasJoined){
        icons = <>
                    <Icon feature={"screenShare"}  featureMode={initFeatureMode} logo={logoRef.current}/>
                    <Icon feature={"ytShare"}  featureMode={initFeatureMode} logo={logoRef.current}/>
                    <Icon feature={"liveCanvas"} featureMode={initFeatureMode} logo={logoRef.current}/>
                    <Icon feature={"fileShare"}  featureMode={initFeatureMode} logo={logoRef.current}/>
                    <Icon feature={"liveChat"} featureMode={initFeatureMode} logo={logoRef.current}/>
               </>
    }else{
        icons = null
    }

    ///do he same thing for the middle div component
    let middle
    if(hasJoined){
        middle =  <Middle currentFeature={currentFeature} defaultMode={initDefaultMode} mode={mode} peers={peers} connectionMade={connectionMade} otherUsers={otherUsers}/>
    }else{
        middle = null
    }

    return ( 
        <div>

                <div className="row" style={{justifyContent: "space-between", height: "100%", padding: 0}}>
                    <div className="features--tab">
                        <img src={Logo} alt="logo" className="features--logo" ref={logoRef}/>
                        {icons}
                    </div>
                    {middle}
                    <div className="video-container" style={containerStyle}>
                        <div className="loading" ref={animContainerLoading}>
                        </div>
                            <div className="video-controls center-vert" ref={controlsRef} style={{display: "none"}}>
                                <Controls pauseTrack={pauseTrack} resumeTrack={resumeTrack} video={videoRef.current} styleObj={controlsStyle}/>
                            </div>
                            
                            <div  className="video-composition">
                                 <button onClick={shareScreen}>Share screen</button>
                                 <button onClick={stopShareScreen}> stop sharing</button>

                                 <button onClick={fullScreen}>Enter full screen</button>

                                <div className="video-pauseContainer"  style={pausedStyle}>
                                <p className="video-videoPaused normal-text" ref={videoPausedRef}>Peer paused their video</p>
                                <p className="video-audioPaused normal-text" ref={audioPausedRef}>Peer muted their audio</p>
                                </div>
                                
                                <video muted autoPlay playsInline ref={videoRef} className="video-composition--2" style={video2Style}></video>
                                {
                                    peers.map((peer, index)=>{
                                        return <Video key={index} peer={peer} ref={otherVideo} videoControls={controlsRef.current} loadingRef={animContainerLoading.current} videoPausedRef={videoPausedRef.current} audioPausedRef={audioPausedRef.current} styleObj={video1Style}/>
                                    })
                                }
                            </div>
                    </div>  
                </div>
                 
        </div>

     );
}
 
export default Room;