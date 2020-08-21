// //this will be the array of chunks
// let array = [];

// //reer to self with "self"
// //listen to the postMessage function fromm the main thread
// self.addEventListener("message", event=>{
//     if(event.data === "download"){ //this part runs when all chunks have been received, chunks no longer come in, the array is complete,and the file is ready to download
//         //now we turn the array of chuks back into a blob
//         const blob = new Blob(array);
//         //send the blob back to the main thread
//         self.postMessage(blob);
//         //make the array empty for the next download
//         array = [];
//     }else{////this part runs when the chunks are still coming in, so we push those chunks into the array 
//         array.push(event.data);
//     }

// }) 

let array = [];
self.addEventListener("message", event => {
    console.log(array);
    if (event.data === "download") {
        console.log(array, "when they download");
        const blob = new Blob(array);
        self.postMessage(blob);
        array = [];
    } else {
        array.push(event.data);
    }
})