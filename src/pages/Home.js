import React from 'react';

import styles from './styles/Home.css'
import DragAndDrop from '../components/DragAndDrop'
import ViewGrid from '../components/ViewGrid'
import {Container, Box, Button, CircularProgress} from '@material-ui/core'

import update from 'immutability-helper';
import customAxios from '../others/customaxios';
import axios from 'axios';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle'

import Upload from '../components/Upload'

import {IconButton, Chip, Avatar} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {CameraAltOutlined, VideocamOutlined} from '@material-ui/icons';
import Paper from '@material-ui/core/Paper';
import {Card, CardActionArea , CardActions , CardContent , CardMedia , Typography, CardHeader } from '@material-ui/core';

import {DropzoneArea} from 'material-ui-dropzone'

import DropZoneUploader from './../components/DropZoneUploader'


import socketIOClient from 'socket.io-client'

function PostCard(props){

  return (
    // <div onClick={()=>{props.handlePostSelect(props.position)}} style={props.post.selected?{background:"green"}:{}}>
      
    //   <img style={{width:"100%",height:"100%",maxHeight:"25vw",maxHeight:"20vh"}} src={props.post.image}/>
    //   {
    //     props.post.label && <h4>Label : {props.post.label}</h4>
    //   }
    //   {
    //     props.post.confidence && <h4>Confidence : {props.post.confidence}</h4>
    //   }
      
    // </div>
      <div>
        <Card raised='false' style={{maxWidth:400}} onClick={()=>{props.handlePostSelect(props.position)}} style={props.post.selected?{border: "1px solid #4caf50"}:{}}>
        { props.post.label &&
        <CardHeader

          title = {
                props.post.label && <div>Label : {props.post.label}</div>
              }

          subheader = {
                props.post.confidence && <div>Confidence : {props.post.confidence}</div>
              }
            /> 
        }   
          <CardActionArea>
            <CardContent style={{padding:0}}>
              <div>
                <img style={{maxWidth:"100%",height:"auto"}} src={props.post.image}/>
              </div>
            </CardContent>
          </CardActionArea>
        {/* <CardActions>
          <Button size="small" color="primary">
            Share
          </Button>
          <Button size="small" color="primary">
            Learn More
          </Button>
        </CardActions> */}
      </Card>
    </div>
  )

}



class Home extends React.Component{

    constructor(props)
    {
      super(props)

      this.state = {
        files: [],
        posts:[],
        model:{},
        submit:false,
        imagePreview:true,
        selected:0,
        selectedLabel : "buildings",

        loading:false,
        showParameterDialog:false,
        home:true,
        loading_train:false
        


      }

      this.handleDrop = this.handleDrop.bind(this);

      this.handleTest = this.handleTest.bind(this);
      this.handleTrain = this.handleTrain.bind(this);
      this.handleLabelConvert = this.handleLabelConvert.bind(this);
      this.handlePostSelect = this.handlePostSelect.bind(this);
      this.handleSelectedLabelChange = this.handleSelectedLabelChange.bind(this);
      this.handleToggleParametersDialog = this.handleToggleParametersDialog.bind(this);
      this.handleParameterChange = this.handleParameterChange.bind(this);

    }

    componentDidMount(){
      const socket = socketIOClient("http://Yetasveerkiskihaiserver-env.eba-mfgmqh2i.ap-south-1.elasticbeanstalk.com");
      socket.on("tested",(data)=>{

        console.log("data returned")
        this.setState({posts:data.posts,submit:true,loading:false})
      })

      socket.on("trained",(data)=>{
        console.log("model trained")
        this.setState({showParameterDialog:false, loading_train:false})
        
      })
    }


    handleDrop = (e) => {
      const files = e.target.files;

      const newState = update(this.state,{
        files:{
          $push : Array.from(files),
          
        }
      })
      this.setState(newState)
    }

    handleTest(e) {
      
      ( 
        async ()=>{
            try{
                this.setState({loading:true})
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
                const pids = (await customAxios.post('post',{posts:posts})).data || [];
                console.log(pids)

                ((await customAxios.post('model/test',{pids:pids})).data || [])

                this.setState({loading:true,submit:false});


            }catch(e){
                console.log(e);
                console.log("Something Went Wrong");
            }
        }
    )();
    }

    handleTrain = ()=>{
      
      (

        async ()=>{
            try{
                this.setState({loading_train:true})
                const pids = (await customAxios.post('post/edit',{posts:this.state.posts})).data || [];

                const processedPosts = (await customAxios.post('model/train',{pids:pids,model:this.state.model})).data || []

                this.setState({showParameterDialog:true})

            }catch(e){
                console.log(e);
                console.log("Something Went Wrong");
            }
            
        }
    )();
    }

    handleSelectedLabelChange = (e)=>{
      const newState = update(this.state,{
        selectedLabel:{$set:e.target.value}
      })
      this.setState(newState);
    }
    
    handleLabelConvert = ()=>{
      const posts  = this.state.posts;

      var processedPosts = [];
      for(var i=0;i<posts.length;i++){
        
        if(posts[i].selected){
          processedPosts.push(Object.assign({},{pid:posts[i].pid,image:posts[i].image,label:this.state.selectedLabel,confidence:posts[i].confidence}))
        }else{
          processedPosts.push(Object.assign({},{pid:posts[i].pid,image:posts[i].image,label:posts[i].label,confidence:posts[i].confidence}))
        }
        
      }

      const newState = update(this.state,{
        posts:{
          $set : processedPosts
        },
        selectedLabel:{$set:"buildings"},
        selected:{$set:0}
      })

      this.setState(newState);

    }

    handlePostSelect = (position)=>{
      console.log(position)
      if(!this.state.posts[position].selected){
        const newState = update(this.state,{
          posts : {
            [position]:{
              selected : {$set: true }
            }
          },
          selected : {$set: this.state.selected + 1}
        })

        this.setState(newState);
      }else{
        const newState = update(this.state,{
          posts:{
            [position]:{
              selected:{$set:false}
            }
          },
          selected:{$set:this.state.selected - 1}
        })
        this.setState(newState);
      }
      
    }

    handleToggleParametersDialog = ()=>{
      if(!this.state.showParameterDialog){

        customAxios.get('model')
          .then((response)=>{
            const newState = update(this.state,{
              model:{$set:response.data},
              showParameterDialog:{$set:true}
            })
            this.setState(newState)
        
          })
          .catch((err)=>{

          })

          
      }else{
        this.setState({showParameterDialog:false})
      }
    }

    handleParameterChange = (e)=>{
      const newState =  update(this.state,{
        model:{
          [e.target.name]:{
            $set:e.target.value
          }
        }
      })

      this.setState(newState);
    }

    handleChange(files){
      this.setState({
        files: files
      });
      console.log(this.state.files)
    }

    handleHome(e)
    {
      this.setState(
        {
          // home:true,
          submit:false
        }
      )
    }

    render(){
      
      return(
        this.state.loading?<div style={{height:'100vh', width:'100vw', textAlign:'center'}}><CircularProgress/></div>:

        <div style={{textAlign:'center'}}>
          
          {/* DROP AREA */}
          {
            
            !this.state.submit &&
            <div style={{maxHeight:"80vh", overflowY:"scroll"}}>
                <DropzoneArea 
                    onChange={this.handleChange.bind(this)}
                    acceptedFiles={['image/jpg', 'image/jpeg', 'image/png']}
                    // showPreviews={true}
                    maxFileSize={5000000}
                    filesLimit = {500}
                    showAlerts = {false}
                    />
            </div>
          } 


          {/* <div style={{display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
            
            {
              this.state.loading?<CircularProgress/>:
              
              }
              
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gridGap:"15px",maxHeight:"80vh",overflowY:"scroll"}}>
                {
                  !this.state.submit && this.state.files.length > 0 && this.state.files.map((file)=>{
                      return <PostCard post={{image:URL.createObjectURL(file),label:null,confidence:null}}/> 
                  })
                }
              </div> */}
              {
                this.state.posts.length > 0 &&
                  this.state.selected > 0 &&
                    <div>
                        <h4>Convert {this.state.selected} posts label to : </h4> 
                        <select onChange={this.handleSelectedLabelChange} defaultValue="buildings">
                          <option value="buildings">Buildings</option>
                          <option value="street">Street</option>
                          <option value="glacier">Glacier</option>
                          <option value="mountain">Mountain</option>
                          <option value="sea">Sea</option>
                          <option value="forest">Forest</option>
                        </select>
                        <button onClick={this.handleLabelConvert}>Convert</button>
                    </div>
              }
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gridGap:"15px",maxHeight:"80vh",overflowY:"scroll"}}>
                {
                  this.state.submit && this.state.posts.length > 0 && this.state.posts.map((post,index)=>{
                      return <PostCard position={index} post={post} handlePostSelect={this.handlePostSelect}/> 
                  })
                }
              </div>
            
              {

      
                <div>
                  <br/>
                  <Button size="small" style={{display:"inline-block"}} variant="contained" color="primary" onClick={()=>{this.handleTest()}}>
                    Test
                  </Button>
                </div>

              }
              {
                this.state.submit &&
                <div>
                  <Button size="small" style={{display:"inline-block"}} variant="contained" color="primary" onClick={()=>{this.handleToggleParametersDialog()}}>
                    Retrain
                  </Button>
                  {/* <Button size="small" style={{display:"inline-block"}} variant="contained" color="primary" onClick={()=>{this.handleHome()}}>
                    Home
                  </Button> */}
                </div>
              
              }
              <Dialog

                onClose = {()=>{this.setState({showParameterDialog:false})}}
                open={this.state.showParameterDialog}
                style={{padding:"50px"}}
              > 
                <DialogTitle>Change Model Parameters</DialogTitle>

                  Learning Rate : <input name="learning_rate" type="number" value={this.state.model.learning_rate} onChange={this.handleParameterChange}/>
                  Epochs : <input name="epochs" type="number" value={this.state.model.epochs} onChange={this.handleParameterChange}/>
                  Ratio of Validation to Dataset / SPLIT_PCT : <input name="split_pct" type="number" value={this.state.model.split_pct} onChange={this.handleParameterChange}/>

                  {this.state.loading_train?<div style={{textAlign:'center'}}><CircularProgress/></div>:<Button size="small" onClick={this.handleTrain}>Retrain</Button>}
                
              </Dialog>
  
        </div>
      )
    }
}
export default Home;




