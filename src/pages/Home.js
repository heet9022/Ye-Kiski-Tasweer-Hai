import React from 'react';

import styles from './styles/Home.css'
import DragAndDrop from '../components/DragAndDrop'
import ViewGrid from '../components/ViewGrid'
import {Container, Box, Button} from '@material-ui/core'

import update from 'immutability-helper';
import customAxios from '../others/customaxios';
import axios from 'axios';

import Upload from '../components/Upload'

class Home extends React.Component{

    constructor(props)
    {
      super(props)

      this.state = {
        files: [],
        submit:false,
        imagePreview: false,

      }

      this.handleDrop = this.handleDrop.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleDrop = (files) => {
      const newState = update(this.state,{
        files:{
          $push : Array.from(files),
          
        }
      })
      this.setState(newState,()=>{
        console.log(this.state);
      })

     if (this.state.files.length > 0)
     {
      this.setState({imagePreview:true});
     } 
     else 
     {
      this.setState({imagePreview:false});
     }
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
    
    this.setState({submit:true});
    }

    render(){
      var processedFiles = []

      for(var i=0;i<this.state.files.length;i++){
        processedFiles.push(Object.assign({},{image:URL.createObjectURL(this.state.files[i]),label:null,confidence:null}))
      }

      let upload = (this.state.imagePreview)?<ViewGrid files={processedFiles} submit={this.state.submit}></ViewGrid>:<div className="Status">Drag Files here</div>; 

      return(
        <div>
          
          <DragAndDrop handleDrop={this.handleDrop} >
            
            {/* <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr"}}>
              
              {
                this.state.files.length > 0 && this.state.files.map((file)=>{
                  return <img style={{height:"180px", width:"180px"}} src={URL.createObjectURL(file)} />
                })
              }
            </div> */}
            <Box style = {{background: '#efefef', display: 'flex', transition: 'all 250ms ease-in-out 0s', height: 'calc(80vh - 80px)', width: 'calc(80vw - 80px)', border: 'solid 40px transparent', position: 'relative', alignItems:'center', justifyContent: 'center'}}>
              {upload}
            
              <Button variant="contained" color="primary" onClick={()=>{console.log("Vah");this.handleSubmit()}}>
                Test
              </Button>
              
            </Box>  
          </DragAndDrop>  
           
      </div>
      )
    }

}
export default Home;
