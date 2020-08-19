import React, {useState, useRef, useEffect, useContext} from 'react';
import lottie from "lottie-web";
import animExpand from "../animations/expand.json";
import animSend from "../animations/send.json";
import  {socketContext} from "../Context/socketContext";
import Messages from "./Messages";
import {v4 as uuidv4} from "uuid";



const LiveChat = (props) => {
    const animContainerExpand = useRef();
    const animRefExpand = useRef();
    const animContainerSend = useRef();
    const animRefSend = useRef();
    const chatContainer = useRef();
    const [isExpanded, setIsExpanded] = useState(false);
    const socket = useContext(socketContext);
    const textAreaRef = useRef();
    const [msgArray, setMsgArray] = useState([]);
    const msgCompRef = useRef();
    const typingRef = useRef();

    useEffect(()=>{
        animRefExpand.current = lottie.loadAnimation({
            container: animContainerExpand.current,
            animationData: animExpand,
            loop: false,
        });
        animRefExpand.current.goToAndStop(30, true);

        animRefSend.current = lottie.loadAnimation({
            container: animContainerSend.current,
            animationData: animSend,
            loop: false,
        });
         animRefSend.current.goToAndStop(0, true);
         
         textAreaRef.current.addEventListener('input', autoResize, false); 
         function autoResize() { 
         this.style.height = 'auto'; 
         this.style.height = this.scrollHeight + 'px'; 
      } 

        //get the messages array from the server after the Room component has put you into the room
        socket.emit("room messages", "");

      socket.on("room messages", data=>{
          console.log(data);
        setMsgArray(data);
      })
        socket.on("message", data=>{
            const msgObj = {
                msg: data.msg,
                //when auth is there, match the data.id with auth id/userName
                isMine: socket.id === data.id,
                //data.id is the auth id/userBame
                id: data.id,
                msgId: data.uuId
            }
            setMsgArray(state=>[...state, msgObj]);
            //scroll that thing down
            msgCompRef.current.scrollToBottom()
        })


        socket.on("typing", data=>{
            //show the typing div
            typingRef.current.style.opacity = "100%";
            typingRef.current.textContent = `${data} is typing...` 
        })

        socket.on("stopped typing", data=>{
             typingRef.current.style.opacity = 0;
        })

        socket.on("message deleted", data=>{
            const deletedMsgId = data;
            console.log(deletedMsgId)
            //filter out the state from messages that include the id sent back from the server
            setMsgArray(state=>(
                state.filter(obj=>(obj.msgId !== deletedMsgId))
            ));
        })

    
    }, []);

    const expandChat =()=>{
        animRefExpand.current.playSegments([60,90], true);
        setIsExpanded(true);
        chatContainer.current.classList.add("chat--container__expanded");
        
        // chatContainer.current.style.position = "absolute";
    }

    const closeChat = ()=>{
        animRefExpand.current.playSegments([15,40], true);
        setIsExpanded(false);
        chatContainer.current.classList.remove("chat--container__expanded");

    }

    const sendMessage = ()=>{
        //play animation
        animRefSend.current.playSegments([10,31], true);
        setTimeout(()=>{
            animRefSend.current.goToAndStop(0, true);
        }, 1400);
        //read the message
        const message = textAreaRef.current.value;
        //emit the message 
        socket.emit("message", message);
    }

    const typingMessage = ()=>{
        socket.emit("typing", "");   

        setTimeout(()=>{
            //send stopped Typing message
            stoppedTyping();
        }, 3000)
    }

    const stoppedTyping = ()=>{
        socket.emit("stopped typing", "");
    }

    const deleteMsg = (msgId)=>{
        socket.emit("message deleted", msgId);
        // console.log(msgId);
    }

    // const 

    return ( 
        //conditionally render only if there is a peer
           
                <div className="chat--container" ref={chatContainer}>
                    <h3 className="chat--header u-margin-bottom-small">LiveChat</h3>
                    <div ref={animContainerExpand} className="chat--expandIcon" onClick={()=>{
                        if(isExpanded){
                            closeChat();
                        }else{
                            expandChat();
                        }
                    }}>
                    </div>
                            <Messages msgArr={msgArray} ref={msgCompRef} deleteMsg={deleteMsg}/>
                            <div className="chat--typing" ref={typingRef}></div>


                        <div className="chat--bottom">
                            <textarea ref={textAreaRef} className="chat--input" placeholder="type your message" onKeyUp={typingMessage}></textarea>
                        <   div ref={animContainerSend} className="chat--send" onClick={sendMessage}></div>
                        </div>            
                </div>
     );
}
 
export default LiveChat;
