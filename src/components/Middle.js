import React, { useEffect, useRef } from 'react';
import LiveChat from './LiveChat';
import Cross from "../assets/cross.svg";
import FileShare from "./FileShare";

const Middle = (props) => {
    const fileShareRef = useRef();

    const removeCurrentFeature = ()=>{
        if(document.querySelector(".features__visible")){
            document.querySelector(".features__visible").classList.remove("features__visible");
        }
    }


    useEffect(()=>{
        console.log(props.currentFeature);
    })

    let width, opacity ,content, crossWidth, title;
    //content will be dependent on the current feature
    let currentComponent;
    switch(props.currentFeature){ ///////////read currentFeature to determine what must be displayed in  the middleDiv
        case "":
                currentComponent = null;
                title = null;
                removeCurrentFeature();
            break;
        case "liveChat":
                currentComponent = <LiveChat/>;
                title = "Live Chat";
                removeCurrentFeature();
            break;
        case "fileShare":
                title = "File Share";
                //removethe visible class from any currently visible feature
                removeCurrentFeature();
                //add the active class to this feature
                fileShareRef.current.classList.add("features__visible");  
            break;

            default:
                currentComponent = null;
                removeCurrentFeature();   
                break; 
    }
    switch(props.mode){
        case "default":
            width = 0;
            opacity = 0;
            crossWidth = 0;
            content = null
            break;
        case "feature":
            width = "70%";
            opacity = 1;
            crossWidth = "4rem"
            content = currentComponent
            break;    
    }

    let fileShare
    if(props.peers.length === 1){
        fileShare = <FileShare peer={props.peers[0]} connectionMade={props.connectionMade}/>
    }else{
        fileShare = <h4 className="fileshare--connect">You can share files once a peer has connected</h4>
    }
    return ( 
        <div style={{width, opacity}} className="middle">
            <div className="middle--header">
                    <h3 className={"features--header"}>{title}</h3>
                    
                    <img src={Cross} alt="" style={{width: crossWidth}} className="middle--close" onClick={
                        props.defaultMode
                    }/>
            </div>
            {content}
            <div style={{display: "none"}} ref={fileShareRef}>
               {fileShare}
            </div>
        </div>
     );
}
 
export default Middle;