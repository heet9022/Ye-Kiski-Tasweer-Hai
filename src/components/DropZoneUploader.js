import React, {Component} from 'react'
import {DropzoneArea} from 'material-ui-dropzone'
 
class DropZoneUploader extends Component{
  constructor(props){
    super(props);
    this.state = {
      files: []
    };
  }
  handleChange(files){
    this.setState({
      files: files
    });
    console.log(this.state.files)
  }
  render(){
    return (
        <div style={{maxHeight:"80vh",overflowY:"scroll"}}>
            <DropzoneArea 
                onChange={this.handleChange.bind(this)}
                acceptedFiles={['image/*']}
                showPreviews={true}
                maxFileSize={5000000}
                filesLimit = {500}
                />
        </div>
    )  
  }
} 
 
export default DropZoneUploader;