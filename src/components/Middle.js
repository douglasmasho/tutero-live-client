import React, { useEffect } from 'react';
import LiveChat from './LiveChat';
import Cross from "../assets/cross.svg"

const Middle = (props) => {
    useEffect(()=>{
        console.log(props.currentFeature);
    })

    let width, opacity ,content, crossWidth, title;
    //content will be dependent on the current feature
    let currentComponent;
    switch(props.currentFeature){
        case "":
            currentComponent = null;
            title = null;
            break;
        case "liveChat":
            currentComponent = <LiveChat/>;
            title = "LiveChat"
            break;
            default: 
            currentComponent = null;
    }
    switch(props.mode){
        case "default":
            width = 0;
            opacity = 0;
            crossWidth = 0;
            content = null
            break;
        case "feature":
            width = "90%";
            opacity = 1;
            crossWidth = "4rem"
            content = currentComponent
            break;    
    }
    return ( 
        <div style={{width, opacity}} className="middle">
            {/* <h1 onClick={
                props.defaultMode
            }>X</h1> */}
            <div className="middle--header">
                    <h3 className={"chat--header"}>{title}</h3>
                    
                    <img src={Cross} alt="" style={{width: crossWidth}} className="middle--close" onClick={
                        props.defaultMode
                    }/>
            </div>

            {content}
        </div>
     );
}
 
export default Middle;