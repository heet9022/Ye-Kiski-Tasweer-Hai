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
        posts:[],
        submit:false,
        imagePreview:false

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
      this.setState(newState)

      this.state.files.length>0?this.setState({imagePreview:true}):this.setState({imagePreview:false})

      
    }

    updatePlease() {
      var processedFiles = []
      for(var i=0;i<this.state.files.length;i++){
        processedFiles.push(Object.assign({},{image:URL.createObjectURL(this.state.files[i]),label:null,confidence:null}))
      }
      const newState2 = update(this.state,{
        posts:{
          $push : Array.from(processedFiles),
        }
      })
      this.setState(newState2)
      console.log(this.state.posts)
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
                const pids = await customAxios.post('post',{posts:posts});
                console.log(pids)

                const processedPosts = await customAxios.post('model/test',{pids:pids})

                this.setState({posts:processedPosts,submit:true});


            }catch(e){
                console.log(e);
                console.log("Something Went Wrong");
            }
        }
    )();
    
    
    }

    render(){
      

      // var upload = null;

      // if(!this.state.submit){
      //   if(this.state.imagePreview){
        
      //     upload = <ViewGrid posts={processedFiles} submit={this.state.submit}></ViewGrid>
      //   }else{
      //     upload = <div>Drag Files Here</div>
      //   }
      // }else{
      //   if(this.state.posts.length>0){
      //     upload = <ViewGrid posts={this.state.posts} submit={this.state.submit}></ViewGrid>  
      //   }else{
      //     upload = "h1"
      //   }
      // }

      // console.log(upload)
      this.updatePlease()

      let upload = (this.state.imagePreview)?(<ViewGrid posts={this.state.posts} submit={this.state.submit}/>):(<div>Drag Files Here</div>);

      return(
        <div style={{display:"flex",justifyContent:"center",flexDirection:"column"}}>
          
          <DragAndDrop handleDrop={this.handleDrop} >
            
            {/* <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr"}}>
              
              {
                this.state.files.length > 0 && this.state.files.map((file)=>{
                  return <img style={{height:"180px", width:"180px"}} src={URL.createObjectURL(file)} />
                })
              }
            </div> */}
            <div style={{background:"#efefef",margin:"50px",textAlign:"center"}}>

              {upload}
              {/* {
                (!this.state.submit)?
                  (this.state.files>0)?
                    
                    (
                        
                      this.state.files.map((file)=>{
                        processedFiles.push(Object.assign({},{image:URL.createObjectURL(this.state.files[i]),label:null,confidence:null}))
                      })

                      (<ViewGrid posts={processedFiles} submit={this.state.submit}></ViewGrid>)
                    )
                  :
                    upload = <div>Drag Files Here</div>
                  
                :
                  (this.state.posts.length>0)?
                    <ViewGrid posts={this.state.posts} submit={this.state.submit}></ViewGrid>  
                  :
                    "h1"
                  
              } */}
            </div>
              
              
          </DragAndDrop>  
          <Button style={{display:"inline-block"}} variant="contained" color="primary" onClick={()=>{console.log("Vah");this.handleSubmit()}}>
                Test
          </Button>

      </div>
      )
    }

}
export default Home;
