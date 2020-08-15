import React from 'react';
import {Route, Switch} from "react-router-dom";
import CreateRoom from "./components/CreateRoom";
import Room from "./components/Room";
import "./sass/main.scss";
import "./sass/styles.css";
import Controls from "./components/Controls"

function App() {
  return (
    <div>
      <Switch>
        
        <Route exact path="/" render={({history})=>(
        <div>
            <CreateRoom history={history}/>  
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
