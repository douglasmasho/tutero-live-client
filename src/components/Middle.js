import React, { useEffect } from 'react';

const Middle = (props) => {
    useEffect(()=>{
        console.log(props.currentFeature);
    })
    let width ,content;

    //content will be dependent on the current feature
    switch(props.mode){
        case "default":
            width = 0;
            content = null
            break;
        case "feature":
            width = "90%";
            content = <h1 onClick={
                props.defaultMode
            }>X</h1>
            break;    
    }
    return ( 
        <div style={{backgroundColor: "white", width: width, transition: "all .3s"}}>
            {content}
        </div>
     );
}
 
export default Middle;