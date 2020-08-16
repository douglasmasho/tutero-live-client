import React from 'react';
import {Route, Switch} from "react-router-dom";
import CreateRoom from "./components/CreateRoom";
import Room from "./components/Room";
import "./sass/main.scss";
import "./sass/styles.css";
import Controls from "./components/Controls"
import LiveChat from './components/LiveChat';

function App() {
  return (
    <div>
      <Switch>
        
        <Route exact path="/" render={({history})=>(
        <div>
            <CreateRoom history={history}/>  
            <LiveChat/>
            {/* Lorem ipsum dolor sit amet consectetur adipisicing elit. Explicabo, aliquam cum voluptatibus sint quos necessitatibus fuga praesentium natus sed blanditiis accusamus, tenetur impedit laudantium aspernatur dolorem obcaecati, accusantium totam reprehenderit! */}
        </div>
        )}/>

        <Route exact path="/room/:roomID" render={(routeArgs)=>(
          <Room routeArgs={routeArgs}/>
        )}/>

      </Switch>
    </div>

  );
}

export default App;
