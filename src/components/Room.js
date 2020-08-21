import React, {useRef, useState, useEffect, useContext} from 'react';
import io from "socket.io-client";
import Video from "./Video";
import Peer from "simple-peer";
import Controls from "./Controls";
import lottie from "lottie-web";
import animLoading from "../animations/loading.json"
import LiveChat from './LiveChat';
import {socketContext} from "../Context/socketContext";
import Icon from "./Icon";
import Middle from './Middle';
import streamSaver from "streamsaver";
import FileShare from './FileShare';

const worker = new Worker("../worker.js");

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
          videoContainerRef = useRef(),
          hamburgerRef = useRef(),
          [connectionMade, setConnectionMade] = useState(false);
          

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
           default: return
        }
        //this code causes a error, just gonna stop the video and audio manually on the other peer.
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
            default: return    
                 
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
                //add to the peersRef;
                peersRef.current.push({
                    peerID: callerID,
                    peer
                })   
                //add peer to peer state 
                setPeers(peers=> [...peers, peer]);
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
            })

            socketRef.current.on("client disconnected", discID=>{
                //find the peer associated with the disconnected client
                const discPeer = peersRef.current.find(obj=> obj.peerID === discID).peer;
                // console.log(discPeer);
                // //remove the peer from the array in state.
                setPeers(peers=> (peers.filter(p=>(p !== discPeer)) ) )
                discPeer.destroy();
                //put a disconnected
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


      /////////////////////////////////////////////////////
    //   const connectionMade = props.connectionMade,
    //   const animContainerLoading = useRef(),
    //   const animRefLoading = useRef(),
    //   const downloadPrompt = useRef(),
    //   const sendFilePrompt = useRef(),
    //   [file, setFile] = useState(),
    //   fileNameRef = useRef(""),
    //   [gotFile, setGotFile] = useState(false);



    //   function handleReceivingData(data) {
    //     if (data.toString().includes("done")) {
    //         setGotFile(true);
    //         const parsed = JSON.parse(data);
    //         fileNameRef.current = parsed.fileName;
    //     } else {
    //         worker.postMessage(data);
    //     }
    // }

    // function download() {
    //     setGotFile(false);
    //     worker.postMessage("download");
    //     worker.addEventListener("message", event => {
    //         const stream = event.data.stream();
    //         console.log(event.data)
    //         const fileStream = streamSaver.createWriteStream(fileNameRef.current);
    //         stream.pipeTo(fileStream);
    //     })
    // }

    // function selectFile(e) {
    //     setFile(e.target.files[0]);
    // }

    // function sendFile() {
    //     const peer = peers[0];
    //     const stream = file.stream();
    //     const reader = stream.getReader();

    //     reader.read().then(obj => {
    //         handlereading(obj.done, obj.value);
    //     });

    //     function handlereading(done, value) {
    //         if (done) {
    //             peer.write(JSON.stringify({ done: true, fileName: file.name }));
    //             return;
    //         }

    //         peer.write(value);
    //         reader.read().then(obj => {
    //             handlereading(obj.done, obj.value);
    //         })
    //     }

    // }

    // let body;
    // if (connectionMade) {
    //     body = (
    //         <div>
    //             <input onChange={selectFile} type="file" />
    //             <button onClick={sendFile}>Send file</button>
    //         </div>
    //     );
    // } else {
    //     body = (
    //         <h1>Once you have a peer connection, you will be able to share files</h1>
    //     );
    // }

    // let downloadPrompt;
    // if (gotFile) {
    //     downloadPrompt = (
    //         <div>
    //             <span>You have received a file. Would you like to download the file?</span>
    //             <button onClick={download}>Yes</button>
    //         </div>
    //     );
    // }


      /////////////////////////////////////////////////////        

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
        peer.signal(signal);
        setConnectionMade(true);
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

    let containerStyle, video1Style, video2Style, pausedStyle, controlsStyle;
    switch(mode){
        case "feature":
            containerStyle = {
                width: "20%",
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
    }

     //prevent user from using controls if they havent joined
    let icons;
     if(hasJoined){
        icons = <>
                    <Icon feature={"screenShare"}  featureMode={initFeatureMode}/>
                    <Icon feature={"ytShare"}  featureMode={initFeatureMode}/>
                    <Icon feature={"liveCanvas"} featureMode={initFeatureMode}/>
                    <Icon feature={"fileShare"}  featureMode={initFeatureMode}/>
                    <Icon feature={"liveChat"} featureMode={initFeatureMode}/>
               </>
    }else{
        icons = null
    }

    ///do he same thing for the middle div component
    let middle
    if(hasJoined){
        middle =  <Middle currentFeature={currentFeature} defaultMode={initDefaultMode} mode={mode}/>
    }else{
        middle = null
    }

    let fileShare
    if(peers.length === 1){
        fileShare = <FileShare peer={peers[0]} connectionMade={connectionMade}/>
    }


    return ( 
        <div>

                <div className="row" style={{justifyContent: "space-between", height: "100%", padding: 0}}>
                    <div className="features--tab">
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

                {/* {body}
            {downloadPrompt} */}
                {fileShare}
        </div>

     );
}
 
export default Room;