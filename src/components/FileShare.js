import React, { useEffect, useRef, useState } from 'react';
import lottie from "lottie-web";
import animLoading from "../animations/loading.json";
import streamSaver from "streamsaver";

const worker = new Worker("../worker.js");

const FileShare = (props) => {
    const peer = props.peer,
          connectionMade = props.connectionMade,
          animContainerLoading = useRef(),
          animRefLoading = useRef(),
          downloadPrompt = useRef(),
          sendFilePrompt = useRef(),
          [file, setFile] = useState(),
          fileNameRef = useRef(""),
          [gotFile, setGotFile] = useState(false),
          fileSentRef = useRef();



        const handleIncomingData = (data)=> {
            if(data.toString().includes("done")){ ///if the data comes in as JSON and includes done
                setGotFile(true);
                const parsed = JSON.parse(data);
                fileNameRef.current = parsed.fileName

            }else{ //if its not done
                worker.postMessage(data) ///post the chunk to the worker
            }
         }

            
        const download = ()=> {
            setGotFile(false);
            worker.postMessage("download");

            // worker.addEventListener("message", event=>{
            //     //turn the blob back into a stream
            //     const stream = event.data.stream();
            //     const fileStream = streamSaver.createWriteStream(fileNameRef.current);
            //     stream.pipeTo(fileStream);
            // })

        }

        const dontDownload = ()=>{
            setGotFile(false);
        }
    
        const selectFile = (e)=> {
            // setFile(e.target.files[0]); 
            setFile(e.target.files[0]);
        }
    
        const sendFile = ()=> { //////////reading the data and sending it as chunks
            const stream = file.stream(); //convert the blob into a stream;
            const reader = stream.getReader(); //this reader will be able to read the stream;

            reader.read().then(obj=>{ //////////////running recursively
                handleReading(obj.done, obj.value)
            });

            const handleReading = (done,value) =>{ 
                if(done){ ////if the chunk is done being read, do this
                    peer.write(JSON.stringify({done: true, fileName: file.name})) ///send the other peer json telling them the file name and that it's done done.
                    return;
                }

                peer.write(value); /////////if the chunk is not yet done being read send the current chunk that is returned from the promise
                reader.read().then(obj=>{ /////////read the next chunk and send it again //////recursively
                     handleReading(obj.done, obj.value)
                })
            }

            fileSentRef.current.style.display = "block";
            setTimeout(()=>{
                fileSentRef.current.style.display = "none";
            }, 2000)
        }     



     useEffect(()=>{
        animRefLoading.current = lottie.loadAnimation({
            container: animContainerLoading.current,
            animationData: animLoading,
            loop: true,
        });
        peer.on("data", handleIncomingData); ///the callback will automatically receive data argument;
        //put the event listener here
        worker.addEventListener("message", event=>{
            //turn the blob back into a stream
            const stream = event.data.stream();
            const fileStream = streamSaver.createWriteStream(fileNameRef.current);
            stream.pipeTo(fileStream);
        })

        // return ()=>{
        //     worker.removeEventListener("message");
        // }
     }, []);



     useEffect(()=>{
        if(connectionMade){
          animContainerLoading.current.style.display = "none"
        }

        if(gotFile){
            downloadPrompt.current.style.display = "block"
         }else{
            downloadPrompt.current.style.display = "none"
         }

        if(file){
            sendFilePrompt.current.style.display = "block";
        }else{
            sendFilePrompt.current.style.display = "none";
        }
     })

    return ( 
        <div>
            <div className="loading" ref={animContainerLoading} style={{backgroundColor: "#1e1e1e"}}>
            </div>

            <div className="fileshare--container">
                <input onChange={selectFile} type="file" className="fileshare--input"/>
                <button onClick={sendFile} style={{display: "none"}} ref={sendFilePrompt} className="fileshare--button">Send file</button> 
                <p className="fileshare--message" style={{display: "none"}} ref={fileSentRef}>The file has been sent</p>
                {/* only let the button appear when there is a file available*/}
            </div>

            <div ref={downloadPrompt}>
                <span className="fileshare--message">Your peer sent you a File, would you like to download it?</span>
                <button onClick={download}  className="fileshare--button">Yes</button>
                <button onClick={dontDownload}  className="fileshare--button">No</button>

            </div>

        </div>
     );
}


 
export default FileShare