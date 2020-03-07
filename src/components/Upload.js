import React from 'react';

import styles from './styles/Upload.module.css'
import DragAndDrop from '../components/DragAndDrop'

import {Container, Box, Button} from '@material-ui/core'

import update from 'immutability-helper';
import customAxios from '../others/customaxios';
import axios from 'axios';


class Upload extends React.Component{

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
        <div className={styles.Upload}>
            <DragAndDrop handleDrop={this.handleDrop}>
                <div className={DragAndDrop}>
                    <div className="Status">Drag Files here</div>
                </div>
            </DragAndDrop>
      </div>
      )
    }

}
export default Upload;
