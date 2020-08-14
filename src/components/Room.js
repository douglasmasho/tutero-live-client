import React, {useRef, useState, useEffect} from 'react';
import io from "socket.io-client";
import Video from "./Video";
import "../styles/styles.css";
import Peer from "simple-peer";
import Controls from "./Cotrols";



const Room = (props) => {
    const roomID = props.routeArgs.match.params.roomID;
    const [peers, setPeers] = useState([]);
    const videoRef = useRef();
    const peersRef = useRef([]);
    const socketRef = useRef();
    const controlsRef= useRef();
    const [stream, setStream] = useState();
    const otherVideo = useRef();
    const pauseVidBtn = useRef();
    const resumeVidBtn = useRef();
    // const [videoPP, setVideoPP] = useState("play");
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
        //init socket
        socketRef.current = io.connect("/");
        //get media stream 
        navigator.mediaDevices.getUserMedia({video: true, audio: true}).then(stream=>{
            setStream(stream);
            //put the stream in the ref
            //everything else is done here
            videoRef.current.srcObject = stream;
            //send a request to join the current room.
            socketRef.current.emit("join room", roomID);
              
            socketRef.current.on("room full", data=>{
                console.log(data);
            });

            socketRef.current.on("you joined", otherUsers=>{
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
                //ad peer to peer state 
                setPeers(peers=> [...peers, peer])
            })

            socketRef.current.on("recipient returned signal", data=>{
                //find the peer that corresponds with the caller
               const peerObj = peersRef.current.find(obj=>(
                    obj.peerID === data.recipientID
            ))
                const peer = peerObj.peer;
                peer.signal(data.signal);

                //add pausing controls
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
            //show the video controls
            controlsRef.current.style.display = "block";
        })
    },[]);


              
    const createPeer = (recipient, stream)=>{
        //create a peer
        const peer = new Peer({initiator: true, trickle: false, stream: stream});
        //when signal is ready, send one
        peer.on("signal", signal=>{
            socketRef.current.emit("sending signal", {recipient: recipient, signal: signal})
        });
        return peer;
    }

    const createRespPeer = (callerID, signal, stream)=>{
        //create a non-initiator peer
        const peer = new Peer({initiator:false, trickle:false, stream: stream});
        //set the RespPeer signal to the incoming signal
        peer.signal(signal)

        //respond to caller when signal is ready
        peer.on("signal", signal=>{
            socketRef.current.emit("returning signal", {signal: signal, callerID: callerID});
        })
        return peer;
    }

    return ( 
        <div>
            <div className="controls"  style={{display: "none"}}>

            </div>
            <div ref={controlsRef} style={{display: "none"}}>

                {/* <Controls pauseTrack={pauseTrack} resumeTrack={resumeTrack} controlsType="video"/> */}
                <Controls pauseTrack={pauseTrack} resumeTrack={resumeTrack} controlsType="audio"/>
                
            </div>

            <div id="container">
                <video muted autoPlay playsInline ref={videoRef} className="video"></video>
                {
                    peers.map((peer, index)=>{
                        return <Video key={index} peer={peer} ref={otherVideo}/>
                    })
                }
           </div>
            
        </div>

     );
}
 
export default Room;