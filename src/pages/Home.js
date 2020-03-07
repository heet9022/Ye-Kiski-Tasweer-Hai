import React from 'react';

import styles from './styles/Home.module.css'
import DragAndDrop from '../components/DragAndDrop'
import ViewGrid from '../components/ViewGrid'
import {Container, Box, Button} from '@material-ui/core'

import update from 'immutability-helper';
import customAxios from '../others/customaxios';
import axios from 'axios';


class Home extends React.Component{

    constructor(props)
    {
      super(props)

      this.state = {
        files: [],
        responseID : []
      }

      this.handleDrop = this.handleDrop.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleDrop = (files) => {
      const newState = update(this.state,{
        files:{
          $push : Array.from(files)
        }
      })
      this.setState(newState,()=>{
        console.log(this.state);
      })
    }

    handleSubmit(e) {
      
      (
        async ()=>{
            try{
                var posts = [];
                
                for(var i=0; i<this.state.files.length; i++){
                    const file = this.state.files[i]
                    const signedResponse = await customAxios.get('post/upload', {params:{filename:file.name}})
                    if(signedResponse.data){
                        var formData = new FormData();
                        for(var key in signedResponse.data.fields){
                            formData.set(key,signedResponse.data.fields[key]);
                        }
                        formData.set("file", file);
                        await axios.post(signedResponse.data.url,formData)
                        posts.push(Object.assign({},{image:signedResponse.data.id}));  
                    }
                }
                await customAxios.post('post',{posts:posts});
      
            }catch(e){
                console.log(e);
                console.log("Something Went Wrong");
            }
        }
    )();
      
    }

    render(){

      return(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr"}}>
            
            {
              this.state.files.length > 0 && this.state.files.map((file)=>{
                return <img style={{height:"250px", width:"250px"}} src={URL.createObjectURL(file)} />
              })
            }
            </div>
          <DragAndDrop handleDrop={this.handleDrop}>
            <Box style = {{height: '100vh', width: '100vw', border: '1px solid black'}}>
              <Button variant="contained" color="primary" onClick={()=>{console.log("Vah");this.handleSubmit()}}>
                Test
              </Button>
            </Box>  
          </DragAndDrop> 
          <ViewGrid></ViewGrid>
      </div>
      )
    }

}
export default Home;
