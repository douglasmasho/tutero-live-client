import React from 'react';
import {v4 as uuidv4} from "uuid";

const CreateRoom = (props) => {
    const {history} = props;
    
    const createRoom = ()=>{
        const roomID = uuidv4();
        history.push(`room/${roomID}`)
    }
    return ( 
        <div>
            <button onClick={createRoom} className="button button__golive">Go live</button>
        </div>
     );
}
 
export default CreateRoom;