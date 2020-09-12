import React from 'react';
import {v4 as uuidv4} from "uuid";

const CreateRoom = (props) => {
    const {history} = props;
    
    const createRoom = ()=>{
        const roomID = uuidv4();
        history.push(`room/${roomID}`)
    }
    return ( 
        <div class="golive center-hrz--col">
            <button onClick={createRoom} className="button u-margin-bottom">Go live</button>
            <div style={{backgroundColor: "white", width: "80%", padding: "2rem"}} className="normal-text">
                <h3 className="u-margin-bottom">How to use tutero-live</h3>
                <ul>
                    <li>Step 1: Press The "Go live" button</li>
                    <li>Step 2: When the loading icon shows, copy the current browser link and open it on another browser tab, or give it to a friend to open it using another machine's browser</li>
                    <li>Step 3: Once the other tab or your friend's machine opens the link, the online meeting/session will begin</li>
                </ul>
            </div>

        </div>
     );
}
 
export default CreateRoom;