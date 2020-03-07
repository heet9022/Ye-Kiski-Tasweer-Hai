import React from 'react';

import styles from './styles/Home.css'
import DragAndDrop from '../components/DragAndDrop'
import ViewGrid from '../components/ViewGrid'
import {Container, Box, Button} from '@material-ui/core'

import update from 'immutability-helper';
import customAxios from '../others/customaxios';
import axios from 'axios';

import Upload from '../components/Upload'


function PostCard(props){

  return (
    <div onClick={()=>{props.handlePostSelect(props.position)}} style={props.post.selected?{background:"green"}:{}}>
      
      <img style={{width:"100%",height:"100%",maxHeight:"25vw",maxHeight:"20vh"}} src={props.post.image}/>
      {
        props.post.label && <h4>Label : {props.post.label}</h4>
      }
      {
        props.post.confidence && <h4>Confidence : {props.post.confidence}</h4>
      }
      
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
        submit:false,
        imagePreview:true,
        selected:0,
        selectedLabel : "buildings"

      }

      this.handleDrop = this.handleDrop.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
      this.handleLabelConvert = this.handleLabelConvert.bind(this);
      this.handlePostSelect = this.handlePostSelect.bind(this);
      this.handleSelectedLabelChange = this.handleSelectedLabelChange.bind(this);
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
                const pids = (await customAxios.post('post',{posts:posts})).data || [];
                console.log(pids)

                const processedPosts = (await customAxios.post('model/test',{pids:pids})).data || []

                this.setState({posts:processedPosts,submit:true});


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
        selectedLabel:"buildings",
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

    render(){
      

      // var upload = null;

      // if(!this.state.submit){
      //   if(this.state.imagePreview){
      //     var processedFiles = []

      //     for(var i=0;i<this.state.files.length;i++){
      //       processedFiles.push(Object.assign({},{image:URL.createObjectURL(this.state.files[i]),label:null,confidence:null}))
      //     }

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

      return(
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
          <div>
            {
              !this.state.submit && 
                <div> 
                  <input type="file" accept="image/*" multiple={true} onChange={this.handleDrop}/>
                </div>
            }
            
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gridGap:"50px",maxHeight:"60vh",overflowY:"scroll"}}>
              {
                !this.state.submit && this.state.files.length > 0 && this.state.files.map((file)=>{
                    return <PostCard post={{image:URL.createObjectURL(file),label:null,confidence:null}}/> 
                })
              }
            </div>
            {
              this.state.posts.length > 0 &&
                this.state.selected > 0 &&
                  <div>
                      <h4>Convert {this.state.selected} posts label to : </h4> 
                      <select onChange={this.handleSelectedLabelChange} defaultValue="buildings">
                        <option value="buildings">Buildings</option>
                        <option value="street">Street</option>
                        <option valie="glacier">Glacier</option>
                      </select>
                      <button onClick={this.handleLabelConvert}>Convert</button>
                  </div>
            }
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gridGap:"50px",maxHeight:"60vh",overflowY:"scroll"}}>
              {
                this.state.posts.length > 0 && this.state.posts.map((post,index)=>{
                    return <PostCard position={index} post={post} handlePostSelect={this.handlePostSelect}/> 
                })
              }
            </div>
          </div>  
          <Button style={{display:"inline-block"}} variant="contained" color="primary" onClick={()=>{console.log("Vah");this.handleSubmit()}}>
                Test
          </Button>

      </div>
      )
    }

}
export default Home;
