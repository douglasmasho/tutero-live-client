import React, {useState, useRef, useEffect} from 'react';
import lottie from "lottie-web";
import animExpand from "../animations/expand.json";
import animSend from "../animations/send.json";



const LiveChat = (props) => {
    const animContainerExpand = useRef();
    const animRefExpand = useRef();
    const animContainerSend = useRef();
    const animRefSend = useRef();
    const chatContainer = useRef();
    const [isExpanded, setIsExpanded] = useState(false);


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

        
        const textarea = document.querySelector(".chat--input"); 
           textarea.addEventListener('input', autoResize, false); 

         function autoResize() { 
         this.style.height = 'auto'; 
         this.style.height = this.scrollHeight + 'px'; 
      } 
    }, [])

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
        animRefSend.current.playSegments([0,31], true);
        setTimeout(()=>{
            animRefSend.current.goToAndStop(0, true);
        }, 1500)
    }


    useEffect(()=>{
        console.log("this mounted");
        //run code once ///getting the peers etc
    },[])
    return ( 
        //conditionally render only if there is a peer
        

            <div style={{width: "21%", height: "110vh", position: "relative"}} className="left-side">
                <div className="chat--container" ref={chatContainer}>
                    <h3 className="chat--header u-margin-bottom">LiveChat</h3>
                    <div ref={animContainerExpand} className="chat--expandIcon" onClick={()=>{
                        if(isExpanded){
                            closeChat()
                        }else{
                            expandChat();
                        }
                    }}>
                    </div>

                    <div className="chat--messagesContainer">
                            {/* map through the messages here , forEach render message depending on the sender*/}
                            <div className="message message__peer u-margin-bottom">
                                <p className="message--userName normal-text u-margin-bottom-small bold-text">{"userName"}</p>
                                <p className="normal-text message--text">Lorem ipsum dolor sit amet consectetur adiendis.</p> 
                            </div>

                         
                            <div style={{display: "flex", justifyContent: "flex-end"}}>
                                <div className="message message__mine u-margin-bottom">
                                    <p className="message--userName normal-text u-margin-bottom-small bold-text">{"userName"}</p>
                                    <p className="normal-text message--text">Lorem im, quas. harum possimus sequi aut sapiente magnam doloremque commodi reiciendis.</p> 
                                </div>
                            </div>                            
                    </div>

                    <div className="chat--typing">{"username"} is typing....</div>

                    <div className="chat--bottom">
                        <textarea className="chat--input" placeholder="type your message"></textarea>
                        <div ref={animContainerSend} class="chat--send" onClick={sendMessage}></div>
                    </div>

                
                
                </div>
            </div>
   
     );
}
 
export default React.memo(LiveChat);
