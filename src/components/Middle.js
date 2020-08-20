import React, { useEffect } from 'react';
import LiveChat from './LiveChat';
import Cross from "../assets/cross.svg"

const Middle = (props) => {
    useEffect(()=>{
        console.log(props.currentFeature);
    })
    let width ,content, crossWidth;

    //content will be dependent on the current feature
    let currentComponent;
    switch(props.currentFeature){
        case "":
            currentComponent = null;
            break;
        case "liveChat":
            currentComponent = <LiveChat/>;
            break;
            default: 
            currentComponent = null;
    }
    switch(props.mode){
        case "default":
            width = 0;
            crossWidth = 0;
            content = null
            break;
        case "feature":
            width = "90%";
            crossWidth = "4rem"
            content = currentComponent
            break;    
    }
    return ( 
        <div style={{width: width}} className="middle">
            {/* <h1 onClick={
                props.defaultMode
            }>X</h1> */}
            <img src={Cross} alt="" style={{width: crossWidth}} className="middle--close" onClick={
                props.defaultMode
            }/>
            {content}
        </div>
     );
}
 
export default Middle;