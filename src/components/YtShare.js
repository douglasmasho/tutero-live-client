import React, {useRef, useEffect, useState} from 'react';
import Plus from "../assets/from xd/plus.svg";


///making use of the youtube player api
const YtShare = (props) => {
    const ytPlayer = useRef(),
        //   [videoLink, setVideoID] = useState(""),
           peer = props.peer,
           secondsInput = useRef(),
           minutesInput = useRef(),
           playlistInput = useRef(),
           videoInput = useRef(),
           positionInput = useRef(),
           plErrorRef = useRef(),
           vErrorRef = useRef(),
           loadModalRef = useRef(),
           API_KEY = "AIzaSyDxDypFD7OMDH4-lPrs--alG88QJd6HXs4",
           loadPlayerbtn = useRef();


    useEffect(()=>{
        const tag = document.createElement("script"); ///create a new script tag
        tag.src = "https://www.youtube.com/iframe_api";
        //find the first script tag
        const firstScript = document.getElementsByTagName("script")[0];
        //place the ytScript on top of the first script tag
        firstScript.parentNode.insertBefore(tag,firstScript)
        //assign a callback function when the api is ready
        window.onYouTubeIframeAPIReady = loadYTVideoPlayer
        //set up listeners for incoming data
        peer.on("data", handleIncomingData);
    }, [])
    

    useEffect(()=>{
        if(!document.querySelector("iframe")){
            loadPlayerbtn.current.style.display = "block";
            // console.log("iuiuhiu")
        }else {
            loadPlayerbtn.current.style.display = "none";
        }
        console.log(document.querySelector("iframe"))
    })

    const handleIncomingData = (data)=>{
        const obj = JSON.parse(data);
        switch(obj.type){
            case "play":
                ytPlayer.current.playVideo();
                break;
            case "pause":
                ytPlayer.current.pauseVideo();
                break;
            case "video":
                ytPlayer.current.loadVideoById(obj.data);  
                ytPlayer.current.playVideo();
                break;
            case "goTo":
                ytPlayer.current.seekTo(obj.time, true);
                break;
            case "playlist":
                ytPlayer.current.loadPlaylist(obj.string);
                ytPlayer.current.playVideo();
                break;
            case "next":
                 ytPlayer.current.nextVideo();  
                break; 
            case "previous":
                 ytPlayer.current.previousVideo();
                 break;
            case "stopSession":
                props.setIsytShareOn(false);
                break;     
            case "position":
                ytPlayer.current.playVideoAt(obj.index);  
            // default: null;
        }
    }

    const loadYTVideoPlayer = ()=>{
        loadPlayerbtn.current.style.display = "none";
        //create a new player object
        const player = new window.YT.Player("player", { //first arg ==> id of the div you want ot containt the video
           ///second arg: options which include dimensions
            height: "390",
            width: "640"
        });
        //reference the ytPlayer for future use
        ytPlayer.current = player;
    }

    const stopVideo = ()=>{    
        //call the peer to pause their video
        peer.send(JSON.stringify({type: "pause"}));
        //pause the video
        ytPlayer.current.pauseVideo();
    }

    
    const playVideo = ()=>{    
        //call the peer to play their video
        peer.send(JSON.stringify({type: "play"}))
        //play the video
        ytPlayer.current.playVideo();
    }

    const loadVideo = (e)=>{
        e.preventDefault();
        const videoLink = videoInput.current.value;

        function loadVid(videoID){
           peer.send(JSON.stringify({type: "video", data: videoID}));
            //load the video on the ytPlayer object with the current videoLink
            ytPlayer.current.loadVideoById(videoID); 
        }

        let videoID, index;
        if(videoLink.includes("youtube.com")){
            vErrorRef.current.style.display = "none";
            if(videoLink.includes("/v/")){
                // videoID = videoLink.split("/")[4].slice(0,11);
                index = videoLink.split("/").indexOf("v");
                videoID = videoLink.split("/")[index + 1].slice(0,11)
                loadVid(videoID);
            }else if(videoLink.includes("/embed/")){
                index = videoLink.split("/").indexOf("embed");
                videoID = videoLink.split("/")[index + 1].slice(0,11)
                loadVid(videoID);
            }else{
                videoID = videoLink.split("=")[1].slice(0,11);
                loadVid(videoID);
            }
        }else if(videoLink.includes("youtu.be")){
            vErrorRef.current.style.display = "none";
            index = videoLink.split("/").indexOf("youtu.be");
            videoID = videoLink.split("/")[index + 1].slice(0,11)
            loadVid(videoID);
        }else{
            vErrorRef.current.style.display = "block";
        }
    }

    const goToTime = (event)=>{
        event.preventDefault();
       const seconds = parseInt(secondsInput.current.value);
       const minutes = parseInt(minutesInput.current.value);
       const minutesToSeconds = minutes * 60;
       const timeStamp = seconds + minutesToSeconds;
       //send instructions to peer
       peer.send(JSON.stringify({type: "goTo", time: timeStamp}))
       //move to the time
       ytPlayer.current.seekTo(timeStamp, true);
    }

    const loadPlaylist = (event)=>{
        event.preventDefault();
        const playlistLink = playlistInput.current.value;
        // ytPlayer.current.loadPlaylist(playlistLink, 0,0);
        //create a link array
        const linkArr = playlistLink.split("=");
        //get the element in th elink that resembles a playlistID
        const playlistID = linkArr.find(str=> str.startsWith("PL"));
        //fetch 
        if(playlistID){
            plErrorRef.current.style.display = "none"
            fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistID}&key=${API_KEY}`).then(dataJson=>{
                return dataJson.json()
            }).then(data=>{
                //loop through items and retreive each item.snippet.resourceId.videoId
                let videosArr = []; 
                data.items.forEach(item=>{
                    videosArr.push(item.snippet.resourceId.videoId)
                })
                const videosString = videosArr.join(",");
                //send instruction to the peer
                 peer.send(JSON.stringify({type: "playlist", string: videosString}));
                //load playlist with this string
                ytPlayer.current.loadPlaylist(videosString, 0,0);
            })
        }else{
            plErrorRef.current.style.display = "block"
        }

    }

    //playlis controls
    const nextVideo = ()=>{
        peer.send(JSON.stringify({type: "next"}))
        ytPlayer.current.nextVideo();
    }

    const previousVideo = ()=>{
        peer.send(JSON.stringify({type: "previous"}))
        ytPlayer.current.previousVideo();
    }

    const getVideo = ()=>{
        const url = ytPlayer.current.getVideoUrl();
        alert(url)//instead of an alert, open a modal with an anchor tag of the link
    }
    const goToPlaylistVideo = (event)=>{
        event.preventDefault();
        const index = parseInt(positionInput.current.value) - 1;
        console.log(index);
        peer.send(JSON.stringify({type: "position", index}))
        ytPlayer.current.playVideoAt(index);
    }

    const stopSession = ()=>{
        props.setIsytShareOn(false);
        //send message to peer so they can also stop their session
        peer.send(JSON.stringify({type: "stopSession"}))
    }


    return ( 
        <div>  


           <div className="center-hrz u-margin-top" style={{position: "relative"}}>
               <div>
               <div id="player"/>
               </div>
              <button onClick={loadYTVideoPlayer} ref={loadPlayerbtn} style={{display: "none"}}>Show yt player</button>
              <button className="button__add"><img src={Plus} alt=""/></button>
           </div>

           <div className="modal " ref={loadModalRef}>
               <form onSubmit={loadVideo}>
                    <input type="text" placeholder="video link" ref={videoInput} required/>
                    <button type="submit">Load Video</button>
                    <p style={{color: "red", display: "none"}} ref={vErrorRef}>That is not a valid video link</p>
               </form>


                    <form onSubmit={loadPlaylist}>
                        <input type="text" placeholder="playlist link" ref={playlistInput} required/>
                        <button type="submit">Load playlist</button>
                        <p style={{color: "red", display: "none"}} ref={plErrorRef}>That is not a valid playlist link</p>
                    </form>
           </div>
           <div className="overlay"></div>

            <button onClick={stopVideo}>Stop Video</button>
            <button onClick={playVideo}>Play Video</button>
            <button onClick={getVideo}>Get current video link</button>

            <form onSubmit={goToTime}>
                <input type="number" required placeholder="minutes" ref={minutesInput} min="0"/>
                <input type="number" required placeholder="seconds" ref={secondsInput} max="59" min="0"/>
                <button type="submit">Go to Timestamp</button>
            </form>

                {/*this div must only appear when we go into playlist mode*/}
                <h2>Playlist controls</h2>

                <button onClick={nextVideo}>Next video</button>
                <button onClick={previousVideo}>Previous Video</button>

                <form onSubmit={goToPlaylistVideo}>
                    <h3>Play video at playlist position</h3>
                    <input type="number" placeholder="position" ref={positionInput}/>
                    <button type="submit">go to video</button>
                </form>

                <button onClick={stopSession}>Stop session</button>
            
        </div>
     );
}
 
export default YtShare;