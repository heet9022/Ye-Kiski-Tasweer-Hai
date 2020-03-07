import React from 'react';

import {Paper,Tabs, Tab } from '@material-ui/core';


class Home extends React.Component{

    constructor(props)
    {
      super(props)

      this.state = {
      }

    }

    

    render(){

      return(
        <div>
          {/* <Paper square>
            <Tabs
                value={value}
                indicatorColor="primary"
                textColor="primary"
                onChange={handleChange}
                aria-label="disabled tabs example"
            >
                <Tab label="Active" />
                <Tab label="Disabled" disabled />
                <Tab label="Active" />
            </Tabs>
        </Paper> */}
      </div>
      )
    }

}
export default Home;
