import React from 'react';
import {Route, Switch} from "react-router-dom";
import CreateRoom from "./components/CreateRoom";
import Room from "./components/Room"

function App() {
  return (
    <div>
      <Switch>
        
        <Route exact path="/" render={({history})=>(
        <CreateRoom history={history}/>
        )}/>

        <Route exact path="/room/:roomID" render={(routeArgs)=>(
          <Room routeArgs={routeArgs}/>
        )}/>

      </Switch>
    </div>

  );
}

export default App;
